import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// Note: In a real production app, ensure API_KEY is set.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeImageForSuitability = async (base64Image: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key missing. Skipping AI check.";
  }

  try {
    const model = 'gemini-2.5-flash-image';
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Analyze this image for a custom 3D statue service. Check if it contains a clear human face and body. If it is suitable, please respond with this exact sentence: 'The image is a full body shot with a clear human face, making it suitable for creating a 3D statue.' If not, briefly explain what is missing (e.g. 'Face is not clear', 'Image is too blurry')."
          }
        ]
      }
    });

    return response.text || "Could not analyze image.";
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return "AI analysis unavailable.";
  }
};