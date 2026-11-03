const router = require("express").Router();
const User = require("../models/User");
const { protect, allow } = require("../middleware/auth");

router.get("/drivers", protect, allow("admin"), async (req, res) =>
  res.json(await User.find({ role: "driver" }).select("name email")));

module.exports = router;
