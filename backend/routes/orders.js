const router = require("express").Router();
const Order = require("../models/Order");
const Slot = require("../models/Slot");
const User = require("../models/User");
const { protect, allow } = require("../middleware/auth");

const populate = (q) => q.populate("slot").populate("customer", "name email phone").populate("driver", "name");

// Book a delivery in a slot. The capacity check and increment are one atomic
// operation, so two people can't take the last place at the same time.
router.post("/", protect, allow("customer"), async (req, res) => {
  try {
    const { slotId, packageDesc, weightKg, pickupAddress, dropAddress, instructions } = req.body;
    const slot = await Slot.findOneAndUpdate(
      { _id: slotId, $expr: { $lt: ["$booked", "$capacity"] } },
      { $inc: { booked: 1 } }, { new: true }
    );
    if (!slot) return res.status(409).json({ message: "That slot just filled up. Pick another." });
    try {
      const total = 50 + Math.ceil(weightKg || 1) * 10 + slot.fee;
      const order = await Order.create({
        customer: req.user._id, slot: slot._id, packageDesc, weightKg,
        pickupAddress, dropAddress, instructions, total,
      });
      res.status(201).json(await populate(Order.findById(order._id)));
    } catch (e) {
      await Slot.findByIdAndUpdate(slotId, { $inc: { booked: -1 } }); // release the place
      throw e;
    }
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Customers see their own, drivers see assigned, admins see all
router.get("/", protect, async (req, res) => {
  const q = req.user.role === "customer" ? { customer: req.user._id }
          : req.user.role === "driver" ? { driver: req.user._id } : {};
  if (req.query.status) q.status = req.query.status;
  res.json(await populate(Order.find(q).sort({ createdAt: -1 })));
});

// Public tracking by tracking id
router.get("/track/:trackingId", async (req, res) => {
  const o = await Order.findOne({ trackingId: req.params.trackingId.toUpperCase() })
    .populate("slot").select("trackingId status slot dropAddress");
  o ? res.json(o) : res.status(404).json({ message: "No order with that tracking ID" });
});

router.get("/stats/summary", protect, allow("admin"), async (req, res) => {
  const byStatus = await Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  const revenue = await Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, sum: { $sum: "$total" } } }]);
  res.json({ byStatus, revenue: revenue[0]?.sum || 0 });
});

// Move to a different slot (only while still scheduled)
router.put("/:id/reschedule", protect, allow("customer"), async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.status !== "scheduled") return res.status(400).json({ message: "Only scheduled orders can be moved" });
  const next = await Slot.findOneAndUpdate(
    { _id: req.body.slotId, $expr: { $lt: ["$booked", "$capacity"] } }, { $inc: { booked: 1 } }, { new: true });
  if (!next) return res.status(409).json({ message: "That slot is full" });
  await Slot.findByIdAndUpdate(order.slot, { $inc: { booked: -1 } });
  order.slot = next._id;
  await order.save();
  res.json(await populate(Order.findById(order._id)));
});

router.put("/:id/cancel", protect, async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role === "customer") filter.customer = req.user._id;
  const order = await Order.findOne(filter);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.status !== "scheduled") return res.status(400).json({ message: "Too late to cancel" });
  order.status = "cancelled";
  await order.save();
  await Slot.findByIdAndUpdate(order.slot, { $inc: { booked: -1 } });
  res.json(order);
});

// Admin: assign a driver
router.put("/:id/assign", protect, allow("admin"), async (req, res) => {
  const driver = await User.findOne({ _id: req.body.driverId, role: "driver" });
  if (!driver) return res.status(400).json({ message: "Driver not found" });
  const order = await Order.findByIdAndUpdate(req.params.id, { driver: driver._id }, { new: true });
  res.json(await populate(Order.findById(order._id)));
});

// Driver/admin: update delivery status
router.put("/:id/status", protect, allow("driver", "admin"), async (req, res) => {
  const { status } = req.body;
  if (!["out_for_delivery", "delivered"].includes(status)) return res.status(400).json({ message: "Invalid status" });
  const filter = { _id: req.params.id };
  if (req.user.role === "driver") filter.driver = req.user._id;
  const order = await Order.findOneAndUpdate(filter, { status }, { new: true });
  order ? res.json(order) : res.status(404).json({ message: "Order not found" });
});

module.exports = router;
