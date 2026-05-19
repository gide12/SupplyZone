import React, { useState } from "react";
import { Check, X, QrCode, Smartphone, Building2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
}

export function PaymentModal({ isOpen, onClose, onSuccess, amount }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "mbanking" | "va" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess();
      }, 1500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <div className="p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Pembayaran Berhasil!</h3>
              <p className="text-gray-500">Terima kasih, Anda telah berlangganan Paket Lengkap.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Upgrade ke Paket Lengkap</h3>
                <p className="text-gray-500 text-sm mt-1">Selesaikan pembayaran Anda</p>
                <div className="text-3xl font-bold text-[#00AA13] mt-4">
                  Rp {amount.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <p className="text-sm font-bold text-gray-700">Pilih Metode Pembayaran</p>
                
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'qris' ? 'border-[#00AA13] bg-[#00AA13]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="paymentMethod" className="hidden" checked={paymentMethod === 'qris'} onChange={() => setPaymentMethod('qris')} />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'qris' ? 'bg-[#00AA13] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">QRIS</div>
                    <div className="text-xs text-gray-400 flex flex-wrap gap-1 mt-1">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">Gopay</span>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">OVO</span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">DANA</span>
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">LinkAja</span>
                    </div>
                  </div>
                  {paymentMethod === 'qris' && <Check className="w-5 h-5 text-[#00AA13]" />}
                </label>

                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'mbanking' ? 'border-[#00AA13] bg-[#00AA13]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="paymentMethod" className="hidden" checked={paymentMethod === 'mbanking'} onChange={() => setPaymentMethod('mbanking')} />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'mbanking' ? 'bg-[#00AA13] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">M-Banking (Bank Indonesia)</div>
                    <div className="text-xs text-gray-400 flex flex-wrap gap-1 mt-1">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">BCA</span>
                      <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-[10px] font-bold">BNI</span>
                      <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded text-[10px] font-bold">Mandiri</span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">BRI</span>
                    </div>
                  </div>
                  {paymentMethod === 'mbanking' && <Check className="w-5 h-5 text-[#00AA13]" />}
                </label>

                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'va' ? 'border-[#00AA13] bg-[#00AA13]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="paymentMethod" className="hidden" checked={paymentMethod === 'va'} onChange={() => setPaymentMethod('va')} />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'va' ? 'bg-[#00AA13] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">Virtual Account Number</div>
                    <div className="text-xs text-gray-400 flex flex-wrap gap-1 mt-1">
                       Transfer via ATM & Internet Banking
                    </div>
                  </div>
                  {paymentMethod === 'va' && <Check className="w-5 h-5 text-[#00AA13]" />}
                </label>
              </div>

              {paymentMethod === 'qris' && (
                <div className="mb-6 flex justify-center">
                   <div className="border border-gray-200 p-2 rounded-xl bg-white shadow-sm">
                      <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs text-center font-bold">
                         Scan with your E-Wallet app
                      </div>
                   </div>
                </div>
              )}

              {paymentMethod === 'va' && (
                <div className="mb-6 text-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">BNI Virtual Account (Contoh)</p>
                    <p className="text-2xl font-mono font-bold tracking-widest text-gray-900">8273 9928 3311 0023</p>
                </div>
              )}

              <button 
                disabled={!paymentMethod || isProcessing}
                onClick={handlePay}
                className="w-full py-4 rounded-xl font-bold text-white transition-all shadow-md game-text text-lg disabled:opacity-50 disabled:cursor-not-allowed bg-[#00AA13] hover:bg-[#009110]"
              >
                {isProcessing ? "Memproses..." : "Bayar Sekarang"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
