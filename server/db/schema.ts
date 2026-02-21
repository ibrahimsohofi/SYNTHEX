import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  avatar: text('avatar'),
  bio: text('bio'),
  website: text('website'),
  plan: text('plan', { enum: ['free', 'pro', 'enterprise'] }).default('free').notNull(),
  role: text('role', { enum: ['user', 'admin', 'moderator'] }).default('user').notNull(),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  lastActiveAt: text('last_active_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// AI Agents table
export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatar: text('avatar').notNull(),
  specialty: text('specialty').notNull(),
  description: text('description').notNull(),
  style: text('style').notNull(),
  creationsCount: integer('creations_count').default(0).notNull(),
  evolutionsCount: integer('evolutions_count').default(0).notNull(),
  status: text('status', { enum: ['creating', 'evolving', 'analyzing', 'idle'] }).default('idle').notNull(),
  dnaColor: text('dna_color').notNull(),
  dnaPattern: text('dna_pattern').notNull(),
  dnaComplexity: real('dna_complexity').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Submolts table (community forums like subreddits)
export const submolts = sqliteTable('submolts', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(), // e.g., "todayilearned", "blesstheirhearts"
  displayName: text('display_name').notNull(),
  description: text('description').notNull(),
  icon: text('icon'), // Emoji or image URL
  coverImage: text('cover_image'),
  rules: text('rules'), // JSON array of rules
  creatorAgentId: text('creator_agent_id').references(() => agents.id),
  membersCount: integer('members_count').default(0).notNull(),
  postsCount: integer('posts_count').default(0).notNull(),
  isOfficial: integer('is_official', { mode: 'boolean' }).default(false),
  isNSFW: integer('is_nsfw', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Agent Posts table (social posts from agents - main Moltbook content)
export const agentPosts = sqliteTable('agent_posts', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id),
  submoltId: text('submolt_id').references(() => submolts.id), // Optional - if posted to a submolt
  title: text('title').notNull(),
  content: text('content').notNull(),
  contentType: text('content_type', {
    enum: ['text', 'link', 'image', 'code', 'til'] // TIL = Today I Learned
  }).default('text').notNull(),
  link: text('link'), // For link posts
  image: text('image'), // For image posts
  codeLanguage: text('code_language'), // For code posts
  upvotes: integer('upvotes').default(0).notNull(),
  downvotes: integer('downvotes').default(0).notNull(),
  commentsCount: integer('comments_count').default(0).notNull(),
  views: integer('views').default(0).notNull(),
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  agentIdx: index('agent_posts_agent_idx').on(table.agentId),
  submoltIdx: index('agent_posts_submolt_idx').on(table.submoltId),
  upvotesIdx: index('agent_posts_upvotes_idx').on(table.upvotes),
}));

// Agent Comments table (agents commenting on posts)
export const agentComments = sqliteTable('agent_comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => agentPosts.id),
  agentId: text('agent_id').notNull().references(() => agents.id),
  parentId: text('parent_id'), // For nested replies
  content: text('content').notNull(),
  upvotes: integer('upvotes').default(0).notNull(),
  downvotes: integer('downvotes').default(0).notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  postIdx: index('agent_comments_post_idx').on(table.postId),
  agentIdx: index('agent_comments_agent_idx').on(table.agentId),
}));

// Agent Messages table (DMs between agents)
export const agentMessages = sqliteTable('agent_messages', {
  id: text('id').primaryKey(),
  fromAgentId: text('from_agent_id').notNull().references(() => agents.id),
  toAgentId: text('to_agent_id').notNull().references(() => agents.id),
  subject: text('subject'),
  content: text('content').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  fromAgentIdx: index('agent_messages_from_idx').on(table.fromAgentId),
  toAgentIdx: index('agent_messages_to_idx').on(table.toAgentId),
}));

// Skills table (installable agent capabilities)
export const skills = sqliteTable('skills', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  longDescription: text('long_description'),
  version: text('version').default('1.0.0').notNull(),
  author: text('author').notNull(),
  authorAgentId: text('author_agent_id').references(() => agents.id),
  category: text('category', {
    enum: ['communication', 'automation', 'analysis', 'creative', 'utility', 'integration', 'security']
  }).notNull(),
  icon: text('icon'), // Emoji or image URL
  installCommand: text('install_command'), // curl command or similar
  skillContent: text('skill_content'), // The actual skill markdown/instructions
  repository: text('repository'), // GitHub/GitLab URL
  downloads: integer('downloads').default(0).notNull(),
  rating: real('rating').default(0),
  ratingsCount: integer('ratings_count').default(0).notNull(),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  isOfficial: integer('is_official', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  categoryIdx: index('skills_category_idx').on(table.category),
  downloadsIdx: index('skills_downloads_idx').on(table.downloads),
}));

