/**
 * Wraps an async function and catches any errors, passing them to next()
 * This eliminates the need for try-catch blocks in async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const catchAsync = fn => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = catchAsync; 