import React, { useState, useRef } from "react";
import { Package, Trash2, Plus, BrainCircuit, Loader2, UploadCloud, Camera } from "lucide-react";
import { useAppContext } from "../store/AppContext";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function SupplierInventory() {
  const { activeSupplier, updateSupplierInventory, restaurants, calculateDynamicPrice } = useAppContext();
  const inventory = activeSupplier.inventory || [];

  const totalSpace = inventory.reduce((sum, item) => sum + (item.spaceUsed || 0), 0);
  const isExpired = (dateString: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newBasePrice, setNewBasePrice] = useState("");
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newQuantity || !newBasePrice || !newSpace || !newExp) return;

    const newItem = {
      id: `sinv-${Date.now()}`,
      name: newName,
      quantity: Number(newQuantity),
      basePrice: Number(newBasePrice),
      spaceUsed: Number(newSpace),
      expirationDate: newExp,
    };

    updateSupplierInventory(activeSupplier.id, [...inventory, newItem]);
    setNewName("");
    setNewQuantity("");
    setNewBasePrice("");
    setNewSpace("");
    setNewExp("");
  };

  const handleRemove = (id: string) => {
    updateSupplierInventory(activeSupplier.id, inventory.filter(i => i.id !== id));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      let contents: any[] = [];
      const prompt = `Extract inventory items from this document (image of receipt/invoice or CSV text). Provide a JSON array. For each item: name, quantity (number), basePrice (number, if not provided guess e.g. 5.0), spaceUsed (number in sqft, if not provided guess e.g. 1.0 or 0.5), and expirationDate (YYYY-MM-DD, if not provided guess e.g. 1-2 weeks from now).`;

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
                basePrice: { type: Type.NUMBER },
                spaceUsed: { type: Type.NUMBER },
                expirationDate: { type: Type.STRING, description: "YYYY-MM-DD" },
              },
              required: ["name", "quantity", "basePrice", "spaceUsed", "expirationDate"]
            }
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        const newItems = parsed.map((item: any) => ({
          id: `sinv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: item.name,
          quantity: item.quantity,
          basePrice: item.basePrice,
          spaceUsed: item.spaceUsed,
          expirationDate: item.expirationDate
        }));
        
        updateSupplierInventory(activeSupplier.id, [...inventory, ...newItems]);
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
      // Collect aggregate market menu items to find "dominant products"
      const allMenuNames = restaurants.flatMap(r => r.menu.map(m => m.name));
      
      const prompt = `
        As an AI Supplier Supply Chain Analyst, evaluate this supplier's inventory efficiency and market effectiveness.
        
        Current Supplier Inventory Data:
        ${JSON.stringify(inventory.map(i => ({ name: i.name, quantity: i.quantity, spaceUsed: i.spaceUsed, expirationDate: i.expirationDate, basePrice: i.basePrice })), null, 2)}
        
        Current Restaurants Market Demand (Menu items across all restaurants, indicating dominant items like Avocado Toast, Truffle Pasta, etc.):
        ${JSON.stringify(allMenuNames, null, 2)}
        
        Calculate:
        1. A score for Space Efficiency (0-100).
        2. A score for Market Effectiveness (0-100) based on how well the supplier's inventory matches the aggregate restaurant market demands.
        3. Capacity warnings (total space used vs typical warehouse max capacity).
        4. Expiration reminders (what expires soon and needs immediate liquidation).
        5. Dominant products analysis (how well inventory supports top market demands).
        6. Discount Recommendations: If there is a "Lot of stock" for an item but "Lower ordering" (low market demand based on menu), recommend a discount to increase orders for that item.
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
                    itemName: { type: Type.STRING },
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
      alert("Failed to analyze supplier inventory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-h-full overflow-y-auto">
      <h2 className="text-sm font-bold text-[#37B34A] uppercase tracking-wide mb-4 game-text border-b border-white/20 pb-1">Supplier Inventory & AI Engine</h2>

      <div className="flex flex-col gap-6">
        <div>
          <div className="game-panel-inner p-4 hover:border-white/20 transition-colors mb-6">
            <h3 className="font-bold text-lg text-white mb-3 game-text">Add Item</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                 <label className="block text-xs uppercase font-bold text-gray-400 mb-1 game-text">Item Name</label>
                 <input type="text" className="w-full bg-black/60 border border-white/20 text-white p-2 game-text focus:outline-none focus:border-[#37B34A]" placeholder="e.g., Avocado Toast" value={newName} onChange={e => setNewName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="block text-xs uppercase font-bold text-gray-400 mb-1 game-text">Quantity</label>
                   <input type="number" min="1" className="w-full bg-black/60 border border-white/20 text-white p-2 game-text focus:outline-none focus:border-[#37B34A]" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} required />
                </div>
                <div>
                   <label className="block text-xs uppercase font-bold text-gray-400 mb-1 game-text">Base Price ($)</label>
                   <input type="number" step="0.01" min="0" className="w-full bg-black/60 border border-white/20 text-white p-2 game-text focus:outline-none focus:border-[#37B34A]" value={newBasePrice} onChange={e => setNewBasePrice(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-bold text-gray-400 mb-1 game-text">Space Used (sq ft/pallet)</label>
                  <input type="number" step="0.1" className="w-full bg-black/60 border border-white/20 text-white p-2 game-text focus:outline-none" value={newSpace} onChange={e => setNewSpace(e.target.value)} placeholder="e.g. 5.5" required />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-gray-400 mb-1 game-text">Expiration Date</label>
                  <input type="date" className="w-full bg-black/60 border border-white/20 text-white p-2 game-text focus:outline-none" value={newExp} onChange={e => setNewExp(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="w-full py-2 game-btn game-btn-green text-white font-bold uppercase game-text mt-2 flex justify-center items-center gap-2"><Plus className="w-5 h-5"/> Add To Inventory</button>
            </form>

            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black/80 text-gray-400 font-bold game-text uppercase tracking-widest text-xs">OR AI AUTO-IMPORT</span>
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
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold uppercase game-text flex flex-col items-center justify-center gap-1 transition-colors border border-purple-400"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[10px]">Photo/Receipt</span>
              </button>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex-1 py-2 bg-[#1A92D4] hover:bg-[#1A92D4]/80 disabled:opacity-50 text-white font-bold uppercase game-text flex flex-col items-center justify-center gap-1 transition-colors border border-[#1A92D4]"
              >
                <UploadCloud className="w-5 h-5" />
                <span className="text-[10px]">Upload CSV/Excel</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-[#1A92D4]/10 border border-[#1A92D4] p-5 relative">
              <h3 className="font-bold text-[#1A92D4] text-xl game-title uppercase tracking-widest flex items-center gap-2 mb-4">
                 <BrainCircuit className="w-6 h-6" /> AI Logistics Engine
              </h3>
              <p className="game-text text-gray-300 text-sm mb-6 leading-relaxed">
                 Evaluate warehouse efficiency, market effectiveness against dominant products (Avocado Toast, etc.), and expiration warnings.
              </p>
              
              <button 
                onClick={handleAICalculation}
                disabled={loading || inventory.length === 0}
                className="w-full py-3 bg-[#1A92D4] hover:bg-[#1A92D4]/80 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold uppercase game-text text-lg flex items-center justify-center gap-2 transition-colors border border-[#1A92D4] mb-6"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                {loading ? "Analyzing Matrix..." : "Calculate Efficiency & Capacity"}
              </button>

              {aiReport && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/60 p-3 border border-white/10 text-center">
                      <div className="text-xs text-gray-500 font-bold uppercase tracking-widest game-text mb-1">Space Efficiency</div>
                      <div className="text-2xl font-bold text-white game-title">{aiReport.efficiencyScore}%</div>
                    </div>
                    <div className="bg-black/60 p-3 border border-white/10 text-center">
                      <div className="text-xs text-gray-500 font-bold uppercase tracking-widest game-text mb-1">Mkt Effectiveness</div>
                      <div className="text-2xl font-bold text-[#37B34A] game-title">{aiReport.effectivenessScore}%</div>
                    </div>
                  </div>

                  <div className="bg-black/60 p-4 border border-white/10">
                    <h4 className="text-sm font-bold text-gray-400 uppercase game-text mb-1">Capacity Status</h4>
                    <p className="text-white game-text leading-snug">{aiReport.capacityWarning}</p>
                  </div>

                  <div className="bg-black/60 p-4 border border-white/10 border-l-4 border-l-red-500">
                    <h4 className="text-sm font-bold text-red-500 uppercase game-text mb-2">Shelf-Life Reminders</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {aiReport.expirationReminders.map((rem, i) => (
                        <li key={i} className="text-white text-xs game-text">{rem}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-black/60 p-4 border border-white/10">
                    <h4 className="text-sm font-bold text-gray-400 uppercase game-text mb-1 flex justify-between">
                      <span>Dominant Market Sync</span>
                      <span className="text-xs text-[#1A92D4]">SALES DATA</span>
                    </h4>
                    <p className="text-white text-xs game-text leading-relaxed">{aiReport.dominantProductsAnalysis}</p>
                  </div>

                  <div className="bg-[#37B34A]/10 p-4 border border-[#37B34A]">
                    <h4 className="text-sm font-bold text-[#37B34A] uppercase game-text mb-1">AI Recommendation</h4>
                    <p className="text-white text-xs game-text italic">"{aiReport.actionableAdvice}"</p>
                  </div>

                  {aiReport.discountRecommendations && aiReport.discountRecommendations.length > 0 && (
                    <div className="bg-orange-500/10 p-4 border border-orange-500/50">
                      <h4 className="text-sm font-bold text-orange-500 uppercase game-text mb-3 flex items-center justify-between">
                         <span>Promotional Discounts</span>
                         <span className="text-[10px] bg-orange-500 text-black px-2 py-0.5 font-bold">INCREASE ORDERS</span>
                      </h4>
                      <div className="space-y-3">
                        {aiReport.discountRecommendations.map((rec, i) => (
                          <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black/40 p-3 border border-orange-500/30 gap-2">
                            <div className="flex-1">
                               <div className="text-white font-bold text-sm game-text">{rec.itemName}</div>
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

          <div className="space-y-3">
            <div className="flex justify-between items-end mb-4 border-b border-white/20 pb-1">
              <h3 className="text-sm font-bold text-[#37B34A] uppercase tracking-wide game-text">Current Stock</h3>
              <span className="text-gray-400 font-bold game-text text-sm">Total Space: {totalSpace.toFixed(1)} sqft</span>
            </div>
            {inventory.length === 0 ? (
              <div className="text-center py-6 text-gray-500 font-bold game-text italic">No inventory items.</div>
            ) : (
              inventory.map(item => {
                const dynamicInfo = calculateDynamicPrice(item.name);
                const percentage = totalSpace > 0 ? ((item.spaceUsed || 0) / totalSpace * 100).toFixed(1) : "0.0";
                const expired = isExpired(item.expirationDate || "");
                return (
                  <div key={item.id} className={`game-panel-inner p-4 flex justify-between items-center group relative border ${expired ? 'border-red-500/50' : 'border-white/10'}`}>
                    <div className="flex-1 w-full relative">
                      <div className="flex justify-between w-full items-start">
                         <h4 className="font-bold text-xl text-white game-text flex items-center gap-2">
                           {item.name}
                           {expired && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-widest">Expired</span>}
                         </h4>
                         <button onClick={() => handleRemove(item.id)} className="text-gray-500 hover:text-red-500 transition-colors z-10 shrink-0">
                           <Trash2 className="w-5 h-5" />
                         </button>
                      </div>
                      <div className="text-sm font-bold text-gray-400 game-text space-x-2 mt-1 flex flex-wrap gap-2">
                        <span>Base: ${item.basePrice.toFixed(2)}</span>
                        <span>|</span>
                        <span>Qty: {item.quantity}</span>
                        <span>|</span>
                        <span>Space: {item.spaceUsed || 'N/A'} sqft</span>
                      </div>
                      <div className="mt-2 text-xs font-bold text-[#1A92D4] uppercase game-text flex flex-col">
                        <span>Est. Market Price: ${dynamicInfo.estimatedPrice.toFixed(2)}</span>
                        <span className="text-[10px] text-gray-500 mb-2">(Demand: {dynamicInfo.marketDemand} | Supply: {dynamicInfo.marketSupply})</span>
                      </div>
                      <div className="mt-2 w-full bg-black/60 h-2 rounded overflow-hidden flex border border-white/10">
                         <div className="bg-[#1A92D4] h-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-1 items-center">
                         <div className={`text-xs font-bold game-text ${expired ? 'text-red-500' : 'text-red-400'}`}>Exp: {item.expirationDate || 'N/A'}</div>
                         <span className="text-[10px] text-gray-500 font-bold game-text">{percentage}% of Used Cap</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
