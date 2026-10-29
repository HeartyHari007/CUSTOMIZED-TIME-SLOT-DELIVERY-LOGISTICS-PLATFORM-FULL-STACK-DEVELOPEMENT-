const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: String,
  role: { type: String, enum: ["customer", "driver", "admin"], default: "customer" },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.matches = function (pw) { return bcrypt.compare(pw, this.password); };

module.exports = mongoose.model("User", userSchema);
