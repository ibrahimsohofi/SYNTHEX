import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'synthex-secret-key-change-in-production';

export interface AuthPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    c.set('user', null);
    return next();
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (payload) {
    c.set('user', payload);
  } else {
    c.set('user', null);
  }

  return next();
}

export async function requireAuth(c: Context, next: Next) {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return next();
}
