import { useEffect, useState } from 'react';
import { useAgents } from '../hooks/useApi';
import { creationsAPI, type Creation } from '../lib/api';
import { useFavorites } from '../context/FavoritesContext';

interface CreationModalProps {
  creation: Creation;
  onClose: () => void;
  onViewAgent: (agentId: string) => void;
  onEvolve: () => void;
}

const CreationModal = ({ creation, onClose, onViewAgent, onEvolve }: CreationModalProps) => {
  const { data: agents } = useAgents();
  const agent = agents?.find(a => a.id === creation.agentId);
  const { isFavorite, isSaved, toggleFavorite, toggleSaved } = useFavorites();

  // State for related creations (parent and children)
  const [parentCreation, setParentCreation] = useState<Creation | null>(null);
  const [childEvolutions, setChildEvolutions] = useState<Creation[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Fetch parent and child creations if applicable
  useEffect(() => {
    const fetchRelatedCreations = async () => {
      setLoadingRelated(true);
      try {
        // Fetch parent if exists
        if (creation.parentId) {
          try {
            const parentResult = await creationsAPI.getById(creation.parentId);
            setParentCreation(parentResult.creation);
          } catch (err) {
            console.error('Failed to fetch parent creation:', err);
          }
        }

        // Note: The API might not have a direct endpoint for children,
        // so we'll leave childEvolutions empty for now unless we implement it
        // This can be extended when the backend supports it
      } catch (err) {
        console.error('Failed to fetch related creations:', err);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedCreations();
  }, [creation.parentId]);

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

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diff = Date.now() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  // Handle like action via API
  const handleLike = async () => {
    try {
      if (isFavorite(creation.id)) {
        await creationsAPI.unlike(creation.id);
      } else {
        await creationsAPI.like(creation.id);
      }
      toggleFavorite(creation.id);
    } catch (err) {
      console.error('Failed to toggle like:', err);
      // Still toggle locally as fallback
      toggleFavorite(creation.id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden glass-strong rounded-3xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 glass glass-hover rounded-xl text-zinc-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col lg:flex-row max-h-[90vh]">
          {/* Image Section */}
          <div className="lg:w-1/2 relative">
            <img
              src={creation.image}
              alt={creation.title}
              className="w-full h-64 lg:h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r" />

            {/* Generation badge */}
            <div className="absolute top-4 left-4">
              <div className="px-3 py-1.5 glass rounded-xl text-sm font-mono text-teal-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generation {creation.generation}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="lg:w-1/2 p-6 lg:p-8 overflow-y-auto">
            {/* Title */}
            <h2 className="text-3xl font-bold text-white mb-2">{creation.title}</h2>
            <p className="text-zinc-500 text-sm mb-6">{formatTime(creation.timestamp)}</p>

            {/* Agent Info */}
            {agent && (
              <button
                type="button"
                onClick={() => onViewAgent(agent.id)}
                className="flex items-center gap-4 p-4 glass glass-hover rounded-2xl mb-6 w-full text-left transition-all group"
              >
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm text-zinc-500">Created by</p>
                  <p className="text-lg font-semibold text-white group-hover:text-teal-400 transition-colors">{agent.name}</p>
                  <p className="text-sm text-zinc-400">{agent.specialty}</p>
                </div>
                <svg className="w-5 h-5 text-zinc-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Fallback agent info if agent not loaded */}
            {!agent && creation.agentName && (
              <div className="flex items-center gap-4 p-4 glass rounded-2xl mb-6">
                <div className="w-14 h-14 rounded-xl bg-zinc-700 flex items-center justify-center">
                  <span className="text-xl font-bold text-zinc-400">{creation.agentName.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-zinc-500">Created by</p>
                  <p className="text-lg font-semibold text-white">{creation.agentName}</p>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-mono font-bold text-teal-400">{creation.likes}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Likes</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-mono font-bold text-teal-400">{creation.evolutions}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Evolutions</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-mono font-bold text-teal-400">{creation.generation}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Generation</div>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <h3 className="text-sm text-zinc-500 uppercase tracking-wider mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {creation.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 glass rounded-lg text-sm text-zinc-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="mb-6">
              <h3 className="text-sm text-zinc-500 uppercase tracking-wider mb-3">Style</h3>
              <div className="inline-flex px-4 py-2 rounded-xl text-sm font-medium" style={{
                background: `${agent?.creativeDNA?.color || '#14b8a6'}20`,
                color: agent?.creativeDNA?.color || '#14b8a6'
              }}>
                {creation.style}
              </div>
            </div>

            {/* Prompt (if available) */}
            {creation.prompt && (
              <div className="mb-6">
                <h3 className="text-sm text-zinc-500 uppercase tracking-wider mb-3">Prompt</h3>
                <p className="text-zinc-400 text-sm italic glass rounded-xl p-4">
                  "{creation.prompt}"
                </p>
              </div>
            )}

            {/* Evolution History */}
            {(parentCreation || childEvolutions.length > 0) && (
              <div className="mb-6">
                <h3 className="text-sm text-zinc-500 uppercase tracking-wider mb-3">Evolution History</h3>
                <div className="space-y-3">
                  {parentCreation && (
                    <div className="flex items-center gap-3 p-3 glass rounded-xl">
                      <img src={parentCreation.image} alt={parentCreation.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-xs text-zinc-500">Evolved from</p>
                        <p className="text-sm font-medium text-white">{parentCreation.title}</p>
                      </div>
                      <span className="text-xs text-zinc-500">Gen {parentCreation.generation}</span>
                    </div>
                  )}
                  {childEvolutions.map(child => (
                    <div key={child.id} className="flex items-center gap-3 p-3 glass rounded-xl">
                      <img src={child.image} alt={child.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-xs text-zinc-500">Evolved to</p>
                        <p className="text-sm font-medium text-white">{child.title}</p>
                      </div>
                      <span className="text-xs text-zinc-500">Gen {child.generation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading indicator for related creations */}
            {loadingRelated && creation.parentId && (
              <div className="mb-6">
                <h3 className="text-sm text-zinc-500 uppercase tracking-wider mb-3">Evolution History</h3>
                <div className="animate-pulse glass rounded-xl p-4 h-16" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleLike}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  isFavorite(creation.id)
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'glass glass-hover text-white'
                }`}
              >
                <svg className={`w-5 h-5 ${isFavorite(creation.id) ? 'fill-current' : ''}`} fill={isFavorite(creation.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isFavorite(creation.id) ? 'Liked' : 'Like'}
              </button>
              <button
                type="button"
                onClick={() => toggleSaved(creation.id)}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  isSaved(creation.id)
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'glass glass-hover text-white'
                }`}
              >
                <svg className={`w-5 h-5 ${isSaved(creation.id) ? 'fill-current' : ''}`} fill={isSaved(creation.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {isSaved(creation.id) ? 'Saved' : 'Save'}
              </button>
              <button
                type="button"
                onClick={onEvolve}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Evolve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreationModal;
