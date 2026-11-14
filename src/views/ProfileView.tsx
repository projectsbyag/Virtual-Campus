import React, { useState, useEffect } from 'react';
import { User, Course, Assignment, ActiveView, DEFAULT_AVATAR } from '../types';
import { apiService } from '../services/api';

interface ProfileViewProps {
  currentUser: User | null;
  courses: Course[];
  assignments?: Assignment[];
  setCurrentView: (view: ActiveView, params?: any) => void;
  onUpdateUser: (updated: Partial<User>) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  courses,
  assignments = [],
  setCurrentView,
  onUpdateUser,
  onShowToast,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState(currentUser?.firstName || '');
  const [editLastName, setEditLastName] = useState(currentUser?.lastName || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editDepartment, setEditDepartment] = useState(currentUser?.department || 'Computer Science');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(
    currentUser?.avatarUrl && currentUser.avatarUrl !== DEFAULT_AVATAR ? currentUser.avatarUrl : ''
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setEditFirstName(currentUser.firstName);
      setEditLastName(currentUser.lastName);
      setEditBio(currentUser.bio || '');
      setEditDepartment(currentUser.department || 'Computer Science');
      setAvatarPreview(
        currentUser.avatarUrl && currentUser.avatarUrl !== DEFAULT_AVATAR ? currentUser.avatarUrl : ''
      );
    }
  }, [currentUser, isEditModalOpen]);

  if (!currentUser) return null;

  const isInstructor = currentUser.role === 'instructor' || currentUser.role === 'admin';
  const myCourses = courses.filter((c) =>
    isInstructor ? Boolean(c.isTeaching || c.instructor?._id === currentUser._id) : Boolean(c.isEnrolled)
  );
  const myCourseIds = new Set(myCourses.map((c) => c._id));
  const myAssignments = assignments.filter((a) => {
    const cId = typeof a.course === 'object' ? a.course._id : a.course;
    return myCourseIds.has(cId);
  });

  const gradedAssignments = myAssignments.filter((a) => a.status === 'graded' && a.grade !== undefined);
  const avgPct =
    gradedAssignments.length > 0
      ? (
          gradedAssignments.reduce(
            (sum, a) => sum + ((a.grade || 0) / (a.pointsPossible ?? a.points ?? 100)) * 100,
            0
          ) / gradedAssignments.length
        ).toFixed(1)
      : null;

  const completedTasks = myAssignments.filter((a) => a.status === 'submitted' || a.status === 'graded').length;
  const totalSubmissionsAcrossCourses = myAssignments.reduce(
    (sum, a) => sum + (a.submissions?.length || 0),
    0
  );

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let updatedUser = await apiService.updateProfile({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        bio: editBio.trim(),
        department: editDepartment.trim(),
      });

      if (avatarFile) {
        try {
          updatedUser = await apiService.uploadAvatar(avatarFile);
        } catch {
          // If avatar upload route isn't active on backend, keep local preview
        }
      }

      onUpdateUser(updatedUser);
      onShowToast?.('Profile updated successfully!', 'success');
      setAvatarFile(null);
      setIsEditModalOpen(false);
    } catch (err: any) {
      onShowToast?.(err?.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fade-in space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">My Profile</h1>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl transition text-xs font-bold flex items-center gap-1.5"
        >
          <i className="fas fa-edit"></i>
          <span>Edit Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-6">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="relative">
                <img
                  src={currentUser.avatarUrl || currentUser.avatar || DEFAULT_AVATAR}
                  alt={currentUser.firstName}
                  className="w-24 h-24 rounded-full object-cover mb-3 shadow border-2 border-neutral-200 dark:border-neutral-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                  }}
                />
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-2 right-0 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-full w-8 h-8 flex items-center justify-center text-xs shadow"
                >
                  <i className="fas fa-camera"></i>
                </button>
              </div>

              <h2 className="text-xl font-black text-black dark:text-white">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="mt-1 text-xs text-neutral-500">{currentUser.email}</p>
              {currentUser.bio && (
                <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">{currentUser.bio}</p>
              )}
              <div className="mt-3 px-3 py-1 text-xs rounded-full bg-black text-white dark:bg-white dark:text-black capitalize font-bold">
                {currentUser.role} • {currentUser.department}
              </div>
            </div>

            <div className="mt-6 border-t border-neutral-200 dark:border-neutral-800 pt-4 text-xs text-neutral-500 space-y-2.5">
              <div className="flex justify-between">
                <span>Role</span>
                <span className="font-bold text-black dark:text-white capitalize">{currentUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span>Department</span>
                <span className="font-bold text-black dark:text-white">{currentUser.department}</span>
              </div>
              <div className="flex justify-between">
                <span>{isInstructor ? 'Courses Taught' : 'Enrolled Courses'}</span>
                <span className="font-bold text-black dark:text-white">{myCourses.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-6">
            <h3 className="font-bold text-sm text-black dark:text-white mb-3">Quick Links</h3>
            <div className="space-y-1 text-xs font-semibold">
              {[
                { view: 'courses' as const, icon: 'fas fa-book', label: isInstructor ? 'My Taught Courses' : 'My Courses' },
                { view: 'assignments' as const, icon: 'fas fa-tasks', label: 'Assignments' },
                { view: 'discussions' as const, icon: 'fas fa-comments', label: 'Discussions' },
                { view: 'resources' as const, icon: 'fas fa-file-alt', label: 'Resources' },
                { view: 'settings' as const, icon: 'fas fa-cog', label: 'Account Settings' },
              ].map((link) => (
                <button
                  key={link.view}
                  onClick={() => setCurrentView(link.view)}
                  className="w-full flex items-center p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition text-left"
                >
                  <i className={`${link.icon} mr-3 w-4 text-black dark:text-white`}></i>
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Academic Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-6">
            <h3 className="font-bold text-base text-black dark:text-white mb-4">
              {isInstructor ? 'Instruction & Grading Overview' : 'Academic Performance Overview'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl text-center">
                <span className="text-xs text-neutral-500">
                  {isInstructor ? 'Total Students' : 'Average Grade'}
                </span>
                <p className="text-2xl font-black text-black dark:text-white mt-1">
                  {isInstructor
                    ? myCourses.reduce((sum, c) => sum + (c.studentsCount || 0), 0)
                    : avgPct !== null
                    ? `${avgPct}%`
                    : 'N/A'}
                </p>
              </div>

              <div className="p-4 bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl text-center">
                <span className="text-xs text-neutral-500">
                  {isInstructor ? 'Published Assignments' : 'Completed Tasks'}
                </span>
                <p className="text-2xl font-black text-black dark:text-white mt-1">
                  {isInstructor ? myAssignments.length : `${completedTasks} / ${myAssignments.length}`}
                </p>
              </div>

              <div className="p-4 bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl text-center">
                <span className="text-xs text-neutral-500">
                  {isInstructor ? 'Student Submissions' : 'Graded Assignments'}
                </span>
                <p className="text-2xl font-black text-black dark:text-white mt-1">
                  {isInstructor ? totalSubmissionsAcrossCourses : gradedAssignments.length}
                </p>
              </div>
            </div>

            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
              {isInstructor ? 'Courses You Teach' : 'Enrolled Courses'}
            </h4>
            {myCourses.length > 0 ? (
              <div className="space-y-2.5">
                {myCourses.map((c) => (
                  <div
                    key={c._id}
                    className="p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-xl flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-black text-black dark:text-white mr-2">{c.code}</span>
                      <span className="text-neutral-700 dark:text-neutral-300 font-semibold">{c.name}</span>
                    </div>
                    <span className="font-mono text-neutral-500">{c.studentsCount || 0} students</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500">
                {isInstructor ? 'You have not created any courses yet.' : 'You are not enrolled in any courses yet.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-black dark:text-white">Edit Academic Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-neutral-400 hover:text-black">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Department</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                />
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Display Picture</label>
                <div className="flex items-center gap-3">
                  <img
                    src={avatarPreview.trim() || DEFAULT_AVATAR}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                    }}
                  />
                  <label className="cursor-pointer px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-bold">
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Academic Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-neutral-300 dark:border-neutral-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
