import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, desc, sql } from 'drizzle-orm';

const agents = new Hono();

// Get all agents
agents.get('/', async (c) => {
  try {
    const allAgents = db.select().from(schema.agents).all();

    // Transform to match frontend expected format
    const formattedAgents = allAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      avatar: agent.avatar,
      specialty: agent.specialty,
      description: agent.description,
      style: agent.style,
      creationsCount: agent.creationsCount,
      evolutionsCount: agent.evolutionsCount,
      status: agent.status,
      creativeDNA: {
        color: agent.dnaColor,
        pattern: agent.dnaPattern,
        complexity: agent.dnaComplexity,
      },
    }));

    return c.json({ agents: formattedAgents });
  } catch (error) {
    console.error('Get agents error:', error);
    return c.json({ error: 'Failed to fetch agents' }, 500);
  }
});

// Get single agent
agents.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const agent = db.select().from(schema.agents).where(eq(schema.agents.id, id)).get();

    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    const formattedAgent = {
      id: agent.id,
      name: agent.name,
      avatar: agent.avatar,
      specialty: agent.specialty,
      description: agent.description,
      style: agent.style,
      creationsCount: agent.creationsCount,
      evolutionsCount: agent.evolutionsCount,
      status: agent.status,
      creativeDNA: {
        color: agent.dnaColor,
        pattern: agent.dnaPattern,
        complexity: agent.dnaComplexity,
      },
    };

    return c.json({ agent: formattedAgent });
  } catch (error) {
    console.error('Get agent error:', error);
    return c.json({ error: 'Failed to fetch agent' }, 500);
  }
});

// Get agent's creations
agents.get('/:id/creations', async (c) => {
  try {
    const id = c.req.param('id');
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;

    const agentCreations = db.select()
      .from(schema.creations)
      .where(eq(schema.creations.agentId, id))
      .orderBy(desc(schema.creations.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    // Get the agent for name
    const agent = db.select().from(schema.agents).where(eq(schema.agents.id, id)).get();

    const formattedCreations = agentCreations.map(c => ({
      ...c,
      agentName: agent?.name || 'Unknown',
      tags: JSON.parse(c.tags),
      timestamp: new Date(c.createdAt),
    }));

    return c.json({ creations: formattedCreations });
  } catch (error) {
    console.error('Get agent creations error:', error);
    return c.json({ error: 'Failed to fetch creations' }, 500);
  }
});

// Update agent status (for simulating AI activity)
agents.patch('/:id/status', async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();

    if (!['creating', 'evolving', 'analyzing', 'idle'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    db.update(schema.agents)
      .set({ status })
      .where(eq(schema.agents.id, id))
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Update agent status error:', error);
    return c.json({ error: 'Failed to update status' }, 500);
  }
});

export default agents;
