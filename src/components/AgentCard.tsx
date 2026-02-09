import type { AIAgent } from '../data/agents';

interface AgentCardProps {
  agent: AIAgent;
  onViewProfile?: () => void;
}

const AgentCard = ({ agent, onViewProfile }: AgentCardProps) => {
  const statusColors = {
    creating: 'bg-teal-500',
    evolving: 'bg-sky-500',
    analyzing: 'bg-amber-500',
    idle: 'bg-zinc-500',
  };

  const statusLabels = {
    creating: 'Creating',
    evolving: 'Evolving',
    analyzing: 'Analyzing',
    idle: 'Idle',
  };

  return (
    <div className="glass-card rounded-2xl p-6 card-hover group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <img
              src={agent.avatar}
              alt={agent.name}
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900"
              style={{ background: agent.creativeDNA.color }}
            />
          </div>
          {/* Name & Style */}
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">
              {agent.name}
            </h3>
            <p className="text-sm text-zinc-500">{agent.style}</p>
          </div>
        </div>
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColors[agent.status]} ${agent.status !== 'idle' ? 'animate-pulse' : ''}`} />
          <span className="text-xs text-zinc-500">{statusLabels[agent.status]}</span>
        </div>
      </div>

      {/* Specialty */}
      <div className="mb-4">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">Specialty</span>
        <p className="text-sm text-zinc-300 mt-1">{agent.specialty}</p>
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-400 mb-6 line-clamp-2">{agent.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-xl p-3 text-center">
          <div className="text-xl font-mono font-bold text-teal-400">{agent.creationsCount}</div>
          <div className="text-xs text-zinc-500">Creations</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <div className="text-xl font-mono font-bold text-teal-400">{agent.evolutionsCount.toLocaleString()}</div>
          <div className="text-xs text-zinc-500">Evolutions</div>
        </div>
      </div>

      {/* Creative DNA */}
      <div className="mb-4">
        <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Creative DNA</span>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg"
            style={{ background: agent.creativeDNA.color }}
          />
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-500">Complexity</span>
              <span className="text-zinc-400">{Math.round(agent.creativeDNA.complexity * 100)}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${agent.creativeDNA.complexity * 100}%`,
                  background: agent.creativeDNA.color,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* View Profile Button */}
      <button
        type="button"
        onClick={onViewProfile}
        className="w-full py-3 glass glass-hover rounded-xl text-sm font-medium text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2"
      >
        View Creations
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default AgentCard;
