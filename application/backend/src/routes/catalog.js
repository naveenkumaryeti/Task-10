const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

router.get("/categories", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY id");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load categories", details: err.message });
  }
});

router.get("/products", async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];
    if (category) { sql += " AND category_id = ?"; params.push(category); }
    if (search) { sql += " AND name LIKE ?"; params.push(`%${search}%`); }
    sql += " ORDER BY id";
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load products", details: err.message });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to load product", details: err.message });
  }
});

module.exports = router;
