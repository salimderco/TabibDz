import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Search, User, Calendar, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isDoctor, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 transition-all duration-200 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600">TabibDZ</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `flex items-center space-x-2 text-sm font-medium ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-700 hover:text-primary-600 dark:text-gray-300'
                }`
              }
            >
              <Search size={18} />
              <span>Find Doctors</span>
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink
                  to={isDoctor ? "/appointments/doctor" : "/appointments"}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 text-sm font-medium ${
                      isActive
                        ? 'text-primary-600'
                        : 'text-gray-700 hover:text-primary-600 dark:text-gray-300'
                    }`
                  }
                >
                  <Calendar size={18} />
                  <span>Appointments</span>
                </NavLink>

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300">
                    <User size={18} />
                    <span>{user.name}</span>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white dark:bg-gray-800 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </div>
            )}

            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 text-sm font-medium ${
                  isActive
                    ? 'text-primary-600 bg-primary-50 dark:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              <Search size={18} />
              <span>Find Doctors</span>
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink
                  to={isDoctor ? "/appointments/doctor" : "/appointments"}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 text-sm font-medium ${
                      isActive
                        ? 'text-primary-600 bg-primary-50 dark:bg-gray-800'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Calendar size={18} />
                  <span>Appointments</span>
                </NavLink>

                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="px-4 py-2 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate('/login');
                    setIsMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={() => {
                    navigate('/register');
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}

            <button
              onClick={() => setIsDark(!isDark)}
              className="flex w-full items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {isDark ? (
                <>
                  <Sun size={18} />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={18} />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
} 