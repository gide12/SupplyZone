import React, { useState, useRef } from "react";
import { Package, Trash2, Plus, BrainCircuit, Loader2, UploadCloud, Camera, CalendarClock } from "lucide-react";
import { useAppContext } from "../store/AppContext";
import { WeatherForecastModal } from "./WeatherForecastModal";
import { EstimateExpirationModal } from "./EstimateExpirationModal";
import { CloudRain } from "lucide-react";
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
  const [newSatuan, setNewSatuan] = useState("");
  const [newBasePrice, setNewBasePrice] = useState("");
  const [newSpace, setNewSpace] = useState("");
  const [newExp, setNewExp] = useState("");
  const [newExpectedSupplyDate, setNewExpectedSupplyDate] = useState("");
  const [newSupplyCycleValue, setNewSupplyCycleValue] = useState("");
  const [newSupplyCycleUnit, setNewSupplyCycleUnit] = useState("Bulan");

  const [loading, setLoading] = useState(false);
  const [isStorageLoading, setIsStorageLoading] = useState(false);
  const [storageWarnings, setStorageWarnings] = useState<{
    crossContamination: string[];
    frozenRequired: string[];
    roomTempRequired: string[];
    sunDriedRequired: string[];
  } | null>(null);

  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
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
    if (!newName || !newQuantity || !newBasePrice || !newExp) return;

    const newItem: any = { // Use any temporarily if types are complaining, but SupplierInventoryItem has expectedSupplyDate and supplyCycle. Let's just use it
      id: `sinv-${Date.now()}`,
      name: newName,
      quantity: Number(newQuantity),
      unit: newSatuan,
      basePrice: Number(newBasePrice),
      spaceUsed: newSpace ? Number(newSpace) : undefined,
      expirationDate: newExp,
      expectedSupplyDate: newExpectedSupplyDate,
      supplyCycle: newSupplyCycleValue ? `${newSupplyCycleValue} ${newSupplyCycleUnit}` : "",
    };

    updateSupplierInventory(activeSupplier.id, [...inventory, newItem]);
    setNewName("");
    setNewQuantity("");
    setNewSatuan("");
    setNewBasePrice("");
    setNewSpace("");
    setNewExp("");
    setNewExpectedSupplyDate("");
    setNewSupplyCycleValue("");
    setNewSupplyCycleUnit("Bulan");
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
      const prompt = `Extract inventory items from this document (image of receipt/invoice or CSV text). Provide a JSON array. For each item: name, quantity (number), unit (string: one of kg, Liter, Drum, Karton, Karung, Pallet, Biji), basePrice (number, if not provided guess e.g. 5.0), spaceUsed (number in m³, if not provided guess e.g. 1.0 or 0.5), and expirationDate (YYYY-MM-DD, if not provided guess e.g. 1-2 weeks from now).`;

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
        model: "gemini-3-flash-preview",
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
                unit: { type: Type.STRING },
                basePrice: { type: Type.NUMBER },
                spaceUsed: { type: Type.NUMBER },
                expirationDate: { type: Type.STRING, description: "YYYY-MM-DD" },
              },
              required: ["name", "quantity", "unit", "basePrice", "spaceUsed", "expirationDate"]
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
          unit: item.unit,
          basePrice: item.basePrice,
          spaceUsed: item.spaceUsed,
          expirationDate: item.expirationDate
        }));
        
        updateSupplierInventory(activeSupplier.id, [...inventory, ...newItems]);
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || err?.toString() || "";
      if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
        alert("Sistem AI sedang sibuk karena tingginya permintaan. Silakan coba lagi dalam beberapa saat.");
      } else {
        alert("Gagal menganalisis file yang diunggah.");
      }
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCheckStorage = async () => {
    setIsStorageLoading(true);
    try {
      const prompt = `Sebagai AI food safety expert, periksa daftar bahan inventaris pemasok ini (fokus pada peringatan penting): ${inventory.map(i => i.name).join(", ")}.
      Tugas: Berikan peringatan alert pada penyimpanan yang salah atau butuh perhatian ekstra!
      1. crossContamination: Peringatan kontaminasi silang (misal bahan etilen seperti apel dengan sayuran yang bisa busuk, daging mentah dengan sayuran).
      2. frozenRequired: Wajib Frozen/Chiller (daging mentah, ayam, frozen food).
      3. roomTempRequired: Suhu Ruangan (bahan kering, pantang masuk kulkas).
      4. sunDriedRequired: Wajib Dijemur/Kering (ikan asin mentah, kerupuk mentah, bahan berjamur).
      
      Respons strictly dalam format JSON ini, berupa array string (maks 1 kalimat per bahan):
      {
         "crossContamination": ["Peringatan: Apel memproduksi etilen tinggi, jauhkan dari bayam agar tidak cepat busuk."],
         "frozenRequired": ["Daging Sapi harus disimpan dalam freezer di bawah -18°C."],
         "roomTempRequired": ["Bawang Merah wajib disimpan di suhu ruangan."],
         "sunDriedRequired": ["Ikan Asin perlu dijemur berkala agar tidak berjamur."]
      }
      Jika tidak ada bahan di kategori tersebut, biarkan arraynya [].`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              crossContamination: { type: Type.ARRAY, items: { type: Type.STRING } },
              frozenRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
              roomTempRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
              sunDriedRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["crossContamination", "frozenRequired", "roomTempRequired", "sunDriedRequired"]
          }
        }
      });
      if (response.text) {
        setStorageWarnings(JSON.parse(response.text));
      }
    } catch(err: any) {
      alert("Gagal menganalisis keamanan penyimpanan");
    } finally {
      setIsStorageLoading(false);
    }
  };

  const handleAICalculation = async () => {
    setLoading(true);
    try {
      // Collect aggregate market menu items to find "dominant products"
      const allMenuNames = restaurants.flatMap(r => r.menu.map(m => m.name));
      
      const prompt = `
        Sebagai AI analitik supply chain pemasok, evaluasi efisiensi inventaris dan efektivitas pasar pemasok ini secara optimal menggunakan pendekatan matriks.
        Berikan jawaban penuh dalam Bahasa Indonesia.
        PENTING: Jawaban harus sangat SINGKAT, PADAT, dan TO THE POINT (Maksimal 1 kalimat atau bullet point pendek).
        
        Data Inventaris Pemasok Saat Ini (termasuk preOrderDate/stok masuk):
        ${JSON.stringify(inventory.map(i => ({ name: i.name, quantity: i.quantity, spaceUsed: i.spaceUsed, expirationDate: i.expirationDate, expectedSupplyDate: i.expectedSupplyDate, basePrice: i.basePrice })), null, 2)}
        
        Kebutuhan Pasar / Demand Restoran (Data menu gabungan restoran yang mengindikasikan bahan populer):
        ${JSON.stringify(allMenuNames, null, 2)}
        
        Harap evaluasi dan hitung poin-poin berikut berdasarkan matriks keputusan prioritas secara ringkas:
        1. Skor Efisiensi (0-100) dan Skor Efektivitas (0-100). Pertimbangkan bahan demand tinggi dan cepat expired.
        2. Peringatan kapasitas (capacityWarning) yang memperhitungkan total barang saat ini + stok terjadwal masuk. (Max 1 kalimat)
        3. Pengingat expired (expirationReminders) untuk barang butuh likuidasi segera. (Singkat, nama barang dan tgl)
        4. Analisis Produk Dominan (dominantProductsAnalysis): sinkronisasi inventaris dengan permintaan agregat. (Max 1 kalimat)
        5. Rekomendasi Diskon: Jika stok bertumpuk sedangkan demand lambat.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
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
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || err?.toString() || "";
      if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
        alert("Sistem AI sedang sibuk karena tingginya permintaan. Silakan coba lagi dalam beberapa saat.");
      } else {
        alert("Gagal menganalisis supplier inventory.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-h-full overflow-y-auto">
      <h2 className="text-sm font-bold text-[#00AA13]  tracking-wide mb-4 game-text border-b border-gray-200 pb-1">Supplier Inventory Analisis</h2>

      <div className="flex flex-col gap-6">
        <div>
          <div className="game-panel-inner p-4 hover:border-gray-200 transition-colors mb-6">
            <h3 className="font-bold text-lg text-gray-900 mb-3 game-text">Tambah Barang</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                 <label className="block text-xs  font-bold text-gray-400 mb-1 game-text">Nama Barang</label>
                 <input type="text" className="w-full bg-white border border-gray-200 text-gray-900 p-2 game-text focus:outline-none focus:border-[#00AA13]" placeholder="e.g., Avocado Toast" value={newName} onChange={e => setNewName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                   <label className="block text-xs  font-bold text-gray-400 mb-1 game-text">Quantity</label>
                   <input type="number" min="1" className="w-full bg-white border border-gray-200 text-gray-900 p-2 game-text focus:outline-none focus:border-[#00AA13]" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} required />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-400 mb-1 game-text">Satuan</label>
                   <select className="w-full bg-white border border-gray-200 text-gray-900 p-2 game-text focus:outline-none focus:border-[#00AA13]" value={newSatuan} onChange={e => setNewSatuan(e.target.value)} required>
                     <option value="">Select</option>
                     <option value="kg">kg</option><option value="Liter">Liter</option><option value="Drum">Drum</option><option value="Karton">Karton</option><option value="Karung">Karung</option><option value="Pallet">Pallet</option><option value="Biji">Biji</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs  font-bold text-gray-400 mb-1 game-text">Harga Pokok (Rp)</label>
                   <input type="number" step="0.01" min="0" className="w-full bg-white border border-gray-200 text-gray-900 p-2 game-text focus:outline-none focus:border-[#00AA13]" value={newBasePrice} onChange={e => setNewBasePrice(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs  font-bold text-gray-400 mb-1 game-text">Kapasitas (m³) (Opsional)</label>
                  <input type="number" step="0.1" className="w-full bg-white border border-gray-200 text-gray-900 p-2 game-text focus:outline-none" value={newSpace} onChange={e => setNewSpace(e.target.value)} placeholder="e.g. 5.5" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-400 game-text">Tanggal Kedaluwarsa</label>
                    <button 
                      type="button" 
                      onClick={() => setIsExpModalOpen(true)}
                      className="text-[10px] text-purple-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <CalendarClock className="w-3 h-3" /> Prediksi Exp
                    </button>
                  </div>
                  <input type="date" className="w-full bg-white border border-gray-200 text-gray-900 p-2 game-text focus:outline-none" value={newExp} onChange={e => setNewExp(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 game-text">Tanggal Masuk (Tersedia)</label>
                    <input type="date" className="w-full bg-white border border-gray-200 text-gray-900 p-2 game-text focus:outline-none" value={newExpectedSupplyDate} onChange={e => setNewExpectedSupplyDate(e.target.value)} />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 game-text">Siklus Pasokan (Opsional)</label>
                    <div className="flex gap-2">
                      <input type="number" className="w-1/2 bg-white border border-gray-200 text-gray-900 p-2 game-text focus:outline-none" placeholder="Angka" value={newSupplyCycleValue} onChange={e => setNewSupplyCycleValue(e.target.value)} />
                      <select className="w-1/2 bg-white border border-gray-200 text-gray-900 p-2 game-text focus:outline-none focus:border-[#00AA13]" value={newSupplyCycleUnit} onChange={e => setNewSupplyCycleUnit(e.target.value)}>
                        <option value="Hari">Hari</option>
                        <option value="Minggu">Minggu</option>
                        <option value="Bulan">Bulan</option>
                      </select>
                    </div>
                 </div>
              </div>
              <button type="submit" className="w-full py-2 game-btn game-btn-green text-gray-900 font-bold  game-text mt-2 flex justify-center items-center gap-2"><Plus className="w-5 h-5"/> Add To Inventory</button>
            </form>

            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400 font-bold game-text   text-xs">ATAU AUTO-IMPORT</span>
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
                <span className="text-[10px]">Foto/Struk</span>
              </button>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex-1 py-2 bg-[#EE2737] hover:bg-[#EE2737]/80 disabled:opacity-50 text-white font-bold  game-text flex flex-col items-center justify-center gap-1 transition-colors border border-[#EE2737]"
              >
                <UploadCloud className="w-5 h-5" />
                <span className="text-[10px]">Unggah CSV/Excel</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-white border border-gray-200 p-6 relative shadow-sm mb-6">
              <h3 className="font-bold text-[#EE2737] text-xl game-title flex items-center gap-2 mb-2">
                 <BrainCircuit className="w-5 h-5" /> Smart AI Storage Warning
              </h3>
              <p className="game-text text-gray-700 text-sm mb-4 leading-relaxed">
                 Peringatan otomatis untuk semua paket (kontaminasi silang, pendinginan, dan cara simpan) agar bahan pemasok tetap aman & awet.
              </p>
              <button 
                onClick={handleCheckStorage}
                disabled={isStorageLoading || inventory.length === 0}
                className="w-full py-3 bg-white border border-[#EE2737] text-[#EE2737] hover:bg-red-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 font-bold game-text text-lg flex items-center justify-center gap-2 transition-all shadow-sm mb-4"
              >
                {isStorageLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                {isStorageLoading ? "Mengecek Keamanan..." : "Cek Keamanan Penyimpanan"}
              </button>
              {storageWarnings && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  {storageWarnings.crossContamination.length > 0 && (
                    <div className="bg-red-50 p-3 border border-red-200 rounded-lg">
                      <strong className="text-xs text-red-800 block mb-1">🚨 Peringatan Kontaminasi Silang</strong>
                      <ul className="text-xs text-red-700 list-disc pl-4 space-y-1">
                        {storageWarnings.crossContamination.map((w,i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                  {storageWarnings.frozenRequired.length > 0 && (
                    <div className="bg-blue-50 p-3 border border-blue-200 rounded-lg">
                      <strong className="text-xs text-blue-800 block mb-1">❄️ Wajib Frozen/Chiller</strong>
                      <ul className="text-xs text-blue-700 list-disc pl-4 space-y-1">
                        {storageWarnings.frozenRequired.map((w,i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                  {storageWarnings.roomTempRequired.length > 0 && (
                    <div className="bg-orange-50 p-3 border border-orange-200 rounded-lg">
                      <strong className="text-xs text-orange-800 block mb-1">🌡️ Wajib Suhu Ruangan</strong>
                      <ul className="text-xs text-orange-700 list-disc pl-4 space-y-1">
                        {storageWarnings.roomTempRequired.map((w,i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                  {storageWarnings.sunDriedRequired.length > 0 && (
                    <div className="bg-yellow-50 p-3 border border-yellow-200 rounded-lg">
                      <strong className="text-xs text-yellow-800 block mb-1">☀️ Wajib Dijemur/Kering</strong>
                      <ul className="text-xs text-yellow-700 list-disc pl-4 space-y-1">
                        {storageWarnings.sunDriedRequired.map((w,i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                  {storageWarnings.crossContamination.length === 0 && storageWarnings.frozenRequired.length === 0 && storageWarnings.roomTempRequired.length === 0 && storageWarnings.sunDriedRequired.length === 0 && (
                    <div className="bg-green-50 p-3 border border-green-200 rounded-lg text-center">
                      <strong className="text-xs text-green-800">✅ Penyimpanan saat ini aman dan tidak ada peringatan.</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 p-6 relative shadow-sm">
              <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-xl game-title flex items-center gap-2 mb-4">
                 <BrainCircuit className="w-6 h-6 text-purple-600" /> <span className="text-gray-900">Analisa</span> Artificial Intelligence
              </h3>
              <p className="game-text text-gray-700 text-sm mb-6 leading-relaxed">
                 Evaluasi efisiensi gudang, efektivitas pasar terhadap produk dominan (seperti Avocado Toast, dsb.), dan peringatan masa kedaluwarsa dengan Artificial Intelligence.
              </p>
              
              <button 
                onClick={handleAICalculation}
                disabled={loading || inventory.length === 0}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:bg-gray-200 disabled:text-gray-400 disabled:from-gray-200 disabled:to-gray-200 disabled:border-gray-200 disabled:shadow-none text-white font-bold game-text text-lg flex items-center justify-center gap-2 transition-all shadow-sm mb-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                {loading ? "Menganalisis..." : "Hitung Kapasitas"}
              </button>

            <button 
              onClick={() => setIsWeatherModalOpen(true)}
              className="w-full py-3 bg-white hover:bg-gray-50 text-blue-600 font-bold game-text text-lg flex items-center justify-center gap-2 transition-all border border-blue-600 shadow-sm mb-6"
            >
              <CloudRain className="w-5 h-5" />
              Cek Cuaca
            </button>
    

              {aiReport && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 border border-gray-100 rounded-lg text-center flex flex-col items-center justify-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Efisiensi Ruang</span>
                      <span className="text-2xl font-bold text-gray-900">{aiReport.efficiencyScore}%</span>
                    </div>
                    <div className="bg-gray-50 p-3 border border-gray-100 rounded-lg text-center flex flex-col items-center justify-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Efektivitas Pasar</span>
                      <span className="text-2xl font-bold text-[#00AA13]">{aiReport.effectivenessScore}%</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 border border-gray-100 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5"><strong className="text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded">Status</strong></div>
                    <p className="text-gray-700 text-xs leading-relaxed">{aiReport.capacityWarning}</p>
                  </div>

                  {aiReport.expirationReminders.length > 0 && (
                    <div className="bg-red-50 p-3 border border-red-100 rounded-lg">
                      <div className="flex items-center gap-2 mb-1.5"><strong className="text-xs text-[#EE2737] bg-white px-2 py-0.5 rounded shadow-sm">Shelf-Life Reminders</strong></div>
                      <ul className="text-xs space-y-1 list-disc pl-4 text-red-700">
                        {aiReport.expirationReminders.map((rem, i) => <li key={i}>{rem}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="bg-white p-3 border border-gray-100 rounded-lg shadow-sm">
                     <div className="flex items-center gap-2 mb-1.5"><strong className="text-xs text-[#00AA13] bg-green-50 px-2 py-0.5 rounded">Sinkronisasi Pasar Dominan</strong></div>
                     <p className="text-gray-700 text-xs leading-relaxed">{aiReport.dominantProductsAnalysis}</p>
                  </div>

                  {aiReport.actionableAdvice && (
                    <div className="bg-purple-50 p-3 border border-purple-100 rounded-lg">
                       <p className="text-purple-800 text-xs font-medium italic">"{aiReport.actionableAdvice}"</p>
                    </div>
                  )}

                  {aiReport.discountRecommendations && aiReport.discountRecommendations.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="text-[10px] font-bold text-orange-600 mb-2 uppercase tracking-wider flex items-center justify-between">
                        <span>Diskon Promosi / Penawaran</span> <span className="bg-white px-1.5 py-0.5 rounded shadow-sm text-black">TINGKATKAN PESANAN</span>
                      </div>
                      <div className="space-y-2">
                        {aiReport.discountRecommendations.map((rec, i) => (
                          <div key={i} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border border-orange-100">
                            <div className="flex-1 pr-2">
                              <div className="font-bold text-xs text-gray-900">{rec.itemName}</div>
                              <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{rec.reason}</div>
                            </div>
                            <div className="text-orange-600 font-bold text-xs bg-orange-100 px-2 py-1 rounded shrink-0">
                              -{rec.suggestedDiscountPercentage}%
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
            <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-1">
              <h3 className="text-sm font-bold text-[#00AA13]  tracking-wide game-text">Stok Saat Ini</h3>
              <span className="text-gray-400 font-bold game-text text-sm">Total Kapasitas: {totalSpace.toFixed(1)} m³</span>
            </div>
            {inventory.length === 0 ? (
              <div className="text-center py-6 text-gray-400 font-bold game-text italic">Belum ada barang di inventaris.</div>
            ) : (
              inventory.map(item => {
                const dynamicInfo = calculateDynamicPrice(item.name);
                const percentage = totalSpace > 0 ? ((item.spaceUsed || 0) / totalSpace * 100).toFixed(1) : "0.0";
                const expired = isExpired(item.expirationDate || "");
                return (
                  <div key={item.id} className={`game-panel-inner p-4 flex justify-between items-center group relative border ${expired ? 'border-[#EE2737]/50' : 'border-gray-100'}`}>
                    <div className="flex-1 w-full relative">
                      <div className="flex justify-between w-full items-start">
                         <h4 className="font-bold text-xl text-gray-900 game-text flex items-center gap-2">
                           {item.name}
                           {expired && <span className="bg-[#EE2737] text-white text-[10px] px-2 py-0.5 rounded-sm  ">Expired</span>}
                         </h4>
                         <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-[#EE2737] transition-colors z-10 shrink-0">
                           <Trash2 className="w-5 h-5" />
                         </button>
                      </div>
                      <div className="text-sm font-bold text-gray-400 game-text space-x-2 mt-1 flex flex-wrap gap-2">
                        <span>Base: Rp {item.basePrice.toFixed(2)}</span>
                        <span>|</span>
                        <span>Qty: {item.quantity} {item.unit || ""}</span>
                        <span>|</span>
                        <span>Kapasitas: {item.spaceUsed || 'N/A'} m³</span>
                      </div>
                      <div className="mt-2 text-xs font-bold text-[#EE2737]  game-text flex flex-col">
                        <span>Est. Market Price: Rp {dynamicInfo.estimatedPrice.toFixed(2)}</span>
                        <span className="text-[10px] text-gray-400 mb-2">(Demand: {dynamicInfo.marketDemand} | Supply: {dynamicInfo.marketSupply})</span>
                      </div>
                      
                      {item.expectedSupplyDate && (
                        <div className="mt-1 text-xs font-bold text-[#00AA13] game-text">
                           Tersedia: {item.expectedSupplyDate} {item.supplyCycle ? `(${item.supplyCycle})` : ''}
                        </div>
                      )}

                      <div className="mt-2 w-full bg-white h-2 rounded overflow-hidden flex border border-gray-100">
                         <div className="bg-[#EE2737] h-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-1 items-center">
                         <div className={`text-xs font-bold game-text ${expired ? 'text-[#EE2737]' : 'text-[#EE2737]'}`}>Exp: {item.expirationDate || 'N/A'}</div>
                         <span className="text-[10px] text-gray-400 font-bold game-text">{percentage}% Kapasitas Dipakai</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <WeatherForecastModal isOpen={isWeatherModalOpen} onClose={() => setIsWeatherModalOpen(false)} inventory={inventory as any} />
      <EstimateExpirationModal 
        isOpen={isExpModalOpen} 
        onClose={() => setIsExpModalOpen(false)} 
        itemName={newName} 
        onSelectDate={(date) => setNewExp(date)} 
      />
    </div>
  );
}
