import React, { useState, useRef } from "react";
import { Store, Truck, MapPin, X, ImagePlus, Link as LinkIcon, Navigation, MessageCircle, Map, User, Package, Calculator, Handshake, Bell } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { useAppContext } from "../store/AppContext";
import { Restaurant, MenuItem } from "../types";
import { FuelEstimateCard } from "./FuelEstimateCard";
import { ChatModal } from "./ChatModal";
import { SupplierInventory } from "./SupplierInventory";
import { SupplierCalculator } from "./SupplierCalculator";
import { translate } from "../lib/i18n";

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
  const { restaurants, proposeDeal, deals, updateDealStatus, activeSupplier, updateSupplierProfile, messages, updateSupplierInventory, calculateDynamicPrice, language } = useAppContext();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [activeTab, setActiveTab] = useState<"market" | "orders" | "inventory" | "profile" | "hitung">("market");
  
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
  const defaultCenter: [number, number] = [-5.147665, 119.432731];
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  
  // Simulated supplier location (can be made draggable if desired, static for now)
  const supplierLocation: [number, number] = [activeSupplier.lat, activeSupplier.lng];

  // Profile Form State
  const [profileName, setProfileName] = useState(activeSupplier.name);
  
  const [profileAddress, setProfileAddress] = useState(activeSupplier?.address || "");
  const [profileLat, setProfileLat] = useState<number | undefined>(activeSupplier.lat);
  const [profileLng, setProfileLng] = useState<number | undefined>(activeSupplier.lng);
  const [activeChatDeal, setActiveChatDeal] = useState<any | null>(null);

  const [showNotifications, setShowNotifications] = useState(false);

  const getNotifications = () => {
    const alerts: { id: string; message: string; subtext: string; isAlert: boolean }[] = [];

    // 1. Inventory Notifications (Out of stock, Expired, Incoming)
    (activeSupplier.inventory || []).forEach((item, index) => {
      if (item.quantity <= 0) {
         alerts.push({
            id: `inv-empty-${item.id}-${index}`,
            message: language === "en" ? `OUT OF STOCK: ${item.name}` : `STOK HABIS: ${item.name}`,
            subtext: language === "en" ? `You have 0 ${item.unit || 'units'} left.` : `Anda kehabisan stok (${item.quantity} ${item.unit || 'unit'}).`,
            isAlert: true
         });
      }
      
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

      if (item.expectedSupplyDate) {
        alerts.push({
           id: `inv-inc-${item.id}-${index}`,
           message: language === "en" ? `INCOMING: ${item.name}` : `BARANG MASUK: ${item.name}`,
           subtext: language === "en" ? `Scheduled for ${item.expectedSupplyDate}` : `Dijadwalkan masuk pada ${item.expectedSupplyDate}`,
           isAlert: false
        });
      }
    });

    // 2. Deals / Order Notification
    const supplierDeals = deals.filter(d => d.supplierId === activeSupplier.id);
    supplierDeals.forEach(deal => {
      const rest = restaurants.find(r => r.id === deal.restaurantId);
      const restName = rest ? rest.name : "Unknown Restaurant";

      if (deal.status === "Pending") {
         alerts.push({
           id: `deal-status-${deal.id}`,
           message: language === "en" ? `NEW ORDER PENDING` : `ORDER BARU TERTUNDA`,
           subtext: language === "en" ? `New order from ${restName}.` : `Ada pesanan masuk dari ${restName}.`,
           isAlert: true
         });
      } else {
         alerts.push({
           id: `deal-status-${deal.id}`,
           message: language === "en" ? `ORDER UPDATE: ${deal.status}` : `UPDATE ORDERAN: ${deal.status}`,
           subtext: language === "en" ? `Order with ${restName} is now ${deal.status}.` : `Pesanan dengan ${restName} saat ini berstatus ${deal.status}.`,
           isAlert: false
         });
      }
    });

    return alerts;
  };

  const notifications = getNotifications();

  // Route Geometry state
  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);

  React.useEffect(() => {
    if (selectedRestaurant && supplierLocation[0] && supplierLocation[1] && selectedRestaurant.lat && selectedRestaurant.lng) {
      const fetchRoute = async () => {
        try {
          // OSRM expects: longitude,latitude
          const start = `${supplierLocation[1]},${supplierLocation[0]}`;
          const end = `${selectedRestaurant.lng},${selectedRestaurant.lat}`;
          const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start};${end}?geometries=geojson`);
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            // OSRM geojson returns coordinates as [longitude, latitude]. Leaflet expects [latitude, longitude].
            const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
            setRouteGeometry(coords);
          } else {
            console.warn("No route found from OSRM");
            setRouteGeometry([supplierLocation, [selectedRestaurant.lat!, selectedRestaurant.lng!]]);
          }
        } catch (err) {
          console.error("OSRM fetch error:", err);
          setRouteGeometry([supplierLocation, [selectedRestaurant.lat!, selectedRestaurant.lng!]]);
        }
      };
      setRouteGeometry([]); // reset while loading
      fetchRoute();
    } else {
      setRouteGeometry([]);
    }
  }, [selectedRestaurant, supplierLocation[0], supplierLocation[1]]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalLat = profileLat ?? activeSupplier.lat;
    let finalLng = profileLng ?? activeSupplier.lng;
    
    updateSupplierProfile(activeSupplier.id, profileName, finalLat, finalLng, profileAddress);
    setMapCenter([finalLat, finalLng]);
    alert("Profile updated successfully with location!");
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
      <h2 className="text-sm font-bold text-[#00AA13] tracking-wide mb-4 border-b border-gray-100 pb-2">Restoran Terdekat</h2>
      <div className="space-y-4">
        {restaurants.map(restaurant => (
          <button
            key={restaurant.id}
            onClick={() => handleMarkerClick(restaurant)}
            className="w-full text-left p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-[#00AA13]/30 transition-all focus:outline-none cursor-pointer group"
          >
            <h3 className="font-bold text-gray-900 text-xl group-hover:text-[#00AA13] transition-colors">{restaurant.name}</h3>
            {restaurant.address && <p className="text-xs text-gray-500 mt-1 truncate">{restaurant.address}</p>}
            <p className="text-sm text-gray-700 mt-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-gray-400" /> {restaurant.menu.length} menu items
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderMarketDetail = () => (
    <div className="p-0">
      <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-bold text-[#00AA13] truncate">{selectedRestaurant?.name}</h2>
          {selectedRestaurant?.address && <p className="text-[11px] text-gray-500 mt-0.5 truncate w-48">{selectedRestaurant.address}</p>}
        </div>
        <button 
          onClick={() => {
            setSelectedRestaurant(null);
            setDealItem(null);
            setMapCenter(defaultCenter);
          }}
          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 min-h-screen bg-gray-50/30">
        {selectedRestaurant && (
          <FuelEstimateCard 
            restaurant={selectedRestaurant} 
            supplierLocation={supplierLocation} 
          />
        )}

        <h3 className="text-lg font-bold text-gray-900 tracking-wide mb-4 mt-6 pb-2">Tawaran Pasar & Menu</h3>
        
        {!selectedRestaurant || (selectedRestaurant.menu.length === 0 && selectedRestaurant.inventory?.filter(i => i.preOrderDate).length === 0) ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-400 text-sm">Belum ada menu atau keep order yang ditambahkan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedRestaurant.inventory?.filter(i => i.preOrderDate).map(item => (
              <div key={item.id} className="bg-white border border-[#EE2737]/30 rounded-2xl p-5 hover:border-[#EE2737] hover:shadow-sm transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#EE2737] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                  KEEP ORDER
                </div>
                <div className="flex justify-between items-center mb-3 mt-2">
                  <span className="font-bold text-gray-900 group-hover:text-[#EE2737] transition-colors">{item.name}</span>
                  <span className="text-xs font-medium text-gray-400">#INV-{item.id.substring(0,4).toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[11px] text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full">Bahan Baku</span>
                    <span className="px-2.5 py-1 bg-red-50 text-[#EE2737] text-[11px] font-bold rounded-full">
                      Butuh: {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-gray-600">
                    Masuk: {item.preOrderDate}
                  </div>
                </div>
                
                {dealItem?.id === item.id ? (
                  <div className="mt-2 p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wide uppercase">Your Target Supply Bid</label>
                      <div className="flex items-center border-b border-[#00AA13] pb-1 bg-white px-3 py-2 rounded-lg focus-within:ring-2 focus-within:ring-[#00AA13]/20 transition-all">
                        <span className="text-lg font-bold text-[#00AA13] mr-2">Rp</span>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          className="flex-1 w-full bg-transparent border-none focus:ring-0 text-xl font-bold text-gray-900 p-0 outline-none placeholder-gray-300"
                          value={proposedPrice}
                          onChange={e => setProposedPrice(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center justify-between tracking-wide uppercase">
                        <span>Product Photo (Optional)</span>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1 text-[#00AA13] hover:text-[#009110] transition-colors text-xs bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm"
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
                      <div className="flex items-center bg-white border border-gray-200 px-3 py-2 rounded-lg mt-1">
                        <span className="text-gray-400 mr-2"><LinkIcon className="w-4 h-4" /></span>
                        <input 
                          type="text" 
                          placeholder="Or paste image URL"
                          className="flex-1 w-full bg-transparent border-none focus:ring-0 text-sm p-0 outline-none placeholder-gray-400 text-gray-900"
                          value={mediaUrl}
                          onChange={e => setMediaUrl(e.target.value)}
                        />
                      </div>
                      {mediaUrl && (
                        <div className="mt-3 relative border border-gray-100 bg-white rounded-lg h-32 p-1 overflow-hidden">
                          <img src={mediaUrl} alt="Preview" className="w-full h-full object-contain rounded-md" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => {
                          setDealItem(null);
                          setMediaUrl("");
                        }}
                        className="px-4 py-2 border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm font-medium rounded-full"
                      >
                        Batal
                      </button>
                      <button 
                        onClick={handleProposeDeal}
                        className="flex-1 bg-[#EE2737] hover:bg-red-700 py-2 text-sm font-bold transition-all text-white px-4 rounded-full shadow-sm"
                      >
                        Send Keep Order Proposal
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setDealItem(item)}
                    className="mt-2 w-full py-2.5 border border-[#EE2737] bg-white text-[#EE2737] hover:bg-[#EE2737] hover:text-white text-sm font-bold transition-all rounded-full"
                  >
                    Propose for Keep Order
                  </button>
                )}
              </div>
            ))}
            
            {selectedRestaurant.menu.map(item => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#00AA13]/30 hover:shadow-sm transition-all group">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-gray-900 group-hover:text-[#00AA13] transition-colors">{item.name}</span>
                  <span className="text-xs font-medium text-gray-400">#SKU-{item.id.substring(0,4).toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[11px] text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full">{item.category}</span>
                    {item.quantity && (
                      <span className="px-2.5 py-1 bg-red-50 text-[#EE2737] text-[11px] font-bold rounded-full">
                        Jml: {item.quantity}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-bold text-[#00AA13]">Rp {item.price.toFixed(2)}</div>
                </div>
                
                {dealItem?.id === item.id ? (
                  <div className="mt-2 p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wide uppercase">Your Target Supply Bid</label>
                      <div className="flex items-center border-b border-[#00AA13] pb-1 bg-white px-3 py-2 rounded-lg focus-within:ring-2 focus-within:ring-[#00AA13]/20 transition-all">
                        <span className="text-lg font-bold text-[#00AA13] mr-2">Rp</span>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          className="flex-1 w-full bg-transparent border-none focus:ring-0 text-xl font-bold text-gray-900 p-0 outline-none placeholder-gray-300"
                          value={proposedPrice}
                          onChange={e => setProposedPrice(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center justify-between tracking-wide uppercase">
                        <span>Product Photo (Optional)</span>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1 text-[#00AA13] hover:text-[#009110] transition-colors text-xs bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm"
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
                      <div className="flex items-center bg-white border border-gray-200 px-3 py-2 rounded-lg mt-1">
                        <span className="text-gray-400 mr-2"><LinkIcon className="w-4 h-4" /></span>
                        <input 
                          type="text" 
                          placeholder="Or paste image URL"
                          className="flex-1 w-full bg-transparent border-none focus:ring-0 text-sm p-0 outline-none placeholder-gray-400 text-gray-900"
                          value={mediaUrl}
                          onChange={e => setMediaUrl(e.target.value)}
                        />
                      </div>
                      {mediaUrl && (
                        <div className="mt-3 relative border border-gray-100 bg-white rounded-lg h-32 p-1 overflow-hidden">
                          <img src={mediaUrl} alt="Preview" className="w-full h-full object-contain rounded-md" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => {
                          setDealItem(null);
                          setMediaUrl("");
                        }}
                        className="px-4 py-2 border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm font-medium rounded-full"
                      >
                        Batal
                      </button>
                      <button 
                        onClick={handleProposeDeal}
                        className="flex-1 bg-[#00AA13] hover:bg-[#009110] py-2 text-sm font-bold transition-all text-white px-4 rounded-full shadow-sm"
                      >
                        Send Proposal
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setDealItem(item)}
                    className="mt-2 w-full py-2.5 border border-[#00AA13] bg-white text-[#00AA13] hover:bg-[#00AA13] hover:text-white text-sm font-bold transition-all rounded-full"
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
    <div className="p-4 bg-gray-50/30 min-h-[50vh]">
      <h2 className="text-sm font-bold text-gray-900 tracking-wide mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
        <Handshake className="w-4 h-4 text-[#00AA13]" />
        Penawaran Kesepakatan & Pesanan Saya
      </h2>
      <div className="space-y-4">
        {deals.filter(d => d.supplierId === activeSupplier.id).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
             <p className="text-sm font-medium text-gray-400">Anda belum mengajukan kesepakatan apa pun.</p>
          </div>
        ) : (
          deals.filter(d => d.supplierId === activeSupplier.id).map((deal) => {
            const restaurant = restaurants.find(r => r.id === deal.restaurantId);
            const item = restaurant?.menu.find(m => m.id === deal.menuItemId) || restaurant?.inventory?.find(m => m.id === deal.menuItemId);
            const unreadCount = messages.filter(m => m.dealId === deal.id && m.senderRole === "restaurant" && !m.isRead).length;
            
            return (
              <div key={deal.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="font-bold text-gray-900">{item?.name || "Unknown Item"}</span>
                    <div className="text-xs font-medium text-[#EE2737] mt-1">{restaurant?.name}</div>
                    {restaurant?.address && <div className="text-[10px] text-gray-500 mt-1">{restaurant.address}</div>}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    deal.status === 'Accepted' ? 'bg-[#00AA13]/10 text-[#00AA13]' :
                    deal.status === 'Sample Requested' ? 'bg-blue-100 text-blue-800' :
                    deal.status === 'Sample Arrived' ? 'bg-purple-100 text-purple-800' :
                    deal.status === 'Rejected' ? 'bg-[#EE2737]/10 text-[#EE2737]' :
                    deal.status === 'On Delivery' ? 'bg-[#F1B51A]/20 text-[#F1B51A]' :
                    deal.status === 'Delivered' ? 'bg-indigo-100 text-indigo-700' :
                    deal.status === 'Return Requested' ? 'bg-orange-100 text-orange-700' :
                    deal.status === 'Return Accepted' || deal.status === 'Refunded' || deal.status === 'Replaced' ? 'bg-teal-100 text-teal-800' :
                    deal.status === 'Return Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {deal.status === 'Accepted' ? 'Diterima' : deal.status === 'Rejected' ? 'Ditolak' : deal.status === 'Sample Arrived' ? 'Sampel Tiba' : deal.status === 'Sample Requested' ? 'Diminta Sampel' : deal.status === 'On Delivery' ? 'Sedang Dikirim' : deal.status === 'Delivered' ? 'Terkirim' : deal.status === 'Return Requested' ? 'Ajuan Retur' : deal.status === 'Return Accepted' ? 'Retur Diterima' : deal.status === 'Return Rejected' ? 'Retur Ditolak' : deal.status}
                  </span>
                </div>
                <div className="text-lg font-bold text-[#00AA13] mb-4 pb-4 border-b border-gray-50">
                  Rp {deal.proposedPrice.toFixed(2)}
                </div>
                
                {/* Status update actions for accepted/sample deals */}
                {['Accepted', 'On Delivery', 'Delivered', 'Sample Requested', 'Sample Arrived'].includes(deal.status) && (
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setActiveChatDeal(deal)}
                        className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-xs font-bold transition-colors flex items-center justify-center gap-1.5 relative shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Chat
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-[#EE2737] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_8px_rgba(238,39,55,0.4)]">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      {deal.status === 'Sample Requested' && (
                        <button 
                          onClick={() => updateDealStatus(deal.id, 'Sample Arrived')}
                          className="flex-1 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full text-xs font-bold transition-colors"
                        >
                          Mark Sample Terkirim
                        </button>
                      )}
                      {deal.status === 'Accepted' && (
                        <button 
                          onClick={() => updateDealStatus(deal.id, 'On Delivery')}
                          className="flex-1 py-2 bg-[#F1B51A] text-white hover:bg-[#F1B51A]/90 rounded-full text-xs font-bold transition-colors shadow-sm"
                        >
                          Tandai Sedang Dikirim
                        </button>
                      )}
                      {(deal.status === 'Accepted' || deal.status === 'On Delivery') && (
                        <button 
                          onClick={() => updateDealStatus(deal.id, 'Delivered')}
                          className="flex-1 py-2 bg-[#00AA13] text-white hover:bg-[#009110] rounded-full text-xs font-bold transition-colors shadow-sm"
                        >
                          Mark Terkirim
                        </button>
                      )}
                      {deal.status === 'Return Requested' && (
                        <div className="flex flex-col gap-2 w-full mt-2 border-t border-gray-100 pt-3">
                           <div className="text-xs text-red-600 font-bold mb-1">Tindakan SLA Retur (Sisa: &lt;24h):</div>
                           <div className="flex gap-2">
                             <button onClick={() => updateDealStatus(deal.id, 'Refunded')} className="flex-1 text-[10px] py-1.5 bg-teal-600 text-white font-bold rounded shadow-sm">Refund</button>
                             <button onClick={() => updateDealStatus(deal.id, 'Replaced')} className="flex-1 text-[10px] py-1.5 bg-blue-600 text-white font-bold rounded shadow-sm">Ganti Barang</button>
                             <button onClick={() => updateDealStatus(deal.id, 'Return Rejected')} className="flex-1 text-[10px] py-1.5 bg-red-600 text-white font-bold rounded shadow-sm">Tolak</button>
                           </div>
                        </div>
                      )}
                    </div>
                    {deal.review && deal.status !== 'Return Requested' && deal.status !== 'Refunded' && deal.status !== 'Replaced' && deal.status !== 'Return Rejected' && deal.status !== 'Return Accepted' && (
                      <div className="mt-3 text-left bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-1 mb-1.5">
                          {[1,2,3,4,5].map(s => (
                             <span key={s} className={s <= (deal.rating || 5) ? 'text-[#F1B51A] text-sm' : 'text-gray-300 text-sm'}>★</span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 italic">"{deal.review}"</p>
                      </div>
                    )}
                    {deal.review && ['Return Requested', 'Refunded', 'Replaced', 'Return Rejected', 'Return Accepted'].includes(deal.status) && (
                      <div className="mt-3 text-left bg-red-50 border border-red-100 rounded-xl p-3">
                        <strong className="text-xs text-red-800 block mb-1">Alasan Retur / Kendala:</strong>
                        <p className="text-xs text-red-700 italic">"{deal.review}"</p>
                        {deal.mediaUrl && (
                          <div className="mt-2 text-center">
                            <img src={deal.mediaUrl} alt="Bukti retur" className="max-h-32 rounded-lg object-contain bg-white border border-red-200 inline-block" />
                          </div>
                        )}
                      </div>
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
    <div className="p-4 bg-gray-50/30 min-h-[50vh]">
      <h2 className="text-sm font-bold text-gray-900 tracking-wide mb-4 pb-2 border-b border-gray-100">Supplier Profile</h2>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#00AA13]"></div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Supplier Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all text-sm"
              required
            />
          </div>
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-1.5">Alamat</label>
             <AddressAutocomplete 
               value={profileAddress} 
               onChange={(addr, lat, lng) => {
                  setProfileAddress(addr);
                  setProfileLat(lat);
                  setProfileLng(lng);
               }}
             />
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full py-2.5 bg-[#00AA13] hover:bg-[#009110] font-bold transition-all text-sm text-white rounded-full shadow-sm">
              Simpan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white flex-col-reverse md:flex-row overflow-hidden relative">
      
      {/* Sidebar: List of Restaurants or Selected Restaurant Detail */}
      <div className="w-full md:w-96 bg-white flex flex-col h-[50vh] md:h-full z-10 border-t md:border-t-0 border-r-0 md:border-r border-gray-200 shrink-0 relative">
        <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-5 bg-white shrink-0">
          <div className="flex items-center gap-2 md:gap-3 p-1 md:p-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#00AA13] rounded-full flex items-center justify-center shadow-sm shrink-0">
              <Truck className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-[#00AA13] tracking-tight leading-none">Dapurku</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative z-50">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-8 h-8 md:w-10 md:h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center border border-gray-200 transition-colors relative"
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EE2737] text-[10px] font-bold text-white">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white border border-gray-200 shadow-2xl p-4 z-[9999]">
                  <h3 className="text-gray-900 font-bold text-sm md:text-lg border-b border-gray-200 pb-2 mb-3">
                    {language === "en" ? "Notifications" : "Notifikasi"}
                  </h3>
                  {notifications.length === 0 ? (
                    <p className="text-gray-400 text-xs md:text-sm italic text-center py-4">
                      {language === "en" ? "No new notifications." : "Tidak ada notifikasi baru."}
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                      {notifications.map(note => (
                        <div key={note.id} className={`${note.isAlert ? 'bg-[#EE2737]/10 border-[#EE2737]' : 'bg-gray-50 border-gray-200'} border p-3 text-left rounded-md`}>
                          <div className="text-gray-900 font-bold text-xs md:text-sm leading-snug">{note.message}</div>
                          <div className="text-gray-500 text-[10px] md:text-xs mt-1">{note.subtext}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          
            <span className="px-3 py-1 bg-[#EE2737]/10 text-[#EE2737] text-[10px] md:text-xs font-bold rounded-full whitespace-nowrap">{translate("Supplier Portal", language)}</span>
          </div>
        </div>

        <div className="flex overflow-x-auto custom-scrollbar border-b border-gray-100 bg-white shadow-sm px-2 sm:px-6 justify-start lg:justify-center shrink-0">
          <button 
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-6 sm:px-8 py-3 sm:py-4 text-[11px] sm:text-xs font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${activeTab === "market" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-[#00AA13] hover:bg-gray-50/50"}`}
            onClick={() => setActiveTab('market')}
          >
            <Map className="w-5 h-5 sm:w-4 sm:h-4" />
            <span>{translate("Marketplace", language)}</span>
          </button>
          <button 
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-6 sm:px-8 py-3 sm:py-4 text-[11px] sm:text-xs font-bold border-b-2 whitespace-nowrap transition-all duration-200 relative ${activeTab === "orders" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-[#00AA13] hover:bg-gray-50/50"}`}
            onClick={() => setActiveTab('orders')}
          >
            <div className="relative">
              <Handshake className="w-5 h-5 sm:w-4 sm:h-4" />
              {totalUnreadOrders > 0 && (
                <span className="absolute -top-1 -right-2 sm:-top-2 sm:-right-3 bg-[#EE2737] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                  {totalUnreadOrders}
                </span>
              )}
            </div>
            <span>{translate("Deals", language)}</span>
          </button>
          <button 
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-6 sm:px-8 py-3 sm:py-4 text-[11px] sm:text-xs font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${activeTab === "inventory" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-[#00AA13] hover:bg-gray-50/50"}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Package className="w-5 h-5 sm:w-4 sm:h-4" />
            <span>{translate("Inventory", language)}</span>
          </button>
          <button 
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-6 sm:px-8 py-3 sm:py-4 text-[11px] sm:text-xs font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${activeTab === "hitung" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-[#00AA13] hover:bg-gray-50/50"}`}
            onClick={() => setActiveTab('hitung')}
          >
            <Calculator className="w-5 h-5 sm:w-4 sm:h-4" />
            <span>Hitung</span>
          </button>
          <button 
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-6 sm:px-8 py-3 sm:py-4 text-[11px] sm:text-xs font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${activeTab === "profile" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-[#00AA13] hover:bg-gray-50/50"}`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="w-5 h-5 sm:w-4 sm:h-4" />
            <span>{translate("Profile", language)}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full bg-white">
          {activeTab === "market" && !selectedRestaurant && renderMarketList()}
          {activeTab === "market" && selectedRestaurant && renderMarketDetail()}
          {activeTab === "orders" && renderOrders()}
          {activeTab === "inventory" && <SupplierInventory />}
          {activeTab === "hitung" && <SupplierCalculator />}
          {activeTab === "profile" && renderProfile()}
        </div>
      </div>


      {/* Main Map Area */}
      <div className="flex-1 relative z-0 h-[50vh] md:h-full">
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={['mt0','mt1','mt2','mt3']}
            attribution="&copy; Google"
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
          {selectedRestaurant && routeGeometry.length > 0 && (
            <Polyline 
              positions={routeGeometry} 
              pathOptions={{ color: '#00AA13', weight: 5, opacity: 0.8 }} 
            />
          )}

          {restaurants.map(restaurant => {
            const lat = restaurant.lat ?? -5.147665;
            const lng = restaurant.lng ?? 119.432731;
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
                  {restaurant.address && <div className="text-[10px] text-gray-500 mt-1">{restaurant.address}</div>}
                  <div className="text-xs text-gray-400 mt-1">{restaurant.menu?.length || 0} menu items</div>
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
