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
  const { currentUserMode, setCurrentUserMode } = useAppContext();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] game-panel p-2 flex gap-2">
      <button
        onClick={() => setCurrentUserMode("restaurant")}
        className={`flex items-center gap-2 px-4 py-2 text-sm game-btn ${
          currentUserMode === "restaurant" 
            ? "bg-[#1A92D4] text-white border-[#1A92D4] font-bold shadow-sm" 
            : "bg-transparent text-gray-400 border-white/20 hover:text-white"
        }`}
      >
        <Store className="w-4 h-4" />
        <span className="hidden sm:inline game-text">Restaurant Mode</span>
      </button>
      <button
        onClick={() => setCurrentUserMode("supplier")}
        className={`flex items-center gap-2 px-4 py-2 text-sm game-btn ${
          currentUserMode === "supplier" 
            ? "bg-[#37B34A] text-white border-[#37B34A] font-bold shadow-sm" 
            : "bg-transparent text-gray-400 border-white/20 hover:text-white"
        }`}
      >
        <Truck className="w-4 h-4" />
        <span className="hidden sm:inline game-text">Supplier Portal</span>
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
