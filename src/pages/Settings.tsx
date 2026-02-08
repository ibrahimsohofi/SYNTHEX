import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState(user?.name || 'Creative User');
  const [email, setEmail] = useState(user?.email || 'user@example.com');
  const [bio, setBio] = useState('AI art enthusiast and digital creator.');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newsletter: false,
    creationUpdates: true,
    evolutionAlerts: true,
  });
  const [preferences, setPreferences] = useState({
    defaultAgent: 'nova-1',
    defaultStyle: 'ethereal',
    defaultResolution: '1024x1024',
    privateByDefault: false,
    showEvolutionTree: true,
    autoSave: true,
  });
  const [theme, setTheme] = useState('dark');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'billing', label: 'Billing', icon: '💳' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center py-20">
          <div className="glass-card rounded-2xl p-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-800 flex items-center justify-center">
              <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
            <p className="text-zinc-400 mb-8">
              Please sign in to access your account settings and preferences.
            </p>
            <button
              type="button"
              className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-zinc-400">Manage your account and preferences</p>
        </div>

        <div className="grid md:grid-cols-[250px_1fr] gap-8">
          {/* Sidebar */}
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                    : 'glass-hover text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="glass-card rounded-2xl p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-zinc-700">
                      <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-medium rounded-lg transition-colors"
                      >
                        Change Avatar
                      </button>
                      <p className="text-sm text-zinc-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-zinc-300 mb-2">
                        Display Name
                      </label>
                      <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 glass rounded-xl bg-transparent text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 glass rounded-xl bg-transparent text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-zinc-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 glass rounded-xl bg-transparent text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-zinc-800">
                  <button
                    type="button"
                    className="px-6 py-2.5 glass glass-hover text-zinc-400 font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-medium rounded-xl transition-colors"
                  >
                    {saved ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>

                <div className="space-y-6">
                  {[
                    { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
                    { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
                    { key: 'newsletter', label: 'Newsletter', description: 'Weekly digest and tips' },
                    { key: 'creationUpdates', label: 'Creation Updates', description: 'When someone likes or comments on your creations' },
                    { key: 'evolutionAlerts', label: 'Evolution Alerts', description: 'When your creations are evolved' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 glass rounded-xl">
                      <div>
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="text-sm text-zinc-400">{item.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setNotifications((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key as keyof typeof notifications],
                          }))
                        }
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          notifications[item.key as keyof typeof notifications]
                            ? 'bg-teal-500'
                            : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            notifications[item.key as keyof typeof notifications]
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-6 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-medium rounded-xl transition-colors"
                  >
                    {saved ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-white">Creation Preferences</h2>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="defaultAgent" className="block text-sm font-medium text-zinc-300 mb-2">
                      Default AI Agent
                    </label>
                    <select
                      id="defaultAgent"
                      value={preferences.defaultAgent}
                      onChange={(e) => setPreferences((prev) => ({ ...prev, defaultAgent: e.target.value }))}
                      className="w-full px-4 py-3 glass rounded-xl bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    >
                      <option value="nova-1">NOVA</option>
                      <option value="cipher-1">CIPHER</option>
                      <option value="flux-1">FLUX</option>
                      <option value="echo-1">ECHO</option>
                      <option value="prism-1">PRISM</option>
                      <option value="aether-1">AETHER</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="defaultResolution" className="block text-sm font-medium text-zinc-300 mb-2">
                      Default Resolution
                    </label>
                    <select
                      id="defaultResolution"
                      value={preferences.defaultResolution}
                      onChange={(e) => setPreferences((prev) => ({ ...prev, defaultResolution: e.target.value }))}
                      className="w-full px-4 py-3 glass rounded-xl bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    >
                      <option value="512x512">512 x 512</option>
                      <option value="1024x1024">1024 x 1024</option>
                      <option value="2048x2048">2048 x 2048 (Pro)</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'privateByDefault', label: 'Private Creations by Default', description: 'New creations will be private' },
                      { key: 'showEvolutionTree', label: 'Show Evolution Tree', description: 'Display evolution lineage on creations' },
                      { key: 'autoSave', label: 'Auto-save Drafts', description: 'Automatically save creation drafts' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 glass rounded-xl">
                        <div>
                          <p className="font-medium text-white">{item.label}</p>
                          <p className="text-sm text-zinc-400">{item.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setPreferences((prev) => ({
                              ...prev,
                              [item.key]: !prev[item.key as keyof typeof preferences],
                            }))
                          }
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            preferences[item.key as keyof typeof preferences]
                              ? 'bg-teal-500'
                              : 'bg-zinc-700'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              preferences[item.key as keyof typeof preferences]
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-medium rounded-xl transition-colors"
                  >
                    {saved ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-white">Appearance</h2>

                <div>
                  <p className="text-sm font-medium text-zinc-300 mb-4">Theme</p>
                  <div className="grid grid-cols-3 gap-4">
                    {['dark', 'light', 'system'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTheme(t)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          theme === t
                            ? 'border-teal-500 bg-teal-500/10'
                            : 'border-zinc-800 glass-hover'
                        }`}
                      >
                        <div className={`w-full aspect-video rounded-lg mb-3 ${
                          t === 'dark' ? 'bg-zinc-900' : t === 'light' ? 'bg-white' : 'bg-gradient-to-r from-zinc-900 to-white'
                        }`} />
                        <p className="text-sm font-medium text-white capitalize">{t}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-medium rounded-xl transition-colors"
                  >
                    {saved ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-white">Security</h2>

                <div className="space-y-6">
                  <div className="p-6 glass rounded-xl">
                    <h3 className="font-medium text-white mb-2">Change Password</h3>
                    <p className="text-sm text-zinc-400 mb-4">Update your password regularly to keep your account secure.</p>
                    <button
                      type="button"
                      className="px-4 py-2 glass glass-hover text-white font-medium rounded-lg transition-colors"
                    >
                      Update Password
                    </button>
                  </div>

                  <div className="p-6 glass rounded-xl">
                    <h3 className="font-medium text-white mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-zinc-400 mb-4">Add an extra layer of security to your account.</p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-medium rounded-lg transition-colors"
                    >
                      Enable 2FA
                    </button>
                  </div>

                  <div className="p-6 glass rounded-xl border border-red-500/30">
                    <h3 className="font-medium text-red-400 mb-2">Danger Zone</h3>
                    <p className="text-sm text-zinc-400 mb-4">Permanently delete your account and all associated data.</p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-lg transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-white">Billing & Subscription</h2>

                <div className="p-6 glass rounded-xl border border-teal-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="px-3 py-1 bg-teal-500/20 text-teal-400 text-sm font-semibold rounded-full">
                        Pro Plan
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white">$29<span className="text-sm text-zinc-400">/month</span></p>
                  </div>
                  <p className="text-zinc-400 mb-4">Your next billing date is February 28, 2026</p>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="px-4 py-2 glass glass-hover text-white font-medium rounded-lg transition-colors"
                    >
                      Change Plan
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-white mb-4">Payment Method</h3>
                  <div className="p-4 glass rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-zinc-800 rounded flex items-center justify-center text-xs font-bold text-white">
                        VISA
                      </div>
                      <div>
                        <p className="text-white">**** **** **** 4242</p>
                        <p className="text-sm text-zinc-500">Expires 12/27</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-teal-400 hover:text-teal-300 text-sm font-medium"
                    >
                      Update
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-white mb-4">Billing History</h3>
                  <div className="space-y-2">
                    {[
                      { date: 'Jan 28, 2026', amount: '$29.00', status: 'Paid' },
                      { date: 'Dec 28, 2025', amount: '$29.00', status: 'Paid' },
                      { date: 'Nov 28, 2025', amount: '$29.00', status: 'Paid' },
                    ].map((invoice) => (
                      <div key={invoice.date} className="p-4 glass rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-white">{invoice.date}</p>
                          <p className="text-sm text-zinc-500">Pro Plan - Monthly</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-white">{invoice.amount}</span>
                          <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full">
                            {invoice.status}
                          </span>
                          <button type="button" className="text-zinc-400 hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
