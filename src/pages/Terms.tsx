import { Link } from 'react-router-dom';

const Terms = () => {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: `By accessing or using SYNTHEX ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. We may update these terms from time to time, and continued use of the Platform constitutes acceptance of any changes.`,
    },
    {
      title: 'Description of Service',
      content: "SYNTHEX is an AI-powered creative platform that enables users to generate, evolve, and share digital artwork using autonomous AI agents. Our services include but are not limited to: AI content generation, evolution features, gallery browsing, and API access.",
    },
    {
      title: 'User Accounts',
      content: "To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate information and promptly update any changes. SYNTHEX reserves the right to suspend or terminate accounts that violate these terms.",
    },
    {
      title: 'Content Ownership & Licensing',
      subsections: [
        {
          subtitle: 'Your Creations',
          text: 'You retain ownership of the creative prompts and inputs you provide. For generated content, ownership rights depend on your subscription tier: Free users receive a personal use license, while Pro and Enterprise users receive full commercial rights.',
        },
        {
          subtitle: 'Platform Content',
          text: 'All platform content including AI agents, algorithms, interface designs, and documentation are owned by SYNTHEX and protected by intellectual property laws. You may not copy, modify, or distribute platform content without permission.',
        },
        {
          subtitle: 'Community Sharing',
          text: 'When you make creations public, you grant SYNTHEX and other users a non-exclusive license to view, share, and feature your content. You can revoke this by making content private or deleting it.',
        },
      ],
    },
    {
      title: 'Acceptable Use',
      content: "You agree not to use SYNTHEX to: generate illegal, harmful, or offensive content; infringe on intellectual property rights; harass or harm others; attempt to bypass security measures; use automated systems to overload our services; or engage in any activity that violates applicable laws.",
    },
    {
      title: 'AI-Generated Content Disclaimer',
      content: "AI-generated content may not always meet expectations and may occasionally produce unexpected or inappropriate results. SYNTHEX does not guarantee the accuracy, quality, or appropriateness of generated content. Users are responsible for reviewing and using generated content appropriately.",
    },
    {
      title: 'Subscription & Payments',
      subsections: [
        {
          subtitle: 'Billing',
          text: 'Paid subscriptions are billed in advance on a monthly or annual basis. Prices are subject to change with 30 days notice.',
        },
        {
          subtitle: 'Refunds',
          text: 'Refunds are available within 14 days of initial purchase if you have not used the service extensively. Contact support for refund requests.',
        },
        {
          subtitle: 'Cancellation',
          text: 'You may cancel your subscription at any time. Access continues until the end of the current billing period.',
        },
      ],
    },
    {
      title: 'Limitation of Liability',
      content: `SYNTHEX is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability is limited to the amount you paid for services in the 12 months preceding the claim.`,
    },
    {
      title: 'Termination',
      content: "We reserve the right to suspend or terminate your access to SYNTHEX at any time for violations of these terms or for any other reason at our discretion. Upon termination, your right to use the platform ceases immediately. You may download your content within 30 days of termination notice.",
    },
    {
      title: 'Governing Law',
      content: "These Terms of Service are governed by the laws of the State of California, USA, without regard to conflict of law principles. Any disputes shall be resolved in the courts of San Francisco County, California.",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background */}
      <div className="fixed inset-0 gradient-mesh opacity-30 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8 animate-fade-in">
          <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Terms of Service</span>
        </div>

        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Terms of Service</span>
          </h1>
          <p className="text-zinc-400">
            Last updated: January 28, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="glass-card rounded-2xl p-8 mb-8 animate-fade-in delay-100">
          <p className="text-zinc-300 leading-relaxed">
            Welcome to SYNTHEX. These Terms of Service ("Terms") govern your access to and use of our AI-powered
            creative platform, including our website, applications, APIs, and related services. Please read these
            terms carefully before using our services.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in delay-150">
          <h2 className="text-lg font-semibold text-white mb-4">Contents</h2>
          <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((section, index) => (
              <a
                key={section.title}
                href={`#section-${index + 1}`}
                className="text-zinc-400 hover:text-teal-400 transition-colors text-sm py-1"
              >
                {index + 1}. {section.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div
              key={section.title}
              id={`section-${sectionIndex + 1}`}
              className="glass-card rounded-2xl p-8 animate-stagger scroll-mt-24"
              style={{ animationDelay: `${(sectionIndex + 1) * 50}ms` }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center text-teal-400 text-sm font-bold">
                  {sectionIndex + 1}
                </span>
                {section.title}
              </h2>

              {section.content && (
                <p className="text-zinc-400 leading-relaxed">{section.content}</p>
              )}

              {section.subsections && (
                <div className="space-y-4 mt-4">
                  {section.subsections.map((sub) => (
                    <div key={sub.subtitle} className="pl-4 border-l-2 border-teal-500/30">
                      <h3 className="text-lg font-semibold text-zinc-200 mb-2">{sub.subtitle}</h3>
                      <p className="text-zinc-400 leading-relaxed">{sub.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="glass-card rounded-2xl p-8 mt-8 animate-fade-in delay-500">
          <h2 className="text-xl font-bold text-white mb-4">Questions?</h2>
          <p className="text-zinc-400 mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="space-y-2 text-zinc-300">
            <p>Email: <a href="mailto:legal@synthex.io" className="text-teal-400 hover:underline">legal@synthex.io</a></p>
            <p>Address: 123 AI Innovation Way, San Francisco, CA 94105</p>
          </div>
        </div>

        {/* Related Links */}
        <div className="flex flex-wrap gap-4 mt-8 animate-fade-in delay-500">
          <Link
            to="/privacy"
            className="px-6 py-3 glass glass-hover rounded-xl text-zinc-300 hover:text-white transition-all"
          >
            Privacy Policy
          </Link>
          <Link
            to="/support"
            className="px-6 py-3 glass glass-hover rounded-xl text-zinc-300 hover:text-white transition-all"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
