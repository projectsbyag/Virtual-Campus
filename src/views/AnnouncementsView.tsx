import React, { useState } from 'react';
import { Announcement } from '../types';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  onAskAiAnnouncement: (announcement: Announcement) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  onAskAiAnnouncement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const filtered = announcements.filter((a) => {
    const courseObj = typeof a.course === 'object' ? a.course : null;
    const cName = courseObj?.name || a.courseName || 'General';
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || a.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Department updates and campus bulletins
          </p>
        </div>

        <div className="flex gap-1.5 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          {['All', 'urgent', 'normal', 'info'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded text-xs font-medium capitalize transition ${
                priorityFilter === p
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter announcements by keyword..."
          className="pl-10 pr-4 py-2 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <i className="fas fa-search text-gray-400"></i>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const courseObj = typeof item.course === 'object' ? item.course : null;
          const courseName = courseObj?.name || item.courseName || 'General Campus';
          const senderName = item.sender ? `${item.sender.firstName} ${item.sender.lastName}` : (item.senderName || 'Department');
          const senderRole = item.sender?.role || item.senderRole || 'Faculty';
          const isUrgent = item.priority === 'urgent';

          return (
            <div
              key={item._id}
              className={`p-5 rounded-lg shadow-md border transition ${
                isUrgent
                  ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isUrgent
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        : 'bg-neutral-100 text-black dark:bg-neutral-800 dark:text-white'
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{courseName}</span>
                </div>
                <span className="text-xs text-gray-400">{item.createdAt || item.date || 'Recently'}</span>
              </div>

              <h3 className="font-semibold text-base text-gray-900 dark:text-white mt-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>

              <div className="mt-4 pt-3 border-t border-gray-200/60 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Issued by <span className="font-semibold text-gray-700 dark:text-gray-300">{senderName}</span> ({senderRole})
                </span>

                <button
                  onClick={() => onAskAiAnnouncement(item)}
                  className="text-xs text-primary dark:text-primaryLight hover:underline font-medium flex items-center space-x-1"
                >
                  <i className="fas fa-robot text-xs"></i>
                  <span>Explain with AI</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
