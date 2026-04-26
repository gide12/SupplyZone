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
    <div className="fixed bottom-6 right-6 z-[9999] bg-slate-100 p-1.5 rounded-xl shadow-xl border border-slate-200 flex gap-1">
      <button
        onClick={() => setCurrentUserMode("restaurant")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
          currentUserMode === "restaurant" 
            ? "bg-white text-blue-600 font-bold shadow-sm" 
            : "text-slate-500 hover:text-slate-700 font-medium"
        }`}
      >
        <Store className="w-4 h-4" />
        <span className="hidden sm:inline">Restaurant Mode</span>
      </button>
      <button
        onClick={() => setCurrentUserMode("supplier")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
          currentUserMode === "supplier" 
            ? "bg-white text-blue-600 font-bold shadow-sm" 
            : "text-slate-500 hover:text-slate-700 font-medium"
        }`}
      >
        <Truck className="w-4 h-4" />
        <span className="hidden sm:inline">Supplier Portal</span>
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
