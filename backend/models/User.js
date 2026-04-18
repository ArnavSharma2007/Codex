const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  isPremium: { type: Boolean, default: false },
  dailyUploadCount: { type: Number, default: 0 },
  lastUploadDate: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
