const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: `aaplghar/properties/${req.body.title}`,
      public_id: file.fieldname,
    };
  },
});

const upload = multer({ storage });

module.exports = upload;