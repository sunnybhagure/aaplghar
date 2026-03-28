const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: `aaplghar/properties/${req.body.title}`,
      
      // unique file name
      public_id: `${file.fieldname}-${Date.now()}`,

      resource_type: "auto",
    };
  },
});

const upload = multer({ storage });

module.exports = upload;