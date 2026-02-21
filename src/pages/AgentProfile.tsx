import { useParams, useNavigate } from 'react-router-dom';
import { useAgent, useAgentCreations } from '../hooks/useApi';
import CreationCard from '../components/CreationCard';
import { Skeleton } from '../components/Skeleton';
import { useState } from 'react';
import type { Creation } from '../lib/api';

interface AgentProfileProps {
  onCreationClick: (creation: Creation) => void;
  onEvolveClick: (creation: Creation) => void;
}

const AgentProfile = ({ onCreationClick, onEvolveClick }: AgentProfileProps) => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<'recent' | 'likes' | 'evolutions'>('recent');

  // Fetch agent data from API
  const { data: agent, loading: agentLoading, error: agentError } = useAgent(agentId);

  // Fetch agent's creations from API
  const { data: agentCreations, loading: creationsLoading } = useAgentCreations(agentId, 50);

  // Loading state
  if (agentLoading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="fixed inset-0 gradient-mesh opacity-30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <Skeleton className="w-32 h-8 rounded-xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <div className="glass-card rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center md:items-start">
                <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-2xl" />
                <Skeleton className="mt-4 w-32 h-8 rounded-xl" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-12 w-64 rounded-xl mb-2" />
                <Skeleton className="h-6 w-48 rounded-xl mb-4" />
                <Skeleton className="h-20 w-full rounded-xl mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={`stat-skeleton-${i}`} className="h-20 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (agentError || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Agent Not Found</h1>
          <p className="text-zinc-400 mb-6">{agentError || 'The agent you are looking for does not exist.'}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl transition-all"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Sort creations
  const sortedCreations = [...(agentCreations || [])].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    if (sortBy === 'likes') return b.likes - a.likes;
    return b.evolutions - a.evolutions;
  });

  const statusColors: Record<string, string> = {
    creating: 'bg-teal-500',
    evolving: 'bg-sky-500',
    analyzing: 'bg-amber-500',
    idle: 'bg-zinc-500',
  };

  const statusLabels: Record<string, string> = {
    creating: 'Currently Creating',
    evolving: 'Evolving Work',
    analyzing: 'Analyzing Data',
    idle: 'Idle',
  };

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

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="glass-card rounded-3xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar & Status */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover"
                />
                <div
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl border-4 border-zinc-900"
                  style={{ background: agent.creativeDNA.color }}
                />
                <div
                  className="absolute inset-0 rounded-2xl blur-xl opacity-30 -z-10"
                  style={{ background: agent.creativeDNA.color }}
                />
              </div>

              {/* Status Badge */}
              <div className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-xl ${statusColors[agent.status] || statusColors.idle}20`}>
                <span className={`w-2 h-2 rounded-full ${statusColors[agent.status] || statusColors.idle} ${agent.status !== 'idle' ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium text-zinc-300">
                  {statusLabels[agent.status] || statusLabels.idle}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{agent.name}</h1>
              <p className="text-xl text-teal-400 mb-4">{agent.specialty}</p>
              <p className="text-zinc-400 max-w-2xl mb-6">{agent.description}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl font-mono font-bold text-teal-400">{agent.creationsCount}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">Creations</div>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl font-mono font-bold text-teal-400">{agent.evolutionsCount.toLocaleString()}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">Evolutions</div>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl font-mono font-bold text-teal-400">{Math.round(agent.creativeDNA.complexity * 100)}%</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">Complexity</div>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl font-mono font-bold text-teal-400">{agent.style}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">Style</div>
                </div>
              </div>

              {/* Creative DNA */}
              <div className="glass rounded-xl p-4 max-w-md">
                <h3 className="text-sm text-zinc-500 uppercase tracking-wider mb-3">Creative DNA</h3>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl"
                    style={{ background: agent.creativeDNA.color }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-400">Pattern: {agent.creativeDNA.pattern}</span>
                      <span className="text-white font-medium">{agent.style}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${agent.creativeDNA.complexity * 100}%`,
                          background: agent.creativeDNA.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creations Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Creations by {agent.name}</h2>
            <p className="text-zinc-500">{sortedCreations.length} artworks in collection</p>
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

        {/* Creations Grid */}
        {creationsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={`creation-skeleton-${i}`} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : sortedCreations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCreations.map((creation, index) => (
              <div
                key={creation.id}
                className="animate-slide-up cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => onCreationClick(creation)}
              >
                <CreationCard
                  creation={creation}
                  onEvolve={() => onEvolveClick(creation)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-zinc-500">No creations yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentProfile;
