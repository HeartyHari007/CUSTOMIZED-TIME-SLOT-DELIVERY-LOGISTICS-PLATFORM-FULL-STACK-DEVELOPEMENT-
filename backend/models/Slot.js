const mongoose = require("mongoose");

// One delivery window for one zone, e.g. 2026-11-02 10:00-12:00, Adyar, 8 parcels max
const slotSchema = new mongoose.Schema({
  date: { type: String, required: true },       // YYYY-MM-DD
  startTime: { type: String, required: true },  // HH:mm
  endTime: { type: String, required: true },
  zone: { type: String, required: true, trim: true },
  capacity: { type: Number, required: true, min: 1 },
  booked: { type: Number, default: 0 },
  fee: { type: Number, default: 0 },            // premium windows cost more
}, { timestamps: true });

slotSchema.index({ date: 1, startTime: 1, zone: 1 }, { unique: true });

module.exports = mongoose.model("Slot", slotSchema);
