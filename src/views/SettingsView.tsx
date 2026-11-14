import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface SettingsViewProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onAccountDeleted?: () => void;
}

type SettingsCategory = 'general' | 'appearance' | 'notifications' | 'security' | 'accessibility';

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDark,
  onToggleTheme,
  onShowToast,
  onAccountDeleted,
}) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');
  const [textSize, setTextSize] = useState('100');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [defaultView, setDefaultView] = useState(() => localStorage.getItem('defaultView') || 'dashboard');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [assignmentReminders, setAssignmentReminders] = useState(true);
  const [announcementAlerts, setAnnouncementAlerts] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Real Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Real Sessions State
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Delete account state
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!showSessionsModal) return;
    setLoadingSessions(true);
    apiService
      .getUserSessions()
      .then(setSessions)
      .finally(() => setLoadingSessions(false));
  }, [showSessionsModal]);

  const handleSaveGeneral = () => {
    localStorage.setItem('defaultView', defaultView);
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      onShowToast('Passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 8) {
      onShowToast('Password must be at least 8 characters', 'error');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await apiService.updatePassword(currentPassword, newPassword);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onShowToast('Password updated successfully!', 'success');
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to update password.', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await apiService.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      onShowToast('Session revoked', 'info');
    } catch (err: any) {
      onShowToast(err?.message || 'Unable to revoke session', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await apiService.deleteAccount();
      setShowDeleteModal(false);
      onShowToast('Account deleted permanently.', 'info');
      onAccountDeleted?.();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to delete account.', 'error');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="fade-in max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">Settings</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Customize your workspace appearance, preferences, and account security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-4 sticky top-4">
            <h2 className="font-bold text-sm uppercase tracking-wider text-neutral-500 mb-3 px-2">Categories</h2>
            <div className="space-y-1">
              {(
                [
                  ['general', 'fas fa-cog', 'General'],
                  ['appearance', 'fas fa-palette', 'Appearance'],
                  ['notifications', 'fas fa-bell', 'Notifications'],
                  ['security', 'fas fa-shield-alt', 'Security'],
                  ['accessibility', 'fas fa-universal-access', 'Accessibility'],
                ] as const
              ).map(([key, icon, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`w-full text-left py-2.5 px-3 rounded-xl transition flex items-center text-sm ${
                    activeCategory === key
                      ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <i className={`${icon} w-6 mr-2 text-center`}></i>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {activeCategory === 'general' && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black dark:text-white">General Settings</h2>
                <p className="text-xs text-neutral-500 mt-1">Manage default startup behavior</p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">
                  Default Landing Screen
                </label>
                <select
                  value={defaultView}
                  onChange={(e) => setDefaultView(e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-sm"
                >
                  <option value="dashboard">Dashboard Overview</option>
                  <option value="courses">Courses</option>
                  <option value="assignments">Assignments</option>
                  <option value="campus-ai">Campus AI Tutor</option>
                </select>
              </div>
              <button
                onClick={handleSaveGeneral}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold rounded-xl"
              >
                Save Preferences
              </button>
            </div>
          )}

          {activeCategory === 'appearance' && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black dark:text-white">Appearance & Theme</h2>
                <p className="text-xs text-neutral-500 mt-1">Switch between light and dark contrast modes</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => {
                    if (isDark) onToggleTheme();
                  }}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition flex items-center gap-3 ${
                    !isDark
                      ? 'border-black dark:border-white bg-neutral-50'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <i className="fas fa-sun text-lg"></i>
                  <div>
                    <p className="font-bold text-sm">Light Mode</p>
                    <p className="text-xs text-neutral-500">Crisp white surface</p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    if (!isDark) onToggleTheme();
                  }}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition flex items-center gap-3 ${
                    isDark
                      ? 'border-white bg-neutral-800'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <i className="fas fa-moon text-lg"></i>
                  <div>
                    <p className="font-bold text-sm">Dark Mode</p>
                    <p className="text-xs text-neutral-500">Low-glare night theme</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'notifications' && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-6 space-y-4">
              <h2 className="text-lg font-bold text-black dark:text-white">Notifications</h2>
              <label className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 cursor-pointer">
                <span className="text-sm font-medium">Email Notifications</span>
                <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} className="w-4 h-4 accent-black dark:accent-white" />
              </label>
              <label className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 cursor-pointer">
                <span className="text-sm font-medium">Assignment Deadline Reminders</span>
                <input type="checkbox" checked={assignmentReminders} onChange={(e) => setAssignmentReminders(e.target.checked)} className="w-4 h-4 accent-black dark:accent-white" />
              </label>
              <label className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm font-medium">Course Announcements</span>
                <input type="checkbox" checked={announcementAlerts} onChange={(e) => setAnnouncementAlerts(e.target.checked)} className="w-4 h-4 accent-black dark:accent-white" />
              </label>
              <button
                onClick={() => onShowToast('Notification preferences saved', 'success')}
                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-bold rounded-xl"
              >
                Save Notifications
              </button>
            </div>
          )}

          {activeCategory === 'security' && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-6 space-y-4">
              <h2 className="text-lg font-bold text-black dark:text-white">Security & Access</h2>

              <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <p className="font-bold text-sm">Password</p>
                  <p className="text-xs text-neutral-500">Update your account credentials</p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-3.5 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-bold"
                >
                  Change Password
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <p className="font-bold text-sm">Active Login Sessions</p>
                  <p className="text-xs text-neutral-500">Review and revoke authenticated sessions</p>
                </div>
                <button
                  onClick={() => setShowSessionsModal(true)}
                  className="px-3.5 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-bold"
                >
                  Manage Sessions
                </button>
              </div>

              <div className="p-4 border border-red-300 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-red-700 dark:text-red-400">Delete Account</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Permanently remove your account and records</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeCategory === 'accessibility' && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-6 space-y-5">
              <h2 className="text-lg font-bold text-black dark:text-white">Accessibility</h2>
              <div>
                <label className="block text-sm font-bold mb-2">Base Text Scale: {textSize}%</label>
                <input
                  type="range"
                  min="90"
                  max="130"
                  step="5"
                  value={textSize}
                  onChange={(e) => setTextSize(e.target.value)}
                  className="w-full accent-black dark:accent-white"
                />
              </div>
              <label className="flex items-center justify-between py-2 border-t border-neutral-200 dark:border-neutral-800 cursor-pointer">
                <span className="text-sm font-medium">High Contrast Mode</span>
                <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} className="w-4 h-4 accent-black dark:accent-white" />
              </label>
              <label className="flex items-center justify-between py-2 border-t border-neutral-200 dark:border-neutral-800 cursor-pointer">
                <span className="text-sm font-medium">Reduce Motion</span>
                <input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} className="w-4 h-4 accent-black dark:accent-white" />
              </label>
              <button
                onClick={handleSaveAccessibility}
                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-bold rounded-xl"
              >
                Save Accessibility Preferences
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm bg-white dark:bg-neutral-800"
              />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 chars)"
                className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm bg-white dark:bg-neutral-800"
              />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3.5 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm bg-white dark:bg-neutral-800"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdatingPassword} className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold">
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sessions Modal */}
      {showSessionsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold">Active Login Sessions</h3>
              <button onClick={() => setShowSessionsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-3">
              {loadingSessions ? (
                <p className="text-xs text-neutral-500">Loading sessions...</p>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s._id}
                    className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold">{s.browser || s.device || 'Web Browser Session'}</p>
                      <p className="text-neutral-500">{s.ipAddress || 'Active IP'} • {s.lastActive || 'Active'}</p>
                    </div>
                    {s.isCurrent ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">Current</span>
                    ) : (
                      <button onClick={() => handleRevokeSession(s._id)} className="text-red-600 font-bold hover:underline">
                        Revoke
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowSessionsModal(false)} className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-600">Delete Account Permanently?</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              This action is irreversible and removes your account access and records.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-xl text-xs font-semibold">
                Keep Account
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                {isDeletingAccount ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
