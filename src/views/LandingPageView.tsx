import React, { useState } from 'react';
import { User, Course, DEFAULT_AVATAR } from '../types';

interface LandingPageViewProps {
  currentUser: User | null;
  courses: Course[];
  onGetStarted: () => void;
  onSignUp: () => void;
  onLogin: () => void;
  onQuickDemo?: () => void | Promise<void>;
  isLoggingInDemo?: boolean;
  onEnterDashboard: () => void;
  onSelectCourse?: (courseId: string) => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  currentUser,
  courses,
  onGetStarted,
  onSignUp,
  onLogin,
  onQuickDemo,
  isLoggingInDemo = false,
  onEnterDashboard,
  onSelectCourse,
  onLogout,
  isDark,
  onToggleTheme,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleQuickDemoClick = async () => {
    if (onQuickDemo) {
      await onQuickDemo();
    } else {
      onLogin();
    }
  };

  // Preview courses (fallback to standard academic list if backend courses not yet loaded)
  const displayCourses = courses.length > 0 ? courses.slice(0, 3) : [
    {
      _id: 'c1',
      code: 'CS101',
      title: 'Introduction to Computer Science',
      description: 'Fundamental algorithms, data structures, and computational thinking in modern Python.',
      department: 'Computer Science',
      instructor: { firstName: 'Alan', lastName: 'Turing', email: 'turing@campus.edu' },
      enrolledCount: 142
    },
    {
      _id: 'c2',
      code: 'MATH201',
      title: 'Linear Algebra & Matrix Analysis',
      description: 'Vector spaces, eigenvalues, matrix transformations, and machine learning mathematical foundations.',
      department: 'Mathematics',
      instructor: { firstName: 'Katherine', lastName: 'Johnson', email: 'kjohnson@campus.edu' },
      enrolledCount: 98
    },
    {
      _id: 'c3',
      code: 'BIO105',
      title: 'Molecular & Cellular Biology',
      description: 'Genomic structures, cellular metabolism, DNA replication, and recombinant biotechnology.',
      department: 'Biology',
      instructor: { firstName: 'Rosalind', lastName: 'Franklin', email: 'rfranklin@campus.edu' },
      enrolledCount: 115
    }
  ];

  const faqs = [
    {
      q: 'How does Virtual Campus streamline college coursework?',
      a: 'Virtual Campus unites all your academic requirements under one clean dashboard: enrolled courses, downloadable syllabi and lecture slides, assignment submissions with deadline reminders, active student discussion boards, and an intelligent Campus AI tutor.'
    },
    {
      q: 'What is Campus AI and how does it assist my study sessions?',
      a: 'Campus AI is your 24/7 academic study companion. It helps break down complex textbook concepts, provides hints for challenging assignment problems without spoiling answers, generates customized quiz questions, and summarizes lengthy lecture PDFs.'
    },
    {
      q: 'Can instructors manage assignments and grade submissions?',
      a: 'Yes! Instructors can publish course modules, upload resource materials (PDFs, slides, code repositories), create assignments with due dates and rubrics, and inspect student submissions in real time.'
    },
    {
      q: 'Is Virtual Campus connected to a live backend database?',
      a: 'Yes, this platform is integrated with our live Render cloud backend and MongoDB database, delivering authentic user authentication, real-time course enrollments, digital assignment submissions, and peer discussions.'
    },
    {
      q: 'Can I access Virtual Campus from my mobile browser or tablet?',
      a: 'Absolutely. Virtual Campus is built with responsive layout standards, ensuring smooth operation across phones, iPads, laptops, and wide desktop displays with full light and dark mode support.'
    }
  ];

