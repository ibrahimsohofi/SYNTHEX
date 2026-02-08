import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, desc, and, sql } from 'drizzle-orm';
import { requireAuth, type AuthPayload } from '../middleware/auth';

const collections = new Hono();

// Get user's collections
collections.get('/', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;

    const userCollections = db.select()
      .from(schema.collections)
      .where(eq(schema.collections.userId, authPayload.userId))
      .orderBy(desc(schema.collections.updatedAt))
      .all();

    // Get item counts for each collection
    const formattedCollections = [];
    for (const collection of userCollections) {
      const itemsResult = db.select({ count: sql`count(*)` })
        .from(schema.collectionItems)
        .where(eq(schema.collectionItems.collectionId, collection.id))
        .get();
      const itemCount = Number(itemsResult?.count) || 0;

      // Get first 4 images for preview
      const previewItems = db.select({
        image: schema.creations.image,
      })
        .from(schema.collectionItems)
        .leftJoin(schema.creations, eq(schema.collectionItems.creationId, schema.creations.id))
        .where(eq(schema.collectionItems.collectionId, collection.id))
        .orderBy(schema.collectionItems.order)
        .limit(4)
        .all();

      formattedCollections.push({
        ...collection,
        itemCount,
        previewImages: previewItems.map(item => item.image).filter(Boolean),
      });
    }

    return c.json({ collections: formattedCollections });
  } catch (error) {
    console.error('Get collections error:', error);
    return c.json({ error: 'Failed to fetch collections' }, 500);
  }
});

// Get a single collection with items
collections.get('/:id', async (c) => {
  try {
    const collectionId = c.req.param('id');
    const authPayload = c.get('user') as AuthPayload | null;

    const collection = db.select()
      .from(schema.collections)
      .where(eq(schema.collections.id, collectionId))
      .get();

    if (!collection) {
      return c.json({ error: 'Collection not found' }, 404);
    }

    // Check access
    if (!collection.isPublic && collection.userId !== authPayload?.userId) {
      return c.json({ error: 'This collection is private' }, 403);
    }

    // Get collection items with creation data
    const items = db.select({
      id: schema.collectionItems.id,
      order: schema.collectionItems.order,
      createdAt: schema.collectionItems.createdAt,
      creation: schema.creations,
    })
      .from(schema.collectionItems)
      .leftJoin(schema.creations, eq(schema.collectionItems.creationId, schema.creations.id))
      .where(eq(schema.collectionItems.collectionId, collectionId))
      .orderBy(schema.collectionItems.order)
      .all();

    // Format items with agent info
    const formattedItems = [];
    for (const item of items) {
      if (item.creation) {
        const agent = db.select({ name: schema.agents.name })
          .from(schema.agents)
          .where(eq(schema.agents.id, item.creation.agentId))
          .get();

        formattedItems.push({
          id: item.id,
          order: item.order,
          creation: {
            ...item.creation,
            agentName: agent?.name || 'Unknown',
            tags: JSON.parse(item.creation.tags),
          },
        });
      }
    }

    // Get owner info
    const owner = db.select({
      id: schema.users.id,
      name: schema.users.name,
      avatar: schema.users.avatar,
    })
      .from(schema.users)
      .where(eq(schema.users.id, collection.userId))
      .get();

    return c.json({
      collection: {
        ...collection,
        itemCount: formattedItems.length,
        owner,
      },
      items: formattedItems,
    });
  } catch (error) {
    console.error('Get collection error:', error);
    return c.json({ error: 'Failed to fetch collection' }, 500);
  }
});

