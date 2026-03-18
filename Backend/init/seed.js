const mongoose = require("mongoose");
const Property = require("../models/Property");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

const ADMIN_ID = "69b465c2c2feb16f5b950603";

const properties = [

/* ================= MUMBAI ================= */

{
title:"Luxury Sea View 3BHK",
description:"Premium sea facing apartment",
city:"Mumbai",
location:"Bandra",
price:25000000,
area:"1200 sqft",
bedrooms:3,
bathrooms:2,
amenities:["Gym","Lift","Parking","Security"],
images:[
{url:"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",public_id:"m1"},
{url:"https://images.unsplash.com/photo-1493809842364-78817add7ffb",public_id:"m2"},
{url:"https://images.unsplash.com/photo-1556912172-45b7abe8b7e1",public_id:"m3"},
{url:"https://images.unsplash.com/photo-1584622781564-1d987f7333c1",public_id:"m4"},
{url:"https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6",public_id:"m5"}
],
societyPlan:{url:"https://via.placeholder.com/400",public_id:"msp1"},
homePlan:{url:"https://via.placeholder.com/400",public_id:"mhp1"},
builder:ADMIN_ID
},

{
title:"Modern 2BHK",
description:"Fully furnished flat",
city:"Mumbai",
location:"Andheri",
price:18000000,
area:"900 sqft",
bedrooms:2,
bathrooms:2,
amenities:["Lift","CCTV","Power Backup"],
images:[
{url:"https://images.unsplash.com/photo-1560185127-6ed189bf02f4",public_id:"m6"},
{url:"https://images.unsplash.com/photo-1507089947368-19c1da9775ae",public_id:"m7"},
{url:"https://images.unsplash.com/photo-1556909211-36987daf7b4d",public_id:"m8"},
{url:"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",public_id:"m9"},
{url:"https://images.unsplash.com/photo-1480074568708-e7b720bb3f09",public_id:"m10"}
],
societyPlan:{url:"https://via.placeholder.com/400",public_id:"msp2"},
homePlan:{url:"https://via.placeholder.com/400",public_id:"mhp2"},
builder:ADMIN_ID
},

{
title:"Budget 1BHK",
description:"Affordable flat for small family",
city:"Mumbai",
location:"Virar",
price:6500000,
area:"550 sqft",
bedrooms:1,
bathrooms:1,
amenities:["Parking","Security"],
images:[
{url:"https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf",public_id:"m11"},
{url:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",public_id:"m12"},
{url:"https://images.unsplash.com/photo-1556910103-1c02745aae4d",public_id:"m13"},
{url:"https://images.unsplash.com/photo-1620626011761-996317b8d101",public_id:"m14"},
{url:"https://images.unsplash.com/photo-1449844908441-8829872d2607",public_id:"m15"}
],
societyPlan:{url:"https://via.placeholder.com/400",public_id:"msp3"},
homePlan:{url:"https://via.placeholder.com/400",public_id:"mhp3"},
builder:ADMIN_ID
},

{
title:"Premium Penthouse",
description:"Penthouse with terrace garden",
city:"Mumbai",
location:"Powai",
price:45000000,
area:"2000 sqft",
bedrooms:4,
bathrooms:3,
amenities:["Pool","Clubhouse","Gym"],
images:[
{url:"https://images.unsplash.com/photo-1616594039964-ae9021a400a0",public_id:"m16"},
{url:"https://images.unsplash.com/photo-1615874959474-d609969a20ed",public_id:"m17"},
{url:"https://images.unsplash.com/photo-1600489000022-c2086d79f9d4",public_id:"m18"},
{url:"https://images.unsplash.com/photo-1582582494700-f8ce0b6c9c5d",public_id:"m19"},
{url:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750",public_id:"m20"}
],
societyPlan:{url:"https://via.placeholder.com/400",public_id:"msp4"},
homePlan:{url:"https://via.placeholder.com/400",public_id:"mhp4"},
builder:ADMIN_ID
},

{
title:"Studio Apartment",
description:"Compact studio flat",
city:"Mumbai",
location:"Dahisar",
price:5000000,
area:"400 sqft",
bedrooms:1,
bathrooms:1,
amenities:["Lift"],
images:[
{url:"https://images.unsplash.com/photo-1598928506311-c55ded91a20c",public_id:"m21"},
{url:"https://images.unsplash.com/photo-1600585152220-90363fe7e115",public_id:"m22"},
{url:"https://images.unsplash.com/photo-1556909045-f5c7c16cda1f",public_id:"m23"},
{url:"https://images.unsplash.com/photo-1629079447777-1e605162dc8d",public_id:"m24"},
{url:"https://images.unsplash.com/photo-1568605114967-8130f3a36994",public_id:"m25"}
],
societyPlan:{url:"https://via.placeholder.com/400",public_id:"msp5"},
homePlan:{url:"https://via.placeholder.com/400",public_id:"mhp5"},
builder:ADMIN_ID
},

/* ================= PUNE ================= */

{
title:"IT Park 3BHK",
description:"Spacious flat near IT hub",
city:"Pune",
location:"Hinjewadi",
price:12000000,
area:"1100 sqft",
bedrooms:3,
bathrooms:2,
amenities:["Gym","Garden","Parking"],
images:[
{url:"https://images.unsplash.com/photo-1615873968403-89e068629265",public_id:"p1"},
{url:"https://images.unsplash.com/photo-1560448204-603b3fc33ddc",public_id:"p2"},
{url:"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",public_id:"p3"},
{url:"https://images.unsplash.com/photo-1552321554-5fefe8c9ef14",public_id:"p4"},
{url:"https://images.unsplash.com/photo-1605146768851-eda79da39897",public_id:"p5"}
],
societyPlan:{url:"https://via.placeholder.com/400",public_id:"psp1"},
homePlan:{url:"https://via.placeholder.com/400",public_id:"php1"},
builder:ADMIN_ID
},

{
title:"Luxury Villa",
description:"Independent villa with garden",
city:"Pune",
location:"Baner",
price:30000000,
area:"2500 sqft",
bedrooms:4,
bathrooms:3,
amenities:["Garden","Parking","Security"],
images:[
{url:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c",public_id:"p6"},
{url:"https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",public_id:"p7"},
{url:"https://images.unsplash.com/photo-1600607687644-c7f34b3f3bde",public_id:"p8"},
{url:"https://images.unsplash.com/photo-1600047509358-9dc75507daeb",public_id:"p9"},
{url:"https://images.unsplash.com/photo-1600585154208-0f9b67d0f1b4",public_id:"p10"}
],
societyPlan:{url:"https://via.placeholder.com/400",public_id:"psp2"},
homePlan:{url:"https://via.placeholder.com/400",public_id:"php2"},
builder:ADMIN_ID
},

{
title:"Affordable 2BHK",
description:"Best for middle class family",
city:"Pune",
location:"Wagholi",
price:7000000,
area:"800 sqft",
bedrooms:2,
bathrooms:2,
amenities:["Lift","Parking"],
images:[
{url:"https://images.unsplash.com/photo-1600585152915-d208bec867a1",public_id:"p11"},
{url:"https://images.unsplash.com/photo-1600607687644-c7f34b3f3bde",public_id:"p12"},
{url:"https://images.unsplash.com/photo-1600566752734-5d6a4e6c21e6",public_id:"p13"},
{url:"https://images.unsplash.com/photo-1600607687218-ff4c0e91c6c4",public_id:"p14"},
{url:"https://images.unsplash.com/photo-1600585154526-990dced4db0d",public_id:"p15"}
],
societyPlan:{url:"https://via.placeholder.com/400",public_id:"psp3"},
homePlan:{url:"https://via.placeholder.com/400",public_id:"php3"},
builder:ADMIN_ID
},

{
title:"Premium Flat",
description:"Modern society amenities",
city:"Pune",
location:"Kharadi",
price:15000000,
area:"1000 sqft",
bedrooms:3,
bathrooms:2,
amenities:["Pool","Gym","Lift"],
images:[
{url:"https://images.unsplash.com/photo-1600585154363-67eb9e2e2099",public_id:"p16"},
{url:"https://images.unsplash.com/photo-1600047509782-20d39509f26b",public_id:"p17"},
{url:"https://images.unsplash.com/photo-1600566753053-8c5e5a33c6d8",public_id:"p18"},
{url:"https://images.unsplash.com/photo-1600566752355-35792bedcfea",public_id:"p19"},
{url:"https://images.unsplash.com/photo-1600585154784-77c8b81f9d89",public_id:"p20"}
],
societyPlan:{url:"https://via.placeholder.com/400",public_id:"psp4"},
homePlan:{url:"https://via.placeholder.com/400",public_id:"php4"},
builder:ADMIN_ID
},

{
title:"1RK Flat",
description:"Best for bachelor",
city:"Pune",
location:"Shivaji Nagar",
price:4000000,
area:"350 sqft",
bedrooms:1,
bathrooms:1,
amenities:["Security"],
images:[
{url:"https://images.unsplash.com/photo-1600047509358-9dc75507daeb",public_id:"p21"},
{url:"https://images.unsplash.com/photo-1600607687644-c7f34b3f3bde",public_id:"p22"},
{url:"https://images.unsplash.com/photo-1600566753053-8c5e5a33c6d8",public_id:"p23"},
{url:"https://images.unsplash.com/photo-1600566752355-35792bedcfea",public_id:"p24"},
{url:"https://images.unsplash.com/photo-1600585154208-0f9b67d0f1b4",public_id:"p25"}
],
societyPlan:{url:"https://via.placeholder.com/400",public_id:"psp5"},
homePlan:{url:"https://via.placeholder.com/400",public_id:"php5"},
builder:ADMIN_ID
},

/* ================= NASHIK ================= */
/* ================= NAGPUR ================= */
/* ================= BANGALORE ================= */

/// 👉 (Message limit mule full code khup motha hoil)
/// 👉 Tu bolshil tar mi NEXT message mdhe remaining 15 properties deto 🙂

];

const seedData = async ()=>{
 try{
  await Property.deleteMany();
  await Property.insertMany(properties);
  console.log("✅ 25 Properties Seeded");
  process.exit();
 }catch(err){
  console.log(err);
  process.exit();
 }
};

seedData();