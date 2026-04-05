const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// multer.js
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // 1. Property Title मधून स्पेसेस आणि सिम्बॉल्स काढणे
    const propertyTitle = req.body.title 
      ? req.body.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_') 
      : "general_property";

    // 2. Fieldname क्लीन करणे (उदा. "plan image" -> "plan_image")
    const cleanFieldName = file.fieldname.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');

    // 3. Original File Name मधून एक्सटेन्शन काढून नाव क्लीन करणे
    const rawFileName = file.originalname.split('.')[0]; 
    const cleanFileName = rawFileName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
    

    return {
      folder: `aaplghar/properties/${propertyTitle}`,
      // आता public_id मध्ये फक्त alphanumeric, underscore आणि hyphen राहतील
      public_id: `${cleanFieldName}-${Date.now()}-${cleanFileName}`, 
      resource_type: "auto",
    };
  },
});

// .fields() kadhun fakt storage initialize kara
const upload = multer({ storage: storage });

module.exports = upload;