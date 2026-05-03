import React, { useState } from "react";
import { Store, Map, Settings, Search, User, Package, Bell, Info } from "lucide-react";
import { MenuManager } from "./MenuManager";
import { RestaurantInventory } from "./RestaurantInventory";
import { useAppContext } from "../store/AppContext";
import { translate } from "../lib/i18n";

export function RestaurantDashboard() {
  const { restaurants, activeRestaurantId, updateRestaurantProfile, suppliers, language } = useAppContext();
  const [activeTab, setActiveTab] = useState<"menu" | "inventory" | "profile">("menu");
  const [showNotifications, setShowNotifications] = useState(false);
  
  const restaurant = restaurants.find(r => r.id === activeRestaurantId);

  // Calculate notifications
  const getNotifications = () => {
    if (!restaurant) return [];
    
    // items restaurant buys (from inventory or menu)
    const trackedItems = new Set([
      ...(restaurant.inventory || []).map(i => i.name.toLowerCase()),
      ...(restaurant.menu || []).map(m => m.name.toLowerCase())
    ]);

    const allSupplierItems = suppliers.flatMap(s => (s.inventory || []).map(i => ({ supplier: s.name, item: i.name, price: i.basePrice })));
    
    const itemGroups = allSupplierItems.reduce((acc, curr) => {
      const key = curr.item.toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {} as Record<string, {supplier: string, item: string, price: number}[]>);

    const alerts: { id: string; message: string; subtext: string; isAlert: boolean }[] = [];

    Object.entries(itemGroups).forEach(([key, items]: [string, {supplier: string, item: string, price: number}[]]) => {
      if (trackedItems.has(key) && items.length > 1) {
        const avgPrice = items.reduce((sum, i) => sum + i.price, 0) / items.length;
        const lowestSupplier = [...items].sort((a,b) => a.price - b.price)[0];
        
        const percDrop = ((avgPrice - lowestSupplier.price) / avgPrice) * 100;
        if (percDrop > 5) { // Notify if more than 5% lower than average
          alerts.push({
            id: `deal-${key}`,
            message: language === "en" ? `PRICE DROP: ${lowestSupplier.item} is ${Math.round(percDrop)}% below market avg!` : `PENURUNAN HARGA: ${lowestSupplier.item} ${Math.round(percDrop)}% di bawah rata-rata pasar!`,
            subtext: language === "en" ? `From ${lowestSupplier.supplier} at ${lowestSupplier.price.toFixed(2)}.` : `Dari ${lowestSupplier.supplier} seharga ${lowestSupplier.price.toFixed(2)}.`,
            isAlert: true
          });
        }
      }
    });

    return alerts;
  };

  const notifications = getNotifications();

  // Profile Form State
  const [profileName, setProfileName] = useState(restaurant?.name || "");
  const [profileLat, setProfileLat] = useState(restaurant?.lat?.toString() || "");
  const [profileLng, setProfileLng] = useState(restaurant?.lng?.toString() || "");

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    updateRestaurantProfile(restaurant.id, profileName, parseFloat(profileLat), parseFloat(profileLng));
    alert("Profile updated successfully!");
  };

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navbar */}
      <nav className="game-panel m-4 sticky top-4 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center border border-gray-200">
            <Store className="w-6 h-6 text-[#00AA13]" />
          </div>
          <span className="text-2xl game-title ">Dapurku</span>
          <span className="ml-2 px-2 py-0.5 bg-[#00AA13] text-white border border-[#00AA13] text-xs rounded  tracking-wider game-text shadow-sm">{translate("Restaurant Portal", language)}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 bg-white hover:bg-white rounded flex items-center justify-center border border-gray-200 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EE2737] text-[10px] font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-2xl p-4 z-50">
                <h3 className="text-gray-900 font-bold text-lg game-text  border-b border-gray-200 pb-2 mb-3">{language === "en" ? "Market Alerts" : "Peringatan Pasar"}</h3>
                {notifications.length === 0 ? (
                  <p className="text-gray-400 text-sm game-text italic text-center py-4">{language === "en" ? "No new alerts at this time." : "Tidak ada peringatan baru saat ini."}</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.map(note => (
                      <div key={note.id} className="bg-[#EE2737]/10 border border-[#EE2737] p-3 text-left">
                        <div className="text-gray-900 font-bold game-text text-sm leading-snug">{note.message}</div>
                        <div className="text-gray-400 text-xs game-text mt-1">{note.subtext}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-right hidden sm:block border-l border-gray-200 pl-4">
            <p className="text-xs text-gray-400  game-text">{translate("Logged in as", language)}</p>
            <p className="text-lg text-gray-900 game-text">{restaurant.name}</p>
          </div>
          <div className="w-10 h-10 bg-white rounded-full border flex items-center justify-center font-bold text-black game-text text-xl">
            {restaurant.name.charAt(0)}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-full flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 flex-shrink-0 flex flex-col min-h-[calc(100vh-10rem)]">
          <div className="space-y-4">
            <button 
              onClick={() => setActiveTab("menu")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded font-bold transition-colors game-btn ${activeTab === 'menu' ? 'game-btn-blue text-lg' : 'bg-white text-gray-900 text-lg border-gray-200 hover:bg-white/10'}`}>
              <Settings className="w-5 h-5" />
              <span className="game-text">{translate("Menu Manager", language)}</span>
            </button>
            <button 
              onClick={() => setActiveTab("inventory")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded font-bold transition-colors game-btn ${activeTab === 'inventory' ? 'game-btn-blue text-lg' : 'bg-white text-gray-900 text-lg border-gray-200 hover:bg-white/10'}`}>
              <Package className="w-5 h-5" />
              <span className="game-text">{translate("Inventory", language)} & AI</span>
            </button>
            <button 
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded font-bold transition-colors game-btn ${activeTab === 'profile' ? 'game-btn-blue text-lg' : 'bg-white text-gray-900 text-lg border-gray-200 hover:bg-white/10'}`}>
              <User className="w-5 h-5" />
              <span className="game-text">{translate("Profile", language)}</span>
            </button>
          </div>

          <div className="mt-8 md:mt-auto pt-8 flex justify-center hidden sm:flex pb-4">
            <div className="relative group p-4 border border-gray-200 bg-white w-full text-center rounded-xl shadow-sm">
              <div className="text-sm font-bold text-[#00AA13] game-text">
                DAPURKU
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <header className="game-panel p-4 pb-2 mb-4 ">
            <h1 className="text-3xl game-title">{language === "en" ? "Welcome back" : "Selamat datang kembali"}, {restaurant.name}</h1>
            <p className="mt-2 text-gray-700 text-lg game-text">{language === "en" ? "Manage your" : "Kelola"} {activeTab === "menu" ? translate("Menu", language).toLowerCase() : activeTab === "inventory" ? translate("Inventory", language).toLowerCase() : translate("Profile", language).toLowerCase()} {language === "en" ? "and connect with suppliers below." : "dan terhubung dengan pemasok di bawah ini."}</p>
          </header>

          {activeTab === "menu" ? (
            <div className="game-panel p-4">
              <MenuManager />
            </div>
          ) : activeTab === "inventory" ? (
            <RestaurantInventory />
          ) : (
            <div className="game-panel text-left p-6 max-w-2xl border-t-4 border-[#00AA13]">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 game-text border-b border-gray-200 pb-2">
                <Store className="w-6 h-6 text-[#00AA13]" />
                Restaurant Details
              </h2>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="block text-xl text-gray-700 mb-2 game-text">Restaurant Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full p-2.5 rounded-none focus:outline-none game-text text-xl"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xl text-gray-700 mb-2 game-text">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={profileLat}
                      onChange={(e) => setProfileLat(e.target.value)}
                      className="w-full p-2.5 rounded-none focus:outline-none game-text text-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xl text-gray-700 mb-2 game-text">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={profileLng}
                      onChange={(e) => setProfileLng(e.target.value)}
                      className="w-full p-2.5 rounded-none focus:outline-none game-text text-xl"
                      required
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="px-6 py-3 game-btn game-btn-green rounded-none text-xl game-text transition w-full">
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
