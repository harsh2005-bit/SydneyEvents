const express = require('express');
const passport = require('passport');
const router = express.Router();

// Auth with Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to dashboard.
    const clientURL = process.env.NODE_ENV === 'production' 
      ? 'https://enjoyeventsatsydney.vercel.app' 
      : 'http://localhost:5173';
    
    res.redirect(`${clientURL}/dashboard`);
  }
);

// Logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
      if (err) { return next(err); }
      req.session.destroy((err) => {
        if (err) console.log("Session destroy error", err);
        res.clearCookie('connect.sid'); // Default session cookie name
        const clientURL = process.env.NODE_ENV === 'production' 
          ? 'https://enjoyeventsatsydney.vercel.app' 
          : 'http://localhost:5173';
        res.redirect(clientURL);
      });
  });
});

// Check status
router.get('/current_user', (req, res) => {
    res.json(req.user || null);
});

module.exports = router;
