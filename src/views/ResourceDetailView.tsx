import React, { useState, useEffect } from 'react';
import { Resource, User } from '../types';
import { apiService } from '../services/api';

interface ResourceDetailViewProps {
  resource: Resource;
  currentUser: User | null;
  onBack: () => void;
  onAskAi: (r: Resource) => void;
  onSelectCourse: (courseId: string) => void;
  onRefreshData: () => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ResourceDetailView: React.FC<ResourceDetailViewProps> = ({
  resource,
  currentUser,
  onBack,
  onAskAi,
  onSelectCourse,
  onRefreshData,
  onShowToast,
}) => {
  const initialLiked = Boolean(
    currentUser && Array.isArray(resource.likes) && resource.likes.includes(currentUser._id)
  );
  const [likesCount, setLikesCount] = useState(resource.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(resource.comments || []);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setLikesCount(resource.likes?.length || 0);
    setIsLiked(Boolean(currentUser && Array.isArray(resource.likes) && resource.likes.includes(currentUser._id)));
    setComments(resource.comments || []);
  }, [resource._id, resource.likes, resource.comments, currentUser?._id]);

  const courseObj = typeof resource.course === 'object' ? resource.course : null;
  const courseCode = courseObj ? courseObj.code : 'COURSE';
  const courseName = courseObj ? courseObj.name : 'Course Material';
  const courseId = courseObj ? courseObj._id : typeof resource.course === 'string' ? resource.course : '';

  const canManage = Boolean(
    currentUser &&
      (currentUser.role === 'admin' ||
        courseObj?.isTeaching ||
        courseObj?.instructor?._id === currentUser._id ||
        resource.uploadedBy?._id === currentUser._id)
  );

  const handleLikeToggle = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    try {
      if (nextState) {
        await apiService.likeResource(resource._id);
      } else {
        await apiService.unlikeResource(resource._id);
      }
      await onRefreshData();
    } catch {
      // revert silently if forbidden
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const textToSend = commentText.trim();
    setCommentText('');

    try {
      await apiService.addResourceComment(resource._id, textToSend);
      onShowToast('Comment posted!', 'success');
      await onRefreshData();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to post comment.', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await apiService.deleteResource(resource._id);
      onShowToast('Resource deleted.', 'info');
      await onRefreshData();
      onBack();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to delete resource.', 'error');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <i className="fas fa-file-pdf text-red-500 text-3xl"></i>;
      case 'slides':
        return <i className="fas fa-file-powerpoint text-amber-500 text-3xl"></i>;
      case 'archive':
        return <i className="fas fa-file-archive text-purple-500 text-3xl"></i>;
      default:
        return <i className="fas fa-file-alt text-neutral-600 dark:text-neutral-300 text-3xl"></i>;
    }
  };

  return (
    <div className="fade-in space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onBack}
            className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white text-sm font-bold flex items-center"
          >
            <i className="fas fa-arrow-left mr-1.5"></i> Back to Resources
          </button>
          <span className="text-neutral-400">•</span>
          {courseId && (
            <button
              onClick={() => onSelectCourse(courseId)}
              className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white text-sm font-bold"
            >
              {courseCode} ({courseName})
            </button>
          )}
        </div>

        {canManage &&
          (!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-1.5 rounded-xl border border-red-300 dark:border-red-900 text-red-600 text-xs font-bold"
            >
              <i className="fas fa-trash mr-1"></i> Delete Resource
            </button>
          ) : (
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold"
            >
              Confirm Delete
            </button>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-6">
            <div className="flex items-start gap-4 mb-4">
              {getFileIcon(resource.fileType)}
              <div className="flex-1">
                <h1 className="text-2xl font-black text-black dark:text-white">{resource.title}</h1>
                <div className="flex items-center mt-1.5 flex-wrap gap-2">
                  <span className="px-2 py-0.5 text-xs rounded font-black bg-black text-white dark:bg-white dark:text-black">
                    {courseCode}
                  </span>
                  <span className="text-xs text-neutral-500 uppercase font-bold">
                    {resource.category || resource.fileType}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center text-xs text-neutral-500 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <span>
                Added by {resource.uploadedBy.firstName} {resource.uploadedBy.lastName}
              </span>
              <span className="mx-2">•</span>
              <span>{resource.createdAt}</span>
            </div>

            <div className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {resource.description || 'No description provided.'}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-6">
            <h3 className="text-base font-bold text-black dark:text-white mb-4">
              Discussion & Notes ({comments.length})
            </h3>

            <form onSubmit={handleAddComment} className="mb-6 space-y-3">
              <textarea
                rows={3}
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ask a question or leave a study tip regarding this material..."
                className="w-full px-4 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold rounded-xl transition"
                >
                  Post Comment
                </button>
              </div>
            </form>

            {comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((c) => {
                  const authorName =
                    typeof c.user === 'object' && c.user
                      ? `${c.user.firstName || ''} ${c.user.lastName || ''}`.trim()
                      : 'Member';
                  return (
                    <div
                      key={c._id}
                      className="p-3.5 bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center font-bold text-black dark:text-white">
                        <span>{authorName}</span>
                        <span className="text-neutral-400 font-normal">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{c.content}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">No comments yet.</p>
            )}
          </div>
        </div>

        {/* Actions Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-6 space-y-3">
            <h3 className="font-bold text-sm text-black dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-2">
              File Actions
            </h3>

            {resource.fileUrl && resource.fileUrl !== '#' && (
              <a
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  apiService.recordResourceView(resource._id).catch(() => {});
                }}
                className="w-full px-4 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <i className="fas fa-download"></i>
                <span>Download / Open ({resource.fileSize})</span>
              </a>
            )}

            <button
              onClick={() => onAskAi(resource)}
              className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <i className="fas fa-robot"></i>
              <span>Summarize with Campus AI</span>
            </button>

            <button
              onClick={handleLikeToggle}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                isLiked
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-600'
                  : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <i className={`fas fa-heart ${isLiked ? 'text-red-500' : 'text-neutral-400'}`}></i>
              <span>
                {isLiked ? 'Liked' : 'Like Resource'} ({likesCount})
              </span>
            </button>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-6 text-xs text-neutral-600 dark:text-neutral-400 space-y-3">
            <h4 className="font-bold text-black dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-2 text-sm">
              Metadata
            </h4>
            <div className="flex justify-between">
              <span>File Size</span>
              <span className="font-bold text-black dark:text-white">{resource.fileSize}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Views</span>
              <span className="font-bold text-black dark:text-white">{resource.downloads}</span>
            </div>
            <div className="flex justify-between">
              <span>Course</span>
              <span className="font-bold text-black dark:text-white">{courseCode}</span>
            </div>
            <div className="flex justify-between">
              <span>Uploaded</span>
              <span className="font-bold text-black dark:text-white">{resource.createdAt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
