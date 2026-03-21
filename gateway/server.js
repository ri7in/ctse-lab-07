const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Sample FX Rates Data ---
const fxRates = {
  USD: { buying: 298.50, selling: 308.75, mid: 303.62 },
  EUR: { buying: 322.10, selling: 334.40, mid: 328.25 },
  GBP: { buying: 375.80, selling: 389.20, mid: 382.50 },
  JPY: { buying: 1.95,   selling: 2.05,   mid: 2.00  },
  AUD: { buying: 191.20, selling: 198.60, mid: 194.90 },
  SGD: { buying: 219.40, selling: 227.80, mid: 223.60 },
  CAD: { buying: 215.60, selling: 223.40, mid: 219.50 },
  CHF: { buying: 330.20, selling: 342.50, mid: 336.35 },
};

const updatedAt = new Date().toISOString();

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "fx-gateway", timestamp: new Date().toISOString() });
});

// All FX rates
app.get("/api/rates", (req, res) => {
  res.json({
    base: "LKR",
    updatedAt,
    rates: fxRates,
  });
});

// Single currency rate
app.get("/api/rates/:currency", (req, res) => {
  const currency = req.params.currency.toUpperCase();
  if (!fxRates[currency]) {
    return res.status(404).json({ error: `Currency ${currency} not found` });
  }
  res.json({
    base: "LKR",
    currency,
    updatedAt,
    ...fxRates[currency],
  });
});

// Service info
app.get("/api/info", (req, res) => {
  res.json({
    name: "FX Gateway Service",
    version: "1.0.0",
    description: "Currency Exchange Rate API - Bank of Ceylon Demo",
    endpoints: ["/health", "/api/rates", "/api/rates/:currency", "/api/info"],
  });
});

app.listen(PORT, () => {
  console.log(`FX Gateway running on port ${PORT}`);
});
