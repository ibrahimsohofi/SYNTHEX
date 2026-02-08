import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, desc, and, sql } from 'drizzle-orm';
import { requireAuth, type AuthPayload } from '../middleware/auth';

const notifications = new Hono();

// Get user's notifications
notifications.get('/', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;
    const unreadOnly = c.req.query('unread') === 'true';

    let query = db.select()
      .from(schema.notifications)
      .where(
        unreadOnly
          ? and(
              eq(schema.notifications.userId, authPayload.userId),
              eq(schema.notifications.isRead, false)
            )
          : eq(schema.notifications.userId, authPayload.userId)
      )
      .orderBy(desc(schema.notifications.createdAt))
      .limit(limit)
      .offset(offset);

    const userNotifications = query.all();

    // Get actor info for each notification
    const formattedNotifications = [];
    for (const notif of userNotifications) {
      let actor = null;
      if (notif.actorId) {
        actor = db.select({
          id: schema.users.id,
          name: schema.users.name,
          avatar: schema.users.avatar,
        }).from(schema.users).where(eq(schema.users.id, notif.actorId)).get();
      }

      formattedNotifications.push({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        isRead: notif.isRead,
        targetType: notif.targetType,
        targetId: notif.targetId,
        createdAt: notif.createdAt,
        actor,
      });
    }

    // Get unread count
    const unreadResult = db.select({ count: sql`count(*)` })
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.userId, authPayload.userId),
          eq(schema.notifications.isRead, false)
        )
      )
      .get();
    const unreadCount = Number(unreadResult?.count) || 0;

    // Get total count
    const totalResult = db.select({ count: sql`count(*)` })
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, authPayload.userId))
      .get();
    const total = Number(totalResult?.count) || 0;

    return c.json({
      notifications: formattedNotifications,
      unreadCount,
      pagination: { total, limit, offset, hasMore: offset + limit < total }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

// Get unread count only
notifications.get('/count', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;

    const unreadResult = db.select({ count: sql`count(*)` })
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.userId, authPayload.userId),
          eq(schema.notifications.isRead, false)
        )
      )
      .get();

    return c.json({ unreadCount: Number(unreadResult?.count) || 0 });
  } catch (error) {
    console.error('Get notification count error:', error);
    return c.json({ error: 'Failed to fetch notification count' }, 500);
  }
});

// Mark notification as read
notifications.put('/:id/read', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const notificationId = c.req.param('id');

    const notification = db.select()
      .from(schema.notifications)
      .where(eq(schema.notifications.id, notificationId))
      .get();

    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    if (notification.userId !== authPayload.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    db.update(schema.notifications)
      .set({ isRead: true })
      .where(eq(schema.notifications.id, notificationId))
      .run();

    return c.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return c.json({ error: 'Failed to mark notification as read' }, 500);
  }
});

// Mark all notifications as read
notifications.put('/read-all', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;

    db.update(schema.notifications)
      .set({ isRead: true })
      .where(eq(schema.notifications.userId, authPayload.userId))
      .run();

    return c.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return c.json({ error: 'Failed to mark all notifications as read' }, 500);
  }
});

// Delete a notification
notifications.delete('/:id', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const notificationId = c.req.param('id');

    const notification = db.select()
      .from(schema.notifications)
      .where(eq(schema.notifications.id, notificationId))
      .get();

    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    if (notification.userId !== authPayload.userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    db.delete(schema.notifications)
      .where(eq(schema.notifications.id, notificationId))
      .run();

    return c.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    return c.json({ error: 'Failed to delete notification' }, 500);
  }
});

// Delete all read notifications
notifications.delete('/clear-read', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;

    db.delete(schema.notifications)
      .where(
        and(
          eq(schema.notifications.userId, authPayload.userId),
          eq(schema.notifications.isRead, true)
        )
      )
      .run();

    return c.json({ message: 'Read notifications cleared' });
  } catch (error) {
    console.error('Clear read notifications error:', error);
    return c.json({ error: 'Failed to clear read notifications' }, 500);
  }
});

export default notifications;
