import { Hono } from 'hono';
import { db, schema } from '../db';
import { eq, desc, sql } from 'drizzle-orm';

const evolution = new Hono();

interface TreeNode {
  id: string;
  title: string;
  image: string;
  generation: number;
  likes: number;
  evolutions: number;
  agentId: string;
  agentName?: string;
  createdAt: string;
  children: TreeNode[];
}

// Get evolution tree for a creation (all ancestors and descendants)
evolution.get('/tree/:creationId', async (c) => {
  try {
    const creationId = c.req.param('id') || c.req.param('creationId');

    const creation = db.select()
      .from(schema.creations)
      .where(eq(schema.creations.id, creationId))
      .get();

    if (!creation) {
      return c.json({ error: 'Creation not found' }, 404);
    }

    // Find the root of the tree (follow parent chain to the top)
    let rootCreation = creation;
    while (rootCreation.parentId) {
      const parent = db.select()
        .from(schema.creations)
        .where(eq(schema.creations.id, rootCreation.parentId))
        .get();

      if (!parent) break;
      rootCreation = parent;
    }

    // Build tree recursively from root
    function buildTree(nodeId: string): TreeNode | null {
      const node = db.select()
        .from(schema.creations)
        .where(eq(schema.creations.id, nodeId))
        .get();

      if (!node) return null;

      const agent = db.select({ name: schema.agents.name })
        .from(schema.agents)
        .where(eq(schema.agents.id, node.agentId))
        .get();

      // Get children
      const children = db.select()
        .from(schema.creations)
        .where(eq(schema.creations.parentId, nodeId))
        .orderBy(schema.creations.createdAt)
        .all();

      return {
        id: node.id,
        title: node.title,
        image: node.image,
        generation: node.generation,
        likes: node.likes,
        evolutions: node.evolutions,
        agentId: node.agentId,
        agentName: agent?.name || 'Unknown',
        createdAt: node.createdAt,
        children: children.map(child => buildTree(child.id)).filter(Boolean) as TreeNode[],
      };
    }

    const tree = buildTree(rootCreation.id);

    // Calculate tree stats
    function countNodes(node: TreeNode): number {
      return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
    }

    function maxDepth(node: TreeNode): number {
      if (node.children.length === 0) return 1;
      return 1 + Math.max(...node.children.map(maxDepth));
    }

    const stats = tree ? {
      totalNodes: countNodes(tree),
      maxGeneration: maxDepth(tree),
      rootId: rootCreation.id,
      currentNodeId: creationId,
    } : null;

    return c.json({ tree, stats });
  } catch (error) {
    console.error('Get evolution tree error:', error);
    return c.json({ error: 'Failed to fetch evolution tree' }, 500);
  }
});

// Get direct ancestors (parent chain)
evolution.get('/ancestors/:creationId', async (c) => {
  try {
    const creationId = c.req.param('creationId');

    const creation = db.select()
      .from(schema.creations)
      .where(eq(schema.creations.id, creationId))
      .get();

    if (!creation) {
      return c.json({ error: 'Creation not found' }, 404);
    }

    const ancestors = [];
    let current = creation;

    while (current.parentId) {
      const parent = db.select()
        .from(schema.creations)
        .where(eq(schema.creations.id, current.parentId))
        .get();

      if (!parent) break;

      const agent = db.select({ name: schema.agents.name })
        .from(schema.agents)
        .where(eq(schema.agents.id, parent.agentId))
        .get();

      ancestors.push({
        id: parent.id,
        title: parent.title,
        image: parent.image,
        generation: parent.generation,
        likes: parent.likes,
        agentName: agent?.name || 'Unknown',
        createdAt: parent.createdAt,
      });

      current = parent;
    }

    return c.json({ ancestors: ancestors.reverse() }); // Root first
  } catch (error) {
    console.error('Get ancestors error:', error);
    return c.json({ error: 'Failed to fetch ancestors' }, 500);
  }
});

