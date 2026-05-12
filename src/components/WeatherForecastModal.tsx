import React, { useState } from "react";
import { X, CloudRain, Sun, Loader2, Info } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { RestaurantInventoryItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface WeatherForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: RestaurantInventoryItem[];
}

interface ForecastResult {
  itemName: string;
  weatherCondition: string;
  expectedHarvestImpact: string;
  forecastedPriceChange: string;
  recommendation: string;
}

const adm4Codes: Record<string, string> = {
  "Aceh": "11.71.01.2001", 
  "Sumatera Utara": "12.71.01.1001",
  "Sumatera Barat": "13.71.01.1001",
  "Riau": "14.71.01.1001",
  "Kepulauan Riau": "21.71.01.1001",
  "Jambi": "15.71.01.1001",
  "Bengkulu": "17.71.01.1001",
  "Sumatera Selatan": "16.71.01.1001",
  "Kepulauan Bangka Belitung": "19.71.01.1001",
  "Lampung": "18.71.01.1001",
  "Banten": "36.71.01.1001",
  "Jawa Barat": "32.73.01.1001",
  "DKI Jakarta": "31.71.03.1001",
  "Jawa Tengah": "33.74.01.1001",
  "DI Yogyakarta": "34.71.01.1001",
  "Jawa Timur": "35.78.01.1001",
  "Bali": "51.71.01.1001",
  "Nusa Tenggara Barat": "52.71.01.1001",
  "Nusa Tenggara Timur": "53.71.01.1001",
  "Kalimantan Barat": "61.71.01.1001",
  "Kalimantan Tengah": "62.71.01.1001",
  "Kalimantan Selatan": "63.71.01.1001",
  "Kalimantan Timur": "64.71.01.1001",
  "Kalimantan Utara": "65.71.01.1001",
  "Sulawesi Utara": "71.71.01.1001",
  "Gorontalo": "75.71.01.1001",
  "Sulawesi Tengah": "72.71.01.1001",
  "Sulawesi Barat": "76.01.01.1001",
  "Sulawesi Selatan": "73.71.01.1001",
  "Sulawesi Tenggara": "74.71.01.1001",
  "Maluku": "81.71.01.1001",
  "Maluku Utara": "82.71.01.1001",
  "Papua Barat": "92.71.01.1001",
  "Papua": "91.71.01.1001"
};

