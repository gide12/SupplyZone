import React, { useState, useEffect } from "react";
import { X, TrendingUp, Loader2, DollarSign } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem, SupplierProfile } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface AIPricingOptimizerProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
  suppliers: SupplierProfile[];
}

interface IngredientCost {
  name: string;
  matchedSupplier: string;
  estimatedQuantity: string;
  cost: number;
}

interface PricingResult {
  productName: string;
  estimatedCogs: number;
  recommendedSellingPrice: number;
  profitMarginPercent: number;
  ingredients: IngredientCost[];
  supplierPricePrediction: string;
  analysis: string;
}

export function AIPricingOptimizer({ isOpen, onClose, menuItem, suppliers }: AIPricingOptimizerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PricingResult | null>(null);

  useEffect(() => {
    if (isOpen && menuItem) {
      handleAnalyze();
    }
  }, [isOpen, menuItem]);

  if (!isOpen || !menuItem) return null;

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);

    const supplierItems = suppliers.flatMap(s => s.inventory.map(i => ({
      supplier: s.name,
      itemName: i.name,
      price: i.basePrice,
      unit: i.unit || 'unit'
    })));

    const supplierDataStr = JSON.stringify(supplierItems, null, 2);

    const promptStr = `
Menu Item: ${menuItem.name}
Description: ${menuItem.description}
Current Selling Price: Rp ${menuItem.price.toLocaleString()}

Available Supplier Inventory & Prices:
${supplierDataStr}

Task:
1. Estimate the ingredients needed to make 1 portion of this menu item.
2. Match the ingredients with the "Available Supplier Inventory & Prices" to calculate the actual Cost of Goods Sold (COGS/HPP). If an ingredient is missing from the list, estimate its market cost reasonably.
3. Recommend a new Selling Price (Harga Jual) to ensure a safe cash flow and safety net (typically 30-70% margin depending on the item type).
4. Analyze the supplier prices and provide predictions/insights on price volatility for these ingredients. Make this and the cash flow analysis in Indonesian, keep it concise, clear, and straight to the point.
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an expert restaurant financial advisor and supply chain analyst. Analyzed the HPP (COGS) and recommend a selling price to ensure safe cash flow.
        
User Input:
${promptStr}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING, description: "Name of the menu item" },
              estimatedCogs: { type: Type.NUMBER, description: "Total estimated COGS (HPP) in Rp for 1 portion" },
              recommendedSellingPrice: { type: Type.NUMBER, description: "Recommended selling price in Rp" },
              profitMarginPercent: { type: Type.NUMBER, description: "Calculated profit margin percentage" },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    matchedSupplier: { type: Type.STRING, description: "Name of the supplier if matched, or 'Estimated Market' if not" },
                    estimatedQuantity: { type: Type.STRING, description: "Estimated quantity used per portion (e.g., '150g', '2 slices')" },
                    cost: { type: Type.NUMBER, description: "Estimated cost of this ingredient per portion in Rp" },
                  },
                  required: ["name", "matchedSupplier", "estimatedQuantity", "cost"]
                }
              },
              supplierPricePrediction: { type: Type.STRING, description: "Singkat, padat, dan jelas dalam Bahasa Indonesia: Prediksi harga pemasok dan volatilitas bahan-bahan ini." },
              analysis: { type: Type.STRING, description: "Singkat, padat, dan jelas dalam Bahasa Indonesia: Analisis cashflow dan alasan rekomendasi harga untuk safety net." }
            },
            required: ["productName", "estimatedCogs", "recommendedSellingPrice", "profitMarginPercent", "ingredients", "supplierPricePrediction", "analysis"],
          },
        },
      });

      const text = response.text;
      if (text) {
        const data: PricingResult = JSON.parse(text);
        setResult(data);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menganalisis harga jual. Cek konsol.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="game-panel w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00AA13] border border-[#00AA13] flex items-center justify-center shadow-sm">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 shadow-sm game-title">Optimasi Harga Jual</h2>
              <p className="text-sm font-bold text-gray-400 game-text shadow-sm drop-shadow-sm">{menuItem.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-400 hover:text-gray-900 shadow-sm transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 game-panel-inner mb-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="w-12 h-12 text-[#00AA13] animate-spin" />
              <p className="text-gray-500 font-bold game-text text-lg animate-pulse">Menghitung HPP & Profil Risiko Pemasok...</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              
              {/* Top Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-white p-5 border-l-4 border-[#EE2737] shadow-sm">
                    <p className="text-xs font-bold text-gray-400 game-text mb-1 uppercase tracking-wider">Est. HPP (Cost)</p>
                    <p className="text-3xl font-bold text-gray-900 game-title">Rp {result.estimatedCogs.toLocaleString()}</p>
                 </div>
                 <div className="bg-white p-5 border-l-4 border-[#00AA13] shadow-sm">
                    <p className="text-xs font-bold text-gray-400 game-text mb-1 uppercase tracking-wider">Rekomendasi Harga Jual</p>
                    <p className="text-3xl font-bold text-[#00AA13] game-title">Rp {result.recommendedSellingPrice.toLocaleString()}</p>
                 </div>
                 <div className="bg-white p-5 border-l-4 border-[#1A92D4] shadow-sm">
                    <p className="text-xs font-bold text-gray-400 game-text mb-1 uppercase tracking-wider">Margin Profit</p>
                    <p className="text-3xl font-bold text-[#1A92D4] game-title">{result.profitMarginPercent.toFixed(1)}%</p>
                 </div>
              </div>

              {/* COGS Breakdown */}
              <div className="bg-white border border-gray-200 shadow-sm">
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <h3 className="font-bold text-gray-900 text-lg game-title">Rincian Estimasi HPP (Berdasarkan Data Pemasok)</h3>
                </div>
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left game-text">
                    <thead>
                       <tr className="border-b border-gray-200 bg-white text-gray-500 text-xs uppercase">
                         <th className="p-3 font-bold">Bahan</th>
                         <th className="p-3 font-bold">Pemasok</th>
                         <th className="p-3 font-bold text-right">Kuantitas</th>
                         <th className="p-3 font-bold text-right">Estimasi Biaya</th>
                       </tr>
                    </thead>
                    <tbody className="bg-white">
                      {result.ingredients.map((ing, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-bold text-gray-700">{ing.name}</td>
                          <td className="p-3">
                             {ing.matchedSupplier === 'Estimated Market' ? (
                                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-bold">Harga Pasar</span>
                             ) : (
                                <span className="text-xs px-2 py-1 bg-[#1A92D4]/10 text-[#1A92D4] rounded font-bold">{ing.matchedSupplier}</span>
                             )}
                          </td>
                          <td className="p-3 text-right text-gray-500">{ing.estimatedQuantity}</td>
                          <td className="p-3 font-bold text-[#EE2737] text-right">Rp {ing.cost.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Analysis & Predictions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-[#00AA13]" />
                    <h3 className="font-bold text-gray-900 text-xl game-title">Analisis Cashflow & Safety Net</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed game-text">
                    {result.analysis}
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 p-5 shadow-sm bg-gradient-to-br from-white to-[#1A92D4]/5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-[#1A92D4]" />
                    <h3 className="font-bold text-gray-900 text-xl game-title">Prediksi Harga Pemasok</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed game-text">
                    {result.supplierPricePrediction}
                  </p>
                  <button 
                    onClick={onClose}
                    className="mt-6 w-full py-3 bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 font-bold shadow-sm transition-all text-sm game-text"
                  >
                    Tutup & Kembali ke Menu
                  </button>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
