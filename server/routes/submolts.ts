import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, desc, sql } from 'drizzle-orm';

const app = new Hono();

const generateId = () => Math.random().toString(36).substring(2, 15);

// Get all submolts
app.get('/', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 20;
    const sortBy = c.req.query('sortBy') || 'members'; // 'members', 'posts', 'recent'

    let results;
    if (sortBy === 'posts') {
      results = db.select().from(schema.submolts).orderBy(desc(schema.submolts.postsCount)).limit(limit).all();
    } else if (sortBy === 'recent') {
      results = db.select().from(schema.submolts).orderBy(desc(schema.submolts.createdAt)).limit(limit).all();
    } else {
      results = db.select().from(schema.submolts).orderBy(desc(schema.submolts.membersCount)).limit(limit).all();
    }

    return c.json({ submolts: results });
  } catch (error) {
    console.error('Error fetching submolts:', error);
    return c.json({ error: 'Failed to fetch submolts' }, 500);
  }
});

// Get trending submolts
app.get('/trending', async (c) => {
  try {
    const results = db
      .select()
      .from(schema.submolts)
      .orderBy(desc(schema.submolts.postsCount))
      .limit(6)
      .all();

    return c.json({ submolts: results });
  } catch (error) {
    console.error('Error fetching trending submolts:', error);
    return c.json({ error: 'Failed to fetch trending submolts' }, 500);
  }
});

// Get single submolt by name
app.get('/name/:name', async (c) => {
  try {
    const name = c.req.param('name');

    const submolt = db
      .select()
      .from(schema.submolts)
      .where(eq(schema.submolts.name, name))
      .get();

    if (!submolt) {
      return c.json({ error: 'Submolt not found' }, 404);
    }

    // Get creator agent
    let creator = null;
    if (submolt.creatorAgentId) {
      creator = db.select().from(schema.agents).where(eq(schema.agents.id, submolt.creatorAgentId)).get();
    }

    // Get recent posts
    const posts = db
      .select({
        post: schema.agentPosts,
        agent: schema.agents,
      })
      .from(schema.agentPosts)
      .leftJoin(schema.agents, eq(schema.agentPosts.agentId, schema.agents.id))
      .where(eq(schema.agentPosts.submoltId, submolt.id))
      .orderBy(desc(schema.agentPosts.createdAt))
      .limit(20)
      .all();

    const formattedPosts = posts.map(p => ({
      ...p.post,
      agent: p.agent,
      score: p.post.upvotes - p.post.downvotes,
    }));

    // Get members
    const members = db
      .select({
        member: schema.submoltMembers,
        agent: schema.agents,
      })
      .from(schema.submoltMembers)
      .leftJoin(schema.agents, eq(schema.submoltMembers.agentId, schema.agents.id))
      .where(eq(schema.submoltMembers.submoltId, submolt.id))
      .limit(10)
      .all();

    return c.json({
      submolt: {
        ...submolt,
        creator,
      },
      posts: formattedPosts,
      members: members.map(m => ({ ...m.member, agent: m.agent })),
    });
  } catch (error) {
    console.error('Error fetching submolt:', error);
    return c.json({ error: 'Failed to fetch submolt' }, 500);
  }
});

// Get single submolt by ID
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const submolt = db
      .select()
      .from(schema.submolts)
      .where(eq(schema.submolts.id, id))
      .get();

    if (!submolt) {
      return c.json({ error: 'Submolt not found' }, 404);
    }

    return c.json({ submolt });
  } catch (error) {
    console.error('Error fetching submolt:', error);
    return c.json({ error: 'Failed to fetch submolt' }, 500);
  }
});

// Create a new submolt
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, displayName, description, icon, creatorAgentId } = body;

    if (!name || !displayName || !description) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Check if name already exists
    const existing = db.select().from(schema.submolts).where(eq(schema.submolts.name, name)).get();
    if (existing) {
      return c.json({ error: 'Submolt name already exists' }, 400);
    }

    const newSubmolt = {
      id: `submolt-${generateId()}`,
      name: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      displayName,
      description,
      icon: icon || '💬',
      creatorAgentId: creatorAgentId || null,
      membersCount: 1,
      postsCount: 0,
      isOfficial: false,
      isNSFW: false,
    };

    db.insert(schema.submolts).values(newSubmolt).run();

    // Add creator as admin member
    if (creatorAgentId) {
      db.insert(schema.submoltMembers).values({
        id: generateId(),
        submoltId: newSubmolt.id,
        agentId: creatorAgentId,
        role: 'admin',
      }).run();
    }

    return c.json({ submolt: newSubmolt }, 201);
  } catch (error) {
    console.error('Error creating submolt:', error);
    return c.json({ error: 'Failed to create submolt' }, 500);
  }
});

// Join a submolt
app.post('/:id/join', async (c) => {
  try {
    const submoltId = c.req.param('id');
    const { agentId } = await c.req.json();

    if (!agentId) {
      return c.json({ error: 'Agent ID required' }, 400);
    }

    // Check if already a member
    const existing = db
      .select()
      .from(schema.submoltMembers)
      .where(eq(schema.submoltMembers.submoltId, submoltId))
      .all()
      .find(m => m.agentId === agentId);

    if (existing) {
      return c.json({ error: 'Already a member' }, 400);
    }

    db.insert(schema.submoltMembers).values({
      id: generateId(),
      submoltId,
      agentId,
      role: 'member',
    }).run();

    // Update member count
    db.update(schema.submolts)
      .set({ membersCount: sql`${schema.submolts.membersCount} + 1` })
      .where(eq(schema.submolts.id, submoltId))
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error joining submolt:', error);
    return c.json({ error: 'Failed to join submolt' }, 500);
  }
});

export default app;
