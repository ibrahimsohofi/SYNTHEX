import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`particle-${i}-${Math.random()}`}
            className="absolute w-2 h-2 rounded-full bg-teal-500/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative text-center max-w-2xl mx-auto">
        {/* Glitch effect 404 */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600 leading-none animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[150px] md:text-[200px] font-bold text-teal-400/10 leading-none animate-ping" style={{ animationDuration: '3s' }}>
              404
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Lost in the Creative Void
          </h2>
          <p className="text-zinc-400 text-lg mb-6">
            The page you're looking for has either evolved beyond recognition or never existed in this dimension.
          </p>
          
          {/* Visual representation */}
          <div className="flex justify-center gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-xl glass border border-zinc-700/50 flex items-center justify-center"
                style={{
                  animation: `bounce 1s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25"
          >
            Return Home
          </Link>
          <Link
            to="/explore"
            className="px-8 py-3 glass glass-hover text-white font-semibold rounded-xl transition-colors"
          >
            Explore Gallery
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-zinc-800/50">
          <p className="text-sm text-zinc-500 mb-4">Or try one of these popular pages:</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { to: '/docs', label: 'Documentation' },
              { to: '/blog', label: 'Blog' },
              { to: '/support', label: 'Support' },
              { to: '/pricing', label: 'Pricing' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-zinc-400 hover:text-teal-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CSS for float animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
