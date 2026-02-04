const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');

module.exports = function(passport) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    // In a real app, you'd save the user to DB here.
    // For this assignment, we just pass the profile.
    // You might want to check against a whitelist here for "Admin" status.
    return done(null, profile);
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};
