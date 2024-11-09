const Auth = require('../models/authModel');
const bcrypt = require("bcryptjs");
const Reviewer = require('../models/reviewerModel');

/**
 * Registers a new user.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.firstName - The first name of the user.
 * @param {string} req.body.middleName - The middle name of the user.
 * @param {string} req.body.lastName - The last name of the user.
 * @param {string} req.body.userName - The username of the user.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.phoneNumber - The phone number of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {string} req.body.institution - The institution of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user is registered.
 */
const register = async (req, res) => {
    let userEmail = await Auth.findOne({ email: req.body.email });
    if (userEmail) {
        return res.status(400).json({ success: false, message: "Sorry a user with this email already exists" })
    }
    let userPhone = await Auth.findOne({ phoneNumber: req.body.phoneNumber });
    if (userPhone) {
        return res.status(400).json({ success: false, message: "Sorry a user with this phone number already exists" })
    }
    let userName = await Auth.findOne({ userName: req.body.userName });
    if (userName) {
        return res.status(400).json({ success: false, message: "Sorry a user with this username already exists" })
    }
    try {
        const reviewer = await Reviewer.findOne({ email: req.body.email });
        const registerUser = new Auth({
            firstName: req.body.firstName,
            middleName: req.body.middleName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            password: req.body.password,
            institution: req.body.institution,
            isReviewer: !!reviewer,
        });
        // Generate auth token
        const token = await registerUser.generateAuthToken();
        await registerUser.save();
        res.status(201).send({ success: true, message: "User registered successfully", accessToken: token })
    } catch (error) {
        res.status(404).send({ success: false, message: "User registration failed", error: error });
    }
}

/**
 * Logs in a user with the provided username and password.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.userName - The username of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves once the login process is complete.
 */
const login = async (req, res) => {
    try {
        const username = req.body.userName;
        const password = req.body.password;
        let user = await Auth.findOne({ email: username });
        if (!user) {
            user = await Auth.findOne({ userName: username });
        }
        if (!user) {
            return res.status(400).send({ success: false, message: "Invalid Username" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            if (!user.emailVerified) {
                return res.status(400).send({ success: false, message: "Email not verified", data: { email: user.email, firstName: user.firstName, userName: user.userName } });
            }
            const token = await user.generateAuthToken();
            res.status(200).json({ success: true, message: "User logged in successfully", data: user, accessToken: token });
        } else {
            res.status(400).json({ success: false, message: "Invalid Password" });
        }
    }
    catch (error) {
        res.status(400).json({ success: false, message: "User login failed", error: error });
    }
}

/**
 * Verifies the email of a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.email - The email of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the email is verified.
 */
const verifyEmail = async (req, res) => {
    try {
        const user = await Auth.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User doesn't exists" });
        }
        user.emailVerified = true;
        await user.save();
        res.status(200).json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Email verification failed", error: error });
    }
}

/**
 * Check if a user exists based on the provided email or username.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.userName - The username of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves once the user check is complete.
 */
const checkUser = async (req, res) => {
    try {
        const user = await Auth.findOne({ email: req.body.email }) || await Auth.findOne({ userName: req.body.userName });
        if (!user) {
            return res.status(400).json({ success: false, message: "User doesn't exist" });
        }
        res.status(200).json({ success: true, message: "User exists", data: { email: user.email, firstName: user.firstName, userName: user.userName } });
    } catch (error) {
        res.status(500).json({ success: false, message: "User check failed", error: error });
    }
}

/**
 * Resets the password for a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The new password for the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the password is reset.
 */
const resetPassword = async (req, res) => {
    try {
        const user = await Auth.findOne({ email: req.body.email });
        user.password = req.body.password;
        await user.save();
        res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Password change failed", error: error });
    }
}

/**
 * Logs out the user by removing the token from the user's tokens array,
 * clearing the access token cookie, and saving the user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object.
 * @param {Object} req.token - The token object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user is logged out.
 */
const logout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        res.clearCookie("accessToken");
        await req.user.save();
        res.status(200).send({ success: true, message: "User logged out successfully" })
    } catch (error) {
        res.status(500).send({ success: false, message: "User logout failed", error: error });
    }
}

/**
 * Retrieves the user profile.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user profile is retrieved.
 */
const userProfile = async (req, res) => {
    try {
        res.status(200).send({ success: true, message: "User profile retrieved successfully", data: req.user });
    } catch (error) {
        res.status(500).send({ success: false, message: "User profile retrieval failed", error: error });
    }
}

/**
 * Updates the user profile.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.firstName - The first name of the user.
 * @param {string} req.body.middleName - The middle name of the user.
 * @param {string} req.body.lastName - The last name of the user.
 * @param {string} req.body.userName - The username of the user.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.phoneNumber - The phone number of the user.
 * @param {string} req.body.dateOfBirth - The date of birth of the user.
 * @param {string} req.body.institution - The institution of the user.
 * @param {Object} req.file - The file object.
 * @param {string} req.file.filename - The file name.
 * @param {Object} req.user - The user object.
 * @param {Object} req.user._id - The user ID.
 * @param {Object} req.user.profilePicture - The profile picture of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user profile is updated.
 */
const updateProfile = async (req, res) => {
    try {
        const user = await Auth.findOne({ _id: req.user._id });
        user.firstName = req.body.firstName;
        user.middleName = req.body.middleName;
        user.lastName = req.body.lastName;
        user.userName = req.body.userName;
        user.email = req.body.email;
        user.phoneNumber = req.body.phoneNumber;
        user.dateOfBirth = req.body.dateOfBirth;
        user.institution = req.body.institution;
        user.profilePicture = !!req.file ? req.file.filename : req.user.profilePicture;
        await user.save();
        res.status(200).send({ success: true, message: "User profile updated successfully" });
    } catch (error) {
        res.status(500).send({ success: false, message: "User profile update failed", error: error });
    }
}

/**
 * Retrieves a list of users.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user list is retrieved.
 */
const userList = async (req, res) => {
    try {
        const users = await Auth.find({}, '_id firstName middleName lastName');
        res.status(200).send({ success: true, message: "User list retrieved successfully", data: users });
    } catch (error) {
        res.status(500).send({ success: false, message: "User list retrieval failed", error: error });
    }
}

module.exports = {
    register,
    login,
    logout,
    userProfile,
    verifyEmail,
    resetPassword,
    updateProfile,
    checkUser,
    userList
}