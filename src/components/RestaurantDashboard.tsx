import React, { useState } from "react";
import { Store, Map, Settings, Search, User, Package, Bell, Info } from "lucide-react";
import { MenuManager } from "./MenuManager";
import { RestaurantInventory } from "./RestaurantInventory";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { useAppContext } from "../store/AppContext";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { translate } from "../lib/i18n";

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom, { animate: true });
  return null;
}

function LocationMarker({ position, setPosition }: { position: L.LatLngExpression, setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return (
    <Marker position={position} icon={customIcon}>
      <Popup>My Restaurant Location</Popup>
    </Marker>
  );
}

export function RestaurantDashboard() {
  const { restaurants, activeRestaurantId, updateRestaurantProfile, suppliers, language, deals } = useAppContext();
  const [activeTab, setActiveTab] = useState<"menu" | "inventory" | "profile">("inventory");
  const [showNotifications, setShowNotifications] = useState(false);
  
  const restaurant = restaurants.find(r => r.id === activeRestaurantId);

  // Calculate notifications
  const getNotifications = () => {
    if (!restaurant) return [];
    const alerts: { id: string; message: string; subtext: string; isAlert: boolean }[] = [];

    // 1. Inventory Notifications (Out of stock, Expired, Incoming)
    (restaurant.inventory || []).forEach((item, index) => {
      // Out of stock
      if (item.quantity <= 0) {
         alerts.push({
            id: `inv-empty-${item.id}-${index}`,
            message: language === "en" ? `OUT OF STOCK: ${item.name}` : `STOK HABIS: ${item.name}`,
            subtext: language === "en" ? `You have 0 ${item.unit || 'units'} left.` : `Anda kehabisan stok (${item.quantity} ${item.unit || 'unit'}).`,
            isAlert: true
         });
      }
      
      // Expired or expiring soon (within 3 days)
      if (item.expirationDate) {
        const expDate = new Date(item.expirationDate).getTime();
        const now = new Date().getTime();
        const daysLeft = Math.ceil((expDate - now) / (1000 * 3600 * 24));
        
        if (daysLeft < 0) {
          alerts.push({
            id: `inv-exp-${item.id}-${index}`,
            message: language === "en" ? `EXPIRED: ${item.name}` : `KEDALUWARSA: ${item.name}`,
            subtext: language === "en" ? `Expired on ${item.expirationDate}` : `Telah kedaluwarsa sejak ${item.expirationDate}`,
            isAlert: true
          });
        } else if (daysLeft <= 3) {
          alerts.push({
            id: `inv-warn-${item.id}-${index}`,
            message: language === "en" ? `EXPIRING SOON: ${item.name}` : `HAMPIR KEDALUWARSA: ${item.name}`,
            subtext: language === "en" ? `Expiring in ${daysLeft} days (${item.expirationDate})` : `Akan kedaluwarsa dalam ${daysLeft} hari (${item.expirationDate})`,
            isAlert: true
          });
        }
      }

      // Scheduled incoming items (Keep Order)
      if (item.preOrderDate) {
        alerts.push({
           id: `inv-inc-${item.id}-${index}`,
           message: language === "en" ? `INCOMING: ${item.name}` : `BARANG MASUK: ${item.name}`,
           subtext: language === "en" ? `Scheduled for ${item.preOrderDate}` : `Dijadwalkan masuk pada ${item.preOrderDate}`,
           isAlert: false
        });
      }
    });

    // 2. Deals / Order Status Notification
    const myDeals = deals.filter(d => d.restaurantId === restaurant.id);
    myDeals.forEach(deal => {
      // Find supplier name
      const supplier = suppliers.find(s => s.id === deal.supplierId);
      const supplierName = supplier ? supplier.name : "Unknown Supplier";

      if (deal.status !== "Pending") {
         alerts.push({
           id: `deal-status-${deal.id}`,
           message: language === "en" ? `ORDER UPDATE: ${deal.status}` : `UPDATE ORDERAN: ${deal.status}`,
           subtext: language === "en" ? `Order from ${supplierName} is now ${deal.status}.` : `Pesanan ke ${supplierName} saat ini berstatus ${deal.status}.`,
           isAlert: false // Neutral since it can be "On Delivery", "Accepted" etc.
         });
      }
    });
    
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
  
  const [profileAddress, setProfileAddress] = useState(restaurant?.address || "");
  const [profileLat, setProfileLat] = useState<number | undefined>(restaurant?.lat);
  const [profileLng, setProfileLng] = useState<number | undefined>(restaurant?.lng);
  const [profileSubscription, setProfileSubscription] = useState<"basic" | "premium">(restaurant?.subscriptionPlan || "basic");

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    
    // Use the lat/lng from autocomplete if available, otherwise fallback
    let finalLat = profileLat ?? restaurant.lat;
    let finalLng = profileLng ?? restaurant.lng;
    
    updateRestaurantProfile(restaurant.id, profileName, finalLat, finalLng, profileAddress, profileSubscription);
    alert("Profile updated successfully with location!");
  };

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navbar */}
      <nav className="game-panel m-2 md:m-4 sticky top-2 md:top-4 z-10 px-3 md:px-6 py-2 md:py-4 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded flex items-center justify-center border border-gray-200 shrink-0">
            <Store className="w-5 h-5 md:w-6 md:h-6 text-[#00AA13]" />
          </div>
          <span className="text-lg md:text-2xl game-title leading-none">Dapurku</span>
          <span className="ml-1 md:ml-2 px-1 py-0.5 md:px-2 md:py-0.5 bg-[#00AA13] text-white border border-[#00AA13] text-[10px] md:text-xs rounded tracking-wider game-text shadow-sm whitespace-nowrap">{translate("Restaurant Portal", language)}</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
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

      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 md:py-4 h-full flex flex-col md:flex-row gap-4 md:gap-8">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 flex-shrink-0 flex flex-col min-h-fit md:min-h-[calc(100vh-10rem)]">
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
            <button 
              onClick={() => setActiveTab("inventory")}
              className={`w-full flex items-center md:flex-row flex-col justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded font-bold transition-colors game-btn ${activeTab === 'inventory' ? 'game-btn-blue text-sm md:text-lg' : 'bg-white text-gray-900 text-sm md:text-lg border-gray-200 hover:bg-gray-50'}`}>
              <Package className="w-5 h-5" />
              <span className="game-text whitespace-nowrap">{translate("Inventory", language)}</span>
            </button>
            <button 
              onClick={() => setActiveTab("menu")}
              className={`w-full flex items-center md:flex-row flex-col justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded font-bold transition-colors game-btn ${activeTab === 'menu' ? 'game-btn-blue text-sm md:text-lg' : 'bg-white text-gray-900 text-sm md:text-lg border-gray-200 hover:bg-gray-50'}`}>
              <Settings className="w-5 h-5" />
              <span className="game-text whitespace-nowrap">{restaurant.subscriptionPlan === 'premium' ? translate("Menu Manager", language) : (language === 'en' ? 'Raw Materials' : 'Pengelola Bahan Pokok')}</span>
            </button>
            <button 
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center md:flex-row flex-col justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded font-bold transition-colors game-btn ${activeTab === 'profile' ? 'game-btn-blue text-sm md:text-lg' : 'bg-white text-gray-900 text-sm md:text-lg border-gray-200 hover:bg-gray-50'}`}>
              <User className="w-5 h-5" />
              <span className="game-text whitespace-nowrap">{translate("Profile", language)}</span>
            </button>
          </div>

          <div className="mt-4 md:mt-auto pt-4 md:pt-8 flex justify-center hidden sm:flex pb-4">
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
            <p className="mt-2 text-gray-700 text-lg game-text">{language === "en" ? "Manage your" : "Kelola"} {activeTab === "menu" ? (restaurant.subscriptionPlan === "premium" ? translate("Menu", language).toLowerCase() : (language === "en" ? "raw materials" : "bahan pokok")) : activeTab === "inventory" ? translate("Inventory", language).toLowerCase() : translate("Profile", language).toLowerCase()} {language === "en" ? "and connect with suppliers below." : "dan terhubung dengan pemasok di bawah ini."}</p>
          </header>

          {activeTab === "menu" ? (
            <div className="game-panel p-4">
              <MenuManager />
            </div>
          ) : activeTab === "inventory" ? (
            <RestaurantInventory />
          ) : (
            <div className="bg-white text-left p-6 max-w-2xl rounded-xl border border-gray-200 shadow-sm">
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
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text text-lg"
                    required
                  />
                </div>
                <div>
                   <label className="block text-xl text-gray-700 mb-2 game-text">Address</label>
                   <AddressAutocomplete 
                     value={profileAddress} 
                     onChange={(addr, lat, lng) => {
                        setProfileAddress(addr);
                        if (lat !== undefined && lng !== undefined) {
                          setProfileLat(lat);
                          setProfileLng(lng);
                        }
                     }}
                   />
                </div>
                <div>
                   <label className="block text-xl text-gray-700 mb-2 game-text">Paket Berlangganan</label>
                   <select
                     value={profileSubscription}
                     onChange={(e) => setProfileSubscription(e.target.value as "basic" | "premium")}
                     className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text text-lg"
                   >
                     <option value="basic">Paket Biasa (Logistik & Bahan Pokok)</option>
                     <option value="premium">Paket Lengkap (Logistik & Seluruh Fitur)</option>
                   </select>
                </div>
                <div className="h-64 mt-4 relative z-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                   <MapContainer center={[profileLat || -5.147, profileLng || 119.432]} zoom={14} style={{ height: "100%", width: "100%" }}>
                      <TileLayer
                         url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                         subdomains={['mt0','mt1','mt2','mt3']}
                         attribution="&copy; Google"
                      />
                      <MapUpdater center={[profileLat || -5.147, profileLng || 119.432]} zoom={14} />
                      <LocationMarker 
                         position={[profileLat || -5.147, profileLng || 119.432]} 
                         setPosition={(pos) => { setProfileLat(pos[0]); setProfileLng(pos[1]); }} 
                      />
                   </MapContainer>
                   <div className="absolute top-2 right-2 z-[400] bg-white p-2 text-xs rounded shadow game-text">
                      Click map to pick exact location
                   </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="px-6 py-3 game-btn game-btn-green  text-xl game-text transition w-full">
                    Simpan Profil
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
