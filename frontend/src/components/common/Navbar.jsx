import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Briefcase, User, LogOut, Menu, X, ChevronDown, Brain, Upload, ListTodo, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setIsOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <div className="bg-indigo-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
                Hire<span className="text-indigo-600">IQ</span>
              </span>
            </Link>

            {/* Desktop Left Nav Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-2">
              <Link to="/jobs" className={linkClass('/jobs')}>
                Find Jobs
              </Link>
              {isAuthenticated && user?.role === 'SEEKER' && (
                <>
                  <Link to="/seeker" className={linkClass('/seeker')}>
                    Dashboard
                  </Link>
                  <Link to="/seeker/recommendations" className={linkClass('/seeker/recommendations')}>
                    <span className="flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-indigo-500 animate-pulse" />
                      AI Match
                    </span>
                  </Link>
                  <Link to="/seeker/applications" className={linkClass('/seeker/applications')}>
                    Applications
                  </Link>
                </>
              )}
              {isAuthenticated && user?.role === 'EMPLOYER' && (
                <>
                  <Link to="/employer" className={linkClass('/employer')}>
                    Dashboard
                  </Link>
                  <Link to="/employer/jobs" className={linkClass('/employer/jobs')}>
                    Manage Jobs
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name ? user.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="text-left pr-1">
                    <p className="text-xs font-semibold text-slate-900 leading-3">{user.name}</p>
                    <span className="text-[10px] text-slate-500 font-medium capitalize">{user.role.toLowerCase()}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-20 transition-all">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      {user.role === 'SEEKER' && (
                        <>
                          <Link
                            to="/seeker/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            My Profile
                          </Link>
                          <Link
                            to="/seeker/resume"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Upload className="w-4 h-4 text-slate-400" />
                            Upload Resume
                          </Link>
                        </>
                      )}

                      {user.role === 'EMPLOYER' && (
                        <Link
                          to="/employer/post-job"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-slate-400" />
                          Post a Job
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left font-medium mt-1 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                  Sign in
                </Link>
                <Link to="/register" className="gradient-button px-4 py-2 rounded-xl text-sm font-semibold">
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200/60 bg-white px-2 pt-2 pb-4 space-y-1 shadow-inner">
          <Link
            to="/jobs"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Find Jobs
          </Link>
          
          {isAuthenticated ? (
            <>
              {user.role === 'SEEKER' && (
                <>
                  <Link
                    to="/seeker"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/seeker/recommendations"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-base font-semibold text-indigo-600 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <Brain className="w-4 h-4 animate-pulse" />
                    AI Match Recommendations
                  </Link>
                  <Link
                    to="/seeker/applications"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    My Applications
                  </Link>
                  <Link
                    to="/seeker/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/seeker/resume"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Upload Resume
                  </Link>
                </>
              )}

              {user.role === 'EMPLOYER' && (
                <>
                  <Link
                    to="/employer"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/employer/jobs"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Manage Jobs
                  </Link>
                  <Link
                    to="/employer/post-job"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Post a Job
                  </Link>
                </>
              )}

              <div className="border-t border-slate-100 my-2 pt-2" />
              
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name ? user.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-base font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-5 h-5" />
                Log out
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center px-4 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="gradient-button block text-center px-4 py-2.5 rounded-xl text-base font-semibold"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
