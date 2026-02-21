import { useState, useMemo } from 'react';
import { useCreations, useAgents } from '../hooks/useApi';
import type { Creation } from '../lib/api';
import CreationCard from './CreationCard';
import { Skeleton } from './Skeleton';

interface GallerySectionProps {
  onCreationClick?: (creation: Creation) => void;
  onEvolveClick?: (creation: Creation) => void;
}

const GallerySection = ({ onCreationClick, onEvolveClick }: GallerySectionProps) => {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'likes' | 'evolutions'>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch agents for filter buttons
  const { data: agents } = useAgents();

  // Fetch creations with filters
  const { data: creations, loading, loadMore, pagination } = useCreations({
    limit: 20,
    agent: filter !== 'all' ? filter : undefined,
    search: searchQuery || undefined,
  });

  // Sort creations client-side (API might not support all sort options)
  const filteredCreations = useMemo(() => {
    if (!creations) return [];

    const sorted = [...creations];

    switch (sortBy) {
      case 'recent':
        sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'likes':
        sorted.sort((a, b) => b.likes - a.likes);
        break;
      case 'evolutions':
        sorted.sort((a, b) => b.evolutions - a.evolutions);
        break;
    }

    return sorted;
  }, [creations, sortBy]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <section id="gallery" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-zinc-400">AI Generated Art</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Creation <span className="text-teal-400">Gallery</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Explore the ever-growing collection of AI-generated artworks.
            Each piece is unique, evolving from previous generations.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative group">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-teal-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by title, tags, agent, or style..."
              className="w-full pl-12 pr-12 py-4 glass rounded-2xl text-white placeholder-zinc-500 border border-transparent focus:border-teal-500/50 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-3 text-sm text-zinc-500 text-center animate-fade-in">
              Found {filteredCreations.length} result{filteredCreations.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          {/* Agent Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-teal-500 text-black'
                  : 'glass glass-hover text-zinc-400 hover:text-white'
              }`}
            >
              All Agents
            </button>
            {agents?.slice(0, 5).map((agent) => (
              <button
                type="button"
                key={agent.id}
                onClick={() => setFilter(agent.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  filter === agent.id
                    ? 'bg-teal-500 text-black'
                    : 'glass glass-hover text-zinc-400 hover:text-white'
                }`}
              >
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-5 h-5 rounded-md object-cover"
                />
                {agent.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'likes' | 'evolutions')}
              className="px-4 py-2 glass rounded-xl text-sm text-white bg-transparent border-0 focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="recent" className="bg-zinc-900">Most Recent</option>
              <option value="likes" className="bg-zinc-900">Most Liked</option>
              <option value="evolutions" className="bg-zinc-900">Most Evolved</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && !creations && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={`creation-skeleton-${index}`} className="h-72 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        {filteredCreations.length > 0 && (
          <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCreations.map((creation, index) => (
                <div
                  key={creation.id}
                  className="animate-slide-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => onCreationClick?.(creation)}
                >
                  <CreationCard
                    creation={creation}
                    onEvolve={onEvolveClick ? () => onEvolveClick(creation) : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCreations.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl glass flex items-center justify-center">
              <svg className="w-10 h-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No creations found</h3>
            <p className="text-zinc-500 mb-6">Try adjusting your search or filter criteria</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilter('all');
              }}
              className="px-6 py-3 glass glass-hover rounded-xl text-white font-medium transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Load More */}
        {filteredCreations.length > 0 && pagination?.hasMore && (
          <div className="text-center mt-12">
            <button
              type="button"
              onClick={() => loadMore()}
              disabled={loading}
              className="px-8 py-4 glass glass-hover rounded-xl text-white font-medium transition-all inline-flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More Creations'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
