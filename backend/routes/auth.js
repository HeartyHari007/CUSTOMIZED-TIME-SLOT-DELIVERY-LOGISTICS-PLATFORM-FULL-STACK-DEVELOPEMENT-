const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({ name, email, password, phone }); // role is always customer here
    res.status(201).json({ token: sign(user), user: pub(user) });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await user.matches(req.body.password)))
    return res.status(400).json({ message: "Wrong email or password" });
  res.json({ token: sign(user), user: pub(user) });
});

router.get("/me", protect, (req, res) => res.json(pub(req.user)));

module.exports = router;
