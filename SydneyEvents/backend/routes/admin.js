const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { ensureAuthenticated } = require('../middleware/auth');

// Protected: Get all events (including raw scraped ones)
router.get('/events', ensureAuthenticated, async (req, res) => {
  try {
      // Filters
    const { status, city, keyword } = req.query;
    let query = {};
    if(status) query.status = status;
    if(city) query.city = new RegExp(city, 'i');
    if(keyword) {
        query.$or = [{ title: new RegExp(keyword, 'i') }, { venue: new RegExp(keyword, 'i') }];
    }
    
    // Date Range Filter (on lastScraped)
    const { startDate, endDate } = req.query;
    if (startDate || endDate) {
        query.lastScraped = {};
        if (startDate) query.lastScraped.$gte = new Date(startDate);
        if (endDate) query.lastScraped.$lte = new Date(endDate);
    }

    const events = await Event.find(query).sort({ lastScraped: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected: Import/Update Status
router.put('/events/:id/import', ensureAuthenticated, async (req, res) => {
    try {
        const { notes } = req.body;
        const event = await Event.findByIdAndUpdate(req.params.id, {
            status: 'imported',
            importedAt: new Date(),
            importedBy: req.user.emails[0].value, // Google User Email
            importNotes: notes
        }, { new: true });
        res.json(event);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

module.exports = router;
