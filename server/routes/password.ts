import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { db, schema } from '../db';
import { eq, and, gte } from 'drizzle-orm';
import { requireAuth, type AuthPayload } from '../middleware/auth';

const password = new Hono();

// Generate a secure reset token
function generateResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Request password reset (sends email in production)
password.post('/forgot', async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const user = db.select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .get();

    // Always return success to prevent email enumeration
    if (!user) {
      return c.json({
        message: 'If an account exists with that email, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const token = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    const resetId = `reset-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Invalidate any existing reset tokens for this user
    db.delete(schema.passwordResets)
      .where(eq(schema.passwordResets.userId, user.id))
      .run();

    // Create new reset token
    db.insert(schema.passwordResets).values({
      id: resetId,
      userId: user.id,
      token,
      expiresAt: expiresAt.toISOString(),
    }).run();

    // In production, send email here
    // For development, we'll return the token (remove in production!)
    console.log(`Password reset token for ${email}: ${token}`);

    return c.json({
      message: 'If an account exists with that email, a password reset link has been sent.',
      // DEV ONLY: Remove in production
      _devToken: token,
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return c.json({ error: 'Failed to process password reset request' }, 500);
  }
});

// Verify reset token (check if valid)
password.get('/verify-token/:token', async (c) => {
  try {
    const token = c.req.param('token');

    const resetEntry = db.select()
      .from(schema.passwordResets)
      .where(
        and(
          eq(schema.passwordResets.token, token),
          gte(schema.passwordResets.expiresAt, new Date().toISOString())
        )
      )
      .get();

    if (!resetEntry || resetEntry.usedAt) {
      return c.json({ valid: false, error: 'Invalid or expired reset token' }, 400);
    }

    return c.json({ valid: true });
  } catch (error) {
    console.error('Verify reset token error:', error);
    return c.json({ error: 'Failed to verify reset token' }, 500);
  }
});

// Reset password with token
password.post('/reset', async (c) => {
  try {
    const { token, newPassword } = await c.req.json();

    if (!token || !newPassword) {
      return c.json({ error: 'Token and new password are required' }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    const resetEntry = db.select()
      .from(schema.passwordResets)
      .where(
        and(
          eq(schema.passwordResets.token, token),
          gte(schema.passwordResets.expiresAt, new Date().toISOString())
        )
      )
      .get();

    if (!resetEntry || resetEntry.usedAt) {
      return c.json({ error: 'Invalid or expired reset token' }, 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    db.update(schema.users)
      .set({
        password: hashedPassword,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.users.id, resetEntry.userId))
      .run();

    // Mark token as used
    db.update(schema.passwordResets)
      .set({ usedAt: new Date().toISOString() })
      .where(eq(schema.passwordResets.id, resetEntry.id))
      .run();

    // Create notification
    db.insert(schema.notifications).values({
      id: `notif-${Date.now()}`,
      userId: resetEntry.userId,
      type: 'system',
      title: 'Password Changed',
      message: 'Your password was successfully changed. If you did not make this change, please contact support.',
    }).run();

    return c.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    return c.json({ error: 'Failed to reset password' }, 500);
  }
});

// Change password (authenticated user)
password.put('/change', requireAuth, async (c) => {
  try {
    const authPayload = c.get('user') as AuthPayload;
    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Current password and new password are required' }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ error: 'New password must be at least 6 characters' }, 400);
    }

    const user = db.select()
      .from(schema.users)
      .where(eq(schema.users.id, authPayload.userId))
      .get();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return c.json({ error: 'Current password is incorrect' }, 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    db.update(schema.users)
      .set({
        password: hashedPassword,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.users.id, authPayload.userId))
      .run();

    // Create notification
    db.insert(schema.notifications).values({
      id: `notif-${Date.now()}`,
      userId: authPayload.userId,
      type: 'system',
      title: 'Password Changed',
      message: 'Your password was successfully changed.',
    }).run();

    return c.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    return c.json({ error: 'Failed to change password' }, 500);
  }
});

export default password;