export function WeatherForecastModal({ isOpen, onClose, inventory }: WeatherForecastModalProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ForecastResult[] | null>(null);
  const [location, setLocation] = useState("Jawa Barat");
  const [bmkgData, setBmkgData] = useState<any>(null);
  const [loadingBmkg, setLoadingBmkg] = useState(false);
  const [weatherCondition, setWeatherCondition] = useState("Drought / El Nino");

  if (!isOpen) return null;

  
  const handleFetchBMKG = async () => {
    setLoadingBmkg(true);
    setBmkgData(null);
    try {
      const code = adm4Codes[location] || "31.71.03.1001"; // Fallback to Jakarta if not mapped
      const res = await fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${code}`);
      if (res.ok) {
         const data = await res.json();
         const firstCuaca = data.data?.[0]?.cuaca?.[0]?.[0];
         if (firstCuaca) {
           setBmkgData({
              temp: firstCuaca.t || "-",
              weather: firstCuaca.weather_desc || "-",
              humidity: firstCuaca.hu || "-",
              kota: data.lokasi?.kotkab || location
           });
           // Automatically set AI weather condition based on BMKG if possible
           if (firstCuaca.weather_desc) {
             const w = firstCuaca.weather_desc.toLowerCase();
             if (w.includes('hujan')) setWeatherCondition("Heavy Rain / La Nina");
             else if (w.includes('cerah')) setWeatherCondition("Drought / El Nino");
             else setWeatherCondition("Seasonal Transition (Pancaroba)");
           }
         }
      } else {
         alert("BMKG API returned status " + res.status);
      }
    } catch(e) {
      console.error(e);
      alert("Gagal Fetch API BMKG.");
    } finally {
      setLoadingBmkg(false);
    }
  };

  const handlePredict = async () => {
    if (inventory.length === 0) {
      alert("Inventaris kosong. Silakan tambah barang untuk mengecek harga.");
      return;
    }

    setLoading(true);
    setResults(null);

    const itemsContext = inventory.map(
      (inv) => `- ${inv.name} (${inv.quantity} ${inv.unit || 'units'})`
    ).join("\n");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `I have the following restaurant inventory ingredients:
${itemsContext}

Predict how the current forecasted weather (${bmkgData?.weather || weatherCondition}) in ${location} will affect the harvest, supply, and future prices for these ingredients. 
Please provide the response in Indonesian (Bahasa Indonesia). Output an array of objects for each ingredient discussing the weather condition, harvest impact, price change forecast, and business recommendation.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                itemName: {
                  type: Type.STRING,
                  description: "Name of the ingredient",
                },
                weatherCondition: {
                  type: Type.STRING,
                  description: "The specific weather condition considered (e.g. Drought, Heavy Rain)",
                },
                expectedHarvestImpact: {
                  type: Type.STRING,
                  description: "How harvest/supply is affected (e.g., Supply decrease, flooding destroys crops)",
                },
                forecastedPriceChange: {
                  type: Type.STRING,
                  description: "Forecast of the price (e.g., Increase 20-30%, Expected shortage)",
                },
                recommendation: {
                  type: Type.STRING,
                  description: "Actionable advice (e.g., Stockpile now, find alternative supplier)",
                },
              },
              required: ["itemName", "weatherCondition", "expectedHarvestImpact", "forecastedPriceChange", "recommendation"],
            },
          },
        },
      });

      const text = response.text || "[]";
      const data: ForecastResult[] = JSON.parse(text);
      setResults(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil prediksi cuaca.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="game-panel w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-blue-500 shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 border border-blue-300 flex items-center justify-center">
              <CloudRain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 game-title text-blue-900">Prakiraan Cuaca & Harga (BMKG & AI)</h2>
              <p className="text-sm font-bold text-blue-500 game-text">Prediktor Rantai Pasok Cuaca</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white game-panel-inner mb-0">
          
          <div className="bg-gray-50 border border-gray-200 p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 game-text uppercase">Lokasi (Provinsi)</label>
                <select 
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-lg font-bold text-gray-900 focus:outline-none focus:border-blue-500 game-text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >

                  <option value="Aceh">Aceh</option>
                  <option value="Sumatera Utara">Sumatera Utara</option>
                  <option value="Sumatera Barat">Sumatera Barat</option>
                  <option value="Riau">Riau</option>
                  <option value="Kepulauan Riau">Kepulauan Riau</option>
                  <option value="Jambi">Jambi</option>
                  <option value="Bengkulu">Bengkulu</option>
                  <option value="Sumatera Selatan">Sumatera Selatan</option>
                  <option value="Kepulauan Bangka Belitung">Kep. Bangka Belitung</option>
                  <option value="Lampung">Lampung</option>
                  <option value="Banten">Banten</option>
                  <option value="Jawa Barat">Jawa Barat</option>
                  <option value="DKI Jakarta">DKI Jakarta</option>
                  <option value="Jawa Tengah">Jawa Tengah</option>
                  <option value="DI Yogyakarta">DI Yogyakarta</option>
                  <option value="Jawa Timur">Jawa Timur</option>
                  <option value="Bali">Bali</option>
                  <option value="Nusa Tenggara Barat">Nusa Tenggara Barat</option>
                  <option value="Nusa Tenggara Timur">Nusa Tenggara Timur</option>
                  <option value="Kalimantan Barat">Kalimantan Barat</option>
                  <option value="Kalimantan Tengah">Kalimantan Tengah</option>
                  <option value="Kalimantan Selatan">Kalimantan Selatan</option>
                  <option value="Kalimantan Timur">Kalimantan Timur</option>
                  <option value="Kalimantan Utara">Kalimantan Utara</option>
                  <option value="Sulawesi Utara">Sulawesi Utara</option>
                  <option value="Gorontalo">Gorontalo</option>
                  <option value="Sulawesi Tengah">Sulawesi Tengah</option>
                  <option value="Sulawesi Barat">Sulawesi Barat</option>
                  <option value="Sulawesi Selatan">Sulawesi Selatan</option>
                  <option value="Sulawesi Tenggara">Sulawesi Tenggara</option>
                  <option value="Maluku">Maluku</option>
                  <option value="Maluku Utara">Maluku Utara</option>
                  <option value="Papua Barat">Papua Barat</option>
                  <option value="Papua">Papua</option>

                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 game-text uppercase">Prediksi Jenis Cuaca</label>
                <select 
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-lg font-bold text-gray-900 focus:outline-none focus:border-blue-500 game-text"
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value)}
                >
                  <option value="Drought / El Nino">Kemarau / Kekeringan / El Nino</option>
                  <option value="Heavy Rain / La Nina">Hujan Lebat / La Nina</option>
                  <option value="Flooding">Banjir Daratan</option>
                  <option value="Seasonal Transition (Pancaroba)">Pancaroba / Cepat Berubah</option>
                </select>
              </div>
            </div>
            
            
            {bmkgData && (
              <div className="bg-teal-50 p-4 border border-teal-200 mt-4 rounded-xl flex items-center gap-4 animate-in fade-in zoom-in">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center border border-teal-300">
                  <CloudRain className="text-teal-600 w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-teal-800 game-text uppercase tracking-wider">{bmkgData.kota}</h4>
                  <div className="text-2xl font-bold text-teal-900 game-text">{bmkgData.weather}</div>
                  <div className="text-xs text-teal-700 font-bold game-text">Suhu: {bmkgData.temp}°C | Kelembaban: {bmkgData.humidity}%</div>
                </div>
              </div>
            )}
            <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
               <div className="flex items-center gap-2 text-blue-600 text-sm font-bold game-text">
                  <Info className="w-4 h-4"/> Prediksi dampak cuaca pada supply dan harga barang.
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={handleFetchBMKG}
                   disabled={loadingBmkg}
                   className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-300 text-white font-bold transition-all flex items-center gap-2 game-text text-md rounded"
                 >
                   {loadingBmkg ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudRain className="w-4 h-4" />}
                   {loadingBmkg ? "Memuat..." : "Tarik Data BMKG"}
                 </button>
                 <button 
                   onClick={handlePredict}
                   disabled={loading}
                   className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 text-white font-bold transition-all flex items-center gap-2 game-text text-lg rounded"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (weatherCondition.includes('Rain') ? <CloudRain className="w-5 h-5" /> : <Sun className="w-5 h-5" />)}
                   {loading ? "Menganalisis..." : "Prakiraan Supply AI"}
                 </button>
               </div>
            </div>
          </div>

          {results && (
            <div className="space-y-4">
              {results.map((res, idx) => (
                <div key={idx} className="bg-white border border-gray-200 text-left p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                    <div>
                       <h4 className="font-bold text-gray-900 text-2xl game-text">{res.itemName}</h4>
                       <span className="text-gray-500 text-sm font-bold game-text">Dampak Cuaca: {res.weatherCondition}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div className="bg-gray-50 p-3 border border-gray-100">
                        <span className="block text-[10px] text-gray-400 font-bold game-text uppercase mb-1">Dampak Panen/Supply</span>
                        <p className="text-gray-900 text-sm font-bold">{res.expectedHarvestImpact}</p>
                     </div>
                     <div className="bg-red-50 p-3 border border-red-100">
                        <span className="block text-[10px] text-red-400 font-bold game-text uppercase mb-1">Prediksi Harga</span>
                        <p className="text-red-900 text-sm font-bold">{res.forecastedPriceChange}</p>
                     </div>
                  </div>

                  <div className="bg-blue-50 p-3 border border-blue-100">
                    <span className="block text-[10px] text-blue-400 font-bold game-text uppercase mb-1">Rekomendasi AI</span>
                    <p className="text-blue-900 text-sm font-bold">"{res.recommendation}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
