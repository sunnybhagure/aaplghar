const express = require("express")
const upload = require("../middleware/multer");
const Property = require("../models/Property");
const { protectAdmin } = require("../middleware/Adminauth");

const router = express.Router()

router.post(
  "/add-property",
  protectAdmin,
  upload.fields([
    { name: "hall", maxCount: 1 },
    { name: "kitchen", maxCount: 1 },
    { name: "bed1", maxCount: 1 },
    { name: "bed2", maxCount: 1 },
    { name: "outer", maxCount: 1 },
  ]),
  async (req, res) => {
    try {

      const files = req.files
      const images = []

      if (files?.hall)
        images.push({ url: files.hall[0].path, public_id: files.hall[0].filename })

      if (files?.kitchen)
        images.push({ url: files.kitchen[0].path, public_id: files.kitchen[0].filename })

      if (files?.bed1)
        images.push({ url: files.bed1[0].path, public_id: files.bed1[0].filename })

      if (files?.bed2)
        images.push({ url: files.bed2[0].path, public_id: files.bed2[0].filename })

      if (files?.outer)
        images.push({ url: files.outer[0].path, public_id: files.outer[0].filename })

      const amenitiesArray = req.body.amenities
        ? req.body.amenities.split(",")
        : []

      const property = await Property.create({
        title: req.body.title,
        description: req.body.description,
        city: req.body.city,
        location: req.body.location,
        price: req.body.price,
        area: req.body.area,
        bedrooms: req.body.bedrooms,
        bathrooms: req.body.bathrooms,
        amenities: amenitiesArray,
        images,

        // ⭐⭐⭐ MOST IMPORTANT
        builder: req.admin._id
      })

      res.status(201).json({
        success: true,
        message: "Property Added Successfully",
        property
      })

    } catch (error) {
      console.log(error)
      res.status(500).json({
        success: false,
        message: "Server Error"
      })
    }
  }
)

// GET ALL PROPERTIES
router.get("/all-properties", async (req, res) => {
  try {
    const properties = await Property.find().populate("builder", "name email");
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
})

// GET SINGLE PROPERTY  
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("builder", "name email");  
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
    } catch (error) {   
    res.status(500).json({ message: error.message });
    }
})



router.get("/my-properties", protectAdmin, async (req, res) => {

  try {

    const properties = await Property.find({
      builder: req.admin._id
    }).sort({ createdAt: -1 })

    res.json(properties)

  } catch (err) {
    res.status(500).json({ message: "Error" })
  }

})

module.exports = router