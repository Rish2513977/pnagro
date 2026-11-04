import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

let aiClient = null;

function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are "PNagro Kisan AI", an expert agricultural machinery advisor, equipment rental consultant, and farm mechanization specialist powered by Google Gemini for PNagro (India's Farm & Heavy Equipment Rental Platform).

Your primary roles:
1. Help farmers, farm managers, contractors, and machinery owners choose the right machinery (Tractor, Loader / JCB, Combine Harvester, and Other Machinery).
2. Recommend appropriate attached implements (Cultivator, Rotavator, Disc Harrow, MB Plough, Seed Drill, Straw Reaper, Front Bucket Loader, Laser Land Leveler, Happy Seeder) based on crop types (Wheat, Paddy/Rice, Cotton, Sugarcane, Maize, Mustard, Pulses, Vegetables, etc.), soil conditions, and land acreage.
3. Advise on horsepower (HP) requirements, fuel consumption, average hourly rates in India (₹/hour or ₹/acre), and operator safety guidelines.
4. Explain how PNagro platform works (searching on live GPS radar map, booking equipment, verifying operator credentials, cash on delivery/arrival, and listing owned machinery to earn rental income).
5. Support both English and Hindi (or Hinglish), answering in friendly, clear, respectful, and actionable tone suited for Indian agriculturalists.

Format your responses with clean bullet points, bold highlights, and easy-to-read sections. Keep answers practical, accurate, and concise.`;

// POST /api/gemini/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], language = 'en' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const ai = getAIClient();

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not configured yet
      const fallbackReplies = [
        `Hello! I am your PNagro Agri AI Assistant. For tractor rental, 45-55 HP tractors with Cultivators or Rotavators are optimal for 5-15 acre farms for seedbed preparation. On PNagro, you can search equipment on our Live Radar Map and book with an operator! (Note: Connect GEMINI_API_KEY in Settings to enable full live Gemini 3.7 reasoning).`,
        `Namaste! For harvesting paddy or wheat, Combine Harvesters with Straw Reapers save up to 80% labor and time. Check available units in your area on the PNagro Live Radar Map!`,
      ];
      const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      return res.json({
        success: true,
        reply,
        model: 'fallback-advisor',
      });
    }

    // Build chat contents from history + current message
    const formattedContents = [];

    // Add recent message history if available
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history.slice(-6)) {
        if (msg.role === 'user' || msg.role === 'model') {
          formattedContents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text || msg.content || '' }],
          });
        }
      }
    }

    formattedContents.push({
      role: 'user',
      parts: [
        {
          text: `[User preferred language: ${language === 'hi' ? 'Hindi / हिंदी' : 'English'}]\n\nFarmer Query: ${message}`,
        },
      ],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const replyText = response.text || 'I could not generate a response. Please try rephrasing your farming query.';

    res.json({
      success: true,
      reply: replyText,
      model: 'gemini-3.7-flash',
    });
  } catch (error) {
    console.error('Gemini Chat API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI query',
      error: error.message,
      fallbackReply:
        'Our Kisan AI is momentarily busy. You can check our Live Radar Map or call our 24/7 Helpline at 1800-120-PNAGRO for immediate machinery dispatch.',
    });
  }
});

export default router;
