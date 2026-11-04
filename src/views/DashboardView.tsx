import React, { useState } from 'react';
import { User, Course, Assignment, Discussion, Announcement, ActiveView, DEFAULT_AVATAR } from '../types';

interface DashboardViewProps {
  currentUser: User;
  courses: Course[];
  assignments: Assignment[];
  discussions: Discussion[];
  announcements?: Announcement[];
  setCurrentView: (view: ActiveView, params?: any) => void;
  onSelectCourse: (courseId: string) => void;
  onSelectAssignment: (assignment: Assignment) => void;
  onSelectDiscussion: (discussionId: string) => void;
  onAskAiPrompt: (prompt: string) => void;
  onRefreshData?: () => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  courses,
  assignments,
  discussions,
  announcements = [],
  setCurrentView,
  onSelectCourse,
  onSelectAssignment,
  onSelectDiscussion,
  onAskAiPrompt,
  onRefreshData,
}) => {
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const isInstructor = currentUser.role === 'instructor';
  const enrolledCourses = courses.filter((c) => c.isEnrolled || isInstructor);
  const pendingAssignments = assignments.filter((a) => a.status === 'pending');
  const submittedAssignments = assignments.filter((a) => a.status === 'submitted' || a.status === 'graded');

  // Next most urgent assignment
  const sortedPending = [...pendingAssignments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
  const nextUrgentAssignment = sortedPending[0];

  const handleAiSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptInput.trim()) return;
    onAskAiPrompt(aiPromptInput.trim());
    setCurrentView('campus-ai');
  };

  const handleManualSync = async () => {
    if (!onRefreshData || isSyncing) return;
    setIsSyncing(true);
    try {
      await onRefreshData();
    } finally {
      setIsSyncing(false);
    }
  };

  const userAvatar = currentUser.avatarUrl || currentUser.avatar || DEFAULT_AVATAR;

  return (
    <div className="space-y-6 pb-12 fade-in max-w-7xl mx-auto">
      
      {/* ==================== TOP ACADEMIC HUD ==================== */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs relative overflow-hidden">
        {/* Subtle decorative grid motif */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-neutral-200/40 dark:from-neutral-800/20 to-transparent pointer-events-none -z-0"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Identity & Department */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={userAvatar}
                alt={currentUser.name || currentUser.firstName}
                className="w-16 h-16 rounded-2xl object-cover bg-neutral-100 dark:bg-neutral-800 border-2 border-black dark:border-white shadow-xs shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                }}
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black dark:bg-white border-2 border-white dark:border-neutral-900 flex items-center justify-center">
                <i className="fas fa-check text-[8px] text-white dark:text-black"></i>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black">
                  {isInstructor ? 'Faculty / Instructor' : 'Enrolled Student'}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                  {currentUser.matricNumber || (isInstructor ? 'FAC-CS-01' : 'STU-2026-089')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
                {currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                {currentUser.department} • Spring Semester 2026
              </p>
            </div>
          </div>

          {/* Quick Command Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setCurrentView('courses')}
              className="px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <i className="fas fa-book-open text-xs"></i>
              <span>{isInstructor ? 'Manage Courses' : 'Browse Courses'}</span>
            </button>

            <button
              onClick={() => setCurrentView('campus-ai')}
              className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fas fa-robot text-xs"></i>
              <span>Launch Campus AI</span>
            </button>

            {onRefreshData && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 transition cursor-pointer disabled:opacity-60"
                title="Sync latest live database changes"
              >
                <i className={`fas fa-sync-alt text-xs ${isSyncing ? 'fa-spin' : ''}`}></i>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ==================== ACADEMIC TELEMETRY BENTO ==================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Courses */}
        <div 
          onClick={() => setCurrentView('courses')}
          className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {isInstructor ? 'Courses Teaching' : 'Active Curriculum'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white group-hover:scale-110 transition-transform">
              <i className="fas fa-book-open text-xs"></i>
            </div>
          </div>
          <div className="text-3xl font-black text-black dark:text-white tracking-tight">
            {enrolledCourses.length}
          </div>
          <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <span className="font-semibold text-black dark:text-white">
              {enrolledCourses.reduce((sum, c) => sum + (c.creditUnits || 3), 0)} Credits
            </span>
            <span>• Verified Syllabus</span>
          </div>
        </div>

        {/* Metric 2: Pending Assignments */}
        <div 
          onClick={() => setCurrentView('assignments')}
          className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {isInstructor ? 'Submissions' : 'Pending Deadlines'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white group-hover:scale-110 transition-transform">
              <i className="fas fa-calendar-check text-xs"></i>
            </div>
          </div>
          <div className="text-3xl font-black text-black dark:text-white tracking-tight">
            {pendingAssignments.length}
          </div>
          <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 truncate">
            {nextUrgentAssignment ? (
              <>
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
                <span className="truncate">Next: {nextUrgentAssignment.title.slice(0, 18)}...</span>
              </>
            ) : (
              <span>All caught up!</span>
            )}
          </div>
        </div>

        {/* Metric 3: Campus AI Grounding */}
        <div 
          onClick={() => setCurrentView('campus-ai')}
          className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Campus AI Tutor
            </span>
            <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fas fa-bolt text-xs"></i>
            </div>
          </div>
          <div className="text-3xl font-black text-black dark:text-white tracking-tight flex items-center gap-2">
            <span>24/7</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold uppercase tracking-wider">
              Ready
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Syllabus-aligned math & code helper
          </div>
        </div>

        {/* Metric 4: Academic Discussions */}
        <div 
          onClick={() => setCurrentView('discussions')}
          className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Campus Discourse
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white group-hover:scale-110 transition-transform">
              <i className="fas fa-comments text-xs"></i>
            </div>
          </div>
          <div className="text-3xl font-black text-black dark:text-white tracking-tight">
            {discussions.length}
          </div>
          <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Active peer threads & TA responses
          </div>
        </div>

      </div>

      {/* ==================== CAMPUS AI INTELLIGENT STARTER BAR ==================== */}
      <div className="rounded-2xl bg-neutral-900 text-white dark:bg-black dark:border dark:border-neutral-800 p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Campus AI Study & Derivation Assistant
              </h2>
              <p className="text-xs text-neutral-400">
                Type any homework problem, concept, or exam prep query for step-by-step guidance.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('campus-ai')}
            className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <span>Open Dedicated Chat Canvas</span>
            <i className="fas fa-arrow-right text-[10px]"></i>
          </button>
        </div>

        <form onSubmit={handleAiSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs"></i>
            <input
              type="text"
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              placeholder="e.g. Explain Bellman-Ford negative cycle proof or give me a practice quiz on Raft..."
              className="w-full pl-9 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs sm:text-sm transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <i className="fas fa-paper-plane text-xs"></i>
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>

        {/* Quick Query Pills */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 self-center mr-1">
            Curriculum Starters:
          </span>
          <button
            type="button"
            onClick={() => {
              onAskAiPrompt('Explain how Bellman-Ford detects negative weight cycles in graphs, and why we need V-1 relaxations.');
              setCurrentView('campus-ai');
            }}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition cursor-pointer text-xs"
          >
            ⚡ Bellman-Ford Negative Cycles
          </button>
          <button
            type="button"
            onClick={() => {
              onAskAiPrompt('Simulate a 5-node Raft consensus cluster with a network partition. How does leader election resolve?');
              setCurrentView('campus-ai');
            }}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition cursor-pointer text-xs"
          >
            🛡️ Raft Consensus Partitions
          </button>
          <button
            type="button"
            onClick={() => {
              onAskAiPrompt('Derive the Transformer Scaled Dot-Product Attention formula and explain the 1/sqrt(d_k) scaling factor.');
              setCurrentView('campus-ai');
            }}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition cursor-pointer text-xs"
          >
            🧠 Transformer Attention Derivation
          </button>
        </div>
      </div>

      {/* ==================== MAIN SPLIT WORKSPACE ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active Courses & Syllabi */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Courses Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">
                {isInstructor ? 'Course Curriculum Under Instruction' : 'Current Course Enrolments'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Syllabus progress, downloadable materials, and enrolled peer rosters.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('courses')}
              className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Browse All</span>
              <i className="fas fa-chevron-right text-[10px]"></i>
            </button>
          </div>

          {/* Courses Cards Grid */}
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enrolledCourses.map((course) => {
                const instructorName = course.instructor
                  ? `${course.instructor.firstName} ${course.instructor.lastName}`
                  : 'Prof. Faculty';

                return (
                  <div
                    key={course._id}
                    onClick={() => onSelectCourse(course._id)}
                    className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition cursor-pointer flex flex-col justify-between group shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-md text-xs font-black tracking-wider bg-black text-white dark:bg-white dark:text-black">
                          {course.code}
                        </span>
                        <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 font-mono">
                          {course.creditUnits || 3} Credits
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-black dark:text-white mb-1 group-hover:underline line-clamp-1">
                        {course.name}
                      </h3>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-black dark:text-white">
                          <i className="fas fa-user-tie"></i>
                        </div>
                        <span className="text-neutral-700 dark:text-neutral-300 font-medium truncate max-w-[120px]">
                          {instructorName}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAskAiPrompt(`Give me an exam practice quiz for course ${course.code} - ${course.name}`);
                          setCurrentView('campus-ai');
                        }}
                        className="text-[11px] font-bold text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1"
                        title="Generate practice quiz for this course"
                      >
                        <i className="fas fa-bolt text-[10px]"></i>
                        <span>AI Tutor</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add Course Card */}
              <div
                onClick={() => setCurrentView('courses')}
                className="p-6 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-white transition flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px] group bg-neutral-50/50 dark:bg-neutral-900/30"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <i className="fas fa-plus text-sm"></i>
                </div>
                <h4 className="text-xs font-bold text-black dark:text-white">
                  {isInstructor ? 'Create or Manage Course' : 'Enroll in Another Course'}
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Expand your academic semester curriculum
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
              <i className="fas fa-book-reader text-3xl text-neutral-400 mb-3"></i>
              <h3 className="text-base font-bold text-black dark:text-white">No courses loaded yet</h3>
              <p className="text-xs text-neutral-500 mb-4 max-w-sm mx-auto">
                Explore the academic course catalog and enroll in modules for this semester.
              </p>
              <button
                onClick={() => setCurrentView('courses')}
                className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-xs font-bold cursor-pointer transition shadow-xs"
              >
                Explore Course Catalog
              </button>
            </div>
          )}

          {/* Peer Discourse & Discussion Activity */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-black dark:text-white tracking-tight">
                Academic Discourse & Questions
              </h2>
              <button
                onClick={() => setCurrentView('discussions')}
                className="text-xs font-bold text-black dark:text-white hover:underline cursor-pointer"
              >
                View Discussions →
              </button>
            </div>

            <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800/80 shadow-xs overflow-hidden">
              {discussions.length > 0 ? (
                discussions.slice(0, 3).map((disc) => (
                  <div
                    key={disc._id}
                    onClick={() => onSelectDiscussion(disc._id)}
                    className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-850/50 transition cursor-pointer flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {disc.courseCode && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white">
                            {disc.courseCode}
                          </span>
                        )}
                        <h4 className="text-xs sm:text-sm font-bold text-black dark:text-white line-clamp-1">
                          {disc.title}
                        </h4>
                      </div>
                      <p className="text-xs text-neutral-500 line-clamp-1">
                        {disc.content}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
                        <i className="far fa-comment"></i>
                        <span>{disc.replies?.length || 0}</span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-neutral-500">
                  No discussion threads posted yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Deadlines Radar & Campus Bulletins */}
        <div className="space-y-6">
          
          {/* Upcoming Deadlines Radar */}
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <i className="fas fa-clock text-xs text-black dark:text-white"></i>
                <h3 className="text-sm font-bold text-black dark:text-white tracking-tight">
                  Upcoming Deadlines Radar
                </h3>
              </div>
              <button
                onClick={() => setCurrentView('assignments')}
                className="text-xs font-bold text-black dark:text-white hover:underline cursor-pointer"
              >
                All ({assignments.length})
              </button>
            </div>

            {pendingAssignments.length > 0 ? (
              <div className="space-y-3">
                {pendingAssignments.slice(0, 4).map((assignment) => {
                  const dueDate = new Date(assignment.dueDate);
                  const now = new Date();
                  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const isUrgent = diffDays <= 3;

                  return (
                    <div
                      key={assignment._id}
                      onClick={() => onSelectAssignment(assignment)}
                      className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition cursor-pointer group bg-neutral-50/50 dark:bg-neutral-850/40"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-black text-white dark:bg-white dark:text-black">
                          {assignment.courseCode || 'CSC'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isUrgent
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                        }`}>
                          {diffDays <= 0 ? 'Due Today' : diffDays === 1 ? 'Tomorrow' : `${diffDays} days left`}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-black dark:text-white group-hover:underline line-clamp-1">
                        {assignment.title}
                      </h4>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
                        <span>{assignment.points || 100} Points</span>
                        <span className="font-semibold text-black dark:text-white group-hover:translate-x-0.5 transition-transform">
                          Submit Solution →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-neutral-500">
                <i className="fas fa-check-circle text-lg text-black dark:text-white mb-2"></i>
                <p className="font-semibold text-black dark:text-white">All homework submitted!</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">No urgent deliverables pending.</p>
              </div>
            )}
          </div>

          {/* University Bulletins & Notices */}
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <i className="fas fa-bullhorn text-xs text-black dark:text-white"></i>
                <h3 className="text-sm font-bold text-black dark:text-white tracking-tight">
                  University Bulletins
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-neutral-400">Spring '26</span>
            </div>

            <div className="space-y-3 text-xs">
              {announcements.length > 0 ? (
                announcements.slice(0, 3).map((ann, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-150 dark:border-neutral-800">
                    <h5 className="font-bold text-black dark:text-white mb-1 text-xs">
                      {ann.title}
                    </h5>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {ann.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-150 dark:border-neutral-800">
                  <h5 className="font-bold text-black dark:text-white mb-1">
                    Midterm Examination Logistics & Reference Sheets
                  </h5>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                    Spring 2026 exams will take place in Turing Hall. One double-sided formula sheet permitted.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
