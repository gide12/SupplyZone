import React, { useState, useRef } from "react";
import { Store, Truck, MapPin, X, ImagePlus, Link as LinkIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useAppContext } from "../store/AppContext";
import { Restaurant, MenuItem } from "../types";

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

// A component to automatically zoom/pan to a specific restaurant when clicked
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom, { animate: true });
  return null;
}

export function SupplierDashboard() {
  const { restaurants, proposeDeal, deals } = useAppContext();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  
  // Deal form state
  const [dealItem, setDealItem] = useState<MenuItem | null>(null);
  const [proposedPrice, setProposedPrice] = useState<number | "">("");
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default map center (London)
  const defaultCenter: [number, number] = [51.505, -0.09];
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);

  const handleMarkerClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setMapCenter([restaurant.lat, restaurant.lng]);
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
      supplierId: "s-1", // Simulated supplier ID
      menuItemId: dealItem.id,
      proposedPrice: Number(proposedPrice),
      mediaUrl: mediaUrl || undefined
    });
    
    setDealItem(null);
    setProposedPrice("");
    setMediaUrl("");
    alert("Deal proposed successfully!");
  };

  return (
    <div className="flex h-screen bg-slate-50 flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar: List of Restaurants or Selected Restaurant Detail */}
      <div className="w-full md:w-96 bg-white border-r border-slate-200 flex flex-col h-full shadow-xl z-10">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SupplyMap</span>
          </div>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase">Supplier</span>
        </div>

        <div className="flex-1 overflow-y-auto w-full">
          {!selectedRestaurant ? (
            // LIST VIEW
            <div className="p-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Restaurants nearby</h2>
              <div className="space-y-3">
                {restaurants.map(restaurant => (
                  <button
                    key={restaurant.id}
                    onClick={() => handleMarkerClick(restaurant)}
                    className="w-full text-left p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <h3 className="font-bold text-slate-800">{restaurant.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Store className="w-4 h-4" /> {restaurant.menu.length} menu items
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // DETAIL VIEW
            <div className="p-0">
              {/* Back button area */}
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center sticky top-0">
                <h2 className="text-lg font-bold text-slate-800 truncate">{selectedRestaurant.name}</h2>
                <button 
                  onClick={() => {
                    setSelectedRestaurant(null);
                    setDealItem(null);
                    setMapCenter(defaultCenter);
                  }}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white border rounded-full transition-colors border-transparent hover:border-slate-200 shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Menu & Market Deals</h3>
                
                {selectedRestaurant.menu.length === 0 ? (
                  <p className="text-slate-500 text-sm">This restaurant hasn't added any menu items yet.</p>
                ) : (
                  <div className="space-y-4">
                    {selectedRestaurant.menu.map(item => (
                      <div key={item.id} className="border border-slate-100 rounded-xl p-3 bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-sm text-slate-800">{item.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">#SKU-{item.id.substring(0,4).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-500">{item.category}</span>
                            {item.quantity && (
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold rounded uppercase border border-blue-100">
                                Qty: {item.quantity}
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-bold text-blue-600">${item.price.toFixed(2)}</div>
                        </div>
                        
                        {dealItem?.id === item.id ? (
                          <div className="mt-4 p-4 bg-slate-900 rounded-2xl text-white space-y-4">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Your Target Supply Bid</label>
                              <div className="flex items-center border-b border-blue-500 pb-1">
                                <span className="text-lg font-bold text-blue-600 mr-1">$</span>
                                <input 
                                  type="number" 
                                  placeholder="0.00"
                                  className="flex-1 w-full bg-transparent border-none focus:ring-0 text-lg font-bold text-blue-500 p-0 outline-none"
                                  value={proposedPrice}
                                  onChange={e => setProposedPrice(e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
                                <span>Product Photo (Optional)</span>
                                <button 
                                  onClick={() => fileInputRef.current?.click()}
                                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  <ImagePlus className="w-3 h-3" /> Upload
                                </button>
                              </label>
                              <input 
                                type="file" 
                                accept="image/*,video/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                              />
                              <div className="flex items-center border-b border-slate-600 pb-1 mt-1">
                                <span className="text-slate-400 mr-2"><LinkIcon className="w-4 h-4" /></span>
                                <input 
                                  type="text" 
                                  placeholder="Or paste image URL"
                                  className="flex-1 w-full bg-transparent border-none focus:ring-0 text-sm p-0 outline-none placeholder-slate-500 text-white"
                                  value={mediaUrl}
                                  onChange={e => setMediaUrl(e.target.value)}
                                />
                              </div>
                              {mediaUrl && (
                                <div className="mt-3 relative rounded-lg overflow-hidden border border-slate-700 bg-slate-800 h-24">
                                  <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button 
                                onClick={() => {
                                  setDealItem(null);
                                  setMediaUrl("");
                                }}
                                className="px-4 py-2.5 text-xs text-slate-400 hover:text-white rounded-xl font-bold transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={handleProposeDeal}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-white"
                              >
                                Send Proposal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDealItem(item)}
                            className="mt-3 w-full py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-xl text-xs font-bold transition-colors"
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
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative z-0 h-full min-h-[50vh]">
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapUpdater center={mapCenter} zoom={selectedRestaurant ? 15 : 13} />

          {restaurants.map(restaurant => (
            <Marker 
              key={restaurant.id} 
              position={[restaurant.lat, restaurant.lng]} 
              icon={customIcon}
              eventHandlers={{
                click: () => handleMarkerClick(restaurant)
              }}
            >
              <Popup>
                <div className="font-semibold">{restaurant.name}</div>
                <div className="text-xs text-gray-500 mt-1">{restaurant.menu.length} menu items</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

    </div>
  );
}
