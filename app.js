const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// In-memory DB: { key: [ { value, timestamp } ] }
const store = {};

// 1. Store key-value
app.post("/store", (req, res) => {
  const { key, value } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({ success: false, message: "Key and value are required" });
  }

  const timestamp = Date.now();

  if (!store[key]) {
    store[key] = [];
  }

  store[key].push({ value, timestamp });

  return res.status(200).json({
    success: true,
    key,
    value,
    timestamp
  });
});

// 2. Get latest value by key
app.get("/store/:key", (req, res) => {
  const key = req.params.key;

  if (!store[key]) {
    return res.status(404).json({ success: false, message: "Key not found" });
  }

  const latest = store[key][store[key].length - 1];

  return res.json({ success: true, key, value: latest.value, timestamp: latest.timestamp });
});

// 3. Get value by key + timestamp
app.get("/store/:key/:timestamp", (req, res) => {
  const key = req.params.key;
  const timestamp = parseInt(req.params.timestamp, 10);

  if (!store[key]) {
    return res.status(404).json({ success: false, message: "Key not found" });
  }

  // Find the latest value at or before the timestamp
  const history = store[key];
  const record = [...history].reverse().find(entry => entry.timestamp <= timestamp);

  if (!record) {
    return res.status(404).json({ success: false, message: "No value found at that time" });
  }

  return res.json({ success: true, key, value: record.value, timestamp: record.timestamp });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
