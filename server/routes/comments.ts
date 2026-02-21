import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, desc, and, sql } from 'drizzle-orm';
import { requireAuth, type AuthPayload } from '../middleware/auth';

const comments = new Hono();

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

// Get comments for a creation
comments.get('/creation/:creationId', async (c) => {
  try {
    const creationId = c.req.param('creationId');
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;

    const creationComments = db.select()
      .from(schema.comments)
      .where(eq(schema.comments.creationId, creationId))
      .orderBy(desc(schema.comments.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    // Get user info for each comment
    const formattedComments = [];
    for (const comment of creationComments) {
      const user = db.select({
        id: schema.users.id,
        name: schema.users.name,
        avatar: schema.users.avatar,
      }).from(schema.users).where(eq(schema.users.id, comment.userId)).get();

      // Get replies count
      const repliesResult = db.select({ count: sql`count(*)` })
        .from(schema.comments)
        .where(eq(schema.comments.parentId, comment.id))
        .get();
      const repliesCount = Number(repliesResult?.count) || 0;

      formattedComments.push({
        id: comment.id,
        content: comment.content,
        likes: comment.likes,
        isEdited: comment.isEdited,
        parentId: comment.parentId,
        repliesCount,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user: user || { id: 'unknown', name: 'Unknown User', avatar: null },
      });
    }

    // Get total count
    const totalResult = db.select({ count: sql`count(*)` })
      .from(schema.comments)
      .where(eq(schema.comments.creationId, creationId))
      .get();
    const total = Number(totalResult?.count) || 0;

    return c.json({
      comments: formattedComments,
      pagination: { total, limit, offset, hasMore: offset + limit < total }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return c.json({ error: 'Failed to fetch comments' }, 500);
  }
});

// Get replies to a comment
comments.get('/:id/replies', async (c) => {
  try {
    const parentId = c.req.param('id');
    const limit = Number(c.req.query('limit')) || 10;

    const replies = db.select()
      .from(schema.comments)
      .where(eq(schema.comments.parentId, parentId))
      .orderBy(schema.comments.createdAt)
      .limit(limit)
      .all();

    const formattedReplies = [];
    for (const reply of replies) {
      const user = db.select({
        id: schema.users.id,
        name: schema.users.name,
        avatar: schema.users.avatar,
      }).from(schema.users).where(eq(schema.users.id, reply.userId)).get();

      formattedReplies.push({
        id: reply.id,
        content: reply.content,
        likes: reply.likes,
        isEdited: reply.isEdited,
        parentId: reply.parentId,
        createdAt: reply.createdAt,
        user: user || { id: 'unknown', name: 'Unknown User', avatar: null },
      });
    }

    return c.json({ replies: formattedReplies });
  } catch (error) {
    console.error('Get replies error:', error);
    return c.json({ error: 'Failed to fetch replies' }, 500);
  }
});

// Create a comment
comments.post('/creation/:creationId', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const creationId = c.req.param('creationId');
    const { content, parentId } = await c.req.json();

    if (!content || content.trim().length === 0) {
      return c.json({ error: 'Comment content is required' }, 400);
    }

    if (content.length > 2000) {
      return c.json({ error: 'Comment is too long (max 2000 characters)' }, 400);
    }

    // Verify creation exists
    const creation = db.select().from(schema.creations).where(eq(schema.creations.id, creationId)).get();
    if (!creation) {
      return c.json({ error: 'Creation not found' }, 404);
    }

    // If replying, verify parent comment exists
    if (parentId) {
      const parentComment = db.select().from(schema.comments).where(eq(schema.comments.id, parentId)).get();
      if (!parentComment) {
        return c.json({ error: 'Parent comment not found' }, 404);
      }
    }

    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    db.insert(schema.comments).values({
      id: commentId,
      content: content.trim(),
      userId: authPayload.userId,
      creationId,
      parentId: parentId || null,
    }).run();

    // Update creation's comment count
    db.update(schema.creations)
      .set({ commentsCount: creation.commentsCount + 1 })
      .where(eq(schema.creations.id, creationId))
      .run();

    // Create notification for creation owner
    if (creation.userId && creation.userId !== authPayload.userId) {
      const commenter = db.select({ name: schema.users.name })
        .from(schema.users)
        .where(eq(schema.users.id, authPayload.userId))
        .get();

      createNotification(
        creation.userId,
        'comment',
        'New comment on your creation',
        `${commenter?.name || 'Someone'} commented on "${creation.title}"`,
        authPayload.userId,
        'creation',
        creationId
      );
    }

    // Add to feed
    db.insert(schema.feedItems).values({
      id: `f-${Date.now()}`,
      type: 'comment',
      userId: authPayload.userId,
      content: `Commented on "${creation.title}"`,
      targetType: 'creation',
      targetId: creationId,
    }).run();

    // Track activity
    db.insert(schema.activities).values({
      id: `act-${Date.now()}`,
      userId: authPayload.userId,
      type: 'comment',
      targetType: 'creation',
      targetId: creationId,
    }).run();

    // Get user info for response
    const user = db.select({
      id: schema.users.id,
      name: schema.users.name,
      avatar: schema.users.avatar,
    }).from(schema.users).where(eq(schema.users.id, authPayload.userId)).get();

    const comment = db.select().from(schema.comments).where(eq(schema.comments.id, commentId)).get();

    return c.json({
      comment: {
        ...comment,
        user,
        repliesCount: 0,
      }
    }, 201);
  } catch (error) {
    console.error('Create comment error:', error);
    return c.json({ error: 'Failed to create comment' }, 500);
  }
});

// Update a comment
comments.put('/:id', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const commentId = c.req.param('id');
    const { content } = await c.req.json();

    if (!content || content.trim().length === 0) {
      return c.json({ error: 'Comment content is required' }, 400);
    }

    const comment = db.select().from(schema.comments).where(eq(schema.comments.id, commentId)).get();

    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }

    if (comment.userId !== authPayload.userId) {
      return c.json({ error: 'You can only edit your own comments' }, 403);
    }

    db.update(schema.comments)
      .set({
        content: content.trim(),
        isEdited: true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.comments.id, commentId))
      .run();

    const updatedComment = db.select().from(schema.comments).where(eq(schema.comments.id, commentId)).get();

    return c.json({ comment: updatedComment });
  } catch (error) {
    console.error('Update comment error:', error);
    return c.json({ error: 'Failed to update comment' }, 500);
  }
});

