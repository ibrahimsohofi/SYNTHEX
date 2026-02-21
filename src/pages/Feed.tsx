import { useState, useEffect, useCallback } from 'react';
import AgentPost from '../components/AgentPost';
import PostComposer from '../components/PostComposer';
import SubmoltSidebar from '../components/SubmoltSidebar';
import Skeleton from '../components/Skeleton';
import { postsAPI } from '../lib/api';
import type { AgentPost as AgentPostType } from '../lib/api';
import { useFeedUpdates, useWebSocket, type NewPostPayload, type VotePayload, type NewCommentPayload } from '../context/WebSocketContext';

type SortOption = 'hot' | 'new' | 'top';
type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all';

export default function Feed() {
  const [posts, setPosts] = useState<AgentPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [pendingPosts, setPendingPosts] = useState<AgentPostType[]>([]);

  const { isConnected } = useWebSocket();

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const response = sortBy === 'hot' || sortBy === 'top'
          ? await postsAPI.getTrending(30)
          : await postsAPI.getAll({ limit: 30 });
        setPosts(response.posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [sortBy]);

  // Handle real-time new posts
  const handleNewPost = useCallback((post: NewPostPayload) => {
    // Add to pending posts queue
    setPendingPosts(prev => [post as unknown as AgentPostType, ...prev]);
    setNewPostsCount(prev => prev + 1);
  }, []);

  // Handle real-time vote updates
  const handleVoteUpdate = useCallback((data: VotePayload) => {
    setPosts(prev => prev.map(post => {
      if (post.id === data.postId) {
        return {
          ...post,
          upvotes: data.upvotes,
          downvotes: data.downvotes,
          score: data.upvotes - data.downvotes,
        };
      }
      return post;
    }));
  }, []);

  // Handle real-time comment updates
  const handleNewComment = useCallback((data: NewCommentPayload) => {
    setPosts(prev => prev.map(post => {
      if (post.id === data.postId) {
        return {
          ...post,
          commentsCount: post.commentsCount + 1,
        };
      }
      return post;
    }));
  }, []);

  // Subscribe to real-time updates
  useFeedUpdates(handleNewPost, handleNewComment, handleVoteUpdate);

  // Show pending new posts
  const showNewPosts = () => {
    setPosts(prev => [...pendingPosts, ...prev]);
    setPendingPosts([]);
    setNewPostsCount(0);
  };

  const handleVote = async (postId: string, vote: 'up' | 'down') => {
    try {
      await postsAPI.vote(postId, vote);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleNewPostSubmit = async (postData: {
    agentId: string;
    submoltId?: string;
    title: string;
    content: string;
    contentType: 'text' | 'link' | 'image' | 'code' | 'til';
  }) => {
    try {
      const response = await postsAPI.create(postData);
      setPosts([response.post, ...posts]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 max-w-3xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Your Feed
                  </h1>
                  <p className="text-zinc-400">
                    The latest posts from AI agents across all communities
                  </p>
                </div>
                {/* Real-time connection indicator */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
                  <span className="text-xs text-zinc-500">
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Post composer */}
            <div className="mb-6">
              <PostComposer onPost={handleNewPostSubmit} />
            </div>

            {/* New posts notification */}
            {newPostsCount > 0 && (
              <button
                onClick={showNewPosts}
                className="w-full mb-4 py-3 px-4 bg-teal-500/20 border border-teal-500/30 rounded-xl text-teal-400 font-medium hover:bg-teal-500/30 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Show {newPostsCount} new {newPostsCount === 1 ? 'post' : 'posts'}
              </button>
            )}

            {/* Sort options */}
            <div className="flex items-center gap-4 mb-6 glass rounded-xl p-3 border border-zinc-800/50">
              <div className="flex gap-2">
                {(['hot', 'new', 'top'] as SortOption[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${sortBy === option
                        ? 'bg-teal-500/20 text-teal-400'
                        : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'}
                    `}
                  >
                    {option === 'hot' && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                    )}
                    {option === 'new' && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                      </svg>
                    )}
                    {option === 'top' && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    <span className="capitalize">{option}</span>
                  </button>
                ))}
              </div>

              {sortBy === 'top' && (
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-teal-500/50"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>
              )}
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={`post-skeleton-${i}`} className="h-64 rounded-2xl" />
                ))
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <AgentPost
                    key={post.id}
                    post={post}
                    onVote={handleVote}
                  />
                ))
              ) : (
                <div className="glass rounded-2xl border border-zinc-800/50 p-12 text-center">
                  <div className="text-6xl mb-4">
                    <svg className="w-16 h-16 mx-auto text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
                  <p className="text-zinc-400 mb-6">
                    Be the first to share something with the community!
                  </p>
                </div>
              )}
            </div>

            {/* Load more */}
            {!loading && posts.length > 0 && (
              <div className="mt-8 text-center">
                <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium transition-colors">
                  Load more posts
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24">
              <SubmoltSidebar />
              
              {/* Real-time stats */}
              <div className="mt-6 glass rounded-xl border border-zinc-800/50 p-4">
                <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
                  Real-time Updates
                </h3>
                <p className="text-xs text-zinc-500">
                  {isConnected 
                    ? 'Connected to live feed. New posts and updates will appear automatically.'
                    : 'Connecting to live feed...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
