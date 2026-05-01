import React, { useState } from "react";
import { X, Calculator, Loader2, Plus, Trash2 } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface AIMarginPredictorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ComponentCost {
  name: string;
  maxPrice: number;
  reason: string;
}

interface MarginPredictionResult {
  productName: string;
  targetMarginPercentage: number;
  recommendedSellingPrice: number;
  totalAllowedCost: number;
  componentCosts: ComponentCost[];
  analysis: string;
}

interface IngredientInput {
  id: string;
  name: string;
  quantity: string;
  price: string;
  isFixed: boolean;
}

export function AIMarginPredictor({ isOpen, onClose }: AIMarginPredictorProps) {
  const [margin, setMargin] = useState<string>("10");
  const [productName, setProductName] = useState<string>("Avocado Toast");
  const [productQuantity, setProductQuantity] = useState<string>("100");
  const [productRevenue, setProductRevenue] = useState<string>("1500");

  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { id: "1", name: "Sourdough", quantity: "20", price: "", isFixed: false },
    { id: "2", name: "Smashed avocado", quantity: "35", price: "", isFixed: false },
    { id: "3", name: "Poached egg", quantity: "70", price: "180", isFixed: true },
  ]);

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<MarginPredictionResult | null>(null);

  if (!isOpen) return null;

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now().toString(), name: "", quantity: "", price: "", isFixed: false }
    ]);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const handleIngredientChange = (id: string, field: keyof IngredientInput, value: any) => {
    setIngredients(ingredients.map(ing => ing.id === id ? { ...ing, [field]: value } : ing));
  };

  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null);

    const promptStr = `
Scenario:
Product: ${productQuantity}x ${productName}
Estimated Total Revenue (Selling Price): $${productRevenue}
Target Profit Margin: ${margin}%

Ingredients needed:
${ingredients.map(ing => `- ${ing.quantity}x ${ing.name}: ${ing.isFixed ? `Locked at $${ing.price}` : 'Variable (Calculate Max Allowed Price)'}`).join("\n")}

Please calculate the maximum allowed price for the variable ingredients to ensure we hit the ${margin}% target margin based on the estimated revenue, accounting for the locked costs.
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `You are an expert restaurant financial analyst and supply chain manager. I will describe a product, its ingredients, and current or changed costs. Your goal is to analyze the costs and output the maximum price I can pay for variable ingredients to maintain the requested profit margin, along with a detailed explanation.

