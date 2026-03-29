const express = require("express");
const router = express.Router();

const upload = require("../middleware/multer");
const { addProperty ,getAllProperties } = require("../Controller/propertyController");
const { protectAdmin } = require("../middleware/Adminauth");

// 👉 Only admin / builder allowed
router.post(
  "/addProperty",
  protectAdmin,
  upload,
  addProperty
);

router.get("/allProperties", getAllProperties);

module.exports = router;