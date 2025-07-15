const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for user authentication
 * @param {string} userId - The user's ID
 * @param {string} [role='user'] - The user's role
 * @returns {string} The generated JWT token
 * @throws {Error} If JWT_SECRET is not set or token generation fails
 */
const generateToken = (userId, role = 'user') => {
    // Ensure JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured in environment variables');
    }

    try {
        // Generate token with user ID and role
        return jwt.sign(
            { 
                id: userId,
                role,
                iat: Math.floor(Date.now() / 1000)
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '30d', // Token expires in 30 days
                algorithm: 'HS512', // Use a stronger algorithm
                audience: process.env.JWT_AUDIENCE || 'tabibdz-api',
                issuer: process.env.JWT_ISSUER || 'tabibdz',
                notBefore: 0 // Token is valid immediately
            }
        );
    } catch (error) {
        console.error('Token generation error:', error);
        throw new Error('Failed to generate authentication token');
    }
};

module.exports = generateToken; 