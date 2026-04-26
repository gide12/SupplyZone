import React from "react";
import { Store, Map, Settings, Search } from "lucide-react";
import { MenuManager } from "./MenuManager";
import { useAppContext } from "../store/AppContext";

export function RestaurantDashboard() {
  const { restaurants, activeRestaurantId } = useAppContext();
  const restaurant = restaurants.find(r => r.id === activeRestaurantId);

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">SupplyMap</span>
            <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">Restaurant Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-500 uppercase">Logged in as</p>
              <p className="text-sm font-bold text-slate-900">{restaurant.name}</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600">
              {restaurant.name.charAt(0)}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl font-bold transition-colors">
            <Settings className="w-5 h-5" />
            Menu Manager
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Store className="w-5 h-5" />
            My Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-50 rounded-xl font-medium transition-colors cursor-not-allowed" title="Coming soon">
            <Search className="w-5 h-5" />
            Find Suppliers
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-50 rounded-xl font-medium transition-colors cursor-not-allowed" title="Coming soon">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <header>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {restaurant.name}</h1>
            <p className="mt-1 text-slate-500 text-sm">Manage your menu and connect with suppliers below.</p>
          </header>

          <MenuManager />
        </div>
      </main>
    </div>
  );
}
