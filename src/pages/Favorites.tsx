import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { creations, agents, type Creation } from '../data/agents';
import CreationCard from '../components/CreationCard';
import { SkeletonGrid } from '../components/Skeleton';

interface FavoritesProps {
  onCreationClick: (creation: Creation) => void;
  onEvolveClick: (creation: Creation) => void;
}

type SortOption = 'newest' | 'oldest' | 'likes' | 'evolutions';
type FilterAgent = string | 'all';
type FilterStyle = string | 'all';

const Favorites = ({ onCreationClick, onEvolveClick }: FavoritesProps) => {
  const navigate = useNavigate();
  const { favorites, savedCreations } = useFavorites();
  const [activeTab, setActiveTab] = useState<'liked' | 'saved'>('liked');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterAgent, setFilterAgent] = useState<FilterAgent>('all');
  const [filterStyle, setFilterStyle] = useState<FilterStyle>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Simulate loading for effect
  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [activeTab]);

  const likedCreations = creations.filter(c => favorites.includes(c.id));
  const saved = creations.filter(c => savedCreations.includes(c.id));
  const baseCreations = activeTab === 'liked' ? likedCreations : saved;

  // Get unique styles and agents from user's collections
  const uniqueStyles = useMemo(() => {
    const styles = new Set(baseCreations.map(c => c.style));
    return Array.from(styles);
  }, [baseCreations]);

  const usedAgentIds = useMemo(() => {
    const agentIds = new Set(baseCreations.map(c => c.agentId));
    return agents.filter(a => agentIds.has(a.id));
  }, [baseCreations]);

  // Apply filters and sorting
  const displayedCreations = useMemo(() => {
    let filtered = [...baseCreations];

    // Filter by agent
    if (filterAgent !== 'all') {
      filtered = filtered.filter(c => c.agentId === filterAgent);
    }

    // Filter by style
    if (filterStyle !== 'all') {
      filtered = filtered.filter(c => c.style === filterStyle);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        break;
      case 'likes':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'evolutions':
        filtered.sort((a, b) => b.evolutions - a.evolutions);
        break;
    }

    return filtered;
  }, [baseCreations, filterAgent, filterStyle, sortBy]);

  const clearFilters = () => {
    setFilterAgent('all');
    setFilterStyle('all');
    setSortBy('newest');
  };

  const hasActiveFilters = filterAgent !== 'all' || filterStyle !== 'all' || sortBy !== 'newest';

  return (
    <div className="min-h-screen pt-20">
      {/* Background */}
      <div className="fixed inset-0 gradient-mesh opacity-30 pointer-events-none" />

      {/* Back Button */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>
      </div>

      {/* Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm text-zinc-400">Your Collection</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            My <span className="text-teal-400">Favorites</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Your curated collection of liked and saved AI creations
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <button
            type="button"
            onClick={() => setActiveTab('liked')}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === 'liked'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-scale-in'
                : 'glass glass-hover text-zinc-400 hover:text-white'
            }`}
          >
            <svg className={`w-5 h-5 transition-transform ${activeTab === 'liked' ? 'scale-110' : ''}`} fill={activeTab === 'liked' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Liked ({likedCreations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30 animate-scale-in'
                : 'glass glass-hover text-zinc-400 hover:text-white'
            }`}
          >
            <svg className={`w-5 h-5 transition-transform ${activeTab === 'saved' ? 'scale-110' : ''}`} fill={activeTab === 'saved' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Saved ({saved.length})
          </button>
        </div>

        {/* Filters Bar */}
        {baseCreations.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center gap-3">
              {/* Filter Toggle */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  showFilters ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'glass glass-hover text-zinc-400'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                )}
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 glass rounded-xl text-sm text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
              >
                <option value="newest" className="bg-zinc-900">Newest</option>
                <option value="oldest" className="bg-zinc-900">Oldest</option>
                <option value="likes" className="bg-zinc-900">Most Liked</option>
                <option value="evolutions" className="bg-zinc-900">Most Evolved</option>
              </select>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && baseCreations.length > 0 && (
          <div className="mb-8 p-6 glass rounded-2xl animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Filter by Agent */}
              <div>
                <label className="block text-sm text-zinc-400 mb-3">Filter by Agent</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterAgent('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      filterAgent === 'all'
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : 'glass glass-hover text-zinc-400'
                    }`}
                  >
                    All
                  </button>
                  {usedAgentIds.map(agent => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => setFilterAgent(agent.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                        filterAgent === agent.id
                          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                          : 'glass glass-hover text-zinc-400'
                      }`}
                    >
                      <img src={agent.avatar} alt={agent.name} className="w-4 h-4 rounded-sm object-cover" />
                      {agent.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter by Style */}
              <div>
                <label className="block text-sm text-zinc-400 mb-3">Filter by Style</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterStyle('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      filterStyle === 'all'
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : 'glass glass-hover text-zinc-400'
                    }`}
                  >
                    All
                  </button>
                  {uniqueStyles.map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setFilterStyle(style)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        filterStyle === style
                          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                          : 'glass glass-hover text-zinc-400'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Creations Grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {isLoading ? (
          <SkeletonGrid count={8} />
        ) : displayedCreations.length > 0 ? (
          <>
            {/* Results count */}
            {hasActiveFilters && (
              <p className="text-sm text-zinc-500 mb-6">
                Showing {displayedCreations.length} of {baseCreations.length} {activeTab === 'liked' ? 'liked' : 'saved'} creations
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedCreations.map((creation, index) => (
                <div
                  key={creation.id}
                  className="animate-stagger cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => onCreationClick(creation)}
                  onKeyDown={(e) => e.key === 'Enter' && onCreationClick(creation)}
                  tabIndex={0}
                  role="button"
                >
                  <CreationCard
                    creation={creation}
                    onEvolve={() => onEvolveClick(creation)}
                  />
                </div>
              ))}
            </div>
          </>
        ) : baseCreations.length > 0 && hasActiveFilters ? (
          // No results after filtering
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl glass flex items-center justify-center animate-bounce-in">
              <svg className="w-10 h-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No matching creations
            </h3>
            <p className="text-zinc-500 mb-6">
              Try adjusting your filters to see more results
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          // Empty state
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl glass flex items-center justify-center animate-bounce-in">
              {activeTab === 'liked' ? (
                <svg className="w-10 h-10 text-zinc-500 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-zinc-500 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No {activeTab === 'liked' ? 'liked' : 'saved'} creations yet
            </h3>
            <p className="text-zinc-500 mb-6">
              {activeTab === 'liked'
                ? 'Start exploring and like creations you love!'
                : 'Save creations to build your collection!'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Explore Gallery
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
