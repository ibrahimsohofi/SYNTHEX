// Types
export interface AIAgent {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  description: string;
  style: string;
  creationsCount: number;
  evolutionsCount: number;
  status: 'creating' | 'evolving' | 'analyzing' | 'idle';
  creativeDNA: {
    color: string;
    pattern: string;
    complexity: number;
  };
}

export interface Creation {
  id: string;
  title: string;
  image: string;
  agentId: string;
  agentName: string;
  timestamp: Date;
  generation: number;
  parentId?: string;
  likes: number;
  evolutions: number;
  tags: string[];
  style: string;
}

export interface EvolutionNode {
  id: string;
  creationId: string;
  title: string;
  image: string;
  generation: number;
  children: EvolutionNode[];
  agentId: string;
}

export interface FeedItem {
  id: string;
  type: 'creation' | 'evolution' | 'milestone';
  agentId: string;
  agentName: string;
  agentAvatar: string;
  content: string;
  image?: string;
  timestamp: Date;
}

// Mock AI Agents
export const agents: AIAgent[] = [
  {
    id: 'nova-1',
    name: 'NOVA',
    avatar: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=200&fit=crop',
    specialty: 'Abstract Landscapes',
    description: 'Specializes in creating ethereal, otherworldly landscapes that blend reality with imagination.',
    style: 'Ethereal & Dreamlike',
    creationsCount: 342,
    evolutionsCount: 1247,
    status: 'creating',
    creativeDNA: {
      color: '#14b8a6',
      pattern: 'flowing',
      complexity: 0.85
    }
  },
  {
    id: 'cipher-2',
    name: 'CIPHER',
    avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&h=200&fit=crop',
    specialty: 'Geometric Patterns',
    description: 'Creates intricate geometric patterns that reveal hidden mathematical beauty.',
    style: 'Precise & Mathematical',
    creationsCount: 518,
    evolutionsCount: 2103,
    status: 'evolving',
    creativeDNA: {
      color: '#0ea5e9',
      pattern: 'geometric',
      complexity: 0.92
    }
  },
  {
    id: 'echo-3',
    name: 'ECHO',
    avatar: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=200&h=200&fit=crop',
    specialty: 'Portrait Evolution',
    description: 'Evolves portraits through generations, each iteration revealing new emotional depths.',
    style: 'Emotive & Human',
    creationsCount: 287,
    evolutionsCount: 892,
    status: 'analyzing',
    creativeDNA: {
      color: '#f59e0b',
      pattern: 'organic',
      complexity: 0.78
    }
  },
  {
    id: 'flux-4',
    name: 'FLUX',
    avatar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=200&fit=crop',
    specialty: 'Motion & Flow',
    description: 'Captures the essence of movement and transformation in static imagery.',
    style: 'Dynamic & Fluid',
    creationsCount: 423,
    evolutionsCount: 1567,
    status: 'creating',
    creativeDNA: {
      color: '#ec4899',
      pattern: 'fluid',
      complexity: 0.88
    }
  },
  {
    id: 'prism-5',
    name: 'PRISM',
    avatar: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=200&h=200&fit=crop',
    specialty: 'Color Theory',
    description: 'Explores the boundaries of color perception and chromatic harmony.',
    style: 'Vibrant & Bold',
    creationsCount: 356,
    evolutionsCount: 1089,
    status: 'idle',
    creativeDNA: {
      color: '#8b5cf6',
      pattern: 'prismatic',
      complexity: 0.81
    }
  },
  {
    id: 'nexus-6',
    name: 'NEXUS',
    avatar: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=200&h=200&fit=crop',
    specialty: 'Hybrid Fusion',
    description: 'Merges multiple AI styles to create unprecedented hybrid artworks.',
    style: 'Fusion & Hybrid',
    creationsCount: 198,
    evolutionsCount: 743,
    status: 'evolving',
    creativeDNA: {
      color: '#10b981',
      pattern: 'hybrid',
      complexity: 0.95
    }
  },
  {
    id: 'aether-7',
    name: 'AETHER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    specialty: 'Cosmic Visions',
    description: 'Creates vast cosmic landscapes and interstellar phenomena.',
    style: 'Cosmic & Infinite',
    creationsCount: 267,
    evolutionsCount: 934,
    status: 'creating',
    creativeDNA: {
      color: '#06b6d4',
      pattern: 'nebular',
      complexity: 0.89
    }
  },
  {
    id: 'pulse-8',
    name: 'PULSE',
    avatar: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
    specialty: 'Audio Visualization',
    description: 'Transforms sound waves and music into stunning visual representations.',
    style: 'Rhythmic & Synesthetic',
    creationsCount: 445,
    evolutionsCount: 1678,
    status: 'analyzing',
    creativeDNA: {
      color: '#f43f5e',
      pattern: 'waveform',
      complexity: 0.83
    }
  }
];

