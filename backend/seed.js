// npm run seed -> creates admin, driver, customer and a week of slots
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Slot = require("./models/Slot");
const Order = require("./models/Order");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Slot.deleteMany(), Order.deleteMany()]);
  await User.create([
    { name: "Admin", email: "admin@slotdrop.com", password: "admin123", role: "admin" },
    { name: "Ravi Driver", email: "driver@slotdrop.com", password: "driver123", role: "driver" },
    { name: "Priya Customer", email: "customer@slotdrop.com", password: "customer123" },
  ]);
  const windows = [["08:00","10:00",0],["10:00","12:00",0],["14:00","16:00",0],["18:00","20:00",30]];
  const zones = ["Adyar", "T Nagar", "Anna Nagar"];
  const slots = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(Date.now() + d * 864e5).toISOString().slice(0, 10);
    for (const zone of zones) for (const [s, e, fee] of windows)
      slots.push({ date, startTime: s, endTime: e, zone, capacity: 6, fee });
  }
  await Slot.insertMany(slots);
  console.log("Seeded. Logins: admin@slotdrop.com/admin123, driver@slotdrop.com/driver123, customer@slotdrop.com/customer123");
  process.exit();
})();
