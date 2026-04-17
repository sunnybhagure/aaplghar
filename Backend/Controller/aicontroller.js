const Groq = require("groq-sdk");
const { processAIResults } = require("./airesultController");

// Groq Initialize kara
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ✅ Retry logic with exponential backoff (Same as before)
const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Groq uses 429 for rate limit and 503 for overloaded
      if (error.status === 429 || error.status === 503) {
        const waitTime = delay * Math.pow(2, i);
        console.log(`⏳ Groq Retry attempt ${i + 1}/${maxRetries} after ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
};

exports.searchPropertiesAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: "Prompt is required" });

    const aiInstruction = `
      Extract property search filters from this user prompt: "${prompt}"
      Return ONLY a raw JSON object. Do not include markdown formatting or backticks.
      Keys: "city", "area", "nearbyLocalities", "maxPrice", "bhk", "propertyType", "amenities".
      If missing, use null for single values and [] for arrays.
      Values for propertyType: residential, commercial, or plot.
    `;

    // ✅ Groq API Call for Filter Extraction
    // ✅ Groq API Call for Filter Extraction
const chatCompletion = await retryWithBackoff(
  () => groq.chat.completions.create({
    messages: [{ role: "user", content: aiInstruction }],
    model: "llama-3.1-8b-instant", // Updated Model Name
    response_format: { type: "json_object" }
  }),
  3,
  2000
);

    let text = chatCompletion.choices[0].message.content;
    const filters = JSON.parse(text);
    console.log("[Groq] Extracted filters:", filters);

    // ✅ Pass original prompt for AI analysis (Logic same)
    const properties = await processAIResults(filters, prompt);

    res.status(200).json({ success: true, filters, properties });

  } catch (error) {
    console.error("❌ Groq Error:", error);
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};