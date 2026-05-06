import React, { useState } from "react";
import { Calculator } from "lucide-react";

export function SupplierCalculator() {
  // HPP State
  const [hppBahan, setHppBahan] = useState<number | "">("");
  const [hppTenagaKerja, setHppTenagaKerja] = useState<number | "">("");
  const [hppOverhead, setHppOverhead] = useState<number | "">("");

  // Margin State
  const [marginHpp, setMarginHpp] = useState<number | "">("");
  const [marginHargaJual, setMarginHargaJual] = useState<number | "">("");

  // Loss Rate State
  const [lossTotal, setLossTotal] = useState<number | "">("");
  const [lossTerjual, setLossTerjual] = useState<number | "">("");

  // BEP State
  const [bepFixedCost, setBepFixedCost] = useState<number | "">("");
  const [bepVarCost, setBepVarCost] = useState<number | "">("");
  const [bepHargaJual, setBepHargaJual] = useState<number | "">("");

  const hitungHPP = () => {
    return (Number(hppBahan) || 0) + (Number(hppTenagaKerja) || 0) + (Number(hppOverhead) || 0);
  };

  const hitungMargin = () => {
    const hj = Number(marginHargaJual) || 0;
    const hpp = Number(marginHpp) || 0;
    if (hj === 0) return 0;
    return ((hj - hpp) / hj) * 100;
  };

  const hitungLossRate = () => {
    const total = Number(lossTotal) || 0;
    const terjual = Number(lossTerjual) || 0;
    if (total === 0) return 0;
    return ((total - terjual) / total) * 100;
  };

  const hitungBEP = () => {
    const fc = Number(bepFixedCost) || 0;
    const vc = Number(bepVarCost) || 0;
    const hj = Number(bepHargaJual) || 0;
    if (hj - vc <= 0) return 0;
    return Math.ceil(fc / (hj - vc));
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
        <Calculator className="w-6 h-6 text-[#00AA13]" />
        <h2 className="text-xl font-bold text-gray-900 game-text">Kalkulator Pemasok</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Harga Pokok Penjualan */}
        <div className="game-panel-inner p-5 space-y-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 game-text flex justify-between items-center">
            Harga Pokok Penjualan
            <span className="text-sm font-normal text-gray-500 bg-gray-50 px-2 py-1 rounded">HPP</span>
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1 game-text">Bahan Baku (Rp)</label>
              <input type="number" value={hppBahan} onChange={e => setHppBahan(e.target.value ? Number(e.target.value) : "")} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1 game-text">Tenaga Kerja (Rp)</label>
              <input type="number" value={hppTenagaKerja} onChange={e => setHppTenagaKerja(e.target.value ? Number(e.target.value) : "")} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1 game-text">Overhead Pabrik (Rp)</label>
              <input type="number" value={hppOverhead} onChange={e => setHppOverhead(e.target.value ? Number(e.target.value) : "")} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text" />
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-700 game-text">Total HPP:</span>
              <span className="text-xl font-bold text-[#00AA13] game-text">Rp {hitungHPP().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Margin */}
        <div className="game-panel-inner p-5 space-y-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-900 game-text flex justify-between items-center">
            Margin Keuntungan
            <span className="text-sm font-normal text-gray-500 bg-gray-50 px-2 py-1 rounded">%</span>
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1 game-text">Harga Jual (Rp)</label>
              <input type="number" value={marginHargaJual} onChange={e => setMarginHargaJual(e.target.value ? Number(e.target.value) : "")} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1 game-text">HPP (Rp) <button className="text-xs text-[#00AA13]" onClick={() => setMarginHpp(hitungHPP())}>(Gunakan HPP Kiri)</button></label>
              <input type="number" value={marginHpp} onChange={e => setMarginHpp(e.target.value ? Number(e.target.value) : "")} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text" />
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-700 game-text">Margin:</span>
              <span className="text-xl font-bold text-[#00AA13] game-text">{hitungMargin().toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Loss Rate */}
        <div className="game-panel-inner p-5 space-y-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-[#EE2737] game-text flex justify-between items-center">
            Loss Rate (Penyusutan)
            <span className="text-sm font-normal text-gray-500 bg-gray-50 px-2 py-1 rounded">%</span>
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1 game-text">Total Item / Produksi</label>
              <input type="number" value={lossTotal} onChange={e => setLossTotal(e.target.value ? Number(e.target.value) : "")} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#EE2737] focus:ring-1 focus:ring-[#EE2737] outline-none transition-all game-text" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1 game-text">Item Terjual / Kondisi Baik</label>
              <input type="number" value={lossTerjual} onChange={e => setLossTerjual(e.target.value ? Number(e.target.value) : "")} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#EE2737] focus:ring-1 focus:ring-[#EE2737] outline-none transition-all game-text" />
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-700 game-text">Loss Rate:</span>
              <span className="text-xl font-bold text-[#EE2737] game-text">{hitungLossRate().toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Break Even Point */}
        <div className="game-panel-inner p-5 space-y-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-blue-600 game-text flex justify-between items-center">
            Break Even Point
            <span className="text-sm font-normal text-gray-500 bg-gray-50 px-2 py-1 rounded">Unit</span>
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1 game-text">Biaya Tetap / Fixed Cost (Rp)</label>
              <input type="number" value={bepFixedCost} onChange={e => setBepFixedCost(e.target.value ? Number(e.target.value) : "")} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all game-text" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1 game-text">Biaya Variabel per Unit (Rp)</label>
              <input type="number" value={bepVarCost} onChange={e => setBepVarCost(e.target.value ? Number(e.target.value) : "")} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all game-text" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1 game-text">Harga Jual per Unit (Rp)</label>
              <input type="number" value={bepHargaJual} onChange={e => setBepHargaJual(e.target.value ? Number(e.target.value) : "")} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all game-text" />
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-700 game-text">BEP:</span>
              <span className="text-xl font-bold text-blue-600 game-text">
                {hitungBEP() === Infinity || isNaN(hitungBEP()) || hitungBEP() < 0 ? "0" : hitungBEP()} Unit
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
