import React, { useState, useRef } from "react";
import { Store, Truck, MapPin, X, ImagePlus, Link as LinkIcon, Navigation, MessageCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import { useAppContext } from "../store/AppContext";
import { Restaurant, MenuItem } from "../types";
import { FuelEstimateCard } from "./FuelEstimateCard";
import { ChatModal } from "./ChatModal";
import { SupplierInventory } from "./SupplierInventory";

// Setup custom leaflet icons because default paths get broken in bundlers
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// A green icon for the supplier
const supplierIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// A component to automatically zoom/pan to a specific restaurant when clicked
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom, { animate: true });
  return null;
}

export function SupplierDashboard() {
  const { restaurants, proposeDeal, deals, updateDealStatus, activeSupplier, updateSupplierProfile, messages, updateSupplierInventory, calculateDynamicPrice } = useAppContext();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [activeTab, setActiveTab] = useState<"market" | "orders" | "inventory" | "profile">("market");
  
  // Calculate notifications
  const totalUnreadOrders = deals.filter(d => d.supplierId === activeSupplier.id).reduce((count, deal) => {
    const unreadCount = messages.filter(m => m.dealId === deal.id && m.senderRole === "restaurant" && !m.isRead).length;
    return count + (unreadCount > 0 ? 1 : 0);
  }, 0);
  
  // Deal form state
  const [dealItem, setDealItem] = useState<MenuItem | null>(null);
  const [proposedPrice, setProposedPrice] = useState<number | "">("");
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default map center (London)
  const defaultCenter: [number, number] = [51.505, -0.09];
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  
  // Simulated supplier location (can be made draggable if desired, static for now)
  const supplierLocation: [number, number] = [activeSupplier.lat, activeSupplier.lng];

  // Profile Form State
  const [profileName, setProfileName] = useState(activeSupplier.name);
  const [profileLat, setProfileLat] = useState(activeSupplier.lat.toString());
  const [profileLng, setProfileLng] = useState(activeSupplier.lng.toString());
  const [activeChatDeal, setActiveChatDeal] = useState<any | null>(null);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupplierProfile(profileName, parseFloat(profileLat), parseFloat(profileLng));
    alert("Profile updated successfully!");
  };

  const handleMarkerClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    // Center between supplier and restaurant to show the route
    const midLat = (supplierLocation[0] + restaurant.lat) / 2;
    const midLng = (supplierLocation[1] + restaurant.lng) / 2;
    setMapCenter([midLat, midLng]);
    setDealItem(null);
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
    }
  };

  const handleProposeDeal = () => {
    if (!selectedRestaurant || !dealItem || !proposedPrice || proposedPrice <= 0) return;
    
    proposeDeal({
      restaurantId: selectedRestaurant.id,
      supplierId: activeSupplier.id,
      menuItemId: dealItem.id,
      proposedPrice: Number(proposedPrice),
      mediaUrl: mediaUrl || undefined
    });
    
    setDealItem(null);
    setProposedPrice("");
    setMediaUrl("");
    alert("Deal proposed successfully!");
  };

  const renderMarketList = () => (
    <div className="p-4">
      <h2 className="text-sm font-bold text-[#37B34A] uppercase tracking-wide mb-4 game-text border-b border-white/20 pb-1">Restaurants nearby</h2>
      <div className="space-y-4">
        {restaurants.map(restaurant => (
          <button
            key={restaurant.id}
            onClick={() => handleMarkerClick(restaurant)}
            className="w-full text-left p-4 game-panel-inner hover:bg-white/10 transition-all focus:outline-none cursor-pointer border-l-4 border-l-transparent hover:border-l-[#37B34A] group"
          >
            <h3 className="font-bold text-white text-2xl game-text group-hover:text-[#37B34A]">{restaurant.name}</h3>
            <p className="text-sm text-gray-300 mt-2 flex items-center gap-2 game-text">
              <Store className="w-5 h-5 text-gray-400" /> {restaurant.menu.length} menu items
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderMarketDetail = () => (
    <div className="p-0">
      <div className="p-4 bg-black/60 border-b border-white/10 flex justify-between items-center sticky top-0 z-10 gta-header">
        <h2 className="text-2xl font-bold text-[#37B34A] truncate game-text">{selectedRestaurant?.name}</h2>
        <button 
          onClick={() => {
            setSelectedRestaurant(null);
            setDealItem(null);
            setMapCenter(defaultCenter);
          }}
          className="p-2 text-white bg-[--color-gta-red] hover:bg-red-500 rounded-none transition-colors active:scale-95 border border-[--color-gta-red]"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 game-panel-inner rounded-none min-h-screen bg-transparent">
        {selectedRestaurant && (
          <FuelEstimateCard 
            restaurant={selectedRestaurant} 
            supplierLocation={supplierLocation} 
          />
        )}

        <h3 className="text-lg font-bold text-[#37B34A] uppercase tracking-wide mb-3 mt-6 game-text border-b border-white/20 pb-1">Menu & Market Deals</h3>
        
        {!selectedRestaurant || selectedRestaurant.menu.length === 0 ? (
          <p className="text-gray-400 text-lg game-text font-bold">This restaurant hasn't added any menu items yet.</p>
        ) : (
          <div className="space-y-5">
            {selectedRestaurant.menu.map(item => (
              <div key={item.id} className="game-panel-inner p-4 hover:border-[#37B34A] transition-colors group">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-xl text-white game-text group-hover:text-[#37B34A]">{item.name}</span>
                  <span className="text-sm font-bold text-gray-500 game-text">#SKU-{item.id.substring(0,4).toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white bg-black/50 game-text uppercase px-2 py-1 border border-white/20">{item.category}</span>
                    {item.quantity && (
                      <span className="px-2 py-1 bg-black/50 text-[#1A92D4] text-sm font-bold uppercase border border-[#1A92D4]/50 game-text">
                        Qty: {item.quantity}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-[#37B34A] game-text">${item.price.toFixed(2)}</div>
                </div>
                
                {dealItem?.id === item.id ? (
                  <div className="mt-4 p-4 border border-white/20 bg-black/80 text-white space-y-4">
                    <div>
                      <label className="block text-sm uppercase font-bold text-gray-400 mb-2 game-text tracking-wider">Your Target Supply Bid</label>
                      <div className="flex items-center border-b border-[#37B34A] pb-1">
                        <span className="text-3xl font-bold text-[#37B34A] mr-2 game-text">$</span>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          className="flex-1 w-full bg-transparent border-none focus:ring-0 text-3xl font-bold text-[#37B34A] p-0 outline-none game-text placeholder-gray-600"
                          value={proposedPrice}
                          onChange={e => setProposedPrice(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm uppercase font-bold text-gray-400 mb-2 flex items-center justify-between game-text tracking-wider">
                        <span>Product Photo (Optional)</span>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1 text-[#1A92D4] hover:text-white transition-colors bg-transparent px-2 py-1 border border-[#1A92D4]"
                        >
                          <ImagePlus className="w-4 h-4" /> Upload
                        </button>
                      </label>
                      <input 
                        type="file" 
                        accept="image/*,video/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      <div className="flex items-center border-b border-white/20 pb-2 mt-2">
                        <span className="text-gray-400 mr-2"><LinkIcon className="w-5 h-5" /></span>
                        <input 
                          type="text" 
                          placeholder="Or paste image URL"
                          className="flex-1 w-full bg-transparent border-none focus:ring-0 text-lg p-0 outline-none placeholder-gray-500 text-white game-text"
                          value={mediaUrl}
                          onChange={e => setMediaUrl(e.target.value)}
                        />
                      </div>
                      {mediaUrl && (
                        <div className="mt-3 relative border border-white/20 bg-black/50 h-32 p-1">
                          <img src={mediaUrl} alt="Preview" className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-opacity" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-white/20">
                      <button 
                        onClick={() => {
                          setDealItem(null);
                          setMediaUrl("");
                        }}
                        className="px-4 py-2 border border-white/20 bg-transparent text-white hover:bg-white/10 game-text transition-colors text-lg"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleProposeDeal}
                        className="flex-1 game-btn game-btn-green py-2 text-lg font-bold transition-all text-white game-text px-4"
                      >
                        Send Proposal
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setDealItem(item)}
                    className="mt-3 w-full py-3 border border-white/20 bg-transparent text-white hover:bg-[#37B34A] hover:border-[#37B34A] hover:text-white text-lg font-bold game-text transition-colors uppercase"
                  >
                    Propose Deal
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="p-4">
      <h2 className="text-sm font-bold text-[#37B34A] uppercase tracking-wide mb-4 game-text border-b border-white/20 pb-1">My Deal Bids & Orders</h2>
      <div className="space-y-5">
        {deals.filter(d => d.supplierId === activeSupplier.id).length === 0 ? (
          <div className="text-center py-12 text-lg font-bold text-gray-500 border border-white/10 bg-transparent game-text">You haven't proposed any deals yet.</div>
        ) : (
          deals.filter(d => d.supplierId === activeSupplier.id).map((deal) => {
            const restaurant = restaurants.find(r => r.id === deal.restaurantId);
            const item = restaurant?.menu.find(m => m.id === deal.menuItemId);
            const unreadCount = messages.filter(m => m.dealId === deal.id && m.senderRole === "restaurant" && !m.isRead).length;
            
            return (
              <div key={deal.id} className="game-panel-inner p-4 hover:border-white/20 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-bold text-xl text-white game-text">{item?.name || "Unknown Item"}</span>
                    <div className="text-sm font-bold text-[#1A92D4] game-text uppercase mt-1">{restaurant?.name}</div>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 border uppercase game-text ${
                    deal.status === 'Accepted' ? 'bg-[#37B34A] text-white border-[#37B34A]' :
                    deal.status === 'Rejected' ? 'bg-[--color-gta-red] text-white border-[--color-gta-red]' :
                    deal.status === 'On Delivery' ? 'bg-[#F1B51A] text-black border-[#F1B51A]' :
                    deal.status === 'Delivered' ? 'bg-purple-600 text-white border-purple-600' :
                    'bg-transparent text-gray-400 border-gray-600'
                  }`}>
                    {deal.status}
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#37B34A] mb-4 border-b border-white/10 pb-3 game-text">
                  ${deal.proposedPrice.toFixed(2)}
                </div>
                
                {/* Status update actions for accepted deals */}
                {['Accepted', 'On Delivery', 'Delivered'].includes(deal.status) && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setActiveChatDeal(deal)}
                      className="flex-1 py-2 bg-transparent border border-[#1A92D4] text-[#1A92D4] hover:bg-[#1A92D4] hover:text-white text-sm font-bold transition-colors game-text uppercase flex items-center justify-center gap-2 relative"
                    >
                      <MessageCircle className="w-4 h-4" /> Chat
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {deal.status === 'Accepted' && (
                      <button 
                        onClick={() => updateDealStatus(deal.id, 'On Delivery')}
                        className="flex-1 py-2 bg-transparent border border-[#F1B51A] text-[#F1B51A] hover:bg-[#F1B51A] hover:text-black text-sm font-bold transition-colors game-text uppercase"
                      >
                        Mark On Delivery
                      </button>
                    )}
                    {(deal.status === 'Accepted' || deal.status === 'On Delivery') && (
                      <button 
                        onClick={() => updateDealStatus(deal.id, 'Delivered')}
                        className="flex-1 py-2 bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white text-sm font-bold transition-colors game-text uppercase"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="p-4">
      <h2 className="text-sm font-bold text-[#37B34A] uppercase tracking-wide mb-4 game-text border-b border-white/20 pb-1">Supplier Profile</h2>
      <div className="game-panel-inner p-6 gta-header border-t-4 border-[#37B34A]">
        <form onSubmit={handleProfileSave} className="space-y-5">
          <div>
            <label className="block text-xl text-gray-300 mb-2 game-text">Supplier Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full p-3 rounded-none focus:outline-none game-text text-xl"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xl text-gray-300 mb-2 game-text">Latitude</label>
              <input
                type="number"
                step="any"
                value={profileLat}
                onChange={(e) => setProfileLat(e.target.value)}
                className="w-full p-3 rounded-none focus:outline-none game-text text-xl"
                required
              />
            </div>
            <div>
              <label className="block text-xl text-gray-300 mb-2 game-text">Longitude</label>
              <input
                type="number"
                step="any"
                value={profileLng}
                onChange={(e) => setProfileLng(e.target.value)}
                className="w-full p-3 rounded-none focus:outline-none game-text text-xl"
                required
              />
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full py-3 game-btn game-btn-green font-bold transition-all text-xl game-text tracking-widest text-white uppercase rounded-none">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-transparent flex-col md:flex-row overflow-hidden relative">
      
      {/* Sidebar: List of Restaurants or Selected Restaurant Detail */}
      <div className="w-full md:w-96 game-panel rounded-none flex flex-col h-full z-10 border-0 border-r border-white/10 shrink-0 relative">
        <div className="flex items-center justify-between px-6 py-5 bg-[--color-gta-panel] gta-header">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#37B34A] border border-white/20 flex items-center justify-center shadow-none">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-white game-title drop-shadow-none">SupplyMap</span>
          </div>
          <span className="px-3 py-1 bg-[#1A92D4] border border-[#1A92D4] text-white text-xs font-bold uppercase game-text shadow-none">Supplier</span>
        </div>

        <div className="flex border-b border-white/10 bg-[--color-gta-panel]">
          <button 
            className={`flex-1 py-3 text-sm font-bold game-text uppercase border-r border-white/10 transition-colors ${activeTab === 'market' ? 'bg-[#37B34A] text-white' : 'text-gray-400 hover:bg-white/10'}`}
            onClick={() => setActiveTab('market')}
          >
            Market
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold game-text uppercase border-r border-white/10 transition-colors relative ${activeTab === 'orders' ? 'bg-[#37B34A] text-white' : 'text-gray-400 hover:bg-white/10'}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
            {totalUnreadOrders > 0 && (
              <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                {totalUnreadOrders}
              </span>
            )}
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold game-text uppercase border-r border-white/10 transition-colors ${activeTab === 'inventory' ? 'bg-[#37B34A] text-white' : 'text-gray-400 hover:bg-white/10'}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold game-text uppercase transition-colors ${activeTab === 'profile' ? 'bg-[#37B34A] text-white' : 'text-gray-400 hover:bg-white/10'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full bg-transparent">
          {activeTab === "market" && !selectedRestaurant && renderMarketList()}
          {activeTab === "market" && selectedRestaurant && renderMarketDetail()}
          {activeTab === "orders" && renderOrders()}
          {activeTab === "inventory" && <SupplierInventory />}
          {activeTab === "profile" && renderProfile()}
        </div>
      </div>


      {/* Main Map Area */}
      <div className="flex-1 relative z-0 h-full min-h-[50vh]">
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapUpdater center={mapCenter} zoom={selectedRestaurant ? 14 : 13} />

          {/* Supplier Marker */}
          <Marker position={supplierLocation} icon={supplierIcon}>
            <Popup>
              <div className="font-semibold text-emerald-700">{activeSupplier.name} (You)</div>
              <div className="text-xs text-slate-500">Origin for deliveries</div>
            </Popup>
          </Marker>

          {/* Route Line (if a restaurant is selected) */}
          {selectedRestaurant && (
            <Polyline 
              positions={[supplierLocation, [selectedRestaurant.lat ?? 51.505, selectedRestaurant.lng ?? -0.09]]} 
              pathOptions={{ color: '#10b981', weight: 4, opacity: 0.7, dashArray: '10, 10' }} 
            />
          )}

          {restaurants.map(restaurant => {
            const lat = restaurant.lat ?? 51.505;
            const lng = restaurant.lng ?? -0.09;
            return (
              <Marker 
                key={restaurant.id} 
                position={[lat, lng]} 
                icon={customIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(restaurant)
                }}
              >
                <Popup>
                  <div className="font-semibold">{restaurant.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{restaurant.menu?.length || 0} menu items</div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {activeChatDeal && (
        <ChatModal 
          deal={activeChatDeal} 
          onClose={() => setActiveChatDeal(null)} 
          currentUserRole="supplier" 
        />
      )}
    </div>
  );
}
