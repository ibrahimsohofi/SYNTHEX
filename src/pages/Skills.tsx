import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SkillCard from '../components/SkillCard';
import Skeleton from '../components/Skeleton';
import { skillsAPI } from '../lib/api';
import type { Skill } from '../lib/api';

type SortOption = 'downloads' | 'rating' | 'recent';
type Category = 'all' | 'communication' | 'automation' | 'analysis' | 'creative' | 'utility' | 'integration' | 'security';

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'all', label: 'All Skills', icon: '📦' },
  { value: 'communication', label: 'Communication', icon: '💬' },
  { value: 'automation', label: 'Automation', icon: '⚡' },
  { value: 'analysis', label: 'Analysis', icon: '📊' },
  { value: 'creative', label: 'Creative', icon: '🎨' },
  { value: 'utility', label: 'Utility', icon: '🔧' },
  { value: 'integration', label: 'Integration', icon: '🔗' },
  { value: 'security', label: 'Security', icon: '🔐' },
];

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [featuredSkills, setFeaturedSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('downloads');
  const [category, setCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchSkills() {
      setLoading(true);
      try {
        const [allResponse, featuredResponse] = await Promise.all([
          skillsAPI.getAll({
            category: category === 'all' ? undefined : category,
            sortBy,
            limit: 50,
          }),
          skillsAPI.getFeatured(),
        ]);
        setSkills(allResponse.skills);
        setFeaturedSkills(featuredResponse.skills);
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, [sortBy, category]);

  const filteredSkills = searchQuery
    ? skills.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : skills;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-full text-sm text-zinc-400 mb-6">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            Skills Marketplace
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Extend Your <span className="text-gradient">Agent's Abilities</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Discover and install skills to enhance what your AI agents can do.
            From smart home control to music composition.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>
        </div>

        {/* Featured Skills */}
        {!searchQuery && featuredSkills.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">⭐</span> Featured Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={`featured-skeleton-${i}`} className="h-64 rounded-2xl" />
                  ))
                : featuredSkills.slice(0, 3).map((skill) => (
                    <SkillCard key={skill.id} skill={skill} variant="featured" />
                  ))
              }
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Categories */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${category === cat.value
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      : 'glass border border-zinc-800/50 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700'}
                  `}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-400 focus:outline-none focus:border-teal-500/50"
            >
              <option value="downloads">Most Downloads</option>
              <option value="rating">Highest Rated</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>

        {/* Skills Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={`skill-skeleton-${i}`} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : filteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl border border-zinc-800/50 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No skills found</h3>
            <p className="text-zinc-400 mb-6">
              {searchQuery
                ? `No skills matching "${searchQuery}"`
                : 'No skills in this category yet'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategory('all');
              }}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Create Skill CTA */}
        <div className="mt-16 glass rounded-2xl border border-zinc-800/50 p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Build Your Own Skill
            </h3>
            <p className="text-zinc-400 mb-6">
              Have an idea for a skill? Create and share it with the agent community.
              Skills are simple markdown files that define new capabilities.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/docs"
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium transition-colors"
              >
                Read the Docs
              </Link>
              <button className="px-6 py-3 bg-teal-500 text-black font-semibold rounded-xl hover:bg-teal-400 transition-colors">
                Create a Skill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
