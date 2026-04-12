const mongoose = require('mongoose');


const Property = require("../models/property/propertyMain");
const Admin = require("../models/Admin"); //
const cloudinary = require("../config/cloudinary");

const parseCloudinaryPublicId = (url) => {
  if (!url || typeof url !== "string") return null;
  
  // URL madhun 'upload/v12345/' nantar cha purna bhag extract karel
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;

  // v12345 (version number) asel tar tyala skip kara
  const startIndex = parts[uploadIndex + 1].startsWith('v') ? uploadIndex + 2 : uploadIndex + 1;
  
  const publicIdWithExt = parts.slice(startIndex).join('/');
  return publicIdWithExt.split('.')[0]; // extension (.jpg) kadhun taka
};

const deleteCloudinaryResource = async (url) => {
  const publicId = parseCloudinaryPublicId(url);
  if (!publicId) return null;
  
  // Console log karun bagha publicId kay yet aahe
  console.log("Attempting to delete Public ID:", publicId);

  // 'image' resource type specify kara, jar images astil tar
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

const collectPropertyMediaUrls = (property) => {
  const urls = [];
  const imagesContainer = property.images?.images || property.images || {};

  if (imagesContainer.coverImage) urls.push(imagesContainer.coverImage);
  if (imagesContainer.societyPlan) urls.push(imagesContainer.societyPlan);
  if (Array.isArray(imagesContainer.gallery)) urls.push(...imagesContainer.gallery.filter(img => typeof img === 'string'));

  const addPlanUrls = (configObj) => {
    if (!configObj || typeof configObj !== 'object') return;
    Object.values(configObj).forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach((variant) => { if (variant?.planImage) urls.push(variant.planImage); });
      } else if (value && typeof value === 'object') {
        Object.values(value).forEach((variants) => {
          if (Array.isArray(variants)) {
            variants.forEach((variant) => { if (variant?.planImage) urls.push(variant.planImage); });
          }
        });
      }
    });
  };

  addPlanUrls(property.residentialDetails?.config);
  addPlanUrls(property.commercialDetails?.config);
  addPlanUrls(property.plotDetails?.config);

  return [...new Set(urls)];
};



