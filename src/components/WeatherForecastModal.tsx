import React, { useState } from "react";
import { X, CloudRain, Sun, Loader2, Info } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { RestaurantInventoryItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface WeatherForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: RestaurantInventoryItem[];
}

interface ForecastResult {
  itemName: string;
  weatherCondition: string;
  expectedHarvestImpact: string;
  forecastedPriceChange: string;
  recommendation: string;
}

export function WeatherForecastModal({ isOpen, onClose, inventory }: WeatherForecastModalProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ForecastResult[] | null>(null);
  const [location, setLocation] = useState("South Sulawesi");
  const [weatherCondition, setWeatherCondition] = useState("Drought / El Nino");

  if (!isOpen) return null;

  const handlePredict = async () => {
    if (inventory.length === 0) {
      alert("Inventory is empty. Please add items to check prices.");
      return;
    }

    setLoading(true);
    setResults(null);

    const itemsContext = inventory.map(
      (inv) => `- ${inv.name} (${inv.quantity} ${inv.unit || 'units'})`
    ).join("\n");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `I have the following restaurant inventory ingredients:
${itemsContext}

Predict how the current forecasted weather (${weatherCondition}) in ${location} will affect the harvest, supply, and future prices for these ingredients. 
Output an array of objects for each ingredient discussing the weather condition, harvest impact, price change forecast, and business recommendation.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                itemName: {
                  type: Type.STRING,
                  description: "Name of the ingredient",
                },
                weatherCondition: {
                  type: Type.STRING,
                  description: "The specific weather condition considered (e.g. Drought, Heavy Rain)",
                },
                expectedHarvestImpact: {
                  type: Type.STRING,
                  description: "How harvest/supply is affected (e.g., Supply decrease, flooding destroys crops)",
                },
                forecastedPriceChange: {
                  type: Type.STRING,
                  description: "Forecast of the price (e.g., Increase 20-30%, Expected shortage)",
                },
                recommendation: {
                  type: Type.STRING,
                  description: "Actionable advice (e.g., Stockpile now, find alternative supplier)",
                },
              },
              required: ["itemName", "weatherCondition", "expectedHarvestImpact", "forecastedPriceChange", "recommendation"],
            },
          },
        },
      });

      const text = response.text || "[]";
      const data: ForecastResult[] = JSON.parse(text);
      setResults(data);
    } catch (error) {
      console.error(error);
      alert("Failed to generate forecast.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="game-panel w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-blue-500 shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 border border-blue-300 flex items-center justify-center">
              <CloudRain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 game-title text-blue-900">Cek Harga & Forecast</h2>
              <p className="text-sm font-bold text-blue-500 game-text">Weather-based Supply Chain Predictor</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white game-panel-inner mb-0">
          
          <div className="bg-gray-50 border border-gray-200 p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 game-text uppercase">Forecast Location</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-lg font-bold text-gray-900 focus:outline-none focus:border-blue-500 game-text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. South Sulawesi"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 game-text uppercase">Expected Weather Trend</label>
                <select 
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-lg font-bold text-gray-900 focus:outline-none focus:border-blue-500 game-text"
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value)}
                >
                  <option value="Drought / El Nino">Drought / El Nino</option>
                  <option value="Heavy Rain / La Nina">Heavy Rain / La Nina</option>
                  <option value="Flooding">Flooding</option>
                  <option value="Seasonal Transition (Pancaroba)">Seasonal Transition</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
               <div className="flex items-center gap-2 text-blue-600 text-sm font-bold game-text">
                  <Info className="w-4 h-4"/> Forecasts harvest disruptions and price surges.
               </div>
               <button 
                 onClick={handlePredict}
                 disabled={loading}
                 className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 text-white font-bold transition-all flex items-center gap-2 game-text text-lg"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (weatherCondition.includes('Rain') ? <CloudRain className="w-5 h-5" /> : <Sun className="w-5 h-5" />)}
                 {loading ? "Analyzing Nature..." : "Analyze Weather Impact"}
               </button>
            </div>
          </div>

          {results && (
            <div className="space-y-4">
              {results.map((res, idx) => (
                <div key={idx} className="bg-white border border-gray-200 text-left p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                    <div>
                       <h4 className="font-bold text-gray-900 text-2xl game-text">{res.itemName}</h4>
                       <span className="text-gray-500 text-sm font-bold game-text">Weather impact: {res.weatherCondition}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div className="bg-gray-50 p-3 border border-gray-100">
                        <span className="block text-[10px] text-gray-400 font-bold game-text uppercase mb-1">Harvest Impact</span>
                        <p className="text-gray-900 text-sm font-bold">{res.expectedHarvestImpact}</p>
                     </div>
                     <div className="bg-red-50 p-3 border border-red-100">
                        <span className="block text-[10px] text-red-400 font-bold game-text uppercase mb-1">Price Forecast</span>
                        <p className="text-red-900 text-sm font-bold">{res.forecastedPriceChange}</p>
                     </div>
                  </div>

                  <div className="bg-blue-50 p-3 border border-blue-100">
                    <span className="block text-[10px] text-blue-400 font-bold game-text uppercase mb-1">AI Recommendation</span>
                    <p className="text-blue-900 text-sm font-bold">"{res.recommendation}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
