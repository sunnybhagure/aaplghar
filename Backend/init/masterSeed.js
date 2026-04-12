const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

// --- MODELS IMPORT ---
const Admin = require('../models/Admin');
const User = require('../models/User');
const Property = require("../models/property/propertyMain");
const Review = require('../models/Review');
const BuilderReview = require('../models/BuilderReview');
const Appointment = require('../models/appointment');

const MONGO_URI = process.env.MONGODB_URI;

// --- CONFIGURATION ---
const cities = ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Bangalore", "Noida", "Hyderabad", "Gurgaon", "Navi Mumbai"];
const resSubTypesList = ["Apartment", "Villa", "Bungalow", "Duplex", "Rowhouse"];
const bhkOptions = ["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK"];
const commSubTypesList = ["Shop", "Office", "Showroom", "Warehouse"];
const plotSubTypesList = ["Residential Plot", "Commercial Plot"];

const getRandomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// --- PLAIN PASSWORD LOGIC (No Hashing as per your request) ---
// --- PLAIN PASSWORD LOGIC (Fix 8 Characters) ---
const getPlainPassword = (email) => {
    // 1. @ chya aadhi cha bhag ghetla ani Capital kela
    let pass = email.split('@')[0].toUpperCase();
    
    // 2. Jar length 8 peksha kami asel, tar "12345678" madhle urlele numbers joḍu
    if (pass.length < 6) {
        const padding = "123";
        pass = (pass + padding).substring(0, 8);
    } else {
        // 3. Jar length 8 peksha jast asel, tar fakt pahile 8 characters gheu
        pass = pass.substring(0, 8);
    }
    
    return pass;
};

// --- PRICE SYNC LOGIC ---
const syncPrices = (variants, startPrice, endPrice) => {
    if (variants.length === 0) return;
    const startIdx = faker.number.int({ min: 0, max: variants.length - 1 });
    let endIdx = variants.length > 1 ? faker.number.int({ min: 0, max: variants.length - 1 }) : 0;
    if (variants.length > 1 && startIdx === endIdx) endIdx = (startIdx + 1) % variants.length;

    variants.forEach((v, idx) => {
        if (idx === startIdx) v.price = startPrice.toString();
        else if (idx === endIdx) v.price = endPrice.toString();
        else v.price = getRandomInRange(startPrice, endPrice).toString();
    });
};

async function seedDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("🛠️ Cleaning DB...");
        await Promise.all([
            Admin.deleteMany({}), User.deleteMany({}), Property.deleteMany({}),
            Review.deleteMany({}), BuilderReview.deleteMany({}), Appointment.deleteMany({})
        ]);

        // 1. BUILDERS (15)
        console.log("🏗️ Creating 15 Builders...");
        const builders = [];
        for (let i = 0; i < 15; i++) {
            const email = faker.internet.email({ provider: 'builder.com' }).toLowerCase();
            const b = await Admin.create({
                name: faker.person.fullName(),
                email,
                password: getPlainPassword(email), // Plain password
                phone: "9" + faker.string.numeric(9),
                role: 'builder',
                companyName: faker.company.name(),
                since: faker.number.int({ min: 1995, max: 2024 }).toString()
            });
            builders.push(b);
        }

        // 2. USERS (30)
        console.log("👤 Creating 30 Users...");
        const users = [];
        for (let i = 0; i < 30; i++) {
            const email = faker.internet.email({ provider: 'gmail.com' }).toLowerCase();
            const u = await User.create({
                name: faker.person.fullName(),
                email,
                password: getPlainPassword(email), // Plain password
                phone: "8" + faker.string.numeric(9),
                isVerified: true
            });
            users.push(u);
        }

        // 3. PROPERTIES (150) - Organized by Builder & City
        console.log("🏠 Creating 150 Properties...");
        const allProperties = [];
        let totalCreated = 0;

        for (const builder of builders) {
            if (totalCreated >= 150) break;

            // Each builder gets 3-5 random cities from the list
            const builderCities = faker.helpers.arrayElements(cities, { min: 3, max: 5 });

            for (const city of builderCities) {
                if (totalCreated >= 150) break;

                // Create 2-3 properties per city for this builder
                const propsInCity = faker.number.int({ min: 2, max: 3 });

                for (let j = 0; j < propsInCity; j++) {
                    if (totalCreated >= 150) break;

                    const type = faker.helpers.arrayElement(["residential", "commercial", "plot"]);
                    const startPrice = faker.number.int({ min: 6000000, max: 20000000 });
                    const endPrice = faker.number.int({ min: startPrice + 1000000, max: 90000000 });

                    let pData = {
                        title: faker.commerce.productName(),
                        location: { city: city, area: faker.location.street() },
                        propertyType: type,
                        builder: builder._id,
                        price: { starting: startPrice, upto: endPrice },
                        description: faker.lorem.paragraphs(1),
                        amenities: faker.helpers.arrayElements(["Gym", "Pool", "Clubhouse", "Security", "Garden", "Yoga Deck", "Sports Courts", "Banquet Hall", "Kids Play Area", "Pet Park", "Jogging Track"], 9),
                        facilities: faker.helpers.arrayElements(["24/7 Water", "Power Backup", "Fire Safety", "CCTV","Gas Pipeline", "Parking", "Lift","Security System", "Intercom"], 6),
                        highlights: [faker.company.catchPhrase(), faker.commerce.productAdjective()],
                        specification: ["Vitrified Tiles", "Premium Paint", "Modular Switches"],
                        status: faker.helpers.arrayElement(["ready", "under_construction"]),
                        images: {
                            coverImage: "https://res.cloudinary.com/demo/image/upload/v1/sample_property.jpg",
                            gallery: ["https://res.cloudinary.com/demo/image/upload/v1/sample_1.jpg"],
                            societyPlan: "https://res.cloudinary.com/demo/image/upload/v1/plan.jpg"
                        }
                    };

                    if (type === "residential") {
                        const subs = faker.helpers.arrayElements(resSubTypesList, { min: 1, max: 2 });
                        let config = {};
                        let variants = [];
                        subs.forEach(s => {
                            config[s] = {};
                            faker.helpers.arrayElements(bhkOptions, { min: 1, max: 3 }).forEach(b => {
                                config[s][b] = [{ area: faker.number.int({ min: 500, max: 3500 }).toString(), planImage: "" }];
                                variants.push(config[s][b][0]);
                            });
                        });
                        syncPrices(variants, startPrice, endPrice);
                        pData.residentialDetails = { propertySubTypes: subs, config };
                    } else {
                        const subs = faker.helpers.arrayElements(type === "commercial" ? commSubTypesList : plotSubTypesList, { min: 1, max: 2 });
                        let config = {};
                        let variants = [];
                        subs.forEach(s => {
                            config[s] = [{ area: faker.number.int({ min: 200, max: 5000 }).toString(), planImage: "" }];
                            variants.push(config[s][0]);
                        });
                        syncPrices(variants, startPrice, endPrice);
                        if (type === "commercial") pData.commercialDetails = { propertySubTypes: subs, config };
                        else pData.plotDetails = { plotTypes: subs, config };
                    }
                    allProperties.push(await Property.create(pData));
                    totalCreated++;
                }
            }
        }

