const Property = require("../models/property/propertyMain");

exports.addProperty = async (req, res) => {
  try {
    console.log("BODY RECV:", req.body);
    
    const body = req.body;
    const files = req.files || {};

    const floorPlansArray = [];

    // BHK plans check kara ani array madhye object banvun taka
    ["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK"].forEach((bhk) => {
      const fieldName = `${bhk}_plan`;
      if (files[fieldName]) {
        floorPlansArray.push({
          bhkType: bhk,
          image: files[fieldName][0].path // Cloudinary chi link
        });
      }
    });

    // --- HELPER FUNCTION: String to Array Conversion ---
    // Jar data JSON string asel tar parse karel, nasel tar split karel
    const parseArray = (data) => {
      if (!data) return [];
      try {
        return JSON.parse(data); // Frontend varun JSON stringify aala tar
      } catch (e) {
        return data.split(",").map(item => item.trim()); // Normal comma separated aala tar
      }
    };

    // 1. Basic Common Data Build
    let newProperty = {
      title: body.title,
      location: { 
        city: body.city, 
        area: body.area 
      },
      description: body.description,
      // ✅ Updated for Multi-Input Array
      specification: parseArray(body.specification),
      amenities: parseArray(body.amenities),
      nearbyLocalities: parseArray(body.localities),
      
      propertyType: body.propertyType?.toLowerCase().trim(),      
      price: {
        starting: body.startPrice ? Number(body.startPrice) : 0,
        upto: body.endPrice ? Number(body.endPrice) : 0,
      },
      images: {
        coverImage: files.coverImage?.[0]?.path || "",
        gallery: files.gallery ? files.gallery.map((f) => f.path) : [],
        societyPlan: files.societyPlan?.[0]?.path || "",
        floorPlans: floorPlansArray
      },
      builder: req.admin?._id || null,
    };

    // 2. Conditional Details (Property Type pramane)
    
    // 🏡 RESIDENTIAL LOGIC
   // 🏡 RESIDENTIAL LOGIC
    if (body.propertyType === "residential") {
      const bhkTypes = [];
      ["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK"].forEach((bhk) => {
        if (body[`${bhk}_area`]) { 
          bhkTypes.push({
            bhk_type: bhk,
            area: Number(body[`${bhk}_area`]),
            planImage: files[`${bhk}_plan`]?.[0]?.path || null, 
          });
        }
      });

      newProperty.residentialDetails = {
        // .trim().toLowerCase() vapra mhanje "Apartment " cha "apartment" hoil
        propertySubType: body.resType?.toString().trim().toLowerCase(), 
        
        // "Ready" -> "ready", "Under Construction" -> "under_construction"
        status: body.status?.toString().trim().toLowerCase().replace(/\s+/g, "_"), 
        
        bhkTypes: bhkTypes,
      };

      // Validation check (Optional but safe)
      const allowedSubTypes = ["villa", "apartment", "penthouse", "bungalow", "duplex", "rowhouse"];
      if (!allowedSubTypes.includes(newProperty.residentialDetails.propertySubType)) {
          delete newProperty.residentialDetails.propertySubType; // Jar match nahi jhala tar field kadun taka nahitar error yeil
      }
    }
    
    // 🏢 COMMERCIAL LOGIC
    else if (body.propertyType === "commercial") {
      newProperty.commercialDetails = {
        propertySubType: body.resType?.toLowerCase(),
        area: body.commercialArea ? Number(body.commercialArea) : 0,
        parking: body.parking === "on" || body.parking === "true" || body.parking === true,
        status: body.status?.toLowerCase().replace(/\s/g, "_"),
      };
    } 
    
    // 🌄 PLOT LOGIC
    else if (body.propertyType === "plot") {
      newProperty.plotDetails = {
        plotType: body.plotType,
        area: body.plotArea ? Number(body.plotArea) : 0,
      };
    }

    // ✅ SAVE TO DB
    const property = await Property.create(newProperty);

    res.status(201).json({
      success: true,
      message: "Property added successfully",
      data: property,
    });

  } catch (error) {
    console.log("❌ CRITICAL ERROR ❌");
    // Ha logic error la readable banvel
    console.log(JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))));
    
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
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