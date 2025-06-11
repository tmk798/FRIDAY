const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve frontend files

// API to create folder
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
