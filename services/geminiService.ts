
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, Language, Folder } from "../types";

// Dynamic schema generation is complex with strict types, so we use a more generic output schema 
// and handle validation in the application logic.
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    visualDescription: {
      type: Type.STRING,
      description: "A concise summary of what is happening visually in the image or video frame.",
    },
    extractedTexts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Any visible text extracted via OCR from the image.",
    },
    detectedEntities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING, description: "Type of entity (Product, Place, Technology, Actor, etc.)" },
          meta: { type: Type.STRING, description: "Extra info like price, rating, or address if visible." },
        },
        required: ["name", "type"],
      },
    },
    // We return a map of ID -> Score. The keys are dynamic strings (folder IDs).
    confidenceScores: {
      type: Type.OBJECT,
      description: "Key-Value pair where Key is the Folder ID and Value is a number (0-1) representing confidence.",
      nullable: true
    },
    suggestedFolderId: {
      type: Type.STRING,
      description: "The ID of the folder that best matches the content based on the provided folder descriptions. Returns 'UNCATEGORIZED' if no good match found.",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5-7 relevant SEO tags for searchability.",
    },
  },
  required: ["visualDescription", "suggestedFolderId", "detectedEntities", "tags"],
};

export const analyzeImage = async (
    base64Image: string, 
    availableFolders: Folder[], 
    language: Language = 'es'
): Promise<AIAnalysis> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const ai = new GoogleGenAI({ apiKey });
    
    // Remove header if present
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    // Construct the context of available folders for the AI
    const folderContext = availableFolders.map(f => 
      `- Folder ID: "${f.id}"\n  Name: "${f.name}"\n  Description: "${f.description}"`
    ).join('\n\n');

    const langInstruction = language === 'es' 
      ? "RESPOND IN SPANISH (ESPAÑOL) for Description, Tags, and Entity details." 
      : "RESPOND IN ENGLISH.";

    const promptText = `
      Analyze this social media screenshot/image.
      
      I have the following folders organized by the user:
      ${folderContext}

      Task:
      1. Analyze the visual content and extracted text.
      2. Compare it against the definitions of the folders provided above.
      3. Assign the content to the BEST matching Folder ID.
      4. If the content does not fit well into ANY of the described folders (confidence < 0.6), return "UNCATEGORIZED" as the suggestedFolderId.
      5. Provide a confidence score (0.0 to 1.0) for each Folder ID in the confidenceScores object.

      ${langInstruction}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const result = JSON.parse(text);

    // Ensure confidenceScores exists even if AI omitted it
    if (!result.confidenceScores) {
        result.confidenceScores = {};
    }

    return result as AIAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return a fallback structure
    return {
      visualDescription: language === 'es' ? "Falló el análisis. Intente nuevamente." : "Analysis failed. Please try again.",
      extractedTexts: [],
      detectedEntities: [],
      confidenceScores: { 'UNCATEGORIZED': 1 },
      suggestedFolderId: 'UNCATEGORIZED',
      tags: [],
    };
  }
};
