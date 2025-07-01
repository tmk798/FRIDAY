require("dotenv").config(); // Step 1: Load .env variables

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Step 2: Serve frontend

// Step 3: Weather API endpoint (reads API key from .env)
app.get("/weather", async (req, res) => {
  const location = req.query.q;
  const apiKey = process.env.WEATHER_API_KEY;

  try {
    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Weather API error:", error.message);
    res.status(500).json({ message: "Failed to fetch weather data" });
  }
});

// Step 4: Folder creation route
app.post("/create-folder", (req, res) => {
  const { folderName } = req.body;
  const safeName = folderName.replace(/[^a-zA-Z0-9-_ ]/g, "").trim();
  if (!safeName) return res.status(400).json({ message: "Invalid folder name" });

  const folderPath = path.join(__dirname, "folders", safeName);

  fs.mkdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.error("Folder creation error:", err);
      return res.status(500).json({ message: "Failed to create folder" });
    }
    res.json({ message: `Folder '${safeName}' created successfully` });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
