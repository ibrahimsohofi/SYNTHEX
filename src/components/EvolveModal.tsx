import { useState, useEffect, useMemo } from 'react';
import { useAgents } from '../hooks/useApi';
import { creationsAPI, type Creation } from '../lib/api';
import { useToast } from './Toast';

interface EvolveModalProps {
  creation: Creation;
  onClose: () => void;
}

type EvolveStage = 'options' | 'evolving' | 'complete';

// DNA Helix Component
const DNAHelix = () => {
  const pairs = useMemo(() => Array.from({ length: 8 }, (_, i) => i), []);

  return (
    <div className="relative w-20 h-40 mx-auto" style={{ perspective: '500px' }}>
      {pairs.map((i) => (
        <div
          key={`dna-pair-${i}`}
          className="absolute w-full flex items-center justify-between"
          style={{
            top: `${i * 20}px`,
            animation: "dna-helix 2s linear infinite",
            animationDelay: `${i * 0.1}s`,
          }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              boxShadow: '0 0 15px rgba(20, 184, 166, 0.6)',
            }}
          />
          <div
            className="flex-1 h-0.5 mx-1"
            style={{
              background: 'linear-gradient(90deg, #14b8a6, #a855f7)',
              opacity: 0.6,
            }}
          />
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.6)',
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Particle component
const Particle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <div
    className="absolute w-2 h-2 rounded-full"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      background: `linear-gradient(135deg, ${Math.random() > 0.5 ? '#14b8a6' : '#a855f7'}, ${Math.random() > 0.5 ? '#0d9488' : '#7c3aed'})`,
      animation: "particle-float 2s ease-out infinite",
      animationDelay: `${delay}s`,
      boxShadow: '0 0 8px rgba(20, 184, 166, 0.5)',
    }}
  />
);

