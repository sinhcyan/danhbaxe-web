import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

export const analyzeRouteWithAI = async (input: string | { data: string, mimeType: string }): Promise<AIAnalysisResult | null> => {
  // STRICTLY use process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `You are a data extraction assistant for a Vietnamese transport listing app. 
  Analyze the input text or image (bus ticket, schedule, advertisement) to extract specific route information.
  
  Rules:
  1. Extract the Carrier Name (e.g., "Nhà xe Tuấn Anh").
  2. Identify the Origin (Departure) and Destination (Arrival).
  3. Identify the specific departure time (HH:mm). If multiple are listed, pick the first one.
  4. Extract the Price in VND as a pure number (e.g., 100000). Remove dots, commas, or 'k', 'đ'.
  5. List intermediate stops in the "intermediateStops" array.
  6. If the arrival time is not explicitly stated, leave it empty.
  7. Return strictly valid JSON matching the schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: typeof input === 'string' 
        ? input
        : { parts: [{ text: "Extract information from this image." }, { inlineData: input }] },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            carrierName: { type: Type.STRING, description: "Name of the transport carrier/company" },
            origin: { type: Type.STRING, description: "Departure location (City/District)" },
            departureTime: { type: Type.STRING, description: "Departure time in HH:mm. Pick the first one." },
            destination: { type: Type.STRING, description: "Arrival location (City/Province)" },
            arrivalTime: { type: Type.STRING, description: "Arrival time in HH:mm if available" },
            price: { type: Type.NUMBER, description: "Ticket price in VND (number only)" },
            intermediateStops: { 
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of major stops"
            }
          },
          required: ["carrierName", "origin", "destination"],
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as AIAnalysisResult;
    }
    return null;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};