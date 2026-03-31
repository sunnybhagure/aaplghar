const Property = require("../models/property/propertyMain");


exports.addProperty = async (req, res) => {
  try {
    const body = req.body;
    const allFiles = req.files || [];

    const getFile = (fieldname) => allFiles.find(f => f.fieldname === fieldname);
    const getFiles = (fieldname) => allFiles.filter(f => f.fieldname === fieldname).map(f => f.path);

    // Dynamic Parsing Logic
    const parseData = (data) => {
      if (!data) return []; 
      try {
        return typeof data === 'string' ? JSON.parse(data) : data;
      } catch (e) {
        return [];
      }
    };

    const config = parseData(body.configData) || {}; // Always an object

    let newProperty = {
      title: body.title,
      location: { city: body.city, area: body.area },
      description: body.description,
      specification: parseData(body.specification),
      amenities: parseData(body.amenities),
      nearbyLocalities: parseData(body.localities),
      propertyType: body.propertyType,
      price: {
        starting: Number(body.startPrice) || 0,
        upto: Number(body.endPrice) || 0,
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
      const resSubTypes = parseData(body.resSubTypes); // Frontend check: 'resSubTypes' key barobar aahe ka?
      const processedRes = {};

      if (Array.isArray(resSubTypes)) {
        resSubTypes.forEach((sub) => {
          processedRes[sub] = {};
          const bhkConfigs = config[sub] || {};
          
          Object.keys(bhkConfigs).forEach((bhk) => {
            const variants = bhkConfigs[bhk];
            if (Array.isArray(variants)) {
              processedRes[sub][bhk] = variants.map((variant, idx) => ({
                area: variant.area,
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
      const commSubTypes = parseData(body.commSubTypes);
      const processedComm = {};

      if (Array.isArray(commSubTypes)) {
        commSubTypes.forEach((sub) => {
          const variants = config[sub];
          if (Array.isArray(variants)) {
            processedComm[sub] = variants.map((variant, idx) => ({
              area: variant.area,
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
      const plotSubTypes = parseData(body.plotSubTypes);
      const processedPlot = {};

      if (Array.isArray(plotSubTypes)) {
        plotSubTypes.forEach((sub) => {
          const variants = config[sub];
          if (Array.isArray(variants)) {
            processedPlot[sub] = variants.map((variant, idx) => ({
              area: variant.area,
              length: variant.length,
              width: variant.width,
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

exports.addProperty = async (req, res) => {
  try {
    const body = req.body;
    const allFiles = req.files || [];

    const getFile = (fieldname) => allFiles.find(f => f.fieldname === fieldname);
    const getFiles = (fieldname) => allFiles.filter(f => f.fieldname === fieldname).map(f => f.path);

    // Dynamic Parsing Logic
    const parseData = (data) => {
      if (!data) return []; 
      try {
        return typeof data === 'string' ? JSON.parse(data) : data;
      } catch (e) {
        return [];
      }
    };

    const config = parseData(body.configData) || {}; // Always an object

    let newProperty = {
      title: body.title,
      location: { city: body.city, area: body.area },
      description: body.description,
      specification: parseData(body.specification),
      amenities: parseData(body.amenities),
      nearbyLocalities: parseData(body.localities),
      propertyType: body.propertyType,
      price: {
        starting: Number(body.startPrice) || 0,
        upto: Number(body.endPrice) || 0,
      },
      images: {
        coverImage: getFile('coverImage')?.path || "",
        gallery: getFiles('gallery'),
        societyPlan: getFile('societyPlan')?.path || "",
      },
      builder: req.admin?._id,
    };

   // --- CASE 1: RESIDENTIAL (Example) ---
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
            price: Number(v.price) || 0, // Individual Price logic
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


// Commercial ani Plot sathi pan 'price: Number(v.price)' asach add kara.

    // --- CASE 2: COMMERCIAL ---
    else if (body.propertyType === "commercial") {
      const commSubTypes = parseData(body.commSubTypes);
      const processedComm = {};

      if (Array.isArray(commSubTypes)) {
        commSubTypes.forEach((sub) => {
          const variants = config[sub];
          if (Array.isArray(variants)) {
            processedComm[sub] = variants.map((variant, idx) => ({
              area: variant.area,
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
      const plotSubTypes = parseData(body.plotSubTypes);
      const processedPlot = {};

      if (Array.isArray(plotSubTypes)) {
        plotSubTypes.forEach((sub) => {
          const variants = config[sub];
          if (Array.isArray(variants)) {
            processedPlot[sub] = variants.map((variant, idx) => ({
              area: variant.area,
              length: variant.length,
              width: variant.width,
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

    // Check kar ki ID valid aahe ka
    if (!id) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // populate("builder") mule admin che nav/details miltil
    const property = await Property.findById(id).populate("builder", "name email mobile");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error("Error in getPropertyById:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};