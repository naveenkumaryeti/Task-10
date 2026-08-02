const express = require("express");
const pool = require("../db/pool");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Place an order — works for logged-in users; guest checkout also allowed
router.post("/", async (req, res) => {
  const { items, total_amount, delivery_address, customer_name, phone, payment_method, transaction_id } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: "Cart is empty" });
  if (!transaction_id) return res.status(400).json({ error: "Payment must be completed before placing the order" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const jwt = require("jsonwebtoken");
        const { JWT_SECRET } = require("../middleware/auth");
        const decoded = jwt.verify(authHeader.replace("Bearer ", ""), JWT_SECRET);
        userId = decoded.id;
      } catch { /* guest checkout, ignore invalid token */ }
    }

    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, customer_name, phone, delivery_address, total_amount, payment_method, payment_status, transaction_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'PAID', ?, 'PLACED')`,
      [userId, customer_name, phone, delivery_address, total_amount, payment_method, transaction_id]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );
      await conn.query("UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?", [item.quantity, item.product_id]);
    }

    await conn.commit();
    res.status(201).json({ id: orderId, message: "Order placed successfully" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: "Failed to place order", details: err.message });
  } finally {
    conn.release();
  }
});

router.get("/my", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load orders", details: err.message });
  }
});

module.exports = router;
