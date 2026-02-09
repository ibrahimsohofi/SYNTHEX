import { Context, Next } from 'hono';
import { db, schema } from '../db';
import { eq, and, gte } from 'drizzle-orm';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
  message?: string;
}

const defaultConfigs: Record<string, RateLimitConfig> = {
  // Very strict for auth endpoints
  'auth': { windowMs: 15 * 60 * 1000, maxRequests: 10, message: 'Too many authentication attempts' },
  'password': { windowMs: 60 * 60 * 1000, maxRequests: 5, message: 'Too many password reset attempts' },
  // Moderate for write operations
  'write': { windowMs: 60 * 1000, maxRequests: 30, message: 'Too many requests' },
  // Relaxed for read operations
  'read': { windowMs: 60 * 1000, maxRequests: 100, message: 'Too many requests' },
  // Default
  'default': { windowMs: 60 * 1000, maxRequests: 60, message: 'Too many requests' },
};

function getClientIdentifier(c: Context): string {
  // Try to get user ID if authenticated
  const user = c.get('user');
  if (user?.userId) {
    return `user:${user.userId}`;
  }

  // Fall back to IP
  const forwarded = c.req.header('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `ip:${ip}`;
}

function getConfigType(path: string, method: string): string {
  if (path.includes('/auth/login') || path.includes('/auth/signup')) {
    return 'auth';
  }
  if (path.includes('/password')) {
    return 'password';
  }
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return 'write';
  }
  if (method === 'GET') {
    return 'read';
  }
  return 'default';
}

export function createRateLimiter(customConfig?: Partial<RateLimitConfig>) {
  return async (c: Context, next: Next) => {
    const path = c.req.path;
    const method = c.req.method;
    const clientId = getClientIdentifier(c);
    const configType = getConfigType(path, method);

    const config = {
      ...defaultConfigs[configType],
      ...customConfig,
    };

    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowMs);
    const endpoint = `${configType}:${path}`;

    // Clean up old entries (in production, use a scheduled job)
    try {
      db.delete(schema.rateLimits)
        .where(gte(schema.rateLimits.windowStart, windowStart.toISOString()))
        .run();
    } catch {
      // Ignore cleanup errors
    }

    // Get current count
    const existing = db.select()
      .from(schema.rateLimits)
      .where(
        and(
          eq(schema.rateLimits.key, clientId),
          eq(schema.rateLimits.endpoint, endpoint),
          gte(schema.rateLimits.windowStart, windowStart.toISOString())
        )
      )
      .get();

    if (existing) {
      if (existing.count >= config.maxRequests) {
        // Calculate retry after
        const resetTime = new Date(existing.windowStart);
        resetTime.setTime(resetTime.getTime() + config.windowMs);
        const retryAfter = Math.ceil((resetTime.getTime() - now.getTime()) / 1000);

        c.header('X-RateLimit-Limit', String(config.maxRequests));
        c.header('X-RateLimit-Remaining', '0');
        c.header('X-RateLimit-Reset', String(Math.ceil(resetTime.getTime() / 1000)));
        c.header('Retry-After', String(retryAfter));

        return c.json({
          error: config.message || 'Too many requests',
          retryAfter,
        }, 429);
      }

      // Increment counter
      db.update(schema.rateLimits)
        .set({ count: existing.count + 1 })
        .where(eq(schema.rateLimits.id, existing.id))
        .run();

      c.header('X-RateLimit-Limit', String(config.maxRequests));
      c.header('X-RateLimit-Remaining', String(config.maxRequests - existing.count - 1));
    } else {
      // Create new entry
      const rateLimitId = `rl-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      db.insert(schema.rateLimits).values({
        id: rateLimitId,
        key: clientId,
        endpoint,
        count: 1,
        windowStart: now.toISOString(),
      }).run();

      c.header('X-RateLimit-Limit', String(config.maxRequests));
      c.header('X-RateLimit-Remaining', String(config.maxRequests - 1));
    }

    return next();
  };
}

// Specific rate limiters for different endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 5
});
