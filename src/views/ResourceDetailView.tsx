import React, { useState } from 'react';
import { Resource, User } from '../types';
import { apiService } from '../services/api';

interface ResourceDetailViewProps {
  resource: Resource;
  currentUser: User | null;
  onBack: () => void;
  onDownload: (r: Resource) => void;
  onAskAi: (r: Resource) => void;
  onSelectCourse: (courseId: string) => void;
}

export const ResourceDetailView: React.FC<ResourceDetailViewProps> = ({
  resource,
  currentUser,
  onBack,
  onDownload,
  onAskAi,
  onSelectCourse,
}) => {
  const [likesCount, setLikesCount] = useState(14);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<{ id: string; user: string; text: string; time: string }[]>([
    {
      id: 'c-1',
      user: 'Maya Chen',
      text: 'The explanation on page 4 regarding topological sort and DAG relaxations is super clear!',
      time: '2 hours ago',
    },
    {
      id: 'c-2',
      user: 'Tariq Al-Mansoor',
      text: 'Thanks for uploading this! Helped me solve question 3 on the homework set.',
      time: 'Yesterday',
    },
  ]);

  const courseObj = typeof resource.course === 'object' ? resource.course : null;
  const courseCode = courseObj ? courseObj.code : 'COURSE';
  const courseName = courseObj ? courseObj.name : 'Course Material';
  const courseColor = courseObj ? courseObj.color || '#5D5CDE' : '#5D5CDE';
  const courseId = courseObj ? courseObj._id : (typeof resource.course === 'string' ? resource.course : '');

  const handleLikeToggle = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount(prev => nextState ? prev + 1 : Math.max(0, prev - 1));
    try {
      if (nextState) {
        await apiService.likeResource(resource._id);
      } else {
        await apiService.unlikeResource(resource._id);
      }
    } catch (err) {
      console.warn('Like toggle request note:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: 'c-' + Date.now(),
      user: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Student',
      text: commentText.trim(),
      time: 'Just now',
    };

    setComments(prev => [newComment, ...prev]);
    const textToSend = commentText.trim();
    setCommentText('');

    try {
      await apiService.addResourceComment(resource._id, textToSend);
    } catch (err) {
      console.warn('Comment post request note:', err);
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
        return <i className="fas fa-file-alt text-primary text-3xl"></i>;
    }
  };

  return (
    <div className="fade-in space-y-6">
      {/* Back button and breadcrumb */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onBack}
          className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm font-medium flex items-center"
        >
          <i className="fas fa-arrow-left mr-1"></i> Back to Resources
        </button>
        <span className="text-gray-400">•</span>
        <button
          onClick={() => onSelectCourse(courseId)}
          className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm font-medium"
        >
          {courseCode} ({courseName})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Resource Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-start mb-4">
              {getFileIcon(resource.fileType)}
              <div className="ml-3 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-user-content="true">
                  {resource.title}
                </h1>
                <div className="flex items-center mt-1 flex-wrap gap-2">
                  <span
                    className="px-2 py-0.5 text-xs rounded-full font-medium"
                    style={{ backgroundColor: `${courseColor}25`, color: courseColor }}
                  >
                    {courseCode}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                    {resource.fileType}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <span>Added by {resource.uploadedBy.firstName} {resource.uploadedBy.lastName}</span>
              <span className="mx-2">•</span>
              <span>{resource.createdAt}</span>
            </div>

            <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>{resource.description}</p>
            </div>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5 pt-4 border-t border-gray-100 dark:border-gray-700">
                {resource.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Discussion & Comments on Resource */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Discussion & Notes ({comments.length})
            </h3>

            <form onSubmit={handleAddComment} className="mb-6 space-y-3">
              <textarea
                rows={3}
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ask a question or leave a study tip regarding this document..."
                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-semibold rounded-lg transition"
                >
                  Post Comment
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between items-center font-semibold text-gray-800 dark:text-gray-200">
                    <span>{c.user}</span>
                    <span className="text-gray-400 font-normal">{c.time}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & File Stats */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
            <h3 className="font-semibold text-base text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              File Actions
            </h3>

            <button
              onClick={() => onDownload(resource)}
              className="w-full px-4 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg text-sm font-semibold transition flex items-center justify-center space-x-2"
            >
              <i className="fas fa-download"></i>
              <span>Download File ({resource.fileSize})</span>
            </button>

            <button
              onClick={() => onAskAi(resource)}
              className="w-full px-4 py-2.5 border border-black/30 dark:border-white/40 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-sm font-semibold transition flex items-center justify-center space-x-2"
            >
              <i className="fas fa-robot text-sm"></i>
              <span>Summarize with Campus AI</span>
            </button>

            <button
              onClick={handleLikeToggle}
              className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center space-x-2 border ${
                isLiked
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-600'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300'
              }`}
            >
              <i className={`fas fa-heart ${isLiked ? 'text-red-500' : 'text-gray-400'}`}></i>
              <span>{isLiked ? 'Liked' : 'Like Resource'} ({likesCount})</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-xs text-gray-600 dark:text-gray-400 space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 text-sm">
              Metadata
            </h4>
            <div className="flex justify-between">
              <span>File Size</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{resource.fileSize}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Downloads</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{resource.downloads}</span>
            </div>
            <div className="flex justify-between">
              <span>Course</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{courseCode}</span>
            </div>
            <div className="flex justify-between">
              <span>Uploaded</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{resource.createdAt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
