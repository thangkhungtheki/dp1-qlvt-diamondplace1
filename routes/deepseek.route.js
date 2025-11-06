const express = require("express");
const deepseekstart = require("../deepseek/dsk.js");

const router = express.Router();

router.get("/deepseek", async (req, res) => {
  try {
    const result = await deepseekstart();
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
