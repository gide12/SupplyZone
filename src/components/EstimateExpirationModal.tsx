import React, { useState } from "react";
import { BrainCircuit, X, ThermometerSun, Snowflake, Loader2 } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface EstimateExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  onSelectDate: (date: string) => void;
}

export function EstimateExpirationModal({ isOpen, onClose, itemName, onSelectDate }: EstimateExpirationModalProps) {
  const [loading, setLoading] = useState(false);
  const [estimates, setEstimates] = useState<{
    roomTemp: { days: number; suggestion: string; date: string };
    chiller: { days: number; suggestion: string; date: string };
    freezer: { days: number; suggestion: string; date: string };
  } | null>(null);

  if (!isOpen) return null;

  const handlePredict = async () => {
    setLoading(true);
    try {
      const prompt = `
        You are an AI Food Safety & Warehouse Logistics Expert.
        Estimate the typical shelf life of the item: "${itemName}".
        
        Provide estimates for 3 storage conditions:
        1. Suhu Ruanganerature (Suhu Ruangan 20-25°C)
        2. Kulkas / Refrigerator (Kulkas 1-4°C)
        3. Pembeku (Pendingin <-18°C)

        For each condition, provide the estimated number of days it will last, and a brief suggestion in Indonesian (1 sentence).
        Today's date is: ${new Date().toISOString().split('T')[0]}.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              roomTemp: {
                type: Type.OBJECT,
                properties: {
                  days: { type: Type.NUMBER },
                  suggestion: { type: Type.STRING }
                },
                required: ["days", "suggestion"]
              },
              chiller: {
                type: Type.OBJECT,
                properties: {
                  days: { type: Type.NUMBER },
                  suggestion: { type: Type.STRING }
                },
                required: ["days", "suggestion"]
              },
              freezer: {
                type: Type.OBJECT,
                properties: {
                  days: { type: Type.NUMBER },
                  suggestion: { type: Type.STRING }
                },
                required: ["days", "suggestion"]
              }
            },
            required: ["roomTemp", "chiller", "freezer"]
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        
        const addDays = (days: number) => {
          const d = new Date();
          d.setDate(d.getDate() + days);
          return d.toISOString().split('T')[0];
        };

        setEstimates({
          roomTemp: { ...parsed.roomTemp, date: addDays(parsed.roomTemp.days) },
          chiller: { ...parsed.chiller, date: addDays(parsed.chiller.days) },
          freezer: { ...parsed.freezer, date: addDays(parsed.freezer.days) },
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to analyze expiration data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white max-w-lg w-full border border-gray-200 shadow-xl overflow-hidden rounded-xl animate-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-purple-600" />
            <h3 className="font-bold text-gray-900 game-text text-lg">AI Prediksi Masa Simpan</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
             <div className="text-sm font-bold text-gray-500 game-text mb-1 uppercase tracking-wider">Nama Barang</div>
             <div className="text-2xl font-bold text-gray-900 game-text">{itemName || "Tidak ada barang dipilih"}</div>
          </div>

          {!estimates ? (
            <button
              onClick={handlePredict}
              disabled={loading || !itemName}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:bg-gray-200 disabled:from-gray-200 disabled:to-gray-200 text-white font-bold game-text text-lg flex items-center justify-center gap-2 transition-all shadow-sm rounded-xl"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <BrainCircuit className="w-6 h-6" />}
              {loading ? "Menganalisis Parameter..." : "Prediksi Masa Simpan"}
            </button>
          ) : (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-400 game-text text-center border-b border-gray-100 pb-2">Pilih Metode Penyimpanan</h4>
              
              <button 
                onClick={() => { onSelectDate(estimates.roomTemp.date); onClose(); }}
                className="w-full p-4 border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors text-left flex gap-4 rounded-xl group relative overflow-hidden"
              >
                <div className="bg-orange-100 p-3 rounded-lg text-orange-600 group-hover:scale-110 transition-transform">
                  <ThermometerSun className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-orange-800 game-text text-lg flex justify-between">
                    Suhu Ruangan (20-25°C) <span className="text-orange-600">{estimates.roomTemp.days} Hari</span>
                  </div>
                  <div className="text-sm text-orange-600/80 font-bold game-text mt-1">{estimates.roomTemp.suggestion}</div>
                  <div className="text-xs text-orange-500 font-bold mt-2">Estimasi Tgl: {estimates.roomTemp.date}</div>
                </div>
              </button>

              <button 
                onClick={() => { onSelectDate(estimates.chiller.date); onClose(); }}
                className="w-full p-4 border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors text-left flex gap-4 rounded-xl group"
              >
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                  <Snowflake className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-blue-800 game-text text-lg flex justify-between">
                    Kulkas (1-4°C) <span className="text-blue-600">{estimates.chiller.days} Hari</span>
                  </div>
                  <div className="text-sm text-blue-600/80 font-bold game-text mt-1">{estimates.chiller.suggestion}</div>
                  <div className="text-xs text-blue-500 font-bold mt-2">Estimasi Tgl: {estimates.chiller.date}</div>
                </div>
              </button>

              <button 
                onClick={() => { onSelectDate(estimates.freezer.date); onClose(); }}
                className="w-full p-4 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors text-left flex gap-4 rounded-xl group"
              >
                <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600 group-hover:scale-110 transition-transform">
                  <Snowflake className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-indigo-800 game-text text-lg flex justify-between">
                    Pembeku (-18°C) <span className="text-indigo-600">{estimates.freezer.days} Hari</span>
                  </div>
                  <div className="text-sm text-indigo-600/80 font-bold game-text mt-1">{estimates.freezer.suggestion}</div>
                  <div className="text-xs text-indigo-500 font-bold mt-2">Estimasi Tgl: {estimates.freezer.date}</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
