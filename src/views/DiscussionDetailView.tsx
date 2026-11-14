import React, { useState, useEffect } from 'react';
import { Discussion, Course, User, DEFAULT_AVATAR } from '../types';
import { apiService } from '../services/api';

interface DiscussionDetailViewProps {
  discussion: Discussion;
  courses: Course[];
  currentUser: User | null;
  onBack: () => void;
  onAddReply: (discussionId: string, content: string) => Promise<void>;
  onUpvote: (discussionId: string) => void;
  onAskAi: (d: Discussion) => void;
  onRefreshData: () => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const DiscussionDetailView: React.FC<DiscussionDetailViewProps> = ({
  discussion,
  courses,
  currentUser,
  onBack,
  onAddReply,
  onUpvote,
  onAskAi,
  onRefreshData,
  onShowToast,
}) => {
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(discussion.replies || []);
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [confirmDeleteThread, setConfirmDeleteThread] = useState(false);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);

  useEffect(() => {
    setReplies(discussion.replies || []);
  }, [discussion._id, discussion.replies]);

  const rawCourseId = typeof discussion.course === 'object' ? discussion.course._id : discussion.course;
  const courseObj =
    (typeof discussion.course === 'object' ? discussion.course : null) ||
    courses.find((c) => c._id === rawCourseId) ||
    null;

  const courseName = courseObj ? courseObj.name : discussion.courseName || 'Course';
  const courseCode = courseObj ? courseObj.code : discussion.courseCode || 'CRS';

  const isCourseOwner = Boolean(
    currentUser &&
      (currentUser.role === 'admin' ||
        courseObj?.isTeaching ||
        courseObj?.instructor?._id === currentUser._id)
  );
  const isAuthor = Boolean(currentUser && discussion.author?._id === currentUser._id);
  const canDeleteThread = isCourseOwner || isAuthor;

