import { Link } from 'react-router-dom';
import type { Skill } from '../lib/api';

interface SkillCardProps {
  skill: Skill;
  variant?: 'default' | 'compact' | 'featured';
  onInstall?: (skillId: string) => void;
  isInstalled?: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  communication: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  automation: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  analysis: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  creative: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  utility: { bg: 'bg-zinc-500/20', text: 'text-zinc-400' },
  integration: { bg: 'bg-teal-500/20', text: 'text-teal-400' },
  security: { bg: 'bg-red-500/20', text: 'text-red-400' },
};

export default function SkillCard({
  skill,
  variant = 'default',
  onInstall,
  isInstalled = false,
}: SkillCardProps) {
  const categoryStyle = categoryColors[skill.category] || categoryColors.utility;

  if (variant === 'compact') {
    return (
      <Link
        to={`/skills/${skill.slug}`}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/50 transition-all duration-200 group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xl">
          {skill.icon || '⚡'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-white group-hover:text-teal-400 transition-colors truncate">
              {skill.name}
            </h4>
            {skill.isVerified && (
              <span className="text-teal-400 text-xs">✓</span>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            {formatNumber(skill.downloads)} installs
          </p>
        </div>
        {skill.rating && (
          <div className="flex items-center gap-1 text-amber-400 text-sm">
            <span>★</span>
            <span>{skill.rating.toFixed(1)}</span>
          </div>
        )}
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        to={`/skills/${skill.slug}`}
        className="group glass rounded-2xl border border-zinc-800/50 overflow-hidden hover:border-teal-500/30 transition-all duration-300"
      >
        {/* Header with gradient */}
        <div className={`h-24 ${categoryStyle.bg} relative`}>
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">
            {skill.icon || '⚡'}
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {skill.isOfficial && (
              <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full">
                Official
              </span>
            )}
            {skill.isVerified && (
              <span className="px-2 py-1 bg-white/10 text-white text-xs rounded-full">
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-2xl border border-zinc-700">
              {skill.icon || '⚡'}
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-teal-400 transition-colors">
                {skill.name}
              </h3>
              <p className="text-xs text-zinc-500">by {skill.author}</p>
            </div>
          </div>

          <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
            {skill.description}
          </p>

          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-3">
              <span>{formatNumber(skill.downloads)} installs</span>
              {skill.rating && (
                <span className="flex items-center gap-1 text-amber-400">
                  <span>★</span>
                  <span>{skill.rating.toFixed(1)}</span>
                </span>
              )}
            </div>
            <span className={`px-2 py-1 rounded ${categoryStyle.bg} ${categoryStyle.text}`}>
              {skill.category}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <div className="glass rounded-2xl border border-zinc-800/50 p-5 hover:border-zinc-700/50 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-2xl shrink-0 border border-zinc-700">
          {skill.icon || '⚡'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link
              to={`/skills/${skill.slug}`}
              className="font-bold text-white hover:text-teal-400 transition-colors"
            >
              {skill.name}
            </Link>
            <span className="text-xs text-zinc-500">v{skill.version}</span>
            {skill.isVerified && (
              <span className="text-teal-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-500 mb-2">by {skill.author}</p>

          <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
            {skill.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
            <span>{formatNumber(skill.downloads)} installs</span>
            {skill.rating && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span>★</span>
                  <span>{skill.rating.toFixed(1)}</span>
                  <span className="text-zinc-500">({skill.ratingsCount})</span>
                </span>
              </>
            )}
            <span>•</span>
            <span className={`px-2 py-1 rounded ${categoryStyle.bg} ${categoryStyle.text}`}>
              {skill.category}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onInstall?.(skill.id)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${isInstalled
                  ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                  : 'bg-teal-600 text-white hover:bg-teal-500'}
              `}
            >
              {isInstalled ? 'Installed' : 'Install'}
            </button>
            <Link
              to={`/skills/${skill.slug}`}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
