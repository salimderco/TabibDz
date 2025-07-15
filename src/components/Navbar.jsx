import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isDoctor, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { to: '/doctors', label: 'Doctors', showWhen: 'always' },
    { to: '/dashboard/doctor', label: 'Dashboard', showWhen: 'doctor' },
    { to: '/dashboard/patient', label: 'Dashboard', showWhen: 'patient' },
    { to: '/login', label: 'Login', showWhen: 'guest' },
    { to: '/register', label: 'Register', showWhen: 'guest' },
  ];

  const getFilteredLinks = () => {
    return navLinks.filter(link => {
      if (link.showWhen === 'always') return true;
      if (link.showWhen === 'guest' && !isAuthenticated) return true;
      if (link.showWhen === 'doctor' && isDoctor) return true;
      if (link.showWhen === 'patient' && !isDoctor && isAuthenticated) return true;
      return false;
    });
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-blue-600">
            TabibDZ
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {getFilteredLinks().map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `${isActive ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'} hover:text-blue-600`
                }
              >
                {link.label}
              </NavLink>
            ))}
            
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600"
              >
                Logout
              </button>
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
          <div className="md:hidden py-4 space-y-2">
            {getFilteredLinks().map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block py-2 px-4 ${
                    isActive ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'
                  } hover:text-blue-600`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-blue-600"
              >
                Logout
              </button>
            )}

            <button
              onClick={() => {
                setIsDark(!isDark);
                setIsMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-blue-600"
            >
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
} 