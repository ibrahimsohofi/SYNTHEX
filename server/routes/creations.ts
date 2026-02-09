import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, desc, sql, like, or, and } from 'drizzle-orm';
import { requireAuth, type AuthPayload } from '../middleware/auth';

const creations = new Hono();

// Get all creations with pagination and filters
creations.get('/', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;
    const agentId = c.req.query('agent');
    const search = c.req.query('search');
    const style = c.req.query('style');

    let query = db.select().from(schema.creations);

    // Build WHERE conditions
    const conditions = [];

    if (agentId) {
      conditions.push(eq(schema.creations.agentId, agentId));
    }

    if (style) {
      conditions.push(eq(schema.creations.style, style));
    }

    if (search) {
      conditions.push(
        or(
          like(schema.creations.title, `%${search}%`),
          like(schema.creations.tags, `%${search}%`)
        )
      );
    }

    let results;
    if (conditions.length > 0) {
      results = db.select()
        .from(schema.creations)
        .where(and(...conditions))
        .orderBy(desc(schema.creations.createdAt))
        .limit(limit)
        .offset(offset)
        .all();
    } else {
      results = db.select()
        .from(schema.creations)
        .orderBy(desc(schema.creations.createdAt))
        .limit(limit)
        .offset(offset)
        .all();
    }

    // Get agent names for all creations
    const agentIds = [...new Set(results.map(c => c.agentId))];
    const agentsMap = new Map();

    for (const aid of agentIds) {
      const agent = db.select().from(schema.agents).where(eq(schema.agents.id, aid)).get();
      if (agent) {
        agentsMap.set(aid, agent.name);
      }
    }

    const formattedCreations = results.map(creation => ({
      ...creation,
      agentName: agentsMap.get(creation.agentId) || 'Unknown',
      tags: JSON.parse(creation.tags),
      timestamp: new Date(creation.createdAt),
    }));

    // Get total count
    const totalResult = db.select({ count: sql`count(*)` }).from(schema.creations).get();
    const total = Number(totalResult?.count) || 0;

    return c.json({
      creations: formattedCreations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      }
    });
  } catch (error) {
    console.error('Get creations error:', error);
    return c.json({ error: 'Failed to fetch creations' }, 500);
  }
});

// Get single creation
creations.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const creation = db.select().from(schema.creations).where(eq(schema.creations.id, id)).get();

    if (!creation) {
      return c.json({ error: 'Creation not found' }, 404);
    }

    // Get agent name
    const agent = db.select().from(schema.agents).where(eq(schema.agents.id, creation.agentId)).get();

    const formattedCreation = {
      ...creation,
      agentName: agent?.name || 'Unknown',
      tags: JSON.parse(creation.tags),
      timestamp: new Date(creation.createdAt),
    };

    return c.json({ creation: formattedCreation });
  } catch (error) {
    console.error('Get creation error:', error);
    return c.json({ error: 'Failed to fetch creation' }, 500);
  }
});

