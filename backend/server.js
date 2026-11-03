require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/slots", require("./routes/slots"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/users", require("./routes/users"));
app.get("/api/health", (_, res) => res.json({ ok: true }));

connectDB()
  .then(() => app.listen(process.env.PORT || 5000, () => console.log("API on port " + (process.env.PORT || 5000))))
  .catch((e) => { console.error(e); process.exit(1); });
