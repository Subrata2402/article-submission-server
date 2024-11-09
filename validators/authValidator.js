const { z } = require('zod');

/**
 * Validator object for authentication related operations.
 * @type {Object}
 */
const authValidator = {
    register: z.object({
        firstName: z.string().trim()
            .min(3, 'First name should be at least 3 characters long')
            .max(50, 'First name should be at most 50 characters long'),
        middleName: z.string().trim().optional(),
        lastName: z.string().trim()
            .min(2, 'Last name should be at least 2 characters long')
            .max(50, 'Last name should be at most 50 characters long'),
        userName: z.string().trim()
            .min(5, 'Username should be at least 5 characters long')
            .max(50, 'Username should be at most 50 characters long'),
        email: z.string().trim()
            .email("Invalid email address")
            .min(5, 'Email should be at least 5 characters long')
            .max(50, 'Email should be at most 50 characters long'),
        phoneNumber: z.string().trim()
            .min(10, 'Phone number should be at least 10 characters long')
            .max(15, 'Phone number should be at most 15 characters long'),
        password: z.string()
            .min(8, 'Password should be at least 8 characters long')
            .max(50, 'Password should be at most 50 characters long'),
        confPassword: z.string()
            .min(8, 'Password should be at least 8 characters long')
            .max(50, 'Password should be at most 50 characters long'),
        institution: z.string().optional()
    }),

    login: z.object({
        userName: z.string({requied_error: "Username is required to login"}).trim(),
        password: z.string({required_error: "Password is required to login"}).trim()
    }),

    verifyEmail: z.object({
        email: z.string().email("Invalid email address").trim(),
    }),

    resetPassword: z.object({
        email: z.string().email("Invalid email address").trim(),
        password: z.string()
            .min(8, 'Password should be at least 8 characters long')
            .max(50, 'Password should be at most 50 characters long'),
        confPassword: z.string()
            .min(8, 'Password should be at least 8 characters long')
            .max(50, 'Password should be at most 50 characters long'),
    })
}

module.exports = authValidator;