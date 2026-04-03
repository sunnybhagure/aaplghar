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
      
      // --- HIGHLIGHTS UPDATE ---
      highlights: parseData(body.highlights), // Frontend kadun highlightsList parse hoil
      
      specification: parseData(body.specification),
      amenities: parseData(body.amenities),
      nearbyLocalities: parseData(body.localities),
      propertyType: body.propertyType,
      
      // --- MAIN PRICE UPDATE ---
      price: {
        starting: body.startPrice || "0", // String format (e.g. "55 Lakh")
        upto: body.endPrice || "0",
      },
      
      images: {
        coverImage: getFile('coverImage')?.path || "",
        gallery: getFiles('gallery'),
        societyPlan: getFile('societyPlan')?.path || "",
      },
      builder: req.admin?._id,
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
                price: v.price || "0", // INDIVIDUAL PRICE (String)
                planImage: getFile(`plan_${sub}_${bhk}_${idx}`)?.path || ""
              }));
            }
          });
        });
      }
      newProperty.residentialDetails = {
        propertySubTypes: resSubTypes,
        config: processedRes,
        status: body.status?.toLowerCase().replace(/\s/g, "_"),
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
              price: v.price || "0", // INDIVIDUAL PRICE (String)
              planImage: getFile(`plan_${sub}_${idx}`)?.path || ""
            }));
          }
        });
      }

      newProperty.commercialDetails = {
        propertySubTypes: commSubTypes,
        config: processedComm,
        parking: body.parking === "true",
        status: body.status?.toLowerCase().replace(/\s/g, "_"),
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
              price: v.price || "0", // INDIVIDUAL PRICE (String)
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
    const properties = await Property.find(); // MongoDB model
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

        // String ID la MongoDB ObjectId madhe convert karne
        if (!mongoose.Types.ObjectId.isValid(builderId)) {
            return res.status(400).json({ success: false, message: "Invalid Builder ID format" });
        }

        // Query madhe convert keleli ID vapra
        const properties = await Property.find({ 
            builder: new mongoose.Types.ObjectId(builderId) 
        }).sort({ createdAt: -1 });

        if (!properties || properties.length === 0) {
            return res.status(200).json({ success: true, data: [], message: "No properties found" });
        }

        res.status(200).json({ success: true, data: properties });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Property Update karnyasath

exports.updateProperty = async (req, res) => {
  try {

    console.log("FILES RECEIVED:", req.files); // Files check kar
    console.log("BODY RECEIVED:", req.body);   // He empty nahi pahije

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ success: false, message: "No data provided" });
    }
    
    // ConfigData string mhanun yete, tila parse karava lage
    if (!req.body) {
            return res.status(400).json({ success: false, message: "No data provided" });
        }

        

        // Jar configData string mhanun yet asel (FormData mule), tar tyala parse karave lagel
        // propertyController.js madhye
          const configData = typeof req.body.configData === 'string' 
            ? JSON.parse(req.body.configData) 
            : req.body.configData;

          if (!configData) {
            return res.status(400).json({ success: false, message: "configData missing!" });
          }
        
        // Baki fields pan check kar
        const highlights = req.body.highlights ? JSON.parse(req.body.highlights) : [];


    const { id } = req.params;
    const body = req.body;
    const allFiles = req.files || [];

    
    

    // 1. Juni property find kara (Persistence sathi)
    const oldProperty = await Property.findById(id);
    if (!oldProperty) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    const getFile = (fieldname) => allFiles.find(f => f.fieldname === fieldname);
    const getFiles = (fieldname) => allFiles.filter(f => f.fieldname === fieldname).map(f => f.path);

    const parseData = (data) => {
      if (!data) return [];
      try {
        return typeof data === 'string' ? JSON.parse(data) : data;
      } catch (e) { return []; }
    };

    const config = parseData(body.configData) || {};

    // 2. Updated Data Object
    let updatedData = {
      title: body.title,
      location: { city: body.city, area: body.area },
      description: body.description,
      highlights: parseData(body.highlights),
      specification: parseData(body.specification),
      amenities: parseData(body.amenities),
      nearbyLocalities: parseData(body.localities),
      propertyType: body.propertyType,
      price: {
        starting: body.startPrice || "0",
        upto: body.endPrice || "0",
      },
      // logic: Navin file aali tar ti ghya, naitar juni 'oldProperty' madhli ghya
      images: {
        coverImage: getFile('coverImage')?.path || oldProperty.images.coverImage,
        societyPlan: getFile('societyPlan')?.path || oldProperty.images.societyPlan,
        gallery: getFiles('gallery').length > 0 ? getFiles('gallery') : oldProperty.images.gallery,
      },
    };

    // --- CASE 1: RESIDENTIAL ---
    if (body.propertyType === "residential") {
      const resSubTypes = parseData(body.resSubTypes) || [];
      const processedRes = {};

      resSubTypes.forEach((sub) => {
        processedRes[sub] = {};
        const bhkConfigs = config[sub] || {};
        Object.keys(bhkConfigs).forEach((bhk) => {
          processedRes[sub][bhk] = bhkConfigs[bhk].map((v, idx) => {
            // Check if old plan exists in database for this specific variant
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
        status: body.status, // Frontend kadun yenara status
      };
    }

    // --- CASE 2: COMMERCIAL ---
    else if (body.propertyType === "commercial") {
      const commSubTypes = parseData(body.commSubTypes) || [];
      const processedComm = {};
      commSubTypes.forEach((sub) => {
        processedComm[sub] = (config[sub] || []).map((v, idx) => {
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
        parking: body.parking === "true",
        status: body.status,
      };
    }

    // --- CASE 3: PLOT ---
    else if (body.propertyType === "plot") {
      const plotSubTypes = parseData(body.plotSubTypes) || [];
      const processedPlot = {};
      plotSubTypes.forEach((sub) => {
        processedPlot[sub] = (config[sub] || []).map((v, idx) => {
          const oldPlan = oldProperty.plotDetails?.config?.[sub]?.[idx]?.planImage;
          return {
            area: v.area, length: v.length, width: v.width,
            price: v.price || "0",
            planImage: getFile(`plan_${sub}_${idx}`)?.path || oldPlan || ""
          };
        });
      });
      updatedData.plotDetails = { plotTypes: plotSubTypes, config: processedPlot };
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