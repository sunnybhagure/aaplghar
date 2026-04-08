const express = require("express");
const router = express.Router();

const mongoose = require('mongoose');

const { 
    bookAppointment, 
    getUserAppointments, 
    getBuilderAppointments, 
    userReschedule, 
    userCancel, 
    builderUpdateStatus, 
    markAsRead,
    markAsReadUser,
    markAsReadBuilder
} = require("../Controller/appointmentController");

// User appointment booking
router.post("/bookAppointment", bookAppointment);

// Get appointments for user
router.get("/user/:userId", getUserAppointments);

// Get appointments for a builder
router.get("/builder/:builderId", getBuilderAppointments);

// User actions
router.put("/:id/user-reschedule", userReschedule);
router.put("/:id/user-cancel", userCancel);

// Builder actions
router.put("/:id/builder-update", builderUpdateStatus);

// Mark notifications as read
router.put("/:id/mark-read", markAsRead);
router.put("/:id/mark-read-user", markAsReadUser);
router.put("/:id/mark-read-builder", markAsReadBuilder);

module.exports = router;