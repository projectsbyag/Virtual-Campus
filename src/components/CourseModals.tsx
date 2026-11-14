import React, { useState } from 'react';
import { Course, User, DEFAULT_AVATAR } from '../types';
import { apiService } from '../services/api';

const COURSE_COLORS = [
  '#171717',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#6366F1',
  '#14B8A6',
  '#F97316',
];

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COURSE_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !code.trim()) {
      setError('Course name and course code are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.createCourse({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        color,
      });
      onShowToast('Course created successfully!', 'success');
      setName('');
      setCode('');
      setDescription('');
      await onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-5">
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white">Create New Course</h3>
            <p className="text-xs text-neutral-500">Launch a new course workspace with an auto-generated enrollment code.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Course Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Distributed Systems & Consensus"
              className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Course Code *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CSC412"
              className="w-full px-3.5 py-2.5 text-sm font-mono uppercase border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline learning objectives, prerequisites, and syllabus scope..."
              className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
              Banner Color Accent
            </label>
            <div className="grid grid-cols-5 gap-2.5">
              {COURSE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-10 rounded-xl transition ${
                    color === c ? 'ring-2 ring-offset-2 ring-black dark:ring-white dark:ring-offset-neutral-900 scale-95' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold disabled:opacity-60"
            >
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EnrollCourseModalProps {
  course: Course | null;
  currentUser: User | null;
  onClose: () => void;
  onEnrolled: (courseId: string) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const EnrollCourseModal: React.FC<EnrollCourseModalProps> = ({
  course,
  currentUser,
  onClose,
  onEnrolled,
  onShowToast,
}) => {
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!course) return null;

  const isInstructorBlocked = Boolean(
    currentUser &&
      (currentUser.role === 'instructor' ||
        currentUser.role === 'admin' ||
        course.isTeaching ||
        course.instructor?._id === currentUser._id)
  );
  const isDisabledCourse = course.isArchived || course.allowEnrollment === false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isInstructorBlocked) {
      setError('Instructors cannot enroll in courses as students.');
      return;
    }
    if (!enrollmentCode.trim()) {
      setError('Please enter the course enrollment code.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.enrollCourse(course._id, enrollmentCode.trim());
      onShowToast(`Successfully enrolled in ${course.code}!`, 'success');
      setEnrollmentCode('');
      await onEnrolled(course._id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Invalid enrollment code or permission denied.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-bold text-black dark:text-white">Enroll in Course</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white flex items-center justify-center"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div>
          <p className="text-sm font-bold text-black dark:text-white">
            {course.name} ({course.code})
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            Instructor: {course.instructor.firstName} {course.instructor.lastName}
          </p>
        </div>

        {isInstructorBlocked ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
            <i className="fas fa-ban mr-2"></i>
            Role constraint: Instructors and administrators cannot enroll in courses as students.
          </div>
        ) : isDisabledCourse ? (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
            <i className="fas fa-lock mr-2"></i>
            {course.isArchived
              ? 'This course is archived and read-only.'
              : 'New student enrollment is currently closed for this course.'}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Enrollment Code *
              </label>
              <input
                type="text"
                required
                value={enrollmentCode}
                onChange={(e) => setEnrollmentCode(e.target.value)}
                placeholder="Enter 6-character code provided by instructor"
                className="w-full px-3.5 py-2.5 text-sm font-mono border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold disabled:opacity-60"
              >
                {isSubmitting ? 'Enrolling...' : 'Enroll'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

interface CoursePreviewModalProps {
  course: Course | null;
  currentUser: User | null;
  onClose: () => void;
  onOpenEnroll: (course: Course) => void;
  onEnterCourse: (courseId: string) => void;
}

export const CoursePreviewModal: React.FC<CoursePreviewModalProps> = ({
  course,
  currentUser,
  onClose,
  onOpenEnroll,
  onEnterCourse,
}) => {
  if (!course) return null;

  const isInstructorRole = currentUser?.role === 'instructor' || currentUser?.role === 'admin';
  const isOwner = Boolean(
    currentUser && (course.isTeaching || course.instructor?._id === currentUser._id)
  );
  const canStudentEnroll =
    !isInstructorRole &&
    !course.isEnrolled &&
    !course.isArchived &&
    course.allowEnrollment !== false;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div
          className="h-36 p-6 flex items-end justify-between text-white relative"
          style={{ backgroundColor: course.color || '#171717' }}
        >
          <span className="px-2.5 py-1 rounded bg-black/40 text-xs font-mono font-bold">
            {course.code}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-black/30 hover:bg-black/50 text-white flex items-center justify-center"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-xl font-black text-black dark:text-white">{course.name}</h3>
            <p className="text-xs text-neutral-500 mt-1">
              {course.studentsCount || 0} students enrolled
              {course.isArchived ? ' • Archived' : course.allowEnrollment === false ? ' • Enrollment Closed' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <img
              src={course.instructor.avatar || DEFAULT_AVATAR}
              alt={course.instructor.firstName}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
            />
            <div>
              <p className="text-sm font-bold text-black dark:text-white">
                {course.instructor.firstName} {course.instructor.lastName}
              </p>
              <p className="text-xs text-neutral-500">Course Instructor</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
              About This Course
            </h4>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {course.description || 'No description provided for this course.'}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
            >
              Close
            </button>
            {(course.isEnrolled || isOwner) ? (
              <button
                onClick={() => {
                  onClose();
                  onEnterCourse(course._id);
                }}
                className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold"
              >
                Open Course
              </button>
            ) : canStudentEnroll ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenEnroll(course);
                }}
                className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold"
              >
                Enroll in Course
              </button>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-500">
                {isInstructorRole ? 'Instructor Catalog Preview' : 'Enrollment Closed'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
