const User = require('../models/User');
const generateToken = require('../config/generateToken');

// Validation helper
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Error response helper
const errorResponse = (res, statusCode, message, details = {}) => {
    return res.status(statusCode).json({
        success: false,
        error: message,
        details
    });
};

// Success response helper
const successResponse = (res, statusCode, data) => {
    return res.status(statusCode).json({
        success: true,
        ...data
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // التحقق من الحقول المطلوبة
        const validationErrors = {};
        
        if (!name) validationErrors.name = 'الاسم مطلوب';
        if (!email) validationErrors.email = 'البريد الإلكتروني مطلوب';
        if (!password) validationErrors.password = 'كلمة المرور مطلوبة';
        
        if (Object.keys(validationErrors).length > 0) {
            return errorResponse(res, 400, 'بيانات غير مكتملة', validationErrors);
        }

        // التحقق من طول الاسم
        if (name.length < 2 || name.length > 50) {
            validationErrors.name = 'يجب أن يكون الاسم بين 2 و 50 حرفًا';
        }

        // التحقق من صيغة البريد الإلكتروني
        if (!validateEmail(email)) {
            validationErrors.email = 'البريد الإلكتروني غير صالح';
        }

        // التحقق من طول كلمة المرور
        if (password.length < 6) {
            validationErrors.password = 'يجب أن تكون كلمة المرور 6 أحرف على الأقل';
        }

        // التحقق من نوع المستخدم
        if (role && !['patient', 'doctor'].includes(role)) {
            validationErrors.role = 'نوع المستخدم غير صالح';
        }

        if (Object.keys(validationErrors).length > 0) {
            return errorResponse(res, 400, 'بيانات غير صالحة', validationErrors);
        }

        // التحقق من وجود المستخدم
        const userExists = await User.findOne({ 
            email: email.toLowerCase() 
        }).select('+email').lean();
        
        if (userExists) {
            return errorResponse(res, 400, 'البريد الإلكتروني مستخدم بالفعل', {
                email: 'البريد الإلكتروني مستخدم بالفعل'
            });
        }

        // إنشاء المستخدم
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password,
            role: role || 'patient'
        });

        // إنشاء التوكن
        const token = generateToken(user._id);

        // إعداد كوكيز التوكن
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // إرجاع استجابة نجاح
        return successResponse(res, 201, {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        return errorResponse(res, 500, 'فشل في إنشاء الحساب. الرجاء المحاولة مرة أخرى.');
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return errorResponse(res, 400, 'البريد الإلكتروني وكلمة المرور مطلوبان');
        }

        // Validate email format
        if (!validateEmail(email)) {
            return errorResponse(res, 400, 'البريد الإلكتروني غير صالح');
        }

        // Find user by email and include password field
        const user = await User.findOne({ 
            email: email.toLowerCase(),
            isActive: true // Only active users can login
        }).select('+password');

        // Check if user exists and password matches
        if (!user || !(await user.comparePassword(password))) {
            return errorResponse(res, 401, 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }

        // Update last login
        await user.updateLastLogin();

        // Generate token
        const token = generateToken(user._id);

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Return success response
        return successResponse(res, 200, {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        return errorResponse(res, 500, 'فشل تسجيل الدخول. الرجاء المحاولة مرة أخرى.');
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
    try {
        // Clear token cookie
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0)
        });

        return successResponse(res, 200, {
            message: 'تم تسجيل الخروج بنجاح'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return errorResponse(res, 500, 'فشل تسجيل الخروج. الرجاء المحاولة مرة أخرى.');
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return errorResponse(res, 404, 'المستخدم غير موجود');
        }

        return successResponse(res, 200, { user });
    } catch (error) {
        console.error('Get profile error:', error);
        return errorResponse(res, 500, 'فشل في جلب الملف الشخصي. الرجاء المحاولة مرة أخرى.');
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile
}; 