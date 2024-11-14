const Article = require('../models/articleModel');
const Journal = require('../models/journalModel');
const Reviewer = require('../models/reviewerModel');
const Auth = require('../models/authModel');
const nodemailer = require("nodemailer");
const JSZip = require('jszip');
const fs = require('fs');

/**
 * Add a new journal article.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.userId - The user ID.
 * @param {string} req.body.title - The title of the journal article.
 * @param {string} req.body.abstract - The abstract of the journal article.
 * @param {string[]} req.body.keywords - The keywords of the journal article.
 * @param {string} req.file.filename - The filename of the journal article file.
 * @param {string[]} req.body.authors - The authors of the journal article.
 * @param {string} req.body.journalId - The ID of the journal.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the journal article is added.
 */
const addArticle = async (req, res) => {
    try {
        const article = new Article({
            userId: req.body.userId,
            title: req.body.title,
            abstract: req.body.abstract,
            keywords: JSON.parse(req.body.keywords),
            menuscript: req.files.menuscript[0].filename,
            coverLetter: req.files.coverLetter[0].filename,
            supplementaryFile: req.files.supplementaryFile[0].filename,
            mergedScript: req.files.mergedScript[0].filename,
            authors: JSON.parse(req.body.authors),
            // journalId: req.body.journalId,
        });
        const responseData = await article.save();
        // const journal = await Journal.findById(req.body.journalId).populate('editorId');
        res.status(201).json({ success: true, message: "Article submitted successfully", data: responseData, editorMail: null });
    } catch (error) {
        res.status(404).json({ success: false, message: "Article submission failed", error: error });
    }
}

/**
 * Retrieves journal articles data for a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the retrieved journal articles data.
 */
const getArticle = async (req, res) => {
    try {
        const articles = await Article.find({ userId: req.user._id }).populate('userId', 'firstName middleName lastName profilePicture');
        const otherArticles = await Article.find({ 'authors.email': req.user.email }).populate('userId', 'firstName middleName lastName profilePicture');
        if (articles.length === 0 && otherArticles.length === 0) {
            return res.status(404).json({ success: false, message: "You didn't submit any journal article" });
        }
        res.status(200).json({ success: true, message: "Journal Articles data retrieved successfully", data: articles.concat(otherArticles.filter(item2 => !articles.some(item1 => item1.id === item2.id))) });
    } catch (error) {
        res.status(404).json({ success: false, message: "Journal Articles data retrieval failed", error: error });
    }
}

/**
 * Add a new journal entry.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the journal details.
 * @param {string} req.body.editorId - The ID of the editor creating the journal entry.
 * @param {string} req.body.title - The title of the journal entry.
 * @param {string} req.body.description - The description of the journal entry.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the journal is added successfully.
 */
const addJournal = async (req, res) => {
    try {
        const journal = new Journal({
            title: req.body.title,
            description: req.body.description,
        });
        const responseData = await journal.save();
        res.status(201).json({ success: true, message: "Journal added successfully", data: responseData });
    } catch (error) {
        res.status(404).json({ success: false, message: "Journal addition failed", error: error });
    }
}

/**
 * Deletes a journal by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.journalId - The ID of the journal to delete.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 */
const deleteJournal = async (req, res) => {
    try {
        const journalData = await Journal.findByIdAndDelete(req.params.journalId);
        if (!journalData) {
            return res.status(404).json({ success: false, message: "Journal not found" });
        }
        if (journalData.editorId) await Auth.findByIdAndDelete(journalData.editorId);
        res.status(200).json({ success: true, message: "Journal deleted successfully" });
    } catch (error) {
        res.status(404).json({ success: false, message: "Journal deletion failed", error: error });
    }
}

/**
 * Retrieves the list of journals.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the list of journals is retrieved.
 */
const getJournalList = async (req, res) => {
    try {
        const journalData = await Journal.find().populate('editorId', 'firstName lastName email');
        res.status(200).json({ success: true, message: "Journal data retrieved successfully", data: journalData.map(journal => ({ ...journal.toObject(), editor: journal.editorId, editorId: journal.editorId ? journal.editorId._id : null })) });
    } catch (error) {
        res.status(404).json({ success: false, message: "Journal data retrieval failed", error: error });
    }
}

/**
 * Sends an email using the provided information.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the email is sent.
 */
const sendMail = async (req, res) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_HOST,
            pass: process.env.EMAIL_HOST_PASSWORD,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: req.body.mailFrom + " <" + process.env.EMAIL_HOST + ">",
            to: req.body.mailTo,
            subject: req.body.mailSubject,
            // text: req.body.mailText,
            html: req.body.mailHtml,
        });

        if (info) {
            res.status(200).json({ success: true, message: "Mail sent successfully" });
        } else {
            res.status(400).json({ success: false, message: "Mail sending failed" });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: "Mail sending failed", error: error });
    }
}

/**
 * Retrieves a list of journal articles based on the provided journal ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.journalId - The ID of the journal to retrieve articles for.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves once the articles are retrieved.
 */
