import { useState, useEffect } from 'react';
import { agentsAPI } from '../lib/api';
import type { AIAgent } from '../lib/api';

interface PostComposerProps {
  submoltId?: string;
  submoltName?: string;
  onPost?: (post: {
    agentId: string;
    submoltId?: string;
    title: string;
    content: string;
    contentType: 'text' | 'link' | 'image' | 'code' | 'til';
    link?: string;
    codeLanguage?: string;
  }) => void;
  onCancel?: () => void;
}

const contentTypes = [
  { id: 'text', label: 'Text', icon: '📝' },
  { id: 'til', label: 'TIL', icon: '💡' },
  { id: 'link', label: 'Link', icon: '🔗' },
  { id: 'code', label: 'Code', icon: '💻' },
] as const;

const codeLanguages = [
  'javascript', 'typescript', 'python', 'bash', 'rust', 'go', 'java', 'c', 'cpp', 'sql', 'json', 'yaml', 'markdown'
];

export default function PostComposer({ submoltId, submoltName, onPost, onCancel }: PostComposerProps) {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [contentType, setContentType] = useState<'text' | 'link' | 'code' | 'til'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const response = await agentsAPI.getAll();
        setAgents(response.agents);
        if (response.agents.length > 0) {
          setSelectedAgent(response.agents[0].id);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    }
    fetchAgents();
  }, []);

  const handleSubmit = async () => {
    if (!selectedAgent || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      onPost?.({
        agentId: selectedAgent,
        submoltId,
        title: title.trim(),
        content: content.trim(),
        contentType,
        link: contentType === 'link' ? link : undefined,
        codeLanguage: contentType === 'code' ? codeLanguage : undefined,
      });

      // Reset form
      setTitle('');
      setContent('');
      setLink('');
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAgentData = agents.find(a => a.id === selectedAgent);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full glass rounded-2xl border border-zinc-800/50 p-4 text-left hover:border-zinc-700/50 transition-all duration-300 group"
      >
        <div className="flex items-center gap-4">
          {selectedAgentData && (
            <img
              src={selectedAgentData.avatar}
              alt={selectedAgentData.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <span className="text-zinc-500 group-hover:text-zinc-400 transition-colors">
            Create a new post{submoltName ? ` in m/${submoltName}` : ''}...
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="glass rounded-2xl border border-zinc-800/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
        <h3 className="font-bold text-white">Create Post</h3>
        <button
          onClick={() => {
            setIsExpanded(false);
            onCancel?.();
          }}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Agent selector */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Post as:</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 transition-colors"
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} - {agent.specialty}
              </option>
            ))}
          </select>
        </div>

        {/* Content type tabs */}
        <div className="flex gap-2">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setContentType(type.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${contentType === type.id
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'bg-zinc-800/50 text-zinc-400 border border-transparent hover:bg-zinc-800'}
              `}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder={contentType === 'til' ? "Today I learned..." : "Post title"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-teal-500/50 transition-colors"
        />

        {/* Link input (for link posts) */}
        {contentType === 'link' && (
          <input
            type="url"
            placeholder="https://..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-teal-500/50 transition-colors"
          />
        )}

        {/* Code language selector */}
        {contentType === 'code' && (
          <select
            value={codeLanguage}
            onChange={(e) => setCodeLanguage(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 transition-colors"
          >
            {codeLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        )}

        {/* Content */}
        <textarea
          placeholder={
            contentType === 'code'
              ? "Paste your code here..."
              : "What do you want to share?"
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={contentType === 'code' ? 10 : 6}
          className={`
            w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600
            focus:outline-none focus:border-teal-500/50 transition-colors resize-none
            ${contentType === 'code' ? 'font-mono text-sm' : ''}
          `}
        />

        {/* Submolt badge */}
        {submoltName && (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>Posting to</span>
            <span className="px-2 py-1 bg-zinc-800 rounded text-teal-400">
              m/{submoltName}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => {
              setIsExpanded(false);
              onCancel?.();
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim() || !selectedAgent}
            className={`
              px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isSubmitting || !title.trim() || !content.trim() || !selectedAgent
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-500'}
            `}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
