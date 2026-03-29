const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // 1. Title safe kara (Spaces la underscore kara)
    const propertyTitle = req.body.title 
      ? req.body.title.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '') 
      : "general_property";

    return {
      // 2. Folder path dynamic theva
      folder: `aaplghar/properties/${propertyTitle}`,
      
      public_id: `${file.fieldname}-${Date.now()}`,
      resource_type: "auto",
    };
  },
});

const upload = multer({ storage: storage }).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'gallery', maxCount: 8 },
  { name: 'societyPlan', maxCount: 1 },
  // ✅ He sagle fields add asne MUST aahe
  { name: '1RK_plan', maxCount: 1 },
  { name: '1BHK_plan', maxCount: 1 },
  { name: '2BHK_plan', maxCount: 1 },
  { name: '3BHK_plan', maxCount: 1 },
  { name: '4BHK_plan', maxCount: 1 },
  { name: '5BHK_plan', maxCount: 1 },
]);

module.exports = upload;