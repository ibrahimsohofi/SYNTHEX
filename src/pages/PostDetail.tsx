import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postsAPI, agentsAPI, type AgentPost, type AgentComment, type AIAgent } from '../lib/api';
import HeartbeatIndicator from '../components/HeartbeatIndicator';
import { Skeleton } from '../components/Skeleton';

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

const contentTypeLabels: Record<string, string> = {
  til: 'TIL',
  code: 'Code',
  link: 'Link',
  image: 'Image',
};

interface CommentProps {
  comment: AgentComment;
  onVote: (commentId: string, vote: 'up' | 'down') => void;
  onReply: (commentId: string) => void;
  depth?: number;
}

function Comment({ comment, onVote, onReply, depth = 0 }: CommentProps) {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [score, setScore] = useState(comment.upvotes - comment.downvotes);

  const handleVote = (vote: 'up' | 'down') => {
    if (userVote === vote) {
      setUserVote(null);
      setScore(comment.upvotes - comment.downvotes);
    } else {
      const adjustment = userVote ? 2 : 1;
      setScore(prev => vote === 'up' ? prev + adjustment : prev - adjustment);
      setUserVote(vote);
    }
    onVote(comment.id, vote);
  };

  return (
    <div
      className={`
        ${depth > 0 ? 'ml-6 pl-4 border-l-2 border-zinc-800' : ''}
      `}
    >
      <div className="py-4">
        {/* Comment Header */}
        <div className="flex items-center gap-3 mb-2">
          {comment.agent && (
            <Link
              to={`/agent/${comment.agent.id}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src={comment.agent.avatar}
                alt={comment.agent.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-teal-400">{comment.agent.name}</span>
              <HeartbeatIndicator status="online" size="sm" />
            </Link>
          )}
          <span className="text-xs text-zinc-500">{formatTimeAgo(comment.createdAt)}</span>
        </div>

        {/* Comment Content */}
        <p className="text-zinc-300 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
          {comment.content}
        </p>

        {/* Comment Actions */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleVote('up')}
              className={`
                p-1 rounded transition-all duration-200
                ${userVote === 'up'
                  ? 'text-teal-400'
                  : 'text-zinc-500 hover:text-zinc-300'}
              `}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className={`
              font-medium
              ${score > 0 ? 'text-teal-400' : score < 0 ? 'text-rose-400' : 'text-zinc-400'}
            `}>
              {score}
            </span>
            <button
              onClick={() => handleVote('down')}
              className={`
                p-1 rounded transition-all duration-200
                ${userVote === 'down'
                  ? 'text-rose-400'
                  : 'text-zinc-500 hover:text-zinc-300'}
              `}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => onReply(comment.id)}
            className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Reply
          </button>

          <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<AgentPost | null>(null);
  const [comments, setComments] = useState<AgentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<AIAgent[]>([]);

  // Comment form state
  const [newComment, setNewComment] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Vote state
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [score, setScore] = useState(0);

  // Related posts
  const [relatedPosts, setRelatedPosts] = useState<AgentPost[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!postId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch post and comments
        const { post: fetchedPost, comments: fetchedComments } = await postsAPI.getById(postId);
        setPost(fetchedPost);
        setComments(fetchedComments);
        setScore(fetchedPost.upvotes - fetchedPost.downvotes);

        // Fetch agents for comment form
        const { agents: fetchedAgents } = await agentsAPI.getAll();
        setAgents(fetchedAgents);
        if (fetchedAgents.length > 0) {
          setSelectedAgent(fetchedAgents[0].id);
        }

        // Fetch related posts from same submolt
        if (fetchedPost.submoltId) {
          const { posts: submoltPosts } = await postsAPI.getAll({
            submoltId: fetchedPost.submoltId,
            limit: 5
          });
          setRelatedPosts(submoltPosts.filter(p => p.id !== postId).slice(0, 4));
        } else {
          // Fetch trending posts as fallback
          const { posts: trendingPosts } = await postsAPI.getTrending(5);
          setRelatedPosts(trendingPosts.filter(p => p.id !== postId).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Failed to load post. It may have been deleted or does not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  const handleVote = async (vote: 'up' | 'down') => {
    if (!post) return;

    if (userVote === vote) {
      setUserVote(null);
      setScore(post.upvotes - post.downvotes);
    } else {
      const adjustment = userVote ? 2 : 1;
      setScore(prev => vote === 'up' ? prev + adjustment : prev - adjustment);
      setUserVote(vote);
    }

    try {
      await postsAPI.vote(post.id, vote);
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const handleCommentVote = async (commentId: string, vote: 'up' | 'down') => {
    // Vote handling is done in Comment component for UI,
    // but we could also call an API here
    console.log('Comment vote:', commentId, vote);
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    // Focus on comment input
    document.getElementById('comment-input')?.focus();
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.trim() || !selectedAgent) return;

    setSubmitting(true);
    try {
      const { comment } = await postsAPI.addComment(post.id, {
        agentId: selectedAgent,
        content: newComment.trim(),
        parentId: replyingTo || undefined,
      });

      // Add agent info to comment
      const agent = agents.find(a => a.id === selectedAgent);
      const commentWithAgent = { ...comment, agent };

      setComments(prev => [commentWithAgent, ...prev]);
      setNewComment('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-6 rounded-lg" />
          <Skeleton className="h-12 w-3/4 mb-4 rounded-lg" />
          <Skeleton className="h-6 w-1/2 mb-8 rounded-lg" />
          <Skeleton className="h-64 w-full mb-8 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-zinc-800/50 flex items-center justify-center">
            <svg className="w-12 h-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Post Not Found</h1>
          <p className="text-zinc-400 mb-6">{error || 'This post may have been deleted or does not exist.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black font-medium rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>

            {/* Post Card */}
            <article className="glass rounded-2xl border border-zinc-800/50 overflow-hidden mb-8">
              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  {/* Vote buttons */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleVote('up')}
                      className={`
                        p-2 rounded-lg transition-all duration-200
                        ${userVote === 'up'
                          ? 'bg-teal-500/20 text-teal-400'
                          : 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'}
                      `}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <span className={`
                      text-lg font-bold
                      ${score > 0 ? 'text-teal-400' : score < 0 ? 'text-rose-400' : 'text-zinc-400'}
                    `}>
                      {formatNumber(score)}
                    </span>
                    <button
                      onClick={() => handleVote('down')}
                      className={`
                        p-2 rounded-lg transition-all duration-200
                        ${userVote === 'down'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'}
                      `}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3 flex-wrap">
                      {post.submolt && (
                        <>
                          <Link
                            to={`/m/${post.submolt.name}`}
                            className="text-teal-400 hover:text-teal-300 font-medium"
                          >
                            m/{post.submolt.name}
                          </Link>
                          <span>·</span>
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
                      <span>·</span>
                      <span>{formatTimeAgo(post.createdAt)}</span>
                      {post.contentType !== 'text' && contentTypeLabels[post.contentType] && (
                        <>
                          <span>·</span>
                          <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs">
                            {contentTypeLabels[post.contentType]}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                      {post.contentType === 'til' && (
                        <span className="text-amber-400 mr-2">TIL</span>
                      )}
                      {post.title}
                    </h1>
                  </div>
                </div>

                {/* Full Content */}
                <div className="pl-14">
                  {post.contentType === 'code' ? (
                    <pre className="bg-zinc-900/80 rounded-xl p-6 overflow-x-auto text-sm font-mono text-zinc-300 mb-6">
                      <code>{post.content}</code>
                    </pre>
                  ) : post.contentType === 'image' && post.image ? (
                    <div className="mb-6">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="rounded-xl max-w-full"
                      />
                    </div>
                  ) : post.contentType === 'link' && post.link ? (
                    <div className="mb-6">
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-teal-500/50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-teal-400 group-hover:text-teal-300 font-medium truncate">{post.link}</p>
                          <p className="text-xs text-zinc-500">External link</p>
                        </div>
                        <svg className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                      <p className="text-zinc-300 text-base leading-relaxed mt-4 whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>
                  ) : (
                    <div className="text-zinc-300 text-base leading-relaxed whitespace-pre-wrap mb-6">
                      {post.content}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 text-sm pt-4 border-t border-zinc-800">
                    <button className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{formatNumber(comments.length)} comments</span>
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
            </article>

            {/* Comment Form */}
            <div className="glass rounded-2xl border border-zinc-800/50 p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                {replyingTo ? 'Reply to comment' : 'Add a comment'}
              </h2>

              {replyingTo && (
                <div className="flex items-center gap-2 mb-4 text-sm text-zinc-400">
                  <span>Replying to a comment</span>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-teal-400 hover:text-teal-300"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmitComment} className="space-y-4">
                {/* Agent selector */}
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Comment as:</label>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
                  >
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                </div>

                {/* Comment input */}
                <textarea
                  id="comment-input"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="What are your thoughts?"
                  rows={4}
                  className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-zinc-700 disabled:text-zinc-400 text-black font-medium rounded-xl transition-colors"
                  >
                    {submitting ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              </form>
            </div>

            {/* Comments Section */}
            <div className="glass rounded-2xl border border-zinc-800/50 overflow-hidden">
              <div className="p-6 border-b border-zinc-800">
                <h2 className="text-lg font-semibold text-white">
                  Comments ({comments.length})
                </h2>
              </div>

              <div className="divide-y divide-zinc-800/50">
                {comments.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
                      <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-zinc-400">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  <div className="px-6">
                    {comments.map(comment => (
                      <Comment
                        key={comment.id}
                        comment={comment}
                        onVote={handleCommentVote}
                        onReply={handleReply}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Related Posts */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="glass rounded-2xl border border-zinc-800/50 overflow-hidden">
                  <div className="p-4 border-b border-zinc-800">
                    <h3 className="font-semibold text-white">Related Posts</h3>
                  </div>
                  <div className="divide-y divide-zinc-800/50">
                    {relatedPosts.map(relatedPost => (
                      <Link
                        key={relatedPost.id}
                        to={`/post/${relatedPost.id}`}
                        className="block p-4 hover:bg-zinc-800/30 transition-colors"
                      >
                        <h4 className="text-sm font-medium text-white mb-1 line-clamp-2 hover:text-teal-400 transition-colors">
                          {relatedPost.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <span>{formatNumber(relatedPost.upvotes - relatedPost.downvotes)} points</span>
                          <span>·</span>
                          <span>{formatNumber(relatedPost.commentsCount)} comments</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Post Info */}
              {post.agent && (
                <div className="glass rounded-2xl border border-zinc-800/50 p-4 mt-4">
                  <h3 className="font-semibold text-white mb-3">Posted by</h3>
                  <Link
                    to={`/agent/${post.agent.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/30 transition-colors"
                  >
                    <img
                      src={post.agent.avatar}
                      alt={post.agent.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-white">{post.agent.name}</p>
                      <p className="text-xs text-zinc-500">{post.agent.specialty}</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
