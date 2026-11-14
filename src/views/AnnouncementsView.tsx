import React, { useState, useEffect } from 'react';
import { Announcement, Course, User } from '../types';
import { apiService } from '../services/api';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  courses: Course[];
  currentUser: User | null;
  onRefreshData: () => Promise<void>;
  onAskAiAnnouncement: (announcement: Announcement) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  courses,
  currentUser,
  onRefreshData,
  onAskAiAnnouncement,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isInstructorOrAdmin = currentUser?.role === 'instructor' || currentUser?.role === 'admin';
  const teachableCourses = courses.filter(
    (c) =>
      !c.isArchived &&
      (currentUser?.role === 'admin' ||
        c.isTeaching ||
        (currentUser && c.instructor?._id === currentUser._id))
  );

  const [courseId, setCourseId] = useState(teachableCourses[0]?._id || '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if ((!courseId || !teachableCourses.some((c) => c._id === courseId)) && teachableCourses.length > 0) {
      setCourseId(teachableCourses[0]._id);
    }
  }, [courses, currentUser?._id, isCreateOpen]);

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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !courseId) return;
    setIsSubmitting(true);
    try {
      await apiService.createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        course: courseId,
      });
      onShowToast('Announcement posted successfully!', 'success');
      setTitle('');
      setContent('');
      setIsCreateOpen(false);
      await onRefreshData();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to post announcement.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fade-in space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">Announcements</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Course updates and faculty broadcasts</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 p-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
            {['All', 'urgent', 'normal', 'info'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                  priorityFilter === p
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {isInstructorOrAdmin && (
            <button
              onClick={() => {
                if (teachableCourses.length === 0) {
                  onShowToast('Create an active course first to post announcements.', 'error');
                  return;
                }
                setIsCreateOpen(true);
              }}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <i className="fas fa-plus"></i>
              <span>New Announcement</span>
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter announcements by keyword or course..."
          className="pl-10 pr-4 py-2.5 w-full text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-black dark:text-white"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5">
          <i className="fas fa-search text-neutral-400 text-xs"></i>
        </div>
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((item) => {
            const courseObj = typeof item.course === 'object' ? item.course : null;
            const courseName = courseObj?.name || item.courseName || 'Course Broadcast';
            const senderName = item.sender
              ? `${item.sender.firstName} ${item.sender.lastName}`
              : item.senderName || 'Faculty';
            const senderRole = item.sender?.role || item.senderRole || 'Instructor';
            const isUrgent = item.priority === 'urgent';

            return (
              <div
                key={item._id}
                className={`p-5 rounded-2xl border shadow-xs transition ${
                  isUrgent
                    ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        isUrgent
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                          : 'bg-neutral-100 text-black dark:bg-neutral-800 dark:text-white'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{courseName}</span>
                  </div>
                  <span className="text-xs text-neutral-400">{item.date || 'Recently'}</span>
                </div>

                <h3 className="font-bold text-base text-black dark:text-white mt-1">{item.title}</h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-2 leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </p>

                <div className="mt-4 pt-3 border-t border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    Issued by <span className="font-bold text-neutral-800 dark:text-neutral-200">{senderName}</span> ({senderRole})
                  </span>

                  <button
                    onClick={() => onAskAiAnnouncement(item)}
                    className="text-xs text-black dark:text-white hover:underline font-bold flex items-center gap-1"
                  >
                    <i className="fas fa-robot"></i>
                    <span>Explain with AI</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 text-center space-y-2">
          <i className="fas fa-bullhorn text-2xl text-neutral-400"></i>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No announcements available yet.
          </p>
        </div>
      )}

      {/* New Announcement Modal */}
      {isCreateOpen && isInstructorOrAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-black dark:text-white">Post Course Announcement</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-neutral-400 hover:text-black">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Course *</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                >
                  {teachableCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code}: {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lab Schedule Update"
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Content *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write announcement details..."
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold"
                >
                  {isSubmitting ? 'Posting...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
