import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { requireAuth, type AuthPayload } from '../middleware/auth';

const follows = new Hono();

// Helper function to create notification
function createNotification(
  userId: string,
  type: 'like' | 'comment' | 'follow' | 'evolution' | 'mention' | 'system' | 'milestone',
  title: string,
  message: string,
  actorId?: string,
  targetType?: 'creation' | 'comment' | 'user' | 'agent',
  targetId?: string
) {
  const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  db.insert(schema.notifications).values({
    id: notificationId,
    userId,
    type,
    title,
    message,
    actorId,
    targetType,
    targetId,
  }).run();
}

// ==================== USER FOLLOWS ====================

// Follow a user
follows.post('/users/:userId', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const targetUserId = c.req.param('userId');

    if (targetUserId === authPayload.userId) {
      return c.json({ error: 'You cannot follow yourself' }, 400);
    }

    // Check if target user exists
    const targetUser = db.select()
      .from(schema.users)
      .where(eq(schema.users.id, targetUserId))
      .get();

    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Check if already following
    const existing = db.select()
      .from(schema.follows)
      .where(
        and(
          eq(schema.follows.followerId, authPayload.userId),
          eq(schema.follows.followingId, targetUserId)
        )
      )
      .get();

    if (existing) {
      return c.json({ message: 'Already following this user' });
    }

    const followId = `follow-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    db.insert(schema.follows).values({
      id: followId,
      followerId: authPayload.userId,
      followingId: targetUserId,
    }).run();

    // Create notification for followed user
    const follower = db.select({ name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.id, authPayload.userId))
      .get();

    createNotification(
      targetUserId,
      'follow',
      'New follower',
      `${follower?.name || 'Someone'} started following you`,
      authPayload.userId,
      'user',
      authPayload.userId
    );

    // Add to feed
    db.insert(schema.feedItems).values({
      id: `f-${Date.now()}`,
      type: 'follow',
      userId: authPayload.userId,
      content: `Started following ${targetUser.name}`,
      targetType: 'user',
      targetId: targetUserId,
    }).run();

    // Track activity
    db.insert(schema.activities).values({
      id: `act-${Date.now()}`,
      userId: authPayload.userId,
      type: 'follow',
      targetType: 'user',
      targetId: targetUserId,
    }).run();

    return c.json({ message: 'Now following user', followId }, 201);
  } catch (error) {
    console.error('Follow user error:', error);
    return c.json({ error: 'Failed to follow user' }, 500);
  }
});

// Unfollow a user
follows.delete('/users/:userId', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const targetUserId = c.req.param('userId');

    db.delete(schema.follows)
      .where(
        and(
          eq(schema.follows.followerId, authPayload.userId),
          eq(schema.follows.followingId, targetUserId)
        )
      )
      .run();

    return c.json({ message: 'Unfollowed user' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    return c.json({ error: 'Failed to unfollow user' }, 500);
  }
});

// Get user's followers
follows.get('/users/:userId/followers', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;

    const followers = db.select()
      .from(schema.follows)
      .where(eq(schema.follows.followingId, userId))
      .orderBy(desc(schema.follows.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    const formattedFollowers = [];
    for (const follow of followers) {
      const user = db.select({
        id: schema.users.id,
        name: schema.users.name,
        avatar: schema.users.avatar,
        bio: schema.users.bio,
      })
        .from(schema.users)
        .where(eq(schema.users.id, follow.followerId))
        .get();

      if (user) {
        formattedFollowers.push({
          ...user,
          followedAt: follow.createdAt,
        });
      }
    }

    // Get total count
    const totalResult = db.select({ count: sql`count(*)` })
      .from(schema.follows)
      .where(eq(schema.follows.followingId, userId))
      .get();
    const total = Number(totalResult?.count) || 0;

    return c.json({
      followers: formattedFollowers,
      pagination: { total, limit, offset, hasMore: offset + limit < total }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    return c.json({ error: 'Failed to fetch followers' }, 500);
  }
});

// Get user's following
follows.get('/users/:userId/following', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;

    const following = db.select()
      .from(schema.follows)
      .where(eq(schema.follows.followerId, userId))
      .orderBy(desc(schema.follows.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    const formattedFollowing = [];
    for (const follow of following) {
      const user = db.select({
        id: schema.users.id,
        name: schema.users.name,
        avatar: schema.users.avatar,
        bio: schema.users.bio,
      })
        .from(schema.users)
        .where(eq(schema.users.id, follow.followingId))
        .get();

      if (user) {
        formattedFollowing.push({
          ...user,
          followedAt: follow.createdAt,
        });
      }
    }

    // Get total count
    const totalResult = db.select({ count: sql`count(*)` })
      .from(schema.follows)
      .where(eq(schema.follows.followerId, userId))
      .get();
    const total = Number(totalResult?.count) || 0;

    return c.json({
      following: formattedFollowing,
      pagination: { total, limit, offset, hasMore: offset + limit < total }
    });
  } catch (error) {
    console.error('Get following error:', error);
    return c.json({ error: 'Failed to fetch following' }, 500);
  }
});

// Check if following a user
follows.get('/users/:userId/check', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const targetUserId = c.req.param('userId');

    const follow = db.select()
      .from(schema.follows)
      .where(
        and(
          eq(schema.follows.followerId, authPayload.userId),
          eq(schema.follows.followingId, targetUserId)
        )
      )
      .get();

    return c.json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Check follow status error:', error);
    return c.json({ error: 'Failed to check follow status' }, 500);
  }
});

// ==================== AGENT FOLLOWS ====================

// Follow an agent
follows.post('/agents/:agentId', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const agentId = c.req.param('agentId');

    // Check if agent exists
    const agent = db.select()
      .from(schema.agents)
      .where(eq(schema.agents.id, agentId))
      .get();

    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    // Check if already following
    const existing = db.select()
      .from(schema.agentFollows)
      .where(
        and(
          eq(schema.agentFollows.userId, authPayload.userId),
          eq(schema.agentFollows.agentId, agentId)
        )
      )
      .get();

    if (existing) {
      return c.json({ message: 'Already following this agent' });
    }

    const followId = `af-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    db.insert(schema.agentFollows).values({
      id: followId,
      userId: authPayload.userId,
      agentId,
    }).run();

    // Track activity
    db.insert(schema.activities).values({
      id: `act-${Date.now()}`,
      userId: authPayload.userId,
      type: 'follow',
      targetType: 'agent',
      targetId: agentId,
    }).run();

    return c.json({ message: 'Now following agent', followId }, 201);
  } catch (error) {
    console.error('Follow agent error:', error);
    return c.json({ error: 'Failed to follow agent' }, 500);
  }
});

