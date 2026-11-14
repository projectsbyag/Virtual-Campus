import React, { useState, useEffect } from 'react';
import { Discussion, Course, User } from '../types';
import { apiService } from '../services/api';

interface DiscussionsViewProps {
  discussions: Discussion[];
  courses: Course[];
  currentUser: User | null;
  onUpvote: (id: string) => void;
  onCreateDiscussion: (title: string, content: string, courseId: string, tags?: string[]) => Promise<void>;
  onAskAiDiscussion: (discussion: Discussion) => void;
  onSelectDiscussion: (id: string) => void;
  onRefreshData: () => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const DiscussionsView: React.FC<DiscussionsViewProps> = ({
  discussions,
  courses,
  currentUser,
  onUpvote,
  onCreateDiscussion,
  onAskAiDiscussion,
  onSelectDiscussion,
  onRefreshData,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Enforce backend RBAC: users can only create discussions in active courses they are enrolled in or teaching
  const eligibleCourses = courses.filter(
    (c) =>
      !c.isArchived &&
      (currentUser?.role === 'admin' ||
        c.isTeaching ||
        (currentUser && c.instructor?._id === currentUser._id) ||
        c.isEnrolled)
  );

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [courseId, setCourseId] = useState(eligibleCourses[0]?._id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if ((!courseId || !eligibleCourses.some((c) => c._id === courseId)) && eligibleCourses.length > 0) {
      setCourseId(eligibleCourses[0]._id);
    }
  }, [courses, currentUser?._id, isCreateOpen]);

  const filtered = discussions
    .filter((d) => {
      const cId = typeof d.course === 'object' ? d.course._id : d.course;
      const matchesCourse = courseFilter === 'all' || cId === courseFilter;
      const matchesSearch =
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.content.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCourse && matchesSearch;
    })
    .sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)));

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !courseId) return;
    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await onCreateDiscussion(title.trim(), content.trim(), courseId, tags.length > 0 ? tags : ['General']);
      setIsCreateOpen(false);
      setTitle('');
      setContent('');
      setTagsInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = async (d: Discussion, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.updateDiscussion(d._id, { isPinned: !d.isPinned });
      onShowToast(d.isPinned ? 'Discussion unpinned.' : 'Discussion pinned!', 'success');
      await onRefreshData();
    } catch (err: any) {
      onShowToast(err?.message || 'Permission denied.', 'error');
    }
  };

  const handleToggleLock = async (d: Discussion, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.updateDiscussion(d._id, { isLocked: !d.isLocked });
      onShowToast(d.isLocked ? 'Discussion unlocked.' : 'Discussion locked.', 'info');
      await onRefreshData();
    } catch (err: any) {
      onShowToast(err?.message || 'Permission denied.', 'error');
    }
  };

  const handleDeleteDiscussion = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.deleteDiscussion(id);
      onShowToast('Discussion deleted.', 'info');
      setDeletingId(null);
      await onRefreshData();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to delete discussion.', 'error');
    }
  };

  return (
    <div className="fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">Discussions</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Course Q&A threads, peer collaboration, and instructor clarifications.
          </p>
        </div>

        <button
          onClick={() => {
            if (eligibleCourses.length === 0) {
              onShowToast(
                'Enroll in or teach an active course before starting a new discussion.',
                'error'
              );
              return;
            }
            setIsCreateOpen(true);
          }}
          className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl transition text-xs font-bold flex items-center gap-2 shadow-xs"
        >
          <i className="fas fa-plus"></i>
          <span>New Discussion</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search discussion topics or questions..."
            className="pl-10 pr-4 py-2.5 w-full text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-neutral-900 text-black dark:text-white"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5">
            <i className="fas fa-search text-neutral-400 text-xs"></i>
          </div>
        </div>

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-4 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-black dark:text-white"
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((d) => {
            const course = typeof d.course === 'object' ? d.course : null;
            const courseCode = course ? course.code : d.courseCode || 'CRS';

            const isCourseOwner = Boolean(
              currentUser &&
                (currentUser.role === 'admin' ||
                  course?.isTeaching ||
                  course?.instructor?._id === currentUser._id)
            );
            const isAuthor = Boolean(currentUser && d.author?._id === currentUser._id);
            const canDelete = isCourseOwner || isAuthor;

            return (
              <div
                key={d._id}
                onClick={() => onSelectDiscussion(d._id)}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-5 flex items-start gap-4 hover:border-black dark:hover:border-white transition cursor-pointer"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpvote(d._id);
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 min-w-11 shrink-0"
                >
                  <i className="fas fa-arrow-up text-xs"></i>
                  <span className="text-xs font-black mt-0.5">{d.upvotes}</span>
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 text-[11px] rounded font-black uppercase bg-black text-white dark:bg-white dark:text-black">
                      {courseCode}
                    </span>
                    {d.isPinned && (
                      <span className="px-2 py-0.5 text-[11px] rounded-full font-bold bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                        <i className="fas fa-thumbtack mr-1"></i> Pinned
                      </span>
                    )}
                    {d.isLocked && (
                      <span className="px-2 py-0.5 text-[11px] rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        <i className="fas fa-lock mr-1"></i> Locked
                      </span>
                    )}
                    {d.solved && (
                      <span className="px-2 py-0.5 text-[11px] rounded-full font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Solved
                      </span>
                    )}
                    <span className="text-xs text-neutral-400">• {d.createdAt}</span>
                  </div>

                  <h3 className="font-bold text-base text-black dark:text-white hover:underline">{d.title}</h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{d.content}</p>

                  <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
                    <span>
                      by <strong className="text-neutral-800 dark:text-neutral-200">{d.author.firstName} {d.author.lastName}</strong>
                    </span>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAskAiDiscussion(d);
                        }}
                        className="text-black dark:text-white hover:underline font-bold flex items-center gap-1"
                      >
                        <i className="fas fa-robot"></i>
                        <span>AI Answer Helper</span>
                      </button>

                      <span>
                        <i className="fas fa-comment-alt mr-1"></i> {d.repliesCount} replies
                      </span>

                      {isCourseOwner && (
                        <>
                          <button
                            onClick={(e) => handleTogglePin(d, e)}
                            className="hover:text-black dark:hover:text-white font-semibold"
                            title={d.isPinned ? 'Unpin thread' : 'Pin thread'}
                          >
                            {d.isPinned ? 'Unpin' : 'Pin'}
                          </button>
                          <button
                            onClick={(e) => handleToggleLock(d, e)}
                            className="hover:text-black dark:hover:text-white font-semibold"
                            title={d.isLocked ? 'Unlock thread' : 'Lock thread'}
                          >
                            {d.isLocked ? 'Unlock' : 'Lock'}
                          </button>
                        </>
                      )}

                      {canDelete &&
                        (deletingId === d._id ? (
                          <button
                            onClick={(e) => handleDeleteDiscussion(d._id, e)}
                            className="px-2 py-0.5 rounded bg-red-600 text-white font-bold"
                          >
                            Confirm Delete
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(d._id);
                            }}
                            className="text-red-600 dark:text-red-400 hover:underline font-semibold"
                          >
                            Delete
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 text-center space-y-2">
          <i className="fas fa-comments text-2xl text-neutral-400"></i>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No discussions found matching your criteria.
          </p>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
              <h3 className="text-lg font-bold text-black dark:text-white">Start New Discussion</h3>
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
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white"
                >
                  {eligibleCourses.map((c) => (
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
                  placeholder="e.g. Question on Bellman-Ford Negative Cycles"
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Question / Details *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Explain your question or topic in detail..."
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="homework, algorithms, exam-prep"
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-neutral-300 dark:border-neutral-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl transition disabled:opacity-60"
                >
                  {isSubmitting ? 'Posting...' : 'Post Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
