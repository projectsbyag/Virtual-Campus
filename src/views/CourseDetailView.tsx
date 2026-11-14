import React, { useState } from 'react';
import { Course, Assignment, Resource, Discussion, Announcement, User, DEFAULT_AVATAR } from '../types';
import { apiService } from '../services/api';
import { CourseSettingsModal, CourseSettingsSection } from '../components/CourseSettingsModal';
import { EnrollCourseModal } from '../components/CourseModals';
import { CreateEditAssignmentModal, AssignmentDetailModal } from '../components/AssignmentModals';

interface CourseDetailViewProps {
  course: Course;
  currentUser: User;
  courses: Course[];
  assignments: Assignment[];
  resources: Resource[];
  discussions: Discussion[];
  announcements: Announcement[];
  onBack: () => void;
  onRefreshData: () => Promise<void>;
  onAskAi: (course: Course) => void;
  onAskAiHint: (assignment: Assignment) => void;
  onSelectResource: (resourceId: string) => void;
  onSelectDiscussion: (discussionId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  course,
  currentUser,
  courses,
  assignments,
  resources,
  discussions,
  announcements,
  onBack,
  onRefreshData,
  onAskAi,
  onAskAiHint,
  onSelectResource,
  onSelectDiscussion,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'announcements' | 'assignments' | 'resources' | 'discussions'>('overview');

  // Modals state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<CourseSettingsSection>('overview');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);
  const [isUnenrolling, setIsUnenrolling] = useState(false);

  // Assignment modals
  const [createAssignOpen, setCreateAssignOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [detailAssignment, setDetailAssignment] = useState<Assignment | null>(null);

  // Announcement creation modal
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [isPostingAnn, setIsPostingAnn] = useState(false);

  // Resource upload modal
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resDescription, setResDescription] = useState('');
  const [resCategory, setResCategory] = useState<'lecture' | 'reading' | 'exercise' | 'tutorial' | 'other'>('lecture');
  const [resType, setResType] = useState<'file' | 'link'>('file');
  const [resLink, setResLink] = useState('');
  const [resFile, setResFile] = useState<File | null>(null);
  const [isUploadingRes, setIsUploadingRes] = useState(false);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);

  // Discussion creation modal
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [discTitle, setDiscTitle] = useState('');
  const [discContent, setDiscContent] = useState('');
  const [discTags, setDiscTags] = useState('');
  const [isPostingDisc, setIsPostingDisc] = useState(false);

  const isInstructorRole = currentUser.role === 'instructor' || currentUser.role === 'admin';
  const isOwner = Boolean(
    currentUser.role === 'admin' || course.isTeaching || course.instructor?._id === currentUser._id
  );
  const isStudentEnrolled = currentUser.role === 'student' && Boolean(course.isEnrolled);
  const canParticipateInDiscussions = (isOwner || isStudentEnrolled) && !course.isArchived;
  const canStudentEnroll =
    currentUser.role === 'student' &&
    !course.isEnrolled &&
    !course.isArchived &&
    course.allowEnrollment !== false;

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

  const courseAnnouncements = announcements.filter((ann) => {
    const cId = typeof ann.course === 'object' ? ann.course._id : ann.course;
    return cId === course._id;
  });

  const openSettingsAt = (sec: CourseSettingsSection) => {
    setSettingsSection(sec);
    setSettingsOpen(true);
  };

