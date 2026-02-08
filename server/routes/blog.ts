import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, desc, and, or, like, ne } from 'drizzle-orm';

const blog = new Hono();

// Get all blog posts
blog.get('/', async (c) => {
  try {
    const category = c.req.query('category');
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;

    let posts;

    if (category && category !== 'all') {
      posts = db.select()
        .from(schema.blogPosts)
        .where(eq(schema.blogPosts.category, category))
        .orderBy(desc(schema.blogPosts.createdAt))
        .limit(limit)
        .offset(offset)
        .all();
    } else {
      posts = db.select()
        .from(schema.blogPosts)
        .orderBy(desc(schema.blogPosts.createdAt))
        .limit(limit)
        .offset(offset)
        .all();
    }

    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      author: {
        name: post.authorName,
        avatar: post.authorAvatar,
        bio: post.authorBio,
      },
      date: post.date,
      readTime: post.readTime,
      image: post.image,
      featured: post.featured,
      tags: JSON.parse(post.tags),
    }));

    return c.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Get blog posts error:', error);
    return c.json({ error: 'Failed to fetch blog posts' }, 500);
  }
});

// Get featured posts
blog.get('/featured', async (c) => {
  try {
    const posts = db.select()
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.featured, true))
      .orderBy(desc(schema.blogPosts.createdAt))
      .limit(5)
      .all();

    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      author: {
        name: post.authorName,
        avatar: post.authorAvatar,
        bio: post.authorBio,
      },
      date: post.date,
      readTime: post.readTime,
      image: post.image,
      featured: post.featured,
      tags: JSON.parse(post.tags),
    }));

    return c.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Get featured posts error:', error);
    return c.json({ error: 'Failed to fetch featured posts' }, 500);
  }
});

// Get single blog post
blog.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const post = db.select().from(schema.blogPosts).where(eq(schema.blogPosts.id, id)).get();

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    const formattedPost = {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      author: {
        name: post.authorName,
        avatar: post.authorAvatar,
        bio: post.authorBio,
      },
      date: post.date,
      readTime: post.readTime,
      image: post.image,
      featured: post.featured,
      tags: JSON.parse(post.tags),
    };

    return c.json({ post: formattedPost });
  } catch (error) {
    console.error('Get blog post error:', error);
    return c.json({ error: 'Failed to fetch blog post' }, 500);
  }
});

// Get related posts
blog.get('/:id/related', async (c) => {
  try {
    const id = c.req.param('id');
    const limit = Number(c.req.query('limit')) || 3;

    const currentPost = db.select().from(schema.blogPosts).where(eq(schema.blogPosts.id, id)).get();

    if (!currentPost) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Find related posts by category or tags
    const relatedPosts = db.select()
      .from(schema.blogPosts)
      .where(
        and(
          ne(schema.blogPosts.id, id),
          or(
            eq(schema.blogPosts.category, currentPost.category),
            like(schema.blogPosts.tags, `%${currentPost.category}%`)
          )
        )
      )
      .limit(limit)
      .all();

    const formattedPosts = relatedPosts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      author: {
        name: post.authorName,
        avatar: post.authorAvatar,
        bio: post.authorBio,
      },
      date: post.date,
      readTime: post.readTime,
      image: post.image,
      tags: JSON.parse(post.tags),
    }));

    return c.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Get related posts error:', error);
    return c.json({ error: 'Failed to fetch related posts' }, 500);
  }
});

export default blog;
