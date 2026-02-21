import { useState, useEffect } from 'react';
import { useAgents } from '../hooks/useApi';
import { creationsAPI } from '../lib/api';
import { useToast } from './Toast';

interface CreateAIModalProps {
  onClose: () => void;
}

type GenerationStage = 'input' | 'selecting' | 'generating' | 'complete';

const CreateAIModal = ({ onClose }: CreateAIModalProps) => {
  const [stage, setStage] = useState<GenerationStage>('input');
  const [prompt, setPrompt] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Toast notifications
  const toast = useToast();

  // Fetch agents from API
  const { data: agents, loading: agentsLoading } = useAgents();

  const samplePrompts = [
    'A cosmic nebula merging with ocean waves',
    'Abstract geometric patterns in golden ratio',
    'Ethereal portrait with flowing energy',
    'Fluid motion captured in crystalline form',
  ];

  // Sample generated images (fallback when API not available)
  const sampleImages = [
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1579547621113-e4bb2a19bdd6?w=600&h=600&fit=crop',
  ];

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stage !== 'generating') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [onClose, stage]);

  useEffect(() => {
    if (stage === 'generating') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedAgent) return;

    setStage('generating');
    setProgress(0);
    setError(null);

    try {
      // Try to create via API
      const result = await creationsAPI.create({
        title: prompt.slice(0, 50),
        prompt: prompt,
        agentId: selectedAgent,
        style: 'Generated',
        tags: ['ai-generated', 'new'],
      });

      setGeneratedImage(result.creation.image);
      setStage('complete');
      toast.success('Creation generated successfully!');
    } catch (err) {
      console.error('API creation failed, using fallback:', err);
      // Fallback to sample image if API fails
      setTimeout(() => {
        setGeneratedImage(sampleImages[Math.floor(Math.random() * sampleImages.length)]);
        setStage('complete');
        toast.info('Creation generated using demo mode');
      }, 2000);
    }
  };

  const getSelectedAgentData = () => agents?.find(a => a.id === selectedAgent);

  const generationMessages = [
    'Initializing neural pathways...',
    'Analyzing creative DNA...',
    'Synthesizing visual elements...',
    'Applying style transfer...',
    'Refining output...',
    'Finalizing creation...',
  ];

  const getCurrentMessage = () => {
    const index = Math.min(Math.floor(progress / 18), generationMessages.length - 1);
    return generationMessages[index];
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => stage !== 'generating' && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl glass-strong rounded-3xl animate-slide-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        {stage !== 'generating' && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 glass glass-hover rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Create with AI</h2>
              <p className="text-sm text-zinc-500">Let an AI agent bring your vision to life</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Input Stage */}
          {stage === 'input' && (
            <div className="space-y-6 animate-fade-in">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Describe your vision</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A surreal landscape where mountains float among clouds..."
                  className="w-full h-32 px-4 py-3 glass rounded-2xl text-white placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                />
                {/* Sample prompts */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {samplePrompts.map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setPrompt(sample)}
                      className="px-3 py-1.5 text-xs glass glass-hover rounded-lg text-zinc-400 hover:text-white transition-all"
                    >
                      {sample.slice(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent Selection */}
              <div>
                <label className="block text-sm text-zinc-400 mb-3">Select an AI Agent</label>
                {agentsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={`agent-loading-${i}`} className="p-3 rounded-2xl glass animate-pulse h-24" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {agents?.slice(0, 8).map((agent) => (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => setSelectedAgent(agent.id)}
                        className={`p-3 rounded-2xl transition-all text-center ${
                          selectedAgent === agent.id
                            ? 'ring-2 ring-teal-500 bg-teal-500/10'
                            : 'glass glass-hover'
                        }`}
                      >
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-12 h-12 rounded-xl mx-auto mb-2 object-cover"
                        />
                        <p className="text-sm font-medium text-white">{agent.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{agent.specialty}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!prompt.trim() || !selectedAgent}
                className="w-full py-4 bg-teal-500 hover:bg-teal-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-semibold rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Creation
              </button>
            </div>
          )}

          {/* Generating Stage */}
          {stage === 'generating' && (
            <div className="py-12 text-center animate-fade-in">
              {/* Agent avatar with glow */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <img
                  src={getSelectedAgentData()?.avatar}
                  alt={getSelectedAgentData()?.name}
                  className="w-24 h-24 rounded-2xl object-cover"
                />
                <div className="absolute inset-0 rounded-2xl animate-pulse-glow" style={{
                  boxShadow: `0 0 40px ${getSelectedAgentData()?.creativeDNA?.color || '#14b8a6'}50`
                }} />
                {/* Orbiting particles */}
                <div className="absolute inset-0 animate-spin-slow">
                  <div className="absolute -top-2 left-1/2 w-2 h-2 rounded-full bg-teal-400" />
                  <div className="absolute -bottom-2 left-1/2 w-2 h-2 rounded-full bg-teal-400" />
                  <div className="absolute top-1/2 -left-2 w-2 h-2 rounded-full bg-teal-400" />
                  <div className="absolute top-1/2 -right-2 w-2 h-2 rounded-full bg-teal-400" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {getSelectedAgentData()?.name || 'AI Agent'} is creating...
              </h3>
              <p className="text-sm text-zinc-500 mb-8">{getCurrentMessage()}</p>

              {/* Progress bar */}
              <div className="max-w-xs mx-auto">
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500">{Math.round(Math.min(progress, 100))}%</p>
              </div>
            </div>
          )}

          {/* Complete Stage */}
          {stage === 'complete' && (
            <div className="animate-fade-in">
              {/* Generated Image */}
              <div className="relative rounded-2xl overflow-hidden mb-6">
                <img
                  src={generatedImage}
                  alt="Generated creation"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <div className="px-3 py-1.5 glass rounded-lg text-sm text-teal-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Generation Complete
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-center gap-4 p-4 glass rounded-2xl mb-6">
                <img
                  src={getSelectedAgentData()?.avatar}
                  alt={getSelectedAgentData()?.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <p className="text-sm text-zinc-500">Created by {getSelectedAgentData()?.name || 'AI Agent'}</p>
                  <p className="text-white font-medium">Generation 1 - New Lineage</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStage('input');
                    setPrompt('');
                    setSelectedAgent(null);
                    setProgress(0);
                    setError(null);
                  }}
                  className="flex-1 py-3 glass glass-hover rounded-xl font-medium text-white transition-all"
                >
                  Create Another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl transition-all"
                >
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

export default CreateAIModal;
