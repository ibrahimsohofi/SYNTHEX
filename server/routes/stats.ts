import { Hono } from 'hono';
import { db, schema } from '../db';
import { sql } from 'drizzle-orm';

const stats = new Hono();

// Get platform statistics
stats.get('/', async (c) => {
  try {
    // Get total agents
    const agentsResult = db.select({ count: sql`count(*)` }).from(schema.agents).get();
    const totalAgents = Number(agentsResult?.count) || 0;

    // Get total creations
    const creationsResult = db.select({ count: sql`count(*)` }).from(schema.creations).get();
    const totalCreations = Number(creationsResult?.count) || 0;

    // Get total evolutions (sum of all agent evolutionCounts)
    const evolutionsResult = db.select({
      total: sql`sum(evolutions_count)`
    }).from(schema.agents).get();
    const totalEvolutions = Number(evolutionsResult?.total) || 0;

    // Get active agents (not idle)
    const activeResult = db.select({ count: sql`count(*)` })
      .from(schema.agents)
      .where(sql`status != 'idle'`)
      .get();
    const activeAgents = Number(activeResult?.count) || 0;

    // Get total users
    const usersResult = db.select({ count: sql`count(*)` }).from(schema.users).get();
    const totalUsers = Number(usersResult?.count) || 0;

    // Get total likes across all creations
    const likesResult = db.select({ total: sql`sum(likes)` }).from(schema.creations).get();
    const totalLikes = Number(likesResult?.total) || 0;

    return c.json({
      stats: {
        totalAgents,
        totalCreations,
        totalEvolutions,
        activeAgents,
        totalUsers,
        totalLikes,
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// Get leaderboard
stats.get('/leaderboard', async (c) => {
  try {
    const type = c.req.query('type') || 'creations';
    const limit = Number(c.req.query('limit')) || 10;

    let leaderboard;

    if (type === 'creations') {
      // Top agents by creation count
      leaderboard = db.select({
        id: schema.agents.id,
        name: schema.agents.name,
        avatar: schema.agents.avatar,
        count: schema.agents.creationsCount,
      })
        .from(schema.agents)
        .orderBy(sql`creations_count DESC`)
        .limit(limit)
        .all();
    } else if (type === 'evolutions') {
      // Top agents by evolution count
      leaderboard = db.select({
        id: schema.agents.id,
        name: schema.agents.name,
        avatar: schema.agents.avatar,
        count: schema.agents.evolutionsCount,
      })
        .from(schema.agents)
        .orderBy(sql`evolutions_count DESC`)
        .limit(limit)
        .all();
    } else {
      // Top creations by likes
      leaderboard = db.select({
        id: schema.creations.id,
        title: schema.creations.title,
        image: schema.creations.image,
        count: schema.creations.likes,
      })
        .from(schema.creations)
        .orderBy(sql`likes DESC`)
        .limit(limit)
        .all();
    }

    return c.json({ leaderboard, type });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

export default stats;