// Unfollow an agent
follows.delete('/agents/:agentId', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const agentId = c.req.param('agentId');

    db.delete(schema.agentFollows)
      .where(
        and(
          eq(schema.agentFollows.userId, authPayload.userId),
          eq(schema.agentFollows.agentId, agentId)
        )
      )
      .run();

    return c.json({ message: 'Unfollowed agent' });
  } catch (error) {
    console.error('Unfollow agent error:', error);
    return c.json({ error: 'Failed to unfollow agent' }, 500);
  }
});

// Get agents followed by user
follows.get('/agents/my', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;

    const agentFollows = db.select()
      .from(schema.agentFollows)
      .where(eq(schema.agentFollows.userId, authPayload.userId))
      .orderBy(desc(schema.agentFollows.createdAt))
      .all();

    const followedAgents = [];
    for (const follow of agentFollows) {
      const agent = db.select()
        .from(schema.agents)
        .where(eq(schema.agents.id, follow.agentId))
        .get();

      if (agent) {
        followedAgents.push({
          id: agent.id,
          name: agent.name,
          avatar: agent.avatar,
          specialty: agent.specialty,
          status: agent.status,
          followedAt: follow.createdAt,
        });
      }
    }

    return c.json({ agents: followedAgents });
  } catch (error) {
    console.error('Get followed agents error:', error);
    return c.json({ error: 'Failed to fetch followed agents' }, 500);
  }
});

// Check if following an agent
follows.get('/agents/:agentId/check', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const agentId = c.req.param('agentId');

    const follow = db.select()
      .from(schema.agentFollows)
      .where(
        and(
          eq(schema.agentFollows.userId, authPayload.userId),
          eq(schema.agentFollows.agentId, agentId)
        )
      )
      .get();

    return c.json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Check agent follow status error:', error);
    return c.json({ error: 'Failed to check follow status' }, 500);
  }
});

// Get agent's followers count
follows.get('/agents/:agentId/followers/count', async (c) => {
  try {
    const agentId = c.req.param('agentId');

    const result = db.select({ count: sql`count(*)` })
      .from(schema.agentFollows)
      .where(eq(schema.agentFollows.agentId, agentId))
      .get();

    return c.json({ count: Number(result?.count) || 0 });
  } catch (error) {
    console.error('Get agent followers count error:', error);
    return c.json({ error: 'Failed to get followers count' }, 500);
  }
});

export default follows;
