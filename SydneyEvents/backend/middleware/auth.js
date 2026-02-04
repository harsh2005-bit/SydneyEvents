const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  // For API usage, return 401
  res.status(401).json({ message: 'Unauthorized. Please log in.' });
};

module.exports = { ensureAuthenticated };
