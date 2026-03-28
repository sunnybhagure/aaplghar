const Property = require("../models/property/propertyMain");

exports.addProperty = async (req, res) => {
  try {
    console.log("BODY:", JSON.stringify(req.body, null, 2));
    console.log("FILES:", JSON.stringify(req.files, null, 2));
    
    const body = req.body;
    const files = req.files || {};

    // 1. Basic Common Data Build
    let newProperty = {
      title: body.title,
      location: { 
        city: body.city, 
        area: body.area 
      },
      description: body.description,
      specification: body.specification,
      propertyType: body.propertyType,
      price: {
        starting: body.startPrice ? Number(body.startPrice) : 0,
        upto: body.endPrice ? Number(body.endPrice) : 0,
      },
      amenities: body.amenities ? body.amenities.split(",") : [],
      nearbyLocalities: body.localities ? body.localities.split(",") : [],
      images: {
        coverImage: files.coverImage?.[0]?.path || "",
        gallery: files.gallery ? files.gallery.map((f) => f.path) : [],
        societyPlan: files.societyPlan?.[0]?.path || "",
      },
      builder: req.admin?._id || null, // Admin ID check
    };

    // 2. Conditional Details (Property Type pramane)
    
    // 🏡 RESIDENTIAL LOGIC
    if (body.propertyType === "residential") {
      const bhkTypes = [];
      ["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK"].forEach((bhk) => {
        // Corrected Template Literal and removed 'gold' word
        if (body[`${bhk}_area`]) { 
          bhkTypes.push({
            type: bhk,
            area: Number(body[`${bhk}_area`]),
            planImage: files[`${bhk}_plan`]?.[0]?.path || null, 
          });
        }
      });

      newProperty.residentialDetails = {
        propertySubType: body.resType?.toLowerCase(),
        status: body.status?.toLowerCase().replace(/\s/g, "_"),
        bhkTypes: bhkTypes,
      };
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
    console.log("FINAL DATA TO SAVE:", JSON.stringify(newProperty, null, 2));
    const property = await Property.create(newProperty);

    res.status(201).json({
      success: true,
      message: "Property added successfully",
      data: property,
    });

  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};