console.log("📝 Connecting Reviews & Appointments (Limited)...");

        let reviewCount = 0;
        let builderReviewCount = 0;
        let appointmentCount = 0;

        for (const prop of allProperties) {
            // Eka property sathi random 2 te 5 users select karne
            const activeUsers = faker.helpers.arrayElements(users, faker.number.int({ min: 2, max: 5 }));

            for (const u of activeUsers) {
                
                // --- 1. DYNAMIC PROPERTY REVIEWS (Limit: 200) ---
                if (reviewCount < 200) {
                    const rating = faker.number.int({ min: 3, max: 5 });
                    const reviewComments = {
                        5: ["Ekdam bhari project aahe!", "Best investment in " + prop.location.city, "Top notch construction quality.", "Loved the amenities here."],
                        4: ["Good project, but location is a bit far.", "Value for money definitely.", "Overall satisfied with the layout.", "Process was smooth."],
                        3: ["Decent project, but prices are high.", "Okay construction, could be better.", "Average experience.", "Basic amenities provided."]
                    };

                    await Review.create({
                        property: prop._id,
                        user: u._id,
                        userName: u.name,
                        rating: rating,
                        comment: faker.helpers.arrayElement(reviewComments[rating]),
                        createdAt: faker.date.past({ years: 1 })
                    });
                    reviewCount++;
                }

                // --- 2. DYNAMIC BUILDER REVIEWS (Limit: 150) ---
                if (builderReviewCount < 150) {
                    await BuilderReview.create({
                        builderId: prop.builder,
                        user: { 
                            id: u._id, 
                            name: u.name,
                            image: "https://ui-avatars.com/api/?name=" + u.name.replace(/\s/g, '+') 
                        },
                        rating: faker.number.int({ min: 3, max: 5 }),
                        comment: faker.helpers.arrayElement([
                            "Builder is very professional.",
                            "Transparant process and helpful staff.",
                            "Good reputation in " + prop.location.city,
                            "They deliver what they promise."
                        ])
                    });
                    builderReviewCount++;
                }

                // --- 3. DYNAMIC APPOINTMENTS (Limit: 100) ---
                if (appointmentCount < 100) {
                    let selectedVariant = "Site Visit";
                    if (prop.propertyType === "residential" && prop.residentialDetails.propertySubTypes.length > 0) {
                        const firstSub = prop.residentialDetails.propertySubTypes[0];
                        const availableBHKs = Object.keys(prop.residentialDetails.config[firstSub] || {});
                        selectedVariant = availableBHKs.length > 0 ? faker.helpers.arrayElement(availableBHKs) : "Flat Visit";
                    } else if (prop.propertyType === "commercial") {
                        selectedVariant = "Office/Shop Visit";
                    } else if (prop.propertyType === "plot") {
                        selectedVariant = "Plot Survey";
                    }

                    await Appointment.create({
                        property: prop._id,
                        builder: prop.builder,
                        user: u._id,
                        userName: u.name,
                        userPhone: u.phone,
                        date: faker.date.soon({ days: 45 }).toISOString().split('T')[0],
                        timeSlot: faker.helpers.arrayElement(["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "06:00 PM"]),
                        variant: selectedVariant,
                        message: faker.helpers.arrayElement(["Interested in this project.", "Want to discuss pricing.", "Please call me.", "Booking inquiry."]),
                        status: faker.helpers.arrayElement(['pending', 'confirmed', 'cancelled']),
                        isNewForBuilder: true
                    });
                    appointmentCount++;
                }
            }
        }
        
        console.log(`✅ Seeding Summary: ${reviewCount} Reviews, ${builderReviewCount} Builder Reviews, ${appointmentCount} Appointments created.`);

        
        console.log(`✅ Success: 150 Properties created across ${cities.length} cities.`);
        setTimeout(() => { mongoose.connection.close(); process.exit(0); }, 3000);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedDB();