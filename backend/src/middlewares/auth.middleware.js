const authService = require('../services/auth.service');

/**
 * Middleware to verify JWT token
 */
const verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Auth failed: No token or invalid format', { authHeader });
            return res.status(401).json({
                status: 'FAILED',
                message: 'No token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        try {
            const decoded = authService.verifyToken(token);

            // Attach user info to request
            req.user = {
                id: decoded.userId,
                email: decoded.email
            };

            next();
        } catch (err) {
            console.log('❌ Auth failed: Verify token error', err.message);
            throw err;
        }
    } catch (error) {
        return res.status(401).json({
            status: 'FAILED',
            message: 'Invalid or expired token'
        });
    }
};

module.exports = verifyToken;