exports.addProperty = async (req, res) => {
  try {
    const body = req.body;
    const allFiles = req.files || [];

    const getFile = (fieldname) => allFiles.find(f => f.fieldname === fieldname);
    const getFiles = (fieldname) => allFiles.filter(f => f.fieldname === fieldname).map(f => f.path);

    const parseData = (data) => {
      if (!data) return []; 
      try {
        return typeof data === 'string' ? JSON.parse(data) : data;
      } catch (e) {
        return [];
      }
    };

    const config = parseData(body.configData) || {}; 

    let newProperty = {
      title: body.title,
      location: { city: body.city, area: body.area },
      description: body.description,
      
      // --- MATCHING NEW FIELDS FROM FORM ---
      projectArea: body.projectArea,
      possessionDate: body.possessionDate,
      facilities: parseData(body.facilities),
      // -------------------------------------

      highlights: parseData(body.highlights), 
      specification: parseData(body.specification),
      amenities: parseData(body.amenities),
      nearbyLocalities: parseData(body.localities),
      questions: parseData(body.questions),
      propertyType: body.propertyType,
      
      price: {
        starting: body.startPrice || "0", 
        upto: body.endPrice || "0",
      },
      
      images: {
        // --- Images Assignment in Controller ---
        coverImage: getFile('coverImage')?.path || body.coverImage || "", 
        gallery: getFiles('gallery').length > 0 ? getFiles('gallery') : (parseData(body.gallery) || []),
        societyPlan: getFile('societyPlan')?.path || body.societyPlan || "",
      },
      builder: req.admin?._id,
      // Status formatting
      status: body.status?.toLowerCase().replace(/\s/g, "_"),
    };

    // --- CASE 1: RESIDENTIAL ---
    if (body.propertyType === "residential") {
      const resSubTypes = parseData(body.resSubTypes) || [];
      const processedRes = {};

      if (Array.isArray(resSubTypes)) {
        resSubTypes.forEach((sub) => {
          processedRes[sub] = {};
          const bhkConfigs = config[sub] || {};
          
          Object.keys(bhkConfigs).forEach((bhk) => {
            const variants = bhkConfigs[bhk];
            if (Array.isArray(variants)) {
              processedRes[sub][bhk] = variants.map((v, idx) => ({
                area: v.area,
                price: v.price || "0",
planImage: getFile(`plan_${sub}_${bhk}_${idx}`)?.path || v.planImage || ""              }));
            }
          });
        });
      }
      newProperty.residentialDetails = {
        propertySubTypes: resSubTypes,
        config: processedRes,
      };
    }

    // --- CASE 2: COMMERCIAL ---
    else if (body.propertyType === "commercial") {
      const commSubTypes = parseData(body.commSubTypes) || [];
      const processedComm = {};

      if (Array.isArray(commSubTypes)) {
        commSubTypes.forEach((sub) => {
          const variants = config[sub];
          if (Array.isArray(variants)) {
            processedComm[sub] = variants.map((v, idx) => ({
              area: v.area,
              price: v.price || "0",
              planImage: getFile(`plan_${sub}_${idx}`)?.path || ""
            }));
          }
        });
      }

      newProperty.commercialDetails = {
        propertySubTypes: commSubTypes,
        config: processedComm,
        parking: body.parking === "true",
      };
    }

    // --- CASE 3: PLOT ---
    else if (body.propertyType === "plot") {
      const plotSubTypes = parseData(body.plotSubTypes) || [];
      const processedPlot = {};

      if (Array.isArray(plotSubTypes)) {
        plotSubTypes.forEach((sub) => {
          const variants = config[sub];
          if (Array.isArray(variants)) {
            processedPlot[sub] = variants.map((v, idx) => ({
              area: v.area,
              length: v.length,
              width: v.width,
              price: v.price || "0",
              planImage: getFile(`plan_${sub}_${idx}`)?.path || ""
            }));
          }
        });
      }

      newProperty.plotDetails = {
        plotTypes: plotSubTypes,
        config: processedPlot,
      };
    }

    const property = await Property.create(newProperty);
    res.status(201).json({ success: true, data: property });

  } catch (error) {
    console.error("MASTER CONTROLLER ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

// Example Route in Backend
exports.getAllProperties = async (req, res) => {
  try {
    // .populate vapra mhanje builder cha data (name, etc.) sobat yeil
    const properties = await Property.find().populate("builder", "name email mobile"); 
    
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Single Property Details
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Property ID is required" });
    }

    const property = await Property.findById(id).populate('builder');
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // --- HE BADAL (success: true ani data: property) ---
    res.status(200).json({
      success: true,
      data: property
    });

  } catch (error) {
    console.error("Error in getPropertyById:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// 1. Specific Admin chya srv properties ghenyasathi
exports.getPropertiesByBuilder = async (req, res) => {
    try {
        const { builderId } = req.params;

        // ID व्हॅलिडेशन
        if (!mongoose.Types.ObjectId.isValid(builderId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid Builder ID format" 
            });
        }

        // Find all properties for this builder
        const properties = await Property.find({ builder: builderId }).populate({
            path: "builder",
            model: "Admin",
            select: "name email phone companyName"
        });

        // जर प्रॉपर्टीज नसतील तर रिकामी ॲरे पाठवा (क्रॅश होणार नाही)
        if (!properties || properties.length === 0) {
            return res.status(200).json({ 
                success: true, 
                data: [], 
                message: "No properties found for this builder" 
            });
        }

        // यशस्वी रिस्पॉन्स
        res.status(200).json({ 
            success: true, 
            data: properties 
        });

    } catch (error) {
        console.error("Error in getPropertiesByBuilder:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error: " + error.message 
        });
    }
};

// 2. Property Update karnyasath

exports.updateProperty = async (req, res) => {
  try {
    console.log("FILES RECEIVED:", req.files);
    console.log("BODY RECEIVED:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "No data provided" });
    }

    const { id } = req.params;
    const body = req.body;
    const allFiles = req.files || [];

    // 1. Juni property find kara (Persistence sathi)
    const oldProperty = await Property.findById(id);
    if (!oldProperty) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Helper functions
    const getFile = (fieldname) => allFiles.find(f => f.fieldname === fieldname);
    const getFiles = (fieldname) => allFiles.filter(f => f.fieldname === fieldname).map(f => f.path);
    const parseData = (data) => {
      if (!data) return null; // Null return kara jene karun logic check karta yeil
      try {
        return typeof data === 'string' ? JSON.parse(data) : data;
      } catch (e) { return null; }
    };

    const config = parseData(body.configData) || {};

    // 2. Updated Data Object (Persistent Logic: Navin data || Juna data)
    let updatedData = {
      title: body.title || oldProperty.title,
      location: { 
        city: body.city || oldProperty.location.city, 
        area: body.area || oldProperty.location.area 
      },
      description: body.description || oldProperty.description,
      
      // Navin Add kelelya Fields
      possessionDate: body.possessionDate || oldProperty.possessionDate,
      projectArea: body.projectArea || oldProperty.projectArea, // e.g., "5 Acres"
      
      
      // Arrays/Objects parsing
      highlights: parseData(body.highlights) || oldProperty.highlights,
      specification: parseData(body.specification) || oldProperty.specification,
      amenities: parseData(body.amenities) || oldProperty.amenities,
      facilities: parseData(body.facilities) || oldProperty.facilities, // Navin Field
      nearbyLocalities: parseData(body.localities) || oldProperty.nearbyLocalities,
      questions: parseData(body.questions) || oldProperty.questions,
      
      propertyType: body.propertyType || oldProperty.propertyType,
      price: {
        starting: body.startPrice || oldProperty.price.starting,
        upto: body.endPrice || oldProperty.price.upto,
      },

      images: {
        coverImage: getFile('coverImage')?.path || oldProperty.images.coverImage,
        societyPlan: getFile('societyPlan')?.path || oldProperty.images.societyPlan,
        gallery: getFiles('gallery').length > 0 ? getFiles('gallery') : oldProperty.images.gallery,
      },
    };

    // --- CASE 1: RESIDENTIAL ---
    if (updatedData.propertyType === "residential") {
      const resSubTypes = parseData(body.resSubTypes) || oldProperty.residentialDetails?.propertySubTypes || [];
      const processedRes = {};

      resSubTypes.forEach((sub) => {
        processedRes[sub] = {};
        const bhkConfigs = config[sub] || oldProperty.residentialDetails?.config?.[sub] || {};
        
        Object.keys(bhkConfigs).forEach((bhk) => {
          processedRes[sub][bhk] = bhkConfigs[bhk].map((v, idx) => {
            const oldPlan = oldProperty.residentialDetails?.config?.[sub]?.[bhk]?.[idx]?.planImage;
            return {
              area: v.area,
              price: v.price || "0",
              planImage: getFile(`plan_${sub}_${bhk}_${idx}`)?.path || oldPlan || ""
            };
          });
        });
      });

      updatedData.residentialDetails = {
        propertySubTypes: resSubTypes,
        config: processedRes,
        status: body.status || oldProperty.residentialDetails?.status,
      };
    }

    // --- CASE 2: COMMERCIAL ---
    else if (updatedData.propertyType === "commercial") {
      const commSubTypes = parseData(body.commSubTypes) || oldProperty.commercialDetails?.propertySubTypes || [];
      const processedComm = {};

      commSubTypes.forEach((sub) => {
        processedComm[sub] = (config[sub] || oldProperty.commercialDetails?.config?.[sub] || []).map((v, idx) => {
          const oldPlan = oldProperty.commercialDetails?.config?.[sub]?.[idx]?.planImage;
          return {
            area: v.area,
            price: v.price || "0",
            planImage: getFile(`plan_${sub}_${idx}`)?.path || oldPlan || ""
          };
        });
      });

      updatedData.commercialDetails = {
        propertySubTypes: commSubTypes,
        config: processedComm,
        parking: body.parking !== undefined ? (body.parking === "true") : oldProperty.commercialDetails?.parking,
        status: body.status || oldProperty.commercialDetails?.status,
      };
    }

    // --- CASE 3: PLOT ---
    else if (updatedData.propertyType === "plot") {
      const plotSubTypes = parseData(body.plotSubTypes) || oldProperty.plotDetails?.plotTypes || [];
      const processedPlot = {};

      plotSubTypes.forEach((sub) => {
        processedPlot[sub] = (config[sub] || oldProperty.plotDetails?.config?.[sub] || []).map((v, idx) => {
          const oldPlan = oldProperty.plotDetails?.config?.[sub]?.[idx]?.planImage;
          return {
            area: v.area, length: v.length, width: v.width,
            price: v.price || "0",
            planImage: getFile(`plan_${sub}_${idx}`)?.path || oldPlan || ""
          };
        });
      });

      updatedData.plotDetails = { 
        plotTypes: plotSubTypes, 
        config: processedPlot 
      };
    }

    const finalProperty = await Property.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ success: true, data: finalProperty });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

// 3. Property Delete karnyasathi
exports.deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Property ID" });
        }

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        // 1. Sarv Images gola kara
        const urls = collectPropertyMediaUrls(property);
        
        // 2. Pahile sarv individual files delete kara (Garjeche aahe)
        if (urls.length > 0) {
            await Promise.allSettled(urls.map((url) => deleteCloudinaryResource(url)));
            console.log("All individual images deleted from Cloudinary");
        }

        // 3. Aata to Specific Property Folder delete kara
        // Multer madhlya logic pramane title clean kara
        if (property.title) {
            const propertyTitle = property.title
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, '_');
            
            const folderPath = `aaplghar/properties/${propertyTitle}`;

            try {
                // Cloudinary API vaprun folder delete karne
                await cloudinary.api.delete_folder(folderPath);
                console.log(`Folder deleted: ${folderPath}`);
            } catch (folderErr) {
                // Jar folder madhe ajun kahi files astil tar error yeu shakto, to catch kara
                console.warn("Folder delete error (May not be empty):", folderErr.message);
            }
        }

        // 4. Database madhun delete kara
        await Property.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Property and its folder deleted successfully" });
    } catch (error) {
        console.error("DELETE ERROR:", error);
        res.status(500).json({ success: false, message: "Error: " + error.message });
    }
};