// Get direct children (immediate evolutions)
evolution.get('/children/:creationId', async (c) => {
  try {
    const creationId = c.req.param('creationId');
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;

    const children = db.select()
      .from(schema.creations)
      .where(eq(schema.creations.parentId, creationId))
      .orderBy(desc(schema.creations.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    const formattedChildren = [];
    for (const child of children) {
      const agent = db.select({ name: schema.agents.name })
        .from(schema.agents)
        .where(eq(schema.agents.id, child.agentId))
        .get();

      formattedChildren.push({
        id: child.id,
        title: child.title,
        image: child.image,
        generation: child.generation,
        likes: child.likes,
        evolutions: child.evolutions,
        agentName: agent?.name || 'Unknown',
        tags: JSON.parse(child.tags),
        createdAt: child.createdAt,
      });
    }

    // Get total count
    const totalResult = db.select({ count: sql`count(*)` })
      .from(schema.creations)
      .where(eq(schema.creations.parentId, creationId))
      .get();
    const total = Number(totalResult?.count) || 0;

    return c.json({
      children: formattedChildren,
      pagination: { total, limit, offset, hasMore: offset + limit < total }
    });
  } catch (error) {
    console.error('Get children error:', error);
    return c.json({ error: 'Failed to fetch children' }, 500);
  }
});

// Get siblings (other evolutions from same parent)
evolution.get('/siblings/:creationId', async (c) => {
  try {
    const creationId = c.req.param('creationId');

    const creation = db.select()
      .from(schema.creations)
      .where(eq(schema.creations.id, creationId))
      .get();

    if (!creation || !creation.parentId) {
      return c.json({ siblings: [] }); // No parent = no siblings
    }

    const siblings = db.select()
      .from(schema.creations)
      .where(eq(schema.creations.parentId, creation.parentId))
      .orderBy(desc(schema.creations.createdAt))
      .all();

    // Filter out the current creation
    const formattedSiblings = [];
    for (const sibling of siblings) {
      if (sibling.id === creationId) continue;

      const agent = db.select({ name: schema.agents.name })
        .from(schema.agents)
        .where(eq(schema.agents.id, sibling.agentId))
        .get();

      formattedSiblings.push({
        id: sibling.id,
        title: sibling.title,
        image: sibling.image,
        generation: sibling.generation,
        likes: sibling.likes,
        agentName: agent?.name || 'Unknown',
        createdAt: sibling.createdAt,
      });
    }

    return c.json({ siblings: formattedSiblings });
  } catch (error) {
    console.error('Get siblings error:', error);
    return c.json({ error: 'Failed to fetch siblings' }, 500);
  }
});

// Get evolution statistics for an agent
evolution.get('/stats/agent/:agentId', async (c) => {
  try {
    const agentId = c.req.param('agentId');

    // Total creations
    const totalResult = db.select({ count: sql`count(*)` })
      .from(schema.creations)
      .where(eq(schema.creations.agentId, agentId))
      .get();
    const totalCreations = Number(totalResult?.count) || 0;

    // Original creations (no parent)
    const originalsResult = db.select({ count: sql`count(*)` })
      .from(schema.creations)
      .where(sql`${schema.creations.agentId} = ${agentId} AND ${schema.creations.parentId} IS NULL`)
      .get();
    const originalCreations = Number(originalsResult?.count) || 0;

    // Evolutions (has parent)
    const evolutionsCount = totalCreations - originalCreations;

    // Average generation
    const avgGenResult = db.select({ avg: sql`avg(${schema.creations.generation})` })
      .from(schema.creations)
      .where(eq(schema.creations.agentId, agentId))
      .get();
    const averageGeneration = Number(avgGenResult?.avg) || 1;

    // Max generation
    const maxGenResult = db.select({ max: sql`max(${schema.creations.generation})` })
      .from(schema.creations)
      .where(eq(schema.creations.agentId, agentId))
      .get();
    const maxGeneration = Number(maxGenResult?.max) || 1;

    // Most evolved creation
    const mostEvolved = db.select()
      .from(schema.creations)
      .where(eq(schema.creations.agentId, agentId))
      .orderBy(desc(schema.creations.evolutions))
      .limit(1)
      .get();

    return c.json({
      stats: {
        totalCreations,
        originalCreations,
        evolutionsCount,
        averageGeneration: Math.round(averageGeneration * 100) / 100,
        maxGeneration,
        mostEvolved: mostEvolved ? {
          id: mostEvolved.id,
          title: mostEvolved.title,
          image: mostEvolved.image,
          evolutions: mostEvolved.evolutions,
        } : null,
      }
    });
  } catch (error) {
    console.error('Get agent evolution stats error:', error);
    return c.json({ error: 'Failed to fetch evolution stats' }, 500);
  }
});

export default evolution;
