import { 
  doc, 
  getDoc, 
  setDoc, 
} from 'firebase/firestore';
import { db as fbDb } from '../core/firebase/config';
import type { DailyMenu, Restaurant, DayOfWeek } from '../core/types';

export interface IMenuService {
  getMenuByDay(restaurantId: string, day: DayOfWeek): Promise<DailyMenu | null>;
  saveMenu(restaurantId: string, menu: DailyMenu): Promise<void>;
  getRestaurant(restaurantId: string): Promise<Restaurant | null>;
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

  async getMenuByDay(restaurantId: string, day: DayOfWeek): Promise<DailyMenu | null> {
    const docRef = this.getMenuDocRef(restaurantId, day);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as DailyMenu;
    }
    return null;
  }

  async saveMenu(restaurantId: string, menu: DailyMenu): Promise<void> {
    const docRef = this.getMenuDocRef(restaurantId, menu.day);
    await setDoc(docRef, menu);
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

  async saveRestaurant(restaurant: Restaurant): Promise<void> {
    if (!fbDb) throw new Error('Firestore no está inicializado.');
    const docRef = doc(fbDb, 'restaurants', restaurant.id);
    await setDoc(docRef, restaurant);
  }
}

export const MenuService: IMenuService = new FirebaseMenuService();
