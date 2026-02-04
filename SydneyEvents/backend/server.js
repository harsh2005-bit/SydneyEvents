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
app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true
}));
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