// Create a collection
collections.post('/', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const { name, description, isPublic } = await c.req.json();

    if (!name || name.trim().length === 0) {
      return c.json({ error: 'Collection name is required' }, 400);
    }

    if (name.length > 100) {
      return c.json({ error: 'Collection name is too long (max 100 characters)' }, 400);
    }

    const collectionId = `col-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    db.insert(schema.collections).values({
      id: collectionId,
      name: name.trim(),
      description: description?.trim() || null,
      userId: authPayload.userId,
      isPublic: isPublic !== false,
    }).run();

    const collection = db.select()
      .from(schema.collections)
      .where(eq(schema.collections.id, collectionId))
      .get();

    return c.json({ collection }, 201);
  } catch (error) {
    console.error('Create collection error:', error);
    return c.json({ error: 'Failed to create collection' }, 500);
  }
});

// Update a collection
collections.put('/:id', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const collectionId = c.req.param('id');
    const { name, description, isPublic, coverImage } = await c.req.json();

    const collection = db.select()
      .from(schema.collections)
      .where(eq(schema.collections.id, collectionId))
      .get();

    if (!collection) {
      return c.json({ error: 'Collection not found' }, 404);
    }

    if (collection.userId !== authPayload.userId) {
      return c.json({ error: 'You can only edit your own collections' }, 403);
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (coverImage !== undefined) updates.coverImage = coverImage;

    db.update(schema.collections)
      .set(updates)
      .where(eq(schema.collections.id, collectionId))
      .run();

    const updatedCollection = db.select()
      .from(schema.collections)
      .where(eq(schema.collections.id, collectionId))
      .get();

    return c.json({ collection: updatedCollection });
  } catch (error) {
    console.error('Update collection error:', error);
    return c.json({ error: 'Failed to update collection' }, 500);
  }
});

// Delete a collection
collections.delete('/:id', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const collectionId = c.req.param('id');

    const collection = db.select()
      .from(schema.collections)
      .where(eq(schema.collections.id, collectionId))
      .get();

    if (!collection) {
      return c.json({ error: 'Collection not found' }, 404);
    }

    if (collection.userId !== authPayload.userId) {
      return c.json({ error: 'You can only delete your own collections' }, 403);
    }

    // Delete all items in collection first
    db.delete(schema.collectionItems)
      .where(eq(schema.collectionItems.collectionId, collectionId))
      .run();

    // Delete collection
    db.delete(schema.collections)
      .where(eq(schema.collections.id, collectionId))
      .run();

    return c.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Delete collection error:', error);
    return c.json({ error: 'Failed to delete collection' }, 500);
  }
});

// Add item to collection
collections.post('/:id/items', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const collectionId = c.req.param('id');
    const { creationId } = await c.req.json();

    if (!creationId) {
      return c.json({ error: 'Creation ID is required' }, 400);
    }

    const collection = db.select()
      .from(schema.collections)
      .where(eq(schema.collections.id, collectionId))
      .get();

    if (!collection) {
      return c.json({ error: 'Collection not found' }, 404);
    }

    if (collection.userId !== authPayload.userId) {
      return c.json({ error: 'You can only add items to your own collections' }, 403);
    }

    // Verify creation exists
    const creation = db.select()
      .from(schema.creations)
      .where(eq(schema.creations.id, creationId))
      .get();

    if (!creation) {
      return c.json({ error: 'Creation not found' }, 404);
    }

    // Check if already in collection
    const existing = db.select()
      .from(schema.collectionItems)
      .where(
        and(
          eq(schema.collectionItems.collectionId, collectionId),
          eq(schema.collectionItems.creationId, creationId)
        )
      )
      .get();

    if (existing) {
      return c.json({ message: 'Item already in collection' });
    }

    // Get next order number
    const maxOrderResult = db.select({ max: sql`max(${schema.collectionItems.order})` })
      .from(schema.collectionItems)
      .where(eq(schema.collectionItems.collectionId, collectionId))
      .get();
    const nextOrder = (Number(maxOrderResult?.max) || 0) + 1;

    const itemId = `ci-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    db.insert(schema.collectionItems).values({
      id: itemId,
      collectionId,
      creationId,
      order: nextOrder,
    }).run();

    // Update collection's cover if not set
    if (!collection.coverImage) {
      db.update(schema.collections)
        .set({ coverImage: creation.image, updatedAt: new Date().toISOString() })
        .where(eq(schema.collections.id, collectionId))
        .run();
    }

    // Track activity
    db.insert(schema.activities).values({
      id: `act-${Date.now()}`,
      userId: authPayload.userId,
      type: 'save',
      targetType: 'collection',
      targetId: collectionId,
      metadata: JSON.stringify({ creationId }),
    }).run();

    return c.json({ message: 'Item added to collection', itemId }, 201);
  } catch (error) {
    console.error('Add item to collection error:', error);
    return c.json({ error: 'Failed to add item to collection' }, 500);
  }
});

// Remove item from collection
collections.delete('/:id/items/:itemId', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const collectionId = c.req.param('id');
    const itemId = c.req.param('itemId');

    const collection = db.select()
      .from(schema.collections)
      .where(eq(schema.collections.id, collectionId))
      .get();

    if (!collection) {
      return c.json({ error: 'Collection not found' }, 404);
    }

    if (collection.userId !== authPayload.userId) {
      return c.json({ error: 'You can only remove items from your own collections' }, 403);
    }

    db.delete(schema.collectionItems)
      .where(eq(schema.collectionItems.id, itemId))
      .run();

    return c.json({ message: 'Item removed from collection' });
  } catch (error) {
    console.error('Remove item from collection error:', error);
    return c.json({ error: 'Failed to remove item from collection' }, 500);
  }
});

// Reorder items in collection
collections.put('/:id/reorder', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const collectionId = c.req.param('id');
    const { itemIds } = await c.req.json();

    if (!Array.isArray(itemIds)) {
      return c.json({ error: 'itemIds must be an array' }, 400);
    }

    const collection = db.select()
      .from(schema.collections)
      .where(eq(schema.collections.id, collectionId))
      .get();

    if (!collection) {
      return c.json({ error: 'Collection not found' }, 404);
    }

    if (collection.userId !== authPayload.userId) {
      return c.json({ error: 'You can only reorder your own collections' }, 403);
    }

    // Update order for each item
    for (let i = 0; i < itemIds.length; i++) {
      db.update(schema.collectionItems)
        .set({ order: i })
        .where(eq(schema.collectionItems.id, itemIds[i]))
        .run();
    }

    return c.json({ message: 'Collection reordered successfully' });
  } catch (error) {
    console.error('Reorder collection error:', error);
    return c.json({ error: 'Failed to reorder collection' }, 500);
  }
});

export default collections;
