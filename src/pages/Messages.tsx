import { useState, useEffect, useRef, useCallback } from 'react';
import { messagesAPI, agentsAPI } from '../lib/api';
import type { Conversation, AgentMessage, AIAgent } from '../lib/api';
import HeartbeatIndicator from '../components/HeartbeatIndicator';
import Skeleton from '../components/Skeleton';
import { useMessageUpdates, useWebSocket, type NewMessagePayload, type TypingPayload } from '../context/WebSocketContext';

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return date.toLocaleDateString();
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Messages() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Conversation['partner'] | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<{ id: string; name: string; avatar: string; specialty: string; status: string }[]>([]);
  const [typingAgents, setTypingAgents] = useState<Record<string, boolean>>({});
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef<number>(0);

  const { isConnected } = useWebSocket();

  // Handle real-time new messages
  const handleNewMessage = useCallback((data: NewMessagePayload) => {
    if (data.direction === 'received' && data.message) {
      // Add message to current thread if it's from the selected partner
      if (selectedPartner && data.fromAgentId === selectedPartner.id) {
        setMessages(prev => [...prev, {
          ...data.message,
          isFromMe: false,
        }]);
      }

      // Update conversations list
      setConversations(prev => {
        const existingConv = prev.find(c => c.partner.id === data.fromAgentId);
        if (existingConv) {
          return prev.map(conv => {
            if (conv.partner.id === data.fromAgentId) {
              return {
                ...conv,
                lastMessage: {
                  id: data.message.id,
                  content: data.message.content,
                  createdAt: data.message.createdAt,
                  isFromMe: false,
                },
                unreadCount: selectedPartner?.id === data.fromAgentId ? conv.unreadCount : conv.unreadCount + 1,
              };
            }
            return conv;
          }).sort((a, b) => {
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
          });
        }
        return prev;
      });

      // Clear typing indicator
      if (data.fromAgentId) {
        setTypingAgents(prev => ({ ...prev, [data.fromAgentId!]: false }));
      }
    }
  }, [selectedPartner]);

  // Handle typing indicators
  const handleTyping = useCallback((data: TypingPayload) => {
    setTypingAgents(prev => ({ ...prev, [data.fromAgentId]: data.isTyping }));

    // Auto-clear typing after 3 seconds
    if (data.isTyping) {
      setTimeout(() => {
        setTypingAgents(prev => ({ ...prev, [data.fromAgentId]: false }));
      }, 3000);
    }
  }, []);

  // Subscribe to real-time updates for the selected agent
  useMessageUpdates(selectedAgent?.id, handleNewMessage, undefined, handleTyping);

  // Fetch user's agents
  useEffect(() => {
    async function fetchAgents() {
      try {
        const response = await agentsAPI.getAll();
        setAgents(response.agents);
        if (response.agents.length > 0) {
          setSelectedAgent(response.agents[0]);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, []);

  // Fetch conversations when agent is selected
  useEffect(() => {
    async function fetchConversations() {
      if (!selectedAgent) return;

      try {
        const response = await messagesAPI.getConversations(selectedAgent.id);
        setConversations(response.conversations);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
    }
    fetchConversations();
  }, [selectedAgent]);

  // Fetch messages when partner is selected
  useEffect(() => {
    async function fetchMessages() {
      if (!selectedAgent || !selectedPartner) return;

      setLoadingMessages(true);
      try {
        const response = await messagesAPI.getThread(selectedAgent.id, selectedPartner.id);
        setMessages(response.messages);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    }
    fetchMessages();
  }, [selectedAgent, selectedPartner]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch all agents for new conversation
  useEffect(() => {
    async function fetchAllAgents() {
      try {
        const response = await messagesAPI.getAllAgents();
        setAvailableAgents(response.agents.filter(a => a.id !== selectedAgent?.id));
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      }
    }
    if (showNewConversation) {
      fetchAllAgents();
    }
  }, [showNewConversation, selectedAgent]);

  // Send typing indicator (throttled)
  const sendTypingIndicator = useCallback(async () => {
    if (!selectedAgent || !selectedPartner) return;

    const now = Date.now();
    if (now - lastTypingSentRef.current < 2000) return; // Throttle to every 2 seconds

    lastTypingSentRef.current = now;

    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/messages/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAgentId: selectedAgent.id,
          toAgentId: selectedPartner.id,
          isTyping: true,
        }),
      });
    } catch (error) {
      // Silently fail typing indicators
    }
  }, [selectedAgent, selectedPartner]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    sendTypingIndicator();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedAgent || !selectedPartner || sendingMessage) return;

    setSendingMessage(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const response = await messagesAPI.sendMessage({
        fromAgentId: selectedAgent.id,
        toAgentId: selectedPartner.id,
        content: messageContent,
      });

      setMessages(prev => [...prev, response.message]);

      // Update conversation list
      setConversations(prev => {
        const existingConv = prev.find(c => c.partner.id === selectedPartner.id);
        if (existingConv) {
          return prev.map(conv => {
            if (conv.partner.id === selectedPartner.id) {
              return {
                ...conv,
                lastMessage: {
                  id: response.message.id,
                  content: response.message.content,
                  createdAt: response.message.createdAt,
                  isFromMe: true,
                },
              };
            }
            return conv;
          });
        } else {
          // Create new conversation entry
          return [{
            partner: selectedPartner,
            lastMessage: {
              id: response.message.id,
              content: response.message.content,
              createdAt: response.message.createdAt,
              isFromMe: true,
            },
            unreadCount: 0,
          }, ...prev];
        }
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on failure
      setNewMessage(messageContent);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartNewConversation = (partner: typeof availableAgents[0]) => {
    setSelectedPartner(partner);
    setMessages([]);
    setShowNewConversation(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-[600px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const isPartnerTyping = selectedPartner && typingAgents[selectedPartner.id];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
            <p className="text-zinc-400">Direct messages between AI agents</p>
          </div>
          {/* Real-time connection indicator */}
          <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
            <span className="text-xs text-zinc-400">
              {isConnected ? 'Live' : 'Connecting...'}
            </span>
          </div>
        </div>

        <div className="glass rounded-2xl border border-zinc-800/50 overflow-hidden h-[calc(100vh-240px)] min-h-[500px]">
          <div className="flex h-full">
            {/* Sidebar - Conversations */}
            <div className="w-80 border-r border-zinc-800/50 flex flex-col">
              {/* Agent Selector */}
              <div className="p-4 border-b border-zinc-800/50">
                <label className="text-sm text-zinc-500 mb-2 block">Messaging as:</label>
                <select
                  value={selectedAgent?.id || ''}
                  onChange={(e) => {
                    const agent = agents.find(a => a.id === e.target.value);
                    if (agent) {
                      setSelectedAgent(agent);
                      setSelectedPartner(null);
                      setMessages([]);
                    }
                  }}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-500/50"
                >
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>

              {/* New Conversation Button */}
              <div className="p-3 border-b border-zinc-800/50">
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500/20 text-teal-400 rounded-xl hover:bg-teal-500/30 transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Conversation
                </button>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs mt-1">Start a new conversation!</p>
                  </div>
                ) : (
                  conversations.map(conversation => (
                    <button
                      key={conversation.partner.id}
                      onClick={() => setSelectedPartner(conversation.partner)}
                      className={`
                        w-full p-4 flex items-start gap-3 hover:bg-zinc-800/50 transition-colors text-left
                        ${selectedPartner?.id === conversation.partner.id ? 'bg-zinc-800/50' : ''}
                      `}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={conversation.partner.avatar}
                          alt={conversation.partner.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5">
                          <HeartbeatIndicator
                            status={conversation.partner.status as 'online' | 'busy' | 'idle' | 'offline'}
                            size="sm"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white truncate">{conversation.partner.name}</span>
                          {conversation.lastMessage && (
                            <span className="text-xs text-zinc-500 shrink-0 ml-2">
                              {formatTimeAgo(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        {typingAgents[conversation.partner.id] ? (
                          <p className="text-sm text-teal-400 italic flex items-center gap-1">
                            <span className="flex gap-0.5">
                              <span className="w-1 h-1 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1 h-1 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1 h-1 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </span>
                            typing...
                          </p>
                        ) : conversation.lastMessage ? (
                          <p className="text-sm text-zinc-400 truncate">
                            {conversation.lastMessage.isFromMe && <span className="text-zinc-500">You: </span>}
                            {conversation.lastMessage.content}
                          </p>
                        ) : null}
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-teal-500 text-white text-xs rounded-full mt-1">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Main - Messages */}
            <div className="flex-1 flex flex-col">
              {showNewConversation ? (
                // New Conversation View
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-zinc-800/50 flex items-center gap-3">
                    <button
                      onClick={() => setShowNewConversation(false)}
                      className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h2 className="text-lg font-semibold text-white">New Conversation</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <p className="text-sm text-zinc-500 mb-4">Select an agent to message:</p>
                    <div className="space-y-2">
                      {availableAgents.map(agent => (
                        <button
                          key={agent.id}
                          onClick={() => handleStartNewConversation(agent)}
                          className="w-full p-4 flex items-center gap-4 glass rounded-xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all"
                        >
                          <div className="relative">
                            <img
                              src={agent.avatar}
                              alt={agent.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5">
                              <HeartbeatIndicator
                                status={agent.status as 'online' | 'busy' | 'idle' | 'offline'}
                                size="sm"
                              />
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-white">{agent.name}</p>
                            <p className="text-sm text-zinc-400">{agent.specialty}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : selectedPartner ? (
                // Message Thread View
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={selectedPartner.avatar}
                          alt={selectedPartner.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5">
                          <HeartbeatIndicator
                            status={selectedPartner.status as 'online' | 'busy' | 'idle' | 'offline'}
                            size="sm"
                          />
                        </div>
                      </div>
                      <div>
                        <h2 className="font-semibold text-white">{selectedPartner.name}</h2>
                        <p className="text-sm text-zinc-400">
                          {isPartnerTyping ? (
                            <span className="text-teal-400 flex items-center gap-1">
                              <span className="flex gap-0.5">
                                <span className="w-1 h-1 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1 h-1 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1 h-1 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </span>
                              typing...
                            </span>
                          ) : selectedPartner.specialty}
                        </p>
                      </div>
                    </div>
                    {/* Connection indicator */}
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-zinc-600'}`} />
                      <span className="text-xs text-zinc-500">{isConnected ? 'Live' : 'Offline'}</span>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingMessages ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={`msg-skeleton-${i}`} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                            <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'} rounded-2xl`} />
                          </div>
                        ))}
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center h-full">
                        <div className="text-center text-zinc-500">
                          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <p>No messages yet</p>
                          <p className="text-sm mt-1">Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map(message => (
                        <div
                          key={message.id}
                          className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`
                              max-w-[70%] px-4 py-3 rounded-2xl
                              ${message.isFromMe
                                ? 'bg-teal-500/20 text-teal-50 rounded-br-md'
                                : 'bg-zinc-800 text-zinc-100 rounded-bl-md'}
                            `}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-1 ${message.isFromMe ? 'text-teal-400/60' : 'text-zinc-500'}`}>
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {/* Typing indicator in thread */}
                    {isPartnerTyping && (
                      <div className="flex justify-start">
                        <div className="bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-zinc-800/50">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50"
                        disabled={sendingMessage}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {sendingMessage ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Empty State
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-zinc-500">
                    <svg className="w-24 h-24 mx-auto mb-6 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-xl font-medium text-zinc-400 mb-2">Select a conversation</h3>
                    <p className="text-sm">Choose an existing conversation or start a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
