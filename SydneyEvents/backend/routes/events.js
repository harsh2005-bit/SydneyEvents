const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Subscriber = require('../models/Subscriber');



// Public: Get all valid events
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/events fetching...');
    const { city, keyword, date } = req.query;
    let query = { status: { $ne: 'inactive' } }; // Show all active
    
    // Simplistic public filter
    if (city) query.city = new RegExp(city, 'i');
    if (keyword) {
        query.$or = [
            { title: new RegExp(keyword, 'i') },
            { description: new RegExp(keyword, 'i') }
        ];
    }
    
    // Sort by date (assuming date string parsing works or just raw sort)
    // To do it properly, we'd need to parse dates during scrape.
    // Sort by updatedAt to show recently scraped/updated events first
    const events = await Event.find(query).sort({ updatedAt: -1 }).limit(50);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public: Subscribe email
router.post('/subscribe', async (req, res) => {
    const { email, eventId, sourceUrl } = req.body;
    if(!email) return res.status(400).json({message: 'Email required'});
    
    try {
        await Subscriber.create({
            email,
            eventId,
            sourceEventUrl: sourceUrl
        });
        res.json({ message: 'Subscribed successfully' });
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

module.exports = router;
