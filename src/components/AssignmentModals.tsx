import React, { useState, useEffect } from 'react';
import { Assignment, AssignmentSubmission, Course, User, DEFAULT_AVATAR } from '../types';
import { apiService } from '../services/api';

interface CreateEditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  currentUser: User;
  initialCourseId?: string;
  editingAssignment?: Assignment | null;
  onSaved: (saved: Assignment, isEdit: boolean) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const CreateEditAssignmentModal: React.FC<CreateEditAssignmentModalProps> = ({
  isOpen,
  onClose,
  courses,
  currentUser,
  initialCourseId,
  editingAssignment,
  onSaved,
  onShowToast,
}) => {
  const teachableCourses = courses.filter(
    (c) => currentUser.role === 'admin' || c.isTeaching || c.instructor?._id === currentUser._id
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [pointsPossible, setPointsPossible] = useState(100);
  const [submissionType, setSubmissionType] = useState<'both' | 'text' | 'file'>('both');
  const [allowLateSubmissions, setAllowLateSubmissions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (editingAssignment) {
      setTitle(editingAssignment.title || '');
      setDescription(editingAssignment.description || '');
      const cId =
        typeof editingAssignment.course === 'object'
          ? editingAssignment.course._id
          : editingAssignment.course;
      setCourseId(cId || initialCourseId || teachableCourses[0]?._id || '');
      const d = editingAssignment.dueDate ? new Date(editingAssignment.dueDate) : new Date(Date.now() + 7 * 86400000);
      setDueDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      setPointsPossible(editingAssignment.pointsPossible ?? editingAssignment.points ?? 100);
      setSubmissionType(editingAssignment.submissionType || 'both');
      setAllowLateSubmissions(Boolean(editingAssignment.allowLateSubmissions));
    } else {
      setTitle('');
      setDescription('');
      setCourseId(initialCourseId || teachableCourses[0]?._id || '');
      const d = new Date(Date.now() + 7 * 86400000);
      setDueDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      setPointsPossible(100);
      setSubmissionType('both');
      setAllowLateSubmissions(false);
    }
  }, [isOpen, editingAssignment, initialCourseId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !courseId || !dueDate) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSaving(true);
    try {
      let saved: Assignment;
      if (editingAssignment) {
        saved = await apiService.updateAssignment(editingAssignment._id, {
          title: title.trim(),
          description: description.trim(),
          dueDate: new Date(dueDate).toISOString(),
          pointsPossible: Number(pointsPossible),
          submissionType,
          allowLateSubmissions,
        });
        onShowToast('Assignment updated successfully!', 'success');
        onSaved(saved, true);
      } else {
        saved = await apiService.createAssignment({
          title: title.trim(),
          description: description.trim(),
          course: courseId,
          dueDate: new Date(dueDate).toISOString(),
          pointsPossible: Number(pointsPossible),
          submissionType,
          allowLateSubmissions,
        });
        onShowToast('Assignment created successfully!', 'success');
        onSaved(saved, false);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save assignment.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-5">
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white">
              {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
            </h3>
            <p className="text-xs text-neutral-500">
              {editingAssignment ? 'Update instructions, deadline, or grading policy.' : 'Publish an assignment to your enrolled students.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {teachableCourses.length === 0 ? (
          <div className="p-6 text-center bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <i className="fas fa-chalkboard-teacher text-2xl text-neutral-400 mb-2"></i>
            <p className="text-sm font-semibold text-black dark:text-white">No Courses Assigned</p>
            <p className="text-xs text-neutral-500 mt-1">
              Create a course first before creating assignments. Only course instructors can publish assignments.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingAssignment && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Target Course *
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  disabled={Boolean(initialCourseId)}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-70"
                >
                  {teachableCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Assignment Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Problem Set 3: Graph Algorithms"
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Instructions *
              </label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide clear requirements, deliverables, and grading rubric..."
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Points Possible *
                </label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  required
                  value={pointsPossible}
                  onChange={(e) => setPointsPossible(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Submission Format
                </label>
                <select
                  value={submissionType}
                  onChange={(e) => setSubmissionType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                >
                  <option value="both">Text & File Upload</option>
                  <option value="text">Text Response Only</option>
                  <option value="file">File Upload Only</option>
                </select>
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer mt-5 sm:mt-4">
                <input
                  type="checkbox"
                  checked={allowLateSubmissions}
                  onChange={(e) => setAllowLateSubmissions(e.target.checked)}
                  className="w-4 h-4 accent-black dark:accent-white rounded"
                />
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Allow late submissions
                </span>
              </label>
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
                className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold transition disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : editingAssignment ? 'Save Changes' : 'Create Assignment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

interface AssignmentDetailModalProps {
  assignment: Assignment | null;
  currentUser: User;
  courses: Course[];
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onEditAssignment: (a: Assignment) => void;
  onAskAiHint: (a: Assignment) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({
  assignment,
  currentUser,
  courses,
  onClose,
  onRefresh,
  onEditAssignment,
  onAskAiHint,
  onShowToast,
}) => {
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [subFilterTab, setSubFilterTab] = useState<'all' | 'ungraded' | 'graded'>('all');
  const [activeSubmission, setActiveSubmission] = useState<AssignmentSubmission | null>(null);

  // Student submission form
  const [textContent, setTextContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Instructor grading form
  const [gradeScore, setGradeScore] = useState<string>('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeError, setGradeError] = useState('');

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const courseObj =
    typeof assignment?.course === 'object'
      ? assignment.course
      : courses.find((c) => c._id === assignment?.course) || null;

  const isCourseInstructor = Boolean(
    currentUser.role === 'admin' ||
      (currentUser.role === 'instructor' &&
        (courseObj?.isTeaching || courseObj?.instructor?._id === currentUser._id))
  );

  const loadSubs = async (aId: string) => {
    setLoadingSubs(true);
    try {
      const list = await apiService.getSubmissions(aId);
      setSubmissions(list);
    } catch {
      setSubmissions(assignment?.submissions || []);
    } finally {
      setLoadingSubs(false);
    }
  };

  useEffect(() => {
    if (!assignment) return;
    setActiveSubmission(null);
    setConfirmDelete(false);
    setTextContent('');
    setSelectedFiles([]);
    setSubmitError('');
    setGradeError('');
    loadSubs(assignment._id);
  }, [assignment?._id]);

  if (!assignment) return null;

  const pointsPossible = assignment.pointsPossible ?? assignment.points ?? 100;
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const isPastDue = dueDate.getTime() < now.getTime();
  const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);
  const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / 86400000);

  const isCourseArchived = Boolean(courseObj?.isArchived);
  const isEnrolledStudent = Boolean(courseObj?.isEnrolled) && currentUser.role === 'student';

  const mySubmission =
    currentUser.role === 'student'
      ? submissions.find((s) => {
          const sId = typeof s.student === 'object' ? s.student?._id : s.student;
          return String(sId) === String(currentUser._id);
        }) || assignment.mySubmission || null
      : null;

  const isSubmitted = Boolean(mySubmission);
  const myScore =
    mySubmission?.grade && typeof mySubmission.grade === 'object'
      ? mySubmission.grade.score
      : typeof mySubmission?.grade === 'number'
      ? mySubmission.grade
      : undefined;
  const isMyGraded = Boolean(mySubmission && (mySubmission.status === 'graded' || myScore !== undefined));
  const myFeedback =
    mySubmission?.grade && typeof mySubmission.grade === 'object'
      ? mySubmission.grade.feedback
      : mySubmission?.feedback;

  const canSubmit =
    isEnrolledStudent &&
    !isCourseArchived &&
    !isSubmitted &&
    (!isPastDue || Boolean(assignment.allowLateSubmissions));

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (assignment.submissionType === 'text' && !textContent.trim()) {
      setSubmitError('Please enter your response before submitting.');
      return;
    }
    if (assignment.submissionType === 'file' && selectedFiles.length === 0) {
      setSubmitError('Please attach at least one file before submitting.');
      return;
    }
    if (!textContent.trim() && selectedFiles.length === 0) {
      setSubmitError('Please enter a text response or attach at least one file.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.submitAssignment(assignment._id, {
        textContent: textContent.trim(),
        files: selectedFiles,
      });
      onShowToast('Assignment submitted successfully!', 'success');
      await loadSubs(assignment._id);
      await onRefresh();
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openGradeForm = (sub: AssignmentSubmission) => {
    setActiveSubmission(sub);
    setGradeError('');
    const existingScore =
      sub.grade && typeof sub.grade === 'object' ? sub.grade.score : typeof sub.grade === 'number' ? sub.grade : '';
    const existingFeedback =
      sub.grade && typeof sub.grade === 'object' ? sub.grade.feedback || '' : sub.feedback || '';
    setGradeScore(existingScore !== '' && existingScore !== undefined ? String(existingScore) : '');
    setGradeFeedback(existingFeedback);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission?._id) return;
    setGradeError('');

    const numericScore = Number(gradeScore);
    if (gradeScore === '' || Number.isNaN(numericScore) || numericScore < 0 || numericScore > pointsPossible) {
      setGradeError(`Score must be between 0 and ${pointsPossible}.`);
      return;
    }

    setIsGrading(true);
    try {
      await apiService.gradeSubmission(activeSubmission._id, {
        score: numericScore,
        feedback: gradeFeedback.trim(),
      });
      onShowToast('Submission graded successfully!', 'success');
      await loadSubs(assignment._id);
      await onRefresh();
      setActiveSubmission(null);
    } catch (err: any) {
      setGradeError(err?.message || 'Failed to save grade.');
    } finally {
      setIsGrading(false);
    }
  };

  const handleDeleteAssignment = async () => {
    setIsDeleting(true);
    try {
      await apiService.deleteAssignment(assignment._id);
      onShowToast('Assignment deleted.', 'info');
      await onRefresh();
      onClose();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to delete assignment.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const ungradedSubs = submissions.filter(
    (s) => s.status !== 'graded' && !(typeof s.grade === 'object' && s.grade?.score !== undefined)
  );
  const gradedSubs = submissions.filter(
    (s) => s.status === 'graded' || (typeof s.grade === 'object' && s.grade?.score !== undefined)
  );
  const visibleSubs =
    subFilterTab === 'ungraded' ? ungradedSubs : subFilterTab === 'graded' ? gradedSubs : submissions;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
        {/* Top Bar */}
        <div className="flex justify-between items-start gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black text-[11px] font-black uppercase">
                {courseObj?.code || assignment.courseCode || 'COURSE'}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isPastDue
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                }`}
              >
                {isPastDue ? `Overdue by ${daysOverdue}d` : `Due in ${daysLeft}d`}
              </span>
              {assignment.allowLateSubmissions && (
                <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  Late Submissions Allowed
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-black dark:text-white">{assignment.title}</h3>
            <p className="text-xs text-neutral-500">
              Due {dueDate.toLocaleString()} • {pointsPossible} Points Possible • Format: {assignment.submissionType || 'both'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isCourseInstructor && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onEditAssignment(assignment);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  title="Edit assignment"
                >
                  <i className="fas fa-edit mr-1"></i> Edit
                </button>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-900 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Delete assignment"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                ) : (
                  <button
                    onClick={handleDeleteAssignment}
                    disabled={isDeleting}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                  >
                    {isDeleting ? '...' : 'Confirm Delete'}
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Instructions</h4>
            <button
              onClick={() => {
                onClose();
                onAskAiHint(assignment);
              }}
              className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1"
            >
              <i className="fas fa-robot"></i>
              <span>AI Concept Hint</span>
            </button>
          </div>
          <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
            {assignment.description}
          </p>
        </div>

        {/* ==================== INSTRUCTOR GRADING WORKSPACE ==================== */}
        {isCourseInstructor ? (
          <div className="space-y-4">
            {/* Summary Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-center">
                <div className="text-xl font-black text-black dark:text-white">{submissions.length}</div>
                <div className="text-[11px] text-neutral-500 uppercase font-bold">Total Submissions</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-center">
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{gradedSubs.length}</div>
                <div className="text-[11px] text-neutral-500 uppercase font-bold">Graded</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-center">
                <div className="text-xl font-black text-amber-600 dark:text-amber-400">{ungradedSubs.length}</div>
                <div className="text-[11px] text-neutral-500 uppercase font-bold">Awaiting Grade</div>
              </div>
            </div>

            {activeSubmission ? (
              /* Active Submission Grading Panel */
              <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-850 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeSubmission.studentAvatar || DEFAULT_AVATAR}
                      alt={activeSubmission.studentName}
                      className="w-9 h-9 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                      }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-black dark:text-white">
                        {activeSubmission.studentName}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        {activeSubmission.studentEmail} • Submitted {new Date(activeSubmission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSubmission(null)}
                    className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:underline"
                  >
                    &larr; Back to All Submissions
                  </button>
                </div>

                {activeSubmission.textContent && (
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Student Written Response
                    </h5>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                      {activeSubmission.textContent}
                    </div>
                  </div>
                )}

                {activeSubmission.attachments && activeSubmission.attachments.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Attached Files
                    </h5>
                    <div className="space-y-1.5">
                      {activeSubmission.attachments.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                        >
                          <span className="font-medium text-neutral-800 dark:text-neutral-200">
                            <i className="fas fa-paperclip mr-2 text-neutral-400"></i>
                            {file.fileName}
                          </span>
                          {file.fileUrl && file.fileUrl !== '#' && (
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-black dark:text-white hover:underline"
                            >
                              Download / View
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleGradeSubmit} className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                        Score (0 - {pointsPossible}) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={pointsPossible}
                        required
                        value={gradeScore}
                        onChange={(e) => setGradeScore(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-black dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                        Instructor Feedback
                      </label>
                      <input
                        type="text"
                        value={gradeFeedback}
                        onChange={(e) => setGradeFeedback(e.target.value)}
                        placeholder="Constructive evaluation notes..."
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-black dark:text-white"
                      />
                    </div>
                  </div>

                  {gradeError && (
                    <div className="text-xs text-red-600 dark:text-red-400">{gradeError}</div>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSubmission(null)}
                      className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isGrading}
                      className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold disabled:opacity-60"
                    >
                      {isGrading ? 'Saving Grade...' : 'Save Grade'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Submissions Table */
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-black dark:text-white">Student Submissions</h4>
                  <div className="flex gap-1.5">
                    {([
                      ['all', `All (${submissions.length})`],
                      ['ungraded', `Ungraded (${ungradedSubs.length})`],
                      ['graded', `Graded (${gradedSubs.length})`],
                    ] as const).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setSubFilterTab(key)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          subFilterTab === key
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingSubs ? (
                  <div className="p-6 text-center text-xs text-neutral-500">
                    <i className="fas fa-spinner fa-spin mr-2"></i> Loading submissions...
                  </div>
                ) : visibleSubs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    No submissions in this category yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                      <thead className="bg-neutral-50 dark:bg-neutral-850">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-bold uppercase tracking-wider text-neutral-500">Student</th>
                          <th className="px-4 py-2.5 text-left font-bold uppercase tracking-wider text-neutral-500">Submitted</th>
                          <th className="px-4 py-2.5 text-left font-bold uppercase tracking-wider text-neutral-500">Status</th>
                          <th className="px-4 py-2.5 text-left font-bold uppercase tracking-wider text-neutral-500">Score</th>
                          <th className="px-4 py-2.5 text-right font-bold uppercase tracking-wider text-neutral-500">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {visibleSubs.map((sub, idx) => {
                          const subScore =
                            sub.grade && typeof sub.grade === 'object'
                              ? sub.grade.score
                              : typeof sub.grade === 'number'
                              ? sub.grade
                              : undefined;
                          const isSubGraded = sub.status === 'graded' || subScore !== undefined;
                          const isLate = new Date(sub.submittedAt).getTime() > dueDate.getTime();
                          return (
                            <tr key={sub._id || idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-850/60">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={sub.studentAvatar || DEFAULT_AVATAR}
                                    alt={sub.studentName}
                                    className="w-7 h-7 rounded-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                                    }}
                                  />
                                  <div>
                                    <p className="font-semibold text-black dark:text-white">{sub.studentName}</p>
                                    <p className="text-[11px] text-neutral-500">{sub.studentEmail}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                                {new Date(sub.submittedAt).toLocaleDateString()}
                                {isLate && <span className="ml-1 text-red-500 font-semibold">(Late)</span>}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-semibold ${
                                    isSubGraded
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                  }`}
                                >
                                  {isSubGraded ? 'Graded' : 'Needs Grade'}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-bold text-black dark:text-white">
                                {isSubGraded ? `${subScore} / ${pointsPossible}` : '—'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => openGradeForm(sub)}
                                  className="px-3 py-1 rounded-lg bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold"
                                >
                                  {isSubGraded ? 'Review / Edit' : 'Grade'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ==================== STUDENT SUBMISSION VIEW ==================== */
          <div className="space-y-4">
            {currentUser.role === 'instructor' ? (
              <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-700 dark:text-neutral-300">
                <i className="fas fa-shield-alt mr-2"></i>
                Read-only catalog preview: You are not the assigned instructor of this course, and instructors cannot submit student work.
              </div>
            ) : isSubmitted && mySubmission ? (
              <div className="p-5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-black dark:text-white">Your Submission</h4>
                    <p className="text-xs text-neutral-500">
                      Turned in on {new Date(mySubmission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  {isMyGraded && myScore !== undefined ? (
                    <div className="text-right">
                      <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        {myScore} / {pointsPossible}
                      </div>
                      <div className="text-[11px] font-semibold text-neutral-500">
                        {((myScore / pointsPossible) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-bold">
                      Awaiting Grade
                    </span>
                  )}
                </div>

                {mySubmission.textContent && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                    {mySubmission.textContent}
                  </div>
                )}

                {mySubmission.attachments && mySubmission.attachments.length > 0 && (
                  <div className="space-y-1.5">
                    {mySubmission.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                      >
                        <span>
                          <i className="fas fa-file mr-2 text-neutral-400"></i>
                          {att.fileName}
                        </span>
                        {att.fileUrl && att.fileUrl !== '#' && (
                          <a href={att.fileUrl} target="_blank" rel="noreferrer" className="font-bold hover:underline">
                            Open
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {myFeedback && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                    <span className="font-bold">Instructor Feedback: </span>
                    {myFeedback}
                  </div>
                )}
              </div>
            ) : !isEnrolledStudent ? (
              <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
                Enroll in <strong>{courseObj?.code || 'this course'}</strong> before submitting work for this assignment.
              </div>
            ) : isCourseArchived ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                This course is archived (read-only). New submissions are closed.
              </div>
            ) : !canSubmit ? (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                <i className="fas fa-exclamation-circle mr-2"></i>
                This assignment was due on {dueDate.toLocaleDateString()} and late submissions are disabled.
              </div>
            ) : (
              <form onSubmit={handleStudentSubmit} className="space-y-4 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                <h4 className="text-sm font-bold text-black dark:text-white">
                  {isPastDue ? 'Submit Late Assignment' : 'Turn In Assignment'}
                </h4>

                {assignment.submissionType !== 'file' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                      Written Response {assignment.submissionType === 'text' ? '*' : '(Optional)'}
                    </label>
                    <textarea
                      rows={4}
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Write your solution notes, answers, or links..."
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                )}

                {assignment.submissionType !== 'text' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                      Upload Files {assignment.submissionType === 'file' ? '*' : '(PDF, DOCX, PPTX, Images — max 10MB)'}
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                      className="w-full px-3.5 py-2 text-xs border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white"
                    />
                    {selectedFiles.length > 0 && (
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Selected: {selectedFiles.map((f) => f.name).join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {submitError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
                    {submitError}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold disabled:opacity-60"
                  >
                    {isSubmitting ? 'Submitting...' : isPastDue ? 'Submit Late Work' : 'Confirm Submission'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
