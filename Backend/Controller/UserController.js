const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" })
    }

    // Check if user exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ success: false, message: "Email already in use" })
    }

    // Create user
    user = await User.create({ name, email, password, phone })

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("User Register error:", error.message);
    
    if (error.name === 'MongooseError' || error.message.includes('buffering')) {
      return res.status(503).json({ 
        success: false, 
        message: "Database connection issue. Please try again in a moment." 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || "Server error" 
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" })
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" })
    }

    // Generate token
    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("User Login error:", error.message);
    
    if (error.name === 'MongooseError' || error.message.includes('buffering')) {
      return res.status(503).json({ 
        success: false, 
        message: "Database connection issue. Please try again in a moment." 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || "Server error" 
    })
  }
})



module.exports = router