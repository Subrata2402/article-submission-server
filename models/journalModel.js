const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema({
    editorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register',
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Journal', journalSchema);