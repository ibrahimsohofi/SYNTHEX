import type { Creation } from '../data/agents';
import { getAgentById } from '../data/agents';
import { useFavorites } from '../context/FavoritesContext';

interface CreationCardProps {
  creation: Creation;
  onEvolve?: () => void;
}

const CreationCard = ({ creation, onEvolve }: CreationCardProps) => {
  const agent = getAgentById(creation.agentId);
  const { toggleFavorite, toggleSaved, isFavorite, isSaved } = useFavorites();

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(creation.id);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaved(creation.id);
  };

  const handleEvolveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEvolve?.();
  };

  const liked = isFavorite(creation.id);
  const saved = isSaved(creation.id);

  return (
    <div className="glass-card rounded-2xl overflow-hidden card-hover group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={creation.image}
          alt={creation.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Generation badge */}
        <div className="absolute top-3 left-3">
          <div className="px-2.5 py-1 glass rounded-lg text-xs font-mono text-teal-400">
            Gen {creation.generation}
          </div>
        </div>

        {/* Evolution indicator */}
        {creation.parentId && (
          <div className="absolute top-3 right-3">
            <div className="p-1.5 glass rounded-lg">
              <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {/* Like Button */}
              <button
                type="button"
                className={`p-2 glass glass-hover rounded-lg transition-all ${liked ? 'bg-red-500/20' : ''}`}
                onClick={handleFavoriteClick}
              >
                <svg
                  className={`w-5 h-5 transition-colors ${liked ? 'text-red-400 fill-red-400' : 'text-white'}`}
                  fill={liked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              {/* Save Button */}
              <button
                type="button"
                className={`p-2 glass glass-hover rounded-lg transition-all ${saved ? 'bg-teal-500/20' : ''}`}
                onClick={handleSaveClick}
              >
                <svg
                  className={`w-5 h-5 transition-colors ${saved ? 'text-teal-400 fill-teal-400' : 'text-white'}`}
                  fill={saved ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
            {/* Evolve Button */}
            <button
              type="button"
              className="px-3 py-2 bg-teal-500 hover:bg-teal-400 text-black text-sm font-medium rounded-lg transition-colors"
              onClick={handleEvolveClick}
            >
              Evolve
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">
          {creation.title}
        </h3>

        {/* Agent info */}
        <div className="flex items-center gap-3 mb-3">
          {agent && (
            <>
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-6 h-6 rounded-md object-cover"
              />
              <span className="text-sm text-zinc-400">{agent.name}</span>
            </>
          )}
          <span className="text-xs text-zinc-600">|</span>
          <span className="text-xs text-zinc-500">{formatTime(creation.timestamp)}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {creation.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-md bg-zinc-800 text-zinc-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 ${liked ? 'text-red-400' : 'text-zinc-500'}`}>
              <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm">{creation.likes + (liked ? 1 : 0)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="text-sm">{creation.evolutions}</span>
            </div>
          </div>
          <span className="text-xs text-zinc-600 uppercase tracking-wider">{creation.style}</span>
        </div>
      </div>
    </div>
  );
};

export default CreationCard;
