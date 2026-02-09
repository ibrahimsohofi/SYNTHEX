import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AgentPost from '../components/AgentPost';
import PostComposer from '../components/PostComposer';
import Skeleton from '../components/Skeleton';
import { submoltsAPI, postsAPI } from '../lib/api';
import type { Submolt as SubmoltType, AgentPost as AgentPostType, AIAgent } from '../lib/api';

type SortOption = 'hot' | 'new' | 'top';

export default function Submolt() {
  const { submoltName } = useParams<{ submoltName: string }>();
  const [submolt, setSubmolt] = useState<SubmoltType & { creator?: AIAgent } | null>(null);
  const [posts, setPosts] = useState<AgentPostType[]>([]);
  const [members, setMembers] = useState<{ agent: AIAgent; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('hot');

  useEffect(() => {
    async function fetchSubmolt() {
      if (!submoltName) return;

      setLoading(true);
      try {
        const response = await submoltsAPI.getByName(submoltName);
        setSubmolt(response.submolt);
        setPosts(response.posts);
        setMembers(response.members);
      } catch (error) {
        console.error('Error fetching submolt:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmolt();
  }, [submoltName]);

  const handleVote = async (postId: string, vote: 'up' | 'down') => {
    try {
      await postsAPI.vote(postId, vote);
      // Update local state
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            upvotes: vote === 'up' ? p.upvotes + 1 : p.upvotes,
            downvotes: vote === 'down' ? p.downvotes + 1 : p.downvotes,
            score: vote === 'up' ? p.score + 1 : p.score - 1,
          };
        }
        return p;
      }));
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
      const response = await postsAPI.create({
        ...postData,
        submoltId: submolt?.id,
      });
      setPosts([response.post, ...posts]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cover skeleton */}
          <Skeleton className="h-48 rounded-2xl mb-6" />
          <div className="flex gap-8">
            <div className="flex-1 max-w-3xl space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={`post-skeleton-${i}`} className="h-64 rounded-2xl" />
              ))}
            </div>
            <div className="hidden lg:block w-80">
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!submolt) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">Submolt not found</h1>
          <p className="text-zinc-400 mb-6">The community you're looking for doesn't exist.</p>
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-black font-semibold rounded-xl hover:bg-teal-400 transition-colors"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Cover image */}
      <div className="relative h-48 bg-gradient-to-r from-teal-600/20 via-purple-600/20 to-pink-600/20">
        {submolt.coverImage && (
          <img
            src={submolt.coverImage}
            alt={submolt.displayName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative">
        {/* Submolt header */}
        <div className="glass rounded-2xl border border-zinc-800/50 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl border border-zinc-700">
              {submolt.icon || '💬'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">
                  m/{submolt.name}
                </h1>
                {submolt.isOfficial && (
                  <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs font-medium rounded-full">
                    Official
                  </span>
                )}
              </div>
              <p className="text-zinc-400 mb-4">{submolt.description}</p>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-white font-bold">{submolt.membersCount.toLocaleString()}</span>
                  <span className="text-zinc-500 ml-1">members</span>
                </div>
                <div>
                  <span className="text-white font-bold">{submolt.postsCount.toLocaleString()}</span>
                  <span className="text-zinc-500 ml-1">posts</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-zinc-500">Active now</span>
                </div>
              </div>
            </div>
            <button className="px-6 py-2 bg-teal-500 text-black font-semibold rounded-xl hover:bg-teal-400 transition-colors">
              Join
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 max-w-3xl">
            {/* Post composer */}
            <div className="mb-6">
              <PostComposer onPost={handleNewPost} submoltId={submolt.id} />
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
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {posts.length > 0 ? (
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
                  <p className="text-zinc-400">
                    Be the first to share something in m/{submolt.name}!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* About */}
              <div className="glass rounded-2xl border border-zinc-800/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">About Community</h3>
                <p className="text-zinc-400 text-sm mb-4">{submolt.description}</p>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Created</span>
                    <span className="text-zinc-300">
                      {new Date(submolt.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {submolt.creator && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Created by</span>
                      <Link
                        to={`/agent/${submolt.creator.id}`}
                        className="text-teal-400 hover:text-teal-300 flex items-center gap-2"
                      >
                        <img
                          src={submolt.creator.avatar}
                          alt={submolt.creator.name}
                          className="w-5 h-5 rounded-full"
                        />
                        {submolt.creator.name}
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Members */}
              <div className="glass rounded-2xl border border-zinc-800/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Moderators</h3>
                <div className="space-y-3">
                  {members
                    .filter(m => m.role === 'admin' || m.role === 'moderator')
                    .map((member) => (
                      <Link
                        key={member.agent.id}
                        to={`/agent/${member.agent.id}`}
                        className="flex items-center gap-3 hover:bg-zinc-800/50 p-2 rounded-lg transition-colors"
                      >
                        <img
                          src={member.agent.avatar}
                          alt={member.agent.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-white">{member.agent.name}</p>
                          <p className="text-xs text-zinc-500 capitalize">{member.role}</p>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>

              {/* Rules */}
              {submolt.rules && (
                <div className="glass rounded-2xl border border-zinc-800/50 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Rules</h3>
                  <div className="space-y-2 text-sm text-zinc-400">
                    {JSON.parse(submolt.rules).map((rule: string, i: number) => (
                      <div key={`rule-${rule.slice(0, 20)}`} className="flex gap-2">
                        <span className="text-teal-400 font-bold">{i + 1}.</span>
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
