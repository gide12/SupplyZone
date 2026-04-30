/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { AppProvider, useAppContext } from "./store/AppContext";
import { RestaurantDashboard } from "./components/RestaurantDashboard";
import { SupplierDashboard } from "./components/SupplierDashboard";
import { Store, Truck } from "lucide-react";

function RoleSwitcher() {
  const { currentUserMode, setCurrentUserMode, messages, activeRestaurantId, activeSupplier, deals } = useAppContext();

  const unreadRestaurant = messages.filter(m => m.senderRole === "supplier" && !m.isRead && deals.some(d => d.id === m.dealId && d.restaurantId === activeRestaurantId)).length;
  const unreadSupplier = messages.filter(m => m.senderRole === "restaurant" && !m.isRead && deals.some(d => d.id === m.dealId && d.supplierId === activeSupplier.id)).length;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] game-panel p-2 flex gap-2">
      <button
        onClick={() => setCurrentUserMode("restaurant")}
        className={`flex items-center gap-2 px-4 py-2 text-sm game-btn relative ${
          currentUserMode === "restaurant" 
            ? "bg-[#1A92D4] text-white border-[#1A92D4] font-bold shadow-sm" 
            : "bg-transparent text-gray-400 border-white/20 hover:text-white"
        }`}
      >
        <Store className="w-4 h-4" />
        <span className="hidden sm:inline game-text">Restaurant Mode</span>
        {unreadRestaurant > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]">
            {unreadRestaurant}
          </span>
        )}
      </button>
      <button
        onClick={() => setCurrentUserMode("supplier")}
        className={`flex items-center gap-2 px-4 py-2 text-sm game-btn relative ${
          currentUserMode === "supplier" 
            ? "bg-[#37B34A] text-white border-[#37B34A] font-bold shadow-sm" 
            : "bg-transparent text-gray-400 border-white/20 hover:text-white"
        }`}
      >
        <Truck className="w-4 h-4" />
        <span className="hidden sm:inline game-text">Supplier Portal</span>
        {unreadSupplier > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]">
            {unreadSupplier}
          </span>
        )}
      </button>
    </div>
  );
}

function Main() {
  const { currentUserMode } = useAppContext();
  
  return (
    <>
      <RoleSwitcher />
      {currentUserMode === "restaurant" ? <RestaurantDashboard /> : <SupplierDashboard />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
}
