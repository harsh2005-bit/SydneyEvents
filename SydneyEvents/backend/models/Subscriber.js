const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  consentedAt: { type: Date, default: Date.now },
  sourceEventUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Subscriber', subscriberSchema);
