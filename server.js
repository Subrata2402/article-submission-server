const express = require('express');
const app = express();
const cors = require('cors');
const postRoute = require('./routes/postRoute');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
require('./database/db');

app.use(helmet());

app.use(cors({
    origin: ['https://submission.divyarasayan.org'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', express.static('public'));
app.use('/', postRoute);

app.get('/', (req, res) => {
    res.send('Welcome to the Article Submission API');
});

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}...`);
});