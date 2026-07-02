import { 
  doc, 
  getDoc, 
  setDoc,
  query,
  collection,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db as fbDb } from '../core/firebase/config';
import type { DailyMenu, Restaurant, DayOfWeek } from '../core/types';
import { getLocalDateString, resolveSoldOutItems } from '../core/utils/dateUtils';

export interface IMenuService {
  getMenuByDay(restaurantId: string, day: DayOfWeek, targetDate?: string): Promise<DailyMenu | null>;
  saveMenu(restaurantId: string, menu: DailyMenu): Promise<void>;
  getRestaurant(restaurantId: string): Promise<Restaurant | null>;
  getRestaurantBySlug(slug: string): Promise<Restaurant | null>;
  saveRestaurant(restaurant: Restaurant): Promise<void>;
}

// ---------------------------------------------------------
// Concrete Firebase Firestore Implementation
// ---------------------------------------------------------
class FirebaseMenuService implements IMenuService {
  private getMenuDocRef(restaurantId: string, day: DayOfWeek) {
    if (!fbDb) throw new Error('Firestore no está inicializado.');
    // Combined key: /menus/{restaurantId}_{day}
    return doc(fbDb, 'menus', `${restaurantId}_${day}`);
  }

  async getMenuByDay(restaurantId: string, day: DayOfWeek, targetDate?: string): Promise<DailyMenu | null> {
    const docRef = this.getMenuDocRef(restaurantId, day);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const menu = snap.data() as DailyMenu;
      return resolveSoldOutItems(menu, targetDate || getLocalDateString());
    }
    return null;
  }

  async saveMenu(restaurantId: string, menu: DailyMenu): Promise<void> {
    const docRef = this.getMenuDocRef(restaurantId, menu.day);
    // Sanitize to remove undefined fields for Firestore compatibility
    const sanitizedMenu = JSON.parse(JSON.stringify(menu));
    await setDoc(docRef, sanitizedMenu);
  }

  async getRestaurant(restaurantId: string): Promise<Restaurant | null> {
    if (!fbDb) throw new Error('Firestore no está inicializado.');
    const docRef = doc(fbDb, 'restaurants', restaurantId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Restaurant;
    }
    return null;
  }

  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    if (!fbDb) throw new Error('Firestore no está inicializado.');
    const q = query(collection(fbDb, 'restaurants'), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as Restaurant;
    }
    return null;
  }

  async saveRestaurant(restaurant: Restaurant): Promise<void> {
    if (!fbDb) throw new Error('Firestore no está inicializado.');
    const docRef = doc(fbDb, 'restaurants', restaurant.id);
    // Sanitize to remove undefined fields for Firestore compatibility
    const sanitizedRestaurant = JSON.parse(JSON.stringify(restaurant));
    await setDoc(docRef, sanitizedRestaurant);
  }
}

export const MenuService: IMenuService = new FirebaseMenuService();
