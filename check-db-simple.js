require('dotenv').config({ path: './SydneyEvents/backend/.env' });
const mongoose = require('mongoose');

// Define simple schema to avoid path dependencies
const Event = mongoose.model('Event', new mongoose.Schema({ title: String }, { strict: false }));

async function check() {
    try {
        console.log("URI:", process.env.MONGO_URI.split('@')[1]); // Safe log
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");
        
        const count = await Event.countDocuments();
        console.log("COUNT:", count);
        
        if (count > 0) {
            const first = await Event.findOne();
            console.log("FIRST DOC:", JSON.stringify(first, null, 2));
        }
        
    } catch(e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
check();
