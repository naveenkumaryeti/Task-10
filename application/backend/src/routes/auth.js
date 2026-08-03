const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const { JWT_SECRET, verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)",
      [name, email, phone, hash]
    );
    const user = { id: result.insertId, name, email, phone, profile_pic: null };
    const token = jwt.sign({ id: user.id, email, role: "customer" }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "Signup failed", details: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(401).json({ error: "Invalid email or password" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, email: user.email, role: "customer" }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, profile_pic: user.profile_pic },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

// ---------- Current customer profile (view) ----------
router.get("/me", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, profile_pic FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to load profile", details: err.message });
  }
});

// ---------- Current customer profile (edit name / phone / password / profile pic) ----------
// Email is intentionally excluded — it is never editable here.
router.put("/me", verifyToken, async (req, res) => {
  const { name, phone, password, profile_pic } = req.body;
  const updates = [];
  const values = [];

  if (name !== undefined) { updates.push("name = ?"); values.push(name); }
  if (phone !== undefined) { updates.push("phone = ?"); values.push(phone); }
  if (profile_pic !== undefined) { updates.push("profile_pic = ?"); values.push(profile_pic); }
  if (password) {
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    updates.push("password_hash = ?");
    values.push(await bcrypt.hash(password, 10));
  }
  if (!updates.length) return res.status(400).json({ error: "No fields to update" });

  values.push(req.user.id);
  try {
    await pool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, profile_pic FROM users WHERE id = ?",
      [req.user.id]
    );
    res.json({ message: "Profile updated", user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile", details: err.message });
  }
});

module.exports = router;
