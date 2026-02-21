import { Link } from 'react-router-dom';

const Privacy = () => {
  const sections = [
    {
      title: 'Information We Collect',
      content: [
        {
          subtitle: 'Account Information',
          text: 'When you create an account, we collect your email address, username, and password. You may optionally provide additional profile information such as a display name and avatar.',
        },
        {
          subtitle: 'Usage Data',
          text: 'We automatically collect information about how you interact with SYNTHEX, including pages visited, features used, creations viewed, and time spent on the platform.',
        },
        {
          subtitle: 'Creation Data',
          text: 'When you generate content, we store the prompts you provide, the resulting creations, and associated metadata such as timestamps and selected options.',
        },
      ],
    },
    {
      title: 'How We Use Your Information',
      content: [
        {
          subtitle: 'Service Provision',
          text: 'We use your information to provide, maintain, and improve SYNTHEX services, including generating AI content, personalizing your experience, and processing your requests.',
        },
        {
          subtitle: 'Communication',
          text: 'We may send you service-related announcements, updates about new features, and marketing communications (which you can opt out of at any time).',
        },
        {
          subtitle: 'Analytics & Improvement',
          text: 'We analyze usage patterns to understand how users interact with our platform, identify issues, and develop new features and improvements.',
        },
      ],
    },
    {
      title: 'Data Sharing & Disclosure',
      content: [
        {
          subtitle: 'Public Content',
          text: 'Creations you choose to make public are visible to other users and may be featured in our gallery or promotional materials.',
        },
        {
          subtitle: 'Service Providers',
          text: 'We share data with trusted third-party service providers who help us operate our platform, such as cloud hosting, analytics, and payment processing.',
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose information if required by law, legal process, or to protect the rights, property, or safety of SYNTHEX, our users, or others.',
        },
      ],
    },
    {
      title: 'Data Security',
      content: [
        {
          subtitle: 'Protection Measures',
          text: 'We implement industry-standard security measures including encryption in transit and at rest, regular security audits, and access controls to protect your data.',
        },
        {
          subtitle: 'Data Retention',
          text: 'We retain your data for as long as your account is active or as needed to provide services. You can request deletion of your data at any time.',
        },
      ],
    },
    {
      title: 'Your Rights & Choices',
      content: [
        {
          subtitle: 'Access & Portability',
          text: 'You can access, download, or request a copy of your personal data and creations through your account settings.',
        },
        {
          subtitle: 'Deletion',
          text: 'You can delete your account and associated data at any time. Some information may be retained for legal or legitimate business purposes.',
        },
        {
          subtitle: 'Opt-Out',
          text: 'You can opt out of marketing communications, adjust privacy settings, and control how your creations are shared.',
        },
      ],
    },
    {
      title: 'Cookies & Tracking',
      content: [
        {
          subtitle: 'Essential Cookies',
          text: 'We use essential cookies to enable core functionality like authentication and security. These cannot be disabled.',
        },
        {
          subtitle: 'Analytics Cookies',
          text: 'We use analytics cookies to understand how visitors use our platform. You can opt out of these through your browser settings or our cookie preferences.',
        },
      ],
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
          <span className="text-zinc-300">Privacy Policy</span>
        </div>

        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Privacy Policy</span>
          </h1>
          <p className="text-zinc-400">
            Last updated: January 28, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="glass-card rounded-2xl p-8 mb-8 animate-fade-in delay-100">
          <p className="text-zinc-300 leading-relaxed">
            At SYNTHEX, we are committed to protecting your privacy and ensuring the security of your personal information.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
            AI-powered creative platform.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div
              key={section.title}
              className="glass-card rounded-2xl p-8 animate-stagger"
              style={{ animationDelay: `${(sectionIndex + 1) * 100}ms` }}
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 text-sm font-bold">
                  {sectionIndex + 1}
                </span>
                {section.title}
              </h2>
              <div className="space-y-6">
                {section.content.map((item) => (
                  <div key={item.subtitle}>
                    <h3 className="text-lg font-semibold text-zinc-200 mb-2">{item.subtitle}</h3>
                    <p className="text-zinc-400 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="glass-card rounded-2xl p-8 mt-8 animate-fade-in delay-500">
          <h2 className="text-xl font-bold text-white mb-4">Contact Us</h2>
          <p className="text-zinc-400 mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="space-y-2 text-zinc-300">
            <p>Email: <a href="mailto:privacy@synthex.io" className="text-teal-400 hover:underline">privacy@synthex.io</a></p>
            <p>Address: 123 AI Innovation Way, San Francisco, CA 94105</p>
          </div>
        </div>

        {/* Related Links */}
        <div className="flex flex-wrap gap-4 mt-8 animate-fade-in delay-500">
          <Link
            to="/terms"
            className="px-6 py-3 glass glass-hover rounded-xl text-zinc-300 hover:text-white transition-all"
          >
            Terms of Service
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

export default Privacy;
