import React from 'react';
import { User, ActiveView, DEFAULT_AVATAR } from '../types';

interface SidebarProps {
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  currentUser,
  isOpen,
  onClose,
  isDark,
  onToggleTheme,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveView, label: 'Dashboard', icon: 'fas fa-th-large' },
    { id: 'courses' as ActiveView, label: 'Courses', icon: 'fas fa-graduation-cap' },
    { id: 'assignments' as ActiveView, label: 'Assignments', icon: 'fas fa-tasks' },
    { id: 'resources' as ActiveView, label: 'Resources', icon: 'fas fa-folder-open' },
    { id: 'discussions' as ActiveView, label: 'Discussions', icon: 'fas fa-comments' },
    { id: 'announcements' as ActiveView, label: 'Announcements', icon: 'fas fa-bullhorn' },
    { id: 'campus-ai' as ActiveView, label: 'Campus AI', icon: 'fas fa-robot', badge: 'AI' },
    { id: 'profile' as ActiveView, label: 'Profile', icon: 'fas fa-user' },
    { id: 'settings' as ActiveView, label: 'Settings', icon: 'fas fa-cog' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="p-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div 
              onClick={() => { setCurrentView('dashboard'); onClose(); }}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <i className="fas fa-graduation-cap text-2xl text-primary dark:text-primaryLight"></i>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Virtual Campus</h1>
            </div>
            <button
              onClick={onClose}
              className="md:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* Profile Info */}
          {currentUser && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
              <img
                id="sidebarProfileImage"
                src={currentUser.avatarUrl || currentUser.avatar || DEFAULT_AVATAR}
                alt={currentUser.firstName}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                }}
              />
              <div className="overflow-hidden">
                <p id="sidebarUserName" className="font-medium text-sm text-gray-800 dark:text-white truncate">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p id="sidebarUserRole" className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {currentUser.role}
                </p>
              </div>
            </div>
          )}

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id || 
                (item.id === 'courses' && currentView === 'course-detail') ||
                (item.id === 'discussions' && currentView === 'discussion-detail');

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    onClose();
                  }}
                  className={`nav-link w-full px-4 py-3 rounded-lg flex items-center justify-between transition text-left text-sm ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <i className={`${item.icon} w-5 text-center`}></i>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                        : 'bg-black text-white dark:bg-white dark:text-black'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {/* Landing Page Overview Link */}
          <button
            onClick={() => {
              setCurrentView('landing');
              onClose();
            }}
            className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center space-x-3 transition text-sm"
          >
            <i className="fas fa-globe w-5 text-center text-primary dark:text-primaryLight"></i>
            <span>Campus Overview</span>
          </button>

          {/* Desktop Dark Mode Toggle */}
          <button
            id="desktopDarkModeBtn"
            onClick={onToggleTheme}
            className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center space-x-3 transition text-sm"
          >
            <i className={isDark ? "fas fa-sun text-yellow-400 w-5 text-center" : "fas fa-moon w-5 text-center"}></i>
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Log Out */}
          {currentUser && (
            <button
              onClick={onLogout}
              className="w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center space-x-3 transition text-sm"
            >
              <i className="fas fa-sign-out-alt w-5 text-center"></i>
              <span>Log Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