  const handleConfirmUnenroll = async () => {
    setIsUnenrolling(true);
    try {
      await apiService.unenrollCourse(course._id);
      onShowToast(`Unenrolled from ${course.code}.`, 'info');
      setShowUnenrollConfirm(false);
      await onRefreshData();
      onBack();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to unenroll.', 'error');
    } finally {
      setIsUnenrolling(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    setIsPostingAnn(true);
    try {
      await apiService.createAnnouncement({
        title: annTitle.trim(),
        content: annContent.trim(),
        course: course._id,
      });
      onShowToast('Announcement published to course students!', 'success');
      setAnnTitle('');
      setAnnContent('');
      setShowAnnouncementModal(false);
      await onRefreshData();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to post announcement.', 'error');
    } finally {
      setIsPostingAnn(false);
    }
  };

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;
    setIsUploadingRes(true);
    try {
      await apiService.uploadResource({
        title: resTitle.trim(),
        description: resDescription.trim(),
        course: course._id,
        type: resType,
        category: resCategory,
        link: resType === 'link' ? resLink.trim() : undefined,
        file: resType === 'file' ? resFile || undefined : undefined,
        isVisible: true,
      });
      onShowToast('Resource uploaded successfully!', 'success');
      setResTitle('');
      setResDescription('');
      setResLink('');
      setResFile(null);
      setShowResourceModal(false);
      await onRefreshData();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to upload resource.', 'error');
    } finally {
      setIsUploadingRes(false);
    }
  };

  const handleTogglePinResource = async (r: Resource) => {
    try {
      if (r.isPinned) {
        await apiService.unpinResource(r._id);
        onShowToast('Resource unpinned.', 'info');
      } else {
        await apiService.pinResource(r._id);
        onShowToast('Resource pinned to top.', 'success');
      }
      await onRefreshData();
    } catch (err: any) {
      onShowToast(err?.message || 'Could not update pin state.', 'error');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await apiService.deleteResource(resourceId);
      onShowToast('Resource deleted.', 'info');
      setDeletingResourceId(null);
      await onRefreshData();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to delete resource.', 'error');
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discTitle.trim() || !discContent.trim()) return;
    setIsPostingDisc(true);
    try {
      const tags = discTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await apiService.createDiscussion(discTitle.trim(), discContent.trim(), course._id, tags);
      onShowToast('Discussion thread created!', 'success');
      setDiscTitle('');
      setDiscContent('');
      setDiscTags('');
      setShowDiscussionModal(false);
      await onRefreshData();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to post discussion.', 'error');
    } finally {
      setIsPostingDisc(false);
    }
  };

  return (
    <div className="fade-in space-y-6 max-w-7xl mx-auto">
      {/* Top breadcrumb */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="text-black dark:text-white hover:underline text-sm font-bold flex items-center gap-1.5"
        >
          <i className="fas fa-arrow-left text-xs"></i>
          <span>Back to Courses</span>
        </button>

        {isOwner && (
          <span className="px-2.5 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold">
            Course Instructor Workspace
          </span>
        )}
      </div>

      {/* Archived & RBAC Warnings */}
      {course.isArchived && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
          <i className="fas fa-archive text-base"></i>
          <div>
            <p className="font-bold">This course is archived (Read-Only)</p>
            <p>
              {isOwner
                ? 'New student enrollments and submissions are disabled. You can restore this course from Course Settings.'
                : 'Course materials remain visible for reference, but new submissions and discussions are closed.'}
            </p>
          </div>
        </div>
      )}

      {isInstructorRole && !isOwner && (
        <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-700 dark:text-neutral-300 flex items-center gap-2.5">
          <i className="fas fa-shield-alt text-base"></i>
          <div>
            <p className="font-bold">Instructor Catalog Preview</p>
            <p>Instructors cannot enroll in courses as students. You are viewing this course in read-only mode.</p>
          </div>
        </div>
      )}

      {/* Course Banner & Container */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden">
        <div
          className="h-40 sm:h-48 p-6 flex flex-col justify-end text-white relative"
          style={{ backgroundColor: course.color || '#171717' }}
        >
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 bg-black/45 rounded-md text-xs font-mono font-bold">
              {course.code}
            </span>
            <span className="px-2.5 py-1 bg-black/25 rounded-md text-xs">{course.department || 'Computer Science'}</span>
            <span className="px-2.5 py-1 bg-black/25 rounded-md text-xs">{course.semester || 'Spring 2026'}</span>
            {isOwner && course.enrollmentCode && (
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(course.enrollmentCode || '').catch(() => {});
                  onShowToast(`Enrollment code ${course.enrollmentCode} copied!`, 'success');
                }}
                className="px-2.5 py-1 bg-white/90 text-black rounded-md text-xs font-mono font-bold hover:bg-white transition"
                title="Click to copy student enrollment code"
              >
                <i className="fas fa-key mr-1"></i> Join Code: {course.enrollmentCode}
              </button>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{course.name}</h1>
        </div>

        {/* Info & Role Action Strip */}
        <div className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <img
              src={course.instructor.avatar || DEFAULT_AVATAR}
              alt={course.instructor.firstName}
              className="w-11 h-11 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
            />
            <div>
              <p className="font-bold text-sm text-black dark:text-white">
                {course.instructor.firstName} {course.instructor.lastName}
              </p>
              <p className="text-xs text-neutral-500">
                {course.instructor.email} • {course.studentsCount || 0} students enrolled
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onAskAi(course)}
              className="px-3.5 py-2 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <i className="fas fa-robot"></i>
              <span>Ask Campus AI</span>
            </button>

            {isOwner && (
              <>
                <button
                  onClick={() => openSettingsAt('links')}
                  className="px-3.5 py-2 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <i className="fas fa-link"></i>
                  <span>Course Links</span>
                </button>
                <button
                  onClick={() => openSettingsAt('students')}
                  className="px-3.5 py-2 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <i className="fas fa-users"></i>
                  <span>Students ({course.studentsCount || 0})</span>
                </button>
                <button
                  onClick={() => openSettingsAt('overview')}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <i className="fas fa-cog"></i>
                  <span>Course Settings</span>
                </button>
              </>
            )}

            {canStudentEnroll && (
              <button
                onClick={() => setShowEnrollModal(true)}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl text-xs font-bold transition"
              >
                <i className="fas fa-user-plus mr-1.5"></i> Enroll in Course
              </button>
            )}

            {isStudentEnrolled && (
              <button
                onClick={() => setShowUnenrollConfirm(true)}
                className="px-3.5 py-2 border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-xs font-bold transition"
              >
                Unenroll
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6">
          <div className="flex space-x-6 overflow-x-auto text-sm font-bold">
            {(
              [
                ['overview', 'Overview'],
                ['announcements', `Announcements (${courseAnnouncements.length})`],
                ['assignments', `Assignments (${courseAssignments.length})`],
                ['resources', `Materials (${courseResources.length})`],
                ['discussions', `Discussions (${courseDiscussions.length})`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`py-3.5 border-b-2 whitespace-nowrap transition text-xs sm:text-sm ${
                  activeTab === key
                    ? 'border-black text-black dark:border-white dark:text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="font-bold text-base text-black dark:text-white mb-2">Course Description</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {course.description || 'No description provided for this course.'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-base text-black dark:text-white">Weekly Curriculum</h3>
                  </div>
                  <div className="space-y-3">
                    {course.syllabus?.map((s) => (
                      <div
                        key={s.week}
                        className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-850/40"
                      >
                        <p className="text-[11px] font-black uppercase tracking-wider text-neutral-500">
                          Week {s.week}
                        </p>
                        <p className="text-sm font-bold text-black dark:text-white mt-0.5">{s.topic}</p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{s.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Course Snapshot</h4>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                      <div className="text-lg font-black text-black dark:text-white">{course.studentsCount || 0}</div>
                      <div className="text-[11px] text-neutral-500">Students</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                      <div className="text-lg font-black text-black dark:text-white">{courseAssignments.length}</div>
                      <div className="text-[11px] text-neutral-500">Assignments</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                      <div className="text-lg font-black text-black dark:text-white">{courseResources.length}</div>
                      <div className="text-[11px] text-neutral-500">Materials</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                      <div className="text-lg font-black text-black dark:text-white">{courseDiscussions.length}</div>
                      <div className="text-[11px] text-neutral-500">Threads</div>
                    </div>
                  </div>
                </div>

                {courseAnnouncements.length > 0 && (
                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Latest Announcement
                      </h4>
                      <button
                        onClick={() => setActiveTab('announcements')}
                        className="text-[11px] font-bold text-black dark:text-white hover:underline"
                      >
                        All ({courseAnnouncements.length})
                      </button>
                    </div>
                    <p className="text-xs font-bold text-black dark:text-white">{courseAnnouncements[0].title}</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">
                      {courseAnnouncements[0].content}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-black dark:text-white">Course Announcements</h3>
                {isOwner && !course.isArchived && (
                  <button
                    onClick={() => setShowAnnouncementModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold"
                  >
                    <i className="fas fa-plus mr-1.5"></i> New Announcement
                  </button>
                )}
              </div>

              {courseAnnouncements.length === 0 ? (
                <div className="p-8 text-center border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-500">
                  No announcements have been posted for this course yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {courseAnnouncements.map((ann) => (
                    <div
                      key={ann._id}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/40"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-bold text-black dark:text-white">{ann.title}</h4>
                        <span className="text-[11px] text-neutral-500 shrink-0">{ann.date || 'Recent'}</span>
                      </div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1.5 whitespace-pre-wrap leading-relaxed">
                        {ann.content}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-2">
                        Posted by {ann.senderName || 'Course Instructor'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ASSIGNMENTS TAB */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-black dark:text-white">Course Assignments</h3>
                {isOwner && !course.isArchived && (
                  <button
                    onClick={() => {
                      setEditingAssignment(null);
                      setCreateAssignOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold"
                  >
                    <i className="fas fa-plus mr-1.5"></i> Create Assignment
                  </button>
                )}
              </div>

              {courseAssignments.length > 0 ? (
                <div className="space-y-3">
                  {courseAssignments.map((a) => {
                    const due = new Date(a.dueDate);
                    const isPast = due.getTime() < Date.now();
                    return (
                      <div
                        key={a._id}
                        className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-black dark:hover:border-white transition flex flex-wrap justify-between items-center gap-3"
                      >
                        <div
                          onClick={() => setDetailAssignment(a)}
                          className="flex-1 min-w-[200px] cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-sm text-black dark:text-white hover:underline">{a.title}</h4>
                            {!isOwner && currentUser.role === 'student' && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                  a.status === 'graded'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                    : a.status === 'submitted'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                    : a.status === 'missed'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                    : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                                }`}
                              >
                                {a.status}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500">
                            Due {due.toLocaleDateString()} • {a.pointsPossible ?? a.points} pts
                            {isOwner &&
                              ` • ${a.submissions?.length || 0} submissions (${a.ungradedCount || 0} ungraded)`}
                            {isPast && !isOwner && !a.mySubmission ? ' • Past due' : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {isOwner ? (
                            <>
                              <button
                                onClick={() => {
                                  setEditingAssignment(a);
                                  setCreateAssignOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDetailAssignment(a)}
                                className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold"
                              >
                                Submissions / Grade
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDetailAssignment(a)}
                              className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold"
                            >
                              {currentUser.role === 'student'
                                ? a.mySubmission
                                  ? 'View Submission'
                                  : 'Open / Submit'
                                : 'Preview'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-500">
                  No assignments scheduled for this course yet.
                </div>
              )}
            </div>
          )}

          {/* RESOURCES TAB */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-black dark:text-white">Lecture Materials & Resources</h3>
                {isOwner && !course.isArchived && (
                  <button
                    onClick={() => setShowResourceModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold"
                  >
                    <i className="fas fa-upload mr-1.5"></i> Upload Resource
                  </button>
                )}
              </div>

              {courseResources.length > 0 ? (
                <div className="space-y-3">
                  {courseResources.map((r) => (
                    <div
                      key={r._id}
                      className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-wrap justify-between items-center gap-3 hover:border-black dark:hover:border-white transition"
                    >
                      <div
                        onClick={() => onSelectResource(r._id)}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-[200px]"
                      >
                        <i className="fas fa-file-alt text-neutral-500 text-xl"></i>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-black dark:text-white hover:underline">{r.title}</h4>
                            {r.isPinned && (
                              <span className="px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold">
                                Pinned
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500">
                            {r.category || 'Material'} • {r.fileSize} • {r.downloads} views
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOwner && (
                          <>
                            <button
                              onClick={() => handleTogglePinResource(r)}
                              className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              title={r.isPinned ? 'Unpin resource' : 'Pin resource'}
                            >
                              <i className="fas fa-thumbtack"></i>
                            </button>
                            {deletingResourceId === r._id ? (
                              <button
                                onClick={() => handleDeleteResource(r._id)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
                              >
                                Confirm Delete
                              </button>
                            ) : (
                              <button
                                onClick={() => setDeletingResourceId(r._id)}
                                className="px-2.5 py-1.5 rounded-lg border border-red-300 dark:border-red-900 text-red-600 text-xs"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => onSelectResource(r._id)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-black dark:text-white"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-500">
                  No lecture materials shared yet.
                </div>
              )}
            </div>
          )}

          {/* DISCUSSIONS TAB */}
          {activeTab === 'discussions' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-black dark:text-white">Course Discussions</h3>
                {canParticipateInDiscussions && (
                  <button
                    onClick={() => setShowDiscussionModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold"
                  >
                    <i className="fas fa-plus mr-1.5"></i> New Discussion
                  </button>
                )}
              </div>

              {!canParticipateInDiscussions && !course.isArchived && (
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
                  Only enrolled students and the course instructor can start discussions or reply in this course.
                </div>
              )}

              {courseDiscussions.length > 0 ? (
                <div className="space-y-3">
                  {courseDiscussions.map((d) => (
                    <div
                      key={d._id}
                      onClick={() => onSelectDiscussion(d._id)}
                      className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-black dark:hover:border-white cursor-pointer transition flex justify-between items-center gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          {d.isPinned && (
                            <span className="px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold">
                              Pinned
                            </span>
                          )}
                          {d.isLocked && (
                            <span className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 text-[10px] font-bold">
                              <i className="fas fa-lock mr-1"></i> Locked
                            </span>
                          )}
                          <h4 className="font-bold text-sm text-black dark:text-white">{d.title}</h4>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          by {d.author.firstName} {d.author.lastName} • {d.repliesCount} replies
                        </p>
                      </div>
                      <span className="text-xs font-bold text-black dark:text-white">Open Thread &rarr;</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-500">
                  No discussions posted in this course yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* UNENROLL CONFIRMATION MODAL */}
      {showUnenrollConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-black dark:text-white">Unenroll from {course.code}?</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              You will lose student access to {course.name} unless you re-enroll using an enrollment code or invite link.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUnenrollConfirm(false)}
                className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnenroll}
                disabled={isUnenrolling}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {isUnenrolling ? 'Unenrolling...' : 'Confirm Unenroll'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW ANNOUNCEMENT MODAL */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-black dark:text-white">New Course Announcement</h3>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-neutral-400 hover:text-black">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Midterm Review Session Schedule"
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Write announcement details for students enrolled in this course..."
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPostingAnn}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold"
                >
                  {isPostingAnn ? 'Publishing...' : 'Post Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD RESOURCE MODAL */}
      {showResourceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-black dark:text-white">Upload Course Resource</h3>
              <button onClick={() => setShowResourceModal(false)} className="text-neutral-400 hover:text-black">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleUploadResource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. Week 5 Lecture Slides"
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Category</label>
                  <select
                    value={resCategory}
                    onChange={(e) => setResCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                  >
                    <option value="lecture">Lecture Notes</option>
                    <option value="reading">Reading</option>
                    <option value="exercise">Exercise</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Source Type</label>
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                  >
                    <option value="file">File Upload</option>
                    <option value="link">External Link</option>
                  </select>
                </div>
              </div>
              {resType === 'file' ? (
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Attach File</label>
                  <input
                    type="file"
                    onChange={(e) => setResFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-neutral-600 dark:text-neutral-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-black file:text-white dark:file:bg-white dark:file:text-black file:text-xs file:font-bold"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">External URL *</label>
                  <input
                    type="url"
                    required
                    value={resLink}
                    onChange={(e) => setResLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={resDescription}
                  onChange={(e) => setResDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingRes}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold"
                >
                  {isUploadingRes ? 'Uploading...' : 'Publish Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW DISCUSSION MODAL */}
      {showDiscussionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-black dark:text-white">Start Discussion in {course.code}</h3>
              <button onClick={() => setShowDiscussionModal(false)} className="text-neutral-400 hover:text-black">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Topic Title *</label>
                <input
                  type="text"
                  required
                  value={discTitle}
                  onChange={(e) => setDiscTitle(e.target.value)}
                  placeholder="Question or discussion subject..."
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Details *</label>
                <textarea
                  rows={4}
                  required
                  value={discContent}
                  onChange={(e) => setDiscContent(e.target.value)}
                  placeholder="Share context, code, or questions with peers and your instructor..."
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={discTags}
                  onChange={(e) => setDiscTags(e.target.value)}
                  placeholder="homework, exam-prep, clarification"
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDiscussionModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPostingDisc}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black text-xs font-bold"
                >
                  {isPostingDisc ? 'Posting...' : 'Post Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COURSE SETTINGS SUITE */}
      <CourseSettingsModal
        course={course}
        isOpen={settingsOpen}
        initialSection={settingsSection}
        onClose={() => setSettingsOpen(false)}
        onCourseUpdated={onRefreshData}
        onCourseDeleted={async () => {
          await onRefreshData();
          onBack();
        }}
        onShowToast={onShowToast}
      />

      {/* ENROLL MODAL */}
      <EnrollCourseModal
        course={showEnrollModal ? course : null}
        currentUser={currentUser}
        onClose={() => setShowEnrollModal(false)}
        onEnrolled={async () => {
          await onRefreshData();
        }}
        onShowToast={onShowToast}
      />

      {/* CREATE / EDIT ASSIGNMENT MODAL */}
      <CreateEditAssignmentModal
        isOpen={createAssignOpen}
        onClose={() => {
          setCreateAssignOpen(false);
          setEditingAssignment(null);
        }}
        courses={courses}
        currentUser={currentUser}
        initialCourseId={course._id}
        editingAssignment={editingAssignment}
        onSaved={async () => {
          await onRefreshData();
        }}
        onShowToast={onShowToast}
      />

      {/* ASSIGNMENT DETAIL / SUBMISSION / GRADING MODAL */}
      <AssignmentDetailModal
        assignment={detailAssignment}
        currentUser={currentUser}
        courses={courses}
        onClose={() => setDetailAssignment(null)}
        onRefresh={onRefreshData}
        onEditAssignment={(a) => {
          setEditingAssignment(a);
          setCreateAssignOpen(true);
        }}
        onAskAiHint={onAskAiHint}
        onShowToast={onShowToast}
      />
    </div>
  );
};
