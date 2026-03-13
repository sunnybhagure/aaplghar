const express = require("express")
const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")

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

module.exports = router