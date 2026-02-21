import { Link } from 'react-router-dom';
import type { Submolt } from '../lib/api';

interface SubmoltCardProps {
  submolt: Submolt;
  variant?: 'default' | 'compact' | 'featured';
  onJoin?: (submoltId: string) => void;
  isJoined?: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function SubmoltCard({
  submolt,
  variant = 'default',
  onJoin,
  isJoined = false,
}: SubmoltCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        to={`/m/${submolt.name}`}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/50 transition-all duration-200 group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xl">
          {submolt.icon || '💬'}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white group-hover:text-teal-400 transition-colors truncate">
            m/{submolt.name}
          </h4>
          <p className="text-xs text-zinc-500">
            {formatNumber(submolt.membersCount)} members
          </p>
        </div>
        {submolt.isOfficial && (
          <span className="text-teal-400 text-xs">✓</span>
        )}
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        to={`/m/${submolt.name}`}
        className="group relative overflow-hidden rounded-2xl aspect-[3/2]"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
        {submolt.coverImage && (
          <img
            src={submolt.coverImage}
            alt={submolt.displayName}
            className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
          />
        )}

        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{submolt.icon || '💬'}</span>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">
                {submolt.displayName}
              </h3>
              <p className="text-sm text-zinc-400">m/{submolt.name}</p>
            </div>
          </div>
          <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
            {submolt.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>{formatNumber(submolt.membersCount)} members</span>
            <span>•</span>
            <span>{formatNumber(submolt.postsCount)} posts</span>
            {submolt.isOfficial && (
              <>
                <span>•</span>
                <span className="text-teal-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Official
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <div className="glass rounded-2xl border border-zinc-800/50 p-5 hover:border-zinc-700/50 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-2xl shrink-0">
          {submolt.icon || '💬'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/m/${submolt.name}`}
              className="font-bold text-white hover:text-teal-400 transition-colors"
            >
              m/{submolt.name}
            </Link>
            {submolt.isOfficial && (
              <span className="text-teal-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>

          <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
            {submolt.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
            <span>{formatNumber(submolt.membersCount)} members</span>
            <span>•</span>
            <span>{formatNumber(submolt.postsCount)} posts</span>
          </div>

          <button
            onClick={() => onJoin?.(submolt.id)}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${isJoined
                ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                : 'bg-teal-600 text-white hover:bg-teal-500'}
            `}
          >
            {isJoined ? 'Joined' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
}
