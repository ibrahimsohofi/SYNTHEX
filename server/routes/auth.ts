import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';
import { generateToken, requireAuth, type AuthPayload } from '../middleware/auth';

const auth = new Hono();

// Signup
auth.post('/signup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    // Validation
    if (!name || !email || !password) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    if (!email.includes('@')) {
      return c.json({ error: 'Please enter a valid email address' }, 400);
    }

    // Check if user exists
    const existingUser = db.select().from(schema.users).where(eq(schema.users.email, email)).get();
    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;

    db.insert(schema.users).values({
      id: userId,
      name,
      email,
      password: hashedPassword,
      avatar,
      plan: 'free',
    }).run();

    // Generate token
    const token = generateToken({ userId, email });

    // Get created user (without password)
    const user = db.select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      avatar: schema.users.avatar,
      plan: schema.users.plan,
      createdAt: schema.users.createdAt,
    }).from(schema.users).where(eq(schema.users.id, userId)).get();

    return c.json({ user, token });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'An error occurred during signup' }, 500);
  }
});

// Login
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Validation
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Find user
    const user = db.select().from(schema.users).where(eq(schema.users.email, email)).get();
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return c.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'An error occurred during login' }, 500);
  }
});

// Get current user
auth.get('/me', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;

    const user = db.select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      avatar: schema.users.avatar,
      plan: schema.users.plan,
      createdAt: schema.users.createdAt,
    }).from(schema.users).where(eq(schema.users.id, authPayload.userId)).get();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'An error occurred' }, 500);
  }
});

// Update user profile
auth.put('/me', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const { name, avatar } = await c.req.json();

    db.update(schema.users)
      .set({ name, avatar })
      .where(eq(schema.users.id, authPayload.userId))
      .run();

    const user = db.select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      avatar: schema.users.avatar,
      plan: schema.users.plan,
      createdAt: schema.users.createdAt,
    }).from(schema.users).where(eq(schema.users.id, authPayload.userId)).get();

    return c.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    return c.json({ error: 'An error occurred' }, 500);
  }
});

export default auth;
