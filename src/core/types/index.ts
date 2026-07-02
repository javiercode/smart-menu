export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: 'starter' | 'main' | 'dessert' | 'drink' | 'other';
  available: boolean;
  soldOutDate?: string;
  disabled?: boolean;
}

export interface DailyMenu {
  id: string; // Typically the day name: 'lunes', 'martes', etc.
  day: DayOfWeek;
  items: MenuItem[];
  restaurantId: string;
}

export interface Restaurant {
  id: string;
  slug: string; // The unique B2C friendly URL slug
  name: string;
  logoUrl?: string;
  primaryColor?: string; // Theme styling (White-label)
  secondaryColor?: string;
  qrCodeUrl?: string;
  email: string;
  showVoiceAssistant?: boolean; // Controls whether to display the Voice Spotlight Card on public menu
}

export interface UserProfile {
  uid: string;
  email: string;
  restaurantId?: string; // Links admin to their restaurant B2B tenant
  role: 'admin' | 'staff';
}
