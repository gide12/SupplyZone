import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface TermsValidationModalProps {
  action: "Accepted" | "Rejected" | "On Delivery" | "Delivered" | "Sample Requested" | "Return Requested" | "Return Accepted" | "Return Rejected" | "Refunded" | "Replaced" | "Transaction";
  onConfirm: () => void;
  onCancel: () => void;
}

export function TermsValidationModal({ action, onConfirm, onCancel }: TermsValidationModalProps) {
  const [isChecked, setIsChecked] = useState(false);

  const getTitle = () => {
    switch (action) {
      case 'Accepted': return 'Syarat & Ketentuan Penerimaan';
      case 'Rejected': return 'Kebijakan Penolakan';
      case 'On Delivery': return 'Kebijakan Pengiriman';
      case 'Delivered': return 'Konfirmasi Barang Terkirim';
      case 'Sample Requested': return 'Kebijakan Permintaan Sampel';
      case 'Return Requested': return 'Kebijakan Pengembalian (Return)';
      case 'Transaction': return 'Syarat & Ketentuan Transaksi';
      default: return 'Syarat & Ketentuan';
    }
  };

  const getTermsContent = () => {
    switch (action) {
      case 'Accepted':
        return (
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
            <li>Dengan menerima ini, Anda menyetujui transaksi dan harga yang tertera.</li>
            <li>Pembayaran harus diselesaikan sesuai dengan kebijakan waktu portal.</li>
            <li>Barang yang sudah diterima tidak dapat ditolak, kecuali ada kerusakan parah (lihat kebijakan Return).</li>
            <li>Anda bertanggung jawab untuk memverifikasi kualitas barang saat barang tiba.</li>
          </ul>
        );
      case 'Rejected':
        return (
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
            <li>Penolakan akan membatalkan transaksi penawaran ini secara permanen.</li>
            <li>Pihak supplier akan menerima notifikasi penolakan Anda.</li>
            <li>Sistem akan mencatat rasio penolakan untuk keperluan evaluasi reputasi.</li>
            <li>Pastikan penolakan dilakukan sesuai dengan etika bisnis yang berlaku.</li>
          </ul>
        );
      case 'Sample Requested':
        return (
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
            <li>Permintaan sampel mungkin dikenakan biaya pengiriman tergantung kebijakan supplier.</li>
            <li>Waktu kedatangan sampel menyesuaikan ketersediaan stok pihak supplier.</li>
            <li>Sampel hanya disediakan untuk tujuan evaluasi kualitas (QA).</li>
            <li>Meminta sampel bukan merupakan ikatan kewajiban untuk membeli produk akhir.</li>
          </ul>
        );
      case 'Return Requested':
        return (
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
            <li>Pengembalian (Return) hanya sah jika terdapat bukti kerusakan (foto/video).</li>
            <li>Klaim pengembalian maksimal dilakukan 2x24 jam setelah barang dinyatakan terkirim.</li>
            <li>Biaya logistik pengembalian akan ditentukan dari hasil investigasi portal atau sesuai kesepakatan awal.</li>
            <li>Bahan makanan/minuman yang rusak akibat kesalahan simpan oleh restoran tidak dapat dikembalikan.</li>
          </ul>
        );
      case 'On Delivery':
        return (
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
            <li>Anda menyatakan bahwa barang kini sedang dalam proses transit menuju restoran.</li>
            <li>Anda wajib memastikan kurir dan kondisi paket dalam keadaan standar pengiriman aman (suhu, kebersihan).</li>
            <li>Keterlambatan pengiriman dapat mempengaruhi reputasi supplier Anda.</li>
            <li>Harap segera merubah status menjadi "Terkirim" apabila barang sudah sampai.</li>
          </ul>
        );
      case 'Delivered':
        return (
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
            <li>Dengan mengubah status ke "Terkirim", Anda menyetujui bahwa barang telah sampai secara utuh.</li>
            <li>Restoran memiliki waktu 2x24 jam untuk melakukan komplain/Return jika ada masalah.</li>
            <li>Lewat dari masa tersebut, transaksi dianggap berhasil (Selesai).</li>
            <li>Pembayaran akan diproses setelah restoran memverifikasi penerimaan barang yang sesuai.</li>
          </ul>
        );
      case 'Transaction':
        return (
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
            <li>Semua transaksi yang terjadi terikat hukum sesuai peraturan perniagaan yang berlaku.</li>
            <li>Portal berhak untuk membekukan akun jika ditemukan indikasi penipuan transaksi.</li>
            <li>Informasi yang tertera di faktur adalah yang final.</li>
            <li>Kedua belah pihak wajib mematuhi standar privasi data dan kesepakatan SLA (Service Level Agreement).</li>
          </ul>
        );
      default:
        return (
          <p className="text-sm text-gray-700">Dengan melanjutkan, Anda menyetujui semua kebijakan dan persyaratan sistem operasional kami.</p>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 font-sans tracking-tight">
              {getTitle()}
            </h2>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3 text-sm">Harap baca dengan teliti sebelum melanjutkan:</h3>
            {getTermsContent()}
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
            <input 
              type="checkbox" 
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              Saya telah membaca, memahami, dan menyetujui syarat & ketentuan serta seluruh kebijakan operasi terkait aksi ini.
            </span>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
          <button 
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-200"
          >
            Kembali
          </button>
          <button 
            onClick={onConfirm}
            disabled={!isChecked}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-sm flex items-center gap-2 ${
              isChecked 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' 
                : 'bg-gray-300 cursor-not-allowed opacity-70'
            }`}
          >
            Setujui & Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
