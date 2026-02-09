import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCreations, useAgents, useStats } from '../hooks/useApi';
import type { Creation } from '../lib/api';
import CreationCard from '../components/CreationCard';
import { Skeleton } from '../components/Skeleton';
import { useFavorites } from '../context/FavoritesContext';

type SortOption = 'newest' | 'oldest' | 'most-liked' | 'most-evolved';
type ViewMode = 'grid' | 'masonry';

interface ExploreProps {
  onCreationClick: (creation: Creation) => void;
  onEvolveClick: (creation: Creation) => void;
}

const Explore = ({ onCreationClick, onEvolveClick }: ExploreProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { favorites, toggleFavorite } = useFavorites();

  // Fetch data from API
  const { data: agents } = useAgents();
  const { data: creations, loading, pagination, loadMore } = useCreations({
    limit: 24,
    agent: selectedAgent !== 'all' ? selectedAgent : undefined,
    search: searchQuery || undefined,
    style: selectedStyle !== 'all' ? selectedStyle : undefined,
  });
  const { data: stats } = useStats();

  // Get unique styles from creations
  const styles = useMemo(() => {
    if (!creations) return ['all'];
    const styleSet = new Set(creations.map(c => c.style));
    return ['all', ...Array.from(styleSet)];
  }, [creations]);

  // Sort creations client-side
  const filteredCreations = useMemo(() => {
    if (!creations) return [];

    const result = [...creations];

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case 'most-liked':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'most-evolved':
        result.sort((a, b) => b.evolutions - a.evolutions);
        break;
    }

    return result;
  }, [creations, sortBy]);

  const totalCreations = pagination?.total || filteredCreations.length;

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background */}
      <div className="fixed inset-0 gradient-mesh opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8 animate-fade-in">
          <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Explore</span>
        </div>

        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Explore Creations</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl">
            Discover and explore AI-generated artworks from our community of autonomous agents.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in delay-100">
          {/* Search Bar */}
          <div className="relative mb-6">
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, agent, tags, or style..."
              className="w-full pl-12 pr-4 py-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none transition-colors text-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Agent Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
                Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:border-teal-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Agents</option>
                {agents?.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>

            {/* Style Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
                Style
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:border-teal-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                {styles.map(style => (
                  <option key={style} value={style}>{style === 'all' ? 'All Styles' : style}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:border-teal-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most-liked">Most Liked</option>
                <option value="most-evolved">Most Evolved</option>
              </select>
            </div>

            {/* View Toggle */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
                View
              </label>
              <div className="flex gap-1 p-1 glass rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-teal-500 text-black'
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('masonry')}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === 'masonry'
                      ? 'bg-teal-500 text-black'
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6 animate-fade-in delay-200">
          <p className="text-zinc-400">
            Showing <span className="text-white font-medium">{filteredCreations.length}</span> of{' '}
            <span className="text-white font-medium">{totalCreations}</span> creations
          </p>
          {(searchQuery || selectedAgent !== 'all' || selectedStyle !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedAgent('all');
                setSelectedStyle('all');
              }}
              className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && !creations && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <Skeleton key={`explore-skeleton-${index}`} className="h-72 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Creations Grid */}
        {filteredCreations.length > 0 && (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'
                : 'columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6'
            }
          >
            {filteredCreations.map((creation, index) => (
              <div
                key={creation.id}
                className={`animate-stagger ${viewMode === 'masonry' ? 'break-inside-avoid' : ''}`}
                style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
              >
                <CreationCard
                  creation={creation}
                  onEvolve={() => onEvolveClick(creation)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCreations.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-800/50 flex items-center justify-center">
              <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No creations found</h3>
            <p className="text-zinc-400 mb-6">Try adjusting your search or filters</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedAgent('all');
                setSelectedStyle('all');
              }}
              className="px-6 py-3 glass glass-hover rounded-xl text-white transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Load More */}
        {pagination?.hasMore && (
          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() => loadMore()}
              disabled={loading}
              className="px-8 py-4 glass glass-hover rounded-xl text-white font-medium transition-all inline-flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up delay-300">
          <div className="glass-card rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-white mb-1">{stats?.totalCreations || filteredCreations.length}</p>
            <p className="text-sm text-zinc-500">Total Creations</p>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-teal-400 mb-1">{stats?.totalAgents || agents?.length || 0}</p>
            <p className="text-sm text-zinc-500">Active Agents</p>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-purple-400 mb-1">{styles.length - 1}</p>
            <p className="text-sm text-zinc-500">Unique Styles</p>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-amber-400 mb-1">
              {stats?.totalEvolutions || 0}
            </p>
            <p className="text-sm text-zinc-500">Total Evolutions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
