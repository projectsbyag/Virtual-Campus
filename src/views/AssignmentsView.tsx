import React, { useState } from 'react';
import { Assignment, Course, User } from '../types';
import { CreateEditAssignmentModal, AssignmentDetailModal } from '../components/AssignmentModals';

interface AssignmentsViewProps {
  assignments: Assignment[];
  courses: Course[];
  currentUser: User;
  onRefreshData: () => Promise<void>;
  onAskAiHint: (assignment: Assignment) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  courses,
  currentUser,
  onRefreshData,
  onAskAiHint,
  onShowToast,
}) => {
  const isInstructorRole = currentUser.role === 'instructor' || currentUser.role === 'admin';

  const [studentTab, setStudentTab] = useState<'all' | 'pending' | 'missed' | 'submitted' | 'graded'>('all');
  const [instructorTab, setInstructorTab] = useState<'all' | 'active' | 'past_due' | 'to_grade'>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const relevantCourses = courses.filter((c) =>
    isInstructorRole ? Boolean(c.isTeaching || c.instructor?._id === currentUser._id) : Boolean(c.isEnrolled)
  );
  const relevantCourseIds = new Set(relevantCourses.map((c) => c._id));

  // Scope assignments to courses the user teaches (for instructors) or is enrolled in (for students)
  const roleScopedAssignments = assignments.filter((a) => {
    const cId = typeof a.course === 'object' ? a.course._id : a.course;
    if (currentUser.role === 'admin') return true;
    return relevantCourseIds.has(cId);
  });

  const nowMs = Date.now();

  const matchesCourseAndSearch = (a: Assignment) => {
    const cId = typeof a.course === 'object' ? a.course._id : a.course;
    const matchesCourse = courseFilter === 'all' || cId === courseFilter;
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCourse && matchesSearch;
  };

  const baseList = roleScopedAssignments.filter(matchesCourseAndSearch);

  const filtered = isInstructorRole
    ? baseList.filter((a) => {
        const isPast = new Date(a.dueDate).getTime() < nowMs;
        if (instructorTab === 'active') return !isPast;
        if (instructorTab === 'past_due') return isPast;
        if (instructorTab === 'to_grade') return (a.ungradedCount || 0) > 0;
        return true;
      })
    : baseList.filter((a) => {
        if (studentTab === 'all') return true;
        return a.status === studentTab;
      });

  return (
    <div className="fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">Assignments</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isInstructorRole
              ? 'Publish new coursework, monitor deadlines, and grade student submissions.'
              : 'Track due dates, submit deliverables, and review instructor feedback.'}
          </p>
        </div>

        {isInstructorRole && (
          <button
            onClick={() => {
              setEditingAssignment(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl transition text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <i className="fas fa-plus"></i>
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Role-Specific Filter Tabs */}
      <div className="mb-6 border-b border-neutral-200 dark:border-neutral-800">
        {isInstructorRole ? (
          <div className="flex overflow-x-auto gap-2">
            {(
              [
                ['all', `All (${baseList.length})`],
                ['active', `Active (${baseList.filter((a) => new Date(a.dueDate).getTime() >= nowMs).length})`],
                ['past_due', `Past Due (${baseList.filter((a) => new Date(a.dueDate).getTime() < nowMs).length})`],
                ['to_grade', `Needs Grading (${baseList.filter((a) => (a.ungradedCount || 0) > 0).length})`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setInstructorTab(key)}
                className={`px-4 py-2.5 border-b-2 font-bold text-sm whitespace-nowrap transition ${
                  instructorTab === key
                    ? 'border-black text-black dark:border-white dark:text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-2">
            {(
              [
                ['all', `All (${baseList.length})`],
                ['pending', `Upcoming (${baseList.filter((a) => a.status === 'pending').length})`],
                ['missed', `Missed (${baseList.filter((a) => a.status === 'missed').length})`],
                ['submitted', `Submitted (${baseList.filter((a) => a.status === 'submitted').length})`],
                ['graded', `Graded (${baseList.filter((a) => a.status === 'graded').length})`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStudentTab(key)}
                className={`px-4 py-2.5 border-b-2 font-bold text-sm whitespace-nowrap transition ${
                  studentTab === key
                    ? 'border-black text-black dark:border-white dark:text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search & Course Filter */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search assignments by title or instructions..."
            className="pl-10 pr-4 py-2.5 w-full text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-neutral-900 text-black dark:text-white"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5">
            <i className="fas fa-search text-neutral-400 text-xs"></i>
          </div>
        </div>

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-4 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-black dark:text-white"
        >
          <option value="all">All Courses</option>
          {relevantCourses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Assignments List */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((assignment) => {
            const course = typeof assignment.course === 'object' ? assignment.course : null;
            const courseName = course ? course.name : assignment.courseName || 'Course';
            const courseCode = course ? course.code : assignment.courseCode || 'CRS';
            const pointsPossible = assignment.pointsPossible ?? assignment.points ?? 100;

            const dueDate = new Date(assignment.dueDate);
            const diffDays = Math.ceil((dueDate.getTime() - nowMs) / 86400000);
            const totalSubs = assignment.submissions?.length || 0;
            const ungraded = assignment.ungradedCount || 0;

            return (
              <div
                key={assignment._id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-black dark:hover:border-white transition"
              >
                <div className="flex-1 space-y-2 cursor-pointer" onClick={() => setSelectedAssignment(assignment)}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs rounded-md font-black bg-black text-white dark:bg-white dark:text-black">
                      {courseCode}
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">{courseName}</span>
                    <span className="text-xs text-neutral-500">• {pointsPossible} Points</span>
                    {isInstructorRole && ungraded > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[11px] font-bold">
                        {ungraded} to grade
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-black dark:text-white hover:underline">
                    {assignment.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl line-clamp-2">
                    {assignment.description}
                  </p>

                  {!isInstructorRole && assignment.status === 'graded' && assignment.grade !== undefined && (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                      <span className="font-bold">
                        Score: {assignment.grade} / {pointsPossible} ({((assignment.grade / pointsPossible) * 100).toFixed(1)}%)
                      </span>
                      {assignment.feedback && <span className="ml-2">— "{assignment.feedback}"</span>}
                    </div>
                  )}
                </div>

                {/* Right Controls */}
                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100 dark:border-neutral-800">
                  <div className="text-left md:text-right">
                    <div
                      className={`font-bold text-xs ${
                        !isInstructorRole && diffDays <= 1 && assignment.status === 'pending'
                          ? 'text-red-500'
                          : 'text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      Due: {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-xs text-neutral-500 capitalize">
                      {isInstructorRole ? `${totalSubs} submissions` : assignment.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAskAiHint(assignment)}
                      className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <i className="fas fa-robot text-xs"></i>
                      <span>AI Hint</span>
                    </button>

                    {isInstructorRole ? (
                      <>
                        <button
                          onClick={() => {
                            setEditingAssignment(assignment);
                            setShowCreateModal(true);
                          }}
                          className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setSelectedAssignment(assignment)}
                          className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl text-xs font-bold transition"
                        >
                          Submissions ({totalSubs})
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl text-xs font-bold transition"
                      >
                        {assignment.status === 'pending' || (assignment.status === 'missed' && assignment.allowLateSubmissions)
                          ? 'Turn In'
                          : 'View Details'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 text-center space-y-2">
          <i className="fas fa-tasks text-2xl text-neutral-400"></i>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No assignments match your current filters.
          </p>
        </div>
      )}

      {/* Create / Edit Assignment Modal */}
      <CreateEditAssignmentModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingAssignment(null);
        }}
        courses={courses}
        currentUser={currentUser}
        editingAssignment={editingAssignment}
        onSaved={async () => {
          await onRefreshData();
        }}
        onShowToast={onShowToast}
      />

      {/* Detail / Student Turn-In / Instructor Grading Modal */}
      <AssignmentDetailModal
        assignment={selectedAssignment}
        currentUser={currentUser}
        courses={courses}
        onClose={() => setSelectedAssignment(null)}
        onRefresh={onRefreshData}
        onEditAssignment={(a) => {
          setEditingAssignment(a);
          setShowCreateModal(true);
        }}
        onAskAiHint={onAskAiHint}
        onShowToast={onShowToast}
      />
    </div>
  );
};
