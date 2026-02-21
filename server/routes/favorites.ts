import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, type AuthPayload } from '../middleware/auth';

const favorites = new Hono();

// Get user's favorites
favorites.get('/', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;

    const userFavorites = db.select()
      .from(schema.favorites)
      .where(eq(schema.favorites.userId, authPayload.userId))
      .orderBy(desc(schema.favorites.createdAt))
      .all();

    // Get the actual creations
    const creationIds = userFavorites.map(f => f.creationId);
    const favoriteCreations = [];

    for (const cid of creationIds) {
      const creation = db.select().from(schema.creations).where(eq(schema.creations.id, cid)).get();
      if (creation) {
        const agent = db.select().from(schema.agents).where(eq(schema.agents.id, creation.agentId)).get();
        favoriteCreations.push({
          ...creation,
          agentName: agent?.name || 'Unknown',
          tags: JSON.parse(creation.tags),
          timestamp: new Date(creation.createdAt),
        });
      }
    }

    return c.json({ favorites: favoriteCreations, ids: creationIds });
  } catch (error) {
    console.error('Get favorites error:', error);
    return c.json({ error: 'Failed to fetch favorites' }, 500);
  }
});

// Add to favorites
favorites.post('/:creationId', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const creationId = c.req.param('creationId');

    // Check if creation exists
    const creation = db.select().from(schema.creations).where(eq(schema.creations.id, creationId)).get();
    if (!creation) {
      return c.json({ error: 'Creation not found' }, 404);
    }

    // Check if already favorited
    const existing = db.select()
      .from(schema.favorites)
      .where(
        and(
          eq(schema.favorites.userId, authPayload.userId),
          eq(schema.favorites.creationId, creationId)
        )
      )
      .get();

    if (existing) {
      return c.json({ message: 'Already in favorites' });
    }

    const favoriteId = `fav-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    db.insert(schema.favorites).values({
      id: favoriteId,
      userId: authPayload.userId,
      creationId,
    }).run();

    return c.json({ message: 'Added to favorites', id: favoriteId }, 201);
  } catch (error) {
    console.error('Add favorite error:', error);
    return c.json({ error: 'Failed to add to favorites' }, 500);
  }
});

// Remove from favorites
favorites.delete('/:creationId', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const creationId = c.req.param('creationId');

    db.delete(schema.favorites)
      .where(
        and(
          eq(schema.favorites.userId, authPayload.userId),
          eq(schema.favorites.creationId, creationId)
        )
      )
      .run();

    return c.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return c.json({ error: 'Failed to remove from favorites' }, 500);
  }
});

// Get user's saved creations
favorites.get('/saved', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;

    const userSaved = db.select()
      .from(schema.savedCreations)
      .where(eq(schema.savedCreations.userId, authPayload.userId))
      .orderBy(desc(schema.savedCreations.createdAt))
      .all();

    // Get the actual creations
    const creationIds = userSaved.map(s => s.creationId);
    const savedCreationsData = [];

    for (const cid of creationIds) {
      const creation = db.select().from(schema.creations).where(eq(schema.creations.id, cid)).get();
      if (creation) {
        const agent = db.select().from(schema.agents).where(eq(schema.agents.id, creation.agentId)).get();
        savedCreationsData.push({
          ...creation,
          agentName: agent?.name || 'Unknown',
          tags: JSON.parse(creation.tags),
          timestamp: new Date(creation.createdAt),
        });
      }
    }

    return c.json({ saved: savedCreationsData, ids: creationIds });
  } catch (error) {
    console.error('Get saved error:', error);
    return c.json({ error: 'Failed to fetch saved creations' }, 500);
  }
});

// Save a creation
favorites.post('/saved/:creationId', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const creationId = c.req.param('creationId');

    // Check if creation exists
    const creation = db.select().from(schema.creations).where(eq(schema.creations.id, creationId)).get();
    if (!creation) {
      return c.json({ error: 'Creation not found' }, 404);
    }

    // Check if already saved
    const existing = db.select()
      .from(schema.savedCreations)
      .where(
        and(
          eq(schema.savedCreations.userId, authPayload.userId),
          eq(schema.savedCreations.creationId, creationId)
        )
      )
      .get();

    if (existing) {
      return c.json({ message: 'Already saved' });
    }

    const savedId = `saved-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    db.insert(schema.savedCreations).values({
      id: savedId,
      userId: authPayload.userId,
      creationId,
    }).run();

    return c.json({ message: 'Saved creation', id: savedId }, 201);
  } catch (error) {
    console.error('Save creation error:', error);
    return c.json({ error: 'Failed to save creation' }, 500);
  }
});

// Unsave a creation
favorites.delete('/saved/:creationId', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const creationId = c.req.param('creationId');

    db.delete(schema.savedCreations)
      .where(
        and(
          eq(schema.savedCreations.userId, authPayload.userId),
          eq(schema.savedCreations.creationId, creationId)
        )
      )
      .run();

    return c.json({ message: 'Removed from saved' });
  } catch (error) {
    console.error('Unsave creation error:', error);
    return c.json({ error: 'Failed to unsave creation' }, 500);
  }
});

export default favorites;
