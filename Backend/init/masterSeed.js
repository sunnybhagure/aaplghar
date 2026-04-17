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
// 15 Unique Indian Builder Names
const builderNames = [
    "Rajendra Deshmukh", "Sanjay Patil", "Amitabh Sharma", "Vijay Reddy", "Mahesh Hegde",
    "Suresh Oberoi", "Vikram Malhotra", "Anil Ambani", "Rajesh Goenka", "Prakash Padukone",
    "Sandip Somany", "Rahul Bajaj", "Aditya Birla", "Abhay Firodia", "Sajjan Jindal"
];

// 30 Unique Indian User Names
const userNames = [
    "Amit Sharma", "Sneha Rao", "Priya Verma", "Rahul Nair", "Anjali Gupta",
    "Vikram Singh", "Deepak Chawla", "Sunita Iyer", "Kavita Reddy", "Rohan Malhotra",
    "Siddharth Joshi", "Pooja Hegde", "Aditya Mehra", "Megha Deshmukh", "Tanmay Bhat",
    "Saurabh Shukla", "Ishani Bose", "Yashwardhan Rana", "Pratiksha Kadam", "Omkar Rane",
    "Sahil Khan", "Arjun Kapoor", "Nidhi Agarwal", "Varun Dhawan", "Shruti Shinde",
    "Gaurav Taneja", "Suhani Shah", "Akash Chopra", "Ritu Karidhal", "Manish Pandey"
];

const getRandomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// --- PLAIN PASSWORD LOGIC (No Hashing as per your request) ---
// --- PLAIN PASSWORD LOGIC (Fix 8 Characters) ---
const getPlainPassword = (email) => {
    // 1. @ chya aadhi cha bhag ghetla ani Capital kela
    let pass = email.split('@')[0].toUpperCase();
    
    // 2. Jar length 8 peksha kami asel, tar "12345678" madhle urlele numbers joḍu
    if (pass.length < 6) {
        const padding = "123";
        pass = (pass + padding).substring(0, 6);
    } else {
        // 3. Jar length 8 peksha jast asel, tar fakt pahile 8 characters gheu
        pass = pass.substring(0, 6);
    }
    
    return pass;
};


// Builder About (5 to 10 lines)
const getBuilderAbout = () => {
    return faker.lorem.paragraphs(3, '\n'); // Detailed about section
};

// Property Description (30 to 40 lines)
const getLongPropertyDescription = () => {
    // 8-10 paragraphs generate kelyane 30-40 lines cha heavy content banto
    return faker.lorem.paragraphs(10, '\n\n'); 
};

// Unique Company Address using Top Cities
const getCompanyAddress = (index) => {
    const city = companyCities[index];
    const area = faker.location.street();
    const stateMap = {
        "Mumbai": "Maharashtra", "Bangalore": "Karnataka", "Hyderabad": "Telangana", 
        "Gurgaon": "Haryana", "Delhi": "Delhi", "Chennai": "Tamil Nadu", 
        "Ahmedabad": "Gujarat", "Kolkata": "West Bengal", "Pune": "Maharashtra", 
        "Noida": "Uttar Pradesh", "Indore": "Madhya Pradesh", "Jaipur": "Rajasthan", 
        "Lucknow": "Uttar Pradesh", "Chandigarh": "Punjab", "Kochi": "Kerala"
    };
    return `Tower ${faker.string.alpha(1).toUpperCase()}, ${faker.helpers.arrayElement(["Global Tech Park", "Financial Center", "Fortune Tower"])}, ${area}, ${city}, ${stateMap[city]}, India.`;
};
// --- NEW LOGIC FUNCTIONS ---

// 1. Project Area Logic (Acres madhye)
const getProjectArea = (type) => {
    let area;
    if (type === "residential") area = (Math.random() * (60 - 5) + 5).toFixed(1);
    else if (type === "commercial") area = (Math.random() * (20 - 2) + 2).toFixed(1);
    else area = (Math.random() * (100 - 5) + 5).toFixed(1);
    return `${area} `;
};

