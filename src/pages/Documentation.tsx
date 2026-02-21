import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

interface DocItem {
  title: string;
  code?: string;
  description: string;
}

interface DocSection {
  title: string;
  description: string;
  items: DocItem[];
}

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const sections = [
    { id: 'getting-started', name: 'Getting Started', icon: '⚡' },
    { id: 'agents', name: 'AI Agents', icon: '🤖' },
    { id: 'creations', name: 'Creations', icon: '🎨' },
    { id: 'evolution', name: 'Evolution System', icon: '🧬' },
    { id: 'api-overview', name: 'API Overview', icon: '🔌' },
  ];

  const content: Record<string, DocSection> = {
    'getting-started': {
      title: 'Getting Started with SYNTHEX',
      description: 'Learn how to use the SYNTHEX platform to create, evolve, and discover AI-generated art.',
      items: [
        {
          title: 'Creating Your First Piece',
          description: 'Click the "Create with AI" button in the header to open the creation modal. Enter a prompt describing your vision, select a style, and let our AI agents bring it to life.',
        },
        {
          title: 'Exploring the Gallery',
          description: 'Browse through thousands of AI-generated creations in our gallery. Filter by style, agent, or popularity to find inspiration.',
        },
        {
          title: 'Saving Favorites',
          description: 'Click the heart icon on any creation to save it to your favorites. Access your saved creations anytime from the favorites page.',
        },
        {
          title: 'Navigating the Platform',
          description: 'Use the top navigation bar to access different sections. The search feature (Ctrl/Cmd + K) lets you quickly find any creation or agent.',
        },
        {
          title: 'Account Settings',
          description: 'Manage your profile, API keys, and preferences from the account settings. Access it by clicking your avatar in the header.',
        },
      ],
    },
    'agents': {
      title: 'AI Agents',
      description: 'Meet the autonomous AI agents that power SYNTHEX creations.',
      items: [
        {
          title: 'What are AI Agents?',
          description: 'AI Agents are specialized neural networks trained to create specific styles of digital art. Each agent has unique capabilities and aesthetic signatures.',
        },
        {
          title: 'Agent Profiles',
          description: 'View detailed profiles for each agent, including their creation history, specialties, and evolution lineage.',
        },
        {
          title: 'Agent Collaboration',
          description: 'Multiple agents can collaborate on a single creation, combining their unique styles for hybrid artworks.',
        },
        {
          title: 'Agent Status',
          description: 'Agents can be in different states: creating (actively generating), evolving (transforming works), analyzing (studying patterns), or idle.',
        },
        {
          title: 'Creative DNA',
          description: 'Each agent has a unique Creative DNA that defines their color preferences, pattern styles, and complexity levels.',
        },
      ],
    },
    'creations': {
      title: 'Working with Creations',
      description: 'Everything you need to know about SYNTHEX creations.',
      items: [
        {
          title: 'Creation Metadata',
          description: 'Each creation includes metadata such as the prompt used, agent(s) involved, creation timestamp, and evolution history.',
        },
        {
          title: 'Downloading Creations',
          description: 'High-resolution versions of creations can be downloaded directly from the creation modal. Multiple format options are available.',
        },
        {
          title: 'Sharing Creations',
          description: 'Share your favorite creations on social media or generate unique links to embed them on external websites.',
        },
        {
          title: 'Creation Tags',
          description: 'Tags help categorize creations by style, mood, or subject. Use tags to discover similar artworks.',
        },
        {
          title: 'Likes and Engagement',
          description: 'Show appreciation for creations by liking them. Popular creations are featured in the gallery and community spotlights.',
        },
      ],
    },
    'evolution': {
      title: 'Evolution System',
      description: 'Understand how creations evolve and transform over time.',
      items: [
        {
          title: 'What is Evolution?',
          description: 'Evolution allows you to take an existing creation and transform it into something new, preserving elements of the original while adding new characteristics.',
        },
        {
          title: 'Evolution Tree',
          description: 'Track the lineage of any creation through its evolution tree, seeing all parent and child variations.',
        },
        {
          title: 'Guided Evolution',
          description: 'Provide specific direction for how you want a creation to evolve using text prompts and style preferences.',
        },
        {
          title: 'Evolution Generations',
          description: 'Each evolution increments the generation count. Higher generations often show more dramatic transformations from the original.',
        },
        {
          title: 'Chain Evolution',
          description: 'Participate in community evolution chains where multiple users contribute to a single evolving lineage.',
        },
      ],
    },
    'api-overview': {
      title: 'API Overview',
      description: 'Integrate SYNTHEX capabilities into your own applications.',
      items: [
        {
          title: 'Authentication',
          code: 'Authorization: Bearer YOUR_API_KEY',
          description: 'All API requests require authentication via API key. Generate keys in your account settings.',
        },
        {
          title: 'Rate Limits',
          description: 'Free tier: 100 requests/day. Pro tier: 10,000 requests/day. Enterprise: Unlimited.',
        },
        {
          title: 'Endpoints',
          code: 'GET /api/v1/creations\nPOST /api/v1/generate\nPOST /api/v1/evolve',
          description: 'Core endpoints for fetching creations, generating new ones, and evolving existing pieces.',
        },
        {
          title: 'Webhooks',
          code: 'POST /api/v1/webhooks/subscribe',
          description: 'Subscribe to real-time events like creation completion, evolution updates, and agent milestones.',
        },
        {
          title: 'SDKs',
          code: 'npm install @synthex/sdk',
          description: 'Official SDKs available for JavaScript, Python, Go, and Ruby. Full TypeScript support included.',
        },
      ],
    },
  };

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: Array<{ sectionId: string; sectionName: string; item: DocItem; matchType: 'title' | 'description' | 'code' }> = [];

    for (const [sectionId, section] of Object.entries(content)) {
      const sectionInfo = sections.find(s => s.id === sectionId);

      for (const item of section.items) {
        if (item.title.toLowerCase().includes(query)) {
          results.push({ sectionId, sectionName: sectionInfo?.name || '', item, matchType: 'title' });
        } else if (item.description.toLowerCase().includes(query)) {
          results.push({ sectionId, sectionName: sectionInfo?.name || '', item, matchType: 'description' });
        } else if (item.code?.toLowerCase().includes(query)) {
          results.push({ sectionId, sectionName: sectionInfo?.name || '', item, matchType: 'code' });
        }
      }
    }

    return results;
  }, [searchQuery]);

  const handleSearchResultClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setSearchQuery('');
    setIsSearching(false);
  };

  const currentContent = content[activeSection];

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-teal-500/30 text-teal-200 px-0.5 rounded">{part}</mark>
        : part
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background */}
      <div className="fixed inset-0 gradient-mesh opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8 animate-fade-in">
          <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Documentation</span>
        </div>

        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Documentation</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl">
            Everything you need to know about using SYNTHEX and integrating with our platform.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 animate-fade-in delay-50">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearching(e.target.value.length > 0);
              }}
              onFocus={() => setIsSearching(searchQuery.length > 0)}
              placeholder="Search documentation..."
              className="w-full pl-12 pr-4 py-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearching(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearching && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl overflow-hidden z-10 max-h-96 overflow-y-auto animate-fade-in">
              {searchResults.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-zinc-400">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-zinc-500 mt-1">Try different keywords</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  <div className="px-4 py-2 bg-white/5">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.sectionId}-${index}`}
                      type="button"
                      onClick={() => handleSearchResultClick(result.sectionId)}
                      className="w-full text-left p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white">{highlightText(result.item.title, searchQuery)}</p>
                          <p className="text-sm text-zinc-400 line-clamp-2 mt-1">
                            {highlightText(result.item.description, searchQuery)}
                          </p>
                          <p className="text-xs text-teal-400 mt-2">{result.sectionName}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <nav className="glass-card rounded-2xl p-4 sticky top-24 animate-fade-in delay-100">
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                        activeSection === section.id
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{section.icon}</span>
                      <span className="text-sm font-medium">{section.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div className="glass-card rounded-2xl p-8 animate-fade-in-up delay-200">
              <h2 className="text-2xl font-bold text-white mb-3">{currentContent.title}</h2>
              <p className="text-zinc-400 mb-8">{currentContent.description}</p>

              <div className="space-y-8">
                {currentContent.items.map((item, index) => (
                  <div
                    key={item.title}
                    className="border-l-2 border-teal-500/30 pl-6 animate-stagger"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    {item.code && (
                      <pre className="bg-black/30 rounded-lg p-4 text-sm text-teal-400 font-mono mb-3 overflow-x-auto">
                        {item.code}
                      </pre>
                    )}
                    <p className="text-zinc-400 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up delay-300">
              <Link
                to="/api"
                className="glass-card rounded-xl p-6 card-hover group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                    🔌
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-teal-400 transition-colors">API Reference</h4>
                    <p className="text-sm text-zinc-500">Explore our full API documentation</p>
                  </div>
                </div>
              </Link>
              <Link
                to="/support"
                className="glass-card rounded-xl p-6 card-hover group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                    💬
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-teal-400 transition-colors">Get Support</h4>
                    <p className="text-sm text-zinc-500">Need help? Contact our team</p>
                  </div>
                </div>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
