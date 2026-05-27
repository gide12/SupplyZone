import React, { useState } from 'react';
import { BookOpen, X, ChevronRight, Store, Truck, BrainCircuit, LineChart, Package, Search } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { translate } from '../lib/i18n';

export function GuidelineModal() {
  const { language } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'restaurant' | 'supplier'>('restaurant');

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9999] flex items-center justify-center w-12 h-12 bg-[#00AA13] text-white rounded-full shadow-lg hover:scale-105 transition-transform"
        title={translate("User Guideline", language)}
      >
        <BookOpen className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-[#00AA13] p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold font-display">Buku Panduan Pengguna</h2>
              <p className="text-green-100 text-sm">Panduan lengkap menggunakan sistem Food & Supply</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-gray-100 shrink-0">
          <button
            onClick={() => setActiveTab('restaurant')}
            className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 ${activeTab === 'restaurant' ? 'text-[#00AA13] border-b-2 border-[#00AA13] bg-green-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Store className="w-5 h-5" />
            Panduan Restoran
          </button>
          <button
            onClick={() => setActiveTab('supplier')}
            className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 ${activeTab === 'supplier' ? 'text-[#EE2737] border-b-2 border-[#EE2737] bg-red-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Truck className="w-5 h-5" />
            Panduan Pemasok (Supplier)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeTab === 'restaurant' ? (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  1. Mengelola Inventaris & Menu
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
                  <li><strong>Scanner Bukti Tanda Terima:</strong> Anda bisa memindai nota fisik untuk otomatis memasukkan data ke inventaris tanpa harus input manual. AI akan mendeteksi nama produk, jumlah, unit, dan estimasi waktu kadaluarsa.</li>
                  <li><strong>Kelola Menu:</strong> Tambahkan bahan pokok atau menu yang dijual (untuk restoran premium). Anda bisa menentukan resep dari bahan gudang.</li>
                  <li><strong>Update Otomatis:</strong> Saat pesanan (Deal) selesai / "Terkirim", maka stok inventaris / bahan baku otomatis bertambah ke gudang Anda!</li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <Search className="w-5 h-5 text-orange-500" />
                  2. Mencari & Menawar pada Pemasok
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
                  <li><strong>Pencarian Cerdas:</strong> Cari pemasok di Menu "Pasar Pemasok", sistem akan mencocokkan stok supplier yang relevan dengan bahan baku Anda.</li>
                  <li><strong>Penawaran (Nego):</strong> Ajukan penawaran harga. Supplier akan membalas dengan status: Diterima, Ditolak, atau meminta waktu persetujuan.</li>
                  <li><strong>Sampel Gratis:</strong> Minta sampel dari supplier jika tidak yakin dengan kualitas barang sebelum beli di skala besar.</li>
                  <li><strong>Sistem Retur (Return):</strong> Jika barang cacat, ajukan Retur (SLA dihitung mundur). Uang bisa direfund 100%!</li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-purple-500" />
                  3. Fitur Keunggulan Artificial Intelligence (Premium)
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
                  <li><strong>AI Weather Predictor (Cuaca):</strong> Memprediksi resiko cuaca (misal curah hujan / panas) untuk 1-7 hari kedepan dan menganalisis apakah stok gudang Anda aman agar dapat mengantisipasi pasokan terhambat.</li>
                  <li><strong>Smart Supply Prediction (Saran AI):</strong> AI memprediksikan rekomendasi pemesanan ulang berdasarkan kecepatan perputaran menu Anda (Menu Velocity). AI menghitung stok saat ini untuk setiap resep, lalu menyarankan Restoran perlu order barang apa saja agar tidak "Kehabisan Stok".</li>
                  <li><strong>Smart AI Storage Warning:</strong> AI mendeteksi apakah barang Anda aman untuk disimpan bersama. AI akan mewarning jika ada bahan etilen (bisa bikin busuk) yang dicampur dengan sayuran, atau apakah bahan wajib masuk pendingin / dijemur matahari agar awet!.</li>
                  <li><strong>AI Recipe Optimizer:</strong> Menyediakan inspirasi peracikan produk dengan takaran otomatis berdasarkan referensi dari Internet (Cookpad/Tiktok) agar inovasi makanan tetap berjalan, sudah dilengkapi dengan analisis harga jual ideal.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  1. Mengelola Etalase Pasar (Gudang Supplier)
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
                  <li><strong>Digitalisasi Gudang:</strong> Tambahkan / Scan daftar barang supplier menggunakan OCR Scanner. Data otomatis tercatat bersama space ukuran volume (m³) dan harga pasar.</li>
                  <li><strong>Marketplace (Market):</strong> Pantau restoran yang sedang mencari bahan spesifik. Sistem akan mencocokkan restoran dan suplai / barang yang Anda punya. Anda bisa menjajakan produk ke list tersebut.</li>
                  <li><strong>Pemesanan Pre-Order / PO:</strong> Masukkan estimasi kedatangan suplai bahan agar Resto mengetahui kalau stok akan ready di masa depan.</li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-[#EE2737]" />
                  2. Negosiasi & Order Transaksi
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
                  <li><strong>Order Masuk:</strong> Pantau penawaran (tabel biru) dari restoran yang mau beli (nego). Anda berhak me-Reject, Terima, hingga mengatur status Sedang Dikirim hingga Terkirim.</li>
                  <li><strong>Manajemen Retur (SLA):</strong> Respons cepat pada ajuan Retur restoran. Abaikan akan menurunkan nilai rating dan reputasi karena ada SLA Count Down. Setujui (Refunded/Replaced) atau Tolak (Rejected).</li>
                  <li><strong>Ulasan Transaksi:</strong> Dapatkan ulasan dari restoran untuk memperbanyak tingkat penjualan di algoritma Marketplace.</li>
                </ul>
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-purple-500" />
                  3. Bantuan Artificial Intelligence (Bagi Pemasok)
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
                  <li><strong>Analisa Gudang (Kalkulator Kapasitas Rak):</strong> AI akan mensimulasikan tata letak gudang/rak penyimpanan dari berat & besaran space m³ apakah cukup untuk batch supply baru.</li>
                  <li><strong>AI Pricing Optimizer:</strong> AI menganalisa perbandingan harga suplai barang Anda vs harga kompetitor pemasok lain yang menjual bahan relevan. Untuk menentukan apakah Anda kemahalan atau bisa naikan marjin <i>profit</i>.</li>
                  <li><strong>Kalkulator Keuntungan Pemasok (Profit Margin AI & Fuel Calc):</strong> Kalkulator biaya kirim dari bensin/solar dari titik Anda ke lokasi pengantaran Reto + prediksi margin keuntungan kotor dan rekomendasi volume harga.</li>
                  <li><strong>Kedaluwarsa AI (Expiration Predictor):</strong> Membaca dokumen tanggal masa kedaluwarsa dari invoice masuk atau input text, menyarankan untuk Cuci Gudang untuk menekan sampah sisa pangan.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
