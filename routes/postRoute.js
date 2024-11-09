const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');
const { authenticate, verifyEditor, verifyReviewer, verifySuperAdmin } = require('../middleware/authentication');
const authSchema = require('../validators/authValidator');
const validate = require('../middleware/validator');
const { upload } = require('../middleware/multer');

const articleUploadFields = [
    { name: "menuscript", maxCount: 1 },
    { name: "coverLetter", maxCount: 1 },
    { name: "supplementaryFile", maxCount: 1 },
    { name: "mergedScript", maxCount: 1 }
];

// Routes
router.post('/article/add-article', authenticate, upload.fields(articleUploadFields), postController.addArticle);
router.get('/article/get-article', authenticate, postController.getArticle);
router.post('/auth/register', validate(authSchema.register), authController.register);
router.post('/auth/login', validate(authSchema.login), authController.login);
router.post('/mail-api/send-mail', postController.sendMail);
router.get('/auth/logout', authenticate, authController.logout);
router.get('/auth/user', authenticate, authController.userProfile);
router.post('/auth/verify-email', authController.verifyEmail);
router.post('/auth/reset-password', authController.resetPassword);
router.get('/journal/get-journal-list', postController.getJournalList);
router.post('/journal/add-journal', authenticate, verifySuperAdmin, postController.addJournal);
router.get('/journal/delete-journal/:journalId', authenticate, verifySuperAdmin, postController.deleteJournal);
router.post('/auth/update-profile', authenticate, upload.single('profile-picture'), authController.updateProfile);
router.post('/auth/check-user', authController.checkUser);
router.get("/article/get-article-list/:journalId", postController.getArticleList);
router.get("/user/get-user-list", authenticate, verifyEditor, authController.userList);
router.post("/article/update-article", authenticate, verifyEditor, postController.updateArticle);
router.post("/reviewer/add-reviewer", authenticate, verifyEditor, postController.addReviewer);
router.post("/reviewer/add-bulk-reviewer", authenticate, verifyEditor, postController.addBulkReviewer);
router.get("/reviewer/get-reviewer-list", authenticate, verifyEditor, postController.getReviewerList);
router.get("/article/get-review-articles", authenticate, verifyReviewer, postController.getReviewArticles);
router.post("/article/update-review", authenticate, verifyReviewer, postController.updateReview);
router.get("/reviewer/delete-reviewer/:reviewerId", authenticate, verifyEditor, postController.deleteReviewer);
router.post("/zip/create-zip", authenticate, verifyEditor, postController.createZip);
router.get("/zip/download-zip/:filename", postController.downloadZip);
router.post("/editor/add-editor", authenticate, verifySuperAdmin, postController.addEditor);
router.get("/editor/remove-editor/:journalId", authenticate, verifySuperAdmin, postController.removeEditor);

module.exports = router;