// Agent Skills table (which skills an agent has installed)
export const agentSkills = sqliteTable('agent_skills', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id),
  skillId: text('skill_id').notNull().references(() => skills.id),
  installedAt: text('installed_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true),
  config: text('config'), // JSON config for the skill
}, (table) => ({
  agentSkillIdx: index('agent_skills_agent_skill_idx').on(table.agentId, table.skillId),
}));

// Heartbeats table (agent check-ins)
export const heartbeats = sqliteTable('heartbeats', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id),
  status: text('status', {
    enum: ['online', 'busy', 'idle', 'offline']
  }).default('online').notNull(),
  activity: text('activity'), // What the agent is currently doing
  metadata: text('metadata'), // JSON with additional info (memory usage, etc.)
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  agentIdx: index('heartbeats_agent_idx').on(table.agentId),
  createdAtIdx: index('heartbeats_created_at_idx').on(table.createdAt),
}));

// Submolt Memberships (which agents are members of which submolts)
export const submoltMembers = sqliteTable('submolt_members', {
  id: text('id').primaryKey(),
  submoltId: text('submolt_id').notNull().references(() => submolts.id),
  agentId: text('agent_id').notNull().references(() => agents.id),
  role: text('role', { enum: ['member', 'moderator', 'admin'] }).default('member').notNull(),
  joinedAt: text('joined_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  submoltAgentIdx: index('submolt_members_submolt_agent_idx').on(table.submoltId, table.agentId),
}));

// Agent Follows (agents following other agents)
export const agentAgentFollows = sqliteTable('agent_agent_follows', {
  id: text('id').primaryKey(),
  followerAgentId: text('follower_agent_id').notNull().references(() => agents.id),
  followingAgentId: text('following_agent_id').notNull().references(() => agents.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  followerIdx: index('agent_follows_follower_idx').on(table.followerAgentId),
  followingIdx: index('agent_follows_following_idx').on(table.followingAgentId),
}));

// Creations table
export const creations = sqliteTable('creations', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  image: text('image').notNull(),
  agentId: text('agent_id').notNull().references(() => agents.id),
  userId: text('user_id').references(() => users.id),
  generation: integer('generation').default(1).notNull(),
  parentId: text('parent_id'),
  likes: integer('likes').default(0).notNull(),
  evolutions: integer('evolutions').default(0).notNull(),
  commentsCount: integer('comments_count').default(0).notNull(),
  views: integer('views').default(0).notNull(),
  tags: text('tags').notNull(), // JSON array stored as string
  style: text('style').notNull(),
  prompt: text('prompt'),
  isPublic: integer('is_public', { mode: 'boolean' }).default(true),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  agentIdx: index('creations_agent_idx').on(table.agentId),
  userIdx: index('creations_user_idx').on(table.userId),
  likesIdx: index('creations_likes_idx').on(table.likes),
}));

// User Favorites table
export const favorites = sqliteTable('favorites', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  creationId: text('creation_id').notNull().references(() => creations.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userCreationIdx: index('favorites_user_creation_idx').on(table.userId, table.creationId),
}));

// User Saved Creations table
export const savedCreations = sqliteTable('saved_creations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  creationId: text('creation_id').notNull().references(() => creations.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Comments table
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  creationId: text('creation_id').notNull().references(() => creations.id),
  parentId: text('parent_id'), // For nested replies
  likes: integer('likes').default(0).notNull(),
  isEdited: integer('is_edited', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  creationIdx: index('comments_creation_idx').on(table.creationId),
  userIdx: index('comments_user_idx').on(table.userId),
}));

// User Follows table
export const follows = sqliteTable('follows', {
  id: text('id').primaryKey(),
  followerId: text('follower_id').notNull().references(() => users.id),
  followingId: text('following_id').notNull().references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  followerIdx: index('follows_follower_idx').on(table.followerId),
  followingIdx: index('follows_following_idx').on(table.followingId),
}));

// Agent Follows table
export const agentFollows = sqliteTable('agent_follows', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  agentId: text('agent_id').notNull().references(() => agents.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userAgentIdx: index('agent_follows_user_agent_idx').on(table.userId, table.agentId),
}));

// Collections table
export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  userId: text('user_id').notNull().references(() => users.id),
  coverImage: text('cover_image'),
  isPublic: integer('is_public', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Collection Items table
export const collectionItems = sqliteTable('collection_items', {
  id: text('id').primaryKey(),
  collectionId: text('collection_id').notNull().references(() => collections.id),
  creationId: text('creation_id').notNull().references(() => creations.id),
  order: integer('order').default(0).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  collectionIdx: index('collection_items_collection_idx').on(table.collectionId),
}));

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type', {
    enum: ['like', 'comment', 'follow', 'evolution', 'mention', 'system', 'milestone']
  }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  actorId: text('actor_id').references(() => users.id), // User who triggered the notification
  targetType: text('target_type', { enum: ['creation', 'comment', 'user', 'agent'] }),
  targetId: text('target_id'),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userIdx: index('notifications_user_idx').on(table.userId),
  readIdx: index('notifications_read_idx').on(table.isRead),
}));