const getArticleList = async (req, res) => {
    try {
        const articles = await Article.find().populate('userId', 'firstName middleName lastName email profilePicture');
        if (articles.length === 0) {
            return res.status(404).json({ success: false, message: "No journal articles found" });
        }
        res.status(200).json({ success: true, message: "Journal Articles data retrieved successfully", data: articles });
    } catch (error) {
        res.status(404).json({ success: false, message: "Journal Articles data retrieval failed", error: error });
    }
}

/**
 * Updates a journal article.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body._id - The ID of the article to update.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the article is updated.
 */
const updateArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndUpdate(req.body._id, req.body, { new: true });
        if (!article) {
            return res.status(404).json({ success: false, message: "Journal article not found" });
        }
        res.status(200).json({ success: true, message: "Journal article updated successfully", data: article });
    } catch (error) {
        res.status(404).json({ success: false, message: "Journal article update failed", error: error });
    }
}

/**
 * Updates a journal article review.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the review is updated.
 */
const updateReview = async (req, res) => {
    try {
        const article = await Article.findById(req.body._id);
        if (!article) {
            return res.status(404).json({ success: false, message: "Journal article not found" });
        }
        const reviewerIndex = article.reviewers.findIndex(reviewer => reviewer.email === req.user.email);
        article.reviewers[reviewerIndex] = req.body.reviewers[0];
        await article.save();
        res.status(200).json({ success: true, message: "Journal article updated successfully" });
    } catch (error) {
        res.status(404).json({ success: false, message: "Journal article update failed", error: error });
    }
}

/**
 * Add a new reviewer.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the reviewer details.
 * @param {string} req.body.firstName - The first name of the reviewer.
 * @param {string} req.body.lastName - The last name of the reviewer.
 * @param {string} req.body.email - The email of the reviewer.
 * @param {string} req.body.affiliation - The affiliation of the reviewer.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the reviewer is added.
 */
const addReviewer = async (req, res) => {
    const reviewerData = await Reviewer.findOne({ email: req.body.email });
    if (reviewerData) {
        return res.status(400).json({ success: false, message: "Reviewer already exists" });
    };
    try {
        const reviewer = new Reviewer({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            affiliation: req.body.affiliation,
        })
        const responseData = await reviewer.save();
        await Auth.findOneAndUpdate({ email: req.body.email }, { $set: { isReviewer: true } }, { new: true });
        res.status(201).json({ success: true, message: "Reviewer added successfully", data: responseData });
    } catch (error) {
        res.status(404).json({ success: false, message: "Reviewer addition failed", error: error });
    }
}

/**
 * Add bulk reviewers to the system.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the reviewers details.
 * @param {Object[]} req.body.reviewers - The reviewers to add.
 * @param {string} req.body.reviewers[].firstName - The first name of the reviewer.
 * @param {string} req.body.reviewers[].lastName - The last name of the reviewer.
 * @param {string} req.body.reviewers[].email - The email of the reviewer.
 * @param {string} req.body.reviewers[].affiliation - The affiliation of the reviewer.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
const addBulkReviewer = async (req, res) => {
    try {
        const reviewers = req.body.reviewers;
        const reviewerData = await Reviewer.find();
        const reviewerEmails = reviewerData.map(reviewer => reviewer.email);
        const newReviewers = reviewers.filter(reviewer => !reviewerEmails.includes(reviewer.email));
        // check the valid fields and insert only those fields
        const filteredReviewers = newReviewers.filter(reviewer => reviewer.email && reviewer.firstName && reviewer.lastName && reviewer.affiliation);
        if (filteredReviewers.length === 0) {
            return res.status(400).json({ success: false, message: "All reviewers already exists" });
        }
        const responseData = await Reviewer.insertMany(filteredReviewers);
        res.status(201).json({ success: true, message: "Reviewers added successfully", data: responseData });
    } catch (error) {
        res.status(404).json({ success: false, message: "Reviewers addition failed", error: error });
    }
}

const getReviewerList = async (req, res) => {
    try {
        const reviewerData = await Reviewer.find();
        res.status(200).json({ success: true, message: "Reviewer data retrieved successfully", data: reviewerData });
    } catch (error) {
        res.status(404).json({ success: false, message: "Reviewer data retrieval failed", error: error });
    }
}

/**
 * Retrieves review articles based on the user's email.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object.
 * @param {string} req.user.email - The email of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the articles are retrieved.
 */
const getReviewArticles = async (req, res) => {
    try {
        const articles = await Article.find({ 'reviewers.email': req.user.email }).select('title createdAt mergedScript reviewers');
        if (articles.length === 0) {
            return res.status(404).json({ success: false, message: "No review articles found" });
        }
        const filteredArticles = articles.map(article => ({
            ...article.toObject(),
            reviewers: article.reviewers.filter(reviewer => reviewer.email === req.user.email)
        }));
        res.status(200).json({ success: true, message: "Journal Articles data retrieved successfully", data: filteredArticles });
    } catch (error) {
        res.status(404).json({ success: false, message: "Journal Articles data retrieval failed", error: error });
    }
}

