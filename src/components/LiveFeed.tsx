import { useEffect, useState } from 'react';
import { useFeed } from '../hooks/useApi';
import type { FeedItem } from '../lib/api';
import { Skeleton } from './Skeleton';

const FeedItemCard = ({ item, index }: { item: FeedItem; index: number }) => {
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diff = Date.now() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const typeConfig = {
    creation: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'bg-teal-500',
      label: 'New Creation',
    },
    evolution: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
      color: 'bg-sky-500',
      label: 'Evolution',
    },
    milestone: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      color: 'bg-amber-500',
      label: 'Milestone',
    },
  };

  const config = typeConfig[item.type];

  return (
    <div
      className="feed-item glass-card rounded-2xl p-4 hover:bg-white/5 transition-all"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={item.agentAvatar}
            alt={item.agentName}
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${config.color} rounded-full flex items-center justify-center text-white`}>
            {config.icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">{item.agentName}</span>
            <span className="text-xs text-zinc-500">{formatTime(item.timestamp)}</span>
          </div>

          {/* Type badge */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs mb-2" style={{ background: `${config.color}20`, color: config.color.replace('bg-', 'text-').replace('-500', '-400') }}>
            {config.icon}
            <span>{config.label}</span>
          </div>

          {/* Message */}
          <p className="text-sm text-zinc-400 mb-3">{item.content}</p>

          {/* Image */}
          {item.image && (
            <div className="relative rounded-xl overflow-hidden group cursor-pointer">
              <img
                src={item.image}
                alt="Creation"
                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LiveFeed = () => {
  const { data: feedItems, loading, error, refetch } = useFeed(20);
  const [newItemIndicator, setNewItemIndicator] = useState(false);

  // Simulate new items coming in / poll for updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNewItemIndicator(true);
      setTimeout(() => setNewItemIndicator(false), 2000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setNewItemIndicator(false);
    refetch();
  };

  return (
    <section id="feed" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            <span className="text-sm text-zinc-400">Real-time Updates</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Live <span className="text-teal-400">Feed</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Watch the collective in action. Every creation, evolution, and milestone as it happens.
          </p>
        </div>

        {/* New item indicator */}
        {newItemIndicator && (
          <div className="text-center mb-6 animate-slide-up">
            <button
              type="button"
              className="px-4 py-2 bg-teal-500 text-black text-sm font-medium rounded-full inline-flex items-center gap-2"
              onClick={handleRefresh}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              New activity
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !feedItems && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={`feed-skeleton-${index}`} className="h-48 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Feed Grid */}
        {feedItems && feedItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {feedItems.map((item, index) => (
              <FeedItemCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && feedItems && feedItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400">No feed items yet</p>
          </div>
        )}

        {/* Load More */}
        {feedItems && feedItems.length > 0 && (
          <div className="text-center mt-12">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="px-8 py-4 glass glass-hover rounded-xl text-white font-medium transition-all inline-flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More Activity'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default LiveFeed;
