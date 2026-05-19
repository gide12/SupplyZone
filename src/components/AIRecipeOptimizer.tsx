import React, { useState } from "react";
import { X, ChefHat, Loader2, Youtube, ExternalLink, RefreshCw } from "lucide-react";
import { MenuItem } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

const env = (import.meta as any).env;
const ai = new GoogleGenAI({ apiKey: env.VITE_GEMINI_API_KEY || (process as any).env.GEMINI_API_KEY || "dummy" });

interface AIRecipeOptimizerProps {
  item: MenuItem;
  onClose: () => void;
  onUpdate: (updatedItem: Partial<MenuItem>) => void;
}

interface RecipeOption {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  referenceLinks: { title: string; url: string; platform: "Cookpad" | "YouTube" | "Lainnya" }[];
  estimatedCost: number;
  suggestedPrice: number;
}

export function AIRecipeOptimizer({ item, onClose, onUpdate }: AIRecipeOptimizerProps) {
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const prompt = `Berikan saya 2 variasi resep yang jauh lebih enak dan menarik untuk menu masakan/minuman bernama: "${item.name}".
Deskripsi saat ini: "${item.description}"
Harga saat ini: Rp ${item.price}

AI harus mencari/menyimulasikan sumber referensi resep populer dari platform seperti Cookpad atau YouTube.
Untuk setiap resep, berikan:
1. Nama variasi (misal: "Nasi Goreng Spesial ala Cookpad", dll)
2. Deskripsi singkat (menggugah selera)
3. Daftar bahan-bahan utama (ingredients)
4. Instruksi singkat (instructions)
5. referensi link (simulasi URL Cookpad/Youtube yang relevan) 
6. Estimasi Harga Pokok Produksi (estimatedCost)
7. Harga Jual yang Direkomendasikan (suggestedPrice)

PENTING: Output HARUS dalam format JSON valid sesuai schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recipes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                    instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    referenceLinks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          url: { type: Type.STRING },
                          platform: { type: Type.STRING }
                        },
                        required: ["title", "url", "platform"]
                      }
                    },
                    estimatedCost: { type: Type.NUMBER },
                    suggestedPrice: { type: Type.NUMBER },
                  },
                  required: ["name", "description", "ingredients", "instructions", "referenceLinks", "estimatedCost", "suggestedPrice"],
                }
              }
            },
            required: ["recipes"],
          },
        },
      });

      const text = response.text || "{}";
      const data = JSON.parse(text);
      if (data.recipes) {
        setRecipes(data.recipes);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Recipe generation failed:", err);
      const errorMessage = err?.message || err?.toString() || "";
      if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
        setError("Sistem AI sedang sibuk karena tingginya permintaan. Silakan coba lagi dalam beberapa saat.");
      } else {
        setError("Gagal menghasilkan resep alternatif. Silakan coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRecipe = (recipe: RecipeOption) => {
    onUpdate({
      name: recipe.name,
      description: recipe.description + "\\n\\nBahan-bahan: " + recipe.ingredients.join(", "),
      price: recipe.suggestedPrice
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ChefHat className="w-7 h-7 text-[#00AA13]" />
              Ubah/Cari Resep
            </h2>
            <p className="text-gray-500 mt-1">
              Temukan variasi resep yang lebih baik dari sumber terpercaya (Cookpad, YouTube) untuk <strong className="text-gray-900">{item.name}</strong>.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors shadow-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
              {error}
            </div>
          )}

          {recipes.length === 0 && !loading && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Simulasikan Resep Baru dengan AI</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                AI akan melakukan pencarian dan penyesuaian resep terbaik untuk menu ini berdasarkan tren dari Cookpad & YouTube.
              </p>
              <button
                onClick={fetchRecipes}
                className="bg-[#00AA13] hover:bg-[#009110] text-white px-6 py-3 rounded-full font-bold transition-all shadow-sm flex items-center justify-center gap-2 mx-auto"
              >
                <SparklesIcon className="w-5 h-5" />
                Cari & Sesuaikan Resep
              </button>
            </div>
          )}

          {loading && (
            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100">
              <Loader2 className="w-12 h-12 text-[#00AA13] animate-spin mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">AI Sedang Menyusun Resep...</h3>
              <p className="text-gray-500 text-sm">Menganalisis data dari Cookpad dan platform boga lainnya...</p>
            </div>
          )}

          {!loading && recipes.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-900 text-lg">Rekomendasi Resep (Berdasarkan Web/Video)</h3>
                <button
                  onClick={fetchRecipes}
                  className="text-[#00AA13] hover:text-[#009110] text-sm font-bold flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Regenerasi
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recipes.map((recipe, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                    <h4 className="text-xl font-bold text-[#00AA13] mb-2">{recipe.name}</h4>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3 flex-1">
                      {recipe.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-xs text-gray-500 block mb-1">Estimasi HPP</span>
                        <span className="font-bold text-gray-900">Rp {recipe.estimatedCost.toLocaleString()}</span>
                      </div>
                      <div className="bg-[#00AA13]/5 p-3 rounded-xl border border-[#00AA13]/20">
                        <span className="text-xs text-[#009110] block mb-1">Harga Jual Saran</span>
                        <span className="font-bold text-[#00AA13]">Rp {recipe.suggestedPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-bold text-sm text-gray-900 mb-2">Bahan Utama:</h5>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {recipe.ingredients.slice(0, 4).map((ing, i) => (
                          <li key={i} className="truncate">{ing}</li>
                        ))}
                        {recipe.ingredients.length > 4 && <li>dan {recipe.ingredients.length - 4} bahan lainnya...</li>}
                      </ul>
                    </div>

                    <div className="mb-6 space-y-2">
                       <h5 className="font-bold text-sm text-gray-900 mb-2">Referensi (Simulasi):</h5>
                       {recipe.referenceLinks.map((link, i) => (
                         <div key={i} className="flex items-center gap-2 text-xs">
                           {link.platform.toLowerCase() === 'youtube' ? <Youtube className="w-4 h-4 text-red-500" /> : <ChefHat className="w-4 h-4 text-orange-500" />}
                           <span className="text-gray-700 truncate max-w-[200px]">{link.title}</span>
                           <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 flex items-center gap-1 ml-auto">
                             Link <ExternalLink className="w-3 h-3" />
                           </a>
                         </div>
                       ))}
                    </div>

                    <button
                      onClick={() => handleApplyRecipe(recipe)}
                      className="w-full mt-auto py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-sm"
                    >
                      Gunakan Resep Ini
                    </button>
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

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}