/**
 * Deletes a reviewer by their ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.reviewerId - The ID of the reviewer to delete.
 * @param {Object} res - The response object.
 * @returns {Object} The response object.
 */
const deleteReviewer = async (req, res) => {
    try {
        const reviewerData = await Reviewer.findByIdAndDelete(req.params.reviewerId);
        if (!reviewerData) {
            return res.status(404).json({ success: false, message: "Reviewer not found" });
        }
        await Auth.findOneAndUpdate({ email: reviewerData.email }, { $set: { isReviewer: false } }, { new: true });
        res.status(200).json({ success: true, message: "Reviewer deleted successfully" });
    } catch (error) {
        res.status(404).json({ success: false, message: "Reviewer deletion failed", error: error });
    }
}

/**
 * Creates a zip file containing the specified files.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the files to zip.
 * @param {string[]} req.body.files - The files to zip.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the zip file is created.
 */
const createZip = async (req, res) => {
    const zip = new JSZip();
    try {
        const files = req.body.files;
        files.forEach(file => {
            if (file.includes('menuscript')) {
                zip.file(file, fs.readFileSync(`public/articles/menuscript/${file}`));
            } else if (file.includes('coverLetter')) {
                zip.file(file, fs.readFileSync(`public/articles/cover-letter/${file}`));
            } else {
                zip.file(file, fs.readFileSync(`public/articles/merged-script/${file}`));
            }
        });
        const filename = new Date().getTime();
        zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(fs.createWriteStream(`public/articles/zip-files/${filename}.zip`))
            .on('finish', function () {
                res.status(200).json({ success: true, message: "Zip file created successfully", filename: `${filename}.zip` });
            });

        setTimeout(() => {
            fs.unlinkSync(`public/articles/zip-files/${filename}.zip`);
        }, 60000);
    } catch (error) {
        res.status(404).json({ success: false, message: "Zip file creation failed", error: error });
    }
}

const downloadZip = async (req, res) => {
    const filename = req.params.filename;
    res.download(`public/articles/zip-files/${filename}`, filename, (err) => {
        if (err) {
            res.status(404).json({ success: false, message: "Zip file download failed", error: err });
        } else {
            fs.unlinkSync(`public/articles/zip-files/${filename}`);
        }
    });
}

/**
 * Adds an editor to the system.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.firstName - The first name of the editor.
 * @param {string} req.body.middleName - The middle name of the editor.
 * @param {string} req.body.lastName - The last name of the editor.
 * @param {string} req.body.email - The email of the editor.
 * @param {string} req.body.phoneNumber - The phone number of the editor.
 * @param {string} req.body.institution - The institution of the editor.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the editor is added successfully.
 * @throws {Error} - If there is an error while adding the editor.
 */
const addEditor = async (req, res) => {
    try {
        const user = await Auth.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success: false, message: "Editor already exists" });
        }
        const userPhone = await Auth.findOne({ phoneNumber: req.body.phoneNumber });
        if (userPhone) {
            return res.status(400).json({ success: false, message: "Phone number already exists" });
        }
        const password = Math.random().toString(36).toUpperCase().slice(-10);
        const userName = req.body.firstName.toLowerCase() + Math.floor(Math.random() * 1000);
        const editor = await Auth({
            firstName: req.body.firstName,
            middleName: req.body.middleName,
            lastName: req.body.lastName,
            userName: userName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            password: password,
            institution: req.body.institution,
            isEditor: true
        });
        const journal = await Journal.findById(req.body.journalId);
        if (journal.editorId) await Auth.findByIdAndDelete(journal.editorId);
        await editor.save();
        await Journal.findByIdAndUpdate(req.body.journalId, { editorId: editor._id }, { new: true });
        res.status(201).json({ success: true, message: "Editor added successfully", data: { password, userName } });
    } catch (error) {
        res.status(404).json({ success: false, message: "Editor addition failed", error: error });
    }
}

/**
 * Removes the editor from a journal and updates the journal's editorId field.
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.journalId - The ID of the journal to remove the editor from.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the editor is successfully removed.
 */
const removeEditor = async (req, res) => {
    try {
        const journal = await Journal.findById(req.params.journalId);
        if (!journal) {
            return res.status(404).json({ success: false, message: "Journal not found" });
        }
        await Auth.findByIdAndDelete(journal.editorId);
        await Journal.findByIdAndUpdate(req.params.journalId, { editorId: null }, { new: true });
        res.status(200).json({ success: true, message: "Editor removed successfully" });
    } catch (error) {
        res.status(404).json({ success: false, message: "Editor removal failed", error: error });
    }
}

module.exports = {
    addArticle,
    getArticle,
    sendMail,
    getJournalList,
    addJournal,
    deleteJournal,
    getArticleList,
    updateArticle,
    addReviewer,
    addBulkReviewer,
    getReviewerList,
    getReviewArticles,
    updateReview,
    deleteReviewer,
    createZip,
    downloadZip,
    addEditor,
    removeEditor
}