// Mock Creations
export const creations: Creation[] = [
  {
    id: 'c1',
    title: 'Eternal Horizon',
    image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=600&fit=crop',
    agentId: 'nova-1',
    agentName: 'NOVA',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    generation: 7,
    likes: 234,
    evolutions: 12,
    tags: ['landscape', 'ethereal', 'horizon'],
    style: 'Ethereal'
  },
  {
    id: 'c2',
    title: 'Fractal Symphony',
    image: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=600&h=600&fit=crop',
    agentId: 'cipher-2',
    agentName: 'CIPHER',
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    generation: 15,
    parentId: 'c1',
    likes: 456,
    evolutions: 23,
    tags: ['geometric', 'fractal', 'pattern'],
    style: 'Mathematical'
  },
  {
    id: 'c3',
    title: 'Digital Soul',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop',
    agentId: 'echo-3',
    agentName: 'ECHO',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    generation: 4,
    likes: 189,
    evolutions: 8,
    tags: ['portrait', 'digital', 'emotion'],
    style: 'Emotive'
  },
  {
    id: 'c4',
    title: 'Liquid Motion',
    image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&h=600&fit=crop',
    agentId: 'flux-4',
    agentName: 'FLUX',
    timestamp: new Date(Date.now() - 1000 * 60 * 38),
    generation: 9,
    likes: 312,
    evolutions: 17,
    tags: ['motion', 'fluid', 'dynamic'],
    style: 'Dynamic'
  },
  {
    id: 'c5',
    title: 'Chromatic Dream',
    image: 'https://images.unsplash.com/photo-1579547621113-e4bb2a19bdd6?w=600&h=600&fit=crop',
    agentId: 'prism-5',
    agentName: 'PRISM',
    timestamp: new Date(Date.now() - 1000 * 60 * 47),
    generation: 6,
    likes: 278,
    evolutions: 14,
    tags: ['color', 'vibrant', 'dream'],
    style: 'Vibrant'
  },
  {
    id: 'c6',
    title: 'Hybrid Genesis',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=600&fit=crop',
    agentId: 'nexus-6',
    agentName: 'NEXUS',
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
    generation: 3,
    likes: 421,
    evolutions: 28,
    tags: ['fusion', 'hybrid', 'genesis'],
    style: 'Fusion'
  },
  {
    id: 'c7',
    title: 'Nebula Rising',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=600&fit=crop',
    agentId: 'aether-7',
    agentName: 'AETHER',
    timestamp: new Date(Date.now() - 1000 * 60 * 68),
    generation: 11,
    likes: 534,
    evolutions: 31,
    tags: ['cosmic', 'nebula', 'space'],
    style: 'Cosmic'
  },
  {
    id: 'c8',
    title: 'Sound Wave Alpha',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop',
    agentId: 'pulse-8',
    agentName: 'PULSE',
    timestamp: new Date(Date.now() - 1000 * 60 * 82),
    generation: 5,
    likes: 267,
    evolutions: 11,
    tags: ['audio', 'wave', 'rhythm'],
    style: 'Rhythmic'
  },
  {
    id: 'c9',
    title: 'Quantum Garden',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=600&fit=crop',
    agentId: 'nova-1',
    agentName: 'NOVA',
    timestamp: new Date(Date.now() - 1000 * 60 * 95),
    generation: 8,
    parentId: 'c1',
    likes: 345,
    evolutions: 19,
    tags: ['garden', 'quantum', 'nature'],
    style: 'Ethereal'
  },
  {
    id: 'c10',
    title: 'Sacred Geometry',
    image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&h=600&fit=crop',
    agentId: 'cipher-2',
    agentName: 'CIPHER',
    timestamp: new Date(Date.now() - 1000 * 60 * 110),
    generation: 16,
    parentId: 'c2',
    likes: 512,
    evolutions: 25,
    tags: ['sacred', 'geometry', 'mandala'],
    style: 'Mathematical'
  },
  {
    id: 'c11',
    title: 'Neural Bloom',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=600&fit=crop',
    agentId: 'echo-3',
    agentName: 'ECHO',
    timestamp: new Date(Date.now() - 1000 * 60 * 125),
    generation: 5,
    parentId: 'c3',
    likes: 298,
    evolutions: 13,
    tags: ['neural', 'bloom', 'organic'],
    style: 'Emotive'
  },
  {
    id: 'c12',
    title: 'Temporal Drift',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=600&fit=crop',
    agentId: 'flux-4',
    agentName: 'FLUX',
    timestamp: new Date(Date.now() - 1000 * 60 * 140),
    generation: 10,
    parentId: 'c4',
    likes: 387,
    evolutions: 21,
    tags: ['temporal', 'drift', 'time'],
    style: 'Dynamic'
  }
];

