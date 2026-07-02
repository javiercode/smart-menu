import { describe, it, expect } from 'vitest';
import type { UserProfile, Restaurant, DailyMenu, DayOfWeek } from '../core/types';
import type { IAuthService } from '../services/AuthService';
import type { IMenuService } from '../services/MenuService';
import { getLocalDateString, resolveSoldOutItems } from '../core/utils/dateUtils';

// ---------------------------------------------------------
// 1. High-Fidelity Test Mock for AuthService
// ---------------------------------------------------------
class MockAuthService implements IAuthService {
  private usersKey = 'smartmenu_test_users';
  private sessionKey = 'smartmenu_test_session';

  constructor() {
    localStorage.clear();
    const defaultUser: UserProfile = {
      uid: 'mock_admin_123',
      email: 'admin@demo.com',
      restaurantId: 'rest_mock_123',
      role: 'admin'
    };
    localStorage.setItem(this.usersKey, JSON.stringify([{ ...defaultUser, password: 'password123' }]));
    
    // Seed default demo restaurant with a custom slug
    const defaultRestaurant: Restaurant = {
      id: 'rest_mock_123',
      slug: 'restaurante-el-sabor-demo',
      name: 'Restaurante El Sabor Demo',
      email: 'admin@demo.com',
      primaryColor: '#2e7d32',
      secondaryColor: '#ed6c02',
      showVoiceAssistant: true
    };
    localStorage.setItem(`smartmenu_test_restaurant_rest_mock_123`, JSON.stringify(defaultRestaurant));
  }

  private getStoredUsers() {
    const raw = localStorage.getItem(this.usersKey);
    return raw ? JSON.parse(raw) : [];
  }

  private getSession(): UserProfile | null {
    const raw = localStorage.getItem(this.sessionKey);
    return raw ? JSON.parse(raw) : null;
  }

  async signIn(email: string, password: string): Promise<UserProfile> {
    const users = this.getStoredUsers();
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!user) {
      throw new Error('Credenciales inválidas');
    }
    
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      restaurantId: user.restaurantId,
      role: user.role
    };
    
    localStorage.setItem(this.sessionKey, JSON.stringify(profile));
    return profile;
  }

  async signUp(email: string, password: string, restaurantName: string, inviteCode: string): Promise<UserProfile> {
    const users = this.getStoredUsers();
    if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('El correo ya está registrado.');
    }
    
    // Mock B2B Invitation Code Gate
    const trimmedCode = inviteCode.trim();
    if (trimmedCode !== 'DEMO-CODE-2026' && !trimmedCode.startsWith('SMART-INVITE-')) {
      throw new Error('Código de invitación inválido. Por favor contáctese con el administrador.');
    }

    const uid = `mock_user_${Date.now()}`;
    const restaurantId = `rest_mock_${Date.now()}`;
    
    const newProfile: UserProfile = {
      uid,
      email,
      restaurantId,
      role: 'admin'
    };
    
    users.push({ ...newProfile, password });
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    
    const newRestaurant: Restaurant = {
      id: restaurantId,
      slug: restaurantName.toLowerCase().replace(/\s+/g, '-'),
      name: restaurantName,
      email: email,
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      showVoiceAssistant: true
    };
    localStorage.setItem(`smartmenu_test_restaurant_${restaurantId}`, JSON.stringify(newRestaurant));
    
    localStorage.setItem(this.sessionKey, JSON.stringify(newProfile));
    return newProfile;
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(this.sessionKey);
  }

  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    callback(this.getSession());
    return () => {};
  }
}

// ---------------------------------------------------------
// 2. High-Fidelity Test Mock for MenuService
// ---------------------------------------------------------
class MockMenuService implements IMenuService {
  private menuKeyPrefix = 'smartmenu_test_menu_';
  private restaurantKeyPrefix = 'smartmenu_test_restaurant_';

  async getMenuByDay(restaurantId: string, day: DayOfWeek): Promise<DailyMenu | null> {
    const raw = localStorage.getItem(`${this.menuKeyPrefix}${restaurantId}_${day}`);
    if (raw) {
      const menu = JSON.parse(raw) as DailyMenu;
      return resolveSoldOutItems(menu, getLocalDateString());
    }
    return null;
  }

  async saveMenu(restaurantId: string, menu: DailyMenu): Promise<void> {
    localStorage.setItem(`${this.menuKeyPrefix}${restaurantId}_${menu.day}`, JSON.stringify(menu));
  }

