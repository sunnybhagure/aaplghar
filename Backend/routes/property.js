const express = require("express");
const router = express.Router();

const mongoose = require('mongoose');

const upload = require("../middleware/multer");
const { addProperty ,getAllProperties , getPropertyById, getPropertiesByBuilder, updateProperty, deleteProperty , getPropertiesByCity, getBuildersByCity } = require("../Controller/propertyController");
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

// Admin properties fetch karne (ID pramane)
router.get('/builder/:builderId', getPropertiesByBuilder);

// Update karne
router.put('/update/:id',   upload.any(), updateProperty);

// Delete karne
router.delete('/delete/:id', protectAdmin, deleteProperty);

// City pramane properties fetch karne
router.get('/filterByCity', getPropertiesByCity);

// City pramane unique builders fetch karne
router.get('/buildersByCity', getBuildersByCity);

module.exports = router;