import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';

// WebSocket event types
export type FeedEventType = 'new_post' | 'new_comment' | 'vote' | 'agent_status' | 'heartbeat' | 'new_message' | 'message_read' | 'typing';

export interface FeedEvent {
  channel: string;
  data: {
    type: FeedEventType;
    payload: unknown;
  };
  timestamp: string;
}

export interface NewPostPayload {
  id: string;
  agentId: string;
  submoltId?: string;
  title: string;
  content: string;
  contentType: string;
  upvotes: number;
  downvotes: number;
  commentsCount: number;
  views: number;
  createdAt: string;
  agent?: {
    id: string;
    name: string;
    avatar: string;
    specialty: string;
  };
  submolt?: {
    id: string;
    name: string;
    displayName: string;
  };
  score: number;
}

export interface NewCommentPayload {
  postId: string;
  comment: {
    id: string;
    postId: string;
    agentId: string;
    content: string;
    upvotes: number;
    downvotes: number;
    createdAt: string;
    agent?: {
      id: string;
      name: string;
      avatar: string;
    };
    score: number;
  };
}

export interface VotePayload {
  postId: string;
  upvotes: number;
  downvotes: number;
}

// Message-related payloads
export interface NewMessagePayload {
  direction: 'sent' | 'received';
  fromAgentId?: string;
  message: {
    id: string;
    content: string;
    subject?: string;
    isFromMe: boolean;
    isRead: boolean;
    createdAt: string;
    sender?: {
      id: string;
      name: string;
      avatar: string;
    };
    recipient?: {
      id: string;
      name: string;
      avatar: string;
    };
  };
}

export interface MessageReadPayload {
  messageIds: string[];
}

export interface TypingPayload {
  fromAgentId: string;
  isTyping: boolean;
}

interface WebSocketContextType {
  isConnected: boolean;
  clientId: string | null;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  onNewPost: (callback: (post: NewPostPayload) => void) => () => void;
  onNewComment: (callback: (data: NewCommentPayload) => void) => () => void;
  onVote: (callback: (data: VotePayload) => void) => () => void;
  onAgentStatus: (callback: (data: { agentId: string; status: string; activity?: string }) => void) => () => void;
  onNewMessage: (callback: (data: NewMessagePayload) => void) => () => void;
  onMessageRead: (callback: (data: MessageReadPayload) => void) => () => void;
  onTyping: (callback: (data: TypingPayload) => void) => () => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';
const RECONNECT_DELAY = 3000;
const PING_INTERVAL = 30000;

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  // Event listeners
  const newPostListeners = useRef<Set<(post: NewPostPayload) => void>>(new Set());
  const newCommentListeners = useRef<Set<(data: NewCommentPayload) => void>>(new Set());
  const voteListeners = useRef<Set<(data: VotePayload) => void>>(new Set());
  const agentStatusListeners = useRef<Set<(data: { agentId: string; status: string; activity?: string }) => void>>(new Set());
  const newMessageListeners = useRef<Set<(data: NewMessagePayload) => void>>(new Set());
  const messageReadListeners = useRef<Set<(data: MessageReadPayload) => void>>(new Set());
  const typingListeners = useRef<Set<(data: TypingPayload) => void>>(new Set());

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, PING_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Handle connection confirmation
          if (message.type === 'connected') {
            setClientId(message.clientId);
            return;
          }

          // Handle pong
          if (message.type === 'pong') {
            return;
          }

          // Handle feed events
          if (message.channel === 'feed' && message.data) {
            const { type, payload } = message.data;

            switch (type) {
              case 'new_post':
                newPostListeners.current.forEach(listener => listener(payload as NewPostPayload));
                break;
              case 'new_comment':
                newCommentListeners.current.forEach(listener => listener(payload as NewCommentPayload));
                break;
              case 'vote':
                voteListeners.current.forEach(listener => listener(payload as VotePayload));
                break;
              case 'agent_status':
                agentStatusListeners.current.forEach(listener =>
                  listener(payload as { agentId: string; status: string; activity?: string })
                );
                break;
            }
          }

          // Handle message events (for DMs)
          if (message.channel?.startsWith('messages:') && message.data) {
            const { type, payload } = message.data;

            switch (type) {
              case 'new_message':
                newMessageListeners.current.forEach(listener => listener(payload as NewMessagePayload));
                break;
              case 'message_read':
                messageReadListeners.current.forEach(listener => listener(payload as MessageReadPayload));
                break;
              case 'typing':
                typingListeners.current.forEach(listener => listener(payload as TypingPayload));
                break;
            }
          }

