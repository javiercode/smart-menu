import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Grid,
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  IconButton, 
  Chip, 
  CircularProgress, 
  Alert,
  Paper,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarToday, 
  Mic, 
  QrCodeScanner, 
  RestaurantMenu, 
  WhatsApp,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMenuViewModel } from '../features/menu/hooks/useMenuViewModel';
import type { DayOfWeek } from '../core/types';
import { isFirebaseConfigured } from '../core/firebase/config';

const dayTranslations: Record<DayOfWeek, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
};

export const LandingPage: React.FC = () => {
  if (!isFirebaseConfigured) {
    return null;
  }

  const [searchParams] = useSearchParams();
  
  // Default to the seeded 'rest_mock_123' if no tenant is provided in query params
  const restaurantId = searchParams.get('r') || 'rest_mock_123';
  
  const {
    date,
    resolvedDay,
    menu,
    restaurant,
    loading,
    error,
    goToNextDay,
    goToPreviousDay,
  } = useMenuViewModel(restaurantId);

  // Dynamic Theme based on the white-label custom colors of the restaurant
  const dynamicTheme = useMemo(() => {
    const primary = restaurant?.primaryColor || '#1976d2';
    const secondary = restaurant?.secondaryColor || '#dc004e';
    return createTheme({
      palette: {
        primary: { main: primary },
        secondary: { main: secondary },
      },
      typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
              },
            },
          },
        },
      },
    });
  }, [restaurant]);

  // Selected Category filter
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Lead Modal acquisition states
  const [isLeadOpen, setIsLeadOpen] = useState<boolean>(false);
  const [leadName, setLeadName] = useState<string>('');
  const [leadMessage, setLeadMessage] = useState<string>('');

  const filteredItems = useMemo(() => {
    if (!menu) return [];
    if (activeCategory === 'all') return menu.items;
    return menu.items.filter(item => item.category === activeCategory);
  }, [menu, activeCategory]);

  const categoryTranslations: Record<string, string> = {
    all: 'Todo',
    starter: 'Entradas',
    main: 'Platos Fuertes',
    dessert: 'Postres',
    drink: 'Bebidas',
    other: 'Otros'
  };

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
    const todayStr = new Date().toISOString().split('T')[0];
    return date === todayStr;
  }, [date]);

  // Open lead B2B capture modal with customized greeting
  const handleOpenLead = () => {
    setLeadName('');
    setLeadMessage(`¡Hola! Estuve revisando el menú digital de ${restaurant?.name || 'su restaurante'} y me encantó la plataforma. Me gustaría programar una demo y crear mi propio menú digital para mi negocio.`);
    setIsLeadOpen(true);
  };

  // Send the message details directly via WhatsApp API redirection
  const handleLeadSubmit = () => {
    if (!leadName.trim()) {
      alert('Por favor ingrese su nombre para personalizar el contacto.');
      return;
    }

    const adminWhatsAppNumber = import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER || '51999999999';
    const cleanNumber = adminWhatsAppNumber.replace(/[^0-9]/g, '');
    const prefilledText = `Hola, soy *${leadName.trim()}*.\n\nMe interesa crear mi propio menú digital con SmartMenu Pro.\n\nMensaje:\n_"${leadMessage.trim()}"_`;

    const whatsAppLink = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(prefilledText)}`;
    window.open(whatsAppLink, '_blank');
    setIsLeadOpen(false);
  };

  return (
    <ThemeProvider theme={dynamicTheme}>
      <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Main Content wrapper */}
        <Box sx={{ flexGrow: 1, pb: 8 }}>
          {/* Restaurant Brand Header */}
          <Box 
            sx={{ 
              background: `linear-gradient(135deg, ${dynamicTheme.palette.primary.main} 0%, ${dynamicTheme.palette.primary.dark || dynamicTheme.palette.primary.main} 100%)`,
              color: 'white',
              py: 6,
              textAlign: 'center',
              borderBottomLeftRadius: { xs: 24, md: 40 },
              borderBottomRightRadius: { xs: 24, md: 40 },
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Container maxWidth="md">
              {restaurant?.logoUrl ? (
                <Box component="img" src={restaurant.logoUrl} sx={{ height: 80, mb: 2, borderRadius: '50%', border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
              ) : (
                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'white', color: dynamicTheme.palette.primary.main, border: '4px solid white' }}>
                  <RestaurantMenu sx={{ fontSize: 40 }} />
                </Avatar>
              )}
              <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}>
                {restaurant?.name || 'SmartMenu Pro'}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 300 }}>
                Menú Digital Interactivo en Tiempo Real
              </Typography>
            </Container>
          </Box>

          {/* Navigation / Day Selector */}
          <Container maxWidth="md" sx={{ mt: -3 }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                borderRadius: 4, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                bgcolor: 'white'
              }}
            >
              <IconButton onClick={goToPreviousDay} color="primary" sx={{ border: '1px solid #e0e0e0' }}>
                <ChevronLeft />
              </IconButton>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, textAlign: 'center' }}>
                <CalendarToday color="primary" sx={{ fontSize: 20 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                    {formattedDate} {isToday && <Chip label="Hoy" size="small" color="success" sx={{ ml: 1, fontWeight: 'bold' }} />}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Programación del {dayTranslations[resolvedDay]}
                  </Typography>
                </Box>
              </Box>

              <IconButton onClick={goToNextDay} color="primary" sx={{ border: '1px solid #e0e0e0' }}>
                <ChevronRight />
              </IconButton>
            </Paper>
          </Container>

          {/* Content Area */}
          <Container maxWidth="md" sx={{ mt: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress size={50} thickness={4} />
              </Box>
            ) : (
              <>
                {/* Category Chips */}
                {menu && menu.items.length > 0 && (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      overflowX: 'auto', 
                      pb: 2,
                      mb: 3,
                      '&::-webkit-scrollbar': { display: 'none' },
                      msOverflowStyle: 'none',
                      scrollbarWidth: 'none'
                    }}
                  >
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

                {/* Dishes Grid */}
                {filteredItems.length > 0 ? (
                  <Grid container spacing={3}>
                    {filteredItems.map((item) => (
                      <Grid size={{ xs: 12, sm: 6 }} key={item.id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                          {item.imageUrl && (
                            <CardMedia
                              component="img"
                              height="180"
                              image={item.imageUrl}
                              alt={item.name}
                              sx={{ 
                                objectFit: 'cover',
                                transition: 'transform 0.5s ease',
                                '&:hover': { transform: 'scale(1.05)' }
                              }}
                            />
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
                                label={categoryTranslations[item.category]} 
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
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  /* Beautiful Empty State */
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      textAlign: 'center', 
                      py: 8, 
                      px: 4, 
                      borderRadius: 6, 
                      border: '2px dashed #e0e0e0',
                      bgcolor: 'white'
                    }}
                  >
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

                {/* Omnichannel / Voice Assistant Skill Spotlight Card */}
                {restaurant?.showVoiceAssistant !== false && (
                  <Paper 
                    elevation={3} 
                  sx={{ 
                    mt: 6, 
                    p: 4, 
                    borderRadius: 5, 
                    background: 'linear-gradient(135deg, #1e1e24 0%, #2a2b3d 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Subtle decorative voice waves */}
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      right: -20, 
                      bottom: -20, 
                      opacity: 0.05, 
                      fontSize: '150px',
                      pointerEvents: 'none'
                    }}
                  >
                    <Mic />
                  </Box>

                  <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Mic color="secondary" sx={{ fontSize: 28 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: dynamicTheme.palette.secondary.main }}>
                          SmartMenu Voice Assistant
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: '-0.3px' }}>
                        ¿Prefieres preguntar por voz?
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.85, mb: 2, lineHeight: 1.6 }}>
                        Este menú está integrado con asistentes de voz (Alexa y Google Assistant). Activa nuestro skill y pregunta en tiempo real desde tu casa o mesa:
                      </Typography>
                      <Paper 
                        sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(255,255,255,0.08)', 
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: 'white',
                          borderRadius: 3,
                          display: 'inline-block'
                        }}
                      >
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
              </>
            )}
          </Container>
        </Box>

        {/* Footer Area with B2B Lead generation button */}
        <Box 
          component="footer" 
          sx={{ 
            bgcolor: 'white', 
            py: 4, 
            textAlign: 'center', 
            borderTop: '1px solid #e0e0e0',
            width: '100%',
            mt: 'auto'
          }}
        >
          <Container maxWidth="md">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              © 2026 SmartMenu Pro. Todos los derechos reservados.
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
              ¿Quieres un menú digital interactivo como este para tu restaurante?{' '}
              <Button 
                variant="text" 
                color="primary" 
                onClick={handleOpenLead}
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 'bold', 
                  fontSize: 'inherit', 
                  p: 0, 
                  verticalAlign: 'baseline',
                  textDecoration: 'underline',
                  '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
                }}
              >
                ¡Créalo gratis aquí!
              </Button>
            </Typography>

            {/* Direct Client-side Link to Admin Area (Safe from 404s) */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Link to="/admin" style={{ textDecoration: 'none' }}>
                <Typography variant="caption" color="primary" sx={{ fontWeight: 600, fontSize: '0.75rem', opacity: 0.8, '&:hover': { textDecoration: 'underline', opacity: 1 } }}>
                  🔑 Acceso Administrador (Panel de Control)
                </Typography>
              </Link>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Lead Acquisition Modal (WhatsApp Generator) */}
      <Dialog open={isLeadOpen} onClose={() => setIsLeadOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WhatsApp color="success" /> ¡Crea tu Menú Digital!
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Ingresa tu nombre y envíanos un mensaje. Generaremos un enlace de contacto directo vía WhatsApp con el administrador de SmartMenu Pro para habilitar tu cuenta en minutos.
          </Typography>
          <Stack spacing={2.5}>
            <TextField
              label="Tu Nombre / Nombre de Contacto"
              fullWidth
              required
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              placeholder="Ej: Chef Juan"
            />
            <TextField
              label="Mensaje para el Administrador"
              fullWidth
              multiline
              rows={4}
              value={leadMessage}
              onChange={(e) => setLeadMessage(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setIsLeadOpen(false)} color="inherit">Cancelar</Button>
          <Button 
            onClick={handleLeadSubmit} 
            variant="contained" 
            color="success" 
            startIcon={<WhatsApp />}
            sx={{ fontWeight: 'bold', borderRadius: 2, textTransform: 'none' }}
          >
            Enviar por WhatsApp
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};
