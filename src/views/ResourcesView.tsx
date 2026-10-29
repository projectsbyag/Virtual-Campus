import React, { useState, useEffect } from 'react';
import { Resource, Course } from '../types';

interface ResourcesViewProps {
  resources: Resource[];
  courses?: Course[];
  onUploadResource: (res: any) => void;
  onAskAiSummarize: (resource: Resource) => void;
  onDownload: (resource: Resource) => void;
  onSelectResource?: (resourceId: string) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  courses = [],
  onUploadResource,
  onAskAiSummarize,
  onDownload,
  onSelectResource,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'slides' | 'archive' | 'doc'>('pdf');
  const [targetCourseId, setTargetCourseId] = useState(courses[0]?._id || '');

  useEffect(() => {
    if (!targetCourseId && courses.length > 0) {
      setTargetCourseId(courses[0]._id);
    }
  }, [courses, targetCourseId]);

  const filtered = resources.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || r.fileType === typeFilter;
    return matchesSearch && matchesType;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <i className="fas fa-file-pdf text-red-500 text-2xl"></i>;
      case 'slides':
        return <i className="fas fa-file-powerpoint text-amber-500 text-2xl"></i>;
      case 'archive':
        return <i className="fas fa-file-archive text-purple-500 text-2xl"></i>;
      default:
        return <i className="fas fa-file-alt text-primary text-2xl"></i>;
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onUploadResource({
      title: title.trim(),
      description: description.trim(),
      fileType,
      course: targetCourseId || courses[0]?._id,
      tags: ['Study Notes']
    });

    setIsUploadOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resources</h1>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="mt-2 sm:mt-0 px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg transition text-sm font-medium flex items-center space-x-2"
        >
          <i className="fas fa-upload text-xs"></i>
          <span>Upload Resource</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources by title or keywords..."
            className="pl-10 pr-4 py-2 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <i className="fas fa-search text-gray-400"></i>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {['All', 'pdf', 'slides', 'archive'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition ${
                typeFilter === t
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((resource) => {
          const course = typeof resource.course === 'object' ? resource.course : null;
          const courseCode = course ? course.code : '';
          const courseColor = course ? course.color || '#5D5CDE' : '#5D5CDE';

          return (
            <div
              key={resource._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(resource.fileType)}
                    <div>
                      <span
                        className="px-2 py-0.5 text-xs rounded-full font-medium"
                        style={{
                          backgroundColor: `${courseColor}25`,
                          color: courseColor,
                        }}
                      >
                        {courseCode}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">{resource.fileSize} • {resource.createdAt}</p>
                    </div>
                  </div>

                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <i className="fas fa-download text-gray-400"></i> {resource.downloads}
                  </span>
                </div>

                <h3
                  onClick={() => onSelectResource?.(resource._id)}
                  className="font-semibold text-base text-gray-900 dark:text-white mt-3 hover:text-primary dark:hover:text-primaryLight cursor-pointer transition"
                  data-user-content="true"
                >
                  {resource.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {resource.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  by {resource.uploadedBy.firstName} {resource.uploadedBy.lastName}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAskAiSummarize(resource)}
                    className="text-xs text-black dark:text-white hover:underline font-medium flex items-center gap-1"
                  >
                    <i className="fas fa-robot text-xs"></i>
                    <span>AI Summary</span>
                  </button>

                  <button
                    onClick={() => onDownload(resource)}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-750 hover:bg-gray-200 text-gray-800 dark:text-gray-200 rounded text-xs font-medium transition"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upload Course Resource</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              {courses.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Target Course</label>
                  <select
                    value={targetCourseId}
                    onChange={(e) => setTargetCourseId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.code}: {c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midterm 1 Cheat Sheet"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">File Type</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="slides">Slides (PowerPoint / PDF)</option>
                  <option value="archive">Code / ZIP Archive</option>
                  <option value="doc">Notes / Doc</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this material..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg transition"
                >
                  Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
