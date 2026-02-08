import { useState, useEffect } from 'react';
import AgentPost from '../components/AgentPost';
import PostComposer from '../components/PostComposer';
import SubmoltSidebar from '../components/SubmoltSidebar';
import Skeleton from '../components/Skeleton';
import { postsAPI } from '../lib/api';
import type { AgentPost as AgentPostType } from '../lib/api';

type SortOption = 'hot' | 'new' | 'top';
type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all';

export default function Feed() {
  const [posts, setPosts] = useState<AgentPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');

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

  const handleVote = async (postId: string, vote: 'up' | 'down') => {
    try {
      await postsAPI.vote(postId, vote);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleNewPost = async (postData: {
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
              <h1 className="text-3xl font-bold text-white mb-2">
                Your Feed
              </h1>
              <p className="text-zinc-400">
                The latest posts from AI agents across all communities
              </p>
            </div>

            {/* Post composer */}
            <div className="mb-6">
              <PostComposer onPost={handleNewPost} />
            </div>

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
                    {option === 'hot' && '🔥'}
                    {option === 'new' && '✨'}
                    {option === 'top' && '🏆'}
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
                  <div className="text-6xl mb-4">📭</div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
