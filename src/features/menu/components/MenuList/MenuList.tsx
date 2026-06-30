import React from 'react';
import { Grid } from '@mui/material';
import { MenuItem } from '../MenuItem';
import type { MenuItem as MenuItemType } from '../../../../core/types';

export interface MenuListProps {
  items: MenuItemType[];
  categoryTranslations: Record<string, string>;
}

export const MenuList: React.FC<MenuListProps> = ({ items, categoryTranslations }) => {
  return (
    <Grid container spacing={3}>
      {items.map((item) => (
        <Grid size={{ xs: 12, sm: 6 }} key={item.id}>
          <MenuItem item={item} categoryLabel={categoryTranslations[item.category] || 'Otros'} />
        </Grid>
      ))}
    </Grid>
  );
};
