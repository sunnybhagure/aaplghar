const express = require("express");
const router = express.Router();

const mongoose = require('mongoose');

const upload = require("../middleware/multer");

const { register, login, updateAdminProfile, changePassword, verifyPassword, getAdminProfile, uploadCoverImage } = require("../Controller/AdminController");

// Admin Registration
router.post("/register", register);
// Admin Login
router.post("/login", login);
// Admin Profile Update
router.put("/adminprofile/:id", updateAdminProfile);
// Get Admin Profile
router.get("/adminprofile/:id", getAdminProfile);
// Upload Cover Image
router.post("/upload-cover-image", upload.single("file"), uploadCoverImage);
// Change Password
router.post("/change-password", changePassword);
// Verify Password
router.post("/verify-password", verifyPassword);

module.exports = router;