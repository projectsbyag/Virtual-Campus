import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { AssignmentDetailModal, CreateEditAssignmentModal } from './components/AssignmentModals';

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

  // Quick Dashboard Assignment Modal state
  const [quickAssignment, setQuickAssignment] = useState<Assignment | null>(null);
  const [quickEditAssignment, setQuickEditAssignment] = useState<Assignment | null>(null);
  const [showQuickEditModal, setShowQuickEditModal] = useState(false);

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

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadLiveData = async () => {
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

  const processPendingJoinLink = async (user: User) => {
    const token = localStorage.getItem('pendingJoinToken');
    if (!token) return;
    localStorage.removeItem('pendingJoinToken');

    if (user.role === 'instructor' || user.role === 'admin') {
      showToast('Instructors and administrators cannot enroll via student invite links.', 'error');
      return;
    }

    try {
      const joinedCourse = await apiService.joinCourseViaLink(token);
      await loadLiveData();
      if (joinedCourse) {
        setSelectedCourseId(joinedCourse._id);
        setCurrentView('course-detail');
        showToast(`Joined ${joinedCourse.code}: ${joinedCourse.name}!`, 'success');
      } else {
        showToast('Successfully enrolled via invite link!', 'success');
      }
    } catch (err: any) {
      showToast(err?.message || 'Invite link is invalid, expired, or restricted.', 'error');
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Detect course invite link (?join= or ?token=) matching HTML app behavior
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('join') || params.get('token');
      if (urlToken) {
        localStorage.setItem('pendingJoinToken', urlToken);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    const initAndLoad = async () => {
      try {
        const user = await apiService.initSession();
        if (isMounted) {
          if (user) {
            setCurrentUser(user);
            await loadLiveData();
            await processPendingJoinLink(user);
          } else {
            setCurrentUser(null);
            if (localStorage.getItem('pendingJoinToken')) {
              setAuthMode('login');
              setIsAuthOpen(true);
            }
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

  const handleQuickDemoLogin = async (demoRole: 'student' | 'instructor' = 'student') => {
    setIsLoggingInDemo(true);
    try {
      const email = demoRole === 'instructor' ? 'prof.turing@campus.edu' : 'alex.johnson@campus.edu';
      const password = 'Password123!';
      let user: User;

      try {
        const res = await apiService.login(email, password);
        user = res.user;
      } catch {
        const name = demoRole === 'instructor' ? 'Alan Turing' : 'Alex Johnson';
        const department = 'Computer Science';
        const res = await apiService.register(name, email, department, demoRole, password);
        user = res.user;
      }

      setCurrentUser(user);
      setCurrentView('dashboard');
      showToast(
        `Welcome to Campus, ${user.firstName}! (${demoRole === 'instructor' ? 'Faculty Instructor Demo' : 'Student Demo'})`,
        'success'
      );
      await loadLiveData();
      await processPendingJoinLink(user);
    } catch (err: any) {
      showToast(err?.message || `Unable to log in as demo ${demoRole}. Please check network.`, 'error');
    } finally {
      setIsLoggingInDemo(false);
    }
  };

  const handleAuthSuccess = async (u: User) => {
    setCurrentUser(u);
    setCurrentView('dashboard');
    showToast(`Welcome back, ${u.firstName}!`, 'success');
    await loadLiveData();
    await processPendingJoinLink(u);
  };

  const handleCreateDiscussion = async (
    title: string,
    content: string,
    courseId: string,
    tags: string[] = ['General']
  ) => {
    try {
      const newD = await apiService.createDiscussion(title, content, courseId, tags);
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

  const handleAskAiPrompt = (prompt: string) => {
    campusAiService.addUserMessage(prompt);
    setCurrentView('campus-ai');
  };

  const handleAskAiCourse = (course: Course) => {
    handleAskAiPrompt(
      `Explain the key concepts, syllabus expectations, and exam preparation tips for ${course.code}: ${course.name}.`
    );
  };

  const handleAskAiHint = (assignment: Assignment) => {
    handleAskAiPrompt(
      `Give me a conceptual hint on how to solve this homework: "${assignment.title}". Context: "${assignment.description}".`
    );
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

  return (
    <div id="appContainer" className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Header
        currentUser={currentUser}
        onOpenMobileMenu={() => setIsSidebarOpen(true)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onProfileClick={() => setCurrentView('profile')}
        onGoHome={() => setCurrentView('dashboard')}
      />

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

      <main
        id="content"
        className={`flex-1 min-w-0 ${
          currentView === 'campus-ai'
            ? 'p-2 sm:p-4 h-[calc(100vh-4rem)] md:h-screen overflow-hidden flex flex-col'
            : 'p-4 sm:p-6 lg:p-8 overflow-y-auto'
        }`}
      >
        {currentView === 'dashboard' && currentUser && (
          <DashboardView
            currentUser={currentUser}
            courses={courses}
            assignments={assignments}
            discussions={discussions}
            announcements={announcements}
            setCurrentView={setCurrentView}
            onSelectCourse={handleSelectCourse}
            onSelectAssignment={(a) => setQuickAssignment(a)}
            onSelectDiscussion={handleSelectDiscussion}
            onAskAiPrompt={handleAskAiPrompt}
            onRefreshData={loadLiveData}
          />
        )}

        {currentView === 'courses' && (
          <CoursesView
            courses={courses}
            currentUser={currentUser}
            onSelectCourse={handleSelectCourse}
            onRefreshData={loadLiveData}
            onAskAiCourse={handleAskAiCourse}
            onShowToast={showToast}
          />
        )}

        {currentView === 'course-detail' && selectedCourse && (
          <CourseDetailView
            course={selectedCourse}
            currentUser={currentUser}
            courses={courses}
            assignments={assignments}
            resources={resources}
            discussions={discussions}
            announcements={announcements}
            onBack={() => setCurrentView('courses')}
            onRefreshData={loadLiveData}
            onAskAi={handleAskAiCourse}
            onAskAiHint={handleAskAiHint}
            onSelectResource={handleSelectResource}
            onSelectDiscussion={handleSelectDiscussion}
            onShowToast={showToast}
          />
        )}

        {currentView === 'assignments' && (
          <AssignmentsView
            assignments={assignments}
            courses={courses}
            currentUser={currentUser}
            onRefreshData={loadLiveData}
            onAskAiHint={handleAskAiHint}
            onShowToast={showToast}
          />
        )}

        {currentView === 'resources' && (
          <ResourcesView
            resources={resources}
            courses={courses}
            currentUser={currentUser}
            onRefreshData={loadLiveData}
            onAskAiSummarize={handleAskAiSummarize}
            onSelectResource={handleSelectResource}
            onShowToast={showToast}
          />
        )}

        {currentView === 'resource-detail' && selectedResource && (
          <ResourceDetailView
            resource={selectedResource}
            currentUser={currentUser}
            onBack={() => setCurrentView('resources')}
            onAskAi={handleAskAiSummarize}
            onSelectCourse={handleSelectCourse}
            onRefreshData={loadLiveData}
            onShowToast={showToast}
          />
        )}

        {currentView === 'discussions' && (
          <DiscussionsView
            discussions={discussions}
            courses={courses}
            currentUser={currentUser}
            onUpvote={handleUpvoteDiscussion}
            onCreateDiscussion={handleCreateDiscussion}
            onAskAiDiscussion={(d) =>
              handleAskAiPrompt(`Explain and provide an answer to this discussion: "${d.title}" - "${d.content}"`)
            }
            onSelectDiscussion={handleSelectDiscussion}
            onRefreshData={loadLiveData}
            onShowToast={showToast}
          />
        )}

        {currentView === 'discussion-detail' && selectedDiscussion && (
          <DiscussionDetailView
            discussion={selectedDiscussion}
            courses={courses}
            currentUser={currentUser}
            onBack={() => setCurrentView('discussions')}
            onAddReply={handleAddReply}
            onUpvote={handleUpvoteDiscussion}
            onAskAi={(d) =>
              handleAskAiPrompt(
                `Help me answer this discussion question for ${
                  typeof d.course === 'object' ? d.course.code : 'course'
                }: "${d.title}" - ${d.content}`
              )
            }
            onRefreshData={loadLiveData}
            onShowToast={showToast}
          />
        )}

        {currentView === 'announcements' && (
          <AnnouncementsView
            announcements={announcements}
            courses={courses}
            currentUser={currentUser}
            onRefreshData={loadLiveData}
            onAskAiAnnouncement={(item) =>
              handleAskAiPrompt(`Explain this announcement: "${item.title}" - "${item.content}"`)
            }
            onShowToast={showToast}
          />
        )}

        {currentView === 'campus-ai' && <CampusAiView onShowToast={showToast} />}

        {currentView === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            courses={courses}
            assignments={assignments}
            setCurrentView={setCurrentView}
            onUpdateUser={(updated) => setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null))}
            onShowToast={showToast}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
            onShowToast={showToast}
            onAccountDeleted={() => {
              setCurrentUser(null);
              setCurrentView('landing');
            }}
          />
        )}
      </main>

      {/* Dashboard Quick Assignment Modal */}
      <AssignmentDetailModal
        assignment={quickAssignment}
        currentUser={currentUser}
        courses={courses}
        onClose={() => setQuickAssignment(null)}
        onRefresh={loadLiveData}
        onEditAssignment={(a) => {
          setQuickEditAssignment(a);
          setShowQuickEditModal(true);
        }}
        onAskAiHint={handleAskAiHint}
        onShowToast={showToast}
      />

      <CreateEditAssignmentModal
        isOpen={showQuickEditModal}
        onClose={() => {
          setShowQuickEditModal(false);
          setQuickEditAssignment(null);
        }}
        courses={courses}
        currentUser={currentUser}
        editingAssignment={quickEditAssignment}
        onSaved={async () => {
          await loadLiveData();
        }}
        onShowToast={showToast}
      />

      {toastMessage && (
        <div
          id="toast"
          className="fixed bottom-4 right-4 z-50 flex items-center p-4 rounded-xl shadow-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-black dark:text-white"
        >
          <div className="mr-3">
            {toastType === 'success' && <i className="fas fa-check-circle text-emerald-500 text-lg"></i>}
            {toastType === 'error' && <i className="fas fa-exclamation-circle text-red-500 text-lg"></i>}
            {toastType === 'info' && <i className="fas fa-info-circle text-black dark:text-white text-lg"></i>}
          </div>
          <span id="toastMessage">{toastMessage}</span>
        </div>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
