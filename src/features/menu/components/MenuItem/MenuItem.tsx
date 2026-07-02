import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import type { MenuItem as MenuItemType } from '../../../../core/types';
import './MenuItem.css';

export interface MenuItemProps {
  item: MenuItemType;
  categoryLabel: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item, categoryLabel }) => {
  return (
    <Card className="menu-item-card">
      {item.imageUrl && (
        <Box className="menu-item-media-container" sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="180"
            image={item.imageUrl}
            alt={item.name}
            className="menu-item-media"
            sx={{ filter: item.available ? 'none' : 'grayscale(30%) brightness(0.7)' }}
          />
          {!item.available && (
            <Box 
              className="sold-out-stamp"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-15deg)',
                border: '4px solid #d32f2f',
                color: '#d32f2f',
                padding: '4px 12px',
                fontSize: '1.5rem',
                fontWeight: '900',
                borderRadius: '8px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                userSelect: 'none',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            >
              Agotado
            </Box>
          )}
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
            {item.name}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
            ${item.price.toFixed(2)}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1, lineBreak: 'anywhere' }}>
          {item.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Chip 
            label={categoryLabel} 
            size="small" 
            variant="outlined" 
            color="secondary"
            sx={{ fontWeight: 500 }}
          />
          {!item.available && (
            <Chip 
              label="Agotado" 
              size="small" 
              color="error" 
              variant="filled"
              sx={{ fontWeight: 'bold' }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
