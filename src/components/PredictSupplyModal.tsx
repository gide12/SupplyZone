import React, { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem, RestaurantInventoryItem } from "../types";

// Initialize Gemini (Ensure process.env.GEMINI_API_KEY is available in the environment)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface PredictSupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  inventory: RestaurantInventoryItem[];
}

interface PredictionResult {
  itemName: string;
  predictedQuantity: string;
  capacityPercentage: number;
  expiredAlert: string;
  reason: string;
}

export function PredictSupplyModal({ isOpen, onClose, menuItems, inventory }: PredictSupplyModalProps) {
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

    const inventoryContext = inventory.map(
      (inv) => `- ${inv.name}: ${inv.quantity} units, Space Used: ${inv.spaceUsed} sqft, Expires: ${inv.expirationDate}`
    ).join("\n");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `I run a restaurant and expect ${customers} customers this month. Given my menu items and current inventory, predict the supply quantity I need to order for each item to serve them. Also include capacity usage percentage for each item ordered (relative to space used) and alert regarding expiring/expired items so I never run out of stock or have out of expired ingredients.

Menu Items:
${itemsContext}

Current Inventory:
${inventoryContext || "None"}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                itemName: {
                  type: Type.STRING,
                  description: "The name of the menu item or ingredient",
                },
                predictedQuantity: {
                  type: Type.STRING,
                  description: "The predicted quantity to order (e.g., '150 lbs', '20 packs')",
                },
                capacityPercentage: {
                  type: Type.NUMBER,
                  description: "Percentage of inventory capacity this order will take up (0-100)"
                },
                expiredAlert: {
                  type: Type.STRING,
                  description: "Alert text regarding expiration, e.g. 'Expires in 3 days' or 'OK'"
                },
                reason: {
                  type: Type.STRING,
                  description: "A short reason for the estimate",
                },
              },
              required: ["itemName", "predictedQuantity", "capacityPercentage", "expiredAlert", "reason"],
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
    <div className="fixed inset-0 bg-white backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="game-panel w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[--color-gta-panel]  sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 border border-purple-800 flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 shadow-sm game-title">AI Supply Predictor</h2>
              <p className="text-sm font-bold text-gray-400   game-text shadow-sm drop-shadow-sm">Estimate your monthly needs</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white hover:bg-white/10 border border-gray-200 text-gray-400 hover:text-gray-900 shadow-sm transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white game-panel-inner mb-0">
          
          <div className="bg-white p-5 border border-gray-200 shadow-sm mb-6">
            <label className="block text-xl text-gray-700 mb-3 game-text">
              Expected Customers (Per Month)
            </label>
            <div className="flex gap-4">
              <input 
                type="number" 
                className="flex-1 px-4 py-3 bg-white border border-gray-200 text-2xl font-bold text-gray-900 focus:outline-none focus:border-[#00AA13] game-text shadow-sm"
                value={customers}
                onChange={(e) => setCustomers(parseInt(e.target.value) || 0)}
                min="1"
              />
              <button 
                onClick={handlePredict}
                disabled={loading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-white disabled:text-gray-400 text-gray-900 font-bold border border-purple-800 shadow-sm transition-all flex items-center gap-2 game-text text-xl "
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
              <h3 className="font-bold text-gray-900 text-2xl flex items-center gap-3 drop-shadow-sm game-title mb-4">
                <Sparkles className="w-8 h-8 text-[#F1B51A] drop-shadow-sm" />
                Predicted Needs
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {predictions.map((pred, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 text-left p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
                      <div className="flex gap-2 items-center">
                         <h4 className="font-bold text-gray-900 text-2xl game-text">{pred.itemName}</h4>
                         {pred.expiredAlert && pred.expiredAlert !== 'OK' && (
                           <span className="bg-[#EE2737]/20 text-[#EE2737] text-xs px-2 py-1 font-bold border border-[#EE2737]/50">
                             {pred.expiredAlert}
                           </span>
                         )}
                      </div>
                      <span className="px-3 py-1 bg-white border border-[#00AA13] text-[#00AA13] text-xl font-bold shadow-sm game-text">
                        {pred.predictedQuantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 mb-3 bg-white p-2 border border-gray-100">
                       <span className="text-gray-400 font-bold  text-xs game-text">Capacity Utilization</span>
                       <span className={`font-bold game-text ${pred.capacityPercentage > 80 ? 'text-[#EE2737]' : 'text-[#00AA13]'}`}>
                          {pred.capacityPercentage}%
                       </span>
                    </div>
                    <p className="text-lg text-gray-700 font-bold leading-relaxed game-text">
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
