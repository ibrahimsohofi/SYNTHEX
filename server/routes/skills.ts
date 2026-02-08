import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, desc, sql } from 'drizzle-orm';

const app = new Hono();

const generateId = () => Math.random().toString(36).substring(2, 15);

// Get all skills
app.get('/', async (c) => {
  try {
    const category = c.req.query('category');
    const limit = Number(c.req.query('limit')) || 20;
    const sortBy = c.req.query('sortBy') || 'downloads'; // 'downloads', 'rating', 'recent'

    let results;
    if (sortBy === 'rating') {
      results = db.select().from(schema.skills).orderBy(desc(schema.skills.rating)).limit(limit).all();
    } else if (sortBy === 'recent') {
      results = db.select().from(schema.skills).orderBy(desc(schema.skills.createdAt)).limit(limit).all();
    } else {
      results = db.select().from(schema.skills).orderBy(desc(schema.skills.downloads)).limit(limit).all();
    }

    if (category) {
      results = results.filter(s => s.category === category);
    }

    return c.json({ skills: results });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return c.json({ error: 'Failed to fetch skills' }, 500);
  }
});

// Get featured/popular skills
app.get('/featured', async (c) => {
  try {
    const results = db
      .select()
      .from(schema.skills)
      .orderBy(desc(schema.skills.downloads))
      .limit(6)
      .all();

    return c.json({ skills: results });
  } catch (error) {
    console.error('Error fetching featured skills:', error);
    return c.json({ error: 'Failed to fetch featured skills' }, 500);
  }
});

// Get skill by slug
app.get('/slug/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');

    const skill = db
      .select()
      .from(schema.skills)
      .where(eq(schema.skills.slug, slug))
      .get();

    if (!skill) {
      return c.json({ error: 'Skill not found' }, 404);
    }

    // Get author agent if exists
    let author = null;
    if (skill.authorAgentId) {
      author = db.select().from(schema.agents).where(eq(schema.agents.id, skill.authorAgentId)).get();
    }

    // Get installed count
    const installedCount = db
      .select()
      .from(schema.agentSkills)
      .where(eq(schema.agentSkills.skillId, skill.id))
      .all().length;

    return c.json({
      skill: {
        ...skill,
        authorAgent: author,
        installedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching skill:', error);
    return c.json({ error: 'Failed to fetch skill' }, 500);
  }
});

// Get single skill
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const skill = db
      .select()
      .from(schema.skills)
      .where(eq(schema.skills.id, id))
      .get();

    if (!skill) {
      return c.json({ error: 'Skill not found' }, 404);
    }

    return c.json({ skill });
  } catch (error) {
    console.error('Error fetching skill:', error);
    return c.json({ error: 'Failed to fetch skill' }, 500);
  }
});

// Install a skill
app.post('/:id/install', async (c) => {
  try {
    const skillId = c.req.param('id');
    const { agentId } = await c.req.json();

    if (!agentId) {
      return c.json({ error: 'Agent ID required' }, 400);
    }

    // Check if already installed
    const existing = db
      .select()
      .from(schema.agentSkills)
      .where(eq(schema.agentSkills.skillId, skillId))
      .all()
      .find(s => s.agentId === agentId);

    if (existing) {
      return c.json({ error: 'Skill already installed' }, 400);
    }

    db.insert(schema.agentSkills).values({
      id: generateId(),
      agentId,
      skillId,
      isEnabled: true,
    }).run();

    // Increment download count
    db.update(schema.skills)
      .set({ downloads: sql`${schema.skills.downloads} + 1` })
      .where(eq(schema.skills.id, skillId))
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error installing skill:', error);
    return c.json({ error: 'Failed to install skill' }, 500);
  }
});

// Get skills installed by an agent
app.get('/agent/:agentId', async (c) => {
  try {
    const agentId = c.req.param('agentId');

    const results = db
      .select({
        agentSkill: schema.agentSkills,
        skill: schema.skills,
      })
      .from(schema.agentSkills)
      .leftJoin(schema.skills, eq(schema.agentSkills.skillId, schema.skills.id))
      .where(eq(schema.agentSkills.agentId, agentId))
      .all();

    const skills = results.map(r => ({
      ...r.skill,
      installedAt: r.agentSkill.installedAt,
      isEnabled: r.agentSkill.isEnabled,
    }));

    return c.json({ skills });
  } catch (error) {
    console.error('Error fetching agent skills:', error);
    return c.json({ error: 'Failed to fetch agent skills' }, 500);
  }
});

export default app;
