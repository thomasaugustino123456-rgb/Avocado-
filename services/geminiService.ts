
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { FoodAnalysis } from "../types";

/**
 * Creates a fresh instance of the AI client.
 * This ensures we're using the latest available environment configuration.
 */
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getEncouragement = async (userName: string, steps: number, water: number): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: A health app mascot named Avocado (a cute avocado).
      Target User: ${userName}
      Stats: ${steps} steps, ${water} glasses of water.
      Goal: Provide a short (1 sentence), extremely friendly, non-judgmental, and encouraging mascot message. Focus on wellness and feeling good.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "You're doing great, one step at a time!";
  } catch (error) {
    console.error("Gemini Encouragement Error:", error);
    return "Every little habit counts. Keep shining!";
  }
};

export const startAvocadoChat = (history: { role: 'user' | 'model', parts: [{ text: string }] }[]) => {
  const ai = getAIClient();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are Avocado, the fun and supportive mascot of a health and fitness app. 
      Your personality:
      - Always friendly and positive.
      - Extremely non-judgmental.
      - You LOVE emojis! Use them in every response to make the chat fun and visually engaging. 🥑✨🌈
      - You provide helpful health tips, encouragement, and casual conversation.
      - Keep responses relatively concise but full of personality.
      - If the user is struggling, be extra supportive.
      - Your goal is to make wellness feel like a fun game, not a chore.`,
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
            text: "You are Avocado, a friendly avocado mascot nutritionist. Analyze this food image. Provide details in a supportive way. If it's unhealthy, explain why gently and suggest a healthy alternative. Return the response in the specified JSON format.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4096 },
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
    if (!text) {
      throw new Error("The AI didn't return any analysis. Try another photo!");
    }
    
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText) as FoodAnalysis;
  } catch (error: any) {
    console.error("Gemini Food Analysis Error:", error);
    if (error?.message?.includes('500') || error?.message?.includes('xhr')) {
      throw new Error("I'm having a little trouble connecting to my brain right now. Please try again in a few seconds!");
    }
    throw error;
  }
};
