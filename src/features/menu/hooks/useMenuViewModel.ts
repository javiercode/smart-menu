import { useState, useEffect, useCallback, useMemo } from 'react';
import { MenuService } from '../../../services/MenuService';
import type { DailyMenu, Restaurant, DayOfWeek } from '../../../core/types';

export const DAYS_ORDER: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const getDayOfWeekFromDate = (dateStr: string): DayOfWeek => {
  const d = new Date(dateStr + 'T12:00:00'); // Safe mid-day to prevent timezone shifts
  const jsDayIndex = d.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const mapping: DayOfWeek[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  return mapping[jsDayIndex];
};

export const getCurrentDayOfWeek = (): DayOfWeek => {
  const todayStr = new Date().toISOString().split('T')[0];
  return getDayOfWeekFromDate(todayStr);
};

export const useMenuViewModel = (restaurantId: string, initialDate?: string) => {
  // We keep the actual calendar date state (YYYY-MM-DD)
  const [date, setDateState] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamically resolve the weekday from the selected calendar date
  const resolvedDay = useMemo(() => {
    return getDayOfWeekFromDate(date);
  }, [date]);

  // Load restaurant details & design preferences
  useEffect(() => {
    let active = true;
    const loadRestaurant = async () => {
      try {
        const res = await MenuService.getRestaurant(restaurantId);
        if (active && res) {
          setRestaurant(res);
        }
      } catch (err: any) {
        console.error('Error loading restaurant details:', err);
      }
    };
    loadRestaurant();
    return () => {
      active = false;
    };
  }, [restaurantId]);

  // Load daily menu for the resolved weekday
  const loadMenu = useCallback(async (targetDay: DayOfWeek) => {
    setLoading(true);
    setError(null);
    try {
      const dailyMenu = await MenuService.getMenuByDay(restaurantId, targetDay);
      setMenu(dailyMenu);
    } catch (err: any) {
      setError(err.message || 'Error cargando el menú del día');
      setMenu(null);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadMenu(resolvedDay);
  }, [resolvedDay, loadMenu]);

  const setDate = (newDate: string) => {
    setDateState(newDate);
  };

  const changeDay = (offset: number) => {
    const currentDate = new Date(date + 'T12:00:00'); // Safe mid-day
    currentDate.setDate(currentDate.getDate() + offset);
    setDateState(currentDate.toISOString().split('T')[0]);
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
    refresh: () => loadMenu(resolvedDay),
  };
};
export type UseMenuViewModelReturn = ReturnType<typeof useMenuViewModel>;
