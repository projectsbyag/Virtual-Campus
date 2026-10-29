import React, { useState } from 'react';
import { User, Course, ActiveView, DEFAULT_AVATAR } from '../types';

interface ProfileViewProps {
  currentUser: User | null;
  courses: Course[];
  setCurrentView: (view: ActiveView, params?: any) => void;
  onLogout: () => void;
  onUpdateUser: (updated: Partial<User>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  courses,
  setCurrentView,
  onLogout,
  onUpdateUser,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState(currentUser?.firstName || '');
  const [editLastName, setEditLastName] = useState(currentUser?.lastName || '');
  const [editBio, setEditBio] = useState('Junior CS student passionate about distributed systems, compilers, and ML.');
  const [editAvatar, setEditAvatar] = useState(
    currentUser?.avatarUrl && currentUser.avatarUrl !== DEFAULT_AVATAR
      ? currentUser.avatarUrl
      : ''
  );

  if (!currentUser) return null;

  const enrolledCourses = courses.filter((c) => c.isEnrolled);

  const badges = [
    { name: 'Consistent Scholar', icon: 'fas fa-fire', colorClass: 'bg-amber-100 text-amber-600', description: 'Maintained 10+ day study streak' },
    { name: 'Discussion Leader', icon: 'fas fa-award', colorClass: 'bg-blue-100 text-blue-600', description: 'Over 15 verified solutions posted' },
    { name: 'Deans Honor List', icon: 'fas fa-star', colorClass: 'bg-purple-100 text-purple-600', description: 'Cumulative Grade > 90%' },
    { name: 'Early Submitter', icon: 'fas fa-bolt', colorClass: 'bg-green-100 text-green-600', description: 'All assignments submitted ahead of time' },
  ];

  const recentActivities = [
    { id: '1', title: 'Submitted Problem Set 4 (Algorithms)', time: 'Yesterday at 4:30 PM', icon: 'fas fa-file-upload text-green-500' },
    { id: '2', title: 'Earned 96% on B+ Tree Indexing Project', time: '2 days ago', icon: 'fas fa-check-double text-blue-500' },
    { id: '3', title: 'Downloaded Lecture 7 Slides (Distributed Systems)', time: '3 days ago', icon: 'fas fa-download text-primary' },
    { id: '4', title: 'Replied to discussion on Transformer Attention', time: '4 days ago', icon: 'fas fa-comment text-amber-500' },
  ];

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAvatar = editAvatar.trim() ? editAvatar.trim() : DEFAULT_AVATAR;
    onUpdateUser({
      firstName: editFirstName,
      lastName: editLastName,
      avatarUrl: finalAvatar,
      avatar: finalAvatar,
    });
    setIsEditModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEditAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <button
          id="editProfileBtn"
          onClick={() => setIsEditModalOpen(true)}
          className="mt-2 sm:mt-0 px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg transition text-sm font-medium flex items-center space-x-1"
        >
          <i className="fas fa-edit mr-1"></i>
          <span>Edit Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User info and quick stats */}
        <div>
          {/* User info card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="relative">
                <img
                  id="profilePageImage"
                  src={currentUser.avatarUrl || currentUser.avatar || DEFAULT_AVATAR}
                  alt={currentUser.firstName}
                  className="w-24 h-24 rounded-full object-cover mb-3 shadow border-2 border-primary/20"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                  }}
                />
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-0 right-0 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-full w-8 h-8 flex items-center justify-center text-xs shadow"
                >
                  <i className="fas fa-camera"></i>
                </button>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                <span className="font-semibold">E-mail:</span> {currentUser.email}
              </p>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                {editBio}
              </p>
              <div className="mt-3 px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize font-medium">
                {currentUser.role} • {currentUser.department}
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 text-xs text-gray-600 dark:text-gray-400 space-y-2.5">
              <div className="flex justify-between">
                <span>Member Since</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">Sep 2023 (412 days)</span>
              </div>
              <div className="flex justify-between">
                <span>Last Login</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">Today, 10:14 AM</span>
              </div>
              <div className="flex justify-between">
                <span>Enrolled Courses</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{enrolledCourses.length}</span>
              </div>
            </div>
          </div>

          {/* Quick links card (1-1 with former views.js) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-3">Quick Links</h3>
            <div className="space-y-1 text-sm">
              <button
                onClick={() => setCurrentView('courses')}
                className="w-full flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-lg transition text-left"
              >
                <i className="fas fa-book mr-3 text-black dark:text-white w-4"></i>
                <span>My Courses</span>
              </button>
              <button
                onClick={() => setCurrentView('assignments')}
                className="w-full flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-lg transition text-left"
              >
                <i className="fas fa-tasks mr-3 text-black dark:text-white w-4"></i>
                <span>Assignments</span>
              </button>
              <button
                onClick={() => setCurrentView('discussions')}
                className="w-full flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-lg transition text-left"
              >
                <i className="fas fa-comments mr-3 text-black dark:text-white w-4"></i>
                <span>Discussions</span>
              </button>
              <button
                onClick={() => setCurrentView('resources')}
                className="w-full flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-lg transition text-left"
              >
                <i className="fas fa-file-alt mr-3 text-black dark:text-white w-4"></i>
                <span>Resources</span>
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className="w-full flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-lg transition text-left"
              >
                <i className="fas fa-cog mr-3 text-black dark:text-white w-4"></i>
                <span>Account Settings</span>
              </button>
            </div>
          </div>

          {/* Skill badges card (students only) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-3">Academic Badges</h3>
            <div className="grid grid-cols-2 gap-2">
              {badges.map((b, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center bg-gray-50 dark:bg-gray-750 rounded-lg p-3 text-center"
                  title={b.description}
                >
                  <div className={`w-10 h-10 flex items-center justify-center mb-1.5 rounded-full ${b.colorClass}`}>
                    <i className={b.icon}></i>
                  </div>
                  <span className="text-[11px] font-medium text-gray-800 dark:text-gray-200">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Performance and Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Performance Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-4">
              Academic Performance Overview
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg text-center">
                <span className="text-xs text-gray-500">Average Grade</span>
                <p className="text-2xl font-bold text-primary dark:text-primaryLight mt-1">94.5%</p>
                <span className="text-[10px] text-green-500 font-semibold">Grade A (Excellent)</span>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg text-center">
                <span className="text-xs text-gray-500">Completed Tasks</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">12 / 14</p>
                <span className="text-[10px] text-gray-400">85% Complete</span>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg text-center">
                <span className="text-xs text-gray-500">On-Time Submissions</span>
                <p className="text-2xl font-bold text-green-600 mt-1">100%</p>
                <span className="text-[10px] text-green-500 font-semibold">Zero Late Submissions</span>
              </div>
            </div>

            {/* Course Progress breakdown */}
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Enrolled Course Progress</h4>
            <div className="space-y-3">
              {enrolledCourses.map((c) => (
                <div key={c._id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{c.code}: {c.name}</span>
                    <span className="font-bold text-black dark:text-white">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-black dark:bg-white h-full rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Stream */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-4">
              Recent Campus Activity
            </h3>
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-center space-x-3 p-2.5 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <i className={act.icon}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{act.title}</p>
                    <p className="text-[11px] text-gray-400">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Academic Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Profile Avatar / Display Image */}
              <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Display Picture
                </label>
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src={editAvatar.trim() || DEFAULT_AVATAR}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border border-gray-300 dark:border-gray-600 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                    }}
                  />
                  <div className="flex-1 text-xs space-y-1">
                    <div className="flex flex-wrap gap-2">
                      <label className="cursor-pointer px-2.5 py-1 bg-white dark:bg-gray-700 hover:bg-gray-100 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-200 text-xs font-medium inline-flex items-center">
                        <i className="fas fa-upload mr-1 text-xs"></i>
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditAvatar('')}
                        className="px-2.5 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-300 rounded text-xs font-medium inline-flex items-center"
                        title="Reset to default placeholder"
                      >
                        <i className="fas fa-undo mr-1 text-xs"></i>
                        Use Default Placeholder
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Users without an uploaded image display the default silhouette avatar.
                    </p>
                  </div>
                </div>
                <input
                  type="url"
                  placeholder="Or enter image URL (https://...)"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Academic Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
