import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user = await login(formData);
      toast.success('تم تسجيل الدخول بنجاح', {
        icon: '👋',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      // Redirect based on user role
      navigate(user.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient');
    } catch (error) {
      toast.error(error.error || error.message || 'حدث خطأ أثناء تسجيل الدخول', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      // If there are validation errors, set them
      if (error.details) {
        setErrors(error.details.reduce((acc, err) => ({
          ...acc,
          [err.field]: err.message
        }), {}));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">
              مرحباً بعودتك
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              ليس لديك حساب؟{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                سجل الآن
                <ArrowRight className="inline-block h-4 w-4 mr-1" />
              </Link>
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`block w-full pr-10 py-3 text-gray-900 dark:text-white placeholder-gray-400 bg-gray-50 dark:bg-gray-700 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
                    placeholder="أدخل بريدك الإلكتروني"
                    value={formData.email}
                    onChange={handleChange}
                    dir="ltr"
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className={`block w-full pr-10 py-3 text-gray-900 dark:text-white placeholder-gray-400 bg-gray-50 dark:bg-gray-700 border ${
                      errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
                    placeholder="أدخل كلمة المرور"
                    value={formData.password}
                    onChange={handleChange}
                    dir="ltr"
                  />
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                />
                <label
                  htmlFor="remember-me"
                  className="mr-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  تذكرني
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full flex justify-center items-center space-x-2 rtl:space-x-reverse px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage; 