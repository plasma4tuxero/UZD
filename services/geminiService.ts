
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, Language, Folder } from "../types";

// Dynamic schema generation is complex with strict types, so we use a more generic output schema 
// and handle validation in the application logic.
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    visualDescription: {
      type: Type.STRING,
      description: "Title or concise summary of the content (e.g., 'Chocolate Muffin Recipe', 'React Tutorial').",
    },
    extractedTexts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Extracted details like Ingredients, Steps, or Key Points from the content.",
    },
    transcription: {
      type: Type.STRING,
      description: "A simulated transcription of the audio content if applicable (e.g. for videos).",
    },
    detectedEntities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING, description: "Type of entity (Product, Place, Technology, Actor, Author, etc.)" },
          meta: { type: Type.STRING, description: "Extra info like price, rating, address, or username." },
        },
        required: ["name", "type"],
      },
    },
    confidenceScores: {
      type: Type.ARRAY,
      description: "List of confidence scores for each folder.",
      items: {
          type: Type.OBJECT,
          properties: {
              folderId: { type: Type.STRING },
              score: { type: Type.NUMBER }
          },
          required: ["folderId", "score"]
      }
    },
    suggestedFolderId: {
      type: Type.STRING,
      description: "The ID of the folder that best matches the content. Returns 'UNCATEGORIZED' if no match.",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5-7 relevant SEO tags.",
    },
  },
  required: ["visualDescription", "suggestedFolderId", "detectedEntities", "tags"],
};

export const analyzeContent = async (
    url: string,
    base64Image: string | null,
    availableFolders: Folder[], 
    language: Language = 'es'
): Promise<AIAnalysis> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct the context of available folders for the AI
    const folderContext = availableFolders.map(f => 
      `- Folder ID: "${f.id}"\n  Name: "${f.name}"\n  Description: "${f.description}"`
    ).join('\n\n');

    const langInstruction = language === 'es' 
      ? "RESPOND IN SPANISH (ESPAÑOL) for Description, Transcription, Tags, and Entity details." 
      : "RESPOND IN ENGLISH.";

    let promptText = "";
    let parts: any[] = [];

    if (base64Image) {
        // Image Analysis Logic
        const cleanBase64 = base64Image.split(',')[1] || base64Image;
        promptText = `
          Analyze this social media screenshot/image.
          
          Folders Context:
          ${folderContext}

          Task:
          1. Analyze the visual content.
          2. Assign to BEST matching Folder ID based on description.
          3. If confidence < 0.6, use "UNCATEGORIZED".
          4. Extract text and entities.

          ${langInstruction}
        `;
        parts = [
            { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
            { text: promptText }
        ];
    } else {
        // URL/Text Analysis Logic (Simulation)
        promptText = `
          Analyze this URL content: "${url}"
          
          Since I cannot browse the live web, analyze the URL structure, keywords, and imply the likely content.
          Simulate a scraping result for this link. 
          
          Folders Context:
          ${folderContext}

          Task:
          1. Generate a likely "Title" for this content (put in visualDescription).
          2. Extract/Simulate likely Author, Ingredients (if food), Steps (if tutorial), or Key Points (put in extractedTexts).
          3. Simulate a short "Audio Transcription" if it seems like a video (put in transcription).
          4. Assign to BEST matching Folder ID.
          5. If confidence < 0.6, use "UNCATEGORIZED".

          ${langInstruction}
        `;
        parts = [{ text: promptText }];
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const rawResult = JSON.parse(text);

    // Transform array back to object for app consumption
    const confidenceScoresRecord: Record<string, number> = {};
    if (Array.isArray(rawResult.confidenceScores)) {
        rawResult.confidenceScores.forEach((item: any) => {
            if (item.folderId && typeof item.score === 'number') {
                confidenceScoresRecord[item.folderId] = item.score;
            }
        });
    }

    const result: AIAnalysis = {
        ...rawResult,
        confidenceScores: confidenceScoresRecord
    };

    return result;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      visualDescription: language === 'es' ? "Análisis fallido. URL procesada sin datos." : "Analysis failed. URL processed with no data.",
      extractedTexts: [],
      detectedEntities: [],
      confidenceScores: { 'UNCATEGORIZED': 1 },
      suggestedFolderId: 'UNCATEGORIZED',
      tags: [],
      transcription: ""
    };
  }
};
