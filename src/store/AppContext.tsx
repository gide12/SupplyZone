import React, { createContext, useContext, useState, useEffect } from "react";
import { MenuItem, Restaurant, Deal, Category, SupplierProfile, ChatMessage } from "../types";
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
  // Supplier actions
  activeSupplier: SupplierProfile;
  updateSupplierProfile: (name: string, lat: number, lng: number) => void;
  // Deal actions
  proposeDeal: (deal: Omit<Deal, "id" | "status">) => void;
  updateDealStatus: (dealId: string, status: "Pending" | "Accepted" | "Rejected" | "On Delivery" | "Delivered") => void;
  // Chat actions
  messages: ChatMessage[];
  sendMessage: (dealId: string, text: string, senderId: string, senderRole: "restaurant" | "supplier") => void;
  markMessagesAsRead: (dealId: string, readByRole: "restaurant" | "supplier") => void;
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

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem("supplymap_deals");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSupplier, setActiveSupplier] = useState<SupplierProfile>(() => {
    const saved = localStorage.getItem("supplymap_supplier");
    return saved ? JSON.parse(saved) : { id: "s-1", name: "FreshLogistics Inc.", lat: 51.52, lng: -0.11 };
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("supplymap_messages");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUserMode, setCurrentUserMode] = useState<"restaurant" | "supplier">("restaurant");
  // Simulating being logged in as the first restaurant
  const [activeRestaurantId] = useState<string>("r-1");

  useEffect(() => {
    localStorage.setItem("supplymap_restaurants", JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem("supplymap_deals", JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem("supplymap_supplier", JSON.stringify(activeSupplier));
  }, [activeSupplier]);

  useEffect(() => {
    localStorage.setItem("supplymap_messages", JSON.stringify(messages));
  }, [messages]);

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

  const updateSupplierProfile = (name: string, lat: number, lng: number) => {
    setActiveSupplier(prev => ({ ...prev, name, lat, lng }));
  };

  const proposeDeal = (deal: Omit<Deal, "id" | "status">) => {
    const newDeal: Deal = {
      ...deal,
      id: uuidv4(),
      status: "Pending",
    };
    setDeals(prev => [...prev, newDeal]);
  };

  const updateDealStatus = (dealId: string, status: "Pending" | "Accepted" | "Rejected" | "On Delivery" | "Delivered") => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status } : d));
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
      activeSupplier,
      updateSupplierProfile,
      proposeDeal,
      updateDealStatus,
      messages,
      sendMessage,
      markMessagesAsRead
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
