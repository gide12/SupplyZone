import React, { createContext, useContext, useState, useEffect } from "react";
import { MenuItem, Restaurant, Deal, Category, SupplierProfile, ChatMessage, SupplierInventoryItem, RestaurantInventoryItem } from "../types";
import { v4 as uuidv4 } from "uuid";

interface AppContextType {
  restaurants: Restaurant[];
  deals: Deal[];
  currentUserMode: "restaurant" | "supplier";
  setCurrentUserMode: (mode: "restaurant" | "supplier") => void;
  // Restaurant actions
  activeRestaurantId: string | null;
  addMenuItem: (restaurantId: string, item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (restaurantId: string, itemId: string, item: Omit<MenuItem, "id">) => void;
  deleteMenuItem: (restaurantId: string, itemId: string) => void;
  updateRestaurantProfile: (id: string, name: string, lat: number, lng: number) => void;
  updateRestaurantInventory: (id: string, inventory: RestaurantInventoryItem[]) => void;
  // Supplier actions
  suppliers: SupplierProfile[];
  activeSupplier: SupplierProfile;
  updateSupplierProfile: (id: string, name: string, lat: number, lng: number) => void;
  updateSupplierInventory: (id: string, inventory: SupplierInventoryItem[]) => void;
  // Dynamic Pricing
  calculateDynamicPrice: (itemName: string) => { estimatedPrice: number; marketSupply: number; marketDemand: number };
  // Deal actions
  proposeDeal: (deal: Omit<Deal, "id" | "status">) => void;
  updateDealStatus: (dealId: string, status: "Pending" | "Accepted" | "Rejected" | "On Delivery" | "Delivered" | "Sample Requested" | "Sample Arrived") => void;
  updateDeal: (dealId: string, updates: Partial<Deal>) => void;
  // Chat actions
  messages: ChatMessage[];
  sendMessage: (dealId: string, text: string, senderId: string, senderRole: "restaurant" | "supplier") => void;
  markMessagesAsRead: (dealId: string, readByRole: "restaurant" | "supplier") => void;
  // Language actions
  language: "en" | "id";
  setLanguage: (lang: "en" | "id") => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultRestaurants: Restaurant[] = [
  {
    id: "r-1",
    name: "The Rustic Spoon",
    lat: 51.505,
    lng: -0.09,
    menu: [
      { id: "m-1", name: "Avocado Toast", description: "Sourdough, smashed avocado, poached egg", price: 12.5, category: "Appetizer" },
      { id: "m-2", name: "Truffle Pasta", description: "Fresh tagliatelle, black truffle siding", price: 24.0, category: "Main Course" },
    ],
  },
  {
    id: "r-2",
    name: "Burger Joint",
    lat: 51.51,
    lng: -0.1,
    menu: [
      { id: "m-3", name: "Classic Cheeseburger", description: "Beef patty, cheddar, lettuce, tomato", price: 14.0, category: "Main Course" },
      { id: "m-4", name: "Sweet Potato Fries", description: "Crispy fries with aioli", price: 6.5, category: "Appetizer" },
    ],
  }
];

const defaultSuppliers: SupplierProfile[] = [
  { id: "s-1", name: "FreshLogistics Inc.", lat: 51.52, lng: -0.11, inventory: [
      { id: "i-1", name: "Avocado Toast", quantity: 50, basePrice: 2.5, spaceUsed: 5.0, expirationDate: "2026-06-01" },
      { id: "i-2", name: "Classic Cheeseburger", quantity: 100, basePrice: 3.0, spaceUsed: 10.0, expirationDate: "2026-05-15" },
    ] 
  },
  { id: "s-2", name: "Valley Farms", lat: 51.49, lng: -0.08, inventory: [
      { id: "i-3", name: "Truffle Pasta", quantity: 30, basePrice: 8.0, spaceUsed: 2.0, expirationDate: "2026-05-10" },
      { id: "i-4", name: "Avocado Toast", quantity: 10, basePrice: 3.0, spaceUsed: 1.0, expirationDate: "2026-06-01" },
    ]
  },
  { id: "s-3", name: "Metro Meat & Veg", lat: 51.515, lng: -0.105, inventory: [
      { id: "i-5", name: "Classic Cheeseburger", quantity: 200, basePrice: 2.8, spaceUsed: 20.0, expirationDate: "2026-05-20" },
      { id: "i-6", name: "Sweet Potato Fries", quantity: 150, basePrice: 1.5, spaceUsed: 15.0, expirationDate: "2026-07-01" },
    ]
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem("supplymap_restaurants");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((r: any) => ({
          ...r,
          lat: r.lat ?? (51.505 + (Math.random() * 0.1 - 0.05)),
          lng: r.lng ?? (-0.09 + (Math.random() * 0.1 - 0.05)),
        }));
      } catch (e) {
        return defaultRestaurants;
      }
    }
    return defaultRestaurants;
  });

  const [suppliers, setSuppliers] = useState<SupplierProfile[]>(() => {
    const saved = localStorage.getItem("supplymap_suppliers");
    return saved ? JSON.parse(saved) : defaultSuppliers;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem("supplymap_deals");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSupplier, setActiveSupplier] = useState<SupplierProfile>(() => {
    const saved = localStorage.getItem("supplymap_supplier");
    // Default to the first supplier in the defaultSuppliers list if no saved profile is found.
    // Ensure that it has an inventory property.
    return saved ? JSON.parse(saved) : defaultSuppliers[0];
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("supplymap_messages");
    return saved ? JSON.parse(saved) : [];
  });

  const [language, setLanguage] = useState<"en" | "id">(() => {
    const saved = localStorage.getItem("supplymap_language");
    return saved === "id" ? "id" : "en";
  });

  const [currentUserMode, setCurrentUserMode] = useState<"restaurant" | "supplier">("restaurant");
  // Simulating being logged in as the first restaurant
  const [activeRestaurantId] = useState<string>("r-1");

  useEffect(() => {
    localStorage.setItem("supplymap_restaurants", JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem("supplymap_suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem("supplymap_deals", JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem("supplymap_supplier", JSON.stringify(activeSupplier));
  }, [activeSupplier]);

  useEffect(() => {
    localStorage.setItem("supplymap_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("supplymap_language", language);
  }, [language]);

  const addMenuItem = (restaurantId: string, item: Omit<MenuItem, "id">) => {
    setRestaurants(prev => prev.map(r => 
      r.id === restaurantId 
        ? { ...r, menu: [...r.menu, { ...item, id: uuidv4() }] } 
        : r
    ));
  };

  const updateMenuItem = (restaurantId: string, itemId: string, updatedItem: Omit<MenuItem, "id">) => {
    setRestaurants(prev => prev.map(r => 
      r.id === restaurantId 
        ? { ...r, menu: r.menu.map(m => m.id === itemId ? { ...updatedItem, id: itemId } : m) } 
        : r
    ));
  };

  const deleteMenuItem = (restaurantId: string, itemId: string) => {
    setRestaurants(prev => prev.map(r => 
      r.id === restaurantId 
        ? { ...r, menu: r.menu.filter(m => m.id !== itemId) } 
        : r
    ));
  };

  const updateRestaurantProfile = (id: string, name: string, lat: number, lng: number) => {
    setRestaurants(prev => prev.map(r => 
      r.id === id ? { ...r, name, lat, lng } : r
    ));
  };

  const updateRestaurantInventory = (id: string, inventory: RestaurantInventoryItem[]) => {
    setRestaurants(prev => prev.map(r => 
      r.id === id ? { ...r, inventory } : r
    ));
  };

  const updateSupplierProfile = (id: string, name: string, lat: number, lng: number) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, name, lat, lng } : s));
    if (activeSupplier.id === id) {
      setActiveSupplier(prev => ({ ...prev, name, lat, lng }));
    }
  };

  const updateSupplierInventory = (id: string, inventory: SupplierInventoryItem[]) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, inventory } : s));
    if (activeSupplier.id === id) {
      setActiveSupplier(prev => ({ ...prev, inventory }));
    }
  };

  const calculateDynamicPrice = (itemName: string) => {
    const marketDemand = restaurants.reduce((acc, r) => {
      const hasItem = r.menu.some(m => m.name.toLowerCase() === itemName.toLowerCase());
      return acc + (hasItem ? 100 : 0);
    }, 0);

    let marketSupply = 0;
    let basePriceSum = 0;
    let basePriceCount = 0;

    suppliers.forEach(s => {
      s.inventory?.forEach(i => {
        if (i.name.toLowerCase() === itemName.toLowerCase()) {
          marketSupply += i.quantity;
          basePriceSum += i.basePrice;
          basePriceCount++;
        }
      });
    });

    const averageBasePrice = basePriceCount > 0 ? (basePriceSum / basePriceCount) : 5.0;

    let estimatedPrice = averageBasePrice;
    if (marketDemand > 0 && marketSupply > 0) {
       const demandSupplyRatio = marketDemand / marketSupply;
       const multiplier = Math.min(2.5, Math.max(0.5, demandSupplyRatio));
       estimatedPrice = averageBasePrice * multiplier;
    } else if (marketDemand > 0 && marketSupply === 0) {
       // High demand, no supply
       estimatedPrice = averageBasePrice * 2.0;
    } else if (marketDemand === 0 && marketSupply > 0) {
       // No demand, high supply
       estimatedPrice = averageBasePrice * 0.5;
    }

    return {
      estimatedPrice: Number(estimatedPrice.toFixed(2)),
      marketSupply,
      marketDemand
    };
  };

  const proposeDeal = (deal: Omit<Deal, "id" | "status">) => {
    const newDeal: Deal = {
      ...deal,
      id: uuidv4(),
      status: "Pending",
    };
    setDeals(prev => [...prev, newDeal]);
  };

  const updateDealStatus = (dealId: string, status: "Pending" | "Accepted" | "Rejected" | "On Delivery" | "Delivered" | "Sample Requested" | "Sample Arrived") => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status } : d));
  };

  const updateDeal = (dealId: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, ...updates } : d));
  };

  const sendMessage = (dealId: string, text: string, senderId: string, senderRole: "restaurant" | "supplier") => {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      dealId,
      senderId,
      senderRole,
      text,
      timestamp: Date.now(),
      isRead: false,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const markMessagesAsRead = (dealId: string, readByRole: "restaurant" | "supplier") => {
    setMessages(prev => prev.map(m => {
      // If message is in this deal, and was sent by the OTHER role, and is currently unread
      if (m.dealId === dealId && m.senderRole !== readByRole && !m.isRead) {
        return { ...m, isRead: true };
      }
      return m;
    }));
  };

  return (
    <AppContext.Provider value={{
      restaurants,
      deals,
      currentUserMode,
      setCurrentUserMode,
      activeRestaurantId,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      updateRestaurantProfile,
      updateRestaurantInventory,
      suppliers,
      activeSupplier,
      updateSupplierProfile,
      updateSupplierInventory,
      calculateDynamicPrice,
      proposeDeal,
      updateDealStatus,
      updateDeal,
      messages,
      sendMessage,
      markMessagesAsRead,
      language,
      setLanguage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
