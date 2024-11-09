/**
 * Connects to the MongoDB database using the provided URI.
 * @param {string} process.env.DATABASE_URI - The URI of the MongoDB database.
 * @returns {Promise<void>} A promise that resolves when the database connection is successful.
 */
const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_URI).then(() => {
    console.log("DB Connection successful");
}).catch((e) => {
    console.log(e);
})