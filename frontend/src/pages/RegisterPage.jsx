import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, UserPlus, ArrowLeft, Stethoscope, UserCircle } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = 'الاسم مطلوب';
    }
    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await register(formData);
      
      toast.success('تم إنشاء الحساب بنجاح!', {
        icon: '🎉',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      // التوجيه إلى لوحة التحكم المناسبة
      navigate(response.user.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient');
    } catch (err) {
      console.error('Registration error:', err);
      
      // عرض رسالة الخطأ للمستخدم
      toast.error(err.message || 'فشل في إنشاء الحساب. الرجاء المحاولة مرة أخرى.', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      // إذا كانت هناك أخطاء تحقق محددة
      if (err.details && Object.keys(err.details).length > 0) {
        setErrors(err.details);
      }
    } finally {
      setLoading(false);
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
              إنشاء حساب جديد
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              لديك حساب بالفعل؟{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <ArrowLeft className="inline-block h-4 w-4 ml-1" />
                تسجيل الدخول
              </Link>
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pr-10 py-3 text-gray-900 dark:text-white placeholder-gray-400 bg-gray-50 dark:bg-gray-700 border ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pr-10 py-3 text-gray-900 dark:text-white placeholder-gray-400 bg-gray-50 dark:bg-gray-700 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
                    placeholder="أدخل بريدك الإلكتروني"
                    required
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
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pr-10 py-3 text-gray-900 dark:text-white placeholder-gray-400 bg-gray-50 dark:bg-gray-700 border ${
                      errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
                    placeholder="أدخل كلمة المرور"
                    required
                    minLength={6}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  نوع الحساب
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'patient' }))}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                      formData.role === 'patient'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'border-gray-200 text-gray-600 hover:border-blue-200 dark:border-gray-700 dark:text-gray-400 dark:hover:border-blue-800'
                    }`}
                  >
                    <UserCircle className="h-5 w-5" />
                    <span>مريض</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'doctor' }))}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                      formData.role === 'doctor'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'border-gray-200 text-gray-600 hover:border-blue-200 dark:border-gray-700 dark:text-gray-400 dark:hover:border-blue-800'
                    }`}
                  >
                    <Stethoscope className="h-5 w-5" />
                    <span>طبيب</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
              type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center gap-2 px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>إنشاء الحساب</span>
                </>
              )}
              </button>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
} 