import React, { useState } from 'react';
import { Course, Assignment, Resource, Discussion, DEFAULT_AVATAR } from '../types';

interface CourseDetailViewProps {
  course: Course;
  assignments: Assignment[];
  resources: Resource[];
  discussions: Discussion[];
  onBack: () => void;
  onEnroll: (courseId: string) => void;
  onAskAi: (course: Course) => void;
  onSelectAssignment: (assignment: Assignment) => void;
  onSelectResource?: (resourceId: string) => void;
  onSelectDiscussion?: (discussionId: string) => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  course,
  assignments,
  resources,
  discussions,
  onBack,
  onEnroll,
  onAskAi,
  onSelectAssignment,
  onSelectResource,
  onSelectDiscussion,
}) => {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'assignments' | 'resources' | 'discussions'>('syllabus');

  const courseAssignments = assignments.filter((a) => {
    const cId = typeof a.course === 'object' ? a.course._id : a.course;
    return cId === course._id;
  });

  const courseResources = resources.filter((r) => {
    const cId = typeof r.course === 'object' ? r.course._id : r.course;
    return cId === course._id;
  });

  const courseDiscussions = discussions.filter((d) => {
    const cId = typeof d.course === 'object' ? d.course._id : d.course;
    return cId === course._id;
  });

  return (
    <div className="fade-in space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="text-black dark:text-white hover:underline text-sm font-medium flex items-center space-x-1"
        >
          <i className="fas fa-arrow-left text-xs"></i>
          <span>Back to Courses</span>
        </button>
      </div>

      {/* Course Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div
          className="h-36 sm:h-44 bg-gradient-to-r p-6 flex flex-col justify-end text-white relative"
          style={{ backgroundColor: course.color || '#171717' }}
        >
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 bg-black bg-opacity-30 rounded text-xs font-mono font-bold">
              {course.code}
            </span>
            <span className="px-2.5 py-1 bg-black bg-opacity-20 rounded text-xs">
              {course.department}
            </span>
            <span className="px-2.5 py-1 bg-black bg-opacity-20 rounded text-xs">
              {course.semester}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{course.name}</h1>
        </div>

        {/* Info Strip */}
        <div className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <img
              src={course.instructor.avatar || DEFAULT_AVATAR}
              alt={course.instructor.firstName}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
            />
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                {course.instructor.firstName} {course.instructor.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{course.instructor.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onAskAi(course)}
              className="px-4 py-2 border border-black/30 dark:border-white/40 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-sm font-medium transition flex items-center space-x-2"
            >
              <i className="fas fa-robot text-xs"></i>
              <span>Ask Campus AI</span>
            </button>

            {!course.isEnrolled && (
              <button
                onClick={() => onEnroll(course._id)}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg text-sm font-medium transition"
              >
                Enroll in Course
              </button>
            )}
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
          <div className="flex space-x-6 overflow-x-auto text-sm font-medium">
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`py-3 border-b-2 whitespace-nowrap transition ${
                activeTab === 'syllabus'
                  ? 'border-black text-black dark:border-white dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Syllabus & Overview
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-3 border-b-2 whitespace-nowrap transition ${
                activeTab === 'assignments'
                  ? 'border-black text-black dark:border-white dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Assignments ({courseAssignments.length})
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-3 border-b-2 whitespace-nowrap transition ${
                activeTab === 'resources'
                  ? 'border-black text-black dark:border-white dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Lecture Materials ({courseResources.length})
            </button>
            <button
              onClick={() => setActiveTab('discussions')}
              className={`py-3 border-b-2 whitespace-nowrap transition ${
                activeTab === 'discussions'
                  ? 'border-black text-black dark:border-white dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Q&A ({courseDiscussions.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'syllabus' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-base text-gray-900 dark:text-white">Course Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{course.description}</p>

              <h3 className="font-semibold text-base text-gray-900 dark:text-white pt-4">Weekly Curriculum</h3>
              <div className="space-y-3">
                {course.syllabus?.map((s) => (
                  <div key={s.week} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="text-xs font-bold text-black dark:text-white">Week {s.week}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{s.topic}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-3">
              {courseAssignments.length > 0 ? (
                courseAssignments.map((a) => (
                  <div
                    key={a._id}
                    onClick={() => onSelectAssignment(a)}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">{a.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                      {a.points} pts
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No assignments currently scheduled for this course.</p>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-3">
              {courseResources.length > 0 ? (
                courseResources.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => onSelectResource && onSelectResource(r._id)}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition"
                  >
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-file-pdf text-red-500 text-xl"></i>
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{r.title}</h4>
                        <p className="text-xs text-gray-500">{r.fileSize} • {r.downloads} downloads</p>
                      </div>
                    </div>
                    <span className="text-xs text-primary dark:text-primaryLight font-medium">
                      View Details &rarr;
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No resources shared yet.</p>
              )}
            </div>
          )}

          {activeTab === 'discussions' && (
            <div className="space-y-3">
              {courseDiscussions.length > 0 ? (
                courseDiscussions.map((d) => (
                  <div
                    key={d._id}
                    onClick={() => onSelectDiscussion && onSelectDiscussion(d._id)}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">{d.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">by {d.author.firstName} {d.author.lastName} • {d.repliesCount} replies</p>
                    </div>
                    <span className="text-xs text-primary dark:text-primaryLight font-medium">
                      Join Discussion &rarr;
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No discussions posted yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
