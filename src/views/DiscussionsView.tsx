import React, { useState } from 'react';
import { Discussion, Course } from '../types';

interface DiscussionsViewProps {
  discussions: Discussion[];
  courses: Course[];
  onUpvote: (id: string) => void;
  onCreateDiscussion: (title: string, content: string, courseId: string) => void;
  onAddReply: (discussionId: string, content: string) => void;
  onAskAiDiscussion: (discussion: Discussion) => void;
  selectedDiscussionId: string | null;
  onSelectDiscussion: (id: string | null) => void;
}

export const DiscussionsView: React.FC<DiscussionsViewProps> = ({
  discussions,
  courses,
  onUpvote,
  onCreateDiscussion,
  onAddReply,
  onAskAiDiscussion,
  selectedDiscussionId,
  onSelectDiscussion,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [replyInput, setReplyInput] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?._id || '');

  const filtered = discussions.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDiscussion = discussions.find((d) => d._id === selectedDiscussionId);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateDiscussion(title.trim(), content.trim(), courseId);
    setIsCreateOpen(false);
    setTitle('');
    setContent('');
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedDiscussionId) return;

    onAddReply(selectedDiscussionId, replyInput.trim());
    setReplyInput('');
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discussions</h1>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="mt-2 sm:mt-0 px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg transition text-sm font-medium flex items-center space-x-2"
        >
          <i className="fas fa-plus text-xs"></i>
          <span>New Discussion</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search discussions..."
          className="pl-10 pr-4 py-2 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <i className="fas fa-search text-gray-400"></i>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map((d) => {
          const course = typeof d.course === 'object' ? d.course : null;
          const courseCode = course ? course.code : '';
          const courseColor = course ? course.color || '#5D5CDE' : '#5D5CDE';

          return (
            <div
              key={d._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 flex items-start space-x-4"
            >
              {/* Upvote button */}
              <button
                onClick={() => onUpvote(d._id)}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 min-w-10"
              >
                <i className="fas fa-arrow-up text-xs"></i>
                <span className="text-xs font-bold mt-0.5">{d.upvotes}</span>
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className="px-2 py-0.5 text-xs rounded-full font-medium"
                    style={{
                      backgroundColor: `${courseColor}25`,
                      color: courseColor,
                    }}
                  >
                    {courseCode}
                  </span>
                  <span className="text-xs text-gray-400">• {d.createdAt}</span>
                  {d.solved && (
                    <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Solved
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => onSelectDiscussion(d._id)}
                  className="font-semibold text-base text-gray-900 dark:text-white hover:text-primary dark:hover:text-primaryLight cursor-pointer transition"
                  data-user-content="true"
                >
                  {d.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {d.content}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span>by {d.author.firstName} {d.author.lastName}</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onAskAiDiscussion(d)}
                      className="text-black dark:text-white hover:underline font-medium flex items-center space-x-1"
                    >
                      <i className="fas fa-robot text-xs"></i>
                      <span>AI Answer Helper</span>
                    </button>
                    <button
                      onClick={() => onSelectDiscussion(d._id)}
                      className="hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <i className="fas fa-comment-alt mr-1"></i> {d.repliesCount} replies
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Discussion Details Modal */}
      {selectedDiscussion && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedDiscussion.title}</h3>
              <button onClick={() => onSelectDiscussion(null)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-2">
              Posted by {selectedDiscussion.author.firstName} {selectedDiscussion.author.lastName} • {selectedDiscussion.createdAt}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">
              {selectedDiscussion.content}
            </p>

            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Replies</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {selectedDiscussion.replies && selectedDiscussion.replies.length > 0 ? (
                selectedDiscussion.replies.map((rep) => (
                  <div key={rep._id} className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg text-xs">
                    <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      <span>{rep.author.firstName} {rep.author.lastName}</span>
                      <span className="text-gray-400 font-normal">{rep.createdAt}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{rep.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No replies yet. Be the first to chime in!</p>
              )}
            </div>

            <form onSubmit={handleReplySubmit} className="flex gap-2">
              <input
                type="text"
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-medium rounded-lg"
              >
                Reply
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Start New Discussion</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.code}: {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Question on Bellman-Ford Negative Cycles"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Question / Details</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Explain your question in detail..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg transition"
                >
                  Post Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
