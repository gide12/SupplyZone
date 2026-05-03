import React, { useState, useEffect, useRef } from "react";
import { X, Send, User, Truck, Store } from "lucide-react";
import { useAppContext } from "../store/AppContext";
import { Deal } from "../types";

interface ChatModalProps {
  deal: Deal;
  onClose: () => void;
  currentUserRole: "restaurant" | "supplier";
}

export function ChatModal({ deal, onClose, currentUserRole }: ChatModalProps) {
  const { messages, sendMessage, restaurants, activeSupplier, markMessagesAsRead, suppliers } = useAppContext();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dealMessages = messages.filter(m => m.dealId === deal.id).sort((a, b) => a.timestamp - b.timestamp);

  const restaurant = restaurants.find(r => r.id === deal.restaurantId);
  // Supplier can be from our activeSupplier state (s-1) or fetch from suppliers array if it's the restaurant looking at others
  let supplierName = "Supplier";
  if (deal.supplierId === activeSupplier.id) {
    supplierName = activeSupplier.name;
  } else {
    supplierName = suppliers.find(s => s.id === deal.supplierId)?.name || "Supplier";
  }

  const restaurantName = restaurant?.name || "Restaurant";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dealMessages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const senderId = currentUserRole === "restaurant" ? deal.restaurantId : deal.supplierId;
    sendMessage(deal.id, inputText.trim(), senderId, currentUserRole);
    setInputText("");
  };

  useEffect(() => {
    markMessagesAsRead(deal.id, currentUserRole);
  }, [dealMessages.length, deal.id, currentUserRole, markMessagesAsRead]);

  const getPartnerName = () => currentUserRole === "restaurant" ? supplierName : restaurantName;

  return (
    <div className="fixed inset-0 bg-white backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="game-panel w-full max-w-md h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-t-4 border-[#00AA13]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[--color-gta-panel]  sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border border-[#00AA13] flex items-center justify-center">
              {currentUserRole === 'restaurant' ? <Truck className="w-5 h-5 text-[#00AA13]" /> : <Store className="w-5 h-5 text-[#00AA13]" />}
            </div>
            <div className="truncate">
              <h2 className="text-xl font-bold text-gray-900 game-title truncate">{getPartnerName()}</h2>
              <p className="text-xs font-bold text-gray-400   game-text">Direct Contact</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white hover:bg-white/10 border border-gray-200 text-gray-400 hover:text-gray-900 transition-all shrink-0 ml-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="p-4 overflow-y-auto flex-1 bg-white flex flex-col space-y-4">
          {dealMessages.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-bold game-text">
              No messages yet.<br/>Start the conversation!
            </div>
          ) : (
            dealMessages.map((msg) => {
              const isMine = msg.senderRole === currentUserRole;
              return (
                <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}>
                  <div className={`p-3 game-text ${isMine ? 'bg-[#00AA13] text-white border border-[#00AA13]' : 'bg-white text-gray-200 border border-gray-200'}`}>
                    <p className="font-bold text-lg">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1  font-bold game-text">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-[--color-gta-panel] shrink-0">
          <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-[#00AA13] game-text font-bold"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <button 
              onClick={handleSend}
              className="px-4 py-3 game-btn game-btn-blue text-gray-900 flex items-center justify-center shrink-0"
              disabled={!inputText.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
