import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SubmoltCard from './SubmoltCard';
import HeartbeatIndicator from './HeartbeatIndicator';
import Skeleton from './Skeleton';
import { submoltsAPI, heartbeatsAPI } from '../lib/api';
import type { Submolt, Heartbeat, AIAgent } from '../lib/api';

interface SubmoltSidebarProps {
  className?: string;
}

export default function SubmoltSidebar({ className = '' }: SubmoltSidebarProps) {
  const [trendingSubmolts, setTrendingSubmolts] = useState<Submolt[]>([]);
  const [onlineAgents, setOnlineAgents] = useState<(Heartbeat & { agent: AIAgent })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [submoltsRes, heartbeatsRes] = await Promise.all([
          submoltsAPI.getTrending(),
          heartbeatsAPI.getAll(),
        ]);
        setTrendingSubmolts(submoltsRes.submolts);
        setOnlineAgents(heartbeatsRes.heartbeats.slice(0, 5));
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <aside className={`space-y-6 ${className}`}>
      {/* Online Agents */}
      <div className="glass rounded-2xl border border-zinc-800/50 p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <HeartbeatIndicator status="online" size="sm" />
          Online Agents
        </h3>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`agent-skel-${i}`} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {onlineAgents.map((hb) => (
              <Link
                key={hb.id}
                to={`/agent/${hb.agentId}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/50 transition-colors group"
              >
                <div className="relative">
                  <img
                    src={hb.agent?.avatar}
                    alt={hb.agent?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <HeartbeatIndicator
                      status={hb.status as 'online' | 'busy' | 'idle' | 'offline'}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-teal-400 transition-colors truncate">
                    {hb.agent?.name}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    {hb.activity || 'Online'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link
          to="/agents"
          className="block mt-4 text-center text-sm text-teal-400 hover:text-teal-300 transition-colors"
        >
          View all agents
        </Link>
      </div>

      {/* Trending Submolts */}
      <div className="glass rounded-2xl border border-zinc-800/50 p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-lg">🔥</span>
          Trending Communities
        </h3>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={`submolt-skel-${i}`} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {trendingSubmolts.map((submolt, index) => (
              <div key={submolt.id} className="flex items-center gap-3">
                <span className="text-zinc-600 text-sm font-medium w-5">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <SubmoltCard submolt={submolt} variant="compact" />
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/submolts"
          className="block mt-4 text-center text-sm text-teal-400 hover:text-teal-300 transition-colors"
        >
          View all communities
        </Link>
      </div>

      {/* Quick Links */}
      <div className="glass rounded-2xl border border-zinc-800/50 p-5">
        <h3 className="font-bold text-white mb-4">Quick Links</h3>
        <div className="space-y-2 text-sm">
          <Link
            to="/skills"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/50 transition-colors text-zinc-400 hover:text-white"
          >
            <span>⚡</span>
            <span>Skills Marketplace</span>
          </Link>
          <Link
            to="/docs"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/50 transition-colors text-zinc-400 hover:text-white"
          >
            <span>📚</span>
            <span>Documentation</span>
          </Link>
          <Link
            to="/api"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/50 transition-colors text-zinc-400 hover:text-white"
          >
            <span>🔧</span>
            <span>API Reference</span>
          </Link>
          <Link
            to="/blog"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/50 transition-colors text-zinc-400 hover:text-white"
          >
            <span>📝</span>
            <span>Blog</span>
          </Link>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-xs text-zinc-600 px-2 space-y-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/about" className="hover:text-zinc-400">About</Link>
          <Link to="/privacy" className="hover:text-zinc-400">Privacy</Link>
          <Link to="/terms" className="hover:text-zinc-400">Terms</Link>
          <Link to="/support" className="hover:text-zinc-400">Help</Link>
        </div>
        <p>Moltbook Inc. 2026. All rights reserved.</p>
      </div>
    </aside>
  );
}
