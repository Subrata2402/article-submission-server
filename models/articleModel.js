const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register',
        required: true
    },
    // journalId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Journal',
    //     required: true
    // },
    title: {
        type: String,
        required: true
    },
    abstract: {
        type: String,
        required: true
    },
    keywords: [
        {
            type: String,
            required: true
        }
    ],
    menuscript: {
        type: String,
        required: true
    },
    coverLetter: {
        type: String,
        required: true
    },
    supplementaryFile: {
        type: String,
        required: false
    },
    // mergedScript: {
    //     type: String,
    //     required: true
    // },
    authors: [{
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        affiliation: {
            type: String,
            required: true
        },
        correspondingAuthor: {
            type: Boolean,
            required: true
        },
        firstAuthor: {
            type: Boolean,
            required: true
        },
        otherAuthor: {
            type: Boolean,
            required: true
        }
    }],
    status: {
        type: String,
        required: true,
        default: 'submitted'
    },
    remarks: {
        type: String,
        required: false,
        default: ""
    },
    finalStatus: {
        type: String,
        required: false,
    },
    editorComments: {
        type: String,
        required: false,
        default: ""
    },
    reviewers: [{
        email: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            default: "Null"
        },
        comments: {
            type: String,
            required: false,
            default: ""
        },
        reviewDate: {
            type: Date,
            default: Date.now
        },
        reviewed: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;