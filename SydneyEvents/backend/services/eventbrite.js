const cheerio = require('cheerio');
const Event = require('../models/Event');

const scrapeEventbrite = async (page) => {
  console.log('Starting Eventbrite Scrape...');
  try {
    // Search for events in Sydney, sorted by date (upcoming)
    const baseUrl = 'https://www.eventbrite.com.au';
    const searchUrl = `${baseUrl}/d/australia--sydney/events/?sort=date`;
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    
    const content = await page.content();
    const $ = cheerio.load(content);
    
    // Find unique event links
    const eventLinks = new Set();
    
    // Eventbrite links usually contain /e/
    $('a[href*="/e/"]').each((i, el) => {
      const link = $(el).attr('href');
      // Ensure it's a full URL and clean query params
      if (link) {
          const fullLink = link.startsWith('http') ? link : baseUrl + link;
          const cleanLink = fullLink.split('?')[0]; // Remove tracking params
          eventLinks.add(cleanLink);
      }
    });

    console.log(`Found ${eventLinks.size} potential Eventbrite events.`);

    // Scrape more events (up to 50)
    const linksToScrape = Array.from(eventLinks).slice(0, 50);

    for (const link of linksToScrape) {
      if (Math.random() > 0.99) continue; // Almost never skip, just a tiny bit of randomness
      
      try {
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const pageContent = await page.content();
        const $$ = cheerio.load(pageContent);

        // Extract data using Meta tags (OpenGraph)
        const title = $$('meta[property="og:title"]').attr('content');
        let description = $$('meta[property="og:description"]').attr('content');
        const imageUrl = $$('meta[property="og:image"]').attr('content');
        
        // Extract data using JSON-LD (Schema.org) - very reliable for Eventbrite
        let startDate = '';
        let venue = 'Sydney';
        let address = '';
        
        // Find JSON-LD script
        const scriptContent = $$('script[type="application/ld+json"]').each((i, el) => {
             const html = $$(el).html();
             if (html && html.includes('"@type":"Event"')) {
                 try {
                     const json = JSON.parse(html);
                     // JSON-LD can be nested or array
                     const eventData = Array.isArray(json) ? json.find(j => j['@type'] === 'Event') : json;
                     
                     if (eventData) {
                         startDate = eventData.startDate;
                         if (eventData.location) {
                             venue = eventData.location.name || venue;
                             if (eventData.location.address) {
                                 const addr = eventData.location.address;
                                 address = `${addr.streetAddress || ''} ${addr.addressLocality || ''}, ${addr.addressRegion || ''}`;
                             }
                         }
                         // If description is short in OG, try to get from JSON-LD or body
                         if (eventData.description) description = eventData.description;
                     }
                 } catch (e) {
                     // ignore parse error
                 }
             }
        });
        
        // Fallback for date if JSON-LD fails
        if (!startDate) {
             startDate = $$('meta[property="event:start_time"]').attr('content');
        }

        if (!title) {
            console.log(`Skipping ${link} - No title found`);
            continue;
        }

        // Upsert event
        await Event.findOneAndUpdate(
          { originalUrl: link },
          {
            title: title.trim(),
            description: description ? description.substring(0, 1000) : '',
            date: startDate,
            venue: venue.trim(),
            address: address.trim(),
            imageUrl,
            sourceWebsite: 'Eventbrite',
            originalUrl: link,
            lastScraped: new Date(),
            status: 'updated'
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).then(doc => {
            // Check if it was essentially a new insert (created recently)
            if (doc.createdAt && doc.createdAt.getTime() > Date.now() - 20000) {
                 doc.status = 'new';
                 doc.save();
            }
        });

        console.log(`Eventbrite Scraped: ${title}`);

      } catch (err) {
        console.error(`Failed to scrape EB event ${link}: ${err.message}`);
      }

      // Delay between requests
      await new Promise(r => setTimeout(r, 2500 + Math.random() * 1000));
    }

  } catch (error) {
    console.error('Eventbrite scraping error:', error);
  }
};

module.exports = scrapeEventbrite;
