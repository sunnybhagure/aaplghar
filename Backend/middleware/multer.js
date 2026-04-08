const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// multer.js
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Check if this is an admin cover image upload
    if (req.body.builderName) {
      // Admin Cover Image Upload
      return {
        folder: `aaplghar/${req.body.builderName.toLowerCase().replace(/\s+/g, '_')}`,
        public_id: `cover_${Date.now()}`,
        resource_type: "auto",
      };
    }

    // Property Image Upload (original logic)
    const propertyTitle = req.body.title 
      ? req.body.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_') 
      : "general_property";

    const cleanFieldName = file.fieldname.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');

    const rawFileName = file.originalname.split('.')[0]; 
    const cleanFileName = rawFileName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
    
    return {
      folder: `aaplghar/properties/${propertyTitle}`,
      public_id: `${cleanFieldName}-${Date.now()}-${cleanFileName}`, 
      resource_type: "auto",
    };
  },
});

// .fields() kadhun fakt storage initialize kara
const upload = multer({ storage: storage });

module.exports = upload;