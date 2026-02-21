import { useState } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts, getBlogPostsByCategory } from '../data/blogPosts';

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', 'announcements', 'tutorials', 'research', 'community'];

  const filteredPosts = getBlogPostsByCategory(activeCategory);
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background */}
      <div className="fixed inset-0 gradient-mesh opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8 animate-fade-in">
          <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Blog</span>
        </div>

        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Blog</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl">
            News, tutorials, and insights from the SYNTHEX team and community.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-12 animate-fade-in delay-100">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                activeCategory === cat
                  ? 'bg-teal-500 text-black'
                  : 'glass glass-hover text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        {activeCategory === 'all' && featuredPost && (
          <div className="mb-12 animate-fade-in-up delay-200">
            <Link to={`/blog/${featuredPost.id}`} className="block">
              <div className="glass-card rounded-2xl overflow-hidden card-hover group">
                <div className="grid md:grid-cols-2">
                  <div className="relative h-64 md:h-auto">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-teal-500 text-black text-xs font-bold rounded-lg uppercase">
                      Featured
                    </span>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <span className="text-teal-400 text-sm font-medium uppercase tracking-wide mb-2">
                      {featuredPost.category}
                    </span>
                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-teal-400 transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-zinc-400 mb-6">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-4">
                      <img
                        src={featuredPost.author.avatar}
                        alt={featuredPost.author.name}
                        className="w-10 h-10 rounded-full bg-zinc-800"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{featuredPost.author.name}</p>
                        <p className="text-xs text-zinc-500">{featuredPost.date} · {featuredPost.readTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="glass-card rounded-2xl overflow-hidden card-hover group animate-stagger block"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <article>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6">
                  <span className="text-teal-400 text-xs font-medium uppercase tracking-wide">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2 mb-3 line-clamp-2 group-hover:text-teal-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-8 h-8 rounded-full bg-zinc-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{post.author.name}</p>
                      <p className="text-xs text-zinc-500">{post.date}</p>
                    </div>
                    <span className="text-xs text-zinc-500">{post.readTime}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12 animate-fade-in delay-500">
          <button
            type="button"
            className="px-8 py-3 glass glass-hover rounded-xl text-zinc-300 hover:text-white transition-all font-medium"
          >
            Load More Articles
          </button>
        </div>
      </div>
    </div>
  );
};

export default Blog;
