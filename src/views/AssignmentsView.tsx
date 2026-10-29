import React, { useState } from 'react';
import { Assignment } from '../types';

interface AssignmentsViewProps {
  assignments: Assignment[];
  onSubmitAssignment: (assignmentId: string, fileName: string) => void;
  onAskAiHint: (assignment: Assignment) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  onSubmitAssignment,
  onAskAiHint,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [submitModalAssignment, setSubmitModalAssignment] = useState<Assignment | null>(null);
  const [fileName, setFileName] = useState('');

  const filtered = assignments.filter((a) => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitModalAssignment) return;
    const file = fileName.trim() || 'assignment_solution.zip';
    onSubmitAssignment(submitModalAssignment._id, file);
    setSubmitModalAssignment(null);
    setFileName('');
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto">
          {(['all', 'pending', 'submitted', 'graded'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 border-b-2 font-medium text-sm capitalize whitespace-nowrap transition ${
                filter === tab
                  ? 'border-black text-black dark:border-white dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab} ({tab === 'all' ? assignments.length : assignments.filter((a) => a.status === tab).length})
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search assignments..."
          className="pl-10 pr-4 py-2 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <i className="fas fa-search text-gray-400"></i>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filtered.map((assignment) => {
          const course = typeof assignment.course === 'object' ? assignment.course : null;
          const courseName = course ? course.name : 'Course';
          const courseCode = course ? course.code : '';
          const courseColor = course ? course.color || '#5D5CDE' : '#5D5CDE';

          const dueDate = new Date(assignment.dueDate);
          const now = new Date();
          const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div
              key={assignment._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-2 py-0.5 text-xs rounded-full font-medium"
                    style={{
                      backgroundColor: `${courseColor}25`,
                      color: courseColor,
                    }}
                  >
                    {courseCode}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{courseName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">• {assignment.points} Points</span>
                </div>

                <h3 className="text-base font-semibold text-gray-900 dark:text-white" data-user-content="true">
                  {assignment.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                  {assignment.description}
                </p>

                {assignment.feedback && (
                  <div className="mt-2 p-2.5 rounded bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-xs text-green-800 dark:text-green-300">
                    <span className="font-semibold">Instructor Feedback: </span>
                    {assignment.feedback} (Grade: {assignment.grade}%)
                  </div>
                )}
              </div>

              {/* Status & Actions */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-700">
                <div className="text-right">
                  <div
                    className={`font-medium text-xs ${
                      daysLeft <= 1 && assignment.status === 'pending'
                        ? 'text-red-500 font-bold'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Due: {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">{assignment.status}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAskAiHint(assignment)}
                    className="px-3 py-1.5 border border-black/30 dark:border-white/40 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-xs font-medium transition flex items-center space-x-1"
                  >
                    <i className="fas fa-robot text-xs"></i>
                    <span>AI Hint</span>
                  </button>

                  {assignment.status === 'pending' && (
                    <button
                      onClick={() => setSubmitModalAssignment(assignment)}
                      className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg text-xs font-medium transition"
                    >
                      Turn In
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Modal */}
      {submitModalAssignment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Submit Assignment</h3>
              <button
                onClick={() => setSubmitModalAssignment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Submitting for <span className="font-semibold text-gray-800 dark:text-gray-200">{submitModalAssignment.title}</span>
            </p>

            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upload Assignment File / Archive Name
                </label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. csc301_assignment4_alex.zip"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalAssignment(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg transition"
                >
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