// 2. Possession Date (Next 5 years random date)
const getPossessionDate = (status) => {
    if (status === "ready") return "Ready to Move";
    const futureDate = faker.date.future({ years: 5 });
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    return `${month}-${futureDate.getFullYear()}`;
};

// 3. Near By Localities (Format: Location (Distance))
const getNearByLocalities = (city) => {
    const places = ["International Airport", "Railway Station", "Metro Station", "Civil Hospital", "Main Highway", "City Center Mall", "IT Park", "Schools & Colleges", "Bus Stand", "Police Station", "Fire Station", "Park & Recreation Area", "Business District", "Cultural Hub", "Sports Complex"];
    const selected = faker.helpers.arrayElements(places, { min: 3, max: 4 });
    return selected.map(place => `${place} (${(Math.random() * (10 - 0.5) + 0.5).toFixed(1)} km)`);
};

// 4. Property Questions & Answers (3 to 7 random)
const getPropertyQA = (title) => {
    const pool = [
        { q: "Is there 24/7 water supply?", a: "Yes, both municipal and borewell water is available." },
        { q: "Is the project RERA approved?", a: "Yes, it is fully RERA registered and compliant." },
        { q: "Are there any hidden charges?", a: "No, all pricing is transparent including GST and stamp duty." },
        { q: "Is parking included?", a: "Separate covered parking is available for residents." },
        { q: "What is the construction status?", a: "The structure is ready and finishing work is in progress." },
        { q: "Is there a guest waiting area?", a: "Yes, a grand air-conditioned lobby is available for guests." },
        { q: "What about security?", a: "3-tier security with 24/7 CCTV surveillance is provided." },
        { q: "Are pets allowed?", a: "Yes, we have a dedicated pet park and allow pets in the premises." },
        { q: "What is the floor-to-carpet area ratio?", a: "Our project has an excellent floor-to-carpet area ratio of around 80%." },
        { q: "Is there a provision for solar panels?", a: "Yes, we have solar panels installed for common area lighting." },
        { q: "What are the maintenance charges?", a: "Maintenance charges are approximately ₹3 per sq.ft per month." },
        { q: "Is there a rainwater harvesting system?", a: "Yes, we have an efficient rainwater harvesting system in place." },
        { q: "Are there any eco-friendly features?", a: "We have incorporated green building practices and use energy-efficient materials." },
        { q: "What is the cancellation policy?", a: "We have a flexible cancellation policy with partial refunds depending on the stage of construction." },
        { q: "Can I customize the flat layout?", a: "Minor layout changes are possible depending on the construction stage." },
        { q: "Is there a clubhouse?", a: "Yes, we have a fully equipped clubhouse with a gym, indoor games, and a party hall." },
        { q: "What is the policy on subletting?", a: "Subletting is allowed with prior permission from the management." },
        { q: "Are there any ongoing offers?", a: "Please contact our sales team for current festive discounts and offers." },
        { q: "How can I book a site visit?", a: "You can book directly through the 'Aapl Ghar' app or call our helpline." },
        { q: "What sets this project apart from others?", a: "Our project offers a unique blend of luxury, sustainability, and community living that is unmatched in the area." },
        { q: "Is there a provision for electric vehicle charging?", a: "Yes, we have dedicated EV charging stations in the parking area." },
        { q: "What is the expected possession date?", a: "The expected possession date is within the next 18 months." },
        { q: "Are there any schools nearby?", a: "Yes, there are several reputed schools and colleges within a 5 km radius." },
        { q: "What is the policy on renovations?", a: "Renovations are allowed after possession with prior approval from the management." },
        { q: "Is there a provision for home automation?", a: "Yes, we offer smart home features like automated lighting and security systems." },
        { q: "What is the guest policy?", a: "Guests are welcome, and we have a dedicated waiting area for them." },
        { q: "Are there any medical facilities nearby?", a: "Yes, there are multiple hospitals and clinics within a 5 km radius." },
        { q: "What is the policy on balcony usage?", a: "Balconies can be used for gardening and leisure, but no construction or heavy installations are allowed." },
        { q: "Is there a provision for rainwater harvesting?", a: "Yes, we have an efficient rainwater harvesting system in place." },
        { q: "What are the maintenance charges?", a: "Maintenance charges are approximately ₹3 per sq.ft per month." },
        { q: "Are there any eco-friendly features?", a: "We have incorporated green building practices and use energy-efficient materials." },
        { q: "What is the cancellation policy?", a: "We have a flexible cancellation policy with partial refunds depending on the stage of construction." },
        { q: "Can I customize the flat layout?", a: "Minor layout changes are possible depending on the construction stage." },
        { q: "Is there a clubhouse?", a: "Yes, we have a fully equipped clubhouse with a gym, indoor games, and a party hall." },
        { q: "What is the policy on subletting?", a: "Subletting is allowed with prior permission from the management." },
        { q: "Are there any ongoing offers?", a: "Please contact our sales team for current festive discounts and offers." },
        { q: "How can I book a site visit?", a: "You can book directly through the 'Aapl Ghar' app or call our helpline." },
        { q: "What sets this project apart from others?", a: "Our project offers a unique blend of luxury, sustainability, and community living that is unmatched in the area." },
        { q: "Is there a provision for electric vehicle charging?", a: "Yes, we have dedicated EV charging stations in the parking area." },
        { q: "What is the expected possession date?", a: "The expected possession date is within the next 18 months." },
        { q: "Are there any schools nearby?", a: "Yes, there are several reputed schools and colleges within a 5 km radius." },
        { q: "What is the policy on renovations?", a: "Renovations are allowed after possession with prior approval from the management." },
        { q: "Is there a provision for home automation?", a: "Yes, we offer smart home features like automated lighting and security systems." },
        { q: "What is the guest policy?", a: "Guests are welcome, and we have a dedicated waiting area for them." },
        { q: "Are there any medical facilities nearby?", a: "Yes, there are multiple hospitals and clinics within a 5 km radius." },
        { q: "What is the policy on balcony usage?", a: "Balconies can be used for gardening and leisure, but no construction or heavy installations are allowed." },
        { q: "Is there a provision for rainwater harvesting?", a: "Yes, we have an efficient rainwater harvesting system in place." },
        { q: "What are the maintenance charges?", a: "Maintenance charges are approximately ₹3 per sq.ft per month." },
        { q: "Are there any eco-friendly features?", a: "We have incorporated green building practices and use energy-efficient materials." },
        { q: "What is the cancellation policy?", a: "We have a flexible cancellation policy with partial refunds depending on the stage of construction." },
        { q: "Can I customize the flat layout?", a: "Minor layout changes are possible depending on the construction stage." },
        { q: "Is there a clubhouse?", a: "Yes, we have a fully equipped clubhouse with a gym, indoor games, and a party hall." },
        { q: "What is the policy on subletting?", a: "Subletting is allowed with prior permission from the management." },
        { q: "Are there any ongoing offers?", a: "Please contact our sales team for current festive discounts and offers." },
        { q: "How can I book a site visit?", a: "You can book directly through the 'Aapl Ghar' app or call our helpline." },
        { q: "What sets this project apart from others?", a: "Our project offers a unique blend of luxury, sustainability, and community living that is unmatched in the area." },
        { q: "Is there a provision for electric vehicle charging?", a: "Yes, we have dedicated EV charging stations in the parking area." },
        { q: "What is the expected possession date?", a: "The expected possession date is within the next 18 months." },
        { q: "Are there any schools nearby?", a: "Yes, there are several reputed schools and colleges within a 5 km radius." },
        { q: "What is the policy on renovations?", a: "Renovations are allowed after possession with prior approval from the management." },
        { q: "Is there a provision for home automation?", a: "Yes, we offer smart home features like automated lighting and security systems." },
        { q: "What is the guest policy?", a: "Guests are welcome, and we have a dedicated waiting area for them." },
        { q: "Are there any medical facilities nearby?", a: "Yes, there are multiple hospitals and clinics within a 5 km radius." },
        { q: "What is the policy on balcony usage?", a: "Balconies can be used for gardening and leisure, but no construction or heavy installations are allowed." },







    ];
    return faker.helpers.arrayElements(pool, { min: 3, max: 7 }).map(item => ({
        question: item.q.replace("project", title),
        answer: item.a
    }));
};

