import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, desc } from 'drizzle-orm';

const feed = new Hono();

// Get feed items
feed.get('/', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;

    const feedItems = db.select()
      .from(schema.feedItems)
      .orderBy(desc(schema.feedItems.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    // Get agent info for each feed item
    const formattedFeed = [];

    for (const item of feedItems) {
      const agent = db.select().from(schema.agents).where(eq(schema.agents.id, item.agentId)).get();

      formattedFeed.push({
        id: item.id,
        type: item.type,
        agentId: item.agentId,
        agentName: agent?.name || 'Unknown',
        agentAvatar: agent?.avatar || '',
        content: item.content,
        image: item.image,
        timestamp: new Date(item.createdAt),
      });
    }

    return c.json({ feed: formattedFeed });
  } catch (error) {
    console.error('Get feed error:', error);
    return c.json({ error: 'Failed to fetch feed' }, 500);
  }
});

// Get feed by type
feed.get('/type/:type', async (c) => {
  try {
    const type = c.req.param('type') as 'creation' | 'evolution' | 'milestone';
    const limit = Number(c.req.query('limit')) || 20;

    const feedItems = db.select()
      .from(schema.feedItems)
      .where(eq(schema.feedItems.type, type))
      .orderBy(desc(schema.feedItems.createdAt))
      .limit(limit)
      .all();

    // Get agent info
    const formattedFeed = [];

    for (const item of feedItems) {
      const agent = db.select().from(schema.agents).where(eq(schema.agents.id, item.agentId)).get();

      formattedFeed.push({
        id: item.id,
        type: item.type,
        agentId: item.agentId,
        agentName: agent?.name || 'Unknown',
        agentAvatar: agent?.avatar || '',
        content: item.content,
        image: item.image,
        timestamp: new Date(item.createdAt),
      });
    }

    return c.json({ feed: formattedFeed });
  } catch (error) {
    console.error('Get feed by type error:', error);
    return c.json({ error: 'Failed to fetch feed' }, 500);
  }
});

export default feed;
