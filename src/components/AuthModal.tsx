import React, { useState } from 'react';
import { apiService } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync mode whenever modal is opened or mode prop changes
  React.useEffect(() => {
    setIsRegister(initialMode === 'signup');
    setError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const fullName = `${firstName} ${lastName}`.trim();
        const { user } = await apiService.register(fullName, email, department, role, password);
        onSuccess(user);
        onClose();
      } else {
        const { user } = await apiService.login(email, password);
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole: 'student' | 'instructor' = 'student') => {
    setLoading(true);
    setError(null);
    try {
      const email = demoRole === 'instructor' ? 'prof.turing@campus.edu' : 'alex.johnson@campus.edu';
      const password = 'Password123!';
      try {
        const { user } = await apiService.login(email, password);
        onSuccess(user);
        onClose();
      } catch {
        // Fallback: auto-register on Render if not existing yet
        const name = demoRole === 'instructor' ? 'Alan Turing' : 'Alex Johnson';
        const dept = 'Computer Science';
        const { user } = await apiService.register(name, email, dept, demoRole, password);
        onSuccess(user);
        onClose();
      }
    } catch {
      setError('Unable to connect to live Render backend. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <i className="fas fa-times text-lg"></i>
        </button>

        <h2 className="text-2xl font-bold mb-5 text-center text-gray-900 dark:text-white">
          {isRegister ? 'Sign Up for Virtual Campus' : 'Log In to Virtual Campus'}
        </h2>

        {/* 1-Click Instant Demo Options: Student + Instructor */}
        <div className="mb-5 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
              <i className="fas fa-bolt text-black dark:text-white"></i>
              Instant 1-Click Sandbox
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold">
              Live Backend
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
            Experience role-specific features immediately with real Render database connections:
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="modalQuickStudentDemoBtn"
              onClick={() => handleQuickDemo('student')}
              disabled={loading}
              className="py-2.5 px-3 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-bold rounded-lg transition text-xs flex flex-col items-center justify-center gap-1 shadow-sm disabled:opacity-60 cursor-pointer text-center"
            >
              <span className="flex items-center gap-1.5 font-bold">
                <i className="fas fa-user-graduate"></i>
                Student Demo
              </span>
              <span className="text-[10px] opacity-75 font-normal">Alex Johnson</span>
            </button>

            <button
              type="button"
              id="modalQuickInstructorDemoBtn"
              onClick={() => handleQuickDemo('instructor')}
              disabled={loading}
              className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white border border-neutral-700 dark:border-neutral-600 font-bold rounded-lg transition text-xs flex flex-col items-center justify-center gap-1 shadow-sm disabled:opacity-60 cursor-pointer text-center"
            >
              <span className="flex items-center gap-1.5 font-bold">
                <i className="fas fa-chalkboard-teacher"></i>
                Instructor Demo
              </span>
              <span className="text-[10px] opacity-75 font-normal">Prof. Alan Turing</span>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-gray-200 dark:border-gray-700 w-full"></div>
          <span className="bg-white dark:bg-gray-800 px-3 text-[11px] text-gray-400 uppercase tracking-wider font-semibold whitespace-nowrap">
            {isRegister ? 'Or create custom account' : 'Or sign in with email'}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-xs font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-xs font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Morgan"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-xs font-medium mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Computer Science"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-xs font-medium mb-1">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      role === 'student'
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('instructor')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      role === 'instructor'
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Instructor
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-xs font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@campus.edu"
              className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-xs font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black rounded-lg transition font-bold text-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Please wait...' : isRegister ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-xs">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-black dark:text-white hover:underline font-semibold"
            >
              {isRegister ? 'Log In' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
