const express = require("express");
const router = express.Router();
const { searchPropertiesAI } = require("../Controller/aicontroller");

router.post("/search", searchPropertiesAI);

module.exports = router;