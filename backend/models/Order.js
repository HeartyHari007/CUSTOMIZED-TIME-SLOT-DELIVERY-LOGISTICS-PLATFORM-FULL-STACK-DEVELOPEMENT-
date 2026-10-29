const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  packageDesc: { type: String, required: true },
  weightKg: { type: Number, default: 1 },
  pickupAddress: { type: String, required: true },
  dropAddress: { type: String, required: true },
  instructions: String,
  status: {
    type: String,
    enum: ["scheduled", "out_for_delivery", "delivered", "cancelled"],
    default: "scheduled",
  },
  total: Number,
  trackingId: { type: String, unique: true },
}, { timestamps: true });

orderSchema.pre("validate", function (next) {
  if (!this.trackingId) this.trackingId = "SD" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10);
  next();
});

module.exports = mongoose.model("Order", orderSchema);