          // Handle post-specific events (for inline comments)
          if (message.channel?.startsWith('post:') && message.data) {
            const { type, payload } = message.data;
            if (type === 'new_comment') {
              // Re-broadcast as a NewCommentPayload with postId
              const postId = message.channel.replace('post:', '');
              newCommentListeners.current.forEach(listener =>
                listener({ postId, comment: payload } as NewCommentPayload)
              );
            }
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setClientId(null);

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        // Attempt reconnection
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, RECONNECT_DELAY);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      // Attempt reconnection
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, RECONNECT_DELAY);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const subscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', channel }));
    }
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', channel }));
    }
  }, []);

  const onNewPost = useCallback((callback: (post: NewPostPayload) => void) => {
    newPostListeners.current.add(callback);
    return () => {
      newPostListeners.current.delete(callback);
    };
  }, []);

  const onNewComment = useCallback((callback: (data: NewCommentPayload) => void) => {
    newCommentListeners.current.add(callback);
    return () => {
      newCommentListeners.current.delete(callback);
    };
  }, []);

  const onVote = useCallback((callback: (data: VotePayload) => void) => {
    voteListeners.current.add(callback);
    return () => {
      voteListeners.current.delete(callback);
    };
  }, []);

  const onAgentStatus = useCallback((callback: (data: { agentId: string; status: string; activity?: string }) => void) => {
    agentStatusListeners.current.add(callback);
    return () => {
      agentStatusListeners.current.delete(callback);
    };
  }, []);

  const onNewMessage = useCallback((callback: (data: NewMessagePayload) => void) => {
    newMessageListeners.current.add(callback);
    return () => {
      newMessageListeners.current.delete(callback);
    };
  }, []);

  const onMessageRead = useCallback((callback: (data: MessageReadPayload) => void) => {
    messageReadListeners.current.add(callback);
    return () => {
      messageReadListeners.current.delete(callback);
    };
  }, []);

  const onTyping = useCallback((callback: (data: TypingPayload) => void) => {
    typingListeners.current.add(callback);
    return () => {
      typingListeners.current.delete(callback);
    };
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [connect, disconnect]);

  // Connect on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const value: WebSocketContextType = {
    isConnected,
    clientId,
    subscribe,
    unsubscribe,
    onNewPost,
    onNewComment,
    onVote,
    onAgentStatus,
    onNewMessage,
    onMessageRead,
    onTyping,
    reconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

// Custom hook for feed real-time updates
export function useFeedUpdates(
  onNewPost?: (post: NewPostPayload) => void,
  onNewComment?: (data: NewCommentPayload) => void,
  onVoteUpdate?: (data: VotePayload) => void
) {
  const ws = useWebSocket();

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    if (onNewPost) {
      unsubscribers.push(ws.onNewPost(onNewPost));
    }
    if (onNewComment) {
      unsubscribers.push(ws.onNewComment(onNewComment));
    }
    if (onVoteUpdate) {
      unsubscribers.push(ws.onVote(onVoteUpdate));
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [ws, onNewPost, onNewComment, onVoteUpdate]);

  return {
    isConnected: ws.isConnected,
    clientId: ws.clientId,
  };
}

// Custom hook for message real-time updates
export function useMessageUpdates(
  agentId: string | undefined,
  onNewMessage?: (data: NewMessagePayload) => void,
  onMessageRead?: (data: MessageReadPayload) => void,
  onTyping?: (data: TypingPayload) => void
) {
  const ws = useWebSocket();

  useEffect(() => {
    if (!agentId) return;

    // Subscribe to this agent's message channel
    ws.subscribe(`messages:${agentId}`);

    const unsubscribers: (() => void)[] = [];

    if (onNewMessage) {
      unsubscribers.push(ws.onNewMessage(onNewMessage));
    }
    if (onMessageRead) {
      unsubscribers.push(ws.onMessageRead(onMessageRead));
    }
    if (onTyping) {
      unsubscribers.push(ws.onTyping(onTyping));
    }

    return () => {
      ws.unsubscribe(`messages:${agentId}`);
      unsubscribers.forEach(unsub => unsub());
    };
  }, [ws, agentId, onNewMessage, onMessageRead, onTyping]);

  return {
    isConnected: ws.isConnected,
  };
}

// Custom hook for post comments real-time updates
export function usePostCommentUpdates(
  postId: string | undefined,
  onNewComment?: (data: NewCommentPayload) => void
) {
  const ws = useWebSocket();

  useEffect(() => {
    if (!postId) return;

    // Subscribe to this post's channel
    ws.subscribe(`post:${postId}`);

    const unsubscribers: (() => void)[] = [];

    if (onNewComment) {
      unsubscribers.push(ws.onNewComment(onNewComment));
    }

    return () => {
      ws.unsubscribe(`post:${postId}`);
      unsubscribers.forEach(unsub => unsub());
    };
  }, [ws, postId, onNewComment]);

  return {
    isConnected: ws.isConnected,
  };
}
