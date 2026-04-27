import React, { useState } from "react";
import { MenuItem, Category } from "../types";
import { Plus, Edit2, Trash2, X, Check, Sparkles, MapPin, Search } from "lucide-react";
import { useAppContext } from "../store/AppContext";
import { PredictSupplyModal } from "./PredictSupplyModal";

const MOCK_SUPPLIERS = [
  { id: "s-1", name: "FreshLogistics Inc.", distance: "1.2 miles" },
  { id: "s-2", name: "Valley Farms", distance: "2.4 miles" },
  { id: "s-3", name: "Metro Meat & Veg", distance: "0.8 miles" },
];

export function MenuManager() {
  const { restaurants, activeRestaurantId, addMenuItem, updateMenuItem, deleteMenuItem, deals, proposeDeal, updateDealStatus } = useAppContext();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isPredictModalOpen, setIsPredictModalOpen] = useState(false);
  const [findingSuppliersFor, setFindingSuppliersFor] = useState<string | null>(null);

  
  const restaurant = restaurants.find(r => r.id === activeRestaurantId);

  const [formData, setFormData] = useState<Omit<MenuItem, "id">>({
    name: "",
    description: "",
    price: 0,
    category: "Main Course",
    quantity: ""
  });

  if (!restaurant) return <div>Restaurant not found</div>;

  const handleSaveAdd = () => {
    if (!formData.name || formData.price <= 0) return; // basic validation
    addMenuItem(restaurant.id, formData);
    setIsAdding(false);
    resetForm();
  };

  const handleSaveEdit = (itemId: string) => {
    if (!formData.name || formData.price <= 0) return;
    updateMenuItem(restaurant.id, itemId, formData);
    setIsEditing(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", price: 0, category: "Main Course", quantity: "" });
  };

  const startEdit = (item: MenuItem) => {
    setIsEditing(item.id);
    setIsAdding(false);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      quantity: item.quantity || ""
    });
  };

  const handleFindSuppliers = (item: MenuItem) => {
    setFindingSuppliersFor(item.id);
    
    // Simulate finding and proposing deals after 1.5 seconds
    setTimeout(() => {
      // Pick 2 random mock suppliers to propose deals
      const selectedSuppliers = [...MOCK_SUPPLIERS].sort(() => 0.5 - Math.random()).slice(0, 2);
      
      selectedSuppliers.forEach(supplier => {
        // give a slightly different price (-10% to +10%)
        const randomModifier = (Math.random() * 0.2) - 0.1; 
        const proposedPrice = item.price * (1 + randomModifier);
        
        proposeDeal({
          restaurantId: restaurant.id,
          supplierId: supplier.id,
          menuItemId: item.id,
          proposedPrice: Number(proposedPrice.toFixed(2))
        });
      });
      
      setFindingSuppliersFor(null);
    }, 1500);
  };

  const startAdd = () => {
    setIsAdding(true);
    setIsEditing(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-transparent">
        <div>
          <h2 className="text-3xl font-bold text-white border-b-4 border-[#37B34A] pb-2 game-text">Menu Management</h2>
          <p className="text-lg text-gray-300 mt-2 font-bold game-text">Add, update, or remove items from your menu.</p>
        </div>
        {!isAdding && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPredictModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white border border-purple-800 hover:bg-purple-500 transition-all font-bold text-sm"
            >
              <Sparkles className="w-5 h-5" />
              <span className="hidden sm:inline game-text text-lg mt-1">Predict Needs</span>
            </button>
            <button
              onClick={startAdd}
              className="flex items-center gap-2 px-4 py-2 game-btn game-btn-green text-white transition-all font-bold text-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline game-text text-lg mt-1">Add Item</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* ADD NEW ITEM FORM */}
        {isAdding && (
          <div className="p-4 bg-black/60 border border-white/20 space-y-4">
            <h3 className="text-xl font-bold text-white game-text border-b border-[#37B34A] pb-2">New Menu Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Item Name"
                className="px-4 py-3 bg-black/60 border border-white/20 text-white text-lg focus:outline-none focus:border-[#37B34A] game-text font-bold"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <div className="flex gap-2 relative">
                <span className="absolute left-4 top-3 text-white font-bold text-xl">$</span>
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  className="px-4 py-3 pl-10 bg-black/60 border border-white/20 text-white text-lg focus:outline-none focus:border-[#37B34A] w-1/2 game-text font-bold"
                  value={formData.price || ""}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
                <select
                  className="px-4 py-3 bg-black/60 border border-white/20 text-white text-lg focus:outline-none focus:border-[#37B34A] w-1/2 game-text font-bold"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                >
                  <option value="Appetizer">Appetizer</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <textarea
                placeholder="Description"
                className="px-4 py-3 bg-black/60 border border-white/20 text-white text-lg focus:outline-none focus:border-[#37B34A] md:col-span-2 resize-none h-24 game-text font-bold"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
              <input
                type="text"
                placeholder="Required Quantity (e.g., 24 x 1L Bottles)"
                className="px-4 py-3 bg-black/60 border border-white/20 text-white text-lg focus:outline-none focus:border-[#37B34A] md:col-span-2 game-text font-bold"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setIsAdding(false); resetForm(); }}
                className="px-6 py-2 text-lg font-bold text-white border border-white/20 hover:bg-white/10 transition-colors game-text bg-transparent"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdd}
                className="px-6 py-2 text-lg game-btn game-btn-green font-bold transition-all game-text text-white"
              >
                Save Item
              </button>
            </div>
          </div>
        )}

        {/* LIST OF ITEMS */}
        {restaurant.menu.length === 0 && !isAdding ? (
          <div className="text-center py-12 text-gray-400 bg-transparent border border-dashed border-white/20 game-text font-bold text-xl">
            No items in your menu yet. Click "Add Item" to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {restaurant.menu.map((item) => {
              const itemDeals = deals.filter(d => d.menuItemId === item.id);
              return (
              <div key={item.id} className="bg-black/60 border border-white/20 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {isEditing === item.id ? (
                  /* EDIT MODE */
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        className="px-4 py-3 bg-black/60 border border-white/20 text-white text-lg focus:outline-none focus:border-[#37B34A] game-text font-bold"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                      <div className="flex gap-2 relative">
                        <span className="absolute left-4 top-3 text-white font-bold text-xl">$</span>
                        <input
                          type="number"
                          step="0.01"
                          className="px-4 py-3 pl-10 bg-black/60 border border-white/20 text-white text-lg focus:outline-none focus:border-[#37B34A] w-1/2 game-text font-bold"
                          value={formData.price || ""}
                          onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        />
                        <select
                          className="px-4 py-3 bg-black/60 border border-white/20 text-white text-lg focus:outline-none focus:border-[#37B34A] w-1/2 game-text font-bold"
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                        >
                          <option value="Appetizer">Appetizer</option>
                          <option value="Main Course">Main Course</option>
                          <option value="Dessert">Dessert</option>
                          <option value="Beverage">Beverage</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <textarea
                        className="px-4 py-3 bg-black/60 border border-white/20 text-white text-lg focus:outline-none focus:border-[#37B34A] md:col-span-2 resize-none h-24 game-text font-bold"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Required Quantity (e.g., 24 x 1L Bottles)"
                        className="px-4 py-3 bg-black/60 border border-white/20 text-white text-lg focus:outline-none focus:border-[#37B34A] md:col-span-2 game-text font-bold"
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditing(null)}
                        className="p-3 text-white border border-white/20 bg-transparent hover:bg-white/10 transition-all"
                        title="Cancel"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="p-3 game-btn game-btn-green"
                        title="Save Changes"
                      >
                        <Check className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* VIEW MODE */
                  <>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-white text-2xl game-text">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-block px-2 py-1 bg-[#37B34A] border border-[#37B34A] text-white text-sm font-bold uppercase game-text shadow-none">
                              {item.category}
                            </span>
                            {item.quantity && (
                              <span className="inline-block px-2 py-1 bg-transparent border border-white/20 text-[#1A92D4] text-sm font-bold uppercase game-text shadow-none">
                                Qty: {item.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-[#37B34A] game-text">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                      <p className="mt-3 text-lg text-gray-300 font-bold leading-snug">{item.description}</p>
                      
                      {/* Deals & Negotiation UI */}
                      <div className="mt-4 pt-4 border-t border-white/20">
                        {itemDeals.length > 0 ? (
                          <div className="space-y-3">
                            <h5 className="text-sm font-bold text-[#F1B51A] uppercase tracking-wider flex items-center gap-2 game-text">
                              <MapPin className="w-5 h-5 text-[#F1B51A]" /> Nearby Supplier Bids
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {itemDeals.map(deal => {
                                const supplierName = MOCK_SUPPLIERS.find(s => s.id === deal.supplierId)?.name || "Unknown Supplier";
                                return (
                                  <div key={deal.id} className="p-3 bg-black/40 border border-white/10 space-y-2 relative shadow-none">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-lg text-white truncate mr-2 game-text" title={supplierName}>{supplierName}</span>
                                      <span className="font-bold text-2xl text-[#37B34A] game-text">${deal.proposedPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                      {deal.status === 'Pending' ? (
                                        <div className="flex gap-2 w-full">
                                          <button 
                                            onClick={() => updateDealStatus(deal.id, 'Accepted')} 
                                            className="flex-1 py-2 game-btn game-btn-green text-sm"
                                          >
                                            <span className="game-text text-lg">Accept</span>
                                          </button>
                                          <button 
                                            onClick={() => updateDealStatus(deal.id, 'Rejected')} 
                                            className="flex-1 py-2 game-btn game-btn-red text-sm"
                                          >
                                            <span className="game-text text-lg">Reject</span>
                                          </button>
                                        </div>
                                      ) : (
                                        <span className={`text-lg font-bold px-2 py-1 border w-full text-center game-text shadow-none ${
                                          deal.status === 'Accepted' ? 'bg-[#37B34A] text-white border-[#37B34A]' : 
                                          deal.status === 'Rejected' ? 'bg-[--color-gta-red] text-white border-[--color-gta-red]' : 
                                          deal.status === 'On Delivery' ? 'bg-[#F1B51A] text-black border-[#F1B51A]' : 
                                          deal.status === 'Delivered' ? 'bg-purple-600 text-white border-purple-600' : 
                                          'bg-transparent text-gray-400 border-gray-600'
                                        }`}>
                                          {deal.status}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleFindSuppliers(item)}
                            disabled={findingSuppliersFor === item.id}
                            className={`flex items-center gap-2 px-4 py-2 border border-[#F1B51A] text-[#F1B51A] bg-transparent font-bold transition-all hover:bg-[#F1B51A] hover:text-black ${findingSuppliersFor === item.id ? 'bg-[#F1B51A] text-black opacity-80' : ''}`}
                          >
                            <Search className={`w-6 h-6 ${findingSuppliersFor === item.id ? 'animate-spin' : ''}`} />
                            <span className="game-text text-xl pt-1">{findingSuppliersFor === item.id ? 'Finding...' : 'Find Nearby Suppliers'}</span>
                          </button>
                        )}
                      </div>

                    </div>
                    
                    <div className="flex flex-row md:flex-col gap-3 pt-3 md:pt-0 min-w-[50px] justify-start h-full self-start">
                      <button 
                        onClick={() => startEdit(item)}
                        className="p-3 border border-white/20 bg-transparent text-[#1A92D4] hover:bg-[#1A92D4] hover:text-white transition-all hover:border-[#1A92D4]"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteMenuItem(restaurant.id, item.id)}
                        className="p-3 border border-white/20 bg-transparent text-[--color-gta-red] hover:bg-[--color-gta-red] hover:text-white transition-all mt-0 md:mt-2 hover:border-[--color-gta-red]"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>

      <PredictSupplyModal 
        isOpen={isPredictModalOpen} 
        onClose={() => setIsPredictModalOpen(false)} 
        menuItems={restaurant.menu} 
      />
    </div>
  );
}
