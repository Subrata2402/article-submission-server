const multer = require('multer');
const path = require('path');

// Function to define storage for Journal files
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if (file.fieldname === 'profile-picture') {
            callback(null, path.join(__dirname, '../public/profile-pictures'), (err) => {
                if (err) {
                    console.log(err);
                }
            });
        } else if (file.fieldname === 'menuscript') {
            callback(null, path.join(__dirname, '../public/articles/menuscript'), (err) => {
                if (err) {
                    console.log(err);
                }
            });
        } else if (file.fieldname === 'coverLetter') {
            callback(null, path.join(__dirname, '../public/articles/cover-letter'), (err) => {
                if (err) {
                    console.log(err);
                }
            });
        } else if (file.fieldname === 'supplementaryFile') {
            callback(null, path.join(__dirname, '../public/articles/supplementary-file'), (err) => {
                if (err) {
                    console.log(err);
                }
            });
        } else if (file.fieldname === 'mergedScript') {
            callback(null, path.join(__dirname, '../public/articles/merged-script'), (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + path.extname(file.originalname), (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
});

// Middleware for uploading images
const upload = multer({ storage });

module.exports = { upload };