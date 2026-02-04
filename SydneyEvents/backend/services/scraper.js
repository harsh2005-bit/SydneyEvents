const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const Event = require('../models/Event');
const scrapeEventbrite = require('./eventbrite');

const scrapeEvents = async () => {
  console.log('Starting Scrape Job...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  
  try {
    // 1. Go to the main listing page
    const baseUrl = 'https://whatson.cityofsydney.nsw.gov.au';
    await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // 2. Get content and find event links
    const content = await page.content();
    const $ = cheerio.load(content);
    const eventLinks = new Set();
    
    $('a[href*="/events/"]').each((i, el) => {
      const link = $(el).attr('href');
      if (link) {
        eventLinks.add(link.startsWith('http') ? link : baseUrl + link);
      }
    });

    console.log(`Found ${eventLinks.size} potential event links.`);

    // 3. Visit each link and scrape details
    for (const link of eventLinks) {
        // Limit to 10 for demo/performance to avoid blocking
        // In production, you would iterate all or use a queue
      // if (Math.random() > 0.3 && eventLinks.size > 20) continue; // REMOVED sampling to fetch ALL events

      try {
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const pageContent = await page.content();
        const $$ = cheerio.load(pageContent);

        const title = $$('h1').first().text().trim();
        const description = $$('div[class*="description"], div[class*="content"]').first().text().trim().substring(0, 500) + '...';
        // Attempt to find date/time - usually in specific containers
        // Fallback to meta tags which are reliable
        const dateText = $$('meta[property="og:start_time"]').attr('content') || 
                         $$('div[class*="date"]').first().text().trim(); // This site might not have standard meta start_time, checking visual

        const venue = $$('a[href*="/venues/"]').first().text().trim() || 'Sydney location';
        const address = $$('address').first().text().trim() || 'Sydney, NSW';
        const imageUrl = $$('meta[property="og:image"]').attr('content');
        
        // Skip if no title
        if (!title) continue;

        // DB Update
        await Event.findOneAndUpdate(
          { originalUrl: link },
          {
            title,
            description,
            date: dateText, 
            venue,
            address,
            imageUrl,
            sourceWebsite: 'Whats On Sydney',
            originalUrl: link,
            lastScraped: new Date(),
            status: 'updated' // logic to set 'new' if not exists is handled by upsert usually, but here we update
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).then(doc => {
            if(doc.createdAt.getTime() > Date.now() - 10000) { // If just created
                 doc.status = 'new';
                 doc.save();
            }
        });
        
        console.log(`Scraped: ${title}`);

      } catch (err) {
        console.error(`Failed to scrape ${link}: ${err.message}`);
      }
      
      // Respectful delay
      await new Promise(r => setTimeout(r, 1000));
    }

    // --- Run Eventbrite Scraper ---
    await scrapeEventbrite(page);

  } catch (error) {
    console.error('Scraping Error:', error);
  } finally {
    await browser.close();
    console.log('Scraping finished.');
  }
};

module.exports = scrapeEvents;
