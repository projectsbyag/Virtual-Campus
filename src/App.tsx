import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';

import { LandingPageView } from './views/LandingPageView';
import { DashboardView } from './views/DashboardView';
import { CoursesView } from './views/CoursesView';
import { CourseDetailView } from './views/CourseDetailView';
import { AssignmentsView } from './views/AssignmentsView';
import { ResourcesView } from './views/ResourcesView';
import { ResourceDetailView } from './views/ResourceDetailView';
import { DiscussionsView } from './views/DiscussionsView';
import { DiscussionDetailView } from './views/DiscussionDetailView';
import { AnnouncementsView } from './views/AnnouncementsView';
import { CampusAiView } from './views/CampusAiView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';

import { apiService } from './services/api';
import { campusAiService } from './services/campusAiService';
import { User, Course, Assignment, Resource, Discussion, Announcement, ActiveView } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(() => apiService.getCurrentUser());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('info');

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // State data collections
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const loadLiveData = async () => {
    // Only attempt live data fetch if an authenticated session token exists
    if (!apiService.getToken()) return;

    try {
      const [cList, aList, rList, dList, annList] = await Promise.all([
        apiService.getCourses(),
        apiService.getAssignments(),
        apiService.getResources(),
        apiService.getDiscussions(),
        apiService.getAnnouncements(),
      ]);
      setCourses(cList);
      setAssignments(aList);
      setResources(rList);
      setDiscussions(dList);
      setAnnouncements(annList);
    } catch (err: any) {
      if (err?.message?.includes('Session expired') || err?.message?.includes('unauthorized')) {
        apiService.logout();
        setCurrentUser(null);
        setCurrentView('landing');
      } else {
        console.warn('Fetch error:', err);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initAndLoad = async () => {
      try {
        const user = await apiService.initSession();
        if (isMounted) {
          if (user) {
            setCurrentUser(user);
            await loadLiveData();
          } else {
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.warn('Session check:', err);
      }
    };
    initAndLoad();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleLogout = () => {
    apiService.logout();
    setCurrentUser(null);
    setCurrentView('landing');
    setCourses([]);
    setAssignments([]);
    setResources([]);
    setDiscussions([]);
    setAnnouncements([]);
    showToast('Logged out successfully', 'info');
  };

  const [isLoggingInDemo, setIsLoggingInDemo] = useState(false);

  const handleQuickDemoLogin = async () => {
    setIsLoggingInDemo(true);
    try {
      const { user } = await apiService.login('alex.johnson@campus.edu', 'Password123!');
      setCurrentUser(user);
      setCurrentView('dashboard');
      showToast(`Welcome to Campus, ${user.firstName}! (Student Demo)`, 'success');
      await loadLiveData();
    } catch (err: any) {
      showToast(err?.message || 'Unable to log in as demo student. Please check network.', 'error');
    } finally {
      setIsLoggingInDemo(false);
    }
  };

  const handleAuthSuccess = async (u: User) => {
    setCurrentUser(u);
    setCurrentView('dashboard');
    showToast(`Welcome back, ${u.firstName}!`, 'success');
    await loadLiveData();
  };

  const handleEnrollCourse = async (courseId: string) => {
    try {
      const updated = await apiService.enrollCourse(courseId);
      setCourses([...updated]);
      showToast('Successfully enrolled in course!', 'success');
      await loadLiveData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to enroll in course', 'error');
    }
  };

  const handleSubmitAssignment = async (assignmentId: string, fileName: string) => {
    try {
      const updated = await apiService.submitAssignment(assignmentId, fileName);
      setAssignments((prev) => prev.map((a) => (a._id === assignmentId ? updated : a)));
      showToast(`Submitted assignment (${fileName})`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to submit assignment', 'error');
    }
  };

  const handleUploadResource = async (res: any) => {
    try {
      const newRes = await apiService.uploadResource(res);
      setResources((prev) => [newRes, ...prev]);
      showToast('Resource published successfully!', 'success');
      await loadLiveData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload resource', 'error');
    }
  };

  const handleCreateDiscussion = async (title: string, content: string, courseId: string) => {
    try {
      const newD = await apiService.createDiscussion(title, content, courseId, ['General']);
      setDiscussions((prev) => [newD, ...prev]);
      showToast('Discussion posted!', 'success');
      await loadLiveData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to create discussion', 'error');
    }
  };

  const handleAddReply = async (discussionId: string, content: string) => {
    try {
      const updated = await apiService.addReply(discussionId, content);
      setDiscussions((prev) => prev.map((d) => (d._id === discussionId ? updated : d)));
      showToast('Reply posted!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to post reply', 'error');
    }
  };

  const handleUpvoteDiscussion = async (discussionId: string) => {
    await apiService.upvoteDiscussion(discussionId);
    setDiscussions((prev) =>
      prev.map((d) => (d._id === discussionId ? { ...d, upvotes: d.upvotes + 1 } : d))
    );
  };

  const handleDownloadResource = (r: Resource) => {
    showToast(`Downloading ${r.title}...`, 'info');
    setResources((prev) =>
      prev.map((item) => (item._id === r._id ? { ...item, downloads: item.downloads + 1 } : item))
    );
  };

  const handleAskAiPrompt = (prompt: string) => {
    campusAiService.addUserMessage(prompt);
    setCurrentView('campus-ai');
  };

  const handleAskAiCourse = (course: Course) => {
    handleAskAiPrompt(`Explain the key concepts, syllabus expectations, and exam preparation tips for ${course.code}: ${course.name}.`);
  };

  const handleAskAiHint = (assignment: Assignment) => {
    handleAskAiPrompt(`Give me a conceptual hint on how to solve this homework: "${assignment.title}". Context: "${assignment.description}".`);
  };

  const handleAskAiSummarize = (resource: Resource) => {
    handleAskAiPrompt(`Please summarize the core academic takeaways from the document "${resource.title}".`);
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView('course-detail');
  };

  const handleSelectResource = (resourceId: string) => {
    setSelectedResourceId(resourceId);
    setCurrentView('resource-detail');
  };

  const handleSelectDiscussion = (discussionId: string) => {
    setSelectedDiscussionId(discussionId);
    setCurrentView('discussion-detail');
  };

  const selectedCourse = courses.find((c) => c._id === selectedCourseId) || courses[0];
  const selectedResource = resources.find((r) => r._id === selectedResourceId) || resources[0];
  const selectedDiscussion = discussions.find((d) => d._id === selectedDiscussionId) || discussions[0];

  // If in Landing Page mode or if unauthenticated
  if (currentView === 'landing' || !currentUser) {
    return (
      <>
        <LandingPageView
          currentUser={currentUser}
          courses={courses}
          onGetStarted={() => {
            if (currentUser) {
              setCurrentView('dashboard');
            } else {
              setAuthMode('signup');
              setIsAuthOpen(true);
            }
          }}
          onSignUp={() => {
            setAuthMode('signup');
            setIsAuthOpen(true);
          }}
          onLogin={() => {
            setAuthMode('login');
            setIsAuthOpen(true);
          }}
          onQuickDemo={handleQuickDemoLogin}
          isLoggingInDemo={isLoggingInDemo}
          onEnterDashboard={() => {
            setCurrentView('dashboard');
          }}
          onSelectCourse={(courseId) => {
            setSelectedCourseId(courseId);
            if (currentUser) {
              setCurrentView('course-detail');
            } else {
              setAuthMode('signup');
              setIsAuthOpen(true);
            }
          }}
          onLogout={handleLogout}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
        />

        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // App container (1-1 with former layout)
  return (
    <div id="appContainer" className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      
      {/* Mobile Header (exact former #mobileHeader) */}
      <Header
        currentUser={currentUser}
        onOpenMobileMenu={() => setIsSidebarOpen(true)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onProfileClick={() => setCurrentView('profile')}
        onGoHome={() => setCurrentView('dashboard')}
      />

      {/* Sidebar (exact former #sidebar) */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
      />

      {/* Main Content Area (exact former #content) */}
      <main id="content" className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
        {currentView === 'dashboard' && currentUser && (
          <DashboardView
            currentUser={currentUser}
            courses={courses}
            assignments={assignments}
            discussions={discussions}
            setCurrentView={setCurrentView}
            onSelectCourse={handleSelectCourse}
            onSelectAssignment={() => setCurrentView('assignments')}
            onSelectDiscussion={handleSelectDiscussion}
            onAskAiPrompt={handleAskAiPrompt}
          />
        )}

        {currentView === 'courses' && (
          <CoursesView
            courses={courses}
            currentUser={currentUser}
            onSelectCourse={handleSelectCourse}
            onEnroll={handleEnrollCourse}
            onAskAiCourse={handleAskAiCourse}
          />
        )}

        {currentView === 'course-detail' && selectedCourse && (
          <CourseDetailView
            course={selectedCourse}
            assignments={assignments}
            resources={resources}
            discussions={discussions}
            onBack={() => setCurrentView('courses')}
            onEnroll={handleEnrollCourse}
            onAskAi={handleAskAiCourse}
            onSelectAssignment={() => setCurrentView('assignments')}
            onSelectResource={handleSelectResource}
            onSelectDiscussion={handleSelectDiscussion}
          />
        )}

        {currentView === 'assignments' && (
          <AssignmentsView
            assignments={assignments}
            onSubmitAssignment={handleSubmitAssignment}
            onAskAiHint={handleAskAiHint}
          />
        )}

        {currentView === 'resources' && (
          <ResourcesView
            resources={resources}
            courses={courses}
            onUploadResource={handleUploadResource}
            onAskAiSummarize={handleAskAiSummarize}
            onDownload={handleDownloadResource}
            onSelectResource={handleSelectResource}
          />
        )}

        {currentView === 'resource-detail' && selectedResource && (
          <ResourceDetailView
            resource={selectedResource}
            currentUser={currentUser}
            onBack={() => setCurrentView('resources')}
            onDownload={handleDownloadResource}
            onAskAi={handleAskAiSummarize}
            onSelectCourse={handleSelectCourse}
          />
        )}

        {currentView === 'discussions' && (
          <DiscussionsView
            discussions={discussions}
            courses={courses}
            onUpvote={handleUpvoteDiscussion}
            onCreateDiscussion={handleCreateDiscussion}
            onAddReply={handleAddReply}
            onAskAiDiscussion={(d) =>
              handleAskAiPrompt(`Explain and provide an answer to this discussion: "${d.title}" - "${d.content}"`)
            }
            selectedDiscussionId={selectedDiscussionId}
            onSelectDiscussion={handleSelectDiscussion}
          />
        )}

        {currentView === 'discussion-detail' && selectedDiscussion && (
          <DiscussionDetailView
            discussion={selectedDiscussion}
            currentUser={currentUser}
            onBack={() => setCurrentView('discussions')}
            onAddReply={handleAddReply}
            onUpvote={handleUpvoteDiscussion}
            onAskAi={(d) =>
              handleAskAiPrompt(
                `Help me answer this discussion question for ${typeof d.course === 'object' ? d.course.code : 'course'}: "${d.title}" - ${d.content}`
              )
            }
          />
        )}

        {currentView === 'announcements' && (
          <AnnouncementsView
            announcements={announcements}
            onAskAiAnnouncement={(item) =>
              handleAskAiPrompt(`Explain this announcement: "${item.title}" - "${item.content}"`)
            }
          />
        )}

        {currentView === 'campus-ai' && (
          <CampusAiView onShowToast={showToast} />
        )}

        {currentView === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            courses={courses}
            setCurrentView={setCurrentView}
            onLogout={handleLogout}
            onUpdateUser={(updated) =>
              setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null))
            }
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Former Toast Notification (#toast) */}
      {toastMessage && (
        <div
          id="toast"
          className="fixed bottom-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white transition-opacity duration-300"
        >
          <div className="mr-3">
            {toastType === 'success' && <i className="fas fa-check-circle text-green-500 text-lg"></i>}
            {toastType === 'error' && <i className="fas fa-exclamation-circle text-red-500 text-lg"></i>}
            {toastType === 'info' && <i className="fas fa-info-circle text-primary text-lg"></i>}
          </div>
          <span id="toastMessage">{toastMessage}</span>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