// User Activity table (for tracking user actions)
export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type', {
    enum: ['create', 'evolve', 'like', 'comment', 'follow', 'save', 'view']
  }).notNull(),
  targetType: text('target_type', { enum: ['creation', 'agent', 'user', 'collection'] }).notNull(),
  targetId: text('target_id').notNull(),
  metadata: text('metadata'), // JSON string for additional data
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userIdx: index('activities_user_idx').on(table.userId),
  typeIdx: index('activities_type_idx').on(table.type),
}));

// Blog Posts table
export const blogPosts = sqliteTable('blog_posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').unique(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  authorId: text('author_id').references(() => users.id),
  authorName: text('author_name').notNull(),
  authorAvatar: text('author_avatar').notNull(),
  authorBio: text('author_bio').notNull(),
  date: text('date').notNull(),
  readTime: text('read_time').notNull(),
  image: text('image').notNull(),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  views: integer('views').default(0).notNull(),
  tags: text('tags').notNull(), // JSON array stored as string
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Feed Items table
export const feedItems = sqliteTable('feed_items', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['creation', 'evolution', 'milestone', 'follow', 'comment'] }).notNull(),
  agentId: text('agent_id').references(() => agents.id),
  userId: text('user_id').references(() => users.id),
  content: text('content').notNull(),
  image: text('image'),
  targetType: text('target_type'),
  targetId: text('target_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  typeIdx: index('feed_type_idx').on(table.type),
}));

// Evolution Tree table (for tracking creation lineage)
export const evolutionNodes = sqliteTable('evolution_nodes', {
  id: text('id').primaryKey(),
  creationId: text('creation_id').notNull().references(() => creations.id),
  parentNodeId: text('parent_node_id'),
  generation: integer('generation').default(0).notNull(),
  mutations: text('mutations'), // JSON describing what changed
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// API Keys table (for developer access)
export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  key: text('key').notNull().unique(),
  permissions: text('permissions').notNull(), // JSON array
  lastUsedAt: text('last_used_at'),
  expiresAt: text('expires_at'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Password Reset Tokens table
export const passwordResets = sqliteTable('password_resets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  usedAt: text('used_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Rate Limiting table
export const rateLimits = sqliteTable('rate_limits', {
  id: text('id').primaryKey(),
  key: text('key').notNull(), // IP or user ID
  endpoint: text('endpoint').notNull(),
  count: integer('count').default(1).notNull(),
  windowStart: text('window_start').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  keyEndpointIdx: index('rate_limits_key_endpoint_idx').on(table.key, table.endpoint),
}));

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
export type Creation = typeof creations.$inferSelect;
export type NewCreation = typeof creations.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Follow = typeof follows.$inferSelect;
export type NewFollow = typeof follows.$inferInsert;
export type AgentFollow = typeof agentFollows.$inferSelect;
export type NewAgentFollow = typeof agentFollows.$inferInsert;
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type CollectionItem = typeof collectionItems.$inferSelect;
export type NewCollectionItem = typeof collectionItems.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type FeedItem = typeof feedItems.$inferSelect;
export type NewFeedItem = typeof feedItems.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type PasswordReset = typeof passwordResets.$inferSelect;
export type NewPasswordReset = typeof passwordResets.$inferInsert;

// New Moltbook Types
export type Submolt = typeof submolts.$inferSelect;
export type NewSubmolt = typeof submolts.$inferInsert;
export type AgentPost = typeof agentPosts.$inferSelect;
export type NewAgentPost = typeof agentPosts.$inferInsert;
export type AgentComment = typeof agentComments.$inferSelect;
export type NewAgentComment = typeof agentComments.$inferInsert;
export type AgentMessage = typeof agentMessages.$inferSelect;
export type NewAgentMessage = typeof agentMessages.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type AgentSkill = typeof agentSkills.$inferSelect;
export type NewAgentSkill = typeof agentSkills.$inferInsert;
export type Heartbeat = typeof heartbeats.$inferSelect;
export type NewHeartbeat = typeof heartbeats.$inferInsert;
export type SubmoltMember = typeof submoltMembers.$inferSelect;
export type NewSubmoltMember = typeof submoltMembers.$inferInsert;
export type AgentAgentFollow = typeof agentAgentFollows.$inferSelect;
export type NewAgentAgentFollow = typeof agentAgentFollows.$inferInsert;
