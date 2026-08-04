require("dotenv").config();
const express = require("express");
const cors = require("cors");
const client = require("prom-client");

const authRoutes = require("./src/routes/auth");
const catalogRoutes = require("./src/routes/catalog");
const orderRoutes = require("./src/routes/orders");
const adminRoutes = require("./src/routes/admin");
const paymentRoutes = require("./src/routes/payments");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3000;

// ---------- Prometheus metrics (feeds the existing Grafana dashboard) ----------
// "HTTP Request Rate" and "HTTP Error Rate" panels in
// monitoring/grafana-dashboards/zepto-overview.json query http_requests_total
// — that metric only exists once we emit it here.
client.collectDefaultMetrics();

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status", "service"],
});

app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode,
      service: "backend",
    });
  });
  next();
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.get("/healthz", (req, res) => res.status(200).send("OK"));
app.get("/readyz", (req, res) => res.status(200).send("READY"));

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api", catalogRoutes); // /api/categories, /api/products

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

app.listen(PORT, () => console.log(`QuikKart backend listening on port ${PORT}`));
