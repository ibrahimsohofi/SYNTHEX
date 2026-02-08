import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBlogPostById, getRelatedPosts } from '../data/blogPosts';

const BlogPost = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const post = postId ? getBlogPostById(postId) : undefined;
  const relatedPosts = postId ? getRelatedPosts(postId) : [];

  if (!post) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-zinc-400 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link
            to="/blog"
            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl transition-all"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Parse markdown-like content to HTML
  const renderContent = (content: string) => {
    const lines = content.trim().split('\n');
    const elements: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeContent = '';
    let codeLanguage = '';
    let inTable = false;
    let tableRows: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.slice(3);
          codeContent = '';
        } else {
          inCodeBlock = false;
          elements.push(
            <pre key={i} className="bg-black/50 rounded-xl p-4 overflow-x-auto mb-6 border border-white/5">
              <code className="text-sm text-teal-400 font-mono">{codeContent.trim()}</code>
            </pre>
          );
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent += line + '\n';
        continue;
      }

      // Table handling
      if (line.startsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        if (!line.includes('---')) {
          tableRows.push(line.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim()));
        }
        continue;
      } else if (inTable) {
        inTable = false;
        elements.push(
          <div key={i} className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {tableRows[0]?.map((cell, j) => (
                    <th key={j} className="text-left py-3 px-4 text-zinc-300 font-semibold">{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, j) => (
                  <tr key={j} className="border-b border-white/5">
                    {row.map((cell, k) => (
                      <td key={k} className="py-3 px-4 text-zinc-400">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }

      // Headers
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4">{line.slice(3)}</h2>
        );
        continue;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-xl font-semibold text-white mt-8 mb-3">{line.slice(4)}</h3>
        );
        continue;
      }
      if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={i} className="text-lg font-semibold text-white mt-6 mb-2">{line.slice(5)}</h4>
        );
        continue;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="border-l-4 border-teal-500/50 pl-4 py-2 my-4 text-zinc-300 italic bg-teal-500/5 rounded-r-lg">
            {line.slice(2)}
          </blockquote>
        );
        continue;
      }

      // Lists
      if (line.startsWith('- ')) {
        elements.push(
          <li key={i} className="text-zinc-400 ml-6 list-disc mb-2">{line.slice(2)}</li>
        );
        continue;
      }
      if (/^\d+\. /.test(line)) {
        elements.push(
          <li key={i} className="text-zinc-400 ml-6 list-decimal mb-2">{line.replace(/^\d+\. /, '')}</li>
        );
        continue;
      }

      // Inline code and emphasis
      if (line.trim()) {
        const processedLine = line
          .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em class="text-zinc-300 italic">$1</em>')
          .replace(/`([^`]+)`/g, '<code class="bg-black/30 px-2 py-0.5 rounded text-teal-400 text-sm font-mono">$1</code>');

        elements.push(
          <p
            key={i}
            className="text-zinc-400 leading-relaxed mb-4"
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        );
      }
    }

    return elements;
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background */}
      <div className="fixed inset-0 gradient-mesh opacity-30 pointer-events-none" />

      <article className="relative max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8 animate-fade-in">
          <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-teal-400 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-zinc-300 truncate max-w-[200px]">{post.title}</span>
        </div>

        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 animate-fade-in"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>

        {/* Hero Image */}
        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8 animate-fade-in-up">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
          <span className="absolute top-4 left-4 px-3 py-1 bg-teal-500 text-black text-xs font-bold rounded-lg uppercase">
            {post.category}
          </span>
        </div>

        {/* Header */}
        <header className="mb-12 animate-fade-in-up delay-100">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6">
            {/* Author */}
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full bg-zinc-800"
              />
              <div>
                <p className="font-medium text-white">{post.author.name}</p>
                <p className="text-sm text-zinc-500">{post.date}</p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {post.readTime}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="glass-card rounded-2xl p-6 md:p-10 mb-12 animate-fade-in-up delay-200">
          <div className="prose prose-invert max-w-none">
            {renderContent(post.content)}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-12 animate-fade-in delay-300">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 glass rounded-full text-sm text-zinc-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Author Bio */}
        <div className="glass-card rounded-2xl p-6 mb-12 animate-fade-in-up delay-300">
          <div className="flex items-start gap-4">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-16 h-16 rounded-full bg-zinc-800"
            />
            <div>
              <h3 className="font-semibold text-white mb-1">About {post.author.name}</h3>
              <p className="text-zinc-400 text-sm">{post.author.bio}</p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="animate-fade-in-up delay-400">
            <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.id}`}
                  className="glass-card rounded-xl overflow-hidden card-hover group"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-4">
                    <span className="text-teal-400 text-xs font-medium uppercase tracking-wide">
                      {relatedPost.category}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-1 line-clamp-2 group-hover:text-teal-400 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-2">{relatedPost.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
};

export default BlogPost;
