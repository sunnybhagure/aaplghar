const Property = require("../models/property/propertyMain");
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ✅ Retry logic (Same logic)
const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      if (error.status === 429 || error.status === 503) {
        const waitTime = delay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
};

exports.processAIResults = async (filters, originalPrompt) => {
  try {
    let query = {};
    if (filters.city) query["location.city"] = new RegExp(filters.city, "i");
    if (filters.propertyType) query.propertyType = filters.propertyType;

    const properties = await Property.find(query).lean();
    console.log(`[Groq Flow] Found ${properties.length} properties`);

    // --- 1. SCORING LOGIC (Exactly same as your code) ---
    const scoredProperties = properties.map(p => {
      let score = 0;
      if (filters.maxPrice && p.price.starting <= filters.maxPrice) score += 10;
      if (filters.area && p.location.area && new RegExp(filters.area, "i").test(p.location.area)) score += 8;
      if (filters.amenities && p.amenities) {
        filters.amenities.forEach(a => { if (p.amenities.some(pa => new RegExp(a, "i").test(pa))) score += 2; });
      }
      if (filters.bhk && JSON.stringify(p.residentialDetails?.config || {}).includes(`${filters.bhk}BHK`)) score += 5;
      return { ...p, searchScore: score };
    });

    const sortedResults = scoredProperties.sort((a, b) => b.searchScore - a.searchScore).slice(0, 5);

    // --- 2. AI ANALYSIS LOGIC (Using Groq) ---
    if (sortedResults.length > 0) {
      const analysisPrompt = `
        User Requirements: "${originalPrompt}"
        I found these top properties. For EACH property, generate:
        1. "aiDescription": A 2-3 sentence professional description.
        2. "aiBestFitPoints": 4 short bullet points.
        
        Properties: ${JSON.stringify(sortedResults.map(p => ({ 
          id: p._id, title: p.title, location: p.location, price: p.price 
        })))}
        
        Return ONLY a raw JSON array.
      `;

      try {
        const aiAnalysis = await retryWithBackoff(
          () => groq.chat.completions.create({
            messages: [{ role: "user", content: analysisPrompt }],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" }
          }),
          3,
          2000
        );

        const aiText = aiAnalysis.choices[0].message.content;
        let rawData = JSON.parse(aiText);
        
        // ✅ CRITICAL FIX: Ensure we get the array regardless of how Groq wraps it
        let aiPointsData = Array.isArray(rawData) ? rawData : (rawData.properties || rawData.data || Object.values(rawData)[0]);

        if (Array.isArray(aiPointsData)) {
          sortedResults.forEach(p => {
            const aiData = aiPointsData.find(item => item.id === p._id.toString() || item.id === p._id);
            if (aiData) {
              p.aiDescription = aiData.aiDescription || "Excellent property matching your requirements";
              p.aiBestFitPoints = aiData.aiBestFitPoints || ["Great match", "Modern amenities"];
            } else {
              // Individual fallback if specific ID not found in AI response
              p.aiDescription = "A premium property matching your criteria perfectly.";
              p.aiBestFitPoints = ["Perfect match", "Prime location", "Modern amenities", "Great value"];
            }
          });
          console.log("✅ Groq Analysis completed and merged");
        } else {
          throw new Error("AI response format is not an array");
        }

      } catch (aiError) {
        console.error("⚠️ Groq Analysis failed, using fallback:", aiError.message);
        // Fallback for all results if entire AI call fails
        sortedResults.forEach(p => {
          p.aiDescription = "A premium property matching your criteria perfectly with excellent amenities and location benefits.";
          p.aiBestFitPoints = ["Perfect match", "Prime location", "Modern amenities", "Great value"];
        });
      }
    }

    return sortedResults;
  } catch (error) {
    console.error("❌ Error in airesultController:", error);
    return [];
  }
};