// Get Properties by City (Dedicated Controller)
exports.getPropertiesByCity = async (req, res) => {
    try {
        const { city } = req.query; // URL madhun city ghyaychi (?city=Nashik)

        if (!city) {
            return res.status(400).json({ 
                success: false, 
                message: "City name is required in query parameters" 
            });
        }

        // Location object madhli city filter karne
        // $regex: 'i' mule capital/small letter cha farak padnar nahi
        const properties = await Property.find({
            "location.city": { $regex: new RegExp(city, 'i') }
        }).populate("builder", "name email mobile companyName");

        res.status(200).json({
            success: true,
            count: properties.length,
            city: city,
            data: properties
        });

    } catch (error) {
        console.error("CITY FILTER ERROR:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error: " + error.message 
        });
    }
};

exports.getBuildersByCity = async (req, res) => {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({ success: false, message: "City name required" });
        }

        // 1. City nusar properties find kara ani builder populate kara
        const properties = await Property.find({
            "location.city": { $regex: new RegExp(city, 'i') }
        }).populate("builder");

        // 2. Map vaprun unique builders kadha (JS logic ne)
        const buildersMap = new Map();

        properties.forEach(prop => {
            if (prop.builder && prop.builder._id) {
                // Key mhanun ID vaparlyamule duplicate builders remove hotil
                buildersMap.set(prop.builder._id.toString(), prop.builder);
            }
        });

        // Map la array madhe convert kara
        const uniqueBuilders = Array.from(buildersMap.values());

        res.status(200).json({
            success: true,
            count: uniqueBuilders.length,
            data: uniqueBuilders
        });

    } catch (error) {
        console.error("BUILDER ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};