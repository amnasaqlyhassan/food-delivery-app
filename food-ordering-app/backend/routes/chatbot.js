const express = require('express');
const router = express.Router();
const groq = require('../utils/groq');
const MenuItem = require('../models/MenuItem');
const Eatery = require('../models/Eatery');

router.post("/", async (req, res) => {
  const { message } = req.body;

  try {
   
    const menuItems = await MenuItem.find({}); 
    const eateries = await Eatery.find({});
    const eateryMap = {};
    eateries.forEach(e => {
      eateryMap[e.name] = {
        location: e.location,
        openingHours: e.openingHours || "Not specified",
        contact: e.contactInfo || e.phoneNumber || "N/A",
        averageRating: e.averageRating,
       };
    });

    const formattedItems = menuItems.map(item => {
        const eateryInfo = eateryMap[item.eatery.eateryName] || {};
        return `
  Name: ${item.name}
  Description: ${item.description|| "N/A"}
  Price: Rs${item.price}
  Eatery: ${item.eatery.eateryName}
  Location: ${eateryInfo.location|| "Unknown"}
  Opening Hours: ${eateryInfo.openingHours}
  Contact: ${eateryInfo.contact}
  Rating: ${eateryInfo.averageRating}
  Dietary: ${item.dietaryPreferences.join(", ")|| "None"}
  `;
      }).join("\n");

    const systemPrompt = `
    You are a helpful campus food assistant. Answer user questions using the following menu and eatery data.
    Please be specific and concise in your answer.
    MENU ITEMS & EATERIES:
    ${formattedItems}
    
    Only answer based on the above data. If something isn't mentioned, say so.
        `.trim();

    const chatCompletion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const reply = chatCompletion.choices[0]?.message?.content||"No response.";
    res.json({ response: reply });

  } catch (error) {
    console.error("Chatbot error:", error.message);
    res.status(500).json({ response: "Something went wrong." });
  }
});

module.exports = router;
