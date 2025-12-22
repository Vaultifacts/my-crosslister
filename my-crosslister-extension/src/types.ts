export interface InventoryItem {
  _id: string;                  // MongoDB _id stringified
  userId?: string;              // Optional, not needed in frontend
  title: string;
  price: string;
  description: string;
  url: string;
  timestamp: string;            // ISO string from Date
}