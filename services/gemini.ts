import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Converts a base64 string (data URL) to a raw base64 string without the prefix
 * and extracts the mime type.
 */
const parseBase64 = (dataUrl: string) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid input string');
  }
  return {
    mimeType: matches[1],
    data: matches[2]
  };
};

export const generateEditedImage = async (
  imageBase64: string,
  prompt: string
): Promise<string> => {
  try {
    const { mimeType, data } = parseBase64(imageBase64);

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType,
              data,
            },
          },
        ],
      },
      // Note: responseMimeType and responseSchema are NOT supported for nano banana (flash-image) models
      // when generating images, so we rely on the default output format.
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content generated");
    }

    let generatedImageBase64: string | null = null;

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        // Construct the data URL. The API returns the raw base64.
        // We assume png unless specified otherwise, but usually the API returns predictable types.
        // Often checking part.inlineData.mimeType is safer if available.
        const responseMime = part.inlineData.mimeType || 'image/png';
        generatedImageBase64 = `data:${responseMime};base64,${part.inlineData.data}`;
        break; // Stop after finding the first image
      }
    }

    if (!generatedImageBase64) {
      throw new Error(" The model processed the request but did not return an image. It might have refused the prompt.");
    }

    return generatedImageBase64;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
};