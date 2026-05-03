import React, { useState, useRef } from "react";
import { Package, Trash2, Plus, BrainCircuit, Loader2, UploadCloud, Camera } from "lucide-react";
import { useAppContext } from "../store/AppContext";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function RestaurantInventory() {
  const { restaurants, activeRestaurantId, updateRestaurantInventory } = useAppContext();
  const restaurant = restaurants.find(r => r.id === activeRestaurantId);
  const inventory = restaurant?.inventory || [];

  const totalSpace = inventory.reduce((sum, item) => sum + (item.spaceUsed || 0), 0);
  const isExpired = (dateString: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newSpace, setNewSpace] = useState("");
  const [newExp, setNewExp] = useState("");

  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<{
    efficiencyScore: number;
    effectivenessScore: number;
    capacityWarning: string;
    expirationReminders: string[];
    dominantProductsAnalysis: string;
    actionableAdvice: string;
    discountRecommendations?: {
      itemName: string;
      suggestedDiscountPercentage: number;
      reason: string;
    }[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!restaurant) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newQuantity || !newSpace || !newExp) return;

    const newItem = {
      id: `rinv-${Date.now()}`,
      name: newName,
      quantity: Number(newQuantity),
      spaceUsed: Number(newSpace),
      expirationDate: newExp,
    };

    updateRestaurantInventory(restaurant.id, [...inventory, newItem]);
    setNewName("");
    setNewQuantity("");
    setNewSpace("");
    setNewExp("");
  };

  const handleRemove = (id: string) => {
    updateRestaurantInventory(restaurant.id, inventory.filter(i => i.id !== id));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      let contents: any[] = [];
      const prompt = `Extract inventory items from this document (image of receipt/invoice or CSV text). Provide a JSON array. For each item: name, quantity (number), spaceUsed (number in sqft, if not provided guess a tiny amount like 1.0 or 0.5), and expirationDate (YYYY-MM-DD, if not provided guess e.g. 1-2 weeks from now).`;

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
        });
        reader.readAsDataURL(file);
        const base64 = await base64Promise;
        contents = [
          prompt,
          { inlineData: { data: base64, mimeType: file.type } }
        ];
      } else {
        const text = await file.text();
        contents = [prompt + "\n\nFile Content:\n" + text];
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                spaceUsed: { type: Type.NUMBER },
                expirationDate: { type: Type.STRING, description: "YYYY-MM-DD" },
              },
              required: ["name", "quantity", "spaceUsed", "expirationDate"]
            }
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        const newItems = parsed.map((item: any) => ({
          id: `rinv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: item.name,
          quantity: item.quantity,
          spaceUsed: item.spaceUsed,
          expirationDate: item.expirationDate
        }));
        
        updateRestaurantInventory(restaurant.id, [...inventory, ...newItems]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to analyze uploaded file.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAICalculation = async () => {
    setLoading(true);
    try {
      const prompt = `
        As an AI Restaurant Supply Chain Analyst, evaluate this restaurant's inventory efficiency and effectiveness.
        
        Current Inventory Data:
        ${JSON.stringify(inventory, null, 2)}
        
        Current Menu Items (Dominance check - e.g. Avocado Toast, Truffle Pasta):
        ${JSON.stringify(restaurant.menu.map(m => m.name), null, 2)}
        
        Calculate:
        1. A score for Space Efficiency (0-100).
        2. A score for Effectiveness (0-100) based on how well inventory matches menu.
        3. Capacity warnings (total space used vs typical max).
        4. Expiration reminders (what expires soon).
        5. Dominant products analysis (how inventory supports top items like Avocado Toast/Truffle Pasta).
        6. Discount Recommendations: If there is a lot of stock for an ingredient but low sales/ordering of the associated menu item, recommend a discount on the menu item to increase orders and clear stock.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              efficiencyScore: { type: Type.NUMBER },
              effectivenessScore: { type: Type.NUMBER },
              capacityWarning: { type: Type.STRING },
              expirationReminders: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              dominantProductsAnalysis: { type: Type.STRING },
              actionableAdvice: { type: Type.STRING },
              discountRecommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    itemName: { type: Type.STRING, description: "The menu item to discount" },
                    suggestedDiscountPercentage: { type: Type.NUMBER },
                    reason: { type: Type.STRING }
                  },
                  required: ["itemName", "suggestedDiscountPercentage", "reason"]
                }
              }
            },
            required: ["efficiencyScore", "effectivenessScore", "capacityWarning", "expirationReminders", "dominantProductsAnalysis", "actionableAdvice", "discountRecommendations"]
          }
        }
      });

      if (response.text) {
        setAiReport(JSON.parse(response.text));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to analyze inventory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-panel p-6 border-t-4 border-[#00AA13]">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 game-text border-b border-gray-200 pb-2 ">
        <Package className="w-6 h-6 text-[#00AA13]" />
        Inventory Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="bg-white border border-gray-200 p-4 mb-6">
            <h3 className="font-bold text-gray-900 text-lg game-text mb-3  text-[#EE2737]">Add Ingredient</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-xs  font-bold text-gray-400 mb-1 game-text">Ingredient Name</label>
                <input type="text" className="w-full bg-white border border-gray-200 text-gray-900 p-2 game-text focus:outline-none focus:border-[#00AA13]" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Avocado" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs  font-bold text-gray-400 mb-1 game-text">Quantity</label>
                  <input type="number" className="w-full bg-white border border-gray-200 text-gray-900 p-2 game-text focus:outline-none" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} placeholder="e.g. 50" required />
                </div>
                <div>
                  <label className="block text-xs  font-bold text-gray-400 mb-1 game-text">Space Used (sq ft)</label>
                  <input type="number" step="0.1" className="w-full bg-white border border-gray-200 text-gray-900 p-2 game-text focus:outline-none" value={newSpace} onChange={e => setNewSpace(e.target.value)} placeholder="e.g. 2.5" required />
                </div>
              </div>
              <div>
                <label className="block text-xs  font-bold text-gray-400 mb-1 game-text">Expiration Date</label>
                <input type="date" className="w-full bg-white border border-gray-200 text-gray-900 p-2 game-text focus:outline-none" value={newExp} onChange={e => setNewExp(e.target.value)} required />
              </div>
              <button type="submit" className="w-full py-2 game-btn game-btn-green text-gray-900 font-bold  game-text mt-2 flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Add to Inventory
              </button>
            </form>
            
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400 font-bold game-text   text-xs">OR AI AUTO-IMPORT</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*,.csv,text/plain" 
                className="hidden" 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-gray-900 font-bold  game-text flex flex-col items-center justify-center gap-1 transition-colors border border-purple-400"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[10px]">Photo/Receipt</span>
              </button>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex-1 py-2 bg-[#EE2737] hover:bg-[#EE2737]/80 disabled:opacity-50 text-white font-bold  game-text flex flex-col items-center justify-center gap-1 transition-colors border border-[#EE2737]"
              >
                <UploadCloud className="w-5 h-5" />
                <span className="text-[10px]">Upload CSV/Excel</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end mb-2">
              <h3 className="font-bold text-gray-900 text-lg game-text ">Current Stock</h3>
              <span className="text-gray-400 font-bold game-text text-sm">Total Space: {totalSpace.toFixed(1)} sqft</span>
            </div>
            {inventory.length === 0 ? (
              <p className="text-gray-400 italic game-text">No inventory items. Add some above.</p>
            ) : (
              inventory.map((item) => {
                const percentage = totalSpace > 0 ? ((item.spaceUsed || 0) / totalSpace * 100).toFixed(1) : "0.0";
                const expired = isExpired(item.expirationDate || "");
                return (
                <div key={item.id} className={`bg-white border p-3 flex justify-between items-center group ${expired ? 'border-[#EE2737]/50' : 'border-gray-100'}`}>
                  <div className="flex-1 w-full relative">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 game-text text-lg flex items-center gap-2">
                        {item.name}
                        {expired && <span className="bg-[#EE2737] text-white text-[10px] px-2 py-0.5 rounded-sm  ">Expired</span>}
                      </h4>
                      <button onClick={() => handleRemove(item.id)} className="p-2 text-gray-400 hover:text-[#EE2737] hover:bg-white transition-all rounded z-10 shrink-0">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="text-sm font-bold text-gray-400 game-text flex flex-wrap gap-4 mt-1">
                      <span>Qty: {item.quantity}</span>
                      <span>Space: {item.spaceUsed} sqft</span>
                    </div>

                    <div className="mt-2 w-full bg-white h-2 rounded overflow-hidden flex border border-gray-100">
                       <div className="bg-[#EE2737] h-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1 items-center">
                       <div className={`text-xs font-bold game-text ${expired ? 'text-[#EE2737]' : 'text-[#EE2737]'}`}>Exp: {item.expirationDate}</div>
                       <span className="text-[10px] text-gray-400 font-bold game-text">{percentage}% of Used Cap</span>
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>

        <div>
          <div className="bg-[#EE2737]/10 border border-[#EE2737] p-5 h-full relative">
            <h3 className="font-bold text-[#EE2737] text-xl game-title   flex items-center gap-2 mb-4">
               <BrainCircuit className="w-6 h-6" /> AI Efficiency Engine
            </h3>
            <p className="game-text text-gray-700 text-sm mb-6 leading-relaxed">
               Run AI analysis to evaluate space usage, effectiveness in supporting dominant products (e.g. Avocado Toast), and get expiration warnings.
            </p>
            
            <button 
              onClick={handleAICalculation}
              disabled={loading || inventory.length === 0}
              className="w-full py-3 bg-[#EE2737] hover:bg-[#EE2737]/80 disabled:bg-gray-800 disabled:text-white text-gray-900 font-bold  game-text text-lg flex items-center justify-center gap-2 transition-colors border border-[#EE2737] mb-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
              {loading ? "Analyzing Matrix..." : "Calculate Efficiency & Capacity"}
            </button>

            {aiReport && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 border border-gray-100 text-center">
                    <div className="text-xs text-gray-400 font-bold   game-text mb-1">Efficiency</div>
                    <div className="text-2xl font-bold text-gray-900 game-title">{aiReport.efficiencyScore}%</div>
                  </div>
                  <div className="bg-white p-3 border border-gray-100 text-center">
                    <div className="text-xs text-gray-400 font-bold   game-text mb-1">Effectiveness</div>
                    <div className="text-2xl font-bold text-[#00AA13] game-title">{aiReport.effectivenessScore}%</div>
                  </div>
                </div>

                <div className="bg-white p-4 border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-400  game-text mb-1">Capacity Status</h4>
                  <p className="text-gray-900 game-text leading-snug">{aiReport.capacityWarning}</p>
                </div>

                <div className="bg-white p-4 border border-gray-100 border-l-4 border-l-red-500">
                  <h4 className="text-sm font-bold text-[#EE2737]  game-text mb-2">Expiration Reminders</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {aiReport.expirationReminders.map((rem, i) => (
                      <li key={i} className="text-gray-900 text-sm game-text">{rem}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-4 border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-400  game-text mb-1 flex justify-between">
                    <span>Dominant Products Sync</span>
                    <span className="text-xs text-[#EE2737]">SALES DATA</span>
                  </h4>
                  <p className="text-gray-900 text-sm game-text leading-relaxed">{aiReport.dominantProductsAnalysis}</p>
                </div>

                <div className="bg-[#00AA13]/10 p-4 border border-[#00AA13]">
                  <h4 className="text-sm font-bold text-[#00AA13]  game-text mb-1">AI Recommendation</h4>
                  <p className="text-gray-900 text-sm game-text italic">"{aiReport.actionableAdvice}"</p>
                </div>

                {aiReport.discountRecommendations && aiReport.discountRecommendations.length > 0 && (
                  <div className="bg-orange-500/10 p-4 border border-orange-500/50">
                    <h4 className="text-sm font-bold text-orange-500  game-text mb-3 flex items-center justify-between">
                       <span>Menu Discount Recommendations</span>
                       <span className="text-[10px] bg-orange-500 text-black px-2 py-0.5 font-bold">INCREASE ORDERS</span>
                    </h4>
                    <div className="space-y-3">
                      {aiReport.discountRecommendations.map((rec, i) => (
                        <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 border border-orange-500/30 gap-2">
                          <div className="flex-1">
                             <div className="text-gray-900 font-bold text-sm game-text">{rec.itemName}</div>
                             <div className="text-xs text-gray-400 game-text leading-snug">{rec.reason}</div>
                          </div>
                          <div className="text-orange-400 font-bold text-lg game-text whitespace-nowrap bg-orange-500/20 px-2 py-1 border border-orange-500/30 shrink-0">
                            -{rec.suggestedDiscountPercentage}% OFF
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
