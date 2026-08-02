const express = require("express");
const router = express.Router();

// Simulated payment gateway. In a real production system this would call
// Razorpay/Stripe/PayU etc. Here it validates basic input and returns a
// transaction id + status so the frontend can show a genuine
// "Payment Successful" step before placing the order.
router.post("/process", async (req, res) => {
  const { method, amount, upi_id, card_number } = req.body;

  if (!method || !amount || amount <= 0) {
    return res.status(400).json({ success: false, error: "Invalid payment request" });
  }
  if (method === "UPI" && (!upi_id || !upi_id.includes("@"))) {
    return res.status(400).json({ success: false, error: "Enter a valid UPI ID (e.g. name@bank)" });
  }
  if (method === "CARD" && (!card_number || card_number.replace(/\s/g, "").length < 12)) {
    return res.status(400).json({ success: false, error: "Enter a valid card number" });
  }

  // Simulate gateway processing latency
  await new Promise((r) => setTimeout(r, 800));

  const transactionId = "TXN" + Date.now() + Math.floor(Math.random() * 1000);
  res.json({
    success: true,
    transaction_id: transactionId,
    amount,
    method,
    status: "PAID",
    message: "Payment successful",
  });
});

module.exports = router;
