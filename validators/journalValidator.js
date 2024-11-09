const { z } = require('zod');

/**
 * Validator object for journal data.
 * @type {Object}
 */
const journalValidator = {
    addJournal: z.object({
        title: z.string().trim()
            .min(3, 'Title should be at least 3 characters long')
            .max(50, 'Title should be at most 50 characters long'),
        content: z.string().trim()
            .min(10, 'Content should be at least 10 characters long')
            .max(1000, 'Content should be at most 1000 characters long'),
        attachment: z.string().url()
    })
};

module.exports = journalValidator;