import React, { useState } from 'react';
import { Course, User } from '../types';

interface CoursesViewProps {
  courses: Course[];
  currentUser: User | null;
  onSelectCourse: (courseId: string) => void;
  onEnroll: (courseId: string) => void;
  onAskAiCourse: (course: Course) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  currentUser,
  onSelectCourse,
  onEnroll,
  onAskAiCourse,
}) => {
  const [activeTab, setActiveTab] = useState<'my' | 'available'>('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'code'>('name');

  const myCourses = courses.filter((c) => c.isEnrolled);
  const availableCourses = courses.filter((c) => !c.isEnrolled);

  const displayedList = activeTab === 'my' ? myCourses : availableCourses;

  const filteredCourses = displayedList
    .filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.code.localeCompare(b.code);
    });

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
        {currentUser?.role === 'instructor' && (
          <button className="mt-2 sm:mt-0 px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg transition text-sm font-medium">
            <i className="fas fa-plus mr-1"></i> Create Course
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('my')}
            className={`course-tab px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition ${
              activeTab === 'my'
                ? 'border-black text-black dark:border-white dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            My Courses ({myCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`course-tab px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition ${
              activeTab === 'available'
                ? 'border-black text-black dark:border-white dark:text-white'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Available Courses ({availableCourses.length})
          </button>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses..."
            className="pl-10 pr-4 py-2 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <i className="fas fa-search text-gray-400"></i>
          </div>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        >
          <option value="name">Sort by: Name</option>
          <option value="code">Sort by: Course Code</option>
        </select>
      </div>

      {/* Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer course-card flex flex-col justify-between"
            >
              <div onClick={() => onSelectCourse(course._id)}>
                <div
                  className="h-32 bg-gradient-to-r relative"
                  style={{ backgroundColor: course.color || '#5D5CDE' }}
                >
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="px-2 py-1 bg-black bg-opacity-30 rounded text-xs font-mono font-bold">
                      {course.code}
                    </span>
                  </div>
                  {course.isEnrolled && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 text-xs font-medium rounded text-emerald-600 dark:text-emerald-400">
                      Enrolled
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white" data-user-content="true">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="truncate max-w-[150px]">
                    <i className="fas fa-user-graduate mr-1"></i>
                    {course.instructor
                      ? `${course.instructor.firstName} ${course.instructor.lastName}`
                      : 'Instructor'}
                  </span>
                  <span>
                    <i className="fas fa-users mr-1"></i> {course.studentsCount || 0}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onAskAiCourse(course)}
                    className="text-xs text-black dark:text-white hover:underline font-medium flex items-center gap-1"
                  >
                    <i className="fas fa-robot text-xs"></i>
                    <span>AI Course Prep</span>
                  </button>

                  {!course.isEnrolled ? (
                    <button
                      onClick={() => onEnroll(course._id)}
                      className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg text-xs font-medium transition"
                    >
                      Enroll Now
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectCourse(course._id)}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-750 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-medium hover:bg-gray-200 transition"
                    >
                      View Course
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">No courses found matching your query.</p>
        </div>
      )}
    </div>
  );
};
