const Appointment = require('../models/appointment');
const mongoose = require('mongoose'); // वरती इम्पोर्ट कर

exports.bookAppointment = async (req, res) => {
    try {
        // Frontend kadun yenara data (req.body)
        const { property, builder, user, userName, userPhone, date, timeSlot, variant, message } = req.body;

        // Validation
        if (!variant) {
            return res.status(400).json({ message: "Please select a variant" });
        }

        const newAppointment = new Appointment({
            property,    // Schema madhye 'property' aahe
            builder,     // Schema madhye 'builder' aahe
            user,        // Schema madhye 'user' aahe
            userName,    // Schema madhye 'userName' aahe
            userPhone,   // Schema madhye 'userPhone' aahe
            date,
            timeSlot,    // Schema madhye 'timeSlot' aahe
            variant,
            message
        });

        await newAppointment.save();
        res.status(201).json({ success: true, message: "Appointment booked!" });

    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// 1. User Side: स्वतःच्या सर्व अपॉइंटमेंट पाहण्यासाठी (Add this!)


exports.getUserAppointments = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("Fetching appointments for User ID:", userId);

        // find() मध्ये डायरेक्ट userId वापरा
        const appointments = await Appointment.find({ user: userId })
            .populate({
                path: 'property',
                select: 'title location images' 
            })
            .populate({
                path: 'builder',
                select: 'companyName email phone'
            })
            .sort({ createdAt: -1 });

        console.log("Database response length:", appointments.length);
        
        // जर डेटा सापडला तर तो पाठवा, रिकामा असला तरी रिकामी array पाठवा
        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error in getUserAppointments:", error);
        res.status(500).json({ message: "Error fetching appointments", error: error.message });
    }
};

// Builder Dashboard sathi list
exports.getBuilderAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ builder: req.params.builderId })
            .populate({
                path: 'property',
                select: 'title location propertyType images'
            })
            .populate({
                path: 'builder',
                select: 'companyName email phone'
            })
            .sort({ date: 1, timeSlot: 1 }); // Sort by date and time ascending
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching appointments" });
    }
};

// 4. Builder Side: Update Status with Reason (Enhanced)
exports.builderUpdateStatus = async (req, res) => {
    try {
        const { status, actionReason, date, timeSlot } = req.body;
        const updateData = {
            status,
            actionReason,
            isNewForUser: true, // Notify user
            updatedAt: new Date()
        };

        if (status === 'rescheduled' && date && timeSlot) {
            const appt = await Appointment.findById(req.params.id);
            updateData.oldDate = appt.date;
            updateData.oldTimeSlot = appt.timeSlot;
            updateData.date = date;
            updateData.timeSlot = timeSlot;
        }

        if (status === 'pending') {
            updateData.oldDate = null;
            updateData.oldTimeSlot = null;
        }

        const updated = await Appointment.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Appointment not found" });

        res.json({ success: true, message: `Appointment ${status} successfully`, appointment: updated });
    } catch (error) {
        console.error("Builder Update Error:", error);
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};

// 5. Mark Notifications as Read
exports.markAsRead = async (req, res) => {
    try {
        const { forUser } = req.body; // true for user, false for builder
        const updateField = forUser ? 'isNewForUser' : 'isNewForBuilder';

        await Appointment.findByIdAndUpdate(req.params.id, { [updateField]: false });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Failed to mark as read" });
    }
};

// Mark as read for user
exports.markAsReadUser = async (req, res) => {
    try {
        await Appointment.findByIdAndUpdate(req.params.id, { isNewForUser: false });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Failed to mark as read" });
    }
};

// Mark as read for builder
exports.markAsReadBuilder = async (req, res) => {
    try {
        await Appointment.findByIdAndUpdate(req.params.id, { isNewForBuilder: false });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Failed to mark as read" });
    }
};

// 2. User Side: Reschedule Appointment (With 24h Check)
exports.userReschedule = async (req, res) => {
    try {
        const { date, timeSlot } = req.body;
        const appt = await Appointment.findById(req.params.id);

        if (!appt) return res.status(404).json({ message: "Appointment not found" });

        // 24 Hour Logic Check
        const appointmentDateTime = new Date(`${appt.date} ${appt.timeSlot}`);
        const now = new Date();
        const diffInHours = (appointmentDateTime - now) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return res.status(400).json({ message: "Cannot reschedule within 24 hours of appointment" });
        }

        // Store old values
        const oldDate = appt.date;
        const oldTimeSlot = appt.timeSlot;

        const updated = await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                date,
                timeSlot,
                status: 'rescheduled',
                oldDate,
                oldTimeSlot,
                isNewForBuilder: true, // Notify builder of reschedule request
                updatedAt: new Date()
            },
            { new: true }
        );

        res.json({ success: true, message: "Appointment rescheduled successfully", appointment: updated });
    } catch (error) {
        console.error("Reschedule Error:", error);
        res.status(500).json({ message: "Reschedule failed", error: error.message });
    }
};

// 3. User Side: Cancel Appointment
exports.userCancel = async (req, res) => {
    try {
        const appt = await Appointment.findById(req.params.id);
        if (!appt) return res.status(404).json({ message: "Appointment not found" });

        // 24 Hour Logic Check for Cancellation too
        const appointmentDateTime = new Date(`${appt.date} ${appt.timeSlot}`);
        const now = new Date();
        const diffInHours = (appointmentDateTime - now) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return res.status(400).json({ message: "Cannot cancel within 24 hours of appointment" });
        }

        const updated = await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                userStatus: 'cancelled',
                status: 'cancelled',
                isNewForBuilder: true, // Notify builder
                updatedAt: new Date()
            },
            { new: true }
        );

        res.json({ success: true, message: "Appointment cancelled successfully", appointment: updated });
    } catch (error) {
        console.error("Cancel Error:", error);
        res.status(500).json({ message: "Cancel failed", error: error.message });
    }
};