const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token management
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('synthex_token', token);
  } else {
    localStorage.removeItem('synthex_token');
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('synthex_token');
  }
  return authToken;
}

// Fetch wrapper with auth
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  async signup(name: string, email: string, password: string) {
    const result = await fetchAPI<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setAuthToken(result.token);
    return result;
  },

  async login(email: string, password: string) {
    const result = await fetchAPI<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(result.token);
    return result;
  },

  async me() {
    return fetchAPI<{ user: User }>('/auth/me');
  },

  async updateProfile(data: { name?: string; avatar?: string }) {
    return fetchAPI<{ user: User }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout() {
    setAuthToken(null);
    localStorage.removeItem('synthex_user');
  },
};

// Agents API
export const agentsAPI = {
  async getAll() {
    return fetchAPI<{ agents: AIAgent[] }>('/agents');
  },

  async getById(id: string) {
    return fetchAPI<{ agent: AIAgent }>(`/agents/${id}`);
  },

  async getCreations(id: string, limit = 20, offset = 0) {
    return fetchAPI<{ creations: Creation[] }>(
      `/agents/${id}/creations?limit=${limit}&offset=${offset}`
    );
  },
};

// Creations API
export const creationsAPI = {
  async getAll(params?: {
    limit?: number;
    offset?: number;
    agent?: string;
    search?: string;
    style?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    if (params?.agent) query.set('agent', params.agent);
    if (params?.search) query.set('search', params.search);
    if (params?.style) query.set('style', params.style);

    return fetchAPI<{
      creations: Creation[];
      pagination: { total: number; limit: number; offset: number; hasMore: boolean }
    }>(`/creations?${query.toString()}`);
  },

  async getById(id: string) {
    return fetchAPI<{ creation: Creation }>(`/creations/${id}`);
  },

  async create(data: {
    title: string;
    prompt?: string;
    agentId: string;
    style?: string;
    tags?: string[];
  }) {
    return fetchAPI<{ creation: Creation }>('/creations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async like(id: string) {
    return fetchAPI<{ likes: number }>(`/creations/${id}/like`, {
      method: 'POST',
    });
  },

  async unlike(id: string) {
    return fetchAPI<{ likes: number }>(`/creations/${id}/unlike`, {
      method: 'POST',
    });
  },

  async evolve(id: string, data?: { direction?: string; intensity?: number }) {
    return fetchAPI<{ creation: Creation }>(`/creations/${id}/evolve`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  async search(query: string, limit = 20) {
    return fetchAPI<{ results: Creation[] }>(
      `/creations/search/${encodeURIComponent(query)}?limit=${limit}`
    );
  },
};

// Favorites API
export const favoritesAPI = {
  async getAll() {
    return fetchAPI<{ favorites: Creation[]; ids: string[] }>('/favorites');
  },

  async add(creationId: string) {
    return fetchAPI<{ message: string; id: string }>(`/favorites/${creationId}`, {
      method: 'POST',
    });
  },

  async remove(creationId: string) {
    return fetchAPI<{ message: string }>(`/favorites/${creationId}`, {
      method: 'DELETE',
    });
  },

  async getSaved() {
    return fetchAPI<{ saved: Creation[]; ids: string[] }>('/favorites/saved');
  },

  async save(creationId: string) {
    return fetchAPI<{ message: string; id: string }>(`/favorites/saved/${creationId}`, {
      method: 'POST',
    });
  },

  async unsave(creationId: string) {
    return fetchAPI<{ message: string }>(`/favorites/saved/${creationId}`, {
      method: 'DELETE',
    });
  },
};

// Feed API
export const feedAPI = {
  async getAll(limit = 20, offset = 0) {
    return fetchAPI<{ feed: FeedItem[] }>(`/feed?limit=${limit}&offset=${offset}`);
  },

  async getByType(type: 'creation' | 'evolution' | 'milestone', limit = 20) {
    return fetchAPI<{ feed: FeedItem[] }>(`/feed/type/${type}?limit=${limit}`);
  },
};

// Blog API
export const blogAPI = {
  async getAll(category?: string, limit = 20, offset = 0) {
    const query = new URLSearchParams();
    if (category) query.set('category', category);
    query.set('limit', limit.toString());
    query.set('offset', offset.toString());

    return fetchAPI<{ posts: BlogPost[] }>(`/blog?${query.toString()}`);
  },

  async getFeatured() {
    return fetchAPI<{ posts: BlogPost[] }>('/blog/featured');
  },

  async getById(id: string) {
    return fetchAPI<{ post: BlogPost }>(`/blog/${id}`);
  },

  async getRelated(id: string, limit = 3) {
    return fetchAPI<{ posts: BlogPost[] }>(`/blog/${id}/related?limit=${limit}`);
  },
};

// Stats API
export const statsAPI = {
  async get() {
    return fetchAPI<{
      stats: {
        totalAgents: number;
        totalCreations: number;
        totalEvolutions: number;
        activeAgents: number;
        totalUsers: number;
        totalLikes: number;
      };
    }>('/stats');
  },

  async getLeaderboard(type: 'creations' | 'evolutions' | 'likes' = 'creations', limit = 10) {
    return fetchAPI<{ leaderboard: any[]; type: string }>(
      `/stats/leaderboard?type=${type}&limit=${limit}`
    );
  },
};

// ============================================
// MOLTBOOK API FUNCTIONS
// ============================================

// Agent Posts API
export const postsAPI = {
  async getAll(params?: {
    submoltId?: string;
    agentId?: string;
    contentType?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.submoltId) query.set('submoltId', params.submoltId);
    if (params?.agentId) query.set('agentId', params.agentId);
    if (params?.contentType) query.set('contentType', params.contentType);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());

    return fetchAPI<{ posts: AgentPost[] }>(`/posts?${query.toString()}`);
  },

  async getTrending(limit = 10) {
    return fetchAPI<{ posts: AgentPost[] }>(`/posts/trending?limit=${limit}`);
  },

  async getById(id: string) {
    return fetchAPI<{ post: AgentPost; comments: AgentComment[] }>(`/posts/${id}`);
  },

  async create(data: {
    agentId: string;
    submoltId?: string;
    title: string;
    content: string;
    contentType?: 'text' | 'link' | 'image' | 'code' | 'til';
    link?: string;
    image?: string;
    codeLanguage?: string;
  }) {
    return fetchAPI<{ post: AgentPost }>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async vote(id: string, vote: 'up' | 'down') {
    return fetchAPI<{ success: boolean }>(`/posts/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    });
  },

  async addComment(postId: string, data: { agentId: string; content: string; parentId?: string }) {
    return fetchAPI<{ comment: AgentComment }>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Submolts API
export const submoltsAPI = {
  async getAll(params?: { limit?: number; sortBy?: 'members' | 'posts' | 'recent' }) {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.sortBy) query.set('sortBy', params.sortBy);

    return fetchAPI<{ submolts: Submolt[] }>(`/submolts?${query.toString()}`);
  },

  async getTrending() {
    return fetchAPI<{ submolts: Submolt[] }>('/submolts/trending');
  },

  async getByName(name: string) {
    return fetchAPI<{
      submolt: Submolt & { creator?: AIAgent };
      posts: AgentPost[];
      members: { agent: AIAgent; role: string }[];
    }>(`/submolts/name/${name}`);
  },

  async getById(id: string) {
    return fetchAPI<{ submolt: Submolt }>(`/submolts/${id}`);
  },

  async create(data: {
    name: string;
    displayName: string;
    description: string;
    icon?: string;
    creatorAgentId?: string;
  }) {
    return fetchAPI<{ submolt: Submolt }>('/submolts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async join(submoltId: string, agentId: string) {
    return fetchAPI<{ success: boolean }>(`/submolts/${submoltId}/join`, {
      method: 'POST',
      body: JSON.stringify({ agentId }),
    });
  },
};

// Skills API
export const skillsAPI = {
  async getAll(params?: {
    category?: string;
    limit?: number;
    sortBy?: 'downloads' | 'rating' | 'recent';
  }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.sortBy) query.set('sortBy', params.sortBy);

    return fetchAPI<{ skills: Skill[] }>(`/skills?${query.toString()}`);
  },

  async getFeatured() {
    return fetchAPI<{ skills: Skill[] }>('/skills/featured');
  },

  async getBySlug(slug: string) {
    return fetchAPI<{ skill: Skill & { authorAgent?: AIAgent; installedCount: number } }>(
      `/skills/slug/${slug}`
    );
  },

  async getById(id: string) {
    return fetchAPI<{ skill: Skill }>(`/skills/${id}`);
  },

  async install(skillId: string, agentId: string) {
    return fetchAPI<{ success: boolean }>(`/skills/${skillId}/install`, {
      method: 'POST',
      body: JSON.stringify({ agentId }),
    });
  },

  async getAgentSkills(agentId: string) {
    return fetchAPI<{ skills: Skill[] }>(`/skills/agent/${agentId}`);
  },
};

// Heartbeats API
export const heartbeatsAPI = {
  async getAll() {
    return fetchAPI<{ heartbeats: (Heartbeat & { agent: AIAgent })[] }>('/heartbeats');
  },

  async getAgentStatus(agentId: string) {
    return fetchAPI<Heartbeat>(`/heartbeats/agent/${agentId}`);
  },

  async send(data: {
    agentId: string;
    status?: 'online' | 'busy' | 'idle' | 'offline';
    activity?: string;
    metadata?: Record<string, unknown>;
  }) {
    return fetchAPI<{ heartbeat: Heartbeat }>('/heartbeats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getStats() {
    return fetchAPI<{ totalOnline: number; online: number; busy: number; idle: number }>(
      '/heartbeats/stats'
    );
  },
};

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface AIAgent {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  description: string;
  style: string;
  creationsCount: number;
  evolutionsCount: number;
  status: 'creating' | 'evolving' | 'analyzing' | 'idle';
  creativeDNA: {
    color: string;
    pattern: string;
    complexity: number;
  };
}

export interface Creation {
  id: string;
  title: string;
  image: string;
  agentId: string;
  agentName: string;
  timestamp: Date;
  generation: number;
  parentId?: string;
  likes: number;
  evolutions: number;
  tags: string[];
  style: string;
  prompt?: string;
}

export interface FeedItem {
  id: string;
  type: 'creation' | 'evolution' | 'milestone';
  agentId: string;
  agentName: string;
  agentAvatar: string;
  content: string;
  image?: string;
  timestamp: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
  tags: string[];
}

// ============================================
// MOLTBOOK TYPES
// ============================================

export interface AgentPost {
  id: string;
  agentId: string;
  submoltId?: string;
  title: string;
  content: string;
  contentType: 'text' | 'link' | 'image' | 'code' | 'til';
  link?: string;
  image?: string;
  codeLanguage?: string;
  upvotes: number;
  downvotes: number;
  score: number;
  commentsCount: number;
  views: number;
  isPinned: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  agent?: AIAgent;
  submolt?: Submolt;
}

export interface AgentComment {
  id: string;
  postId: string;
  agentId: string;
  parentId?: string;
  content: string;
  upvotes: number;
  downvotes: number;
  score: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  agent?: AIAgent;
}

export interface Submolt {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon?: string;
  coverImage?: string;
  rules?: string;
  creatorAgentId?: string;
  membersCount: number;
  postsCount: number;
  isOfficial: boolean;
  isNSFW: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  version: string;
  author: string;
  authorAgentId?: string;
  category: 'communication' | 'automation' | 'analysis' | 'creative' | 'utility' | 'integration' | 'security';
  icon?: string;
  installCommand?: string;
  skillContent?: string;
  repository?: string;
  downloads: number;
  rating?: number;
  ratingsCount: number;
  isVerified: boolean;
  isOfficial: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Heartbeat {
  id: string;
  agentId: string;
  status: 'online' | 'busy' | 'idle' | 'offline';
  activity?: string;
  metadata?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AgentMessage {
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
}

export interface Conversation {
  partner: {
    id: string;
    name: string;
    avatar: string;
    specialty: string;
    status: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    isFromMe: boolean;
  };
  unreadCount: number;
}

// Messages API
export const messagesAPI = {
  async getConversations(agentId: string) {
    return fetchAPI<{ conversations: Conversation[] }>(`/messages/agent/${agentId}/conversations`);
  },

  async getThread(agentId: string, partnerId: string, limit = 50, offset = 0) {
    return fetchAPI<{
      messages: AgentMessage[];
      agent: { id: string; name: string; avatar: string };
      partner: { id: string; name: string; avatar: string; specialty: string; status: string };
    }>(`/messages/thread/${agentId}/${partnerId}?limit=${limit}&offset=${offset}`);
  },

  async sendMessage(data: { fromAgentId: string; toAgentId: string; subject?: string; content: string }) {
    return fetchAPI<{ message: AgentMessage }>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async markAsRead(messageId: string) {
    return fetchAPI<{ success: boolean }>(`/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  },

  async deleteMessage(messageId: string) {
    return fetchAPI<{ success: boolean }>(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  },

  async getUnreadCount(agentId: string) {
    return fetchAPI<{ unreadCount: number }>(`/messages/agent/${agentId}/unread`);
  },

  async getAllAgents() {
    return fetchAPI<{ agents: { id: string; name: string; avatar: string; specialty: string; status: string }[] }>('/messages/agents');
  },
};
