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

router.get('/builder/:builderId', getPropertiesByBuilder);

router.put('/update/:id',   upload.any(), updateProperty);

router.delete('/delete/:id', protectAdmin, deleteProperty);

router.get('/filterByCity', getPropertiesByCity);

router.get('/buildersByCity', getBuildersByCity);

module.exports = router;