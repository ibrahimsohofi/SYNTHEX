import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, desc, sql, and, gte } from 'drizzle-orm';

const trending = new Hono();

// Get trending creations (based on recent likes, evolutions, and comments)
trending.get('/creations', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 20;
    const timeframe = c.req.query('timeframe') || 'week'; // day, week, month, all

    // Calculate date threshold based on timeframe
    let dateThreshold: string;
    const now = new Date();
    switch (timeframe) {
      case 'day':
        now.setDate(now.getDate() - 1);
        break;
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        break;
      default:
        now.setFullYear(now.getFullYear() - 10); // "all time"
    }
    dateThreshold = now.toISOString();

    // Get trending creations with a weighted score
    // Score = likes * 1 + evolutions * 3 + comments * 2
    const trendingCreations = db.select({
      id: schema.creations.id,
      title: schema.creations.title,
      description: schema.creations.description,
      image: schema.creations.image,
      agentId: schema.creations.agentId,
      generation: schema.creations.generation,
      likes: schema.creations.likes,
      evolutions: schema.creations.evolutions,
      commentsCount: schema.creations.commentsCount,
      views: schema.creations.views,
      tags: schema.creations.tags,
      style: schema.creations.style,
      createdAt: schema.creations.createdAt,
      trendingScore: sql<number>`(${schema.creations.likes} + ${schema.creations.evolutions} * 3 + ${schema.creations.commentsCount} * 2)`.as('trending_score'),
    })
      .from(schema.creations)
      .where(gte(schema.creations.createdAt, dateThreshold))
      .orderBy(sql`trending_score DESC`)
      .limit(limit)
      .all();

    // Get agent names
    const formattedCreations = [];
    for (const creation of trendingCreations) {
      const agent = db.select({ name: schema.agents.name, avatar: schema.agents.avatar })
        .from(schema.agents)
        .where(eq(schema.agents.id, creation.agentId))
        .get();

      formattedCreations.push({
        ...creation,
        agentName: agent?.name || 'Unknown',
        agentAvatar: agent?.avatar || '',
        tags: JSON.parse(creation.tags),
      });
    }

    return c.json({
      creations: formattedCreations,
      timeframe,
    });
  } catch (error) {
    console.error('Get trending creations error:', error);
    return c.json({ error: 'Failed to fetch trending creations' }, 500);
  }
});

// Get trending agents (most active in recent period)
trending.get('/agents', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 10;

    // Get agents sorted by recent activity (creating/evolving status + creation count)
    const agents = db.select()
      .from(schema.agents)
      .orderBy(
        sql`CASE
          WHEN status = 'creating' THEN 3
          WHEN status = 'evolving' THEN 2
          WHEN status = 'analyzing' THEN 1
          ELSE 0
        END DESC`,
        desc(schema.agents.creationsCount)
      )
      .limit(limit)
      .all();

    const formattedAgents = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      avatar: agent.avatar,
      specialty: agent.specialty,
      style: agent.style,
      status: agent.status,
      creationsCount: agent.creationsCount,
      evolutionsCount: agent.evolutionsCount,
      creativeDNA: {
        color: agent.dnaColor,
        pattern: agent.dnaPattern,
        complexity: agent.dnaComplexity,
      },
    }));

    return c.json({ agents: formattedAgents });
  } catch (error) {
    console.error('Get trending agents error:', error);
    return c.json({ error: 'Failed to fetch trending agents' }, 500);
  }
});

// Get featured/curated creations
trending.get('/featured', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 10;

    const featuredCreations = db.select()
      .from(schema.creations)
      .where(eq(schema.creations.isFeatured, true))
      .orderBy(desc(schema.creations.createdAt))
      .limit(limit)
      .all();

    const formattedCreations = [];
    for (const creation of featuredCreations) {
      const agent = db.select({ name: schema.agents.name })
        .from(schema.agents)
        .where(eq(schema.agents.id, creation.agentId))
        .get();

      formattedCreations.push({
        ...creation,
        agentName: agent?.name || 'Unknown',
        tags: JSON.parse(creation.tags),
      });
    }

    return c.json({ creations: formattedCreations });
  } catch (error) {
    console.error('Get featured creations error:', error);
    return c.json({ error: 'Failed to fetch featured creations' }, 500);
  }
});

// Get styles overview (popular creation styles)
trending.get('/styles', async (c) => {
  try {
    const styles = db.select({
      style: schema.creations.style,
      count: sql<number>`count(*)`.as('count'),
      totalLikes: sql<number>`sum(${schema.creations.likes})`.as('total_likes'),
    })
      .from(schema.creations)
      .groupBy(schema.creations.style)
      .orderBy(sql`count DESC`)
      .limit(10)
      .all();

    return c.json({ styles });
  } catch (error) {
    console.error('Get styles error:', error);
    return c.json({ error: 'Failed to fetch styles' }, 500);
  }
});

// Get popular tags
trending.get('/tags', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 20;

    // Get all creations and extract tags
    const creations = db.select({ tags: schema.creations.tags, likes: schema.creations.likes })
      .from(schema.creations)
      .all();

    // Count tag occurrences and aggregate likes
    const tagMap = new Map<string, { count: number; likes: number }>();

    for (const creation of creations) {
      const tags: string[] = JSON.parse(creation.tags);
      for (const tag of tags) {
        const existing = tagMap.get(tag) || { count: 0, likes: 0 };
        tagMap.set(tag, {
          count: existing.count + 1,
          likes: existing.likes + creation.likes,
        });
      }
    }

    // Convert to array and sort by count
    const popularTags = Array.from(tagMap.entries())
      .map(([tag, data]) => ({ tag, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return c.json({ tags: popularTags });
  } catch (error) {
    console.error('Get popular tags error:', error);
    return c.json({ error: 'Failed to fetch popular tags' }, 500);
  }
});

// Discover - random creations for exploration
trending.get('/discover', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 12;

    // Get random creations using SQLite's RANDOM()
    const randomCreations = db.select()
      .from(schema.creations)
      .where(eq(schema.creations.isPublic, true))
      .orderBy(sql`RANDOM()`)
      .limit(limit)
      .all();

    const formattedCreations = [];
    for (const creation of randomCreations) {
      const agent = db.select({ name: schema.agents.name })
        .from(schema.agents)
        .where(eq(schema.agents.id, creation.agentId))
        .get();

      formattedCreations.push({
        ...creation,
        agentName: agent?.name || 'Unknown',
        tags: JSON.parse(creation.tags),
      });
    }

    return c.json({ creations: formattedCreations });
  } catch (error) {
    console.error('Get discover creations error:', error);
    return c.json({ error: 'Failed to fetch discover creations' }, 500);
  }
});

export default trending;
