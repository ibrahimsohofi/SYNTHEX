import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, desc, sql, and } from 'drizzle-orm';
import { requireAuth, type AuthPayload } from '../middleware/auth';

const users = new Hono();

// Get public user profile
users.get('/:id', async (c) => {
  try {
    const userId = c.req.param('id');

    const user = db.select({
      id: schema.users.id,
      name: schema.users.name,
      avatar: schema.users.avatar,
      bio: schema.users.bio,
      website: schema.users.website,
      plan: schema.users.plan,
      isVerified: schema.users.isVerified,
      createdAt: schema.users.createdAt,
    })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .get();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get follower/following counts
    const followersResult = db.select({ count: sql`count(*)` })
      .from(schema.follows)
      .where(eq(schema.follows.followingId, userId))
      .get();
    const followersCount = Number(followersResult?.count) || 0;

    const followingResult = db.select({ count: sql`count(*)` })
      .from(schema.follows)
      .where(eq(schema.follows.followerId, userId))
      .get();
    const followingCount = Number(followingResult?.count) || 0;

    // Get creation count
    const creationsResult = db.select({ count: sql`count(*)` })
      .from(schema.creations)
      .where(eq(schema.creations.userId, userId))
      .get();
    const creationsCount = Number(creationsResult?.count) || 0;

    // Get collections count
    const collectionsResult = db.select({ count: sql`count(*)` })
      .from(schema.collections)
      .where(
        and(
          eq(schema.collections.userId, userId),
          eq(schema.collections.isPublic, true)
        )
      )
      .get();
    const collectionsCount = Number(collectionsResult?.count) || 0;

    return c.json({
      user: {
        ...user,
        followersCount,
        followingCount,
        creationsCount,
        collectionsCount,
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return c.json({ error: 'Failed to fetch user profile' }, 500);
  }
});

// Get user's creations
users.get('/:id/creations', async (c) => {
  try {
    const userId = c.req.param('id');
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;

    const userCreations = db.select()
      .from(schema.creations)
      .where(
        and(
          eq(schema.creations.userId, userId),
          eq(schema.creations.isPublic, true)
        )
      )
      .orderBy(desc(schema.creations.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    // Get agent names
    const formattedCreations = [];
    for (const creation of userCreations) {
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

    // Get total count
    const totalResult = db.select({ count: sql`count(*)` })
      .from(schema.creations)
      .where(
        and(
          eq(schema.creations.userId, userId),
          eq(schema.creations.isPublic, true)
        )
      )
      .get();
    const total = Number(totalResult?.count) || 0;

    return c.json({
      creations: formattedCreations,
      pagination: { total, limit, offset, hasMore: offset + limit < total }
    });
  } catch (error) {
    console.error('Get user creations error:', error);
    return c.json({ error: 'Failed to fetch user creations' }, 500);
  }
});

// Get user's public collections
users.get('/:id/collections', async (c) => {
  try {
    const userId = c.req.param('id');

    const userCollections = db.select()
      .from(schema.collections)
      .where(
        and(
          eq(schema.collections.userId, userId),
          eq(schema.collections.isPublic, true)
        )
      )
      .orderBy(desc(schema.collections.updatedAt))
      .all();

    // Get item counts
    const formattedCollections = [];
    for (const collection of userCollections) {
      const itemsResult = db.select({ count: sql`count(*)` })
        .from(schema.collectionItems)
        .where(eq(schema.collectionItems.collectionId, collection.id))
        .get();
      const itemCount = Number(itemsResult?.count) || 0;

      formattedCollections.push({
        ...collection,
        itemCount,
      });
    }

    return c.json({ collections: formattedCollections });
  } catch (error) {
    console.error('Get user collections error:', error);
    return c.json({ error: 'Failed to fetch user collections' }, 500);
  }
});

// Get user's activity history
users.get('/:id/activity', async (c) => {
  try {
    const userId = c.req.param('id');
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;

    const activities = db.select()
      .from(schema.activities)
      .where(eq(schema.activities.userId, userId))
      .orderBy(desc(schema.activities.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    // Enrich activity data
    const formattedActivities = [];
    for (const activity of activities) {
      let targetData = null;

      if (activity.targetType === 'creation') {
        const creation = db.select({
          id: schema.creations.id,
          title: schema.creations.title,
          image: schema.creations.image,
        })
          .from(schema.creations)
          .where(eq(schema.creations.id, activity.targetId))
          .get();
        targetData = creation;
      } else if (activity.targetType === 'agent') {
        const agent = db.select({
          id: schema.agents.id,
          name: schema.agents.name,
          avatar: schema.agents.avatar,
        })
          .from(schema.agents)
          .where(eq(schema.agents.id, activity.targetId))
          .get();
        targetData = agent;
      } else if (activity.targetType === 'user') {
        const user = db.select({
          id: schema.users.id,
          name: schema.users.name,
          avatar: schema.users.avatar,
        })
          .from(schema.users)
          .where(eq(schema.users.id, activity.targetId))
          .get();
        targetData = user;
      }

      formattedActivities.push({
        id: activity.id,
        type: activity.type,
        targetType: activity.targetType,
        target: targetData,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
        createdAt: activity.createdAt,
      });
    }

    return c.json({ activities: formattedActivities });
  } catch (error) {
    console.error('Get user activity error:', error);
    return c.json({ error: 'Failed to fetch user activity' }, 500);
  }
});

// Search users
users.get('/search/:query', async (c) => {
  try {
    const query = c.req.param('query');
    const limit = Number(c.req.query('limit')) || 20;

    const results = db.select({
      id: schema.users.id,
      name: schema.users.name,
      avatar: schema.users.avatar,
      bio: schema.users.bio,
      isVerified: schema.users.isVerified,
    })
      .from(schema.users)
      .where(sql`${schema.users.name} LIKE ${'%' + query + '%'}`)
      .limit(limit)
      .all();

    // Get follower counts
    const formattedResults = [];
    for (const user of results) {
      const followersResult = db.select({ count: sql`count(*)` })
        .from(schema.follows)
        .where(eq(schema.follows.followingId, user.id))
        .get();
      const followersCount = Number(followersResult?.count) || 0;

      formattedResults.push({
        ...user,
        followersCount,
      });
    }

    return c.json({ users: formattedResults });
  } catch (error) {
    console.error('Search users error:', error);
    return c.json({ error: 'Failed to search users' }, 500);
  }
});

// Update last active
users.post('/activity/heartbeat', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;

    db.update(schema.users)
      .set({ lastActiveAt: new Date().toISOString() })
      .where(eq(schema.users.id, authPayload.userId))
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Update last active error:', error);
    return c.json({ error: 'Failed to update last active' }, 500);
  }
});

// Get suggested users to follow
users.get('/discover/suggested', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const limit = Number(c.req.query('limit')) || 10;

    // Get users the current user is already following
    const alreadyFollowing = db.select({ id: schema.follows.followingId })
      .from(schema.follows)
      .where(eq(schema.follows.followerId, authPayload.userId))
      .all()
      .map(f => f.id);

    // Get users with most followers that the current user isn't following
    const suggestedUsers = db.select({
      id: schema.users.id,
      name: schema.users.name,
      avatar: schema.users.avatar,
      bio: schema.users.bio,
      isVerified: schema.users.isVerified,
    })
      .from(schema.users)
      .where(sql`${schema.users.id} != ${authPayload.userId}`)
      .limit(limit * 2)
      .all();

    // Filter out already following and add follower counts
    const results = [];
    for (const user of suggestedUsers) {
      if (alreadyFollowing.includes(user.id)) continue;
      if (results.length >= limit) break;

      const followersResult = db.select({ count: sql`count(*)` })
        .from(schema.follows)
        .where(eq(schema.follows.followingId, user.id))
        .get();
      const followersCount = Number(followersResult?.count) || 0;

      // Get creation count
      const creationsResult = db.select({ count: sql`count(*)` })
        .from(schema.creations)
        .where(eq(schema.creations.userId, user.id))
        .get();
      const creationsCount = Number(creationsResult?.count) || 0;

      results.push({
        ...user,
        followersCount,
        creationsCount,
      });
    }

    // Sort by followers count
    results.sort((a, b) => b.followersCount - a.followersCount);

    return c.json({ users: results });
  } catch (error) {
    console.error('Get suggested users error:', error);
    return c.json({ error: 'Failed to fetch suggested users' }, 500);
  }
});

export default users;