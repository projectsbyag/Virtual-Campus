import React, { useState } from 'react';
import { Discussion, User, DEFAULT_AVATAR } from '../types';

interface DiscussionDetailViewProps {
  discussion: Discussion;
  currentUser: User | null;
  onBack: () => void;
  onAddReply: (discussionId: string, content: string) => void;
  onUpvote: (discussionId: string) => void;
  onAskAi: (d: Discussion) => void;
}

export const DiscussionDetailView: React.FC<DiscussionDetailViewProps> = ({
  discussion,
  currentUser,
  onBack,
  onAddReply,
  onUpvote,
  onAskAi,
}) => {
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(discussion.replies || []);

  const courseObj = typeof discussion.course === 'object' ? discussion.course : null;
  const courseName = courseObj ? courseObj.name : 'Course';
  const courseCode = courseObj ? courseObj.code : 'CSC';

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newRep = {
      _id: 'rep-' + Date.now(),
      author: {
        firstName: currentUser?.firstName || 'Student',
        lastName: currentUser?.lastName || 'User',
        avatar: currentUser?.avatarUrl || currentUser?.avatar,
        role: currentUser?.role || 'student',
      },
      content: replyText.trim(),
      createdAt: 'Just now',
      upvotes: 0,
    };

    setReplies([...replies, newRep]);
    onAddReply(discussion._id, replyText.trim());
    setReplyText('');
  };

  return (
    <div className="fade-in space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="text-black dark:text-white hover:underline text-sm font-medium flex items-center space-x-2"
        >
          <i className="fas fa-arrow-left text-xs"></i>
          <span>Back to Discussions</span>
        </button>
      </div>

      {/* Main Discussion Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary dark:text-primaryLight">
              {courseCode} • {courseName}
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onAskAi(discussion)}
                className="text-xs text-black dark:text-white hover:underline font-medium flex items-center space-x-1"
              >
                <i className="fas fa-robot text-xs"></i>
                <span>Explain with AI</span>
              </button>

              <button
                onClick={() => onUpvote(discussion._id)}
                className="px-2.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-750 flex items-center space-x-1"
              >
                <i className="fas fa-arrow-up text-xs text-black dark:text-white"></i>
                <span>{discussion.upvotes}</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-user-content="true">
            {discussion.title}
          </h1>

          <div className="flex items-center mt-3 mb-4">
            <img
              src={discussion.author.avatar || DEFAULT_AVATAR}
              alt={discussion.author.firstName}
              className="w-8 h-8 rounded-full object-cover mr-2"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
            />
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {discussion.author.firstName} {discussion.author.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{discussion.createdAt}</p>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {discussion.content}
          </div>

          {discussion.tags && discussion.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {discussion.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center pt-4 border-t border-gray-200 dark:border-gray-700 space-x-4">
          <span><i className="far fa-comment mr-1"></i> {replies.length} replies</span>
          <span><i className="far fa-thumbs-up mr-1"></i> {discussion.upvotes} upvotes</span>
        </div>
      </div>

      {/* Replies List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {replies.length} Replies
        </h2>

        {/* Reply form */}
        <form onSubmit={handleReplySubmit} className="mb-6 space-y-3">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-xs font-semibold mb-1">
              Your Reply
            </label>
            <textarea
              rows={4}
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Provide an answer, code snippet, or clarification..."
              className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-semibold rounded-lg transition"
            >
              Post Reply
            </button>
          </div>
        </form>

        {/* Replies */}
        <div className="space-y-4">
          {replies.length > 0 ? (
            replies.map((reply) => (
              <div
                key={reply._id}
                className={`p-4 rounded-lg border text-xs leading-relaxed ${
                  reply.isAnswer
                    ? 'border-green-300 dark:border-green-800 bg-green-50/40 dark:bg-green-950/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <img
                      src={reply.author.avatar || DEFAULT_AVATAR}
                      alt={reply.author.firstName}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                      }}
                    />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {reply.author.firstName} {reply.author.lastName}
                    </span>
                    {reply.author.role === 'instructor' && (
                      <span className="px-1.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold">
                        Instructor
                      </span>
                    )}
                    {reply.isAnswer && (
                      <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold">
                        Verified Solution
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400">{reply.createdAt}</span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{reply.content}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">No replies yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
