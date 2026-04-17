const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    builder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Builder ID
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: String,
    userPhone: String,
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    timeSlot: { type: String, required: true }, // Example: "10:00 AM"
    variant: { type: String, required: true }, // He add kar
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled', 'rescheduled'], 
        default: 'pending' 
    },
    userStatus: { 
        type: String, 
        enum: ['active', 'cancelled'], 
        default: 'active' 
    },
    actionReason: { type: String }, // Builder चं कारण इथे सेव्ह होईल
    oldDate: { type: String }, // For rescheduling
    oldTimeSlot: { type: String }, // For rescheduling
    updatedAt: { type: Date, default: Date.now },
    message: String,
    isNewForBuilder: { type: Boolean, default: true }, // For notification
    isNewForUser: { type: Boolean, default: false }, // For notification
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);

