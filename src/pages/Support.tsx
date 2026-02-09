import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

interface FAQ {
  question: string;
  answer: string;
}

const Support = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user, isAuthenticated } = useAuth();

  const faqs: FAQ[] = [
    {
      question: 'How do I create my first AI-generated artwork?',
      answer: 'Click the "Create with AI" button in the header, enter a descriptive prompt, select your preferred style and agent, then click generate. Your creation will be ready in seconds.',
    },
    {
      question: 'What is the Evolution system?',
      answer: 'Evolution allows you to transform existing creations into new variations. Click the "Evolve" button on any creation to see it morph into something new while retaining elements of the original.',
    },
    {
      question: 'Are my creations private by default?',
      answer: 'Yes, all creations are private by default. You can choose to make them public from the creation details modal to share them with the community.',
    },
    {
      question: 'Can I use SYNTHEX creations commercially?',
      answer: 'Yes, Pro and Enterprise users have full commercial rights to their creations. Free tier users retain personal use rights only.',
    },
    {
      question: 'How do AI Agents differ from each other?',
      answer: 'Each AI Agent is trained with different datasets and architectures, giving them unique artistic styles. NEXUS excels at futuristic designs, AURORA at dreamlike landscapes, and others have their own specialties.',
    },
    {
      question: 'Is there an API for developers?',
      answer: 'Yes! Our REST API allows you to integrate SYNTHEX into your applications. Check our API documentation for endpoints, authentication, and code examples.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  // Pre-fill form with user data if authenticated
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background */}
      <div className="fixed inset-0 gradient-mesh opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8 animate-fade-in">
          <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Support</span>
        </div>

        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">How can we help?</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Find answers in our FAQ or reach out to our support team directly.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 animate-fade-in delay-100">
          <Link
            to="/docs"
            className="glass-card rounded-2xl p-6 card-hover group text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">Documentation</h3>
            <p className="text-sm text-zinc-400">Comprehensive guides and tutorials</p>
          </Link>

          <Link
            to="/api"
            className="glass-card rounded-2xl p-6 card-hover group text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">API Reference</h3>
            <p className="text-sm text-zinc-400">Integrate SYNTHEX into your apps</p>
          </Link>

          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card rounded-2xl p-6 card-hover group text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">Join Discord</h3>
            <p className="text-sm text-zinc-400">Chat with our community</p>
          </a>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* FAQ Section */}
          <div className="animate-fade-in-up delay-200">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className="glass-card rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4"
                  >
                    <span className="font-medium text-white">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-5 pt-0 animate-slide-up">
                      <p className="text-zinc-400 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-fade-in-up delay-300">
            <h2 className="text-2xl font-bold text-white mb-6">Contact Support</h2>
            <div className="glass-card rounded-2xl p-6">
              {/* Auth Banner for non-authenticated users */}
              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">Sign in to submit a support request</p>
                      <p className="text-sm text-zinc-400 mt-1">
                        Create an account or sign in to access priority support and track your tickets.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAuthModal(true)}
                        className="mt-3 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-medium rounded-lg text-sm transition-colors"
                      >
                        Sign In / Create Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Authenticated User Info */}
              {isAuthenticated && user && (
                <div className="mb-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full bg-zinc-800"
                    />
                    <div>
                      <p className="text-white font-medium">Signed in as {user.name}</p>
                      <p className="text-sm text-zinc-400">{user.email}</p>
                    </div>
                    <span className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${
                      user.plan === 'enterprise'
                        ? 'bg-purple-500/20 text-purple-400'
                        : user.plan === 'pro'
                        ? 'bg-teal-500/20 text-teal-400'
                        : 'bg-zinc-500/20 text-zinc-400'
                    }`}>
                      {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                    </span>
                  </div>
                </div>
              )}

              {submitted ? (
                <div className="text-center py-12 animate-scale-in">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-zinc-400">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                      <input
                        type="text"
                        id="name"
                        value={isAuthenticated && user ? user.name : formData.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        required
                        disabled={isAuthenticated}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                      <input
                        type="email"
                        id="email"
                        value={isAuthenticated && user ? user.email : formData.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        required
                        disabled={isAuthenticated}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-zinc-300 mb-2">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleFormChange('subject', e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none transition-colors"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-zinc-300 mb-2">Message</label>
                    <textarea
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleFormChange('message', e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none transition-colors resize-none"
                      placeholder="Describe your issue or question..."
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      isAuthenticated
                        ? 'bg-teal-500 hover:bg-teal-400 text-black hover:shadow-lg hover:shadow-teal-500/25'
                        : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                    }`}
                  >
                    {isAuthenticated ? (
                      'Send Message'
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Sign In to Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          initialMode="login"
        />
      )}
    </div>
  );
};

export default Support;
