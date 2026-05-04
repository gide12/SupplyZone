import React, { useState } from "react";
import { MenuItem, Category } from "../types";
import { Plus, Edit2, Trash2, X, Check, Sparkles, MapPin, Search, MessageCircle } from "lucide-react";
import { useAppContext } from "../store/AppContext";
import { PredictSupplyModal } from "./PredictSupplyModal";
import { ChatModal } from "./ChatModal";
import { AIMarginPredictor } from "./AIMarginPredictor";
import { Calculator } from "lucide-react";

export function MenuManager() {
  const { restaurants, activeRestaurantId, addMenuItem, updateMenuItem, deleteMenuItem, deals, proposeDeal, updateDealStatus, updateDeal, messages, suppliers, calculateDynamicPrice } = useAppContext();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isPredictModalOpen, setIsPredictModalOpen] = useState(false);
  const [isMarginPredictorOpen, setIsMarginPredictorOpen] = useState(false);
  const [findingSuppliersFor, setFindingSuppliersFor] = useState<string | null>(null);
  const [activeChatDeal, setActiveChatDeal] = useState<any | null>(null);
  const [reviewingDeal, setReviewingDeal] = useState<any | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "" });

  
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
      const dynamicInfo = calculateDynamicPrice(item.name);
      
      // Filter suppliers that have the matching item, else pick random
      let matchingSuppliers = suppliers.filter(s => s.inventory?.some(i => i.name.toLowerCase() === item.name.toLowerCase()));
      
      if (matchingSuppliers.length === 0) {
          matchingSuppliers = [...suppliers].sort(() => 0.5 - Math.random()).slice(0, 2);
      } else {
          matchingSuppliers = matchingSuppliers.slice(0, 3); // Max 3 proposals
      }
      
      matchingSuppliers.forEach(supplier => {
        // give a slightly different price (-10% to +10%) based on dynamic price
        const randomModifier = (Math.random() * 0.2) - 0.1; 
        const proposedPrice = dynamicInfo.estimatedPrice * (1 + randomModifier);
        
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
      <div className="flex justify-between items-center bg-white">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 border-b-4 border-[#00AA13] pb-2 game-text">Menu Management</h2>
          <p className="text-lg text-gray-700 mt-2 font-bold game-text">Add, update, or remove items from your menu.</p>
        </div>
        {!isAdding && (
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-4 py-2 game-btn game-btn-blue transition-all font-bold text-sm"
              >
                <Calculator className="w-5 h-5" />
                <span className="hidden sm:inline game-text text-lg mt-1">Hitung</span>
              </button>
              <div className="absolute top-full right-0 pt-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-50">
                <div className="w-52 bg-white border border-gray-200 shadow-xl flex flex-col rounded overflow-hidden">
                  <button onClick={() => setIsMarginPredictorOpen(true)} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded bg-[#EE2737]/10 flex items-center justify-center shrink-0">
                      <Calculator className="w-4 h-4 text-[#EE2737]" />
                    </div>
                    <div>
                      <div className="game-text text-gray-900 font-bold leading-tight">AI Margin</div>
                      <div className="text-[10px] text-gray-400 game-text mt-0.5">Price calculator</div>
                    </div>
                  </button>
                  <button onClick={() => setIsPredictModalOpen(true)} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                    <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="game-text text-gray-900 font-bold leading-tight">Predict Needs</div>
                      <div className="text-[10px] text-gray-400 game-text mt-0.5">Supply AI</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={startAdd}
              className="flex items-center gap-2 px-4 py-2 game-btn game-btn-green text-gray-900 transition-all font-bold text-sm"
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
          <div className="p-4 bg-white border border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 game-text border-b border-[#00AA13] pb-2">New Menu Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Item Name"
                className="px-4 py-3 bg-white border border-gray-200 text-gray-900 text-lg focus:outline-none focus:border-[#00AA13] game-text font-bold"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <div className="flex gap-2 relative">
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  className="px-4 py-3 bg-white border border-gray-200 text-gray-900 text-lg focus:outline-none focus:border-[#00AA13] w-1/2 game-text font-bold"
                  value={formData.price || ""}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
                <select
                  className="px-4 py-3 bg-white border border-gray-200 text-gray-900 text-lg focus:outline-none focus:border-[#00AA13] w-1/2 game-text font-bold"
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
                className="px-4 py-3 bg-white border border-gray-200 text-gray-900 text-lg focus:outline-none focus:border-[#00AA13] md:col-span-2 resize-none h-24 game-text font-bold"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
              <input
                type="text"
                placeholder="Required Quantity (e.g., 24 x 1L Bottles)"
                className="px-4 py-3 bg-white border border-gray-200 text-gray-900 text-lg focus:outline-none focus:border-[#00AA13] md:col-span-2 game-text font-bold"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setIsAdding(false); resetForm(); }}
                className="px-6 py-2 text-lg font-bold text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors game-text bg-white rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdd}
                className="px-6 py-2 text-lg game-btn game-btn-green font-bold transition-all game-text text-gray-900"
              >
                Save Item
              </button>
            </div>
          </div>
        )}

        {/* LIST OF ITEMS */}
        {restaurant.menu.length === 0 && !isAdding ? (
          <div className="text-center py-12 text-gray-400 bg-white border border-dashed border-gray-200 game-text font-bold text-xl">
            No items in your menu yet. Click "Add Item" to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {restaurant.menu.map((item) => {
              const itemDeals = deals.filter(d => d.menuItemId === item.id);
              return (
              <div key={item.id} className="bg-white border border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {isEditing === item.id ? (
                  /* EDIT MODE */
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        className="px-4 py-3 bg-white border border-gray-200 text-gray-900 text-lg focus:outline-none focus:border-[#00AA13] game-text font-bold"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                      <div className="flex gap-2 relative">
                        <input
                          type="number"
                          step="0.01"
                          className="px-4 py-3 bg-white border border-gray-200 text-gray-900 text-lg focus:outline-none focus:border-[#00AA13] w-1/2 game-text font-bold"
                          value={formData.price || ""}
                          onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        />
                        <select
                          className="px-4 py-3 bg-white border border-gray-200 text-gray-900 text-lg focus:outline-none focus:border-[#00AA13] w-1/2 game-text font-bold"
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
                        className="px-4 py-3 bg-white border border-gray-200 text-gray-900 text-lg focus:outline-none focus:border-[#00AA13] md:col-span-2 resize-none h-24 game-text font-bold"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Required Quantity (e.g., 24 x 1L Bottles)"
                        className="px-4 py-3 bg-white border border-gray-200 text-gray-900 text-lg focus:outline-none focus:border-[#00AA13] md:col-span-2 game-text font-bold"
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditing(null)}
                        className="p-3 rounded-lg text-gray-900 border border-gray-200 bg-white hover:bg-gray-50 transition-all"
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
                          <h4 className="font-bold text-gray-900 text-2xl game-text">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-block px-2 py-1 bg-[#00AA13] border border-[#00AA13] text-white text-sm font-bold  game-text shadow-sm">
                              {item.category}
                            </span>
                            {item.quantity && (
                              <span className="inline-block px-2 py-1 bg-white border border-gray-200 text-[#EE2737] text-sm font-bold  game-text shadow-sm">
                                Qty: {item.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-[#00AA13] game-text">
                          Rp {item.price.toFixed(2)}
                        </div>
                      </div>
                      <p className="mt-3 text-lg text-gray-700 font-bold leading-snug">{item.description}</p>
                      
                      {/* Dynamic Pricing Estimate */}
                      {(() => {
                        const dynamicInfo = calculateDynamicPrice(item.name);
                        return (
                          <div className="mt-3 inline-block bg-white border border-t-[--color-gta-blue] p-2 bg-[--color-gta-panel] shadow-sm">
                             <div className="flex items-center space-x-4">
                                <div className="game-text">
                                  <span className="text-gray-400 text-xs font-bold  tracking-wider block">Estimated Bid Cost</span>
                                  <span className="text-[#EE2737] text-xl font-bold">Rp {dynamicInfo.estimatedPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex gap-2">
                                  <div className="text-center px-2 border-r border-gray-200">
                                    <span className="block text-[10px] text-gray-400   game-text font-bold">Demand</span>
                                    <span className="block text-gray-900 text-sm game-text">{dynamicInfo.marketDemand}</span>
                                  </div>
                                  <div className="text-center px-2">
                                    <span className="block text-[10px] text-gray-400   game-text font-bold">Supply</span>
                                    <span className="block text-gray-900 text-sm game-text">{dynamicInfo.marketSupply}</span>
                                  </div>
                                </div>
                             </div>
                          </div>
                        );
                      })()}
                      
                      {/* Deals & Negotiation UI */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {itemDeals.length > 0 ? (
                          <div className="space-y-3">
                            <h5 className="text-sm font-bold text-[#F1B51A]  tracking-wider flex items-center gap-2 game-text">
                              <MapPin className="w-5 h-5 text-[#F1B51A]" /> Nearby Supplier Bids
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {itemDeals.map(deal => {
                                const supplier = suppliers.find(s => s.id === deal.supplierId);
                                const supplierName = supplier?.name || "Unknown Supplier";
                                const unreadCount = messages.filter(m => m.dealId === deal.id && m.senderRole === "supplier" && !m.isRead).length;
                                return (
                                  <div key={deal.id} className="p-3 bg-white border border-gray-100 space-y-2 relative shadow-sm">
                                    <div className="flex items-start justify-between pb-2">
                                      <span className="font-bold text-lg text-gray-900 truncate mr-2 game-text" title={supplierName}>{supplierName}</span>
                                      {supplier?.address && <div className="text-xs text-gray-500 font-bold absolute top-10 left-3 truncate w-40">{supplier.address}</div>}
                                      <span className="font-bold text-2xl text-[#00AA13] game-text">Rp {deal.proposedPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                      {deal.status === 'Pending' ? (
                                          <div className="flex gap-2 w-full flex-wrap">
                                            <button 
                                              onClick={() => updateDealStatus(deal.id, 'Accepted')} 
                                              className="flex-1 py-2 game-btn game-btn-green text-sm"
                                            >
                                              <span className="game-text text-lg">Accept</span>
                                            </button>
                                            <button 
                                              onClick={() => updateDealStatus(deal.id, 'Sample Requested')} 
                                              className="flex-1 py-2 game-btn game-btn-blue text-sm"
                                            >
                                              <span className="game-text text-lg">Sample</span>
                                            </button>
                                            <button 
                                              onClick={() => updateDealStatus(deal.id, 'Rejected')} 
                                              className="flex-1 py-2 game-btn game-btn-red text-sm"
                                            >
                                              <span className="game-text text-lg">Reject</span>
                                            </button>
                                          </div>
                                        ) : deal.status === 'Sample Requested' ? (
                                          <div className="flex w-full items-center gap-2">
                                            <span className="text-lg font-bold px-2 py-1 border flex-1 text-center game-text shadow-sm bg-gray-100 text-gray-500 border-gray-300">
                                              Waiting for Sample
                                            </span>
                                          </div>
                                        ) : deal.status === 'Sample Arrived' ? (
                                          <div className="flex w-full items-center gap-2">
                                            <button 
                                              onClick={() => { setReviewingDeal(deal); setReviewForm({ rating: 5, text: "" }); }} 
                                              className="flex-1 py-2 game-btn bg-purple-600 text-white text-sm"
                                            >
                                              <span className="game-text text-lg">Review Sample</span>
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex w-full items-center gap-2">
                                            <span className={`text-lg font-bold px-2 py-1 border flex-1 text-center game-text shadow-sm ${
                                              deal.status === 'Accepted' ? 'bg-[#00AA13] text-white border-[#00AA13]' :
deal.status === 'Sample Requested' ? 'bg-blue-100 text-blue-800 border-blue-200' :
deal.status === 'Sample Arrived' ? 'bg-purple-100 text-purple-800 border-purple-200' : 
                                              deal.status === 'Rejected' ? 'bg-[#EE2737] text-white border-[--color-gta-red]' : 
                                              deal.status === 'On Delivery' ? 'bg-[#F1B51A] text-black border-[#F1B51A]' : 
                                              deal.status === 'Delivered' ? 'bg-purple-600 text-gray-900 border-purple-600' : 
                                              'bg-white text-gray-400 border-gray-600'
                                            }`}>
                                              {deal.status}
                                            </span>
                                            {/* Show Chat button if deal is Accepted or further along */}
                                            {['Accepted', 'On Delivery', 'Delivered'].includes(deal.status) && (
                                              <button 
                                                onClick={() => setActiveChatDeal(deal)}
                                                className="p-1 px-3 game-btn game-btn-blue text-gray-900 self-stretch flex items-center justify-center shrink-0 relative"
                                                title="Chat with Supplier"
                                              >
                                                <MessageCircle className="w-5 h-5 mr-1" />
                                                <span className="game-text font-bold text-sm">Chat</span>
                                                {unreadCount > 0 && (
                                                  <span className="absolute -top-2 -right-2 bg-red-600 text-gray-900 text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                                                    {unreadCount}
                                                  </span>
                                                )}
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      {deal.review && (
                                        <div className="mt-2 text-left bg-gray-50 border border-gray-100 p-2">
                                          <div className="flex items-center gap-1 mb-1">
                                            {[1,2,3,4,5].map(s => (
                                               <span key={s} className={s <= (deal.rating || 5) ? 'text-[#F1B51A]' : 'text-gray-300'}>★</span>
                                            ))}
                                          </div>
                                          <p className="text-sm font-bold game-text text-gray-700 italic">"{deal.review}"</p>
                                        </div>
                                      )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleFindSuppliers(item)}
                            disabled={findingSuppliersFor === item.id}
                            className={`flex items-center gap-2 px-4 py-2 border border-[#F1B51A] text-[#F1B51A] bg-white font-bold transition-all hover:bg-[#F1B51A] hover:text-black ${findingSuppliersFor === item.id ? 'bg-[#F1B51A] text-black opacity-80' : ''}`}
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
                        className="p-3 border border-gray-200 bg-white text-[#EE2737] hover:bg-[#EE2737] hover:text-white transition-all hover:border-[#EE2737]"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteMenuItem(restaurant.id, item.id)}
                        className="p-3 border border-gray-200 bg-white text-[--color-gta-red] hover:bg-[#EE2737] hover:text-white transition-all mt-0 md:mt-2 hover:border-[--color-gta-red]"
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
        inventory={restaurant.inventory || []}
      />

      <AIMarginPredictor 
        isOpen={isMarginPredictorOpen} 
        onClose={() => setIsMarginPredictorOpen(false)} 
      />

      {reviewingDeal && (
        <div className="fixed inset-0 bg-white backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="game-panel w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-t-4 border-purple-600 p-6 bg-white relative">
            <button onClick={() => setReviewingDeal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 border border-gray-200 p-1">
              <X className="w-5 h-5"/>
            </button>
            <h3 className="text-xl font-bold text-gray-900 game-title mb-4 border-b border-gray-100 pb-2">Review Sample</h3>
            
            <label className="block text-sm font-bold text-gray-400 mb-2 game-text">Rating (1-5)</label>
            <div className="flex gap-2 mb-4">
               {[1,2,3,4,5].map(num => (
                 <button key={num} 
                   onClick={() => setReviewForm({...reviewForm, rating: num})}
                   className={`w-10 h-10 font-bold game-text text-xl border ${reviewForm.rating >= num ? 'bg-[#F1B51A] border-[#F1B51A] text-black' : 'bg-gray-100 border-gray-200 text-gray-400'}`}
                 >
                   {num}
                 </button>
               ))}
            </div>

            <label className="block text-sm font-bold text-gray-400 mb-2 game-text">Feedback</label>
            <textarea 
              className="w-full bg-white border border-gray-200 text-gray-900 p-3 game-text mb-4 resize-none h-24 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              placeholder="How was the quality?"
              value={reviewForm.text}
              onChange={e => setReviewForm({...reviewForm, text: e.target.value})}
            />

            <div className="flex gap-2">
               <button 
                 onClick={() => {
                   updateDeal(reviewingDeal.id, { review: reviewForm.text, rating: reviewForm.rating, status: 'Accepted' });
                   setReviewingDeal(null);
                 }}
                 className="flex-1 py-3 game-btn game-btn-green"
               >
                 <span className="game-text text-sm">Accept Deal</span>
               </button>
               <button 
                 onClick={() => {
                   updateDeal(reviewingDeal.id, { review: reviewForm.text, rating: reviewForm.rating, status: 'Rejected' });
                   setReviewingDeal(null);
                 }}
                 className="flex-1 py-3 game-btn game-btn-red"
               >
                 <span className="game-text text-sm">Reject Deal</span>
               </button>
            </div>
          </div>
        </div>
      )}

      {activeChatDeal && (
        <ChatModal 
          deal={activeChatDeal} 
          onClose={() => setActiveChatDeal(null)} 
          currentUserRole="restaurant" 
        />
      )}
    </div>
  );
}