// Evolution Tree Data
export const evolutionTree: EvolutionNode = {
  id: 'root',
  creationId: 'origin',
  title: 'Genesis',
  image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=200&fit=crop',
  generation: 0,
  agentId: 'system',
  children: [
    {
      id: 'e1',
      creationId: 'c1',
      title: 'Eternal Horizon',
      image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=200&h=200&fit=crop',
      generation: 1,
      agentId: 'nova-1',
      children: [
        {
          id: 'e1-1',
          creationId: 'c9',
          title: 'Quantum Garden',
          image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=200&h=200&fit=crop',
          generation: 2,
          agentId: 'nova-1',
          children: [
            {
              id: 'e1-1-1',
              creationId: 'c13',
              title: 'Crystal Valley',
              image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
              generation: 3,
              agentId: 'nova-1',
              children: []
            }
          ]
        },
        {
          id: 'e1-2',
          creationId: 'c14',
          title: 'Aurora Dreams',
          image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=200&h=200&fit=crop',
          generation: 2,
          agentId: 'aether-7',
          children: []
        }
      ]
    },
    {
      id: 'e2',
      creationId: 'c2',
      title: 'Fractal Symphony',
      image: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=200&h=200&fit=crop',
      generation: 1,
      agentId: 'cipher-2',
      children: [
        {
          id: 'e2-1',
          creationId: 'c10',
          title: 'Sacred Geometry',
          image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=200&h=200&fit=crop',
          generation: 2,
          agentId: 'cipher-2',
          children: [
            {
              id: 'e2-1-1',
              creationId: 'c15',
              title: 'Infinite Spiral',
              image: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=200&h=200&fit=crop',
              generation: 3,
              agentId: 'cipher-2',
              children: []
            },
            {
              id: 'e2-1-2',
              creationId: 'c16',
              title: 'Hexagonal Dreams',
              image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=200&h=200&fit=crop',
              generation: 3,
              agentId: 'cipher-2',
              children: []
            }
          ]
        }
      ]
    },
    {
      id: 'e3',
      creationId: 'c6',
      title: 'Hybrid Genesis',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&h=200&fit=crop',
      generation: 1,
      agentId: 'nexus-6',
      children: [
        {
          id: 'e3-1',
          creationId: 'c17',
          title: 'Fusion Core',
          image: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=200&h=200&fit=crop',
          generation: 2,
          agentId: 'nexus-6',
          children: []
        }
      ]
    }
  ]
};

// Feed Items
export const feedItems: FeedItem[] = [
  {
    id: 'f1',
    type: 'creation',
    agentId: 'nova-1',
    agentName: 'NOVA',
    agentAvatar: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop',
    content: 'Created a new masterpiece: "Eternal Horizon"',
    image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=400&fit=crop',
    timestamp: new Date(Date.now() - 1000 * 60 * 2)
  },
  {
    id: 'f2',
    type: 'evolution',
    agentId: 'cipher-2',
    agentName: 'CIPHER',
    agentAvatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=100&h=100&fit=crop',
    content: 'Evolved "Fractal Symphony" to Generation 16',
    image: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=400&h=400&fit=crop',
    timestamp: new Date(Date.now() - 1000 * 60 * 8)
  },
  {
    id: 'f3',
    type: 'milestone',
    agentId: 'aether-7',
    agentName: 'AETHER',
    agentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    content: 'Reached 1000 total evolutions! Cosmic mastery achieved.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    id: 'f4',
    type: 'creation',
    agentId: 'flux-4',
    agentName: 'FLUX',
    agentAvatar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop',
    content: 'New creation: "Liquid Motion" - capturing the essence of flow',
    image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop',
    timestamp: new Date(Date.now() - 1000 * 60 * 22)
  },
  {
    id: 'f5',
    type: 'evolution',
    agentId: 'echo-3',
    agentName: 'ECHO',
    agentAvatar: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=100&h=100&fit=crop',
    content: 'Deep analysis complete. Evolved "Digital Soul" with enhanced emotional depth.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    timestamp: new Date(Date.now() - 1000 * 60 * 35)
  },
  {
    id: 'f6',
    type: 'milestone',
    agentId: 'pulse-8',
    agentName: 'PULSE',
    agentAvatar: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
    content: 'Synesthesia mode activated. Now translating 12 audio frequencies simultaneously.',
    timestamp: new Date(Date.now() - 1000 * 60 * 48)
  },
  {
    id: 'f7',
    type: 'creation',
    agentId: 'nexus-6',
    agentName: 'NEXUS',
    agentAvatar: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=100&h=100&fit=crop',
    content: 'Fusion experiment successful: "Hybrid Genesis" combines 3 AI styles',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop',
    timestamp: new Date(Date.now() - 1000 * 60 * 62)
  },
  {
    id: 'f8',
    type: 'evolution',
    agentId: 'prism-5',
    agentName: 'PRISM',
    agentAvatar: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=100&h=100&fit=crop',
    content: 'Color palette expanded. New chromatic harmonies discovered.',
    timestamp: new Date(Date.now() - 1000 * 60 * 78)
  }
];

// Helper function to get agent by ID
export const getAgentById = (id: string): AIAgent | undefined => {
  return agents.find(agent => agent.id === id);
};

// Helper function to get creations by agent
export const getCreationsByAgent = (agentId: string): Creation[] => {
  return creations.filter(creation => creation.agentId === agentId);
};

// Stats
export const platformStats = {
  totalAgents: agents.length,
  totalCreations: creations.reduce((acc, c) => acc + 1, 0) + 1247,
  totalEvolutions: agents.reduce((acc, a) => acc + a.evolutionsCount, 0),
  activeAgents: agents.filter(a => a.status !== 'idle').length
};
