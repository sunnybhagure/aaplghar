const express = require("express")
const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")
const upload = require("../middleware/multer");
const Property = require("../models/property");
const { protectAdmin } = require("../middleware/Adminauth");

const router = express.Router()

const generateToken = (id)=>{
  return jwt.sign({id},process.env.JWT_SECRET,{
    expiresIn:"7d"
  })
}

// ADMIN REGISTER
router.post("/register", async (req, res) => {
  try {

    const { name, email, password, companyName, companyAddress, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      })
    }

    const adminExists = await Admin.findOne({ email })

    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      })
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      companyName,
      companyAddress,
      phone
    })

    const token = generateToken(admin._id)

    res.status(201).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})


// ADMIN LOGIN
router.post("/login",async(req,res)=>{

  const {email,password} = req.body

  const admin = await Admin.findOne({email})

  if(!admin){
    return res.status(401).json({message:"Admin not found"})
  }

  const isMatch = await admin.matchPassword(password)

  if(!isMatch){
    return res.status(401).json({message:"Invalid password"})
  }

  const token = generateToken(admin._id)

  res.json({
    success:true,
    token,
    admin:{
      id:admin._id,
      name:admin.name,
      email:admin.email
    }
  })

})


// ADD PROPERTY
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
      const files = req.files;

      const images = [];
      if (files?.hall) images.push({ url: files.hall[0].path, public_id: files.hall[0].filename });
      if (files?.kitchen) images.push({ url: files.kitchen[0].path, public_id: files.kitchen[0].filename });
      if (files?.bed1) images.push({ url: files.bed1[0].path, public_id: files.bed1[0].filename });
      if (files?.bed2) images.push({ url: files.bed2[0].path, public_id: files.bed2[0].filename });
      if (files?.outer) images.push({ url: files.outer[0].path, public_id: files.outer[0].filename });

      const amenitiesArray = req.body.amenities
        ? req.body.amenities.split(",")
        : [];

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
        builder: req.admin._id,
      });

      res.status(201).json({
        success: true,
        message: "Property Added Successfully",
        property,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
)

module.exports = router