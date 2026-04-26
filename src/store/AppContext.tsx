import React, { createContext, useContext, useState, useEffect } from "react";
import { MenuItem, Restaurant, Deal, Category } from "../types";
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
  // Supplier actions
  proposeDeal: (deal: Omit<Deal, "id" | "status">) => void;
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
    return saved ? JSON.parse(saved) : defaultRestaurants;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem("supplymap_deals");
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

  const proposeDeal = (deal: Omit<Deal, "id" | "status">) => {
    const newDeal: Deal = {
      ...deal,
      id: uuidv4(),
      status: "Pending",
    };
    setDeals(prev => [...prev, newDeal]);
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
      proposeDeal
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
