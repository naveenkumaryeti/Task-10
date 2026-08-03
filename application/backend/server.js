require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/auth");
const catalogRoutes = require("./src/routes/catalog");
const orderRoutes = require("./src/routes/orders");
const adminRoutes = require("./src/routes/admin");
const paymentRoutes = require("./src/routes/payments");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3000;

app.get("/healthz", (req, res) => res.status(200).send("OK"));
app.get("/readyz", (req, res) => res.status(200).send("READY"));

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api", catalogRoutes); // /api/categories, /api/products

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

app.listen(PORT, () => console.log(`QuikKart backend listening on port ${PORT}`));
