import { useState } from 'react';
import { Link } from 'react-router-dom';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for exploring and getting started with AI art generation.',
    features: [
      '50 creations per month',
      'Access to 3 AI agents',
      'Standard resolution (512x512)',
      'Community gallery access',
      'Basic evolution features',
      'Email support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'For creators who need more power and flexibility.',
    features: [
      '1,000 creations per month',
      'Access to all AI agents',
      'High resolution (up to 2048x2048)',
      'Priority processing',
      'Advanced evolution chains',
      'API access (10,000 calls/month)',
      'Private creations',
      'Priority support',
    ],
    highlighted: true,
    cta: 'Start Pro Trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For teams and businesses with advanced needs.',
    features: [
      'Unlimited creations',
      'Custom AI agent training',
      'Maximum resolution (4K+)',
      'Dedicated infrastructure',
      'White-label options',
      'Unlimited API access',
      'SSO & team management',
      'Dedicated account manager',
      'SLA guarantees',
    ],
    cta: 'Contact Sales',
  },
];

const faqs = [
  {
    question: 'Can I change plans at any time?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.',
  },
  {
    question: 'Is there a free trial for Pro?',
    answer: 'Yes! We offer a 14-day free trial for Pro plans. No credit card required to start.',
  },
  {
    question: 'What happens to my creations if I downgrade?',
    answer: 'Your creations are always yours. Downgrading may limit new creations, but existing work remains accessible.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes! Annual billing saves you 20% compared to monthly billing on all paid plans.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'We offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.',
  },
];

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative py-16">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block px-4 py-1.5 glass rounded-full text-sm text-teal-400 font-medium mb-6">
            Pricing
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Simple, Transparent
            <span className="text-teal-400"> Pricing</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Choose the plan that fits your creative needs. Start free, upgrade when you're ready.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-white' : 'text-zinc-500'}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-14 h-7 glass rounded-full transition-colors"
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-teal-500 rounded-full transition-transform ${
                  billingPeriod === 'annual' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingPeriod === 'annual' ? 'text-white' : 'text-zinc-500'}`}>
              Annual
              <span className="ml-2 px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                tier.highlighted
                  ? 'glass-strong border-2 border-teal-500/50 scale-105'
                  : 'glass-card'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-teal-500 text-black text-sm font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">{tier.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-white">
                    {tier.price === 'Custom' ? tier.price : billingPeriod === 'annual' && tier.price !== '$0'
                      ? `$${Math.round(Number.parseInt(tier.price.slice(1)) * 0.8)}`
                      : tier.price}
                  </span>
                  {tier.price !== 'Custom' && tier.price !== '$0' && (
                    <span className="text-zinc-500 text-sm">/{billingPeriod === 'annual' ? 'month' : tier.period.split(' ')[1]}</span>
                  )}
                </div>
                <p className="text-sm text-zinc-400">{tier.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-zinc-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  tier.highlighted
                    ? 'bg-teal-500 hover:bg-teal-400 text-black'
                    : 'glass glass-hover text-white'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Features Comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-24">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Compare All Features
        </h2>
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4 px-6 text-zinc-400 font-medium">Feature</th>
                  <th className="text-center py-4 px-6 text-zinc-400 font-medium">Free</th>
                  <th className="text-center py-4 px-6 text-teal-400 font-medium">Pro</th>
                  <th className="text-center py-4 px-6 text-zinc-400 font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Monthly Creations', free: '50', pro: '1,000', enterprise: 'Unlimited' },
                  { feature: 'AI Agents', free: '3', pro: 'All', enterprise: 'All + Custom' },
                  { feature: 'Max Resolution', free: '512x512', pro: '2048x2048', enterprise: '4K+' },
                  { feature: 'Evolution Chains', free: 'Basic', pro: 'Advanced', enterprise: 'Unlimited' },
                  { feature: 'API Access', free: '-', pro: '10K/month', enterprise: 'Unlimited' },
                  { feature: 'Private Creations', free: '-', pro: 'Yes', enterprise: 'Yes' },
                  { feature: 'Team Members', free: '1', pro: '5', enterprise: 'Unlimited' },
                  { feature: 'Support', free: 'Email', pro: 'Priority', enterprise: 'Dedicated' },
                ].map((row) => (
                  <tr key={row.feature} className="border-b border-zinc-800/50">
                    <td className="py-4 px-6 text-white">{row.feature}</td>
                    <td className="py-4 px-6 text-center text-zinc-400">{row.free}</td>
                    <td className="py-4 px-6 text-center text-teal-400 font-medium">{row.pro}</td>
                    <td className="py-4 px-6 text-center text-zinc-400">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-24">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="glass-card rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-white font-medium">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-zinc-400 transition-transform ${
                    expandedFaq === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {expandedFaq === index && (
                <div className="px-5 pb-5 text-zinc-400 animate-fade-in">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="glass-card rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Join thousands of creators using SYNTHEX to push the boundaries of AI-generated art.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              to="/support"
              className="px-8 py-3 glass glass-hover text-white font-semibold rounded-xl transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
