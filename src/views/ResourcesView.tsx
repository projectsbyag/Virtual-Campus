import React, { useState, useEffect } from 'react';
import { Resource, Course, User } from '../types';
import { apiService } from '../services/api';

interface ResourcesViewProps {
  resources: Resource[];
  courses: Course[];
  currentUser: User | null;
  onRefreshData: () => Promise<void>;
  onAskAiSummarize: (resource: Resource) => void;
  onSelectResource: (resourceId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  courses,
  currentUser,
  onRefreshData,
  onAskAiSummarize,
  onSelectResource,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const isInstructorOrAdmin = currentUser?.role === 'instructor' || currentUser?.role === 'admin';
  const teachableCourses = courses.filter(
    (c) =>
      !c.isArchived &&
      (currentUser?.role === 'admin' ||
        c.isTeaching ||
        (currentUser && c.instructor?._id === currentUser._id))
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'lecture' | 'reading' | 'exercise' | 'tutorial' | 'other'>('lecture');
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetCourseId, setTargetCourseId] = useState(teachableCourses[0]?._id || '');
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if ((!targetCourseId || !teachableCourses.some((c) => c._id === targetCourseId)) && teachableCourses.length > 0) {
      setTargetCourseId(teachableCourses[0]._id);
    }
  }, [courses, currentUser?._id, isUploadOpen]);

  const filtered = resources
    .filter((r) => {
      const cId = typeof r.course === 'object' ? r.course._id : r.course;
      const matchesCourse = courseFilter === 'all' || cId === courseFilter;
      const matchesSearch =
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'All' || r.fileType === typeFilter;
      return matchesCourse && matchesSearch && matchesType;
    })
    .sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)));

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <i className="fas fa-file-pdf text-red-500 text-2xl"></i>;
      case 'slides':
        return <i className="fas fa-file-powerpoint text-amber-500 text-2xl"></i>;
      case 'archive':
        return <i className="fas fa-file-archive text-purple-500 text-2xl"></i>;
      default:
        return <i className="fas fa-file-alt text-neutral-600 dark:text-neutral-300 text-2xl"></i>;
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetCourseId) return;
    setIsUploading(true);
    try {
      await apiService.uploadResource({
        title: title.trim(),
        description: description.trim(),
        course: targetCourseId,
        type: uploadType,
        category,
        link: uploadType === 'link' ? linkUrl.trim() : undefined,
        file: uploadType === 'file' ? selectedFile || undefined : undefined,
        isVisible: true,
      });
      onShowToast('Resource published successfully!', 'success');
      setIsUploadOpen(false);
      setTitle('');
      setDescription('');
      setLinkUrl('');
      setSelectedFile(null);
      await onRefreshData();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to upload resource.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTogglePin = async (r: Resource) => {
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
      onShowToast(err?.message || 'Failed to update pin status.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteResource(id);
      onShowToast('Resource deleted.', 'info');
      setDeletingId(null);
      await onRefreshData();
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to delete resource.', 'error');
    }
  };

  return (
    <div className="fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">Resources</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isInstructorOrAdmin
              ? 'Publish, organize, and pin lecture notes, readings, and references for your courses.'
              : 'Browse and download lecture notes, slides, and reference guides from your enrolled courses.'}
          </p>
        </div>
        {isInstructorOrAdmin && (
          <button
            onClick={() => {
              if (teachableCourses.length === 0) {
                onShowToast('Create an active course first before uploading resources.', 'error');
                return;
              }
              setIsUploadOpen(true);
            }}
            className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl transition text-xs font-bold flex items-center gap-2 shadow-xs"
          >
            <i className="fas fa-upload"></i>
            <span>Upload Resource</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources by title or keywords..."
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
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>

        <div className="flex gap-1.5 overflow-x-auto">
          {['All', 'pdf', 'slides', 'archive'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase transition ${
                typeFilter === t
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((resource) => {
            const course = typeof resource.course === 'object' ? resource.course : null;
            const courseCode = course ? course.code : 'CRS';
            const canManage = Boolean(
              currentUser &&
                (currentUser.role === 'admin' ||
                  course?.isTeaching ||
                  course?.instructor?._id === currentUser._id ||
                  resource.uploadedBy?._id === currentUser._id)
            );

            return (
              <div
                key={resource._id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs p-5 flex flex-col justify-between hover:border-black dark:hover:border-white transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {getFileIcon(resource.fileType)}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 text-[11px] rounded font-black bg-black text-white dark:bg-white dark:text-black">
                            {courseCode}
                          </span>
                          {resource.isPinned && (
                            <span className="px-2 py-0.5 text-[10px] rounded-full font-bold bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white">
                              Pinned
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          {resource.category || 'Material'} • {resource.fileSize} • {resource.createdAt}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                      <i className="fas fa-eye text-neutral-400"></i> {resource.downloads}
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectResource(resource._id)}
                    className="font-bold text-base text-black dark:text-white mt-3 hover:underline cursor-pointer"
                  >
                    {resource.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                    {resource.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-neutral-500">
                    by {resource.uploadedBy.firstName} {resource.uploadedBy.lastName}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAskAiSummarize(resource)}
                      className="text-xs text-black dark:text-white hover:underline font-bold flex items-center gap-1"
                    >
                      <i className="fas fa-robot"></i>
                      <span>AI Summary</span>
                    </button>

                    {canManage && isInstructorOrAdmin && (
                      <button
                        onClick={() => handleTogglePin(resource)}
                        className="px-2 py-1 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        title={resource.isPinned ? 'Unpin' : 'Pin'}
                      >
                        <i className="fas fa-thumbtack"></i>
                      </button>
                    )}

                    {canManage &&
                      (deletingId === resource._id ? (
                        <button
                          onClick={() => handleDelete(resource._id)}
                          className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold"
                        >
                          Confirm Delete
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeletingId(resource._id)}
                          className="px-2 py-1 border border-red-300 dark:border-red-900 text-red-600 rounded-lg text-xs"
                          title="Delete resource"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      ))}

                    {resource.fileUrl && resource.fileUrl !== '#' ? (
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          apiService.recordResourceView(resource._id).catch(() => {});
                        }}
                        className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-lg text-xs font-bold transition"
                      >
                        Download / Open
                      </a>
                    ) : (
                      <button
                        onClick={() => onSelectResource(resource._id)}
                        className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg text-xs font-bold"
                      >
                        View
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
          <i className="fas fa-folder-open text-2xl text-neutral-400"></i>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No resources found matching your filters.
          </p>
        </div>
      )}

      {/* Upload Modal (Instructor/Admin Only) */}
      {isUploadOpen && isInstructorOrAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
              <h3 className="text-lg font-bold text-black dark:text-white">Upload Course Resource</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-neutral-400 hover:text-black">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Course *</label>
                <select
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white"
                >
                  {teachableCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code}: {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midterm 1 Study Guide"
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
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
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                  >
                    <option value="file">File Upload</option>
                    <option value="link">External URL</option>
                  </select>
                </div>
              </div>

              {uploadType === 'file' ? (
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Select File</label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-neutral-600 dark:text-neutral-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-black file:text-white dark:file:bg-white dark:file:text-black file:text-xs file:font-bold"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Resource URL *</label>
                  <input
                    type="url"
                    required
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this material..."
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-black dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-neutral-300 dark:border-neutral-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl transition disabled:opacity-60"
                >
                  {isUploading ? 'Uploading...' : 'Publish Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
