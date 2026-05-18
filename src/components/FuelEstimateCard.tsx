import React, { useState } from "react";
import { Fuel, Loader2, Navigation, AlertCircle, Clock, Map } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { Restaurant } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface FuelEstimateCardProps {
  restaurant: Restaurant;
  supplierLocation: [number, number];
}

interface RouteOption {
  routeName: string;
  distance: string;
  duration: string;
  estimatedCost: string;
  trafficStatus: "Lancar" | "Sedang" | "Padat";
  routeNotes: string;
}

interface FuelEstimate {
  routes: RouteOption[];
  recommendation: string;
}

export function FuelEstimateCard({ restaurant, supplierLocation }: FuelEstimateCardProps) {
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<FuelEstimate | null>(null);

  const fetchEstimate = async () => {
    setLoading(true);
    try {
      const prompt = `Saya adalah mitra pemasok (driver) di koordinat ${supplierLocation[0]}, ${supplierLocation[1]}. 
Tujuan pengiriman ke restoran "${restaurant.name}" di koordinat ${restaurant.lat}, ${restaurant.lng}. 

Sebagai AI Logistik Pintar bergaya aplikasi mapping/ride-hailing, berikan 2 hingga 3 opsi rute alternatif yang efektif dan efisien (misal: Rute Utama/Tol, Rute Jalan Arteri Bebas Tol, atau Rute Alternatif).
Untuk setiap rute, berikan perkiraan jarak tempuh, durasi, taksiran biaya BBM/Total (format Rupiah), potensi kepadatan lalu lintas (Lancar/Sedang/Padat), dan catatan singkat mengenai rute tersebut pada jam sibuk/jam ini.
Berikan juga "recommendation" satu kalimat mengenai rute terbaik dari pilihan tersebut.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              routes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    routeName: { type: Type.STRING, description: "Nama jalur, misalnya 'Via Tol Dalam Kota' atau 'Jalan Nasional'" },
                    distance: { type: Type.STRING, description: "Jarak (misal: '12.5 km')" },
                    duration: { type: Type.STRING, description: "Durasi (misal: '35 menit')" },
                    estimatedCost: { type: Type.STRING, description: "Biaya BBM/Tol (misal: 'Rp 25.000')" },
                    trafficStatus: { type: Type.STRING, description: "Harus satu dari: 'Lancar', 'Sedang', 'Padat'" },
                    routeNotes: { type: Type.STRING, description: "Catatan rute (maks 2 kalimat)" },
                  },
                  required: ["routeName", "distance", "duration", "estimatedCost", "trafficStatus", "routeNotes"],
                }
              },
              recommendation: { type: Type.STRING, description: "Rekomendasi rute terbaik (maks 2 kalimat)" },
            },
            required: ["routes", "recommendation"],
          },
        },
      });

      const text = response.text || "{}";
      const data = JSON.parse(text) as FuelEstimate;
      setEstimate(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengestimasi rute. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm mb-4 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <Navigation className="w-5 h-5 text-[#00AA13]" />
          Analisis Rute AI Pintar
        </h3>
        {!estimate && !loading && (
          <button 
            onClick={fetchEstimate}
            className="text-sm px-4 py-2 bg-[#00AA13] text-white hover:bg-[#00AA13]/90 rounded-full font-bold transition-all"
          >
            Cari Rute Terbaik
          </button>
        )}
        {loading && (
          <span className="text-sm px-4 py-2 bg-gray-100 text-[#00AA13] rounded-full font-bold flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Menganalisis Lalu Lintas...
          </span>
        )}
      </div>

      {estimate && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="bg-blue-50/80 border border-blue-100 p-4 rounded-xl flex gap-3 text-sm text-blue-900">
            <AlertCircle className="w-5 h-5 shrink-0 text-blue-600" />
            <p className="leading-relaxed"><strong>Saran AI:</strong> {estimate.recommendation}</p>
          </div>

          <div className="space-y-3 mt-4">
            {estimate.routes.map((route, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-white hover:border-[#00AA13]/30 hover:shadow-sm transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-gray-900">{route.routeName}</h4>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                    route.trafficStatus === 'Lancar' ? 'bg-[#00AA13]/10 text-[#00AA13]' :
                    route.trafficStatus === 'Sedang' ? 'bg-[#F1B51A]/10 text-[#F1B51A]' :
                    'bg-[#EE2737]/10 text-[#EE2737]'
                  }`}>
                    {route.trafficStatus}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-white rounded-lg p-2 flex flex-col items-center justify-center border border-gray-100/50">
                    <Map className="w-4 h-4 text-gray-400 mb-1" />
                    <span className="text-xs font-bold text-gray-900">{route.distance}</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 flex flex-col items-center justify-center border border-gray-100/50">
                    <Clock className="w-4 h-4 text-gray-400 mb-1" />
                    <span className="text-xs font-bold text-gray-900">{route.duration}</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 flex flex-col items-center justify-center border border-gray-100/50">
                    <Fuel className="w-4 h-4 text-gray-400 mb-1" />
                    <span className="text-xs font-bold text-[#00AA13]">{route.estimatedCost}</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  {route.routeNotes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
