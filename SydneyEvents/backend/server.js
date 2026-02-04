const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log("Mongo URI:", process.env.MONGO_URI ? process.env.MONGO_URI.split('@')[1] || 'Found but opaque' : 'UNDEFINED');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./config/db');
const startScheduler = require('./jobs/scheduler');

// Passport Config
require('./config/passport')(passport);

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = ['http://localhost:5173', 'https://enjoyeventsatsydney.vercel.app'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.set('trust proxy', 1); // Trust first proxy (Vercel)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(session({
  secret: 'secret', // Change in production
  resave: true,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/admin', require('./routes/admin'));
app.use('/auth', require('./routes/auth'));

// Start Scheduler
startScheduler();

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, console.log(`Server running on port ${PORT}`));
}

module.exports = app;
