const jwt = require("jsonwebtoken")
const User = require("../models/User")

exports.protectUser = async (req, res, next) => {
    let token;
    
    // १. चेक करा हेडर येतोय का
    console.log("Headers Auth:", req.headers.authorization); 

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // २. चेक करा डिकोड झालेला आयडी काय आहे
        console.log("Decoded Token ID:", decoded.id); 

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        next();
    } catch (err) {
        console.error("JWT Error:", err.message); // ३. नक्की एरर काय आहे ते कळेल
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};