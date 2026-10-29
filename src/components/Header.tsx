import React from 'react';
import { User, ActiveView, DEFAULT_AVATAR } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onOpenMobileMenu: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onProfileClick: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenMobileMenu,
  isDark,
  onToggleTheme,
  onProfileClick,
  onGoHome,
}) => {
  return (
    <header 
      id="mobileHeader"
      className="md:hidden bg-white dark:bg-gray-800 shadow-md py-3 px-4 flex justify-between items-center sticky top-0 z-30"
    >
      <div className="flex items-center">
        <button 
          id="mobileMenuBtn" 
          onClick={onOpenMobileMenu}
          className="mr-3 text-gray-700 dark:text-gray-300"
          aria-label="Open menu"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
        <button 
          onClick={onGoHome}
          className="text-xl font-black text-black dark:text-white tracking-tight focus:outline-none"
        >
          Virtual Campus
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button 
          id="toggleDarkModeBtn" 
          onClick={onToggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <i className="fas fa-sun text-yellow-400"></i>
          ) : (
            <i className="fas fa-moon text-gray-700 dark:text-gray-300"></i>
          )}
        </button>

        {currentUser && (
          <div className="relative ml-2">
            <button 
              id="mobileProfileBtn" 
              onClick={onProfileClick}
              className="flex items-center focus:outline-none"
            >
              <img 
                id="mobileProfileImage" 
                src={currentUser.avatarUrl || currentUser.avatar || DEFAULT_AVATAR} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                }}
              />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
