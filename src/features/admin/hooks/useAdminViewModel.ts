import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../../../services/AuthService';
import { MenuService } from '../../../services/MenuService';
import { getCurrentDayOfWeek } from '../../menu/hooks/useMenuViewModel';
import type { UserProfile, Restaurant, DailyMenu, MenuItem, DayOfWeek } from '../../../core/types';

export const useAdminViewModel = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [loadingMenu, setLoadingMenu] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Selected weekday for editing inside the dashboard
  const [selectedDay, setSelectedDayState] = useState<DayOfWeek>(
    getCurrentDayOfWeek()
  );
  const [selectedMenu, setSelectedMenu] = useState<DailyMenu | null>(null);

  // Subscribe to Authentication state changes
  useEffect(() => {
    setLoadingSession(true);
    const unsubscribe = AuthService.onAuthStateChanged(async (currUser) => {
      setUser(currUser);
      if (currUser && currUser.restaurantId) {
        try {
          const res = await MenuService.getRestaurant(currUser.restaurantId);
          setRestaurant(res);
        } catch (err: any) {
          console.error('Error fetching admin restaurant details:', err);
        }
      } else {
        setRestaurant(null);
      }
      setLoadingSession(false);
    });
    return unsubscribe;
  }, []);

  // Fetch the menu for the current selected weekday being edited
  const loadSelectedDayMenu = useCallback(async (day: DayOfWeek, resId: string) => {
    setLoadingMenu(true);
    try {
      const menu = await MenuService.getMenuByDay(resId, day);
      if (menu) {
        setSelectedMenu(menu);
      } else {
        // Create an empty menu template for this weekday if none exists
        setSelectedMenu({
          id: day,
          day: day,
          restaurantId: resId,
          items: []
        });
      }
    } catch (err: any) {
      console.error('Error fetching daily menu:', err);
      setError('No se pudo cargar el menú para el día seleccionado.');
    } finally {
      setLoadingMenu(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.restaurantId) {
      loadSelectedDayMenu(selectedDay, user.restaurantId);
    } else {
      setSelectedMenu(null);
    }
  }, [selectedDay, user, loadSelectedDayMenu]);

  // Auth Operations
  const login = async (email: string, password: string) => {
    setLoadingAction(true);
    setError(null);
    try {
      const profile = await AuthService.signIn(email, password);
      setUser(profile);
      return profile;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoadingAction(false);
    }
  };

  const register = async (email: string, password: string, restaurantName: string) => {
    setLoadingAction(true);
    setError(null);
    try {
      const profile = await AuthService.signUp(email, password, restaurantName);
      setUser(profile);
      return profile;
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
      throw err;
    } finally {
      setLoadingAction(false);
    }
  };

  const logout = async () => {
    setLoadingAction(true);
    try {
      await AuthService.signOut();
      setUser(null);
      setRestaurant(null);
      setSelectedMenu(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  // CRUD operations on Selected Menu
  const saveCurrentMenu = async (items: MenuItem[]) => {
    if (!user || !user.restaurantId || !selectedMenu) {
      throw new Error('No hay sesión de administrador activa.');
    }
    setLoadingAction(true);
    setError(null);
    try {
      const updatedMenu: DailyMenu = {
        ...selectedMenu,
        items
      };
      await MenuService.saveMenu(user.restaurantId, updatedMenu);
      setSelectedMenu(updatedMenu);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el menú.');
      throw err;
    } finally {
      setLoadingAction(false);
    }
  };

  // Update Restaurant settings (White-label styling)
  const saveRestaurantSettings = async (name: string, primaryColor: string, secondaryColor: string, showVoiceAssistant: boolean) => {
    if (!user || !user.restaurantId || !restaurant) {
      throw new Error('No hay sesión de restaurante activa.');
    }
    setLoadingAction(true);
    setError(null);
    try {
      const updatedRestaurant: Restaurant = {
        ...restaurant,
        name,
        primaryColor,
        secondaryColor,
        showVoiceAssistant
      };
      await MenuService.saveRestaurant(updatedRestaurant);
      setRestaurant(updatedRestaurant);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los ajustes de marca.');
      throw err;
    } finally {
      setLoadingAction(false);
    }
  };

  return {
    user,
    restaurant,
    loadingSession,
    loadingAction,
    loadingMenu,
    error,
    selectedDay,
    selectedMenu,
    setSelectedDay: setSelectedDayState,
    login,
    register,
    logout,
    saveCurrentMenu,
    saveRestaurantSettings,
    clearError: () => setError(null)
  };
};
export type UseAdminViewModelReturn = ReturnType<typeof useAdminViewModel>;
