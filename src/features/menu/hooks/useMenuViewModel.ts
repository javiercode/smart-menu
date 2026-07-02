import { useState, useEffect, useCallback, useMemo } from 'react';
import { MenuService } from '../../../services/MenuService';
import type { DailyMenu, Restaurant, DayOfWeek } from '../../../core/types';
import { 
  getLocalDateString, 
  getDayOfWeekFromDate, 
  getCurrentDayOfWeek 
} from '../../../core/utils/dateUtils';

export const DAYS_ORDER: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export { getDayOfWeekFromDate, getCurrentDayOfWeek };

export const useMenuViewModel = (restaurantSlug: string, initialDate?: string) => {
  // We keep the actual calendar date state (YYYY-MM-DD)
  const [date, setDateState] = useState<string>(
    initialDate || getLocalDateString()
  );
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamically resolve the weekday from the selected calendar date
  const resolvedDay = useMemo(() => {
    return getDayOfWeekFromDate(date);
  }, [date]);

  // Load restaurant details by its custom URL slug
  useEffect(() => {
    let active = true;
    setLoading(true);
    const loadRestaurant = async () => {
      try {
        const res = await MenuService.getRestaurantBySlug(restaurantSlug);
        if (active) {
          if (res) {
            setRestaurant(res);
          } else {
            setError('No se encontró el restaurante solicitado.');
            setLoading(false);
          }
        }
      } catch (err: any) {
        console.error('Error loading restaurant details:', err);
        if (active) {
          setError('Error cargando los detalles del restaurante.');
          setLoading(false);
        }
      }
    };
    loadRestaurant();
    return () => {
      active = false;
    };
  }, [restaurantSlug]);

  // Load daily menu for the resolved weekday using the resolved restaurant's database ID
  const loadMenu = useCallback(async (targetDay: DayOfWeek, actualResId: string, targetDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const dailyMenu = await MenuService.getMenuByDay(actualResId, targetDay, targetDate);
      setMenu(dailyMenu);
    } catch (err: any) {
      setError(err.message || 'Error cargando el menú del día');
      setMenu(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (restaurant) {
      loadMenu(resolvedDay, restaurant.id, date);
    }
  }, [resolvedDay, restaurant, date, loadMenu]);

  const setDate = (newDate: string) => {
    setDateState(newDate);
  };

  const changeDay = (offset: number) => {
    const currentDate = new Date(date + 'T12:00:00'); // Safe mid-day
    currentDate.setDate(currentDate.getDate() + offset);
    setDateState(getLocalDateString(currentDate));
  };

  const goToNextDay = () => changeDay(1);
  const goToPreviousDay = () => changeDay(-1);

  return {
    date,
    resolvedDay,
    menu,
    restaurant,
    loading,
    error,
    setDate,
    goToNextDay,
    goToPreviousDay,
    refresh: () => restaurant && loadMenu(resolvedDay, restaurant.id, date),
  };
};
export type UseMenuViewModelReturn = ReturnType<typeof useMenuViewModel>;
