const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const propertyTitle = req.body.title 
      ? req.body.title.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '') 
      : "general_property";

    return {
      folder: `aaplghar/properties/${propertyTitle}`,
      public_id: `${file.fieldname}-${Date.now()}`,
      resource_type: "auto",
    };
  },
});

// .fields() kadhun fakt storage initialize kara
const upload = multer({ storage: storage });

module.exports = upload;