  const isMemberOfCourse = Boolean(
    currentUser &&
      (currentUser.role === 'admin' ||
        isCourseOwner ||
        courseObj?.isEnrolled)
  );
  const canReply = isMemberOfCourse && !discussion.isLocked && !courseObj?.isArchived;

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !canReply) return;
    setIsPostingReply(true);
    try {
      await onAddReply(discussion._id, replyText.trim());
      setReplyText('');
    } finally {
      setIsPostingReply(false);
    }
  };

  const handleTogglePin = async () => {
    try {
      await apiService.updateDiscussion(discussion._id, { isPinned: !discussion.isPinned });
      onShowToast(discussion.isPinned ? 'Unpinned discussion.' : 'Pinned discussion!', 'success');
      await onRefreshData();
    } catch (err: any) {
      onShowToast(err?.message || 'Permission denied.', 'error');
    }
  };

  const handleToggleLock = async () => {
    try {
      await apiService.updateDiscussion(discussion._id, { isLocked: !discussion.isLocked });
      onShowToast(discussion.isLocked ? 'Discussion unlocked.' : 'Discussion locked.', 'info');
      await onRefreshData();
    } catch (err: any) {
      onShowToast(err?.message || 'Permission denied.', 'error');
    }
  };

  const handleDeleteThread = async () => {
    try {
      await apiService.deleteDiscussion(discussion._id);
      onShowToast('Discussion deleted.', 'info');
      await onRefreshData();
      onBack();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to delete discussion.', 'error');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    try {
      await apiService.deleteReply(discussion._id, replyId);
      setReplies((prev) => prev.filter((r) => r._id !== replyId));
      setDeletingReplyId(null);
      onShowToast('Reply deleted.', 'info');
      await onRefreshData();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to delete reply.', 'error');
    }
  };

  return (
    <div className="fade-in space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="text-black dark:text-white hover:underline text-sm font-bold flex items-center gap-2"
        >
          <i className="fas fa-arrow-left text-xs"></i>
          <span>Back to Discussions</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {isCourseOwner && (
            <>
              <button
                onClick={handleTogglePin}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <i className="fas fa-thumbtack mr-1"></i>
                {discussion.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={handleToggleLock}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <i className={`fas ${discussion.isLocked ? 'fa-unlock' : 'fa-lock'} mr-1`}></i>
                {discussion.isLocked ? 'Unlock' : 'Lock'}
              </button>
            </>
          )}

          {canDeleteThread &&
            (!confirmDeleteThread ? (
              <button
                onClick={() => setConfirmDeleteThread(true)}
                className="px-3 py-1.5 rounded-xl border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <i className="fas fa-trash mr-1"></i> Delete
              </button>
            ) : (
              <button
                onClick={handleDeleteThread}
                className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold"
              >
                Confirm Delete Thread
              </button>
            ))}
        </div>
      </div>

      {/* Main Discussion Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-6">
        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black px-2.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black">
                {courseCode} • {courseName}
              </span>
              {discussion.isPinned && (
                <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-xs font-bold">
                  Pinned
                </span>
              )}
              {discussion.isLocked && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-bold">
                  Locked
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onAskAi(discussion)}
                className="text-xs text-black dark:text-white hover:underline font-bold flex items-center gap-1"
              >
                <i className="fas fa-robot"></i>
                <span>Explain with AI</span>
              </button>

              <button
                onClick={() => onUpvote(discussion._id)}
                className="px-2.5 py-1 text-xs border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1"
              >
                <i className="fas fa-arrow-up text-xs"></i>
                <span>{discussion.upvotes}</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl font-black text-black dark:text-white">{discussion.title}</h1>

          <div className="flex items-center mt-3 mb-4">
            <img
              src={discussion.author.avatar || DEFAULT_AVATAR}
              alt={discussion.author.firstName}
              className="w-8 h-8 rounded-full object-cover mr-2.5"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
            />
            <div>
              <p className="text-sm font-bold text-black dark:text-white">
                {discussion.author.firstName} {discussion.author.lastName}
              </p>
              <p className="text-xs text-neutral-500">{discussion.createdAt}</p>
            </div>
          </div>

          <div className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {discussion.content}
          </div>

          {discussion.tags && discussion.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {discussion.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 text-xs rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-neutral-500 flex items-center pt-4 border-t border-neutral-200 dark:border-neutral-800 gap-4">
          <span>
            <i className="far fa-comment mr-1"></i> {replies.length} replies
          </span>
          <span>
            <i className="far fa-thumbs-up mr-1"></i> {discussion.upvotes} upvotes
          </span>
        </div>
      </div>

      {/* Replies Section */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-6">
        <h2 className="text-lg font-bold text-black dark:text-white mb-4">{replies.length} Replies</h2>

        {canReply ? (
          <form onSubmit={handleReplySubmit} className="mb-6 space-y-3">
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 text-xs font-bold uppercase mb-1.5">
                Your Reply
              </label>
              <textarea
                rows={4}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Provide an answer, code snippet, or clarification..."
                className="w-full px-4 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPostingReply}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold rounded-xl transition disabled:opacity-60"
              >
                {isPostingReply ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
            <i className="fas fa-lock mr-2"></i>
            {discussion.isLocked
              ? 'This discussion has been locked by an instructor. New replies are disabled.'
              : courseObj?.isArchived
              ? 'This course is archived and read-only.'
              : 'You must be enrolled in or teaching this course to post a reply.'}
          </div>
        )}

        <div className="space-y-3">
          {replies.length > 0 ? (
            replies.map((reply) => {
              const isReplyAuthor = Boolean(currentUser && reply.author?._id === currentUser._id);
              const canDeleteReply = isCourseOwner || isReplyAuthor;

              return (
                <div
                  key={reply._id}
                  className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    reply.isAnswer
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-850/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={reply.author.avatar || DEFAULT_AVATAR}
                        alt={reply.author.firstName}
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                        }}
                      />
                      <span className="font-bold text-black dark:text-white">
                        {reply.author.firstName} {reply.author.lastName}
                      </span>
                      {reply.author.role === 'instructor' && (
                        <span className="px-1.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold">
                          Instructor
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400">{reply.createdAt}</span>
                      {canDeleteReply &&
                        (deletingReplyId === reply._id ? (
                          <button
                            onClick={() => handleDeleteReply(reply._id)}
                            className="px-2 py-0.5 rounded bg-red-600 text-white font-bold"
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            onClick={() => setDeletingReplyId(reply._id)}
                            className="text-red-600 dark:text-red-400 hover:underline font-semibold"
                          >
                            Delete
                          </button>
                        ))}
                    </div>
                  </div>

                  <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{reply.content}</p>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-neutral-400 italic">No replies yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
