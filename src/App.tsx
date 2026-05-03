/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { AppProvider, useAppContext } from "./store/AppContext";
import { RestaurantDashboard } from "./components/RestaurantDashboard";
import { SupplierDashboard } from "./components/SupplierDashboard";
import { Store, Truck, Globe } from "lucide-react";
import { translate } from "./lib/i18n";

function RoleSwitcher() {
  const { currentUserMode, setCurrentUserMode, messages, activeRestaurantId, activeSupplier, deals, language, setLanguage } = useAppContext();

  const unreadRestaurant = messages.filter(m => m.senderRole === "supplier" && !m.isRead && deals.some(d => d.id === m.dealId && d.restaurantId === activeRestaurantId)).length;
  const unreadSupplier = messages.filter(m => m.senderRole === "restaurant" && !m.isRead && deals.some(d => d.id === m.dealId && d.supplierId === activeSupplier.id)).length;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] game-panel p-2 flex gap-2">
      <button
        onClick={() => setLanguage(language === "en" ? "id" : "en")}
        className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full hover:bg-gray-100 text-gray-900 shadow-sm"
        title={translate(language === "en" ? "Switch to Indonesian" : "Switch to English", language)}
      >
        <Globe className="w-5 h-5" />
        <span className="sr-only">Toggle Language</span>
        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm font-bold uppercase">{language}</span>
      </button>

      <button
        onClick={() => setCurrentUserMode("restaurant")}
        className={`flex items-center gap-2 px-4 py-2 text-sm game-btn relative ${
          currentUserMode === "restaurant" 
            ? "bg-[#EE2737] text-white border-[#EE2737] font-bold shadow-sm" 
            : "bg-white text-gray-500 border-gray-200 hover:text-gray-900"
        }`}
      >
        <Store className="w-4 h-4" />
        <span className="hidden sm:inline game-text">{translate("Restaurant Portal", language)}</span>
        {unreadRestaurant > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#EE2737] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
            {unreadRestaurant}
          </span>
        )}
      </button>
      <button
        onClick={() => setCurrentUserMode("supplier")}
        className={`flex items-center gap-2 px-4 py-2 text-sm game-btn relative ${
          currentUserMode === "supplier" 
            ? "bg-[#00AA13] text-white border-[#00AA13] font-bold shadow-sm" 
            : "bg-white text-gray-500 border-gray-200 hover:text-gray-900"
        }`}
      >
        <Truck className="w-4 h-4" />
        <span className="hidden sm:inline game-text">{translate("Supplier Portal", language)}</span>
        {unreadSupplier > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#EE2737] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
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