  async getRestaurant(restaurantId: string): Promise<Restaurant | null> {
    const raw = localStorage.getItem(`${this.restaurantKeyPrefix}${restaurantId}`);
    return raw ? JSON.parse(raw) : null;
  }

  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.restaurantKeyPrefix)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const rest = JSON.parse(raw) as Restaurant;
          if (rest.slug === slug) {
            return rest;
          }
        }
      }
    }
    return null;
  }

  async saveRestaurant(restaurant: Restaurant): Promise<void> {
    localStorage.setItem(`${this.restaurantKeyPrefix}${restaurant.id}`, JSON.stringify(restaurant));
  }
}

// ---------------------------------------------------------
// Test Cases
// ---------------------------------------------------------
describe('SmartMenu Pro - Local Environments Unit Tests', () => {
  const AuthService = new MockAuthService();
  const MenuService = new MockMenuService();

  describe('AuthService Mocks', () => {
    it('should allow signing in with the seeded default demo account', async () => {
      const user = await AuthService.signIn('admin@demo.com', 'password123');
      
      expect(user).toBeDefined();
      expect(user.email).toBe('admin@demo.com');
      expect(user.restaurantId).toBe('rest_mock_123');
    });

    it('should reject invalid credentials with a customized error', async () => {
      await expect(
        AuthService.signIn('notreal@email.com', 'badpass')
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('should successfully register new B2B restaurant tenants and credentials', async () => {
      const email = 'chef@michelin.com';
      const user = await AuthService.signUp(email, 'starpass123', 'Michelin Star Bistro', 'SMART-INVITE-1');
      
      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.restaurantId).toContain('rest_mock_');
      
      const rest = await MenuService.getRestaurant(user.restaurantId!);
      expect(rest).toBeDefined();
      expect(rest?.name).toBe('Michelin Star Bistro');
      expect(rest?.slug).toBe('michelin-star-bistro');
    });
  });

  describe('MenuService Mocks', () => {
    const resId = 'rest_mock_999';

    it('should return null if no menu is scheduled for a given date', async () => {
      const result = await MenuService.getMenuByDay(resId, 'domingo');
      expect(result).toBeNull();
    });

    it('should persist and retrieve daily menus with images in Base64', async () => {
      const targetDay: DayOfWeek = 'martes';
      const menuPayload: DailyMenu = {
        id: targetDay,
        day: targetDay,
        restaurantId: resId,
        items: [
          {
            id: 'item_ceviche',
            name: 'Ceviche Mixto',
            description: 'Clásico ceviche peruano marinado en limón con base64 de imagen.',
            price: 18.00,
            category: 'starter',
            imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
            available: true
          }
        ]
      };

      await MenuService.saveMenu(resId, menuPayload);

      const fetched = await MenuService.getMenuByDay(resId, targetDay);
      expect(fetched).toBeDefined();
      expect(fetched?.day).toBe(targetDay);
      expect(fetched?.items.length).toBe(1);
      expect(fetched?.items[0].imageUrl).toContain('base64');
    });

    it('should clear sold-out status of menu items the next day', async () => {
      const targetDay: DayOfWeek = 'miercoles';
      const todayStr = getLocalDateString();
      
      // Calculate a date that is from yesterday/past
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);

      const menuPayload: DailyMenu = {
        id: targetDay,
        day: targetDay,
        restaurantId: resId,
        items: [
          {
            id: 'item_sold_out_today',
            name: 'Plato Agotado Hoy',
            description: 'Debe continuar agotado hoy.',
            price: 10.00,
            category: 'main',
            available: false,
            soldOutDate: todayStr
          },
          {
            id: 'item_sold_out_yesterday',
            name: 'Plato Agotado Ayer',
            description: 'Debe ser restaurado a disponible hoy automáticamente.',
            price: 12.00,
            category: 'main',
            available: false,
            soldOutDate: yesterdayStr
          }
        ]
      };

      await MenuService.saveMenu(resId, menuPayload);

      const fetched = await MenuService.getMenuByDay(resId, targetDay);
      expect(fetched).toBeDefined();
      expect(fetched?.items.length).toBe(2);

      // item_sold_out_today should remain sold out (available: false)
      const itemToday = fetched?.items.find(i => i.id === 'item_sold_out_today');
      expect(itemToday).toBeDefined();
      expect(itemToday?.available).toBe(false);
      expect(itemToday?.soldOutDate).toBe(todayStr);

      // item_sold_out_yesterday should be automatically marked as available again (available: true)
      const itemYesterday = fetched?.items.find(i => i.id === 'item_sold_out_yesterday');
      expect(itemYesterday).toBeDefined();
      expect(itemYesterday?.available).toBe(true);
      expect(itemYesterday?.soldOutDate).toBeUndefined();
    });
  });
});
