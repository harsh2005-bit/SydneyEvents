const cron = require('node-cron');
const scrapeEvents = require('../services/scraper');

const startScheduler = () => {
    // Run every day at midnight (0 0 * * *)
    // For demo purposes, we can run it every hour (0 * * * *)
    // Run every 9 minutes to ensure near real-time updates and keep 'Updated ago' < 10 mins
    cron.schedule('*/9 * * * *', () => {
        console.log('Running scheduled scrape job...');
        scrapeEvents();
    });
    
    console.log('Scheduler started: Job runs every 4 hours.');
};

module.exports = startScheduler;
