import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';

interface HeaderProps {
  onCreateClick: () => void;
  onSearchClick: () => void;
}

const Header = ({ onCreateClick, onSearchClick }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { favorites, savedCreations } = useFavorites();
  const totalFavorites = favorites.length + savedCreations.length;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearchClick();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearchClick]);

  const homeNavLinks = [
    { name: 'Gallery', href: '#gallery' },
    { name: 'Agents', href: '#agents' },
    { name: 'Evolution', href: '#evolution' },
  ];

  const mainNavLinks = [
    { name: 'Feed', href: '/feed', icon: '📰' },
    { name: 'Explore', href: '/explore', icon: '🔍' },
    { name: 'Skills', href: '/skills', icon: '⚡' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong py-3' : 'py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-xl bg-teal-400 blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">SYNTH</span>
              <span className="text-teal-400">EX</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Main nav links always visible */}
            {mainNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === link.href
                    ? 'text-teal-400 bg-teal-500/10'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {/* Home section anchors only on homepage */}
            {isHome && homeNavLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search Button */}
            <button
              type="button"
              onClick={onSearchClick}
              className="flex items-center gap-2 px-4 py-2 glass glass-hover rounded-xl text-zinc-400 hover:text-white transition-all group"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm">Search</span>
              <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-xs glass rounded text-zinc-500 group-hover:text-zinc-400">
                Ctrl K
              </kbd>
            </button>

            {/* Favorites Link */}
            <Link
              to="/favorites"
              className="relative p-2.5 glass glass-hover rounded-xl text-zinc-400 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {totalFavorites > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 rounded-full text-xs font-bold text-black flex items-center justify-center animate-scale-in">
                  {totalFavorites > 9 ? '9+' : totalFavorites}
                </span>
              )}
            </Link>

            {/* Create Button */}
            <button
              type="button"
              onClick={onCreateClick}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25"
            >
              Create with AI
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Search */}
            <button
              type="button"
              onClick={onSearchClick}
              className="p-2 text-zinc-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Mobile Favorites */}
            <Link
              to="/favorites"
              className="relative p-2 text-zinc-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {totalFavorites > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teal-500 rounded-full text-[10px] font-bold text-black flex items-center justify-center">
                  {totalFavorites > 9 ? '9+' : totalFavorites}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="p-2 text-zinc-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10 animate-slide-up">
            <nav className="flex flex-col gap-2 pt-4">
              {/* Main navigation */}
              {mainNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-4 py-3 rounded-lg transition-all flex items-center gap-2 ${
                    location.pathname === link.href
                      ? 'text-teal-400 bg-teal-500/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{link.icon}</span>
                  {link.name}
                </Link>
              ))}
              {/* Home section anchors */}
              {isHome && homeNavLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <Link
                to="/favorites"
                className="px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                My Favorites
                {totalFavorites > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded-full">
                    {totalFavorites}
                  </span>
                )}
              </Link>
              <button
                type="button"
                className="mt-2 px-4 py-3 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl text-center"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onCreateClick();
                }}
              >
                Create with AI
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