  return (
    <div data-user-content="true" id="landingPage" className="flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-white min-h-screen selection:bg-primary selection:text-white transition-colors duration-200">
      
      {/* ==================== STICKY NAVIGATION BAR ==================== */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div 
              onClick={currentUser ? onEnterDashboard : onGetStarted}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black border border-neutral-300 dark:border-neutral-700 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <i className="fas fa-graduation-cap text-lg"></i>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-black dark:text-white">
                  Virtual<span className="text-neutral-500 dark:text-neutral-400">Campus</span>
                </span>
                <span className="ml-1.5 hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-black dark:text-white border border-black/20 dark:border-white/20">
                  v2.0
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-gray-600 dark:text-gray-300">
              <a href="#features" className="hover:text-black dark:hover:text-white transition">Features</a>
              <a href="#courses" className="hover:text-black dark:hover:text-white transition">Courses</a>
              <a href="#campus-ai" className="hover:text-black dark:hover:text-white transition flex items-center gap-1.5">
                <span>Campus AI</span>
                <span className="text-[10px] bg-black text-white dark:bg-white dark:text-black font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                  AI
                </span>
              </a>
              <a href="#how-it-works" className="hover:text-black dark:hover:text-white transition">How It Works</a>
              <a href="#testimonials" className="hover:text-black dark:hover:text-white transition">Testimonials</a>
              <a href="#faq" className="hover:text-black dark:hover:text-white transition">FAQ</a>
            </div>

            {/* Right-Hand Navigation Actions */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle Button */}
              <button
                onClick={onToggleTheme}
                className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition"
                aria-label="Toggle dark mode"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? (
                  <i className="fas fa-sun text-amber-400"></i>
                ) : (
                  <i className="fas fa-moon text-black dark:text-white"></i>
                )}
              </button>

              {currentUser ? (
                /* Authenticated State in Navbar */
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs">
                    <img
                      src={currentUser.avatarUrl || currentUser.avatar || DEFAULT_AVATAR}
                      alt={currentUser.name}
                      className="w-5 h-5 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                      }}
                    />
                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                      {currentUser.name}
                    </span>
                  </div>

                  <button
                    onClick={onEnterDashboard}
                    className="px-4 py-2 text-sm font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black rounded-lg shadow-sm transition flex items-center space-x-2 transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>Dashboard</span>
                    <i className="fas fa-arrow-right text-xs"></i>
                  </button>

                  <button
                    onClick={onLogout}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                    title="Log Out"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </div>
              ) : (
                /* Unauthenticated State in Navbar */
                <div className="flex items-center space-x-2">
                  <button
                    id="navQuickDemoBtn"
                    onClick={handleQuickDemoClick}
                    disabled={demoLoading || isLoggingInDemo}
                    className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black dark:text-white bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition cursor-pointer"
                    title="Instant sandbox login as student Alex Johnson"
                  >
                    <i className={`fas ${(demoLoading || isLoggingInDemo) ? 'fa-spinner fa-spin' : 'fa-bolt text-black dark:text-white'}`}></i>
                    <span>{(demoLoading || isLoggingInDemo) ? 'Accessing...' : '1-Click Demo'}</span>
                  </button>

                  <button
                    id="navLoginBtn"
                    onClick={onLogin}
                    className="px-3.5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60 rounded-lg transition"
                  >
                    Log In
                  </button>

                  <button
                    id="navSignUpBtn"
                    onClick={onSignUp}
                    className="px-4 py-2 text-sm font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black rounded-lg shadow-sm transition transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    Sign Up Free
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800">
        
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-neutral-200/40 dark:bg-neutral-900/40 blur-3xl -z-10 pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm font-semibold mb-6 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-black dark:bg-white"></span>
            <span>Fall 2026 Academic Portal Active • Integrated with Campus AI Tutor</span>
            <i className="fas fa-chevron-right text-[10px]"></i>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black dark:text-white max-w-4xl mx-auto leading-[1.15]">
            The Modern Academic Hub for <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-black via-neutral-700 to-neutral-500 dark:from-white dark:via-neutral-300 dark:to-neutral-500">
              Students & Instructors
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            Organize enrolled courses, submit assignments with verified timestamps, share campus study resources, and elevate your learning with 24/7 AI-assisted tutoring.
          </p>

          {/* Dual Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-xl mx-auto">
            {currentUser ? (
              <button
                onClick={onEnterDashboard}
                className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-base font-bold rounded-xl shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Enter Your Dashboard</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            ) : (
              <>
                <button
                  id="heroQuickDemoBtn"
                  onClick={handleQuickDemoClick}
                  disabled={demoLoading || isLoggingInDemo}
                  className="w-full sm:w-auto px-7 py-3.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-base font-bold rounded-xl shadow-md border border-black dark:border-white transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
                >
                  <i className={`fas ${(demoLoading || isLoggingInDemo) ? 'fa-spinner fa-spin' : 'fa-bolt'}`}></i>
                  <span>{(demoLoading || isLoggingInDemo) ? 'Launching Student Demo...' : '⚡ 1-Click Student Demo'}</span>
                </button>

                <button
                  id="heroSignUpBtn"
                  onClick={onSignUp}
                  className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-neutral-50 text-black dark:bg-neutral-900 dark:hover:bg-neutral-850 dark:text-white text-base font-bold rounded-xl border-2 border-black dark:border-white shadow-sm transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <i className="fas fa-user-plus text-sm"></i>
                  <span>Sign Up Free</span>
                </button>

                <button
                  id="heroLoginBtn"
                  onClick={onLogin}
                  className="w-full sm:w-auto px-6 py-3.5 bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-base font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                >
                  <i className="fas fa-sign-in-alt text-black dark:text-white text-sm"></i>
                  <span>Log In</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Demo Access Bar */}
          {!currentUser && (
            <div className="mt-4 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 py-1 px-3">
                <i className="fas fa-check-circle text-black dark:text-white text-xs"></i>
                <span>Pre-configured with student <strong className="text-black dark:text-white">Alex Johnson</strong>, enrolled CS101 course, and Campus AI.</span>
              </span>
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center space-x-1.5">
              <i className="fas fa-check-circle text-black dark:text-white"></i>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <i className="fas fa-check-circle text-black dark:text-white"></i>
              <span>Live Render backend connected</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <i className="fas fa-check-circle text-black dark:text-white"></i>
              <span>Full student role-based access</span>
            </div>
          </div>

          {/* Platform Metrics Bar */}
          <div className="mt-14 pt-10 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-black dark:text-white">4,850+</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">Active Students & Faculty</div>
            </div>
            <div className="p-4 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-black dark:text-white">140+</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">Accredited Courses</div>
            </div>
            <div className="p-4 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-black dark:text-white">99.2%</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">On-Time Submissions</div>
            </div>
            <div className="p-4 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-black dark:text-white">24 / 7</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">Campus AI Tutor Available</div>
            </div>
          </div>

        </div>
      </section>

      {/* ==================== PRODUCT EXPERIENCE PREVIEW MOCKUP ==================== */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900/40 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primaryLight">Visual Interface</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
              Engineered for Intuitive Daily Productivity
            </h2>
          </div>

          {/* Browser Window Frame */}
          <div className="rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl overflow-hidden bg-white dark:bg-gray-900">
            {/* Window title bar */}
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-white dark:bg-gray-900 px-4 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                https://campus.edu/app/dashboard
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <i className="fas fa-shield-alt"></i>
                <span>SSL Secured</span>
              </div>
            </div>

            {/* Simulated Dashboard UI Inner */}
            <div className="p-6 sm:p-8 bg-gray-50 dark:bg-gray-950 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Course Schedule card */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <i className="fas fa-graduation-cap text-primary"></i>
                    <span>Enrolled Courses</span>
                  </h4>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                    3 Active
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-gray-900 dark:text-white">CS101 Intro to Computer Science</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">Prof. Turing • Mon/Wed 10:00 AM</div>
                    </div>
                    <span className="text-xs font-bold text-primary">88%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-gray-900 dark:text-white">MATH201 Linear Algebra</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">Dr. Johnson • Tue/Thu 2:00 PM</div>
                    </div>
                    <span className="text-xs font-bold text-primary">94%</span>
                  </div>
                </div>
              </div>

              {/* Assignments / Deadlines Card */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <i className="fas fa-clock text-amber-500"></i>
                    <span>Upcoming Deadlines</span>
                  </h4>
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
                    Priority
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-xs text-gray-900 dark:text-white">Problem Set #3: Dynamic Programming</span>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">Due in 2d</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">CS101 • PDF or ZIP submission</p>
                  </div>
                  <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-xs text-gray-900 dark:text-white">Eigenvalues Proof Exercise</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">Submitted</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">MATH201 • Awaiting review</p>
                  </div>
                </div>
              </div>

              {/* Campus AI Live Tutor Card */}
              <div className="bg-gradient-to-br from-primary/5 via-indigo-50/40 to-purple-50/40 dark:from-gray-900 dark:via-gray-850 dark:to-purple-950/20 p-5 rounded-xl border border-primary/20 dark:border-primary/30 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <i className="fas fa-robot text-primary dark:text-primaryLight"></i>
                      <span>Campus AI Assistant</span>
                    </h4>
                    <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      Online
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                      <span className="font-bold text-primary block text-[11px]">Alex J.:</span>
                      Can you explain how Dijkstra handles negative edge weights?
                    </div>
                    <div className="p-2.5 rounded-lg bg-primary/10 dark:bg-primary/20 text-gray-800 dark:text-gray-200 border border-primary/20">
                      <span className="font-bold text-primary dark:text-primaryLight block text-[11px]">Campus AI:</span>
                      Standard Dijkstra assumes greedy optimality and can get trapped in cycles with negative weights. For graphs with negative edges, use Bellman-Ford!
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-primary/15 flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400 text-[11px]">24/7 Context-aware</span>
                  <button 
                    onClick={currentUser ? onEnterDashboard : onGetStarted}
                    className="text-primary dark:text-primaryLight font-bold hover:underline"
                  >
                    Try Campus AI →
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ==================== CORE CAPABILITIES (FEATURES) ==================== */}
      <section id="features" className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primaryLight">Comprehensive Platform</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-2">
              Everything Needed to Excel in Every Semester
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-base">
              Built specifically around the workflows of students and educators — eliminating fragmented tools, lost assignments, and confusing threads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-7 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:shadow-lg transition group">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Centralized Course Hub</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Enroll with one click, explore syllabi, inspect lecture schedules, review instructor office hours, and monitor credit progression.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:shadow-lg transition group">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform">
                <i className="fas fa-tasks"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Assignment Portal</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Stay on top of deadlines with chronological due dates, upload homework files, and receive direct instructor feedback and grades.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:shadow-lg transition group">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform">
                <i className="fas fa-folder-open"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Verified Resource Library</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Download verified lecture slides, cheat sheets, past exam papers, and code templates categorized by department and course code.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:shadow-lg transition group">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform">
                <i className="fas fa-comments"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Peer Discussion Forums</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Ask challenging conceptual questions, upvote peer contributions, and resolve sticking points in a supportive, collaborative forum.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-2xl bg-black text-white dark:bg-neutral-900 border border-neutral-800 hover:shadow-xl transition group">
              <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform shadow-sm">
                <i className="fas fa-robot"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span>Campus AI Academic Tutor</span>
                <span className="text-[10px] bg-white text-black font-bold px-1.5 py-0.5 rounded-full">New</span>
              </h3>
              <p className="text-sm text-neutral-300 dark:text-neutral-400 leading-relaxed">
                Ask conceptual questions, get instant problem-solving hints, generate practice quizzes, and summarize lecture materials on demand.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:shadow-lg transition group">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform">
                <i className="fas fa-bullhorn"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Campus Announcements</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Receive important university broadcasts, room reassignments, exam timetable alerts, and department notifications promptly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== LIVE COURSES SHOWCASE ==================== */}
      <section id="courses" className="py-20 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primaryLight">Academic Catalog</span>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                Active Courses in the Curriculum
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Explore popular offerings available for enrollment across departments.
              </p>
            </div>

            <button
              onClick={currentUser ? onEnterDashboard : onGetStarted}
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-bold text-primary dark:text-primaryLight hover:underline"
            >
              <span>Explore All Courses</span>
              <i className="fas fa-arrow-right text-xs"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayCourses.map((c) => (
              <div
                key={c._id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary dark:text-primaryLight">
                      {c.code}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {c.department || 'General Studies'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {c.title || c.name}
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-4">
                    {c.description || 'Comprehensive curriculum covering foundational theories and applied laboratory exercises.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <i className="fas fa-user-tie text-gray-400"></i>
                    <span className="truncate max-w-[130px]">
                      {c.instructor?.firstName ? `Prof. ${c.instructor.lastName || c.instructor.firstName}` : 'Faculty Member'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (currentUser && onSelectCourse) {
                        onSelectCourse(c._id);
                      } else {
                        onSignUp();
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white dark:hover:bg-primary text-gray-700 dark:text-gray-200 transition"
                  >
                    {currentUser ? 'Open Course' : 'Enroll Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CAMPUS AI SPOTLIGHT ==================== */}
      <section id="campus-ai" className="py-20 bg-white dark:bg-black border-y border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 bg-black text-white dark:bg-neutral-950 border border-neutral-800 overflow-hidden shadow-2xl">
            
            {/* Subtle monochrome background decorative circles */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-white text-xs font-semibold mb-6 border border-white/20">
                  <i className="fas fa-sparkles"></i>
                  <span>Academic Artificial Intelligence</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  Study Smarter, Not Harder With <span className="underline decoration-neutral-500 underline-offset-8">Campus AI</span>
                </h2>

                <p className="mt-4 text-base text-neutral-300 leading-relaxed">
                  Stuck on a tricky problem at 2:00 AM? Need a quick summary before entering your morning lecture? Campus AI is trained to guide your academic comprehension without cheating.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                      <i className="fas fa-lightbulb"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Socratic Hints, Never Direct Spoilers</h4>
                      <p className="text-xs text-neutral-300 mt-0.5">Learn how to derive formulas and understand algorithmic steps independently.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Slide & Paper Summaries</h4>
                      <p className="text-xs text-neutral-300 mt-0.5">Turn 50-page slide decks into bullet points and high-yield flashcard concepts.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                      <i className="fas fa-question-circle"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Custom Practice Exam Quizzes</h4>
                      <p className="text-xs text-neutral-300 mt-0.5">Generate tailored multiple-choice tests to prepare for midterm exams.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <button
                    onClick={currentUser ? onEnterDashboard : onGetStarted}
                    className="px-6 py-3.5 bg-white hover:bg-neutral-200 text-black font-extrabold rounded-xl shadow-lg transition transform hover:-translate-y-0.5 inline-flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Launch Campus AI Tutor</span>
                    <i className="fas fa-arrow-right text-xs"></i>
                  </button>
                </div>
              </div>

              {/* Interactive prompt sample card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-4 shadow-xl">
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Live Study Session Preview</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Ready
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs">
                  <span className="text-primaryLight font-bold block mb-1">Question from Student:</span>
                  "What is the difference between BFS and DFS traversal, and when is each preferred in real software applications?"
                </div>

                <div className="p-4 rounded-xl bg-white/15 border border-white/20 text-xs text-gray-100 leading-relaxed">
                  <span className="text-amber-300 font-bold block mb-1">Campus AI Breakdown:</span>
                  <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-gray-200">
                    <li><strong>Breadth-First Search (BFS):</strong> Explores node-by-node level by level using a Queue (FIFO). Ideal for finding the shortest path on unweighted graphs (e.g., GPS networks, friend degrees).</li>
                    <li><strong>Depth-First Search (DFS):</strong> Explores as deep as possible along each branch using a Stack or recursion. Ideal for maze solving, topological sorting, and game trees.</li>
                  </ul>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-gray-300">
                  <span className="italic text-[11px]">Response time: 0.4s</span>
                  <span className="text-primaryLight font-bold">Try it yourself with your course materials →</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS (3-STEP FLOW) ==================== */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primaryLight">Simple Onboarding</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-1">
            How to Get Started in Under 60 Seconds
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm max-w-xl mx-auto">
            From registration to your first submitted assignment, getting up to speed is effortless.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 relative">
              <div className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                1
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Create Your Campus Profile</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Sign up with your university email, designate your academic department (e.g. Computer Science, Mathematics), and choose your role.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 relative">
              <div className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                2
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Enroll in Semester Courses</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Add your active courses with enrollment codes, download lecture slides, review syllabus milestones, and inspect assignment criteria.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 relative">
              <div className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                3
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Ace Your Semester with AI</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Submit assignments on time, engage in lively peer discussions, and leverage Campus AI to master complex topics before exam week.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primaryLight">Social Proof</span>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">
              Loved by Students & Faculty Alike
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Testimonial 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 text-xs mb-3 space-x-1">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 italic leading-relaxed">
                  "Having all my assignment deadlines, syllabus files, and forum questions in one cohesive interface changed my GPA. Campus AI helped me understand pointers in C++ when office hours were closed."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80"
                  alt="Maya Lin"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">Maya Lin</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">Junior, Computer Science</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 text-xs mb-3 space-x-1">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 italic leading-relaxed">
                  "As a lecturer, publishing problem sets and sharing lecture slides is instantaneous. The student discussion threads promote real peer learning and prevent repetitive email inquiries."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80"
                  alt="Dr. Marcus Vance"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">Dr. Marcus Vance</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">Associate Professor of Mathematics</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 text-xs mb-3 space-x-1">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 italic leading-relaxed">
                  "The dark mode is easy on the eyes during late night study grinds, and uploading my biology lab reports directly with zero fuss has made this platform my favorite tool all year."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=128&q=80"
                  alt="David Kim"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">David Kim</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">Sophomore, Biomedical Engineering</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== INTERACTIVE FAQ ==================== */}
      <section id="faq" className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primaryLight">Got Questions?</span>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 overflow-hidden transition"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center text-sm font-bold text-gray-900 dark:text-white focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <i className={`fas fa-chevron-down text-xs text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`}></i>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 text-xs text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-200/50 dark:border-gray-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== BOTTOM CONVERSION CTA BANNER ==================== */}
      <section className="py-20 bg-black dark:bg-neutral-950 text-white border-t border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Ready to Elevate Your Academic Experience?
          </h2>
          <p className="mt-3 text-base text-neutral-400 max-w-xl mx-auto">
            Join thousands of college students and instructors mastering coursework, assignments, and study materials on Virtual Campus.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            {currentUser ? (
              <button
                onClick={onEnterDashboard}
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-extrabold rounded-xl shadow-lg hover:bg-neutral-200 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Go to Campus Dashboard</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            ) : (
              <>
                <button
                  id="footerQuickDemoBtn"
                  onClick={handleQuickDemoClick}
                  disabled={demoLoading || isLoggingInDemo}
                  className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-neutral-200 text-black font-extrabold rounded-xl shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
                >
                  <i className={`fas ${(demoLoading || isLoggingInDemo) ? 'fa-spinner fa-spin' : 'fa-bolt text-black'}`}></i>
                  <span>{(demoLoading || isLoggingInDemo) ? 'Launching Demo...' : '⚡ 1-Click Student Demo'}</span>
                </button>

                <button
                  id="footerSignUpBtn"
                  onClick={onSignUp}
                  className="w-full sm:w-auto px-8 py-3.5 bg-neutral-900 border border-neutral-700 text-white font-bold rounded-xl shadow-lg hover:bg-neutral-800 transition transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Create Free Account
                </button>
                
                <button
                  id="footerLoginBtn"
                  onClick={onLogin}
                  className="w-full sm:w-auto px-7 py-3.5 bg-transparent hover:bg-white/10 text-white font-bold rounded-xl border border-white/20 transition cursor-pointer"
                >
                  Log In to Campus
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="py-12 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Logo and brief */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <i className="fas fa-graduation-cap text-sm"></i>
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-sm">
                Virtual Campus Platform
              </span>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-6 font-medium">
              <a href="#features" className="hover:text-primary transition">Features</a>
              <a href="#courses" className="hover:text-primary transition">Courses</a>
              <a href="#campus-ai" className="hover:text-primary transition">Campus AI</a>
              <a href="#faq" className="hover:text-primary transition">FAQ</a>
              <button 
                onClick={currentUser ? onEnterDashboard : onLogin} 
                className="hover:text-primary transition"
              >
                {currentUser ? 'Dashboard' : 'Sign In'}
              </button>
            </div>

            {/* Live API Status indicator */}
            <div className="flex items-center space-x-2 text-[11px] font-mono text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>API: project1-1bz0.onrender.com</span>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center text-center gap-3">
            <p>© 2026 Virtual Campus. All rights reserved. Designed for university students & instructors.</p>
            <div className="flex space-x-4">
              <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-primary cursor-pointer">Terms of Service</span>
              <span>•</span>
              <span className="hover:text-primary cursor-pointer">Academic Honor Code</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
