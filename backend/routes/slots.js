const router = require("express").Router();
const Slot = require("../models/Slot");
const { protect, allow } = require("../middleware/auth");

// List slots. Filter by ?date= & ?zone=. Customers only see slots that still have room.
router.get("/", protect, async (req, res) => {
  const q = {};
  if (req.query.date) q.date = req.query.date;
  if (req.query.zone) q.zone = new RegExp(req.query.zone, "i");
  if (req.user.role === "customer") {
    q.$expr = { $lt: ["$booked", "$capacity"] };
    q.date = q.date || { $gte: new Date().toISOString().slice(0, 10) };
  }
  res.json(await Slot.find(q).sort({ date: 1, startTime: 1 }));
});

router.post("/", protect, allow("admin"), async (req, res) => {
  try { res.status(201).json(await Slot.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.code === 11000 ? "That slot already exists for this zone" : e.message }); }
});

router.put("/:id", protect, allow("admin"), async (req, res) => {
  const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  slot ? res.json(slot) : res.status(404).json({ message: "Slot not found" });
});

router.delete("/:id", protect, allow("admin"), async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) return res.status(404).json({ message: "Slot not found" });
  if (slot.booked > 0) return res.status(400).json({ message: "Slot has bookings; cancel those orders first" });
  await slot.deleteOne();
  res.json({ message: "Slot deleted" });
});

module.exports = router;
