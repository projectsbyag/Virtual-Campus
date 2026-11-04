import React, { useState } from 'react';

interface SettingsViewProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

type SettingsCategory = 'general' | 'appearance' | 'language' | 'notifications' | 'security' | 'accessibility';

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDark,
  onToggleTheme,
  onShowToast,
}) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');
  const [textSize, setTextSize] = useState('100');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [defaultView, setDefaultView] = useState('dashboard');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [assignmentReminders, setAssignmentReminders] = useState(true);
  const [announcementAlerts, setAnnouncementAlerts] = useState(true);
  const [discussionRepliesAlerts, setDiscussionRepliesAlerts] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveGeneral = () => {
    onShowToast('General preferences saved', 'success');
  };

  const handleSaveAccessibility = () => {
    document.documentElement.style.fontSize = `${textSize}%`;
    if (highContrast) {
      document.documentElement.classList.add('contrast-125');
    } else {
      document.documentElement.classList.remove('contrast-125');
    }
    onShowToast('Accessibility preferences saved', 'success');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      onShowToast('Passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      onShowToast('Password must be at least 6 characters', 'error');
      return;
    }
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onShowToast('Password updated successfully', 'success');
  };

  return (
    <div className="fade-in max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Customize your experience and manage account security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar: Settings categories (1-1 with views.js:7185) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-4">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Settings Categories</h2>
            <div className="space-y-1">
              <button
                onClick={() => setActiveCategory('general')}
                className={`w-full text-left py-2.5 px-3 rounded-lg transition flex items-center ${
                  activeCategory === 'general'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <i className="fas fa-cog w-6 mr-2 text-center"></i>
                <span>General</span>
              </button>

              <button
                onClick={() => setActiveCategory('appearance')}
                className={`w-full text-left py-2.5 px-3 rounded-lg transition flex items-center ${
                  activeCategory === 'appearance'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <i className="fas fa-palette w-6 mr-2 text-center"></i>
                <span>Appearance</span>
              </button>

              <button
                onClick={() => setActiveCategory('language')}
                className={`w-full text-left py-2.5 px-3 rounded-lg transition flex items-center ${
                  activeCategory === 'language'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <i className="fas fa-globe w-6 mr-2 text-center"></i>
                <span>Language & Region</span>
              </button>

              <button
                onClick={() => setActiveCategory('notifications')}
                className={`w-full text-left py-2.5 px-3 rounded-lg transition flex items-center ${
                  activeCategory === 'notifications'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <i className="fas fa-bell w-6 mr-2 text-center"></i>
                <span>Notifications</span>
              </button>

              <button
                onClick={() => setActiveCategory('security')}
                className={`w-full text-left py-2.5 px-3 rounded-lg transition flex items-center ${
                  activeCategory === 'security'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <i className="fas fa-shield-alt w-6 mr-2 text-center"></i>
                <span>Security</span>
              </button>

              <button
                onClick={() => setActiveCategory('accessibility')}
                className={`w-full text-left py-2.5 px-3 rounded-lg transition flex items-center ${
                  activeCategory === 'accessibility'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <i className="fas fa-universal-access w-6 mr-2 text-center"></i>
                <span>Accessibility</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right content: Settings panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Panel */}
          {activeCategory === 'general' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">General Settings</h2>
                <p className="text-xs text-gray-500 mt-1">Manage standard application preferences and defaults</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Landing Screen
                  </label>
                  <select
                    value={defaultView}
                    onChange={(e) => setDefaultView(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="dashboard">Dashboard (Overview & AI Bar)</option>
                    <option value="courses">My Courses</option>
                    <option value="assignments">Assignments & Deadlines</option>
                    <option value="campus-ai">Campus AI Tutor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Campus Timezone
                  </label>
                  <select
                    defaultValue="UTC+01:00"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="UTC+01:00">West Africa Time (WAT) - Lagos (UTC+1)</option>
                    <option value="UTC+00:00">Greenwich Mean Time (GMT) - London (UTC+0)</option>
                    <option value="UTC-05:00">Eastern Time (ET) - New York (UTC-5)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveGeneral}
                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-sm font-medium rounded-lg transition"
                  >
                    Save General Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Panel */}
          {activeCategory === 'appearance' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance & Theme</h2>
                <p className="text-xs text-gray-500 mt-1">Customize color mode and brand accents</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => { if (isDark) onToggleTheme(); }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition flex items-center space-x-3 ${
                    !isDark
                      ? 'border-black dark:border-white bg-black/5 dark:bg-white/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white flex items-center justify-center">
                    <i className="fas fa-sun text-lg"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">Light Mode</p>
                    <p className="text-xs text-gray-500">Standard crisp high-contrast theme</p>
                  </div>
                </div>

                <div
                  onClick={() => { if (!isDark) onToggleTheme(); }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition flex items-center space-x-3 ${
                    isDark
                      ? 'border-black dark:border-white bg-black/10 dark:bg-white/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                    <i className="fas fa-moon text-lg"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">Dark Mode</p>
                    <p className="text-xs text-gray-500">Easy on the eyes for night study sessions</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Campus Brand Accent Color</p>
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-black dark:bg-white ring-2 ring-black dark:ring-white ring-offset-2"></span>
                  <span className="text-xs font-mono font-medium text-gray-600 dark:text-gray-300">Monochrome (Black & White Editorial High-Contrast)</span>
                </div>
              </div>
            </div>
          )}

          {/* Language Panel */}
          {activeCategory === 'language' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Language & Region</h2>
                <p className="text-xs text-gray-500 mt-1">Select your preferred localized interface language</p>
              </div>

              <div className="space-y-3">
                {[
                  { code: 'en-US', name: 'English (United States)', region: 'US' },
                  { code: 'en-GB', name: 'English (United Kingdom)', region: 'GB' },
                  { code: 'ha-NG', name: 'Hausa (Nigeria)', region: 'NG' },
                ].map((lang) => (
                  <label
                    key={lang.code}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{lang.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                        {lang.region}
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="language"
                      checked={selectedLanguage === lang.code}
                      onChange={() => {
                        setSelectedLanguage(lang.code);
                        onShowToast(`Language set to ${lang.name}`, 'info');
                      }}
                      className="accent-primary w-4 h-4"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Panel */}
          {activeCategory === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
                <p className="text-xs text-gray-500 mt-1">Control automated alerts and email reminders</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive essential system notices to your matric email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">Assignment Deadline Reminders</p>
                    <p className="text-xs text-gray-500">Alert 24 hours and 2 hours prior to due dates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={assignmentReminders}
                    onChange={(e) => setAssignmentReminders(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">Department & Course Announcements</p>
                    <p className="text-xs text-gray-500">Urgent broadcast notices from lecturers and Dean</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={announcementAlerts}
                    onChange={(e) => setAnnouncementAlerts(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">Discussion Forum Replies</p>
                    <p className="text-xs text-gray-500">When someone answers your question or upvotes your response</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={discussionRepliesAlerts}
                    onChange={(e) => setDiscussionRepliesAlerts(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => onShowToast('Notification preferences saved', 'success')}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-sm font-medium rounded-lg transition"
              >
                Save Notifications
              </button>
            </div>
          )}

          {/* Security Panel */}
          {activeCategory === 'security' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security & Access</h2>
                <p className="text-xs text-gray-500 mt-1">Manage passwords, active sessions, and multi-factor authorization</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">Password</p>
                    <p className="text-xs text-gray-500">Last changed 2 months ago</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-3.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-750 transition"
                  >
                    Change Password
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">Two-Factor Authentication (2FA)</p>
                    <p className="text-xs text-gray-500">Require an authenticator code at login</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={(e) => {
                      setTwoFactorAuth(e.target.checked);
                      onShowToast(e.target.checked ? 'Two-Factor Authentication enabled' : 'Two-Factor Authentication disabled', 'info');
                    }}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">Active Login Sessions</p>
                    <p className="text-xs text-gray-500">1 active session on Chrome (Desktop)</p>
                  </div>
                  <button
                    onClick={() => setShowSessionsModal(true)}
                    className="px-3.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-750 transition"
                  >
                    Manage Sessions
                  </button>
                </div>

                {/* Danger Zone */}
                <div className="pt-4">
                  <div className="p-4 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-red-700 dark:text-red-400">Danger Zone</p>
                      <p className="text-xs text-red-600/80 dark:text-red-400/70">Permanently delete your student account and all course records</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Accessibility Panel (1-1 with former views.js) */}
          {activeCategory === 'accessibility' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Accessibility Options</h2>
                <p className="text-xs text-gray-500 mt-1">Configure font scale, contrast, and motion accommodations</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Base Text Scale: <span className="font-bold text-primary dark:text-primaryLight">{textSize}%</span>
                  </label>
                  <input
                    type="range"
                    min="90"
                    max="130"
                    step="5"
                    value={textSize}
                    onChange={(e) => setTextSize(e.target.value)}
                    className="w-full accent-primary h-2 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>90% (Compact)</span>
                    <span>100% (Default)</span>
                    <span>130% (Large)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">High Contrast Mode</p>
                    <p className="text-xs text-gray-500">Enhance borders and contrast for visual clarity</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">Reduce Motion & Animations</p>
                    <p className="text-xs text-gray-500">Minimize transition effects for vestibular comfort</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveAccessibility}
                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-semibold rounded-lg transition"
                  >
                    Save Accessibility Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal (1-1 with showChangePasswordModal in views.js:7952) */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-sm font-medium rounded-lg transition"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Sessions Modal (1-1 with showSessionsModal in main.js:3365) */}
      {showSessionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Login Sessions</h3>
              <button
                onClick={() => setShowSessionsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-laptop text-primary text-xl"></i>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Chrome on macOS (Current Session)
                    </p>
                    <p className="text-xs text-gray-500">IP: 197.210.226.1 • Lagos, Nigeria • Active now</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">Online</span>
              </div>

              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-mobile-alt text-gray-500 text-xl"></i>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Campus Mobile App on Android
                    </p>
                    <p className="text-xs text-gray-500">IP: 102.89.44.12 • Last active yesterday</p>
                  </div>
                </div>
                <button
                  onClick={() => onShowToast('Session revoked', 'info')}
                  className="text-xs text-red-600 hover:underline font-medium"
                >
                  Revoke
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSessionsModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-exclamation-triangle text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Student Account?</h3>
              <p className="text-xs text-gray-500 mt-2">
                This action is irreversible. All enrolled courses, assignment grades, and uploaded resources will be permanently removed.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Keep Account
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  onShowToast('Account deletion request queued', 'info');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
