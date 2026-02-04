const mongoose = require('mongoose');
const scrapeEvents = require('../services/scraper');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load env from backend root

const run = async () => {
    try {
        console.log('Connecting to DB...');
        // Need to duplicate db connection logic or require db config if efficient
        // Simple connection for script:
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sydney-events'); 
        console.log('Connected. Starting manual scrape...');
        
        await scrapeEvents();
        
        console.log('Manual scrape complete.');
        process.exit(0);
    } catch (err) {
        console.error('Manual scrape failed:', err);
        process.exit(1);
    }
};

run();
