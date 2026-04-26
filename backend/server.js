const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// API to send data to AI server
app.post("/analyze-ai", async (req, res) => {
  try {
    const signal = req.body.data;

    // 🔥 IMPORTANT: replace with Laptop 1 IP
    const response = await axios.post("http://192.168.0.109:5000/predict", {
      data: signal
    });

    const result = response.data.prediction;

    if (result === "ATTACK") {
      console.log("🚨 ATTACK DETECTED");
    } else {
      console.log("🟢 NORMAL SIGNAL");
    }

    res.json({ prediction: result });

  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error connecting to AI server");
  }
});

// start backend
app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});