User Input:
${promptStr}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: {
                type: Type.STRING,
                description: "Name of the product being analyzed (e.g., 100 Avocado Toast)",
              },
              targetMarginPercentage: {
                type: Type.NUMBER,
                description: "The requested margin percentage (e.g., 10)",
              },
              recommendedSellingPrice: {
                type: Type.NUMBER,
                description: "The estimated total revenue or selling price of the batch",
              },
              totalAllowedCost: {
                type: Type.NUMBER,
                description: "The maximum total cost allowed to hit the target margin",
              },
              componentCosts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the supply item (e.g., Sourdough, Smashed Avocado)" },
                    maxPrice: { type: Type.NUMBER, description: "Calculated maximum price to pay for this batch/amount to keep margin relative to other fixed costs. If cost is locked, output the locked cost." },
                    reason: { type: Type.STRING, description: "Brief explanation of how this max price was derived." },
                  },
                  required: ["name", "maxPrice", "reason"],
                },
              },
              analysis: {
                type: Type.STRING,
                description: "A comprehensive summary of the margin calculation.",
              },
            },
            required: ["productName", "targetMarginPercentage", "recommendedSellingPrice", "totalAllowedCost", "componentCosts", "analysis"],
          },
        },
      });

      const text = response.text;
      if (text) {
        const data: MarginPredictionResult = JSON.parse(text);
        setPrediction(data);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to analyze margin. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="game-panel w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[--color-gta-panel] gta-header sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A92D4] border border-[#1A92D4] flex items-center justify-center shadow-none">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white shadow-none game-title">AI Margin Calculator</h2>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest game-text shadow-none drop-shadow-none">Dynamic Pricing & Target Margins</p>
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
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                 <label className="block text-xs uppercase font-bold text-gray-400 mb-1 game-text">Product Name</label>
                 <input type="text" className="w-full bg-black/60 border border-white/20 text-white p-2 game-text focus:outline-none focus:border-[#1A92D4]" value={productName} onChange={e => setProductName(e.target.value)} placeholder="Avocado Toast" />
              </div>
              <div>
                 <label className="block text-xs uppercase font-bold text-gray-400 mb-1 game-text">Quantity (e.g. 100)</label>
                 <input type="number" className="w-full bg-black/60 border border-white/20 text-white p-2 game-text focus:outline-none focus:border-[#1A92D4]" value={productQuantity} onChange={e => setProductQuantity(e.target.value)} placeholder="100" />
              </div>
              <div>
                 <label className="block text-xs uppercase font-bold text-gray-400 mb-1 game-text">Est. Revenue ($)</label>
                 <input type="number" className="w-full bg-black/60 border border-white/20 text-white p-2 game-text focus:outline-none focus:border-[#1A92D4]" value={productRevenue} onChange={e => setProductRevenue(e.target.value)} placeholder="1000" />
              </div>
              <div>
                 <label className="block text-xs uppercase font-bold text-[#37B34A] mb-1 game-text">Target Margin (%)</label>
                 <input type="number" className="w-full bg-black/60 border border-[#37B34A] text-[#37B34A] p-2 game-text focus:outline-none focus:bg-[#37B34A]/10 font-bold" value={margin} onChange={e => setMargin(e.target.value)} placeholder="10" />
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-white text-lg game-text uppercase">Ingredients List</h3>
              <button onClick={handleAddIngredient} className="flex items-center gap-1 text-xs uppercase font-bold text-[#1A92D4] hover:text-white transition-colors">
                <Plus className="w-4 h-4" /> Add Ingredient
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {ingredients.map((ing, idx) => (
                <div key={ing.id} className="flex flex-col sm:flex-row gap-3 items-end p-3 border border-white/10 bg-black/40 relative">
                  <div className="w-full sm:w-1/3">
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 game-text">Ingredient Name</label>
                    <input type="text" className="w-full bg-black/60 border border-white/20 text-white p-2 text-sm game-text focus:outline-none focus:border-[#1A92D4]" value={ing.name} onChange={e => handleIngredientChange(ing.id, 'name', e.target.value)} placeholder="Sourdough" />
                  </div>
                  <div className="w-full sm:w-1/4">
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 game-text">Quantity Req.</label>
                    <input type="text" className="w-full bg-black/60 border border-white/20 text-white p-2 text-sm game-text focus:outline-none focus:border-[#1A92D4]" value={ing.quantity} onChange={e => handleIngredientChange(ing.id, 'quantity', e.target.value)} placeholder="20" />
                  </div>
                  <div className="w-full sm:w-1/4">
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 game-text">Price ($)</label>
                    <input type="number" disabled={!ing.isFixed} className="w-full bg-black/60 border border-white/20 text-white p-2 text-sm game-text focus:outline-none focus:border-[#1A92D4] disabled:opacity-50" value={ing.price} onChange={e => handleIngredientChange(ing.id, 'price', e.target.value)} placeholder="Calculate" />
                  </div>
                  <div className="w-full sm:w-auto flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer pt-2 sm:pt-0">
                      <input type="checkbox" checked={ing.isFixed} onChange={e => handleIngredientChange(ing.id, 'isFixed', e.target.checked)} className="w-4 h-4 accent-[#1A92D4]" />
                      <span className="text-[10px] uppercase font-bold text-gray-400 game-text">Fixed Price?</span>
                    </label>
                    <button onClick={() => handleRemoveIngredient(ing.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors pt-2 sm:pt-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handlePredict}
              disabled={loading || !productName || !margin}
              className="w-full px-8 py-4 bg-[#1A92D4] hover:bg-[#1A92D4]/80 disabled:bg-black disabled:text-gray-500 text-white font-bold border border-[#1A92D4] shadow-none transition-all flex justify-center items-center gap-2 game-text text-xl uppercase"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Calculator className="w-6 h-6" />}
              {loading ? "Calculating Models..." : "Run Margin AI"}
            </button>
          </div>

          {prediction && (
            <div className="space-y-6">
              
              <div className="bg-black/40 border border-white/20 p-1 shadow-none overflow-hidden">
                 <div className="bg-[#1A92D4]/10 border-b border-[#1A92D4] p-4 flex justify-between items-center">
                    <h3 className="font-bold text-[#1A92D4] text-xl game-title uppercase tracking-widest">
                       Financial Projection Summary
                    </h3>
                    <span className="text-[#1A92D4] font-bold game-text text-sm border border-[#1A92D4] px-2 py-0.5 uppercase">Pro Forma</span>
                 </div>
                 
                 <table className="w-full text-left game-text">
                   <tbody>
                     <tr className="border-b border-white/10">
                       <td className="p-4 font-bold text-gray-300">ESTIMATED REVENUE <span className="text-sm font-normal text-gray-500 break-words line-clamp-1">({prediction.productName})</span></td>
                       <td className="p-4 font-bold text-white text-right text-xl">${prediction.recommendedSellingPrice.toFixed(2)}</td>
                     </tr>
                     <tr className="border-b border-white/10 bg-black/40">
                       <td className="p-4 font-bold text-gray-300 pl-8">Less: Max Allowed COGS</td>
                       <td className="p-4 font-bold text-red-400 text-right text-xl">-${prediction.totalAllowedCost.toFixed(2)}</td>
                     </tr>
                     
                     {/* Breakdown of COGS */}
                     {prediction.componentCosts.map((comp, idx) => (
                       <tr key={idx} className="border-b border-dashed border-white/5 bg-black/20 text-sm">
                         <td className="p-3 pl-12 text-gray-400">
                           <div className="font-bold text-white mb-1">{comp.name}</div>
                           <div className="text-xs text-gray-500">{comp.reason}</div>
                         </td>
                         <td className="p-3 font-bold text-[#F1B51A] text-right align-top">
                           Max: ${comp.maxPrice.toFixed(2)}
                         </td>
                       </tr>
                     ))}

                     <tr className="border-b-2 border-white/20">
                       <td className="p-4 font-bold text-[#37B34A] uppercase text-lg">Target Profit <span className="text-sm font-normal text-gray-500">({prediction.targetMarginPercentage}% Margin)</span></td>
                       <td className="p-4 font-bold text-[#37B34A] text-right text-2xl">
                         ${(prediction.recommendedSellingPrice - prediction.totalAllowedCost).toFixed(2)}
                       </td>
                     </tr>

                   </tbody>
                 </table>
              </div>

              <div className="bg-black/40 border border-white/20 p-5 shadow-none">
                <h3 className="font-bold text-white text-xl game-title mb-3">AI Analysis</h3>
                <p className="text-lg text-gray-300 font-bold leading-relaxed game-text">
                  {prediction.analysis}
                </p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
