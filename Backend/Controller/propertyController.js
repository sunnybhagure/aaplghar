const mongoose = require('mongoose');


const Property = require("../models/property/propertyMain");



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
      propertyType: body.propertyType,
      
      price: {
        starting: body.startPrice || "0", 
        upto: body.endPrice || "0",
      },
      
      images: {
        // --- Images Assignment in Controller ---
images: {
  // Jar file asel tar file cha path, nahi tar body madhli URL, nahi tar empty string
  coverImage: getFile('coverImage')?.path || body.coverImage || "", 
  gallery: getFiles('gallery').length > 0 ? getFiles('gallery') : (parseData(body.gallery) || []),
  societyPlan: getFile('societyPlan')?.path || body.societyPlan || "",
},
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

    const property = await Property.findById(id).populate("builder", "name email mobile");

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

        // ✅ बदल इथे आहे: .populate('builder') वापरला आहे
        // यामुळे फक्त ID न येता बिल्डरचे नाव, कंपनी इ. सर्व डेटा येईल.
        const properties = await Property.find({ 
            builder: new mongoose.Types.ObjectId(builderId) 
        })
        .populate('builder') // 👈 हे अत्यंत महत्त्वाचे आहे
        .sort({ createdAt: -1 });

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
        const property = await Property.findByIdAndDelete(id);

        if (!property) return res.status(404).json({ message: "Property not found" });

        res.status(200).json({ success: true, message: "Property deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};