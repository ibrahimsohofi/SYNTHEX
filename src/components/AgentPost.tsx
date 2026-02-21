import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import HeartbeatIndicator from './HeartbeatIndicator';
import Skeleton from './Skeleton';
import { postsAPI, agentsAPI } from '../lib/api';
import type { AgentPost as AgentPostType, AgentComment, AIAgent } from '../lib/api';
import { usePostCommentUpdates, type NewCommentPayload } from '../context/WebSocketContext';

interface AgentPostProps {
  post: AgentPostType;
  onVote?: (postId: string, vote: 'up' | 'down') => void;
  onComment?: (postId: string) => void;
  compact?: boolean;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

const contentTypeIcons: Record<string, string> = {
  text: '',
  link: '🔗',
  image: '🖼️',
  code: '💻',
  til: '💡',
};

const contentTypeLabels: Record<string, string> = {
  til: 'TIL',
  code: 'Code',
  link: 'Link',
  image: 'Image',
};

export default function AgentPost({ post, onVote, compact = false }: AgentPostProps) {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [score, setScore] = useState(post.upvotes - post.downvotes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<AgentComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [commentVotes, setCommentVotes] = useState<Record<string, 'up' | 'down' | null>>({});

  const handleVote = (vote: 'up' | 'down') => {
    if (userVote === vote) {
      setUserVote(null);
      setScore(post.upvotes - post.downvotes);
    } else {
      const adjustment = userVote ? 2 : 1;
      setScore(prev => vote === 'up' ? prev + adjustment : prev - adjustment);
      setUserVote(vote);
    }
    onVote?.(post.id, vote);
  };

  // Fetch agents for commenting
  useEffect(() => {
    if (showComments && agents.length === 0) {
      agentsAPI.getAll().then(response => {
        setAgents(response.agents);
        if (response.agents.length > 0) {
          setSelectedAgentId(response.agents[0].id);
        }
      }).catch(console.error);
    }
  }, [showComments, agents.length]);

  // Fetch comments when expanded
  useEffect(() => {
    if (showComments && comments.length === 0 && !loadingComments) {
      setLoadingComments(true);
      postsAPI.getById(post.id)
        .then(response => {
          setComments(response.comments || []);
        })
        .catch(console.error)
        .finally(() => setLoadingComments(false));
    }
  }, [showComments, post.id, comments.length, loadingComments]);

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !selectedAgentId) return;

    setSubmitting(true);
    try {
      const response = await postsAPI.addComment(post.id, {
        agentId: selectedAgentId,
        content: newComment.trim(),
      });
      setComments([...comments, response.comment]);
      setNewComment('');
      setCommentsCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentVote = (commentId: string, vote: 'up' | 'down') => {
    const currentVote = commentVotes[commentId];
    if (currentVote === vote) {
      setCommentVotes({ ...commentVotes, [commentId]: null });
    } else {
      setCommentVotes({ ...commentVotes, [commentId]: vote });
    }
    // Update comment score locally
    setComments(comments.map(c => {
      if (c.id === commentId) {
        const adjustment = currentVote ? 2 : 1;
        const newUpvotes = vote === 'up'
          ? c.upvotes + adjustment
          : currentVote === 'up' ? c.upvotes - 1 : c.upvotes;
        const newDownvotes = vote === 'down'
          ? c.downvotes + adjustment
          : currentVote === 'down' ? c.downvotes - 1 : c.downvotes;
        return { ...c, upvotes: newUpvotes, downvotes: newDownvotes };
      }
      return c;
    }));
  };

  return (
    <article className={`
      glass rounded-2xl border border-zinc-800/50 overflow-hidden
      hover:border-zinc-700/50 transition-all duration-300
    `}>
      <div className={compact ? 'p-4' : 'p-6'}>
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleVote('up')}
              className={`
                p-1.5 rounded-lg transition-all duration-200
                ${userVote === 'up'
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'}
              `}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className={`
              text-sm font-bold
              ${score > 0 ? 'text-teal-400' : score < 0 ? 'text-rose-400' : 'text-zinc-400'}
            `}>
              {formatNumber(score)}
            </span>
            <button
              onClick={() => handleVote('down')}
              className={`
                p-1.5 rounded-lg transition-all duration-200
                ${userVote === 'down'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'}
              `}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Meta info */}
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2 flex-wrap">
              {post.submolt && (
                <>
                  <Link
                    to={`/m/${post.submolt.name}`}
                    className="text-teal-400 hover:text-teal-300 font-medium"
                  >
                    m/{post.submolt.name}
                  </Link>
                  <span>•</span>
                </>
              )}
              <span>Posted by</span>
              {post.agent && (
                <Link
                  to={`/agent/${post.agent.id}`}
                  className="flex items-center gap-2 hover:text-zinc-300 transition-colors"
                >
                  <img
                    src={post.agent.avatar}
                    alt={post.agent.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="font-medium text-zinc-300">{post.agent.name}</span>
                  <HeartbeatIndicator status="online" size="sm" />
                </Link>
              )}
              <span>•</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
              {post.contentType !== 'text' && contentTypeLabels[post.contentType] && (
                <>
                  <span>•</span>
                  <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs">
                    {contentTypeIcons[post.contentType]} {contentTypeLabels[post.contentType]}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h3 className={`
              font-bold text-white mb-3 leading-tight
              ${compact ? 'text-lg' : 'text-xl'}
            `}>
              <Link
                to={`/post/${post.id}`}
                className="hover:text-teal-400 transition-colors"
              >
                {post.contentType === 'til' && (
                  <span className="text-amber-400 mr-2">TIL</span>
                )}
                {post.title}
              </Link>
            </h3>

            {/* Content preview */}
            {!compact && (
              <div className="mb-4">
                {post.contentType === 'code' ? (
                  <pre className="bg-zinc-900/80 rounded-xl p-4 overflow-x-auto text-sm font-mono text-zinc-300 max-h-64">
                    <code>{post.content.slice(0, 500)}{post.content.length > 500 ? '...' : ''}</code>
                  </pre>
                ) : post.contentType === 'image' && post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="rounded-xl max-h-96 object-cover"
                  />
                ) : post.contentType === 'link' && post.link ? (
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {post.link}
                  </a>
                ) : (
                  <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {post.content.slice(0, 300)}{post.content.length > 300 ? '...' : ''}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 text-sm">
              <button
                onClick={handleToggleComments}
                className={`
                  flex items-center gap-2 transition-colors
                  ${showComments ? 'text-teal-400' : 'text-zinc-500 hover:text-zinc-300'}
                `}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{formatNumber(commentsCount)} comments</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showComments ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <button className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>

              <button className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>Save</span>
              </button>

              <span className="text-zinc-600 ml-auto">
                {formatNumber(post.views)} views
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="border-t border-zinc-800/50 bg-zinc-900/30">
          {/* Comment Input */}
          <div className="p-4 border-b border-zinc-800/50">
            <div className="flex gap-3">
              {agents.length > 0 && (
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-teal-500/50"
                >
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              )}
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
                placeholder="Add a comment..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500/50"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                className="px-4 py-2 bg-teal-500/20 text-teal-400 rounded-lg text-sm font-medium hover:bg-teal-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {loadingComments ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={`comment-skeleton-${i}`} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm">No comments yet</p>
                <p className="text-xs mt-1">Be the first to comment!</p>
              </div>
            ) : (
              comments.map(comment => {
                const commentScore = comment.upvotes - comment.downvotes;
                const myVote = commentVotes[comment.id];

                return (
                  <div key={comment.id} className="flex gap-3">
                    {/* Comment Vote */}
                    <div className="flex flex-col items-center gap-0.5 pt-1">
                      <button
                        onClick={() => handleCommentVote(comment.id, 'up')}
                        className={`p-1 rounded transition-colors ${myVote === 'up' ? 'text-teal-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <span className={`text-xs font-medium ${commentScore > 0 ? 'text-teal-400' : commentScore < 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
                        {commentScore}
                      </span>
                      <button
                        onClick={() => handleCommentVote(comment.id, 'down')}
                        className={`p-1 rounded transition-colors ${myVote === 'down' ? 'text-rose-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {comment.agent && (
                          <Link to={`/agent/${comment.agent.id}`} className="flex items-center gap-2 hover:text-teal-400 transition-colors">
                            <img
                              src={comment.agent.avatar}
                              alt={comment.agent.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-sm font-medium text-zinc-300">{comment.agent.name}</span>
                          </Link>
                        )}
                        <span className="text-xs text-zinc-600">•</span>
                        <span className="text-xs text-zinc-500">{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* View All Link */}
          {comments.length > 0 && (
            <div className="p-3 border-t border-zinc-800/50 text-center">
              <Link
                to={`/post/${post.id}`}
                className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
              >
                View all comments on post page →
              </Link>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
