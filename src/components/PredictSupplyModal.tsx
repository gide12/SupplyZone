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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">AI Supply Predictor</h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimate your monthly needs</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Expected Customers (Per Month)
            </label>
            <div className="flex gap-3">
              <input 
                type="number" 
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={customers}
                onChange={(e) => setCustomers(parseInt(e.target.value) || 0)}
                min="1"
              />
              <button 
                onClick={handlePredict}
                disabled={loading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-300 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {loading ? "Predicting..." : "Predict"}
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Our AI will analyze your current menu ({menuItems.length} items) and estimate the required stock.
            </p>
          </div>

          {predictions && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Predicted Needs
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {predictions.map((pred, idx) => (
                  <div key={idx} className="bg-white border text-left border-purple-100 p-4 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">{pred.itemName}</h4>
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold border border-purple-100">
                        {pred.predictedQuantity}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
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
