const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");

const User = require("./User");
const Notice = require("./Notice");

const app = express();
const PORT = 5000;

// MongoDB Atlas URI
const uri = "mongodb+srv://harshsawant24:UGr4ak5JpEYmWuDv@cluster0.nzvlqpi.mongodb.net/gym?retryWrites=true&w=majority";

// Connect to MongoDB Atlas
mongoose.connect(uri)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => {
    console.error("❌ MongoDB Atlas connection error:", err);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Serve HTML pages
const pages = ["index","diet","admin","about","auth","notice","program","service","GymImages","packages","weightloss"];
pages.forEach(page => {
  app.get(`/${page}`, (req, res) => res.sendFile(path.join(__dirname, `${page}.html`)));
});

// ----------------- USERS -----------------
// Register
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- NOTICES -----------------

// Get all notices (public for logged-in members)
app.get("/api/notices", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notices" });
  }
});

// Add notice (admin only)
app.post("/api/notices", async (req, res) => {
  const { title, desc, role } = req.body;
  if (role !== "admin") return res.status(403).json({ error: "Admin only" });
  if (!title || !desc) return res.status(400).json({ error: "Title and description required" });

  try {
    const notice = new Notice({ title, desc });
    await notice.save();
    res.status(201).json({ message: "Notice added", notice });
  } catch (err) {
    res.status(500).json({ error: "Failed to add notice" });
  }
});

// Delete notice (admin only)
app.delete("/api/notices/:id", async (req, res) => {
  const { role } = req.body;
  if (role !== "admin") return res.status(403).json({ error: "Admin only" });

  try {
    const result = await Notice.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Notice not found" });
    res.json({ message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete notice" });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
