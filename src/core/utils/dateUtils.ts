import type { DayOfWeek, DailyMenu } from '../types';

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDayOfWeekFromDate = (dateStr: string): DayOfWeek => {
  const d = new Date(dateStr + 'T12:00:00'); // Safe mid-day to prevent timezone shifts
  const jsDayIndex = d.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const mapping: DayOfWeek[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  return mapping[jsDayIndex];
};

export const getCurrentDayOfWeek = (): DayOfWeek => {
  const todayStr = getLocalDateString();
  return getDayOfWeekFromDate(todayStr);
};

export const resolveSoldOutItems = (menu: DailyMenu | null, todayStr: string): DailyMenu | null => {
  if (!menu) return null;
  let hasChanges = false;
  const updatedItems = menu.items.map(item => {
    if (!item.available && item.soldOutDate && item.soldOutDate !== todayStr) {
      hasChanges = true;
      return {
        ...item,
        available: true,
        soldOutDate: undefined
      };
    }
    return item;
  });
  if (hasChanges) {
    return {
      ...menu,
      items: updatedItems
    };
  }
  return menu;
};
