export type Category = "Appetizer" | "Main Course" | "Dessert" | "Beverage" | "Other";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  quantity?: string;
}

export interface RestaurantInventoryItem {
  id: string;
  name: string;
  quantity: number;
  spaceUsed: number;
  expirationDate: string;
}

export interface Restaurant {
  id: string;
  name: string;
  lat: number;
  lng: number;
  menu: MenuItem[];
  inventory?: RestaurantInventoryItem[];
}

export interface SupplierInventoryItem {
  id: string;
  name: string;
  quantity: number;
  basePrice: number;
  spaceUsed?: number;
  expirationDate?: string;
}

export interface SupplierProfile {
  id: string;
  name: string;
  lat: number;
  lng: number;
  inventory: SupplierInventoryItem[];
}

export interface ChatMessage {
  id: string;
  dealId: string;
  senderId: string;
  senderRole: "restaurant" | "supplier";
  text: string;
  timestamp: number;
  isRead: boolean;
}

export interface Deal {
  id: string;
  restaurantId: string;
  supplierId: string;
  menuItemId: string; // The item the supplier wants to supply ingredients for
  proposedPrice: number;
  status: "Pending" | "Accepted" | "Rejected" | "On Delivery" | "Delivered" | "Sample Requested" | "Sample Arrived";
  review?: string;
  rating?: number;
  mediaUrl?: string;
}
