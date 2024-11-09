const jwt = require('jsonwebtoken');
const Auth = require('../models/authModel');

/**
 * Middleware function to authenticate user based on token.
 * @param {Object} req - The request object.
 * @param {Object} req.header - The request header object.
 * @param {string} req.header.Authorization - The authorization header.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - Promise that resolves when authentication is successful or rejects with an error.
 */
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer', '').trim();
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        const user = await Auth.findOne({ _id: verifyUser._id }).select({ password: 0, tokens: 0 });
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
        }
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Unauthorized: Invalid token", error: error });
    }
}

/**
 * Middleware function to verify if the user is an editor.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const verifyEditor = (req, res, next) => {
    if (req.user.isEditor) {
        next();
    } else {
        res.status(403).json({ success: false, message: "Forbidden: Access denied" });
    }
}

/**
 * Middleware function to verify if the user is a reviewer.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const verifyReviewer = (req, res, next) => {
    if (req.user.isReviewer) {
        next();
    } else {
        res.status(403).json({ success: false, message: "Forbidden: Access denied" });
    }
}

/**
 * Middleware function to verify if the user is a super admin.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const verifySuperAdmin = (req, res, next) => {
    if (req.user.isSuperAdmin) {
        next();
    } else {
        res.status(403).json({ success: false, message: "Forbidden: Access denied" });
    }
}

module.exports = { authenticate, verifyEditor, verifyReviewer, verifySuperAdmin };