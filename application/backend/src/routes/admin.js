const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const { verifyAdmin, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// ---------- Admin auth ----------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  try {
    const [rows] = await pool.query("SELECT * FROM admin_users WHERE email = ?", [email]);
    if (!rows.length) return res.status(401).json({ error: "Invalid admin credentials" });

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid admin credentials" });

    const token = jwt.sign({ id: admin.id, email: admin.email, role: "admin" }, JWT_SECRET, { expiresIn: "12h" });
    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: "Admin login failed", details: err.message });
  }
});

// All routes below require a valid admin JWT
router.use(verifyAdmin);

// ---------- Dashboard stats ----------
router.get("/stats", async (req, res) => {
  try {
    const [[{ total_products }]] = await pool.query("SELECT COUNT(*) AS total_products FROM products");
    const [[{ total_orders }]] = await pool.query("SELECT COUNT(*) AS total_orders FROM orders");
    const [[{ total_revenue }]] = await pool.query("SELECT COALESCE(SUM(total_amount),0) AS total_revenue FROM orders");
    const [[{ total_customers }]] = await pool.query("SELECT COUNT(*) AS total_customers FROM users");
    const [[{ low_stock_count }]] = await pool.query("SELECT COUNT(*) AS low_stock_count FROM products WHERE stock < 20");
    res.json({ total_products, total_orders, total_revenue, total_customers, low_stock_count });
  } catch (err) {
    res.status(500).json({ error: "Failed to load stats", details: err.message });
  }
});

// ---------- Product management (price, stock, CRUD) ----------
router.get("/products", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM products ORDER BY id");
  res.json(rows);
});

router.post("/products", async (req, res) => {
  const { category_id, name, weight, price, mrp, stock, image_url } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO products (category_id, name, weight, price, mrp, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [category_id, name, weight, price, mrp || price, stock || 0, image_url]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Failed to create product", details: err.message });
  }
});

// This is the core "admin can customize product rates" endpoint —
// updates price / mrp / stock / any other field, production-safe with
// partial updates so the admin UI can save just the changed fields.
router.put("/products/:id", async (req, res) => {
  const fields = ["name", "weight", "price", "mrp", "stock", "image_url", "category_id"];
  const updates = [];
  const values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); }
  }
  if (!updates.length) return res.status(400).json({ error: "No fields to update" });
  values.push(req.params.id);
  try {
    await pool.query(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`, values);
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product", details: err.message });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product", details: err.message });
  }
});

// ---------- Category management ----------
router.get("/categories", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM categories ORDER BY id");
  res.json(rows);
});

router.post("/categories", async (req, res) => {
  const { name, emoji } = req.body;
  try {
    const [result] = await pool.query("INSERT INTO categories (name, emoji) VALUES (?, ?)", [name, emoji || "🛒"]);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Failed to create category", details: err.message });
  }
});

// ---------- Orders (view all) ----------
router.get("/orders", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
  res.json(rows);
});

module.exports = router;
