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
        phone: user.phone,
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
    console.log(req.body);
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
        phone: user.phone,
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



// @route   GET /api/auth/user/:id
// @desc    Get a user's profile by ID
// @access  Public
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email phone role')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.status(200).json({ success: true, user })
  } catch (error) {
    console.error('User Fetch error:', error.message)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
})

// १. फंक्शन सिग्नेचरमध्ये 'next' ॲड करा
router.put('/userprofile/:id', async (req, res, next) => { 
  try {
    const { name, email, phone, currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required.' });
    }

    const user = await User.findById(req.params.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    if (email && email !== user.email) {
      const emailInUse = await User.findOne({ email });
      if (emailInUse) return res.status(400).json({ success: false, message: 'Email already in use.' });
      user.email = email;
    }

    if (newPassword) {
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({ 
      success: true, 
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } 
    });

  } catch (error) {
    console.error('Update Error:', error);
    
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router