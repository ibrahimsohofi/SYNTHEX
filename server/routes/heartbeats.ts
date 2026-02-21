import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, desc, sql } from 'drizzle-orm';

const app = new Hono();

const generateId = () => Math.random().toString(36).substring(2, 15);

// Get all recent heartbeats (agent statuses)
app.get('/', async (c) => {
  try {
    // Get most recent heartbeat for each agent
    const allHeartbeats = db
      .select()
      .from(schema.heartbeats)
      .orderBy(desc(schema.heartbeats.createdAt))
      .all();

    // Group by agent and get latest
    const latestByAgent = new Map();
    for (const hb of allHeartbeats) {
      if (!latestByAgent.has(hb.agentId)) {
        latestByAgent.set(hb.agentId, hb);
      }
    }

    const heartbeats = Array.from(latestByAgent.values());

    // Get agent info
    const agents = db.select().from(schema.agents).all();
    const agentMap = new Map(agents.map(a => [a.id, a]));

    const result = heartbeats.map(hb => ({
      ...hb,
      agent: agentMap.get(hb.agentId),
    }));

    return c.json({ heartbeats: result });
  } catch (error) {
    console.error('Error fetching heartbeats:', error);
    return c.json({ error: 'Failed to fetch heartbeats' }, 500);
  }
});

// Get heartbeat for specific agent
app.get('/agent/:agentId', async (c) => {
  try {
    const agentId = c.req.param('agentId');

    const heartbeat = db
      .select()
      .from(schema.heartbeats)
      .where(eq(schema.heartbeats.agentId, agentId))
      .orderBy(desc(schema.heartbeats.createdAt))
      .get();

    if (!heartbeat) {
      return c.json({ status: 'offline', activity: null });
    }

    // Check if heartbeat is recent (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const isOnline = heartbeat.createdAt > fiveMinutesAgo;

    return c.json({
      ...heartbeat,
      status: isOnline ? heartbeat.status : 'offline',
    });
  } catch (error) {
    console.error('Error fetching agent heartbeat:', error);
    return c.json({ error: 'Failed to fetch heartbeat' }, 500);
  }
});

// Post a heartbeat (agent check-in)
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { agentId, status, activity, metadata } = body;

    if (!agentId) {
      return c.json({ error: 'Agent ID required' }, 400);
    }

    const newHeartbeat = {
      id: generateId(),
      agentId,
      status: status || 'online',
      activity: activity || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || null,
      userAgent: c.req.header('user-agent') || null,
    };

    db.insert(schema.heartbeats).values(newHeartbeat).run();

    return c.json({ heartbeat: newHeartbeat }, 201);
  } catch (error) {
    console.error('Error posting heartbeat:', error);
    return c.json({ error: 'Failed to post heartbeat' }, 500);
  }
});

// Get online agents count
app.get('/stats', async (c) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const allHeartbeats = db
      .select()
      .from(schema.heartbeats)
      .all();

    // Get unique agents with recent heartbeats
    const recentAgents = new Set();
    const statusCounts = { online: 0, busy: 0, idle: 0 };

    for (const hb of allHeartbeats) {
      if (hb.createdAt > fiveMinutesAgo && !recentAgents.has(hb.agentId)) {
        recentAgents.add(hb.agentId);
        if (hb.status === 'online') statusCounts.online++;
        else if (hb.status === 'busy') statusCounts.busy++;
        else if (hb.status === 'idle') statusCounts.idle++;
      }
    }

    return c.json({
      totalOnline: recentAgents.size,
      ...statusCounts,
    });
  } catch (error) {
    console.error('Error fetching heartbeat stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

export default app;
