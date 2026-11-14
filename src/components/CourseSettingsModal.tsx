import React, { useState, useEffect } from 'react';
import { Course, CourseLink, User, DEFAULT_AVATAR } from '../types';
import { apiService } from '../services/api';

const APPEARANCE_COLORS = [
  '#171717',
  '#5D5CDE',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#6366F1',
  '#14B8A6',
];

export type CourseSettingsSection =
  | 'overview'
  | 'appearance'
  | 'info'
  | 'enrollment'
  | 'links'
  | 'students'
  | 'danger';

interface CourseSettingsModalProps {
  course: Course;
  isOpen: boolean;
  initialSection?: CourseSettingsSection;
  onClose: () => void;
  onCourseUpdated: () => Promise<void>;
  onCourseDeleted: () => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const CourseSettingsModal: React.FC<CourseSettingsModalProps> = ({
  course,
  isOpen,
  initialSection = 'overview',
  onClose,
  onCourseUpdated,
  onCourseDeleted,
  onShowToast,
}) => {
  const [section, setSection] = useState<CourseSettingsSection>(initialSection);

  // Appearance
  const [color, setColor] = useState(course.color || '#171717');

  // Info
  const [name, setName] = useState(course.name);
  const [code, setCode] = useState(course.code);
  const [description, setDescription] = useState(course.description);

  // Enrollment
  const [enrollmentCode, setEnrollmentCode] = useState(course.enrollmentCode || '');
  const [allowEnrollment, setAllowEnrollment] = useState(course.allowEnrollment !== false);

  // Links
  const [links, setLinks] = useState<CourseLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [showGenerateLinkForm, setShowGenerateLinkForm] = useState(false);
  const [expiresIn, setExpiresIn] = useState('168');
  const [maxUses, setMaxUses] = useState('');
  const [revokingLinkId, setRevokingLinkId] = useState<string | null>(null);

  // Students
  const [students, setStudents] = useState<User[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(null);

  // Danger Zone
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSection(initialSection);
    setColor(course.color || '#171717');
    setName(course.name);
    setCode(course.code);
    setDescription(course.description || '');
    setEnrollmentCode(course.enrollmentCode || '');
    setAllowEnrollment(course.allowEnrollment !== false);
    setError('');
    setConfirmArchive(false);
    setDeleteConfirmText('');
    setShowGenerateLinkForm(false);
  }, [isOpen, initialSection, course._id]);

