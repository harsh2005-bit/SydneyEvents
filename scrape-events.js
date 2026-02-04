const { chromium } = require('playwright');

async function scrapeEventbriteSydney() {
  const browser = await chromium.launch({ headless: true });
  // Add User Agent to avoid simple bot detection
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  console.log("Navigating to Eventbrite...");
    // Retry logic for navigation
    try {
        let attempts = 0;
        while (attempts < 3) {
        try {
            await page.goto("https://www.eventbrite.com.au/d/australia--sydney/events/", {
                waitUntil: "domcontentloaded",
                timeout: 60000
            });
            break; 
        } catch (e) {
            console.log(`Attempt ${attempts + 1} failed: ${e.message}`);
            attempts++;
            if (attempts >= 3) throw e;
        }
    }

    console.log("Page Title:", await page.title());
    console.log("Waiting for events...");

    // 2. Wait for main content
    try {
        await page.waitForSelector('main', { timeout: 15000 });
    } catch (e) {
        console.log("Main selector timeout (continuing anyway)...");
    } 

    // Auto-scroll to trigger lazy loading
    console.log("Scrolling to load lazy images...");
    const jsHandle = await page.evaluateHandle('window');
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 300;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                // Scroll about 2-3 screens deep
                if (totalHeight >= 2000) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
    // Wait a bit for images to load
    await page.waitForTimeout(2000);

    // 3. Extract data using links
    console.log("Extracting data via links...");
    const events = await page.$$eval(
      'a[href*="/e/"]',
      (links) => {
        return links.map(link => {
            // Find container
            const card = link.closest('article') || link.closest('.eds-event-card-content') || link.closest('div[data-spec="event-card"]');
            
            let fullText = card ? card.innerText : '';
            const title = link.innerText || link.getAttribute('aria-label') || '';
            
            // Image extraction logic
            let imgUrl = null;
            let debugHtml = null;

            if (card) {
                // Select generic img tag inside card
                const img = card.querySelector('img');
                if (img) {
                    // 1. Priority Order: data-src > data-original > src
                    // 2. Ignore Base64 or Transparent placeholders
                    
                    const candidates = [
                        img.getAttribute('data-src'),
                        img.getAttribute('data-original'),
                        img.getAttribute('src'),
                        img.getAttribute('srcset') 
                    ];
                    
                    for (let rawUrl of candidates) {
                        if (!rawUrl) continue;
                        
                        // Check if it's a useful URL
                        if (rawUrl.includes('data:image')) continue;
                        if (rawUrl.includes('placeholder')) continue;
                        if (rawUrl.includes('transparent')) continue;

                        // Clean up URL (remove query params for testing if needed, or keeping them if vital for size)
                        let cleanUrl = rawUrl.trim();

                        // Handle srcset (take first)
                        if (cleanUrl.includes(' ')) {
                             cleanUrl = cleanUrl.split(' ')[0];
                        }

                        // Normalize Protocol
                        if (cleanUrl.startsWith('//')) {
                            cleanUrl = 'https:' + cleanUrl;
                        }
                        
                        // Normalize Relative
                        if (cleanUrl.startsWith('/')) {
                            cleanUrl = 'https://www.eventbrite.com.au' + cleanUrl;
                        }

                        // Use this valid URL
                        imgUrl = cleanUrl;
                        break;
                    }
                }
            }
            
            return {
                title: title.trim(),
                eventUrl: link.href,
                imageUrl: imgUrl,
                rawText: fullText,
                debugHtml: debugHtml
            };
        }).filter(e => e.title.length > 5);
      }
    );

    console.log("Found " + events.length + " events.");
    if (events.length > 0) {
        console.log("Sample Data:");
        console.log(JSON.stringify(events.slice(0, 3), null, 2));
    }
    
    // Connect to DB
    const mongoose = require('mongoose');
    // Load .env from backend folder specifically
    require('dotenv').config({ path: './SydneyEvents/backend/.env' });
    
    // Define Schema inline (simplified to match what we have)
    const eventSchema = new mongoose.Schema({
        title: { type: String, required: true },
        date: { type: String },
        venue: { type: String },
        city: { type: String, default: 'Sydney' },
        imageUrl: { type: String },
        sourceWebsite: { type: String, default: 'Eventbrite' },
        originalUrl: { type: String, required: true, unique: true },
        status: { type: String, default: 'imported' },
        lastScraped: { type: Date, default: Date.now }
    }, { timestamps: true });

    const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
    
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sydneyevents';
        console.log(`Connecting to MongoDB...`); 
        
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");
        
        // Clear old data to ensure we don't have broken/mixed events
        await Event.deleteMany({});
        console.log("Cleared existing events from DB.");

        let savedCount = 0;
        for (const eventData of events) {
            // Simple text extraction heuristics (very naive)
            const lines = eventData.rawText.split('\n').map(l => l.trim()).filter(l => l && l !== eventData.title);
            const dateGuess = lines.length > 0 ? lines[0] : 'Upcoming';
            const venueGuess = lines.length > 1 ? lines[1] : 'Sydney';

            // Ensure we don't save events with missing images if possible, or provide a default
            // BUT for now we want to see if scraping works, so we save what we have.
            
            if (!eventData.imageUrl) {
                console.warn(`Warning: No image found for ${eventData.title}`);
            } else {
                console.log(`Image found for ${eventData.title}: ${eventData.imageUrl.substring(0, 30)}...`);
            }

            // DB Update Logic
            // 1. If it's a new event -> status: 'new'
            // 2. If it exists and text changed -> status: 'updated' (unless it was 'imported')
            // For simplicity in this script, we'll set status to 'new' on insert, 
            // and separate the update to avoid resetting valid statuses.

            const updateOps = {
                $set: {
                    title: eventData.title,
                    imageUrl: eventData.imageUrl,
                    city: 'Sydney',
                    date: dateGuess,
                    venue: venueGuess,
                    sourceWebsite: 'Eventbrite',
                    lastScraped: new Date()
                },
                $setOnInsert: {
                    status: 'new',
                    originalUrl: eventData.eventUrl
                }
            };

            await Event.updateOne(
                { originalUrl: eventData.eventUrl },
                updateOps,
                { upsert: true }
            );
            savedCount++;
        }
        console.log(`Successfully saved/updated ${savedCount} events to DB.`);

    } catch (dbErr) {
        console.error("Database error:", dbErr);
    } finally {
        await mongoose.disconnect();
    }

  } catch (err) {
    console.error("Error scraping:", err);
  } finally {
    await browser.close();
  }
}

scrapeEventbriteSydney();