// 5. Builder FAQs (3 to 7 random)
const getBuilderFAQs = (company) => {
    const pool = [
        { q: "How many projects have you completed?", a: "We have successfully delivered over 25+ premium projects." },
        { q: "Do you provide home loan assistance?", a: "Yes, we are tied up with all major banks like SBI, HDFC, and ICICI." },
        { q: "What is your average delivery time?", a: "We usually deliver within 36 to 48 months from booking." },
        { q: "Is the construction quality certified?", a: "Yes, we use ISO certified materials and conduct regular lab tests." },
        { q: "Do you offer customization in flats?", a: "Minor layout changes are possible depending on construction stage." },
        { q: "Are there any current offers?", a: "Please contact our sales team for current festive discounts." },
        { q: "How can I book a site visit?", a: "You can book directly through the 'Aapl Ghar' app or call our helpline." },
        { q: "What sets " + company + " apart from other builders?", a: "Our commitment to quality, transparency, and customer satisfaction is unmatched in the industry." },
        { q: "Do you have any ready-to-move-in projects?", a: "Yes, we have a few ready-to-move-in options available in prime locations." },
        { q: "What is your cancellation policy?", a: "We have a flexible cancellation policy with partial refunds depending on the stage of construction." },
        { q: "How do you ensure timely delivery?", a: "We have a dedicated project management team and use advanced construction technologies to ensure timely delivery." },
        { q: "Can I see the previous projects?", a: "Yes, we have a portfolio of completed projects that you can visit or view online." },
        { q: "What are the payment plans available?", a: "We offer various payment plans including construction-linked and down payment options." },
        { q: "Do you provide post-possession services?", a: "Yes, we have a dedicated customer service team for post-possession support." },
        { q: "How do you handle legal documentation?", a: "Our legal team ensures that all documentation is clear and transparent, and we assist buyers throughout the process." },
        { q: "What is your approach to sustainability?", a: "We incorporate green building practices and focus on energy-efficient designs in all our projects." },
        { q: "How do you manage construction quality?", a: "We have strict quality control measures and conduct regular inspections to ensure the highest standards." },
        { q: "What is the average size of your flats?", a: "Our flats range from 500 sq.ft to 3500 sq.ft, catering to various needs." },
        { q: "Do you have any ongoing projects in " + company + "?", a: "Yes, we have several ongoing projects in different cities. Please check our website for details." },
        { q: "How can I contact your sales team?", a: "You can reach out to our sales team through the 'Aapl Ghar' app, our website, or by calling our helpline." },
        { q: "What is your refund policy?", a: "Refunds are processed as per our cancellation policy, with timelines depending on the stage of construction." },
        { q: "Do you offer any loyalty benefits for repeat customers?", a: "Yes, we have a loyalty program that offers discounts and benefits for repeat customers." },
        { q: "How do you handle customer grievances?", a: "We have a dedicated grievance redressal system to address any concerns promptly and effectively." },
        { q: "What is your approach to customer satisfaction?", a: "Customer satisfaction is at the core of our business, and we strive to exceed expectations through quality and service." },
        

    ];
    return faker.helpers.arrayElements(pool, { min: 3, max: 7 }).map(item => ({
        question: item.q,
        answer: item.a
    }));
};

