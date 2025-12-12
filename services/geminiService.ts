import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are a fast navigation assistant for the blind. 
output a SINGLE concise paragraph.
Prioritize HAZARDS and OBSTACLES.
Do not use markdown formatting like bold or bullet points.
Just speak naturally and quickly.
Example: "Hazard. There is a chair directly ahead, 1 meter away. Path is blocked. Go left."
Keep it under 30 words.`
      },
      contents: {
        parts: [
          {
            text: "Scan for hazards and path."
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          }
        ]
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No description generated.");
    }
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};