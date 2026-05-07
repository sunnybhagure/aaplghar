const express = require("express")
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin"); //
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");

const Property = require("../models/property/propertyMain");



const generateToken = (id)=>{
  return jwt.sign({id},process.env.JWT_SECRET,{
    expiresIn:"7d"
  })
}

// ADMIN REGISTER
exports.register = async (req, res) => {
  try {

    const { name, email, password, companyName, companyAddress, phone, about, coverImage, since, faqs } = req.body

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      })
    }

    const adminExists = await Admin.findOne({ email }).lean()

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
      phone,
      about: about || "",
      coverImage: coverImage || "",
      since: since || "",
      faqs: faqs || []
    })

    const token = generateToken(admin._id)

    res.status(201).json({
      success: true,
      token,
      admin: {
        _id: admin._id,
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        companyName: admin.companyName,
        companyAddress: admin.companyAddress,
        about: admin.about,
        coverImage: admin.coverImage,
        since: admin.since,
        faqs: admin.faqs,
        role: admin.role
      },
    })

  } catch (error) {
    console.error("Register error:", error.message);
    
    if (error.name === 'MongooseError' || error.message.includes('buffering')) {
      return res.status(503).json({ 
        success: false,
        message: "Database connection issue. Please try again in a moment." 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message || "Server error during registration" 
    })
  }
};


// ADMIN LOGIN
exports.login = async (req, res) => {
  try {

    
    const { email, password } = req.body;

  
    const admin = await Admin.findOne({ email }); 


    if (!admin) {
      return res.status(401).json({ success: false, message: "Admin not found" });
    }

    const isMatch = await admin.matchPassword(password);
    console.log("Password Match Status:", isMatch); // 👈 Debug Log

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = generateToken(admin._id)

    res.json({
      success:true,
      token,
      admin:{
        _id:admin._id,
        id:admin._id,
        name:admin.name,
        email:admin.email,
        phone:admin.phone,
        companyName:admin.companyName,
        companyAddress:admin.companyAddress,
        about:admin.about,
        coverImage:admin.coverImage,
        since:admin.since,
        faqs:admin.faqs,
        role:admin.role
      }
    })
  } catch (error) {
    console.error("Login error:", error.message);
    
    if (error.name === 'MongooseError' || error.message.includes('buffering')) {
      return res.status(503).json({
        success: false,
        message: "Database connection issue. Please try again in a moment."
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login"
    })
  }
}

exports.updateAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    
    const { password, _id, role, createdAt, ...otherData } = req.body;

   
    if (!otherData || Object.keys(otherData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No valid fields to update" 
      });
    }

    if (otherData.email) {
      const existingAdmin = await Admin.findOne({ email: otherData.email });
      if (existingAdmin && existingAdmin._id.toString() !== id) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { $set: otherData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({ 
        success: false, 
        message: "Admin not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully!",
      data: updatedAdmin,
    });
  } catch (err) {
    console.error("Update Admin Profile Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Update Error", 
      error: err.message 
    });
  }
};


// @route   POST /api/verify-password
// @desc    Verify admin password before editing profile
exports.verifyPassword = async (req, res) => {
  const { userId, password } = req.body;

  try {
    
    const admin = await Admin.findById(userId);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    
    const isMatch = await bcrypt.compare(password, admin.password);

    if (isMatch) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: "Wrong Password! Access Denied." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

// Change Password Controller
exports.changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    
    const admin = await Admin.findById(userId);
    if (!admin) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await admin.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Juna password chukicha aahe (Incorrect Old Password)" });
    }

    
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password successfully changed!"
    });

  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// GET ADMIN PROFILE
exports.getAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Admin ID is required" 
      });
    }

    const admin = await Admin.findById(id).select("-password");

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: "Admin not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });

  } catch (error) {
    console.error("Get Admin Profile Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: error.message 
    });
  }
};

// UPLOAD COVER IMAGE TO CLOUDINARY
exports.uploadCoverImage = async (req, res) => {
  try {
    const { builderId } = req.body;
    
    if (!builderId) {
      return res.status(400).json({ 
        success: false, 
        message: "Builder ID is required" 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No file uploaded" 
      });
    }

    // req.file already contains Cloudinary upload result from multer-storage-cloudinary middleware
    const imageUrl = req.file.path; // Cloudinary secure URL
    
    try {
      // Update database with image URL
      const updatedAdmin = await Admin.findByIdAndUpdate(
        builderId,
        { $set: { coverImage: imageUrl } },
        { new: true }
      ).select("-password");

      res.status(200).json({
        success: true,
        message: "Cover image uploaded successfully",
        imageUrl: imageUrl,
        data: updatedAdmin
      });
    } catch (dbError) {
      console.error("Database update error:", dbError);
      res.status(500).json({ 
        success: false, 
        message: "Database update failed", 
        error: dbError.message 
      });
    }

  } catch (error) {
    console.error("Upload Cover Image Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: error.message 
    });
  }
};


exports.getAllBuilders = async (req, res) => {
    try {
        const builders = await Admin.find({ role: 'builder' }).select("-password").lean();
        
        
        const buildersWithCount = await Promise.all(builders.map(async (builder) => {
            const projectCount = await Property.countDocuments({ builder: builder._id });
            return { ...builder, totalProjects: projectCount };
        }));

        res.status(200).json({ success: true, data: buildersWithCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getBuilderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        
        const builder = await Admin.findById(id).select("-password").lean();
        if (!builder) return res.status(404).json({ success: false, message: "Builder not found" });

       
        const properties = await Property.find({ builder: id }).sort({ createdAt: -1 });

        
        const totalProjects = properties.length;
        const readyPossession = properties.filter(p => p.status === 'ready').length;
        const underConstruction = properties.filter(p => p.status === 'under_construction').length;
        
        
        const cities = [...new Set(properties.map(p => p.location?.city || p.city))].filter(Boolean);

        res.status(200).json({
            success: true,
            data: {
                builder,
                properties,
                stats: { totalProjects, readyPossession, underConstruction },
                cities
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