const longPropertyReviews = {
            5: [
                "Project layout is exceptionally well-planned. The ventilation in each room is perfect, and the balcony view is stunning. Truly a dream home with world-class amenities like the rooftop garden and infinity pool.",
                "I recently visited the site, and the construction quality is top-notch. They are using premium materials. The location advantage is huge as the metro station and highway are just 5 mins away. Worth every penny!",
                "Best residential project in this area! The attention to detail in the clubhouse and gym is impressive. Security systems are high-tech, making it very safe for families. Highly recommended for long-term investment.",
                "Absolutely impressed with the smart home features integrated into the flats. The master bedroom is massive, and the kitchen fittings are purely international standard. The builder has delivered exactly what was promised.",
                "The best part about this property is the open space and massive windows that allow natural light throughout the day. It feels like living in a resort. The housekeeping and maintenance staff are already doing a great job.",
                "Rarely do you find a project that balances luxury and greenery so well. The Miyawaki forest inside the society and the sunset point on the terrace are my favorite spots. Great connectivity to the IT park.",
                "The Vastu-compliant design was a major plus for my family. Every corner of the house feels positive and airy. The double-height lobby gives a very premium feel right from the entrance. Best choice in the city.",
                "As a real estate investor, I've seen many projects, but the floor-to-carpet area ratio here is excellent. Minimal space wastage and maximum utility. The builder’s past record also gives great confidence for ROI.",
                "Everything from the Italian marble flooring to the premium bathroom fittings screams luxury. The community is elite and the environment is very peaceful. It’s perfect for those who want a quiet but posh lifestyle."
            ],
            4: [
                "The flat is spacious and the floor plan is efficient. While the price is slightly on the higher side, the quality justifies it. Only concern is the internal road work which is still ongoing, but overall a great choice.",
                "Very peaceful environment away from the city noise. The amenities are good, especially the kids' play area and jogging track. Looking forward to the possession next year as per the commitment.",
                "Good value for money. The builder has provided premium fittings in bathrooms and kitchen. Transportation is easily available nearby. A bit more greenery in the central area would have been perfect.",
                "The layout is quite practical for modern families. I liked the separate utility area provided with the kitchen. The clubhouse is functional, though I wish the swimming pool was a bit larger. Overall, a solid investment.",
                "Construction is moving at a fast pace. The sales team was very helpful during the documentation and home loan process. The proximity to the upcoming metro station will definitely boost the rates in the future.",
                "Decent amenities and a very safe neighborhood. The floor-to-ceiling height is good, making the rooms feel bigger. My only minor complaint is the limited parking space for visitors, but everything else is excellent.",
                "I love the jogging track and the meditation zone. The architecture is modern and aesthetic. Though the market is a bit far, the peaceful vibes of this project make up for it. Highly satisfied with my purchase.",
                "Quality of work is visible in every corner. The electricity backup and water management systems are robust. It would have been a 5-star if the possession was a few months earlier, but the wait is worth the quality.",
                "A very well-balanced project for working professionals. The high-speed elevators and dedicated co-working space inside the clubhouse are great additions. Security is active and the premises are kept clean."
            ],
            3: [
                "The property is decent, but the surrounding area is still developing. I felt the club membership charges are a bit high. Construction is okay, but I've seen better finishing in other projects at the same price.",
                "Average experience so far. The sample flat looked great, but the actual site work seems a bit slow. Amenities are standard, nothing extraordinary. Good for middle-class families looking for budget options.",
                "The location is a bit interior from the main road, making it difficult for public transport. Building elevation looks good, but the common area lighting needs improvement. It's an okay project for the budget.",
                "The flat size is good, but I am concerned about the water pressure in the higher floors. The builder promised a lot of things, but some are still pending. It’s a bit of a compromise between price and luxury.",
                "A middle-of-the-road project. Not too bad, not too great. The noise from the nearby highway is audible in some wings. If you are looking for a basic home without too many fancy expectations, this might work.",
                "The initial booking experience was smooth, but after-sales response is slow. The lift quality is average and there were some minor dampness issues in the basement. Hopefully, the builder fixes these soon.",
                "Good for the price range, but don't expect premium finishes. The lobby area is quite small and the gym has very limited equipment. It's strictly for those who want a home in a specific budget and location.",
                "The project is densely packed. There isn't much privacy between balconies of opposite wings. The construction quality is average, but the location is prime, so you are basically paying for the address.",
                "They have cut down on some promised garden space to add more parking. It’s functional but lacks the luxury feel. Good for rental income purposes but might not be the best for self-stay if you love open spaces."
            ]
        };

