import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, type AuthPayload } from '../middleware/auth';

const apikeys = new Hono();

// Generate a secure random API key
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'sk_live_';
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Get all API keys for user
apikeys.get('/', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;

    const keys = db.select({
      id: schema.apiKeys.id,
      name: schema.apiKeys.name,
      key: schema.apiKeys.key,
      permissions: schema.apiKeys.permissions,
      lastUsedAt: schema.apiKeys.lastUsedAt,
      expiresAt: schema.apiKeys.expiresAt,
      isActive: schema.apiKeys.isActive,
      createdAt: schema.apiKeys.createdAt,
    })
      .from(schema.apiKeys)
      .where(eq(schema.apiKeys.userId, authPayload.userId))
      .orderBy(desc(schema.apiKeys.createdAt))
      .all();

    // Mask the keys (show only first 8 and last 4 chars)
    const maskedKeys = keys.map(key => ({
      ...key,
      key: `${key.key.substring(0, 12)}...${key.key.slice(-4)}`,
      permissions: JSON.parse(key.permissions),
    }));

    return c.json({ apiKeys: maskedKeys });
  } catch (error) {
    console.error('Get API keys error:', error);
    return c.json({ error: 'Failed to fetch API keys' }, 500);
  }
});

// Create a new API key
apikeys.post('/', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const { name, permissions, expiresInDays } = await c.req.json();

    if (!name || name.trim().length === 0) {
      return c.json({ error: 'API key name is required' }, 400);
    }

    // Check user's plan for key limits
    const user = db.select().from(schema.users).where(eq(schema.users.id, authPayload.userId)).get();

    const existingKeys = db.select()
      .from(schema.apiKeys)
      .where(
        and(
          eq(schema.apiKeys.userId, authPayload.userId),
          eq(schema.apiKeys.isActive, true)
        )
      )
      .all();

    const keyLimit = user?.plan === 'enterprise' ? 20 : user?.plan === 'pro' ? 10 : 3;

    if (existingKeys.length >= keyLimit) {
      return c.json({
        error: `You have reached the maximum number of API keys (${keyLimit}) for your plan`
      }, 400);
    }

    const apiKeyId = `apikey-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const key = generateApiKey();

    // Calculate expiration date
    let expiresAt = null;
    if (expiresInDays && expiresInDays > 0) {
      const date = new Date();
      date.setDate(date.getDate() + expiresInDays);
      expiresAt = date.toISOString();
    }

    const defaultPermissions = permissions || ['read:creations', 'read:agents'];

    db.insert(schema.apiKeys).values({
      id: apiKeyId,
      userId: authPayload.userId,
      name: name.trim(),
      key,
      permissions: JSON.stringify(defaultPermissions),
      expiresAt,
      isActive: true,
    }).run();

    // Return the full key only on creation
    return c.json({
      apiKey: {
        id: apiKeyId,
        name: name.trim(),
        key, // Full key visible only on creation
        permissions: defaultPermissions,
        expiresAt,
        isActive: true,
      },
      message: 'API key created. Please save this key - it will not be shown again.',
    }, 201);
  } catch (error) {
    console.error('Create API key error:', error);
    return c.json({ error: 'Failed to create API key' }, 500);
  }
});

// Revoke/Delete an API key
apikeys.delete('/:id', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const keyId = c.req.param('id');

    const key = db.select()
      .from(schema.apiKeys)
      .where(eq(schema.apiKeys.id, keyId))
      .get();

    if (!key) {
      return c.json({ error: 'API key not found' }, 404);
    }

    if (key.userId !== authPayload.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    db.delete(schema.apiKeys)
      .where(eq(schema.apiKeys.id, keyId))
      .run();

    return c.json({ message: 'API key revoked successfully' });
  } catch (error) {
    console.error('Delete API key error:', error);
    return c.json({ error: 'Failed to revoke API key' }, 500);
  }
});

// Regenerate an API key
apikeys.post('/:id/regenerate', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const keyId = c.req.param('id');

    const key = db.select()
      .from(schema.apiKeys)
      .where(eq(schema.apiKeys.id, keyId))
      .get();

    if (!key) {
      return c.json({ error: 'API key not found' }, 404);
    }

    if (key.userId !== authPayload.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const newKey = generateApiKey();

    db.update(schema.apiKeys)
      .set({ key: newKey })
      .where(eq(schema.apiKeys.id, keyId))
      .run();

    return c.json({
      key: newKey,
      message: 'API key regenerated. Please save this key - it will not be shown again.',
    });
  } catch (error) {
    console.error('Regenerate API key error:', error);
    return c.json({ error: 'Failed to regenerate API key' }, 500);
  }
});

// Toggle API key active status
apikeys.patch('/:id/toggle', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const keyId = c.req.param('id');

    const key = db.select()
      .from(schema.apiKeys)
      .where(eq(schema.apiKeys.id, keyId))
      .get();

    if (!key) {
      return c.json({ error: 'API key not found' }, 404);
    }

    if (key.userId !== authPayload.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    db.update(schema.apiKeys)
      .set({ isActive: !key.isActive })
      .where(eq(schema.apiKeys.id, keyId))
      .run();

    return c.json({
      isActive: !key.isActive,
      message: key.isActive ? 'API key deactivated' : 'API key activated'
    });
  } catch (error) {
    console.error('Toggle API key error:', error);
    return c.json({ error: 'Failed to toggle API key' }, 500);
  }
});

export default apikeys;
