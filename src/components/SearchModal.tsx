import { useState, useEffect, useRef, useCallback } from 'react';
import { creations, agents, type Creation } from '../data/agents';
import { useSearch } from '../context/SearchContext';
import { SkeletonSearchResult } from './Skeleton';

interface SearchModalProps {
  onClose: () => void;
  onCreationClick: (creation: Creation) => void;
}

const RECENT_SEARCHES_KEY = 'synthex-recent-searches';
const MAX_RECENT_SEARCHES = 5;

const SearchModal = ({ onClose, onCreationClick }: SearchModalProps) => {
  const { searchQuery, setSearchQuery } = useSearch();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [results, setResults] = useState<Creation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(s => s !== query)].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  // Search with debounce
  useEffect(() => {
    if (localQuery.trim() === '') {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSelectedIndex(-1);

    const timeout = setTimeout(() => {
      const query = localQuery.toLowerCase();
      const filtered = creations.filter(creation => {
        const titleMatch = creation.title.toLowerCase().includes(query);
        const tagMatch = creation.tags.some(tag => tag.toLowerCase().includes(query));
        const agentMatch = creation.agentName.toLowerCase().includes(query);
        const styleMatch = creation.style.toLowerCase().includes(query);
        return titleMatch || tagMatch || agentMatch || styleMatch;
      });
      setResults(filtered);
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timeout);
  }, [localQuery]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        }
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const handleSearch = (query: string) => {
    setLocalQuery(query);
    setSearchQuery(query);
  };

  const handleResultClick = (creation: Creation) => {
    saveRecentSearch(localQuery);
    onCreationClick(creation);
    onClose();
  };

  const handleRecentSearchClick = (query: string) => {
    handleSearch(query);
  };

  const popularTags = ['landscape', 'geometric', 'cosmic', 'portrait', 'abstract', 'motion'];

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={`highlight-${i}-${part}`} className="search-highlight text-teal-400">{part}</span>
      ) : (
        <span key={`text-${i}-${part}`}>{part}</span>
      )
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Search creations"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl glass-strong rounded-2xl animate-slide-down overflow-hidden"
        onClick={e => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="presentation"
      >
        {/* Search Input */}
        <div className="relative">
          <svg
            className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
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
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={e => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by title, tags, agent, or style..."
            className="w-full pl-14 pr-14 py-5 bg-transparent text-white text-lg placeholder-zinc-500 border-b border-zinc-800 focus:outline-none focus:border-teal-500/50 transition-colors"
            aria-label="Search input"
            aria-describedby="search-help"
          />
          {localQuery && (
            <button
              type="button"
              onClick={() => handleSearch('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors hover:scale-110"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {isSearching && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Content */}
        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
          {localQuery === '' ? (
            // No query - show recent searches and popular tags
            <div className="p-6 animate-fade-in">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-zinc-500">Recent Searches</p>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={`recent-${search}-${index}`}
                        type="button"
                        onClick={() => handleRecentSearchClick(search)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg glass-hover transition-all text-left group"
                      >
                        <svg className="w-4 h-4 text-zinc-600 group-hover:text-teal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-zinc-400 group-hover:text-white transition-colors">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Tags */}
              <div>
                <p className="text-sm text-zinc-500 mb-4">Popular Tags</p>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, index) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleSearch(tag)}
                      className="px-4 py-2 glass glass-hover rounded-xl text-sm text-zinc-300 hover:text-white transition-all animate-stagger hover:scale-105"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search by Agent */}
              <div className="mt-6">
                <p className="text-sm text-zinc-500 mb-4">Search by Agent</p>
                <div className="flex flex-wrap gap-2">
                  {agents.slice(0, 6).map((agent, index) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => handleSearch(agent.name)}
                      className="flex items-center gap-2 px-3 py-2 glass glass-hover rounded-xl text-sm text-zinc-300 hover:text-white transition-all animate-stagger hover:scale-105"
                      style={{ animationDelay: `${(index + popularTags.length) * 50}ms` }}
                    >
                      <img src={agent.avatar} alt={agent.name} className="w-5 h-5 rounded-md object-cover" />
                      {agent.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hint */}
              <div className="mt-8 p-4 glass rounded-xl">
                <div className="flex items-center gap-3 text-zinc-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm" id="search-help">
                    Use arrow keys to navigate, Enter to select
                  </p>
                </div>
              </div>
            </div>
          ) : isSearching ? (
            // Loading state
            <div className="p-4 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonSearchResult key={`skeleton-${i}`} />
              ))}
            </div>
          ) : results.length > 0 ? (
            // Search results
            <div className="p-4">
              <p className="text-sm text-zinc-500 mb-4 px-2 animate-fade-in">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{localQuery}"
              </p>
              <div className="space-y-2" role="listbox" aria-label="Search results">
                {results.map((creation, index) => (
                  <button
                    key={creation.id}
                    type="button"
                    data-index={index}
                    onClick={() => handleResultClick(creation)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left group animate-stagger ${
                      selectedIndex === index
                        ? 'result-item-active bg-teal-500/10 border border-teal-500/30'
                        : 'glass-hover border border-transparent'
                    }`}
                    style={{ animationDelay: `${index * 30}ms` }}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    <img
                      src={creation.image}
                      alt={creation.title}
                      className={`w-14 h-14 rounded-lg object-cover transition-transform ${
                        selectedIndex === index ? 'scale-105 ring-2 ring-teal-500/50' : 'group-hover:scale-105'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate transition-colors ${
                        selectedIndex === index ? 'text-teal-400' : 'text-white group-hover:text-teal-400'
                      }`}>
                        {highlightMatch(creation.title, localQuery)}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span>{highlightMatch(creation.agentName, localQuery)}</span>
                        <span>·</span>
                        <span>Gen {creation.generation}</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {creation.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className={`px-2 py-0.5 text-xs rounded-md ${
                              tag.toLowerCase().includes(localQuery.toLowerCase())
                                ? 'bg-teal-500/20 text-teal-400'
                                : 'bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 transition-all ${
                        selectedIndex === index
                          ? 'text-teal-400 translate-x-1'
                          : 'text-zinc-600 group-hover:text-teal-400 group-hover:translate-x-1'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // No results
            <div className="p-8 text-center animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center animate-bounce-in">
                <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-white mb-2">No results found</p>
              <p className="text-sm text-zinc-500 mb-4">
                Try searching with different keywords or tags
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularTags.slice(0, 3).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleSearch(tag)}
                    className="px-3 py-1.5 glass glass-hover rounded-lg text-sm text-zinc-400 hover:text-white transition-all"
                  >
                    Try "{tag}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/50">
          <div className="flex items-center justify-between text-xs text-zinc-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 glass rounded text-zinc-400">ESC</kbd>
                to close
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 glass rounded text-zinc-400">↑↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 glass rounded text-zinc-400">Enter</kbd>
                to select
              </span>
            </div>
            {results.length > 0 && (
              <span className="text-teal-400/60">
                {selectedIndex >= 0 ? `${selectedIndex + 1} of ${results.length}` : `${results.length} results`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
