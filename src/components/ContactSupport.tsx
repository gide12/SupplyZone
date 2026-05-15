import React, { useState } from "react";
import { MessageCircle, Mail, X, Phone } from "lucide-react";
import { useAppContext } from "../store/AppContext";

export function ContactSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useAppContext();

  const title = language === "id" ? "Bantuan & Dukungan" : "Help & Support";
  const desc = language === "id" 
    ? "Hubungi layanan pelanggan kami" 
    : "Contact our customer service";
  const helpText = language === "id" ? "Bantuan" : "Help";

  return (
    <div className="fixed bottom-4 left-4 z-[40]">
      {isOpen && (
        <div className="absolute bottom-14 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-72 origin-bottom-left animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500 mt-1">{desc}</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1 -mr-2 -mt-2">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            <a 
              href="https://wa.me/6282144245323" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-[#25D366]/10 text-[#009110] hover:bg-[#25D366]/20 transition-colors rounded-xl font-bold text-sm"
            >
              <MessageCircle className="w-5 h-5" />
              0821-4424-5323
            </a>
            <a 
              href="mailto:mamujugide@gmail.com" 
              className="flex items-center gap-3 p-3 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors rounded-xl font-bold text-sm"
            >
              <Mail className="w-5 h-5" />
              mamujugide@gmail.com
            </a>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all hover:shadow-xl"
        title={helpText}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
      </button>
    </div>
  );
}
