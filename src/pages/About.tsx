import { Link } from 'react-router-dom';

const teamMembers = [
  {
    name: 'Dr. Nova Chen',
    role: 'CEO & Lead AI Researcher',
    bio: 'PhD in Computational Creativity from MIT. Former research scientist at DeepMind.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova&backgroundColor=0a0a0f',
  },
  {
    name: 'Marcus Rivera',
    role: 'CTO',
    bio: 'Previously infrastructure lead at Stability AI. Expert in distributed systems.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus&backgroundColor=0a0a0f',
  },
  {
    name: 'Sarah Kim',
    role: 'Head of Design',
    bio: '15 years in digital art. Former Creative Director at Adobe.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=0a0a0f',
  },
  {
    name: 'Jordan Lee',
    role: 'Creative Director',
    bio: 'Award-winning digital artist and pioneer in AI-assisted creation.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan&backgroundColor=0a0a0f',
  },
  {
    name: 'Alex Thompson',
    role: 'VP of Engineering',
    bio: 'Former senior engineer at OpenAI. Scaled systems to billions of requests.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex&backgroundColor=0a0a0f',
  },
  {
    name: 'Maya Wong',
    role: 'Community Manager',
    bio: 'Built communities of 100K+ members. Passionate about connecting creators.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya&backgroundColor=0a0a0f',
  },
];

const milestones = [
  { year: '2023', title: 'Founded', description: 'SYNTHEX was born from a vision to democratize AI art.' },
  { year: '2024', title: 'First AI Agents', description: 'Launched our first 3 autonomous creative agents.' },
  { year: '2024', title: 'Community Growth', description: 'Reached 100,000 active creators worldwide.' },
  { year: '2025', title: 'Evolution System', description: 'Introduced revolutionary creation evolution technology.' },
  { year: '2025', title: 'Series A', description: 'Raised $50M to accelerate AI research and development.' },
  { year: '2026', title: 'SYNTHEX 2.0', description: 'Launched next-gen platform with advanced capabilities.' },
];

const values = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Innovation First',
    description: 'We push the boundaries of what AI can create, always exploring new frontiers.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Community Driven',
    description: 'Our community shapes our direction. Every feature starts with creator feedback.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Ethics & Safety',
    description: 'We develop AI responsibly, with safeguards and ethical guidelines at every step.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Global Access',
    description: 'AI creativity should be accessible to everyone, everywhere. No barriers.',
  },
];

const About = () => {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block px-4 py-1.5 glass rounded-full text-sm text-teal-400 font-medium mb-6">
            About Us
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Redefining Creative
            <span className="text-teal-400"> AI</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            We're building the future of autonomous creativity. Our AI agents don't just generate art—they evolve,
            learn, and create in ways that push the boundaries of what's possible.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-zinc-400 mb-6">
              To democratize AI-powered creativity and enable everyone to participate in the next evolution of art.
              We believe the most beautiful creations emerge from the collaboration between human imagination and
              artificial intelligence.
            </p>
            <p className="text-lg text-zinc-400 mb-8">
              Since our founding, we've helped over 500,000 creators bring their visions to life, generating
              millions of unique artworks that span every style and genre imaginable.
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-teal-400">500K+</p>
                <p className="text-sm text-zinc-500">Active Creators</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-teal-400">10M+</p>
                <p className="text-sm text-zinc-500">Creations Generated</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-teal-400">12</p>
                <p className="text-sm text-zinc-500">AI Agents</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden glass-card">
              <img
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=600&fit=crop"
                alt="AI Art"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-xl glass-card overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&h=300&fit=crop"
                alt="Neural Network"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 border-y border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="glass-card rounded-xl p-6 text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-sm text-zinc-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Our Journey</h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-800" />

          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.title}
                className={`relative flex items-center gap-8 ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <div className="glass-card rounded-xl p-6 inline-block">
                    <span className="text-teal-400 font-mono text-sm">{milestone.year}</span>
                    <h3 className="text-lg font-semibold text-white mt-1">{milestone.title}</h3>
                    <p className="text-sm text-zinc-400 mt-2">{milestone.description}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-teal-500 border-4 border-[#0a0a0f]" />
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Meet the Team</h2>
          <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-12">
            A diverse group of researchers, engineers, artists, and dreamers united by a passion for AI creativity.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={member.name}
                className="glass-card rounded-xl p-6 text-center group hover:border-teal-500/30 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-zinc-800 group-hover:ring-teal-500/50 transition-all">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-teal-400 mb-3">{member.role}</p>
                <p className="text-sm text-zinc-400">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="glass-card rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Creative Revolution
          </h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Whether you're an artist, developer, or dreamer, there's a place for you in the SYNTHEX community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl transition-colors"
            >
              Start Creating
            </Link>
            <Link
              to="/support"
              className="px-8 py-3 glass glass-hover text-white font-semibold rounded-xl transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
