import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });

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
    console.error("Gemini Vision Error:", error);
    throw error;
  }
};

export const askNavigation = async (query: string, userLocation?: { lat: number; lng: number }) => {
  try {
    // We use gemini-2.5-flash for Maps as it is optimized for tools and low latency
    const model = 'gemini-2.5-flash';
    
    const config: any = {
      tools: [{ googleMaps: {} }],
      systemInstruction: "You are a helpful guide. When asked about locations, routes, or places, provide clear, descriptive directions suitable for someone visually impaired. If Google Maps data is available, summarize the key details (distance, rating, address)."
    };

    // Add location context if available
    if (userLocation) {
      config.toolConfig = {
        googleMapsToolConfig: {
            mode: "MODE_Dynamic" // Optional, but good practice if available, otherwise defaults work
        },
        retrievalConfig: {
          latLng: {
            latitude: userLocation.lat,
            longitude: userLocation.lng
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model,
      contents: query,
      config
    });

    // Extract grounding chunks (Maps links/sources)
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return {
      text: response.text || "I couldn't find that location.",
      chunks: chunks
    };

  } catch (error) {
    console.error("Gemini Navigation Error:", error);
    throw error;
  }
};