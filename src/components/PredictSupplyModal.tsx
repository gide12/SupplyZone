import React, { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem } from "../types";

// Initialize Gemini (Ensure process.env.GEMINI_API_KEY is available in the environment)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface PredictSupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

interface PredictionResult {
  itemName: string;
  predictedQuantity: string;
  reason: string;
}

export function PredictSupplyModal({ isOpen, onClose, menuItems }: PredictSupplyModalProps) {
  const [customers, setCustomers] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[] | null>(null);

  if (!isOpen) return null;

  const handlePredict = async () => {
    if (menuItems.length === 0) {
      alert("Please add some items to your menu first to get predictions.");
      return;
    }

    setLoading(true);
    setPredictions(null);

    const itemsContext = menuItems.map(
      (item) => `- ${item.name} (Current stock/qty notation: ${item.quantity || "unknown"})`
    ).join("\n");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `I run a restaurant and expect ${customers} customers this month. Given my menu items, predict the supply quantity I need to order for each item to serve them, and briefly explain why.\n\nMenu Items:\n${itemsContext}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                itemName: {
                  type: Type.STRING,
                  description: "The name of the menu item",
                },
                predictedQuantity: {
                  type: Type.STRING,
                  description: "The predicted quantity to order (e.g., '150 lbs', '20 packs')",
                },
                reason: {
                  type: Type.STRING,
                  description: "A short reason for the estimate",
                },
              },
              required: ["itemName", "predictedQuantity", "reason"],
            },
          },
        },
      });

      const text = response.text || "[]";
      const data: PredictionResult[] = JSON.parse(text);
      setPredictions(data);
    } catch (error) {
      console.error(error);
      alert("Failed to generate predictions. Check the console for more details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="game-panel w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[--color-gta-panel] gta-header sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 border border-purple-800 flex items-center justify-center shadow-none">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white shadow-none game-title">AI Supply Predictor</h2>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest game-text shadow-none drop-shadow-none">Estimate your monthly needs</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-transparent hover:bg-white/10 border border-white/20 text-gray-400 hover:text-white shadow-none transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-black/60 game-panel-inner mb-0">
          
          <div className="bg-black/40 p-5 border border-white/20 shadow-none mb-6">
            <label className="block text-xl text-gray-300 mb-3 game-text">
              Expected Customers (Per Month)
            </label>
            <div className="flex gap-4">
              <input 
                type="number" 
                className="flex-1 px-4 py-3 bg-black/60 border border-white/20 text-2xl font-bold text-white focus:outline-none focus:border-[#37B34A] game-text shadow-none"
                value={customers}
                onChange={(e) => setCustomers(parseInt(e.target.value) || 0)}
                min="1"
              />
              <button 
                onClick={handlePredict}
                disabled={loading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-black disabled:text-gray-500 text-white font-bold border border-purple-800 shadow-none transition-all flex items-center gap-2 game-text text-xl uppercase"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                {loading ? "Predicting..." : "Predict"}
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-400 font-bold game-text">
              Our AI will analyze your current menu ({menuItems.length} items) and estimate the required stock.
            </p>
          </div>

          {predictions && (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-2xl flex items-center gap-3 drop-shadow-none game-title mb-4">
                <Sparkles className="w-8 h-8 text-[#F1B51A] drop-shadow-none" />
                Predicted Needs
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {predictions.map((pred, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/20 text-left p-5 shadow-none">
                    <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-2">
                      <h4 className="font-bold text-white text-2xl game-text">{pred.itemName}</h4>
                      <span className="px-3 py-1 bg-transparent border border-[#37B34A] text-[#37B34A] text-xl font-bold shadow-none game-text">
                        {pred.predictedQuantity}
                      </span>
                    </div>
                    <p className="text-lg text-gray-300 font-bold leading-relaxed game-text">
                      {pred.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
