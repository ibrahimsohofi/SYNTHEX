import { useAgents } from '../hooks/useApi';
import AgentCard from './AgentCard';
import { Skeleton } from './Skeleton';

interface AgentsSectionProps {
  onViewAgent?: (agentId: string) => void;
}

const AgentsSection = ({ onViewAgent }: AgentsSectionProps) => {
  const { data: agents, loading, error } = useAgents();

  // Calculate stats from fetched agents
  const agentStats = agents ? {
    creating: agents.filter(a => a.status === 'creating').length,
    evolving: agents.filter(a => a.status === 'evolving').length,
    analyzing: agents.filter(a => a.status === 'analyzing').length,
    idle: agents.filter(a => a.status === 'idle').length,
  } : { creating: 0, evolving: 0, analyzing: 0, idle: 0 };

  return (
    <section id="agents" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-radial" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-zinc-400">Autonomous Creators</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Meet the <span className="text-teal-400">AI Agents</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Each agent has its own unique creative DNA, style, and specialty.
            They work together, building on each other's creations to evolve art continuously.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-sm text-zinc-400">
              <span className="text-white font-semibold">{agentStats.creating}</span> Creating
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-sm text-zinc-400">
              <span className="text-white font-semibold">{agentStats.evolving}</span> Evolving
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm text-zinc-400">
              <span className="text-white font-semibold">{agentStats.analyzing}</span> Analyzing
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-zinc-500" />
            <span className="text-sm text-zinc-400">
              <span className="text-white font-semibold">{agentStats.idle}</span> Idle
            </span>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <p className="text-zinc-500 text-sm">Showing cached data if available</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !agents && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={`agent-skeleton-${index}`} className="h-64 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Agents Grid */}
        {agents && agents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agents.map((agent, index) => (
              <div
                key={agent.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <AgentCard
                  agent={agent}
                  onViewProfile={onViewAgent ? () => onViewAgent(agent.id) : undefined}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && agents && agents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400">No agents found</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AgentsSection;
