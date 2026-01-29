import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysis } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const LOCAL_GREETINGS = [
  "You're doing amazing, one step at a time! 🥑",
  "Hydration is key! Keep sipping that water! 💧",
  "Every small habit counts towards a bigger you! ✨",
  "Bito is so proud of your progress today! 🌈",
  "Feeling energized? You should be! 🥑✨",
  "You've got this! Keep going! 🚀",
  "A little progress each day adds up to big results! 📈",
  "Taking care of yourself is the best project you'll ever work on! 💖"
];

export const getEncouragement = async (userName: string, steps: number, water: number): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: A health app mascot named Bito (a cute avocado).
      Target User: ${userName}
      Stats: ${steps} steps, ${water} glasses of water.
      Goal: Provide a short (1 sentence), extremely friendly, non-judgmental, and encouraging mascot message. Focus on wellness and feeling good.`,
    });
    return response.text || LOCAL_GREETINGS[Math.floor(Math.random() * LOCAL_GREETINGS.length)];
  } catch (error: any) {
    console.warn("Gemini is resting. Using local greeting library.");
    return LOCAL_GREETINGS[Math.floor(Math.random() * LOCAL_GREETINGS.length)];
  }
};

export const startAvocadoChat = (history: { role: 'user' | 'model', parts: [{ text: string }] }[]) => {
  const ai = getAIClient();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are Bito, the fun and supportive mascot of a health and fitness app. 
      Your personality:
      - Always friendly and positive.
      - Extremely non-judgmental.
      - You LOVE emojis! Use them in every response! 🥑✨🌈
      - You provide helpful health tips, encouragement, and casual conversation.
      - Keep responses relatively concise but full of personality.
      - Your goal is to make wellness feel like a fun game.`,
      history: history,
    },
  });
};

export const analyzeFoodImage = async (base64Image: string, mimeType: string): Promise<FoodAnalysis> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this food image. Provide details in a supportive way. If it's unhealthy, explain why gently and suggest a healthy alternative. Return the response in JSON format.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            isHealthy: { type: Type.BOOLEAN },
            description: { type: Type.STRING },
            reasonUnhealthy: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            nutritionSummary: { type: Type.STRING },
          },
          required: ["foodName", "calories", "isHealthy", "description", "nutritionSummary"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No analysis returned.");
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText) as FoodAnalysis;
  } catch (error: any) {
    if (error?.message?.includes('429')) {
       throw new Error("I'm feeling a bit overwhelmed! Can you try scanning again in a minute? 🥑");
    }
    throw error;
  }
};