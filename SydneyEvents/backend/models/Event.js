const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String }, // Keeping flexible for scraping
  time: { type: String },
  venue: { type: String },
  address: { type: String },
  city: { type: String, default: 'Sydney' },
  description: { type: String },
  category: { type: String },
  imageUrl: { type: String },
  sourceWebsite: { type: String },
  originalUrl: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['new', 'updated', 'inactive', 'imported'], 
    default: 'new' 
  },
  lastScraped: { type: Date, default: Date.now },
  
  // Admin fields
  importedAt: { type: Date },
  importedBy: { type: String }, // Admin email or ID
  importNotes: { type: String }
}, { timestamps: true, collection: 'events' });

module.exports = mongoose.model('Event', eventSchema);
