import { GoogleGenAI, Type } from "@google/genai";
import { AIMarketAnalysis, PatternStat, Session } from "../types";

// Assume process.env.VITE_GEMINI_API_KEY is configured in the environment.
const VITE_GEMINI_API_KEY = process.env.GOOGLE_VITE_GEMINI_API_KEY;

if (!VITE_GEMINI_API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: VITE_GEMINI_API_KEY! });

const marketAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        patterns: {
            type: Type.ARRAY,
            description: "List of identified candlestick patterns.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "e.g., 'Bullish Engulfing', 'Doji'" },
                    description: { type: Type.STRING, description: "A brief explanation of the pattern." },
                },
                 required: ["name", "description"],
            },
        },
        trend: {
            type: Type.OBJECT,
            description: "Market trend analysis for different timeframes.",
            properties: {
                "1m": { type: Type.STRING, description: "Trend for 1-minute timeframe." },
                "5m": { type: Type.STRING, description: "Trend for 5-minute timeframe." },
                "15m": { type: Type.STRING, description: "Trend for 15-minute timeframe." },
            },
            required: ["1m", "5m", "15m"],
        },
        prediction: {
            type: Type.OBJECT,
            description: "A concrete trade prediction based on the analysis.",
            properties: {
                direction: { type: Type.STRING, description: "'Uptrend', 'Downtrend', or 'Sideways'" },
                confidence: { type: Type.NUMBER, description: "Confidence percentage (0-100) for the prediction." },
                entry: { type: Type.STRING, description: "Suggested entry price level." },
                stopLoss: { type: Type.STRING, description: "Suggested stop-loss price level." },
                takeProfit: { type: Type.STRING, description: "Suggested take-profit price level." },
            },
            required: ["direction", "confidence", "entry", "stopLoss", "takeProfit"],
        },
    },
    required: ["patterns", "trend", "prediction"],
};

export const analyzeMarketImage = async (base64Image: string): Promise<AIMarketAnalysis> => {
    if (!VITE_GEMINI_API_KEY) throw new Error("API key is not configured.");
  
    const prompt = "Analyze this market chart screenshot. Identify key candlestick patterns, trend lines, and support/resistance levels. Provide trend predictions for 1m, 5m, and 15m timeframes. Based on your analysis, suggest a trade with entry, stop-loss, and take-profit levels, and include a confidence percentage. Respond in JSON format according to the provided schema.";

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, imagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: marketAnalysisSchema
        },
    });
    
    const jsonString = response.text.trim();
    try {
        return JSON.parse(jsonString) as AIMarketAnalysis;
    } catch (e) {
        console.error("Failed to parse Gemini response:", e);
        throw new Error("Received invalid JSON from AI analysis.");
    }
};

export const getPatternRecommendation = async (stats: PatternStat[]): Promise<string> => {
  if (!VITE_GEMINI_API_KEY) throw new Error("API key is not configured.");
  
  if (stats.length === 0) {
    return "Not enough data for a recommendation.";
  }

  const prompt = `Based on the following trade pattern performance data, recommend the most profitable and reliable pattern for the next trade. Consider both win rate (accuracy) and number of trades. Provide only the name of the recommended pattern.

  Data:
  ${JSON.stringify(stats, null, 2)}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text.trim();
};

export const generateSessionSummary = async (session: Session): Promise<string> => {
    if (!VITE_GEMINI_API_KEY) throw new Error("API key is not configured.");

    const tradeSummary = session.trades.map(t => 
        `- Trade #${t.tradeNumber}: Pattern '${t.pattern}', Result: ${t.result}, P/L: ${t.profitLoss.toFixed(2)} PKR`
    ).join('\n');

    const prompt = `Analyze the following trading session and provide a brief, insightful summary (2-3 sentences).
    
    **Session Data:**
    - Final Net Profit: ${session.netProfit.toFixed(2)} PKR
    - Total Trades: ${session.trades.length}
    - Wins: ${session.trades.filter(t => t.result === 'W').length}
    - Losses: ${session.trades.filter(t => t.result === 'L').length}

    **Trade Log:**
    ${tradeSummary}

    Your summary should highlight the overall performance, mention any notable patterns (either successful or unsuccessful), and provide a concluding thought or area for improvement. Be concise and encouraging.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text.trim();
};