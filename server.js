const express = require('express');
const app = express();
const cors = require('cors');
const postRoute = require('./routes/postRoute');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('./database/db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: '*',
    // credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

app.use('/', express.static('public'));

app.use('/', postRoute);

app.get('/', (req, res) => {
    res.send('Welcome to the Journal API');
});

// app.get('/save-cookie', (req, res) => {
//     console.log(req.cookies);
// })

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}...`);
});