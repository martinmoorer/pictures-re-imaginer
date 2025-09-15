
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Describes an image using the Gemini multimodal model.
 * @param base64Image The base64 encoded image data (without the data: prefix).
 * @param prompt The text prompt to guide the description.
 * @returns A promise that resolves to the text description of the image.
 */
export async function describeImage(base64Image: string, prompt: string): Promise<string> {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };

    const textPart = {
        text: prompt,
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error describing image:", error);
        throw new Error("Failed to get image description from API.");
    }
}

/**
 * Generates an image using the Imagen model.
 * @param prompt The detailed prompt for image generation.
 * @returns A promise that resolves to the base64 encoded string of the generated image.
 */
export async function generateImage(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("API did not return any images.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image from API.");
    }
}
