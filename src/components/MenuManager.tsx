import React, { useState } from "react";
import { MenuItem, Category } from "../types";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { useAppContext } from "../store/AppContext";

export function MenuManager() {
  const { restaurants, activeRestaurantId, addMenuItem, updateMenuItem, deleteMenuItem } = useAppContext();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
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

  const startAdd = () => {
    setIsAdding(true);
    setIsEditing(null);
    resetForm();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Menu Management</h2>
          <p className="text-sm text-slate-500">Add, update, or remove items from your menu.</p>
        </div>
        {!isAdding && (
          <button
            onClick={startAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all font-bold text-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* ADD NEW ITEM FORM */}
        {isAdding && (
          <div className="p-4 border border-slate-200 bg-slate-50/50 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-800">New Menu Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Item Name"
                className="px-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <div className="flex gap-2 relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  className="px-4 py-2.5 pl-8 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-1/2 font-medium text-slate-800"
                  value={formData.price || ""}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
                <select
                  className="px-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-1/2 font-medium text-slate-800"
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
                className="px-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none md:col-span-2 resize-none h-20 text-slate-800"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
              <input
                type="text"
                placeholder="Required Quantity (e.g., 24 x 1L Bottles)"
                className="px-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 md:col-span-2"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setIsAdding(false); resetForm(); }}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdd}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 font-bold transition-all active:scale-95"
              >
                Save Item
              </button>
            </div>
          </div>
        )}

        {/* LIST OF ITEMS */}
        {restaurant.menu.length === 0 && !isAdding ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No items in your menu yet. Click "Add Item" to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {restaurant.menu.map((item) => (
              <div key={item.id} className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {isEditing === item.id ? (
                  /* EDIT MODE */
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        className="px-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                      <div className="flex gap-2 relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          className="px-4 py-2.5 pl-8 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-1/2 font-medium text-slate-800"
                          value={formData.price || ""}
                          onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        />
                        <select
                          className="px-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-1/2 font-medium text-slate-800"
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
                        className="px-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none md:col-span-2 resize-none h-20 text-slate-800"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Required Quantity (e.g., 24 x 1L Bottles)"
                        className="px-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 md:col-span-2"
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditing(null)}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border-none outline-none"
                        title="Cancel"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl"
                        title="Save Changes"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* VIEW MODE */
                  <>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">
                              {item.category}
                            </span>
                            {item.quantity && (
                              <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase border border-blue-100">
                                Qty: {item.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-500 line-clamp-2">{item.description}</p>
                    </div>
                    
                    <div className="flex flex-row md:flex-col gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                      <button 
                        onClick={() => startEdit(item)}
                        className="flex-1 flex items-center justify-center gap-2 p-2 text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="md:hidden">Edit</span>
                      </button>
                      <button 
                        onClick={() => deleteMenuItem(restaurant.id, item.id)}
                        className="flex-1 flex items-center justify-center gap-2 p-2 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="md:hidden">Delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
