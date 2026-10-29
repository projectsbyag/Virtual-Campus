import React, { useState } from 'react';
import { User, Course, Assignment, Discussion, ActiveView } from '../types';

interface DashboardViewProps {
  currentUser: User;
  courses: Course[];
  assignments: Assignment[];
  discussions: Discussion[];
  setCurrentView: (view: ActiveView, params?: any) => void;
  onSelectCourse: (courseId: string) => void;
  onSelectAssignment: (assignment: Assignment) => void;
  onSelectDiscussion: (discussionId: string) => void;
  onAskAiPrompt: (prompt: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  courses,
  assignments,
  discussions,
  setCurrentView,
  onSelectCourse,
  onSelectAssignment,
  onSelectDiscussion,
  onAskAiPrompt,
}) => {
  const [aiPromptText, setAiPromptText] = useState('');
  const enrolledCourses = courses.filter((c) => c.isEnrolled);
  const upcomingAssignments = assignments.filter((a) => a.status === 'pending');

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptText.trim()) return;
    onAskAiPrompt(aiPromptText.trim());
    setCurrentView('campus-ai');
  };

  return (
    <div className="fade-in">
      {/* Welcome Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back, {currentUser.firstName}!</p>
        <hr className="my-4 border-gray-200 dark:border-gray-700" />
      </div>

      {/* Campus AI Study Banner (Seamless integration in former design language) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-8 border-l-4 border-black dark:border-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <i className="fas fa-robot text-black dark:text-white text-xl"></i>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Campus AI Study Assistant</h2>
            <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-bold px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <button
            onClick={() => setCurrentView('campus-ai')}
            className="text-xs text-black dark:text-white hover:underline font-medium self-start sm:self-auto"
          >
            Open Full AI Chat →
          </button>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          Ask questions about your courses, generate midterm practice questions, or get hints on problem sets:
        </p>

        <form onSubmit={handleAiSubmit} className="flex gap-2">
          <input
            type="text"
            value={aiPromptText}
            onChange={(e) => setAiPromptText(e.target.value)}
            placeholder="e.g. Explain how Bellman-Ford detects negative cycles in CSC 301..."
            className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black rounded-lg text-sm font-medium transition flex items-center space-x-2 shrink-0"
          >
            <i className="fas fa-paper-plane text-xs"></i>
            <span>Ask AI</span>
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              onAskAiPrompt('Explain how Bellman-Ford detects negative cycles in graphs');
              setCurrentView('campus-ai');
            }}
            className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-750 hover:bg-gray-200 text-gray-700 dark:text-gray-300"
          >
            💡 Bellman-Ford cycle test
          </button>
          <button
            type="button"
            onClick={() => {
              onAskAiPrompt('Generate an exam practice quiz for CSC 301 Algorithms');
              setCurrentView('campus-ai');
            }}
            className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-750 hover:bg-gray-200 text-gray-700 dark:text-gray-300"
          >
            🎯 Midterm practice quiz
          </button>
          <button
            type="button"
            onClick={() => {
              onAskAiPrompt('Break down the Transformer Self-Attention formula');
              setCurrentView('campus-ai');
            }}
            className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-750 hover:bg-gray-200 text-gray-700 dark:text-gray-300"
          >
            🧠 Transformer self-attention
          </button>
        </div>
      </div>

      {/* My Courses Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Courses</h2>
          <button
            onClick={() => setCurrentView('courses')}
            className="text-black dark:text-white hover:underline text-sm font-medium"
          >
            View All
          </button>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.slice(0, 6).map((course) => (
              <div
                key={course._id}
                onClick={() => onSelectCourse(course._id)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer course-card"
              >
                <div
                  className="h-20 bg-gradient-to-r"
                  style={{ backgroundColor: course.color || '#5D5CDE' }}
                ></div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white truncate" data-user-content="true">
                    {course.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2 py-1 text-xs rounded-full font-medium"
                      style={{
                        backgroundColor: `${course.color || '#5D5CDE'}25`,
                        color: course.color || '#5D5CDE',
                      }}
                    >
                      {course.code}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {course.instructor
                        ? `${course.instructor.firstName} ${course.instructor.lastName}`
                        : 'Instructor'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Explore more courses card */}
            <div
              onClick={() => setCurrentView('courses')}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer flex items-center justify-center h-40 border-2 border-dashed border-gray-300 dark:border-gray-700"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-plus text-black dark:text-white"></i>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Explore more courses</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-book text-black dark:text-white text-2xl"></i>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">No Courses Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">You are not enrolled in any courses yet.</p>
            <button
              onClick={() => setCurrentView('courses')}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black rounded-lg transition text-sm"
            >
              Browse Courses
            </button>
          </div>
        )}
      </div>

      <hr className="my-4 border-gray-200 dark:border-gray-700" />

      {/* Two Column Layout for Assignments and Discussions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Assignments */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Assignments</h2>
            <button
              onClick={() => setCurrentView('assignments')}
              className="text-black dark:text-white hover:underline text-sm font-medium"
            >
              View All
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
            {upcomingAssignments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => {
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
                      onClick={() => onSelectAssignment(assignment)}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm" data-user-content="true">
                            {assignment.title}
                          </h3>
                          <div className="flex items-center mt-1">
                            <span
                              className="px-2 py-0.5 text-xs rounded-full font-medium"
                              style={{
                                backgroundColor: `${courseColor}25`,
                                color: courseColor,
                              }}
                            >
                              {courseCode}
                            </span>
                            <span className="mx-2 text-xs text-gray-500 dark:text-gray-400">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                              {courseName}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`font-medium text-xs ${
                              daysLeft <= 1 ? 'text-red-500 font-bold' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div
                            className={`text-xs ${
                              daysLeft <= 1 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {daysLeft <= 0 ? 'Due today' : daysLeft === 1 ? 'Due tomorrow' : `${daysLeft} days left`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-check text-green-500 text-xl"></i>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">You're all caught up!</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No upcoming assignments due.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Discussions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Discussions</h2>
            <button
              onClick={() => setCurrentView('discussions')}
              className="text-black dark:text-white hover:underline text-sm font-medium"
            >
              View All
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
            {discussions.length > 0 ? (
              <div className="space-y-4">
                {discussions.slice(0, 5).map((discussion) => {
                  const course = typeof discussion.course === 'object' ? discussion.course : null;
                  const courseName = course ? course.name : 'Course';
                  const courseCode = course ? course.code : '';
                  const courseColor = course ? course.color || '#5D5CDE' : '#5D5CDE';

                  return (
                    <div
                      key={discussion._id}
                      onClick={() => onSelectDiscussion(discussion._id)}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1" data-user-content="true">
                          {discussion.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 ml-2">
                          {discussion.createdAt}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span
                          className="px-2 py-0.5 text-xs rounded-full font-medium"
                          style={{
                            backgroundColor: `${courseColor}25`,
                            color: courseColor,
                          }}
                        >
                          {courseCode}
                        </span>
                        <span className="mx-2 text-xs text-gray-500 dark:text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          by {discussion.author.firstName} {discussion.author.lastName}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">
                        {discussion.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-comments text-gray-400 text-xl"></i>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">No discussions yet</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Start a discussion in your courses.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
