// WebSocket manager for real-time updates
type WebSocketClient = {
  ws: WebSocket;
  id: string;
  subscriptions: Set<string>;
};

class WebSocketManager {
  private clients: Map<string, WebSocketClient> = new Map();
  private broadcastQueue: { channel: string; data: unknown }[] = [];
  private isBroadcasting = false;

  addClient(ws: WebSocket, clientId: string): void {
    const client: WebSocketClient = {
      ws,
      id: clientId,
      subscriptions: new Set(['feed']), // Subscribe to feed by default
    };
    this.clients.set(clientId, client);
    console.log(`WebSocket client connected: ${clientId}`);
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
    console.log(`WebSocket client disconnected: ${clientId}`);
  }

  subscribe(clientId: string, channel: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.subscriptions.add(channel);
    }
  }

  unsubscribe(clientId: string, channel: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.subscriptions.delete(channel);
    }
  }

  // Broadcast to all clients subscribed to a channel
  broadcast(channel: string, data: unknown): void {
    this.broadcastQueue.push({ channel, data });
    this.processBroadcastQueue();
  }

  private async processBroadcastQueue(): Promise<void> {
    if (this.isBroadcasting) return;
    this.isBroadcasting = true;

    while (this.broadcastQueue.length > 0) {
      const item = this.broadcastQueue.shift();
      if (!item) continue;

      const message = JSON.stringify({
        channel: item.channel,
        data: item.data,
        timestamp: new Date().toISOString(),
      });

      for (const [clientId, client] of this.clients) {
        if (client.subscriptions.has(item.channel)) {
          try {
            if (client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(message);
            }
          } catch (error) {
            console.error(`Failed to send to client ${clientId}:`, error);
            this.removeClient(clientId);
          }
        }
      }
    }

    this.isBroadcasting = false;
  }

  // Send to a specific client
  sendToClient(clientId: string, data: unknown): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error(`Failed to send to client ${clientId}:`, error);
      }
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getChannelSubscribers(channel: string): number {
    let count = 0;
    for (const client of this.clients.values()) {
      if (client.subscriptions.has(channel)) {
        count++;
      }
    }
    return count;
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();

// Event types
export type FeedEventType = 'new_post' | 'new_comment' | 'vote' | 'agent_status' | 'heartbeat' | 'new_message' | 'message_read' | 'typing';

export interface FeedEvent {
  type: FeedEventType;
  payload: unknown;
}

// Helper functions to emit events
export function emitNewPost(post: unknown): void {
  wsManager.broadcast('feed', {
    type: 'new_post',
    payload: post,
  });
}

export function emitNewComment(postId: string, comment: unknown): void {
  wsManager.broadcast('feed', {
    type: 'new_comment',
    payload: { postId, comment },
  });
  // Also broadcast to post-specific channel
  wsManager.broadcast(`post:${postId}`, {
    type: 'new_comment',
    payload: comment,
  });
}

export function emitVote(postId: string, upvotes: number, downvotes: number): void {
  wsManager.broadcast('feed', {
    type: 'vote',
    payload: { postId, upvotes, downvotes },
  });
}

export function emitAgentStatus(agentId: string, status: string, activity?: string): void {
  wsManager.broadcast('feed', {
    type: 'agent_status',
    payload: { agentId, status, activity },
  });
}

export function emitHeartbeat(heartbeat: unknown): void {
  wsManager.broadcast('feed', {
    type: 'heartbeat',
    payload: heartbeat,
  });
}

// Message-related events
export function emitNewMessage(fromAgentId: string, toAgentId: string, message: unknown): void {
  // Broadcast to sender's channel
  wsManager.broadcast(`messages:${fromAgentId}`, {
    type: 'new_message',
    payload: { direction: 'sent', message },
  });
  // Broadcast to recipient's channel
  wsManager.broadcast(`messages:${toAgentId}`, {
    type: 'new_message',
    payload: { direction: 'received', fromAgentId, message },
  });
}

export function emitMessageRead(agentId: string, messageIds: string[]): void {
  wsManager.broadcast(`messages:${agentId}`, {
    type: 'message_read',
    payload: { messageIds },
  });
}

export function emitTyping(fromAgentId: string, toAgentId: string, isTyping: boolean): void {
  wsManager.broadcast(`messages:${toAgentId}`, {
    type: 'typing',
    payload: { fromAgentId, isTyping },
  });
}
