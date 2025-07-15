const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Error response helper
const errorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({
        success: false,
        error: message
    });
};

/**
 * Validates JWT token and adds user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header or cookies
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return errorResponse(res, 401, 'غير مصرح به، يرجى تسجيل الدخول');
        }

        try {
            // Verify token with strict validation
            const decoded = jwt.verify(token, process.env.JWT_SECRET, {
                algorithms: ['HS512'],
                audience: process.env.JWT_AUDIENCE || 'tabibdz-api',
                issuer: process.env.JWT_ISSUER || 'tabibdz',
                clockTolerance: 0 // No clock tolerance
            });

            // Get user from token
            const user = await User.findById(decoded.id)
                .select('-password')
                .lean(); // Use lean() for better performance
            
            if (!user) {
                return errorResponse(res, 401, 'المستخدم غير موجود');
            }

            if (!user.isActive) {
                return errorResponse(res, 401, 'الحساب غير نشط');
            }

            // Check if token was issued before password change
            if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
                return errorResponse(res, 401, 'تم تغيير كلمة المرور، يرجى تسجيل الدخول مرة أخرى');
            }

            // Add user and token info to request
            req.user = user;
            req.token = token;
            next();

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return errorResponse(res, 401, 'رمز المصادقة غير صالح');
            }
            if (error.name === 'TokenExpiredError') {
                return errorResponse(res, 401, 'انتهت صلاحية رمز المصادقة');
            }
            throw error; // Re-throw unexpected errors
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return errorResponse(res, 500, 'خطأ في المصادقة');
    }
};

/**
 * Authorizes user roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return errorResponse(res, 401, 'المستخدم غير موجود');
            }
            
            if (!roles.includes(req.user.role)) {
                return errorResponse(res, 403, 'غير مصرح لك بالوصول إلى هذا المسار');
            }

            next();
        } catch (error) {
            console.error('Authorization error:', error);
            return errorResponse(res, 500, 'خطأ في التحقق من الصلاحيات');
        }
    };
};

/**
 * Checks if user is active
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isActive = async (req, res, next) => {
    try {
        if (!req.user.isActive) {
            return errorResponse(res, 403, 'الحساب غير نشط');
        }
        next();
    } catch (error) {
        console.error('Active check error:', error);
        return errorResponse(res, 500, 'خطأ في التحقق من حالة الحساب');
    }
};

module.exports = { 
    protect, 
    authorize,
    isActive
}; 