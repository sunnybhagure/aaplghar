const axios = require('axios');
const FormData = require('form-data');

// --- CONFIGURATION ---
const API_URL = "${API}/api/property/addProperty";
const JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDIzOTVlMDE4NmJmNmNjN2IxZWJlMiIsImlhdCI6MTc3NTM4NDkyNiwiZXhwIjoxNzc1OTg5NzI2fQ.DWiGFWK1GSj1ngdZ_9y3AAeX-KZwkaWFMxgiq0x1Qfg";

const cities = ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Navi Mumbai"];
const subTypes = ["Apartment", "Villa", "Bungalow", "Duplex", "Rowhouse"];

const generateDummyData = () => {
    let properties = [];
    cities.forEach((city, cityIndex) => {
        for (let i = 1; i <= 4; i++) {
            const isReady = (cityIndex + i) % 2 === 0;
            const status = isReady ? "Ready" : "Under Construction";
            const selectedSubTypes = [subTypes[i % 5], subTypes[(i + 2) % 5]];

            let configData = {};
            selectedSubTypes.forEach(st => {
                configData[st] = {
                    "2BHK": [{ area: "1050", price: "8500000" }],
                    "3BHK": [{ area: "1550", price: "14500000" }]
                };
            });

            properties.push({
                title: `${city} Heritage ${i}`,
                city: city,
                area: `Sector ${i * 2} High Street`,
                propertyType: "residential",
                description: `Premium project in ${city}.`,
                startPrice: "8500000",
                endPrice: "25000000",
                status: status,
                projectArea: (Math.random() * 15 + 2).toFixed(2),
                possessionDate: isReady ? "" : "Dec 2027",
                amenities: ["Swimming Pool", "Gym"],
                facilities: ["24/7 Water", "Power Backup"],
                specification: ["Vitrified Tiles"],
                highlights: ["Gated Community"],
                localities: ["Railway Station (10 mins)"],
                resSubTypes: selectedSubTypes,
                configData: configData,
                coverImage: "https://res.cloudinary.com/dzspgpdyo/image/upload/v1775379822/aaplghar/properties/sample_cover.jpg",
                societyPlan: "https://res.cloudinary.com/dzspgpdyo/image/upload/v1775379823/aaplghar/properties/sample_plan.jpg",
                gallery: [
                    "https://res.cloudinary.com/dzspgpdyo/image/upload/v1775243799/aaplghar/properties/sample_1.jpg",
                    "https://res.cloudinary.com/dzspgpdyo/image/upload/v1775243799/aaplghar/properties/sample_2.jpg"
                ]
            });
        }
    });
    return properties;
};

const seedDatabase = async () => {
    const properties = generateDummyData();
    console.log(`🚀 Total ${properties.length} properties insert hot aahet...\n`);

    for (const property of properties) {
        try {
            const form = new FormData();

            // Text fields
            const textFields = ["title", "city", "area", "propertyType", "description", "startPrice", "endPrice", "status", "projectArea", "possessionDate", "coverImage", "societyPlan"];
            textFields.forEach(key => form.append(key, property[key]));

            // JSON fields
            const jsonFields = ["amenities", "facilities", "specification", "highlights", "localities", "resSubTypes", "configData", "gallery"];
            jsonFields.forEach(key => form.append(key, JSON.stringify(property[key])));

            const response = await axios.post(API_URL, form, {
                headers: {
                    ...form.getHeaders(),
                    "Authorization": `Bearer ${JWT_TOKEN}`
                }
            });

            console.log(`✅ Success: ${property.title}`);
        } catch (err) {
            console.log(`\n❌ ERROR in ${property.title}:`);
            if (err.response) {
                // Server ne response dila pan to error aahe (e.g. 400, 500, 401)
                console.log("Status:", err.response.status);
                console.log("Message:", JSON.stringify(err.response.data, null, 2));
            } else {
                // Server paryant request pohchli nahi
                console.log("Network/Other Error:", err.message);
            }
            console.log("-------------------------------------------\n");
        }
    }
};

seedDatabase();