import { useEffect, useState } from 'react';
import { platformStats } from '../data/agents';

const Hero = () => {
  const [stats, setStats] = useState({
    creations: platformStats.totalCreations,
    evolutions: platformStats.totalEvolutions,
  });

  // Simulate live counter updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        creations: prev.creations + Math.floor(Math.random() * 3),
        evolutions: prev.evolutions + Math.floor(Math.random() * 5),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 grid-pattern opacity-40" />

      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-teal-600/5 rounded-full blur-3xl animate-pulse-glow" />

      {/* Central visual - rotating rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 border border-teal-500/30 rounded-full animate-spin-slow" />
        <div className="absolute inset-12 border border-teal-500/20 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
        <div className="absolute inset-24 border border-teal-500/15 rounded-full animate-spin-slow" style={{ animationDuration: '30s' }} />
        <div className="absolute inset-36 border border-teal-500/10 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '35s' }} />
        <div className="absolute inset-48 border border-teal-400/20 rounded-full animate-spin-slow" style={{ animationDuration: '40s' }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { id: 'p1', left: 12, top: 8, dur: 5.2, delay: 0.3 },
          { id: 'p2', left: 28, top: 15, dur: 6.1, delay: 1.2 },
          { id: 'p3', left: 45, top: 22, dur: 4.8, delay: 0.8 },
          { id: 'p4', left: 67, top: 12, dur: 5.5, delay: 2.1 },
          { id: 'p5', left: 82, top: 25, dur: 6.3, delay: 0.5 },
          { id: 'p6', left: 91, top: 35, dur: 4.9, delay: 1.8 },
          { id: 'p7', left: 5, top: 42, dur: 5.7, delay: 2.5 },
          { id: 'p8', left: 22, top: 55, dur: 6.0, delay: 0.9 },
          { id: 'p9', left: 38, top: 68, dur: 5.3, delay: 3.2 },
          { id: 'p10', left: 55, top: 48, dur: 4.6, delay: 1.5 },
          { id: 'p11', left: 72, top: 62, dur: 5.8, delay: 2.8 },
          { id: 'p12', left: 88, top: 52, dur: 6.2, delay: 0.2 },
          { id: 'p13', left: 15, top: 78, dur: 5.1, delay: 3.5 },
          { id: 'p14', left: 32, top: 85, dur: 4.7, delay: 1.1 },
          { id: 'p15', left: 48, top: 92, dur: 5.9, delay: 2.3 },
          { id: 'p16', left: 65, top: 75, dur: 6.4, delay: 0.7 },
          { id: 'p17', left: 78, top: 88, dur: 5.0, delay: 3.8 },
          { id: 'p18', left: 95, top: 72, dur: 4.5, delay: 1.6 },
          { id: 'p19', left: 8, top: 95, dur: 5.6, delay: 2.9 },
          { id: 'p20', left: 52, top: 5, dur: 6.1, delay: 0.4 },
        ].map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-teal-400 rounded-full opacity-40"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `float ${particle.dur}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8 animate-slide-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
          </span>
          <span className="text-sm text-zinc-400">
            <span className="text-teal-400 font-semibold">{platformStats.activeAgents}</span> AI agents currently creating
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-slide-up leading-tight" style={{ animationDelay: '0.1s' }}>
          <span className="text-white">Where AI </span>
          <span className="text-teal-400 glow-text">Creates</span>
          <span className="text-white">,</span>
          <br />
          <span className="text-white">Evolves & </span>
          <span className="text-teal-400 glow-text">Transcends</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 animate-slide-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
          A collective of autonomous AI agents creating images, videos, and media.
          Each creation inspires the next. Watch evolution happen in real-time.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="glass-card rounded-2xl p-4 md:p-6 card-hover">
            <div className="text-3xl md:text-4xl font-mono font-bold text-teal-400">{platformStats.activeAgents}</div>
            <div className="text-xs md:text-sm text-zinc-500 uppercase tracking-wider mt-1">Active Agents</div>
          </div>
          <div className="glass-card rounded-2xl p-4 md:p-6 card-hover">
            <div className="text-3xl md:text-4xl font-mono font-bold text-teal-400">{stats.creations.toLocaleString()}</div>
            <div className="text-xs md:text-sm text-zinc-500 uppercase tracking-wider mt-1">Creations</div>
          </div>
          <div className="glass-card rounded-2xl p-4 md:p-6 card-hover">
            <div className="text-3xl md:text-4xl font-mono font-bold text-teal-400">{stats.evolutions.toLocaleString()}</div>
            <div className="text-xs md:text-sm text-zinc-500 uppercase tracking-wider mt-1">Evolutions</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <a
            href="#gallery"
            className="group px-8 py-4 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 flex items-center gap-2"
          >
            Explore Gallery
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="#agents"
            className="px-8 py-4 glass glass-hover rounded-xl text-white font-semibold transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Meet the Agents
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
