import React, { useMemo } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Chip, 
  CircularProgress, 
  Alert, 
  Button, 
  Divider,
  Grid
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarToday, 
  Mic, 
  QrCodeScanner, 
  RestaurantMenu 
} from '@mui/icons-material';
import { useMenu } from './useMenu';
import { MenuList } from '../MenuList';
import type { DayOfWeek } from '../../../../core/types';
import { getLocalDateString } from '../../../../core/utils/dateUtils';
import './MenuContainer.css';

const dayTranslations: Record<DayOfWeek, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
};

const categoryTranslations: Record<string, string> = {
  all: 'Todo',
  starter: 'Entradas',
  main: 'Platos Fuertes',
  dessert: 'Postres',
  drink: 'Bebidas',
  other: 'Otros'
};

export interface MenuContainerProps {
  restaurantSlug: string;
}

export const MenuContainer: React.FC<MenuContainerProps> = ({ restaurantSlug }) => {
  const {
    date,
    resolvedDay,
    menu,
    restaurant,
    loading,
    error,
    activeCategory,
    setActiveCategory,
    filteredItems,
    goToNextDay,
    goToPreviousDay,
  } = useMenu(restaurantSlug);

  // Helper to format date in Spanish (e.g., "Miércoles, 28 de Junio")
  const formattedDate = useMemo(() => {
    const d = new Date(date + 'T12:00:00');
    return d.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    }).replace(/^\w/, (c) => c.toUpperCase());
  }, [date]);

  const isToday = useMemo(() => {
    const todayStr = getLocalDateString();
    return date === todayStr;
  }, [date]);

  if (loading && !restaurant) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

  if (error && !restaurant) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="menu-container-main">
      {/* Navigation / Day Selector */}
      <Paper elevation={3} className="date-nav-paper">
        <IconButton onClick={goToPreviousDay} color="primary" sx={{ border: '1px solid #e0e0e0' }}>
          <ChevronLeft />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, textAlign: 'center' }}>
          <CalendarToday color="primary" sx={{ fontSize: 20 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
              {formattedDate} {isToday && <Chip label="Hoy" size="small" color="success" sx={{ ml: 1, fontWeight: 'bold' }} />}
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={goToNextDay} color="primary" sx={{ border: '1px solid #e0e0e0' }}>
          <ChevronRight />
        </IconButton>
      </Paper>

      {/* Categories Selector Chips */}
      {menu && menu.items.length > 0 && (
        <Box className="categories-chips-scroll">
          {['all', 'starter', 'main', 'dessert', 'drink'].map((cat) => {
            const count = cat === 'all' 
              ? menu.items.length 
              : menu.items.filter(item => item.category === cat).length;
            
            if (cat !== 'all' && count === 0) return null; // Hide categories with no items
            
            return (
              <Chip
                key={cat}
                label={`${categoryTranslations[cat]} (${count})`}
                onClick={() => setActiveCategory(cat)}
                color={activeCategory === cat ? 'primary' : 'default'}
                variant={activeCategory === cat ? 'filled' : 'outlined'}
                sx={{ 
                  fontWeight: 600, 
                  px: 1, 
                  py: 2, 
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              />
            );
          })}
        </Box>
      )}

      {/* Menu Dishes List */}
      {filteredItems.length > 0 ? (
        <MenuList items={filteredItems} categoryTranslations={categoryTranslations} />
      ) : (
        /* Empty State */
        <Paper elevation={0} className="empty-menu-paper">
          <RestaurantMenu sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
          <Typography variant="h5" color="text.primary" gutterBottom sx={{ fontWeight: 700 }}>
            No hay platos disponibles
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 450, mx: 'auto' }}>
            No tenemos platos registrados en la categoría "{categoryTranslations[activeCategory]}" para el {dayTranslations[resolvedDay]}. ¡Por favor navega a otro día de la semana!
          </Typography>
          <Button variant="contained" onClick={goToNextDay} startIcon={<CalendarToday />}>
            Ver menú del día siguiente
          </Button>
        </Paper>
      )}

      {/* Voice Assistant Spotlight Widget */}
      {restaurant?.showVoiceAssistant !== false && (
        <Paper elevation={3} className="voice-widget-card"  style={{backgroundColor:'#1e1e24', color:'white'}}>
          {/* Subtle decorative voice waves */}
          <Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.05, fontSize: '150px', pointerEvents: 'none' }}>
            <Mic />
          </Box>

          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Mic color="secondary" sx={{ fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                  SmartMenu Voice Assistant
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: '-0.3px' }}>
                ¿Prefieres preguntar por voz?
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.85, mb: 2, lineHeight: 1.6 }}>
                Este menú está integrado con asistentes de voz (Alexa y Google Assistant). Activa nuestro skill y pregunta en tiempo real desde tu casa o mesa:
              </Typography>
              <Paper sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'gray', borderRadius: 3, display: 'inline-block' }}>
                <Typography variant="body2" component="code" sx={{ fontWeight: 600 }}>
                  "Alexa, pregunta a SmartMenu qué hay de almuerzo el {dayTranslations[resolvedDay]} en {restaurant?.name || 'El Sabor'}"
                </Typography>
              </Paper>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'center' } }}>
              <Divider sx={{ display: { xs: 'block', md: 'none' }, my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'center' }, gap: 1 }}>
                <QrCodeScanner sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Escanear Código QR
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, maxWidth: 180, textAlign: { xs: 'left', md: 'center' } }}>
                  Escanea el código QR de tu mesa para ver este menú en tu celular al instante.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};
