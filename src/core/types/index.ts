export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: 'starter' | 'main' | 'dessert' | 'drink' | 'other';
  available: boolean;
}

export interface DailyMenu {
  id: string; // Typically the day name: 'lunes', 'martes', etc.
  day: DayOfWeek;
  items: MenuItem[];
  restaurantId: string;
}

export interface Restaurant {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor?: string; // Theme styling (White-label)
  secondaryColor?: string;
  qrCodeUrl?: string;
  email: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  restaurantId?: string; // Links admin to their restaurant B2B tenant
  role: 'admin' | 'staff';
}