// Confetti component for celebration
const Confetti = () => {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: ['#14b8a6', '#a855f7', '#f59e0b', '#ec4899', '#0ea5e9'][Math.floor(Math.random() * 5)],
      size: 4 + Math.random() * 4,
      duration: 1 + Math.random() * 0.5,
    })),
  []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={`confetti-${p.id}`}
          className="absolute rounded-full animate-bounce-in"
          style={{
            left: `${p.x}%`,
            top: '-10%',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            animation: `fall ${p.duration}s ease-out forwards`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 10px ${p.color}`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const EvolveModal = ({ creation, onClose }: EvolveModalProps) => {
  const [stage, setStage] = useState<EvolveStage>('options');
  const [selectedAgent, setSelectedAgent] = useState<string>(creation.agentId);
  const [evolutionType, setEvolutionType] = useState<'enhance' | 'remix' | 'abstract'>('enhance');
  const [progress, setProgress] = useState(0);
  const [evolvedImage, setEvolvedImage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Toast notifications
  const toast = useToast();

  // Fetch agents from API
  const { data: agents } = useAgents();

  // Find the original agent
  const originalAgent = agents?.find(a => a.id === creation.agentId);

  const evolutionTypes = [
    {
      id: 'enhance',
      name: 'Enhance',
      description: 'Refine and improve the current style',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      id: 'remix',
      name: 'Remix',
      description: 'Blend with a different agent\'s style',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      id: 'abstract',
      name: 'Abstract',
      description: 'Transform into abstract interpretation',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      ),
    },
  ];

  // Sample evolved images (fallback when API not available)
  const sampleEvolvedImages = [
    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=600&fit=crop',
  ];

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stage !== 'evolving') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [onClose, stage]);

  useEffect(() => {
    if (stage === 'evolving') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 8 + 2;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleEvolve = async () => {
    setStage('evolving');
    setProgress(0);

    try {
      // Try to evolve via API
      const result = await creationsAPI.evolve(creation.id, {
        direction: evolutionType,
        intensity: evolutionType === 'abstract' ? 0.8 : 0.5,
      });

      setEvolvedImage(result.creation.image);
      setStage('complete');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      toast.success(`Evolution complete! Generation ${creation.generation + 1} created.`);
    } catch (err) {
      console.error('API evolution failed, using fallback:', err);
      // Fallback to sample image if API fails
      setTimeout(() => {
        setEvolvedImage(sampleEvolvedImages[Math.floor(Math.random() * sampleEvolvedImages.length)]);
        setStage('complete');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        toast.info('Evolution complete using demo mode');
      }, 2000);
    }
  };

  const evolutionMessages = [
    'Analyzing original creation...',
    'Extracting style DNA patterns...',
    'Synthesizing new variations...',
    'Applying evolution algorithms...',
    'Generating mutations...',
    'Refining details...',
    'Finalizing evolution...',
  ];

  const getCurrentMessage = () => {
    const index = Math.min(Math.floor(progress / 15), evolutionMessages.length - 1);
    return evolutionMessages[index];
  };

  // Particles for evolving stage
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 40,
      y: 20 + Math.random() * 60,
      delay: Math.random() * 2,
    })),
  []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => stage !== 'evolving' && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Evolve creation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl glass-strong rounded-3xl animate-scale-up overflow-hidden"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
        role="presentation"
      >
        {/* Confetti celebration */}
        {showConfetti && <Confetti />}

        {/* Close button */}
        {stage !== 'evolving' && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 glass glass-hover rounded-xl text-zinc-400 hover:text-white transition-all hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center transition-transform ${stage === 'evolving' ? 'animate-pulse' : ''}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {stage === 'complete' ? 'Evolution Complete!' : 'Evolve Creation'}
              </h2>
              <p className="text-sm text-zinc-500">
                {stage === 'complete'
                  ? 'Your new creation is ready'
                  : `Transform "${creation.title}" into something new`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Options Stage */}
          {stage === 'options' && (
            <div className="space-y-6 animate-fade-in">
              {/* Original Creation Preview */}
              <div className="flex gap-4 p-4 glass rounded-2xl hover:bg-white/5 transition-colors">
                <img
                  src={creation.image}
                  alt={creation.title}
                  className="w-20 h-20 rounded-xl object-cover ring-2 ring-purple-500/30"
                />
                <div className="flex-1">
                  <p className="text-sm text-zinc-500">Original Creation</p>
                  <p className="text-lg font-semibold text-white">{creation.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {originalAgent && (
                      <img
                        src={originalAgent.avatar}
                        alt={originalAgent.name}
                        className="w-5 h-5 rounded-md object-cover"
                      />
                    )}
                    <span className="text-sm text-zinc-400">{originalAgent?.name || creation.agentName}</span>
                    <span className="text-xs text-zinc-600">Gen {creation.generation}</span>
                  </div>
                </div>
              </div>

              {/* Evolution Type */}
              <div>
                <label className="block text-sm text-zinc-400 mb-3">Evolution Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {evolutionTypes.map((type, index) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setEvolutionType(type.id as 'enhance' | 'remix' | 'abstract')}
                      className={`p-4 rounded-2xl transition-all text-center animate-stagger hover:scale-105 ${
                        evolutionType === type.id
                          ? 'ring-2 ring-purple-500 bg-purple-500/10'
                          : 'glass glass-hover'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={`mx-auto mb-2 transition-transform ${evolutionType === type.id ? 'text-purple-400 scale-110' : 'text-zinc-400'}`}>
                        {type.icon}
                      </div>
                      <p className="text-sm font-medium text-white">{type.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent Selection (for remix) */}
              {evolutionType === 'remix' && agents && (
                <div className="animate-slide-down">
                  <label className="block text-sm text-zinc-400 mb-3">Select Agent Style to Blend</label>
                  <div className="grid grid-cols-4 gap-3">
                    {agents.filter(a => a.id !== creation.agentId).slice(0, 8).map((agent, index) => (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => setSelectedAgent(agent.id)}
                        className={`p-3 rounded-xl transition-all text-center animate-stagger hover:scale-105 ${
                          selectedAgent === agent.id
                            ? 'ring-2 ring-purple-500 bg-purple-500/10'
                            : 'glass glass-hover'
                        }`}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className={`w-10 h-10 rounded-lg mx-auto mb-2 object-cover transition-transform ${
                            selectedAgent === agent.id ? 'scale-110 ring-2 ring-purple-500/50' : ''
                          }`}
                        />
                        <p className="text-xs font-medium text-white truncate">{agent.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Evolve Button */}
              <button
                type="button"
                onClick={handleEvolve}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Start Evolution
              </button>
            </div>
          )}

          {/* Evolving Stage */}
          {stage === 'evolving' && (
            <div className="py-8 text-center animate-fade-in relative">
              {/* Floating particles */}
              {particles.map((p) => (
                <Particle key={`particle-${p.id}`} delay={p.delay} x={p.x} y={p.y} />
              ))}

              {/* DNA Helix Animation */}
              <div className="mb-8">
                <DNAHelix />
              </div>

              <h3 className="text-xl font-bold text-white mb-2 animate-pulse">
                Evolving to Generation {creation.generation + 1}
              </h3>
              <p className="text-sm text-zinc-500 mb-8 transition-all">{getCurrentMessage()}</p>

              {/* Progress bar */}
              <div className="max-w-xs mx-auto">
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden mb-3 relative">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-teal-400 rounded-full transition-all duration-300 relative"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-600">Processing</span>
                  <span className="text-purple-400 font-mono">{Math.round(Math.min(progress, 100))}%</span>
                </div>
              </div>

              {/* Side by side images */}
              <div className="flex items-center justify-center gap-6 mt-8">
                <div className="relative animate-float">
                  <img
                    src={creation.image}
                    alt={creation.title}
                    className="w-20 h-20 rounded-xl object-cover opacity-60"
                  />
                  <div className="absolute inset-0 rounded-xl border border-zinc-600" />
                </div>

                {/* Arrow with animation */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-gradient-to-r from-zinc-600 to-purple-500" />
                  <svg className="w-5 h-5 text-purple-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                <div className="relative animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="w-20 h-20 rounded-xl glass flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-3 border-purple-500 border-t-transparent animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-xl animate-pulse-glow" />
                </div>
              </div>
            </div>
          )}

          {/* Complete Stage */}
          {stage === 'complete' && (
            <div className="animate-fade-in">
              {/* Success Badge */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center animate-bounce-in">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Before/After Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="relative rounded-2xl overflow-hidden group animate-stagger" style={{ animationDelay: '100ms' }}>
                  <img
                    src={creation.image}
                    alt="Original"
                    className="w-full h-48 object-cover opacity-75 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <div className="px-3 py-1.5 glass rounded-lg text-xs text-zinc-400">
                      Original - Gen {creation.generation}
                    </div>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden group animate-stagger" style={{ animationDelay: '200ms' }}>
                  <img
                    src={evolvedImage}
                    alt="Evolved"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <div className="px-3 py-1.5 glass rounded-lg text-xs text-purple-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Evolved - Gen {creation.generation + 1}
                    </div>
                  </div>
                  <div className="absolute inset-0 ring-2 ring-purple-500/50 rounded-2xl pointer-events-none" />
                </div>
              </div>

              {/* Info */}
              <div className="flex items-center gap-4 p-4 glass rounded-2xl mb-6 animate-stagger" style={{ animationDelay: '300ms' }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-teal-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">New Creation Ready</p>
                  <p className="text-white font-medium">
                    {creation.title} - {evolutionTypes.find(t => t.id === evolutionType)?.name} Variation
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-zinc-500">Generation</p>
                  <p className="text-lg font-bold text-purple-400">{creation.generation + 1}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 animate-stagger" style={{ animationDelay: '400ms' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStage('options');
                    setProgress(0);
                    setShowConfetti(false);
                  }}
                  className="flex-1 py-3 glass glass-hover rounded-xl font-medium text-white transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Evolve Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  View in Gallery
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvolveModal;
