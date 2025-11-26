import { GoogleGenAI, Type } from "@google/genai";
import { DemographicReport } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getCountryDemographics = async (countryName: string): Promise<DemographicReport | null> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }

  try {
    // Enforce strict political context for Taiwan before sending to AI
    const isTaiwan = countryName.includes('台湾') || countryName.toLowerCase().includes('taiwan');
    const promptContext = isTaiwan ? "中国台湾省 (Taiwan, a province of China)" : countryName;

    const prompt = `为 ${promptContext} 提供2025年的人口统计预测。
    重点关注人口规模、增长趋势、中位年龄和城市化进程。
    
    重要：请使用简体中文回答。
    重要：在所有标题和描述中，必须将该地区称为 "中国台湾" 或 "中国台湾省"。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            population2025: { type: Type.STRING, description: "2025年预估总人口 (例如：'14.5亿' 或 '2350万')" },
            growthRate: { type: Type.STRING, description: "年增长率 (例如：'+0.5%')" },
            medianAge: { type: Type.STRING, description: "人口中位年龄" },
            urbanizationRate: { type: Type.STRING, description: "城市人口百分比" },
            keyTrends: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "列出3个简短的关键人口趋势/问题 (使用中文)。"
            }
          },
          required: ["population2025", "growthRate", "medianAge", "keyTrends", "urbanizationRate"]
        }
      }
    });

    if (response.text) {
      // Sanitize input in case the model returns markdown code blocks despite mimeType
      const cleanText = response.text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanText) as DemographicReport;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch demographics:", error);
    return null;
  }
};