  const loadLinks = async () => {
    setLoadingLinks(true);
    try {
      const list = await apiService.getCourseLinks(course._id);
      setLinks(list);
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to load course links', 'error');
    } finally {
      setLoadingLinks(false);
    }
  };

  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const detailedCourse = await apiService.getCourse(course._id);
      const roster = (detailedCourse.students || []).filter(
        (s): s is User => typeof s === 'object' && s !== null
      );
      setStudents(roster);
    } catch {
      const fallback = (course.students || []).filter(
        (s): s is User => typeof s === 'object' && s !== null
      );
      setStudents(fallback);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (section === 'links') loadLinks();
    if (section === 'students') loadStudents();
  }, [isOpen, section]);

  if (!isOpen) return null;

  const copyText = (text: string, label = 'Copied to clipboard!') => {
    navigator.clipboard?.writeText(text).catch(() => {});
    onShowToast(label, 'success');
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 6; i++) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEnrollmentCode(out);
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    setError('');
    try {
      await apiService.updateCourse(course._id, { color });
      onShowToast('Course appearance updated!', 'success');
      await onCourseUpdated();
      setSection('overview');
    } catch (err: any) {
      setError(err?.message || 'Failed to update appearance.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Course name and code are required.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await apiService.updateCourse(course._id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
      });
      onShowToast('Course information updated!', 'success');
      await onCourseUpdated();
      setSection('overview');
    } catch (err: any) {
      setError(err?.message || 'Failed to update course info.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const payload: { allowEnrollment: boolean; enrollmentCode?: string } = { allowEnrollment };
      if (enrollmentCode && enrollmentCode !== course.enrollmentCode) {
        payload.enrollmentCode = enrollmentCode.trim();
      }
      await apiService.updateCourse(course._id, payload);
      onShowToast('Enrollment options updated!', 'success');
      await onCourseUpdated();
      setSection('overview');
    } catch (err: any) {
      setError(err?.message || 'Failed to update enrollment options.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const opts: { expiresIn?: number; maxUses?: number } = {};
      const hours = parseInt(expiresIn, 10);
      if (hours > 0) opts.expiresIn = hours;
      const max = parseInt(maxUses, 10);
      if (max > 0) opts.maxUses = max;

      const created = await apiService.generateCourseLink(course._id, opts);
      onShowToast('Enrollment link generated!', 'success');
      setShowGenerateLinkForm(false);
      setLinks((prev) => [created, ...prev]);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate link.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeLink = async (linkId: string) => {
    setIsSaving(true);
    try {
      await apiService.revokeCourseLink(linkId);
      onShowToast('Enrollment link revoked.', 'info');
      setRevokingLinkId(null);
      await loadLinks();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to revoke link.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentEmail.trim()) return;
    setIsSaving(true);
    setError('');
    try {
      await apiService.addStudentToCourse(course._id, newStudentEmail.trim());
      onShowToast('Student added to course!', 'success');
      setNewStudentEmail('');
      await loadStudents();
      await onCourseUpdated();
    } catch (err: any) {
      setError(err?.message || 'Failed to add student.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    setIsSaving(true);
    try {
      await apiService.removeStudentFromCourse(course._id, studentId);
      onShowToast('Student removed from course.', 'info');
      setRemovingStudentId(null);
      await loadStudents();
      await onCourseUpdated();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to remove student.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleArchive = async () => {
    setIsSaving(true);
    try {
      await apiService.updateCourse(course._id, { isArchived: !course.isArchived });
      onShowToast(course.isArchived ? 'Course restored from archive.' : 'Course archived (read-only).', 'success');
      setConfirmArchive(false);
      await onCourseUpdated();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update archive status.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const expected = `DELETE ${course.code}`;
    if (deleteConfirmText.trim() !== expected) {
      setError(`Type "${expected}" exactly to confirm permanent deletion.`);
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await apiService.deleteCourse(course._id);
      onShowToast('Course permanently deleted.', 'info');
      await onCourseDeleted();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete course.');
    } finally {
      setIsSaving(false);
    }
  };

  const baseShareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://campus.edu/';

  const filteredStudents = students.filter(
    (s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            {section !== 'overview' && (
              <button
                onClick={() => {
                  setSection('overview');
                  setError('');
                }}
                className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                &larr; Settings
              </button>
            )}
            <div>
              <h3 className="text-lg font-black text-black dark:text-white">
                Course Settings • {course.code}
              </h3>
              <p className="text-xs text-neutral-500">{course.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* OVERVIEW HUB */}
        {section === 'overview' && (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {[
              {
                key: 'appearance' as const,
                title: 'Course Appearance',
                desc: 'Customize banner theme color for this course',
                btn: 'Edit Color',
                icon: 'fas fa-palette',
              },
              {
                key: 'info' as const,
                title: 'Course Information',
                desc: 'Update course name, course code, and description',
                btn: 'Edit Info',
                icon: 'fas fa-info-circle',
              },
              {
                key: 'enrollment' as const,
                title: 'Enrollment Options & Code',
                desc: `Current code: ${course.enrollmentCode || 'Auto-generated'} • ${
                  course.allowEnrollment !== false ? 'Open for enrollment' : 'Closed'
                }`,
                btn: 'Configure',
                icon: 'fas fa-key',
              },
              {
                key: 'links' as const,
                title: 'Course Enrollment Links',
                desc: 'Generate, copy, or revoke direct student invite links',
                btn: 'Manage Links',
                icon: 'fas fa-link',
              },
              {
                key: 'students' as const,
                title: 'Manage Students',
                desc: `View enrolled roster (${course.studentsCount || 0} students), add by email, or remove`,
                btn: 'Manage Roster',
                icon: 'fas fa-users',
              },
            ].map((item) => (
              <div key={item.key} className="py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white shrink-0">
                    <i className={`${item.icon} text-sm`}></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black dark:text-white">{item.title}</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSection(item.key)}
                  className="px-3.5 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-xs font-bold transition"
                >
                  {item.btn}
                </button>
              </div>
            ))}

            <div className="py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                  <i className="fas fa-exclamation-triangle text-sm"></i>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-600 dark:text-red-400">Danger Zone</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Archive or permanently delete this course</p>
                </div>
              </div>
              <button
                onClick={() => setSection('danger')}
                className="px-3.5 py-1.5 rounded-xl border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white text-xs font-bold transition"
              >
                Options
              </button>
            </div>
          </div>
        )}

        {/* APPEARANCE */}
        {section === 'appearance' && (
          <div className="space-y-4">
            <div className="h-24 rounded-xl p-4 flex items-end text-white font-bold" style={{ backgroundColor: color }}>
              {course.code}: {course.name}
            </div>
            <div className="grid grid-cols-5 gap-3">
              {APPEARANCE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-11 rounded-xl transition ${
                    color === c ? 'ring-2 ring-offset-2 ring-black dark:ring-white dark:ring-offset-neutral-900 scale-95' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSection('overview')} className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold">
                Cancel
              </button>
              <button
                onClick={handleSaveAppearance}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold"
              >
                {isSaving ? 'Saving...' : 'Save Appearance'}
              </button>
            </div>
          </div>
        )}

        {/* INFO */}
        {section === 'info' && (
          <form onSubmit={handleSaveInfo} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Course Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white"
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
                className="w-full px-3.5 py-2.5 text-sm font-mono uppercase border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setSection('overview')} className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* ENROLLMENT OPTIONS */}
        {section === 'enrollment' && (
          <form onSubmit={handleSaveEnrollment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Course Enrollment Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={enrollmentCode}
                  readOnly
                  placeholder="No code generated"
                  className="flex-1 px-3.5 py-2.5 text-sm font-mono font-bold border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => copyText(enrollmentCode, 'Enrollment code copied!')}
                  className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  title="Copy Code"
                >
                  <i className="fas fa-copy mr-1"></i> Copy
                </button>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={generateRandomCode}
                className="px-4 py-2 rounded-xl border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-xs font-bold transition"
              >
                <i className="fas fa-sync-alt mr-1.5"></i> Generate New 6-Character Code
              </button>
              <p className="text-[11px] text-neutral-500 mt-1.5">
                Saving will invalidate the previous enrollment code. Share the new code with incoming students.
              </p>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={allowEnrollment}
                onChange={(e) => setAllowEnrollment(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-black dark:accent-white"
              />
              <div>
                <p className="text-sm font-bold text-black dark:text-white">Allow new student enrollments</p>
                <p className="text-xs text-neutral-500">
                  When disabled, students cannot enroll via code or enrollment links.
                </p>
              </div>
            </label>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setSection('overview')} className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold">
                {isSaving ? 'Saving...' : 'Save Enrollment Settings'}
              </button>
            </div>
          </form>
        )}

        {/* COURSE LINKS */}
        {section === 'links' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-neutral-500">
                Students opening a link are enrolled directly (instructors/admins are blocked from student link enrollment).
              </p>
              <button
                onClick={() => setShowGenerateLinkForm((v) => !v)}
                className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold"
              >
                <i className="fas fa-plus mr-1"></i> Generate New Link
              </button>
            </div>

            {showGenerateLinkForm && (
              <form
                onSubmit={handleGenerateLink}
                className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
              >
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                    Expires In (Hours)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                    Max Uses (Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold"
                >
                  {isSaving ? 'Creating...' : 'Create Invite Link'}
                </button>
              </form>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}

            {loadingLinks ? (
              <div className="p-6 text-center text-xs text-neutral-500">
                <i className="fas fa-spinner fa-spin mr-2"></i> Loading invite links...
              </div>
            ) : links.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
                No enrollment links generated yet.
              </div>
            ) : (
              <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-xl">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-850">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-bold uppercase text-neutral-500">Status</th>
                      <th className="px-4 py-2.5 text-left font-bold uppercase text-neutral-500">Uses</th>
                      <th className="px-4 py-2.5 text-left font-bold uppercase text-neutral-500">Expires</th>
                      <th className="px-4 py-2.5 text-left font-bold uppercase text-neutral-500">Invite URL</th>
                      <th className="px-4 py-2.5 text-right font-bold uppercase text-neutral-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {links.map((link) => {
                      const isExpired = link.expiresAt ? new Date(link.expiresAt).getTime() < Date.now() : false;
                      const isMaxed = Boolean(link.maxUses && link.usedCount >= link.maxUses);
                      const isRevoked = !link.isActive;
                      const fullUrl = `${baseShareUrl}?join=${link.token}`;

                      return (
                        <tr key={link._id} className={isRevoked || isExpired || isMaxed ? 'opacity-60' : ''}>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold ${
                                isRevoked
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                  : isExpired
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                  : isMaxed
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              }`}
                            >
                              {isRevoked ? 'Revoked' : isExpired ? 'Expired' : isMaxed ? 'Maxed' : 'Active'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {link.usedCount || 0} {link.maxUses ? `/ ${link.maxUses}` : '(Unlimited)'}
                          </td>
                          <td className="px-4 py-3">
                            {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-4 py-3 font-mono max-w-[200px] truncate">{fullUrl}</td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => copyText(fullUrl, 'Invite link copied to clipboard!')}
                              className="font-bold text-black dark:text-white hover:underline"
                            >
                              Copy
                            </button>
                            {!isRevoked &&
                              (revokingLinkId === link._id ? (
                                <button
                                  onClick={() => handleRevokeLink(link._id)}
                                  className="px-2 py-0.5 rounded bg-red-600 text-white font-bold"
                                >
                                  Confirm Revoke
                                </button>
                              ) : (
                                <button
                                  onClick={() => setRevokingLinkId(link._id)}
                                  className="text-red-600 dark:text-red-400 font-semibold hover:underline"
                                >
                                  Revoke
                                </button>
                              ))}
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

        {/* MANAGE STUDENTS */}
        {section === 'students' && (
          <div className="space-y-4">
            <form onSubmit={handleAddStudent} className="flex flex-wrap gap-2">
              <input
                type="email"
                required
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                placeholder="Add student by campus email address..."
                className="flex-1 min-w-[220px] px-3.5 py-2 text-xs border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold"
              >
                <i className="fas fa-user-plus mr-1"></i> Add Student
              </button>
            </form>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                {students.length} student{students.length === 1 ? '' : 's'} enrolled
              </span>
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Filter roster..."
                className="px-3 py-1.5 text-xs border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
              />
            </div>

            {loadingStudents ? (
              <div className="p-6 text-center text-xs text-neutral-500">
                <i className="fas fa-spinner fa-spin mr-2"></i> Loading enrolled students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
                No enrolled students found.
              </div>
            ) : (
              <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-xl">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-850">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-bold uppercase text-neutral-500">Student</th>
                      <th className="px-4 py-2.5 text-left font-bold uppercase text-neutral-500">Email</th>
                      <th className="px-4 py-2.5 text-right font-bold uppercase text-neutral-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {filteredStudents.map((stu) => (
                      <tr key={stu._id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={stu.avatarUrl || stu.avatar || DEFAULT_AVATAR}
                              alt={stu.firstName}
                              className="w-7 h-7 rounded-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                              }}
                            />
                            <span className="font-semibold text-black dark:text-white">
                              {stu.firstName} {stu.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{stu.email}</td>
                        <td className="px-4 py-3 text-right">
                          {removingStudentId === stu._id ? (
                            <button
                              onClick={() => handleRemoveStudent(stu._id)}
                              className="px-2.5 py-1 rounded bg-red-600 text-white font-bold"
                            >
                              Confirm Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => setRemovingStudentId(stu._id)}
                              className="text-red-600 dark:text-red-400 font-semibold hover:underline"
                            >
                              <i className="fas fa-user-minus mr-1"></i> Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* DANGER ZONE */}
        {section === 'danger' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
              <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400">
                {course.isArchived ? 'Unarchive Course' : 'Archive Course'}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Archiving makes this course read-only for enrolled students. No new submissions or discussions are permitted.
              </p>
              {!confirmArchive ? (
                <button
                  onClick={() => setConfirmArchive(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
                >
                  {course.isArchived ? 'Restore Course' : 'Archive Course'}
                </button>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleToggleArchive}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
                  >
                    {isSaving ? 'Updating...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setConfirmArchive(false)}
                    className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <form
              onSubmit={handleDeleteCourse}
              className="p-4 rounded-xl border border-red-300 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20 space-y-3"
            >
              <h4 className="text-sm font-bold text-red-700 dark:text-red-400">Delete Course Permanently</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Irreversible action: Permanently deletes this course, assignments, resources, and discussions.
                Type <code className="font-mono font-bold">DELETE {course.code}</code> below to confirm.
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={`DELETE ${course.code}`}
                className="w-full px-3.5 py-2 text-xs font-mono border border-red-300 dark:border-red-800 rounded-xl bg-white dark:bg-neutral-900"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={isSaving || deleteConfirmText.trim() !== `DELETE ${course.code}`}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-40"
              >
                {isSaving ? 'Deleting...' : 'Permanently Delete Course'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
