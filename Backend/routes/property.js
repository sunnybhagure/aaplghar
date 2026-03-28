const express = require("express");
const router = express.Router();

const upload = require("../middleware/multer");
const { addProperty } = require("../Controller/propertyController");
const { protectAdmin } = require("../middleware/Adminauth");

// 👉 Only admin / builder allowed
router.post(
  "/addProperty",
  protectAdmin,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "gallery", maxCount: 8 },
    { name: "societyPlan", maxCount: 1 },

    { name: "1RK_plan", maxCount: 1 },
    { name: "1BHK_plan", maxCount: 1 },
    { name: "2BHK_plan", maxCount: 1 },
    { name: "3BHK_plan", maxCount: 1 },
    { name: "4BHK_plan", maxCount: 1 },
    { name: "5BHK_plan", maxCount: 1 },
  ]),
  addProperty
);

module.exports = router;