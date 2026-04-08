
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const dburl = process.env.MONGODB_URI

// Connect to MongoDB
let isConnected = false;
mongoose.connect(dburl, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
    bufferCommands: false,
    retryWrites: true,
    ssl: true,
    tlsAllowInvalidCertificates: true, // Temp fix for development - should be false in production
    authSource: 'admin',
})
    .then(() => {
        isConnected = true;
        console.log("✓ MongoDB Connection successful");
    })
    .catch((err) => {
        console.log("✗ MongoDB Connection Error:", err.message);
        console.log("\n⚠️  TROUBLESHOOTING:");
        console.log("1. Check MongoDB Atlas IP whitelist - add your current IP");
        console.log("2. Verify connection string is correct in .env");
        console.log("3. Ensure database user credentials are valid");
        console.log("4. Check network connectivity to MongoDB Atlas\n");
    });

// Monitor connection status
mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.log('MongoDB connection error:', err);
});
 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));



app.use("/api/auth", require("./Controller/UserController"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/property", require("./routes/property"));
app.use("/api/appointments", require("./routes/appointment"));



app.get("/", (req, res) => {
  res.send("Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("EXPRESS ERROR:", err); // Ata yithe [object Object] chya jagi error message disel
  res.status(500).send(err.message);
});