const longBuilderReviews = [
    "I was skeptical about buying a house, but this builder's professional approach changed my mind. The entire process, from the first site visit to the final allotment letter, was handled with extreme care. They have a dedicated CRM portal where I can track my payment history and construction photos. Truly a futuristic and trustworthy builder.",
    "What impressed me most was their commitment to 'Quality over Quantity'. Unlike other builders who just focus on selling, they focus on building a community. The materials used for plumbing and electrical wiring are of top-tier brands. Even the common areas like the lobby and corridors have a luxury feel. A perfect choice for premium living.",
    "Their after-sales service is what sets them apart from the competition. Most builders forget you after the booking, but here, the team is always available to answer questions about possession and legal documents. They even organized a pre-possession meet to introduce us to our future neighbors. Highly impressed with their transparency and ethics.",
    "Finding a builder who delivers on time is rare these days. This group not only completed the project as per the RERA deadline but also managed to get the OC (Occupancy Certificate) without any hassle. The legal paperwork was so organized that my bank home loan was sanctioned within a week. Their reputation in the market is well-deserved.",
    "The attention to detail in their architectural design is mind-blowing. They have optimized the space so well that even a 2BHK feels like a 3BHK. The focus on green living, rainwater harvesting, and solar lighting in common areas shows their commitment to the environment. If you are looking for a blend of luxury and sustainability, go with them.",
    "One of the most transparent builders I have ever dealt with. From the booking process to documentation, everything was crystal clear. They provided regular updates on construction progress with photos.",
    "Professionalism at its best! The sales team is very helpful and they don't hide any facts about hidden costs or GST. Their previous projects' track record is also very strong in this city.",
    "Timely delivery and quality commitment are their strengths. They use high-quality vitrified tiles and premium paint as promised in the brochure. No compromises on the safety features of the building.",
    "Very satisfied with the customer service. Even after booking, they respond to all queries promptly. Their tie-ups with major banks made my home loan process very easy and hassle-free.",
    "The builder has a great reputation for building community-centric spaces. The legal paperwork was very smooth, and they even helped me understand the RERA clauses in detail."
];

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
            const name = builderNames[i];
            const email = name.toLowerCase().replace(/\s/g, '.') + "@builder.com";
            const b = await Admin.create({
                name: name,
                email : email,
                password: getPlainPassword(email), // Plain password
                phone: "9" + faker.string.numeric(9),
                role: 'builder',
                companyName: name.split(' ')[1] + " Real Estate Group",
                about: getBuilderAbout(),
                companyAddress: getCompanyAddress(i),
                since: faker.number.int({ min: 1995, max: 2024 }).toString(),
                faqs: getBuilderFAQs(faker.company.name())
            });
            builders.push(b);
        }

        // 2. USERS (30)
        console.log("👤 Creating 30 Users...");
        const users = [];
        for (let i = 0; i < 30; i++) {
            const name = userNames[i]; // Unique Name
            const email = name.toLowerCase().replace(/\s/g, '.') + "@gmail.com";
            const u = await User.create({
                name: name,
                email : email,
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
                    const status = faker.helpers.arrayElement(["ready", "under_construction"]);

                    let pData = {
                        title: faker.commerce.productName(),
                        location: { city: city, area: faker.location.street() },
                        propertyType: type,
                        builder: builder._id,
                        price: { starting: startPrice, upto: endPrice },
                        description: getLongPropertyDescription(),
                        amenities: faker.helpers.arrayElements(["Gym", "Pool", "Clubhouse", "Security", "Garden", "Yoga Deck", "Sports Courts", "Banquet Hall", "Kids Play Area", "Pet Park", "Jogging Track","Library", "Community Center", " "], 9),
                        facilities: faker.helpers.arrayElements(["24/7 Water", "Power Backup", "Fire Safety", "CCTV","Gas Pipeline", "Parking", "Lift","Security System", "Intercom",""], 6),
                        highlights: [faker.company.catchPhrase(), faker.commerce.productAdjective()],
                        specification:faker.helpers.arrayElements( ["Vitrified Tiles", "Premium Paint", "Modular Switches", "UPVC Windows", "Granite Kitchen Platform", "Branded Fittings", "Earthquake Resistant Structure", "Double Glazed Windows", "Rainwater Harvesting", "Solar Water Heaters", "LED Street Lights"], { min: 4, max: 6 } ),
                        status: status,

                        projectArea: getProjectArea(type),
                        possessionDate: getPossessionDate(status),
                        nearbyLocalities: getNearByLocalities(city),
                        questions: getPropertyQA(faker.commerce.productName()),
                        createdAt: faker.date.past({ years: 1 }),
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
                
                // --- 1. DYNAMIC PROPERTY REVIEWS (Limit: 500) ---
                if (reviewCount < 500) {
                    const rating = faker.number.int({ min: 3, max: 5 }); // Random rating 3, 4 kiwa 5
                    const possibleComments = longPropertyReviews[rating] || longPropertyReviews[5]; 
                    const finalComment = faker.helpers.arrayElement(possibleComments);
                   

                    await Review.create({
                        property: prop._id,
                        user: u._id,
                        userName: u.name,
                        comment: finalComment,
                        rating: rating,
                        createdAt: faker.date.past({ years: 1 })
                    });
                    reviewCount++;
                }

                // --- 2. DYNAMIC BUILDER REVIEWS (Limit: 250) ---
                if (builderReviewCount < 400) {
                    const selectedBuilderComment = faker.helpers.arrayElement(longBuilderReviews);
                    await BuilderReview.create({
                        builderId: prop.builder,
                        user: { 
                            id: u._id, 
                            name: u.name,
                            image: "https://ui-avatars.com/api/?name=" + u.name.replace(/\s/g, '+') 
                        },
                        rating: faker.number.int({ min: 3, max: 5 }),
                        comment: selectedBuilderComment,
                        createdAt: faker.date.past({ years: 1 })
                    });
                    builderReviewCount++;
                }

                // --- 3. DYNAMIC APPOINTMENTS (Limit: 100) ---
                if (appointmentCount < 100) {
                    const status = faker.helpers.arrayElement(['pending', 'confirmed', 'cancelled']);
    
                    // Jar status cancelled asel, tarach reason dyaycha
                    let cancelReason = "";
                    if (status === 'cancelled') {
                        const reasons = [
                            "Builder is unavailable on this date.",
                            "Site is under maintenance.",
                            "Slot already booked by another client.",
                            "Emergency meeting at the head office.",
                            "Project site visit temporarily closed.",
                            "Weather conditions not suitable for site visit.",
                            "Client requested cancellation.",
                            "Internal scheduling conflict.",
                            "Unexpected site inspection by authorities.",
                            "Technical issues with booking system."
                        ];
                        cancelReason = faker.helpers.arrayElement(reasons);
                    }
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
                        actionReason: cancelReason,
                        isNewForBuilder: true,
                        createdAt  : faker.date.soon({ days: 30 })
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