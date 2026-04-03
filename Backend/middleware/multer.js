const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// multer.js
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const propertyTitle = req.body.title 
      ? req.body.title.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '') 
      : "general_property";

    // File extension kadhun taka (karan cloudinary automatic lavto)
    const originalName = file.originalname.split('.')[0]; 

    return {
      folder: `aaplghar/properties/${propertyTitle}`,
      // ithe badal kela aahe: fieldname-timestamp-originalname
      public_id: `${file.fieldname}-${Date.now()}-${originalName}`, 
      resource_type: "auto",
    };
  },
});

// .fields() kadhun fakt storage initialize kara
const upload = multer({ storage: storage });

module.exports = upload;