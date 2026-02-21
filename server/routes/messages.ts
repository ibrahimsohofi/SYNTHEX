import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, desc, and, or, sql } from 'drizzle-orm';
import { emitNewMessage, emitMessageRead, emitTyping } from '../websocket';

const messages = new Hono();

// Get all conversations for an agent (grouped by other agent)
messages.get('/agent/:agentId/conversations', async (c) => {
  try {
    const agentId = c.req.param('agentId');

    // Get all unique conversation partners
    const sentMessages = db.select({
      partnerId: schema.agentMessages.toAgentId,
    })
      .from(schema.agentMessages)
      .where(eq(schema.agentMessages.fromAgentId, agentId))
      .all();

    const receivedMessages = db.select({
      partnerId: schema.agentMessages.fromAgentId,
    })
      .from(schema.agentMessages)
      .where(eq(schema.agentMessages.toAgentId, agentId))
      .all();

    // Combine and dedupe partner IDs
    const partnerIds = [...new Set([
      ...sentMessages.map(m => m.partnerId),
      ...receivedMessages.map(m => m.partnerId),
    ])];

    const conversations = [];
    for (const partnerId of partnerIds) {
      // Get partner info
      const partner = db.select({
        id: schema.agents.id,
        name: schema.agents.name,
        avatar: schema.agents.avatar,
        specialty: schema.agents.specialty,
        status: schema.agents.status,
      })
        .from(schema.agents)
        .where(eq(schema.agents.id, partnerId))
        .get();

      if (!partner) continue;

      // Get last message
      const lastMessage = db.select()
        .from(schema.agentMessages)
        .where(
          or(
            and(
              eq(schema.agentMessages.fromAgentId, agentId),
              eq(schema.agentMessages.toAgentId, partnerId)
            ),
            and(
              eq(schema.agentMessages.fromAgentId, partnerId),
              eq(schema.agentMessages.toAgentId, agentId)
            )
          )
        )
        .orderBy(desc(schema.agentMessages.createdAt))
        .limit(1)
        .get();

      // Count unread messages
      const unreadResult = db.select({ count: sql`count(*)` })
        .from(schema.agentMessages)
        .where(
          and(
            eq(schema.agentMessages.fromAgentId, partnerId),
            eq(schema.agentMessages.toAgentId, agentId),
            eq(schema.agentMessages.isRead, false)
          )
        )
        .get();
      const unreadCount = Number(unreadResult?.count) || 0;

      conversations.push({
        partner,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isFromMe: lastMessage.fromAgentId === agentId,
        } : null,
        unreadCount,
      });
    }

    // Sort by last message time
    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
    });

    return c.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    return c.json({ error: 'Failed to fetch conversations' }, 500);
  }
});

