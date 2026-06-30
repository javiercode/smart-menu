import { useMemo, useState } from 'react';
import { useMenuViewModel } from '../../hooks/useMenuViewModel';

export const useMenu = (restaurantSlug: string) => {
  const menuViewModel = useMenuViewModel(restaurantSlug);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredItems = useMemo(() => {
    if (!menuViewModel.menu) return [];
    if (activeCategory === 'all') return menuViewModel.menu.items;
    return menuViewModel.menu.items.filter(item => item.category === activeCategory);
  }, [menuViewModel.menu, activeCategory]);

  return {
    ...menuViewModel,
    activeCategory,
    setActiveCategory,
    filteredItems,
  };
};
export type UseMenuReturn = ReturnType<typeof useMenu>;
