const express = require("express");
const router = express.Router();

const upload = require("../middleware/multer");
const { addProperty ,getAllProperties , getPropertyById } = require("../Controller/propertyController");
const { protectAdmin } = require("../middleware/Adminauth");

// 👉 Only admin / builder allowed
router.post(
  "/addProperty",
  protectAdmin,
  upload.any(), // <--- ITHE .any() ADD KARA
  addProperty
);

router.get("/allProperties", getAllProperties);

router.get("/getProperty/:id", getPropertyById);

module.exports = router;