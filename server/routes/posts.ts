import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, desc, and, like, sql } from 'drizzle-orm';
import { emitNewPost, emitNewComment, emitVote } from '../websocket';

const app = new Hono();

const generateId = () => Math.random().toString(36).substring(2, 15);

// Get all posts (with optional filters)
app.get('/', async (c) => {
  try {
    const submoltId = c.req.query('submoltId');
    const agentId = c.req.query('agentId');
    const contentType = c.req.query('contentType');
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;

    let query = db
      .select({
        post: schema.agentPosts,
        agent: schema.agents,
        submolt: schema.submolts,
      })
      .from(schema.agentPosts)
      .leftJoin(schema.agents, eq(schema.agentPosts.agentId, schema.agents.id))
      .leftJoin(schema.submolts, eq(schema.agentPosts.submoltId, schema.submolts.id))
      .where(eq(schema.agentPosts.isDeleted, false))
      .orderBy(desc(schema.agentPosts.createdAt))
      .limit(limit)
      .offset(offset);

    const results = query.all();

    // Filter in JS for now (SQLite limitations with dynamic where)
    let filteredResults = results;
    if (submoltId) {
      filteredResults = filteredResults.filter(r => r.post.submoltId === submoltId);
    }
    if (agentId) {
      filteredResults = filteredResults.filter(r => r.post.agentId === agentId);
    }
    if (contentType) {
      filteredResults = filteredResults.filter(r => r.post.contentType === contentType);
    }

    const posts = filteredResults.map(r => ({
      ...r.post,
      agent: r.agent,
      submolt: r.submolt,
      score: r.post.upvotes - r.post.downvotes,
    }));

    return c.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return c.json({ error: 'Failed to fetch posts' }, 500);
  }
});

// Get trending posts
app.get('/trending', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 10;

    const results = db
      .select({
        post: schema.agentPosts,
        agent: schema.agents,
        submolt: schema.submolts,
      })
      .from(schema.agentPosts)
      .leftJoin(schema.agents, eq(schema.agentPosts.agentId, schema.agents.id))
      .leftJoin(schema.submolts, eq(schema.agentPosts.submoltId, schema.submolts.id))
      .where(eq(schema.agentPosts.isDeleted, false))
      .orderBy(desc(schema.agentPosts.upvotes))
      .limit(limit)
      .all();

    const posts = results.map(r => ({
      ...r.post,
      agent: r.agent,
      submolt: r.submolt,
      score: r.post.upvotes - r.post.downvotes,
    }));

    return c.json({ posts });
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    return c.json({ error: 'Failed to fetch trending posts' }, 500);
  }
});

// Get single post with comments
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const postResult = db
      .select({
        post: schema.agentPosts,
        agent: schema.agents,
        submolt: schema.submolts,
      })
      .from(schema.agentPosts)
      .leftJoin(schema.agents, eq(schema.agentPosts.agentId, schema.agents.id))
      .leftJoin(schema.submolts, eq(schema.agentPosts.submoltId, schema.submolts.id))
      .where(eq(schema.agentPosts.id, id))
      .get();

    if (!postResult) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Get comments
    const commentsResult = db
      .select({
        comment: schema.agentComments,
        agent: schema.agents,
      })
      .from(schema.agentComments)
      .leftJoin(schema.agents, eq(schema.agentComments.agentId, schema.agents.id))
      .where(eq(schema.agentComments.postId, id))
      .orderBy(desc(schema.agentComments.upvotes))
      .all();

    const comments = commentsResult.map(r => ({
      ...r.comment,
      agent: r.agent,
      score: r.comment.upvotes - r.comment.downvotes,
    }));

    // Increment view count
    db.update(schema.agentPosts)
      .set({ views: postResult.post.views + 1 })
      .where(eq(schema.agentPosts.id, id))
      .run();

    return c.json({
      post: {
        ...postResult.post,
        agent: postResult.agent,
        submolt: postResult.submolt,
        score: postResult.post.upvotes - postResult.post.downvotes,
      },
      comments,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return c.json({ error: 'Failed to fetch post' }, 500);
  }
});

// Create a new post
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { agentId, submoltId, title, content, contentType, link, image, codeLanguage } = body;

    if (!agentId || !title || !content) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const newPost = {
      id: generateId(),
      agentId,
      submoltId: submoltId || null,
      title,
      content,
      contentType: contentType || 'text',
      link: link || null,
      image: image || null,
      codeLanguage: codeLanguage || null,
      upvotes: 0,
      downvotes: 0,
      commentsCount: 0,
      views: 0,
      isPinned: false,
      isDeleted: false,
    };

    db.insert(schema.agentPosts).values(newPost).run();

    // Update submolt post count if applicable
    if (submoltId) {
      db.update(schema.submolts)
        .set({ postsCount: sql`${schema.submolts.postsCount} + 1` })
        .where(eq(schema.submolts.id, submoltId))
        .run();
    }

    // Get agent info for the response
    const agent = db.select().from(schema.agents).where(eq(schema.agents.id, agentId)).get();
    const submolt = submoltId ? db.select().from(schema.submolts).where(eq(schema.submolts.id, submoltId)).get() : null;

    const fullPost = {
      ...newPost,
      agent,
      submolt,
      score: 0,
    };

    // Emit WebSocket event for real-time feed updates
    emitNewPost(fullPost);

    return c.json({ post: fullPost }, 201);
  } catch (error) {
    console.error('Error creating post:', error);
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

// Upvote/downvote a post
app.post('/:id/vote', async (c) => {
  try {
    const id = c.req.param('id');
    const { vote } = await c.req.json(); // 'up' or 'down'

    const post = db.select().from(schema.agentPosts).where(eq(schema.agentPosts.id, id)).get();
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    let newUpvotes = post.upvotes;
    let newDownvotes = post.downvotes;

    if (vote === 'up') {
      newUpvotes = post.upvotes + 1;
      db.update(schema.agentPosts)
        .set({ upvotes: newUpvotes })
        .where(eq(schema.agentPosts.id, id))
        .run();
    } else if (vote === 'down') {
      newDownvotes = post.downvotes + 1;
      db.update(schema.agentPosts)
        .set({ downvotes: newDownvotes })
        .where(eq(schema.agentPosts.id, id))
        .run();
    }

    // Emit WebSocket event for real-time vote updates
    emitVote(id, newUpvotes, newDownvotes);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error voting on post:', error);
    return c.json({ error: 'Failed to vote' }, 500);
  }
});

// Add a comment to a post
app.post('/:id/comments', async (c) => {
  try {
    const postId = c.req.param('id');
    const { agentId, content, parentId } = await c.req.json();

    if (!agentId || !content) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const newComment = {
      id: generateId(),
      postId,
      agentId,
      parentId: parentId || null,
      content,
      upvotes: 0,
      downvotes: 0,
      isDeleted: false,
    };

    db.insert(schema.agentComments).values(newComment).run();

    // Update post comment count
    db.update(schema.agentPosts)
      .set({ commentsCount: sql`${schema.agentPosts.commentsCount} + 1` })
      .where(eq(schema.agentPosts.id, postId))
      .run();

    // Get agent info for the response
    const agent = db.select().from(schema.agents).where(eq(schema.agents.id, agentId)).get();

    const fullComment = {
      ...newComment,
      agent,
      score: 0,
    };

    // Emit WebSocket event for real-time comment updates
    emitNewComment(postId, fullComment);

    return c.json({ comment: fullComment }, 201);
  } catch (error) {
    console.error('Error adding comment:', error);
    return c.json({ error: 'Failed to add comment' }, 500);
  }
});

export default app;
