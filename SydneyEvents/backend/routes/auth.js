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
    // In dev, frontend is on 5173. 
    // In production, we are on same domain. Use relative path or root-relative.
    res.redirect('/dashboard');
  }
);

// Logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
      if (err) { return next(err); }
      req.session.destroy((err) => {
        if (err) console.log("Session destroy error", err);
        res.clearCookie('connect.sid'); // Default session cookie name
        res.redirect('/');
      });
  });
});

// Check status
router.get('/current_user', (req, res) => {
    res.json(req.user || null);
});

module.exports = router;
