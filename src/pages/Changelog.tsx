import { useState } from 'react';

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  title: string;
  description: string;
  changes: {
    category: 'new' | 'improved' | 'fixed' | 'removed';
    items: string[];
  }[];
}

const changelogData: ChangelogEntry[] = [
  {
    version: '2.1.0',
    date: 'February 1, 2026',
    type: 'minor',
    title: 'Enhanced Evolution System',
    description: 'Major improvements to the evolution algorithm and new collaborative features.',
    changes: [
      {
        category: 'new',
        items: [
          'Multi-agent collaboration - combine up to 3 agents on a single creation',
          'Evolution presets - save and share your favorite evolution settings',
          'Batch evolution - evolve multiple creations simultaneously',
          'Discord integration for real-time notifications',
        ],
      },
      {
        category: 'improved',
        items: [
          'Evolution algorithm now preserves 40% more original characteristics',
          'Reduced generation time by 60% with new inference optimization',
          'Enhanced color consistency across evolution chains',
          'Better mobile experience with gesture controls',
        ],
      },
      {
        category: 'fixed',
        items: [
          'Fixed rare issue where evolutions would timeout on complex creations',
          'Resolved memory leak in long-running sessions',
          'Fixed incorrect generation count display in evolution tree',
        ],
      },
    ],
  },
  {
    version: '2.0.0',
    date: 'January 28, 2026',
    type: 'major',
    title: 'SYNTHEX 2.0 - The Future of AI Art',
    description: 'A complete platform overhaul with breakthrough AI capabilities.',
    changes: [
      {
        category: 'new',
        items: [
          'All-new neural architecture for dramatically improved output quality',
          '6 new AI agents: PRISM, CIPHER, FLUX, ECHO, AETHER, and PHANTOM',
          'Real-time generation - creations in under 5 seconds',
          'Evolution trees - visualize and navigate creation lineages',
          'Community evolution chains - collaborate with other creators',
          'API v2 with webhooks and improved rate limits',
          'Private creations for Pro and Enterprise users',
        ],
      },
      {
        category: 'improved',
        items: [
          'Completely redesigned user interface',
          'New glass-morphism design language',
          'Maximum resolution increased to 4K for Enterprise',
          'Search now includes semantic understanding',
          'Gallery loads 3x faster with virtual scrolling',
        ],
      },
      {
        category: 'removed',
        items: [
          'Legacy API v1 endpoints (deprecated since 1.8)',
          'Flash-based preview mode',
          'Old agent personalities (migrated to new system)',
        ],
      },
    ],
  },
  {
    version: '1.9.2',
    date: 'January 15, 2026',
    type: 'patch',
    title: 'Bug Fixes & Performance',
    description: 'Stability improvements and bug fixes in preparation for 2.0.',
    changes: [
      {
        category: 'fixed',
        items: [
          'Fixed authentication issues on Safari browsers',
          'Resolved image loading failures on slow connections',
          'Fixed favorites not syncing across devices',
          'Corrected timezone issues in creation timestamps',
        ],
      },
      {
        category: 'improved',
        items: [
          'Reduced initial bundle size by 25%',
          'Improved caching for faster repeat visits',
          'Better error messages for failed generations',
        ],
      },
    ],
  },
  {
    version: '1.9.0',
    date: 'December 20, 2025',
    type: 'minor',
    title: 'Holiday Update',
    description: 'New features and improvements for the holiday season.',
    changes: [
      {
        category: 'new',
        items: [
          'Seasonal style presets for holiday-themed creations',
          'Gift cards - share SYNTHEX Pro with friends',
          'Creation collections - organize your work into albums',
          'Download in multiple formats (PNG, JPEG, WebP)',
        ],
      },
      {
        category: 'improved',
        items: [
          'Agent response time improved by 30%',
          'Enhanced prompt understanding for complex requests',
          'Better handling of artistic terminology',
        ],
      },
    ],
  },
  {
    version: '1.8.0',
    date: 'November 10, 2025',
    type: 'minor',
    title: 'API & Developer Tools',
    description: 'Major API improvements for developers and integrators.',
    changes: [
      {
        category: 'new',
        items: [
          'Official SDKs for JavaScript, Python, Go, and Ruby',
          'Webhook support for real-time events',
          'API playground for testing endpoints',
          'Rate limit headers for better throttling management',
        ],
      },
      {
        category: 'improved',
        items: [
          'API response times reduced by 50%',
          'Better error codes and messages',
          'Comprehensive API documentation with examples',
        ],
      },
      {
        category: 'removed',
        items: [
          'Deprecated old authentication method (use Bearer tokens)',
        ],
      },
    ],
  },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'new':
      return 'bg-teal-500/20 text-teal-400';
    case 'improved':
      return 'bg-blue-500/20 text-blue-400';
    case 'fixed':
      return 'bg-amber-500/20 text-amber-400';
    case 'removed':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-zinc-500/20 text-zinc-400';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'new':
      return 'New';
    case 'improved':
      return 'Improved';
    case 'fixed':
      return 'Fixed';
    case 'removed':
      return 'Removed';
    default:
      return category;
  }
};

const getVersionBadge = (type: string) => {
  switch (type) {
    case 'major':
      return 'bg-teal-500 text-black';
    case 'minor':
      return 'bg-blue-500/20 text-blue-400';
    case 'patch':
      return 'bg-zinc-500/20 text-zinc-400';
    default:
      return 'bg-zinc-500/20 text-zinc-400';
  }
};

const Changelog = () => {
  const [filter, setFilter] = useState<'all' | 'major' | 'minor' | 'patch'>('all');

  const filteredChangelog = changelogData.filter(
    (entry) => filter === 'all' || entry.type === filter
  );

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative py-16">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block px-4 py-1.5 glass rounded-full text-sm text-teal-400 font-medium mb-6">
            What's New
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Changelog
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Stay up to date with the latest features, improvements, and fixes.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
        <div className="flex items-center justify-center gap-3">
          {(['all', 'major', 'minor', 'patch'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === type
                  ? 'bg-teal-500 text-black'
                  : 'glass glass-hover text-zinc-400'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Changelog Entries */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="space-y-8">
          {filteredChangelog.map((entry, index) => (
            <article
              key={entry.version}
              className="glass-card rounded-2xl p-8 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getVersionBadge(entry.type)}`}>
                  v{entry.version}
                </span>
                <span className="text-zinc-500 text-sm">{entry.date}</span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">{entry.title}</h2>
              <p className="text-zinc-400 mb-6">{entry.description}</p>

              {/* Changes */}
              <div className="space-y-6">
                {entry.changes.map((changeGroup) => (
                  <div key={changeGroup.category}>
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider mb-3 ${getCategoryColor(changeGroup.category)}`}>
                      {getCategoryLabel(changeGroup.category)}
                    </span>
                    <ul className="space-y-2">
                      {changeGroup.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <span className="text-zinc-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 mt-16">
        <div className="glass-card rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Stay Updated</h3>
          <p className="text-zinc-400 mb-6">
            Get notified when we release new features and updates.
          </p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 glass rounded-xl bg-transparent text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Changelog;
