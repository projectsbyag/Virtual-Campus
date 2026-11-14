import React, { useState } from 'react';
import { Course, User } from '../types';
import { CreateCourseModal, EnrollCourseModal, CoursePreviewModal } from '../components/CourseModals';

interface CoursesViewProps {
  courses: Course[];
  currentUser: User | null;
  onSelectCourse: (courseId: string) => void;
  onRefreshData: () => Promise<void>;
  onAskAiCourse: (course: Course) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  currentUser,
  onSelectCourse,
  onRefreshData,
  onAskAiCourse,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'my' | 'available'>('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'code'>('name');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [enrollTargetCourse, setEnrollTargetCourse] = useState<Course | null>(null);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  const isInstructorRole = currentUser?.role === 'instructor' || currentUser?.role === 'admin';

  // Enforce strict RBAC separation: instructors/admins own `isTeaching`, students own `isEnrolled`
  const myCourses = courses.filter((c) => {
    if (isInstructorRole) {
      return Boolean(c.isTeaching || (currentUser && c.instructor?._id === currentUser._id));
    }
    return Boolean(c.isEnrolled);
  });

  // Catalog excludes already enrolled courses AND courses taught by the current user
  const availableCourses = courses.filter((c) => {
    const isMine = currentUser && (c.isTeaching || c.instructor?._id === currentUser._id);
    return !c.isEnrolled && !isMine;
  });

  const displayedList = activeTab === 'my' ? myCourses : availableCourses;

  const filteredCourses = displayedList
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.code.localeCompare(b.code);
    });

  const handleCardOpen = (course: Course) => {
    const isOwner = Boolean(course.isTeaching || (currentUser && course.instructor?._id === currentUser._id));
    if (course.isEnrolled || isOwner) {
      onSelectCourse(course._id);
    } else {
      setPreviewCourse(course);
    }
  };

  return (
    <div className="fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">Courses</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isInstructorRole
              ? 'Create courses, manage student rosters, and configure enrollment codes & invite links.'
              : 'Access your enrolled classes or browse the catalog to join with an enrollment code.'}
          </p>
        </div>
        {isInstructorRole && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl transition text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <i className="fas fa-plus"></i>
            <span>Create Course</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2.5 border-b-2 font-bold text-sm whitespace-nowrap transition ${
              activeTab === 'my'
                ? 'border-black text-black dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            {isInstructorRole ? `My Taught Courses (${myCourses.length})` : `My Courses (${myCourses.length})`}
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2.5 border-b-2 font-bold text-sm whitespace-nowrap transition ${
              activeTab === 'available'
                ? 'border-black text-black dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Available Catalog ({availableCourses.length})
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
            placeholder="Search courses by name, code, or description..."
            className="pl-10 pr-4 py-2.5 w-full text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-neutral-900 text-black dark:text-white"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5">
            <i className="fas fa-search text-neutral-400 text-xs"></i>
          </div>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-neutral-900 text-black dark:text-white"
        >
          <option value="name">Sort by: Name</option>
          <option value="code">Sort by: Course Code</option>
        </select>
      </div>

      {/* Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isOwner = Boolean(
              course.isTeaching || (currentUser && course.instructor?._id === currentUser._id)
            );
            const canStudentEnroll =
              !isInstructorRole &&
              !course.isEnrolled &&
              !course.isArchived &&
              course.allowEnrollment !== false;

            return (
              <div
                key={course._id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden hover:border-black dark:hover:border-white transition flex flex-col justify-between"
              >
                <div onClick={() => handleCardOpen(course)} className="cursor-pointer">
                  <div
                    className="h-32 relative flex items-end p-4"
                    style={{ backgroundColor: course.color || '#171717' }}
                  >
                    <span className="px-2.5 py-1 bg-black/45 text-white rounded-md text-xs font-mono font-bold">
                      {course.code}
                    </span>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {course.isArchived && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full">
                          Archived
                        </span>
                      )}
                      {isOwner ? (
                        <span className="px-2.5 py-0.5 bg-white/95 text-black text-[11px] font-bold rounded-full">
                          Teaching
                        </span>
                      ) : course.isEnrolled ? (
                        <span className="px-2.5 py-0.5 bg-white/95 text-emerald-700 text-[11px] font-bold rounded-full">
                          Enrolled
                        </span>
                      ) : course.allowEnrollment === false ? (
                        <span className="px-2.5 py-0.5 bg-neutral-900/80 text-white text-[11px] font-bold rounded-full">
                          Closed
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="p-5 pb-3">
                    <h3 className="font-bold text-base mb-1 text-black dark:text-white line-clamp-1">
                      {course.name}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {course.description || 'Syllabus modules, lecture notes, and assignments.'}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-2">
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="truncate max-w-[160px]">
                      <i className="fas fa-user-tie mr-1.5"></i>
                      {course.instructor
                        ? `${course.instructor.firstName} ${course.instructor.lastName}`
                        : 'Instructor'}
                    </span>
                    <span className="font-mono">
                      <i className="fas fa-users mr-1"></i> {course.studentsCount || 0}
                    </span>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onAskAiCourse(course)}
                      className="text-xs text-black dark:text-white hover:underline font-bold flex items-center gap-1"
                    >
                      <i className="fas fa-robot text-xs"></i>
                      <span>AI Course Prep</span>
                    </button>

                    {isOwner ? (
                      <button
                        onClick={() => onSelectCourse(course._id)}
                        className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl text-xs font-bold transition"
                      >
                        Manage Course
                      </button>
                    ) : course.isEnrolled ? (
                      <button
                        onClick={() => onSelectCourse(course._id)}
                        className="px-3.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-xl text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                      >
                        Open Course
                      </button>
                    ) : isInstructorRole ? (
                      <button
                        onClick={() => setPreviewCourse(course)}
                        className="px-3.5 py-1.5 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      >
                        Preview
                      </button>
                    ) : canStudentEnroll ? (
                      <button
                        onClick={() => setEnrollTargetCourse(course)}
                        className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl text-xs font-bold transition"
                      >
                        Enroll Now
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-xl text-xs font-semibold">
                        {course.isArchived ? 'Archived' : 'Closed'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 text-center space-y-3">
          <i className="fas fa-book-open text-2xl text-neutral-400"></i>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">
            {activeTab === 'my'
              ? isInstructorRole
                ? 'You are not teaching any courses yet.'
                : 'You are not enrolled in any courses yet. Switch to Available Catalog to enroll.'
              : 'No additional catalog courses found.'}
          </p>
          {activeTab === 'my' && isInstructorRole && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold"
            >
              Create Your First Course
            </button>
          )}
          {activeTab === 'my' && !isInstructorRole && availableCourses.length > 0 && (
            <button
              onClick={() => setActiveTab('available')}
              className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold"
            >
              Browse Available Catalog
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={onRefreshData}
        onShowToast={onShowToast}
      />

      <EnrollCourseModal
        course={enrollTargetCourse}
        currentUser={currentUser}
        onClose={() => setEnrollTargetCourse(null)}
        onEnrolled={async (courseId) => {
          await onRefreshData();
          onSelectCourse(courseId);
        }}
        onShowToast={onShowToast}
      />

      <CoursePreviewModal
        course={previewCourse}
        currentUser={currentUser}
        onClose={() => setPreviewCourse(null)}
        onOpenEnroll={(c) => setEnrollTargetCourse(c)}
        onEnterCourse={onSelectCourse}
      />
    </div>
  );
};