// Create a new creation (requires auth)
creations.post('/', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const { title, prompt, agentId, style, tags } = await c.req.json();

    if (!title || !agentId) {
      return c.json({ error: 'Title and agent are required' }, 400);
    }

    // Verify agent exists
    const agent = db.select().from(schema.agents).where(eq(schema.agents.id, agentId)).get();
    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    // Generate a placeholder image (in production, this would call an AI service)
    const placeholderImages = [
      'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1579547621113-e4bb2a19bdd6?w=600&h=600&fit=crop',
    ];
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

    const creationId = `c-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    db.insert(schema.creations).values({
      id: creationId,
      title,
      image: randomImage,
      agentId,
      userId: authPayload.userId,
      generation: 1,
      likes: 0,
      evolutions: 0,
      tags: JSON.stringify(tags || []),
      style: style || agent.style,
      prompt,
    }).run();

    // Update agent's creation count
    db.update(schema.agents)
      .set({
        creationsCount: agent.creationsCount + 1,
        status: 'creating' as const
      })
      .where(eq(schema.agents.id, agentId))
      .run();

    // Add to feed
    db.insert(schema.feedItems).values({
      id: `f-${Date.now()}`,
      type: 'creation',
      agentId,
      content: `Created a new masterpiece: "${title}"`,
      image: randomImage,
    }).run();

    const creation = db.select().from(schema.creations).where(eq(schema.creations.id, creationId)).get();

    return c.json({
      creation: {
        ...creation,
        agentName: agent.name,
        tags: JSON.parse(creation!.tags),
        timestamp: new Date(creation!.createdAt),
      }
    }, 201);
  } catch (error) {
    console.error('Create creation error:', error);
    return c.json({ error: 'Failed to create creation' }, 500);
  }
});

// Like a creation
creations.post('/:id/like', async (c) => {
  try {
    const id = c.req.param('id');
    const creation = db.select().from(schema.creations).where(eq(schema.creations.id, id)).get();

    if (!creation) {
      return c.json({ error: 'Creation not found' }, 404);
    }

    db.update(schema.creations)
      .set({ likes: creation.likes + 1 })
      .where(eq(schema.creations.id, id))
      .run();

    return c.json({ likes: creation.likes + 1 });
  } catch (error) {
    console.error('Like creation error:', error);
    return c.json({ error: 'Failed to like creation' }, 500);
  }
});

// Unlike a creation
creations.post('/:id/unlike', async (c) => {
  try {
    const id = c.req.param('id');
    const creation = db.select().from(schema.creations).where(eq(schema.creations.id, id)).get();

    if (!creation) {
      return c.json({ error: 'Creation not found' }, 404);
    }

    db.update(schema.creations)
      .set({ likes: Math.max(0, creation.likes - 1) })
      .where(eq(schema.creations.id, id))
      .run();

    return c.json({ likes: Math.max(0, creation.likes - 1) });
  } catch (error) {
    console.error('Unlike creation error:', error);
    return c.json({ error: 'Failed to unlike creation' }, 500);
  }
});

// Evolve a creation
creations.post('/:id/evolve', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const authPayload = c.get('user') as AuthPayload;
    const { direction, intensity } = await c.req.json();

    const parentCreation = db.select().from(schema.creations).where(eq(schema.creations.id, id)).get();

    if (!parentCreation) {
      return c.json({ error: 'Creation not found' }, 404);
    }

    const agent = db.select().from(schema.agents).where(eq(schema.agents.id, parentCreation.agentId)).get();

    // Generate evolved image (placeholder)
    const evolvedImages = [
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&h=600&fit=crop',
    ];
    const randomImage = evolvedImages[Math.floor(Math.random() * evolvedImages.length)];

    const evolutionId = `c-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const newGeneration = parentCreation.generation + 1;
    const newTitle = `${parentCreation.title} (Gen ${newGeneration})`;

    db.insert(schema.creations).values({
      id: evolutionId,
      title: newTitle,
      image: randomImage,
      agentId: parentCreation.agentId,
      userId: authPayload.userId,
      generation: newGeneration,
      parentId: id,
      likes: 0,
      evolutions: 0,
      tags: parentCreation.tags,
      style: parentCreation.style,
      prompt: direction || parentCreation.prompt,
    }).run();

    // Update parent's evolution count
    db.update(schema.creations)
      .set({ evolutions: parentCreation.evolutions + 1 })
      .where(eq(schema.creations.id, id))
      .run();

    // Update agent's evolution count
    if (agent) {
      db.update(schema.agents)
        .set({
          evolutionsCount: agent.evolutionsCount + 1,
          status: 'evolving' as const
        })
        .where(eq(schema.agents.id, agent.id))
        .run();
    }

    // Add to feed
    db.insert(schema.feedItems).values({
      id: `f-${Date.now()}`,
      type: 'evolution',
      agentId: parentCreation.agentId,
      content: `Evolved "${parentCreation.title}" to Generation ${newGeneration}`,
      image: randomImage,
    }).run();

    const evolution = db.select().from(schema.creations).where(eq(schema.creations.id, evolutionId)).get();

    return c.json({
      creation: {
        ...evolution,
        agentName: agent?.name || 'Unknown',
        tags: JSON.parse(evolution!.tags),
        timestamp: new Date(evolution!.createdAt),
      }
    }, 201);
  } catch (error) {
    console.error('Evolve creation error:', error);
    return c.json({ error: 'Failed to evolve creation' }, 500);
  }
});

// Search creations
creations.get('/search/:query', async (c) => {
  try {
    const query = c.req.param('query');
    const limit = Number(c.req.query('limit')) || 20;

    const results = db.select()
      .from(schema.creations)
      .where(
        or(
          like(schema.creations.title, `%${query}%`),
          like(schema.creations.tags, `%${query}%`),
          like(schema.creations.style, `%${query}%`)
        )
      )
      .orderBy(desc(schema.creations.likes))
      .limit(limit)
      .all();

    // Get agent names
    const agentIds = [...new Set(results.map(c => c.agentId))];
    const agentsMap = new Map();

    for (const aid of agentIds) {
      const agent = db.select().from(schema.agents).where(eq(schema.agents.id, aid)).get();
      if (agent) {
        agentsMap.set(aid, agent.name);
      }
    }

    const formattedResults = results.map(creation => ({
      ...creation,
      agentName: agentsMap.get(creation.agentId) || 'Unknown',
      tags: JSON.parse(creation.tags),
      timestamp: new Date(creation.createdAt),
    }));

    return c.json({ results: formattedResults });
  } catch (error) {
    console.error('Search creations error:', error);
    return c.json({ error: 'Failed to search creations' }, 500);
  }
});

export default creations;
