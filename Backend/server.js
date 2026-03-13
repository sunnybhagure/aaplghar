
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const dburl = process.env.MONGODB_URI

// Connect to MongoDB
mongoose.connect(dburl)
    .then(() => {
        console.log("Connection successful");
    })
    .catch((err) => {
        console.log("MongoDB Connection Error:", err.message);
    });
 

app.use(cors());
app.use(express.json());



app.use("/api/auth", require("./Controller/UserController"));
app.use("/api/admin", require("./Controller/AdminController"));

app.get("/", (req, res) => {
  res.send("Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});