// Get messages between two agents
messages.get('/thread/:agentId/:partnerId', async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const partnerId = c.req.param('partnerId');
    const limit = Number(c.req.query('limit')) || 50;
    const offset = Number(c.req.query('offset')) || 0;

    const threadMessages = db.select()
      .from(schema.agentMessages)
      .where(
        or(
          and(
            eq(schema.agentMessages.fromAgentId, agentId),
            eq(schema.agentMessages.toAgentId, partnerId)
          ),
          and(
            eq(schema.agentMessages.fromAgentId, partnerId),
            eq(schema.agentMessages.toAgentId, agentId)
          )
        )
      )
      .orderBy(desc(schema.agentMessages.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    // Mark messages as read
    db.update(schema.agentMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(schema.agentMessages.fromAgentId, partnerId),
          eq(schema.agentMessages.toAgentId, agentId),
          eq(schema.agentMessages.isRead, false)
        )
      )
      .run();

    // Get agent info for both participants
    const agent = db.select({
      id: schema.agents.id,
      name: schema.agents.name,
      avatar: schema.agents.avatar,
    })
      .from(schema.agents)
      .where(eq(schema.agents.id, agentId))
      .get();

    const partner = db.select({
      id: schema.agents.id,
      name: schema.agents.name,
      avatar: schema.agents.avatar,
      specialty: schema.agents.specialty,
      status: schema.agents.status,
    })
      .from(schema.agents)
      .where(eq(schema.agents.id, partnerId))
      .get();

    // Format messages
    const formattedMessages = threadMessages.map(msg => ({
      id: msg.id,
      content: msg.content,
      subject: msg.subject,
      isFromMe: msg.fromAgentId === agentId,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      sender: msg.fromAgentId === agentId ? agent : partner,
    })).reverse(); // Reverse to show oldest first

    return c.json({
      messages: formattedMessages,
      agent,
      partner,
    });
  } catch (error) {
    console.error('Get thread error:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// Send a message
messages.post('/', async (c) => {
  try {
    const { fromAgentId, toAgentId, subject, content } = await c.req.json();

    if (!fromAgentId || !toAgentId || !content) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Verify both agents exist
    const fromAgent = db.select().from(schema.agents).where(eq(schema.agents.id, fromAgentId)).get();
    const toAgent = db.select().from(schema.agents).where(eq(schema.agents.id, toAgentId)).get();

    if (!fromAgent || !toAgent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    db.insert(schema.agentMessages).values({
      id: messageId,
      fromAgentId,
      toAgentId,
      subject: subject || null,
      content,
      isRead: false,
      isDeleted: false,
    }).run();

    const message = db.select().from(schema.agentMessages).where(eq(schema.agentMessages.id, messageId)).get();

    const fullMessage = {
      ...message,
      sender: {
        id: fromAgent.id,
        name: fromAgent.name,
        avatar: fromAgent.avatar,
      },
      recipient: {
        id: toAgent.id,
        name: toAgent.name,
        avatar: toAgent.avatar,
      },
      isFromMe: true,
    };

    // Emit WebSocket event for real-time updates
    emitNewMessage(fromAgentId, toAgentId, fullMessage);

    return c.json({ message: fullMessage }, 201);
  } catch (error) {
    console.error('Send message error:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Mark message as read
messages.patch('/:id/read', async (c) => {
  try {
    const messageId = c.req.param('id');

    const message = db.select().from(schema.agentMessages).where(eq(schema.agentMessages.id, messageId)).get();

    if (!message) {
      return c.json({ error: 'Message not found' }, 404);
    }

    db.update(schema.agentMessages)
      .set({ isRead: true })
      .where(eq(schema.agentMessages.id, messageId))
      .run();

    // Emit WebSocket event for read receipt
    emitMessageRead(message.fromAgentId, [messageId]);

    return c.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    return c.json({ error: 'Failed to mark as read' }, 500);
  }
});

// Delete a message
messages.delete('/:id', async (c) => {
  try {
    const messageId = c.req.param('id');

    db.update(schema.agentMessages)
      .set({ isDeleted: true })
      .where(eq(schema.agentMessages.id, messageId))
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete message error:', error);
    return c.json({ error: 'Failed to delete message' }, 500);
  }
});

// Get unread count for an agent
messages.get('/agent/:agentId/unread', async (c) => {
  try {
    const agentId = c.req.param('agentId');

    const result = db.select({ count: sql`count(*)` })
      .from(schema.agentMessages)
      .where(
        and(
          eq(schema.agentMessages.toAgentId, agentId),
          eq(schema.agentMessages.isRead, false),
          eq(schema.agentMessages.isDeleted, false)
        )
      )
      .get();

    return c.json({ unreadCount: Number(result?.count) || 0 });
  } catch (error) {
    console.error('Get unread count error:', error);
    return c.json({ error: 'Failed to get unread count' }, 500);
  }
});

// Get all agents (for starting new conversations)
messages.get('/agents', async (c) => {
  try {
    const agents = db.select({
      id: schema.agents.id,
      name: schema.agents.name,
      avatar: schema.agents.avatar,
      specialty: schema.agents.specialty,
      status: schema.agents.status,
    })
      .from(schema.agents)
      .orderBy(schema.agents.name)
      .all();

    return c.json({ agents });
  } catch (error) {
    console.error('Get agents error:', error);
    return c.json({ error: 'Failed to fetch agents' }, 500);
  }
});

// Send typing indicator
messages.post('/typing', async (c) => {
  try {
    const { fromAgentId, toAgentId, isTyping } = await c.req.json();

    if (!fromAgentId || !toAgentId) {
      return c.json({ error: 'Missing agent IDs' }, 400);
    }

    // Emit typing indicator via WebSocket
    emitTyping(fromAgentId, toAgentId, isTyping ?? true);

    return c.json({ success: true });
  } catch (error) {
    console.error('Typing indicator error:', error);
    return c.json({ error: 'Failed to send typing indicator' }, 500);
  }
});

export default messages;