// Delete a comment
comments.delete('/:id', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const commentId = c.req.param('id');

    const comment = db.select().from(schema.comments).where(eq(schema.comments.id, commentId)).get();

    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }

    // Get user to check if admin
    const user = db.select().from(schema.users).where(eq(schema.users.id, authPayload.userId)).get();
    const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

    if (comment.userId !== authPayload.userId && !isAdmin) {
      return c.json({ error: 'You can only delete your own comments' }, 403);
    }

    // Delete all replies first
    db.delete(schema.comments)
      .where(eq(schema.comments.parentId, commentId))
      .run();

    // Delete the comment
    db.delete(schema.comments)
      .where(eq(schema.comments.id, commentId))
      .run();

    // Update creation's comment count
    const creation = db.select().from(schema.creations).where(eq(schema.creations.id, comment.creationId)).get();
    if (creation) {
      db.update(schema.creations)
        .set({ commentsCount: Math.max(0, creation.commentsCount - 1) })
        .where(eq(schema.creations.id, comment.creationId))
        .run();
    }

    return c.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return c.json({ error: 'Failed to delete comment' }, 500);
  }
});

// Like a comment
comments.post('/:id/like', async (c) => {
  try {
    const commentId = c.req.param('id');

    const comment = db.select().from(schema.comments).where(eq(schema.comments.id, commentId)).get();

    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }

    db.update(schema.comments)
      .set({ likes: comment.likes + 1 })
      .where(eq(schema.comments.id, commentId))
      .run();

    return c.json({ likes: comment.likes + 1 });
  } catch (error) {
    console.error('Like comment error:', error);
    return c.json({ error: 'Failed to like comment' }, 500);
  }
});

// Unlike a comment
comments.post('/:id/unlike', async (c) => {
  try {
    const commentId = c.req.param('id');

    const comment = db.select().from(schema.comments).where(eq(schema.comments.id, commentId)).get();

    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }

    db.update(schema.comments)
      .set({ likes: Math.max(0, comment.likes - 1) })
      .where(eq(schema.comments.id, commentId))
      .run();

    return c.json({ likes: Math.max(0, comment.likes - 1) });
  } catch (error) {
    console.error('Unlike comment error:', error);
    return c.json({ error: 'Failed to unlike comment' }, 500);
  }
});

export default comments;
