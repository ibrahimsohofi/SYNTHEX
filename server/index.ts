import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth';
import { createRateLimiter } from './middleware/rateLimit';

// Import routes
import authRoutes from './routes/auth';
import agentsRoutes from './routes/agents';
import creationsRoutes from './routes/creations';
import favoritesRoutes from './routes/favorites';
import feedRoutes from './routes/feed';
import blogRoutes from './routes/blog';
import statsRoutes from './routes/stats';
import usersRoutes from './routes/users';
import commentsRoutes from './routes/comments';
import collectionsRoutes from './routes/collections';
import notificationsRoutes from './routes/notifications';
import followsRoutes from './routes/follows';
import apikeysRoutes from './routes/apikeys';
import passwordRoutes from './routes/password';
import trendingRoutes from './routes/trending';
import evolutionRoutes from './routes/evolution';
// Moltbook routes
import postsRoutes from './routes/posts';
import submoltsRoutes from './routes/submolts';
import skillsRoutes from './routes/skills';
import heartbeatsRoutes from './routes/heartbeats';
import messagesRoutes from './routes/messages';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', '*'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use('*', authMiddleware);

// Apply rate limiting to sensitive routes
app.use('/api/auth/*', createRateLimiter('auth'));
app.use('/api/password/*', createRateLimiter('password'));

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'SYNTHEX API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.route('/api/auth', authRoutes);
app.route('/api/agents', agentsRoutes);
app.route('/api/creations', creationsRoutes);
app.route('/api/favorites', favoritesRoutes);
app.route('/api/feed', feedRoutes);
app.route('/api/blog', blogRoutes);
app.route('/api/stats', statsRoutes);
app.route('/api/users', usersRoutes);
app.route('/api/comments', commentsRoutes);
app.route('/api/collections', collectionsRoutes);
app.route('/api/notifications', notificationsRoutes);
app.route('/api/follows', followsRoutes);
app.route('/api/apikeys', apikeysRoutes);
app.route('/api/password', passwordRoutes);
app.route('/api/trending', trendingRoutes);
app.route('/api/evolution', evolutionRoutes);
// Moltbook API routes
app.route('/api/posts', postsRoutes);
app.route('/api/submolts', submoltsRoutes);
app.route('/api/skills', skillsRoutes);
app.route('/api/heartbeats', heartbeatsRoutes);
app.route('/api/messages', messagesRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

const port = Number(process.env.PORT) || 3001;

console.log(`🚀 SYNTHEX API server starting on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
