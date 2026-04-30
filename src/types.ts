export type Category = "Appetizer" | "Main Course" | "Dessert" | "Beverage" | "Other";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  quantity?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  lat: number;
  lng: number;
  menu: MenuItem[];
}

export interface SupplierProfile {
  id: string;
  name: string;
  lat: number;
  lng: number;
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
  status: "Pending" | "Accepted" | "Rejected" | "On Delivery" | "Delivered";
  mediaUrl?: string;
}
