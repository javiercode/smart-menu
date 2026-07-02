import React, { useState, useMemo } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  TextField, 
  Button, 
  IconButton, 
  Chip, 
  CircularProgress, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
  Divider,
  Avatar,
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Save, 
  ExitToApp, 
  QrCode, 
  RestaurantMenu, 
  CalendarToday, 
  Lock, 
  Mic, 
  OpenInNew,
  Palette,
  CloudUpload,
  NoFood,
  Restaurant,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAdminViewModel } from '../features/admin/hooks/useAdminViewModel';
import { DAYS_ORDER } from '../features/menu/hooks/useMenuViewModel';
import { BrandManager } from '../components/BrandManager';
import { Footer } from '../components/Footer';
import type { MenuItem, DayOfWeek } from '../core/types';
import { isFirebaseConfigured } from '../core/firebase/config';
import { getLocalDateString } from '../core/utils/dateUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const dayTranslations: Record<DayOfWeek, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
};

export const AdminPage: React.FC = () => {
  if (!isFirebaseConfigured) {
    return null;
  }

  const {
    user,
    restaurant,
    loadingSession,
    loadingAction,
    loadingMenu,
    error,
    selectedDay,
    selectedMenu,
    setSelectedDay,
    login,
    register,
    logout,
    saveCurrentMenu,
    saveRestaurantSettings,
    clearError,
  } = useAdminViewModel();

  // Local active tab
  const [tabValue, setTabValue] = useState<number>(0);

  // Authentication UI local state
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authRestName, setAuthRestName] = useState<string>('');
  const [authRegCode, setAuthRegCode] = useState<string>('');

  // Local menu items copy for editing (so we can add/remove plates locally before batch saving)
  const [localItems, setLocalItems] = useState<MenuItem[]>([]);
  const [hasMenuChanges, setLocalChanges] = useState<boolean>(false);

  // Modal Dialog local states (Dish form)
  const [isDishOpen, setIsDishOpen] = useState<boolean>(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [dishName, setDishName] = useState<string>('');
  const [dishDescription, setDishDescription] = useState<string>('');
  const [dishPrice, setDishPrice] = useState<string>('');
  const [dishCategory, setDishCategory] = useState<MenuItem['category']>('main');
  const [dishImageUrl, setDishImageUrl] = useState<string>('');
  const [dishAvailable, setDishAvailable] = useState<boolean>(true);

  // Synchronize when fetched menu changes
  React.useEffect(() => {
    if (selectedMenu) {
      setLocalItems(selectedMenu.items);
      setLocalChanges(false);
    }
  }, [selectedMenu]);

  // One-click B2B demo onboarding for live Firebase (Auto-register or Auto-login fallback)
  const handleFillDemo = async () => {
    setIsRegister(true);
    setAuthRestName('Restaurante El Sabor Demo');
    setAuthEmail('admin@demo.com');
    setAuthPassword('password123');
    setAuthRegCode('DEMO-CODE-2026');
    
    clearError();
    try {
      // First attempt: try to register the demo account (works on fresh database runs!)
      await register('admin@demo.com', 'password123', 'Restaurante El Sabor Demo', 'DEMO-CODE-2026');
    } catch (regErr: any) {
      // If email already exists, automatically fallback to logging in!
      if (
        regErr.code === 'auth/email-already-in-use' || 
        regErr.code === 'auth/already-initialized' ||
        (regErr.message && regErr.message.includes('already')) ||
        (regErr.message && regErr.message.includes('en uso')) ||
        (regErr.message && regErr.message.includes('registrado'))
      ) {
        try {
          setIsRegister(false); // Switch UI to login view
          await login('admin@demo.com', 'password123');
        } catch (loginErr: any) {
          alert('Error al iniciar sesión en el demo: ' + loginErr.message);
        }
      } else {
        alert('Error al crear el demo: ' + regErr.message);
      }
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      if (isRegister) {
        await register(authEmail, authPassword, authRestName, authRegCode);
      } else {
        await login(authEmail, authPassword);
      }
    } catch (err: any) {
      // Show specific firebase errors nicely via alert if registration fails
      alert(err.message || 'Error en el proceso de autenticación');
    }
  };

  // Dish CRUD actions
  const openAddDish = () => {
    setEditingDish(null);
    setDishName('');
    setDishDescription('');
    setDishPrice('');
    setDishCategory('main');
    setDishImageUrl('');
    setDishAvailable(true);
    setIsDishOpen(true);
  };

  const openEditDish = (item: MenuItem) => {
    setEditingDish(item);
    setDishName(item.name);
    setDishDescription(item.description);
    setDishPrice(item.price.toString());
    setDishCategory(item.category);
    setDishImageUrl(item.imageUrl || '');
    setDishAvailable(item.available);
    setIsDishOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        alert('La imagen es demasiado grande. Por favor elija una de menos de 800KB para optimizar el almacenamiento.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setDishImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDishSaveSubmit = async () => {
    if (!dishName.trim()) {
      alert('Por favor ingrese el nombre del plato');
      return;
    }
    const parsedPrice = parseFloat(dishPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Por favor ingrese un precio válido (mayor a 0)');
      return;
    }

    const dishData: MenuItem = {
      id: editingDish?.id || `dish_${Date.now()}`,
      name: dishName,
      description: dishDescription,
      price: parsedPrice,
      category: dishCategory,
      imageUrl: dishImageUrl.trim() || undefined,
      available: dishAvailable,
      soldOutDate: dishAvailable ? undefined : getLocalDateString()
    };

    let updatedList: MenuItem[];
    if (editingDish) {
      updatedList = localItems.map(item => item.id === editingDish.id ? dishData : item);
    } else {
      updatedList = [...localItems, dishData];
    }

    setLocalItems(updatedList);
    setLocalChanges(true);
    setIsDishOpen(false);

    try {
      await saveCurrentMenu(updatedList);
      setLocalChanges(false);
    } catch (err: any) {
      alert('Error guardando los cambios del plato: ' + (err.message || err));
    }
  };

  const handleDishDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este plato?')) {
      const updatedList = localItems.filter(item => item.id !== id);
      setLocalItems(updatedList);
      setLocalChanges(true);

      try {
        await saveCurrentMenu(updatedList);
        setLocalChanges(false);
      } catch (err: any) {
        alert('Error eliminando el plato: ' + (err.message || err));
      }
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    const todayStr = getLocalDateString();
    const updatedItems = localItems.map(listItem => {
      if (listItem.id === item.id) {
        const nextAvailable = !listItem.available;
        return {
          ...listItem,
          available: nextAvailable,
          soldOutDate: nextAvailable ? undefined : todayStr
        };
      }
      return listItem;
    });
    setLocalItems(updatedItems);
    setLocalChanges(true);

    try {
      await saveCurrentMenu(updatedItems);
      setLocalChanges(false);
    } catch (err: any) {
      alert('Error actualizando disponibilidad del plato: ' + (err.message || err));
    }
  };

  const handleToggleDisabled = async (item: MenuItem) => {
    const updatedItems = localItems.map(listItem => {
      if (listItem.id === item.id) {
        return {
          ...listItem,
          disabled: !listItem.disabled
        };
      }
      return listItem;
    });
    setLocalItems(updatedItems);
    setLocalChanges(true);

    try {
      await saveCurrentMenu(updatedItems);
      setLocalChanges(false);
    } catch (err: any) {
      alert('Error actualizando visibilidad del plato: ' + (err.message || err));
    }
  };

  // URL link to the client menu (uses custom slug dynamically)
  const menuPublicLink = useMemo(() => {
    if (!restaurant) return '';
    const path = window.location.pathname;
    const hostname = window.location.hostname;
    let base = '';
    if (hostname.endsWith('.github.io')) {
      const repoName = path.split('/')[1];
      base = repoName ? `/${repoName}` : '';
    }
    return `${window.location.origin}${base}/?r=${restaurant.slug}`;
  }, [restaurant]);

  // QR Code generator URL
  const qrCodeUrl = useMemo(() => {
    if (!menuPublicLink) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(menuPublicLink)}`;
  }, [menuPublicLink]);

  const categoryTranslations: Record<string, string> = {
    starter: 'Entradas',
    main: 'Platos Fuertes',
    dessert: 'Postres',
    drink: 'Bebidas',
    other: 'Otros'
  };

  if (loadingSession) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary">Verificando sesión segura...</Typography>
      </Box>
    );
  }

  // 1. UN-AUTHENTICATED: Auth Form (Login / Register)
  if (!user) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: '#f4f6f8'
        }}
      >
        {/* Main Centered Auth Form */}
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
          <Container maxWidth="xs">
            <Paper elevation={4} sx={{ p: 4, borderRadius: 5, textAlign: 'center', bgcolor: 'white' }}>
              <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                <Lock />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
                SmartMenu Admin
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {isRegister 
                  ? 'Registra tu restaurante y genera tu menú digital' 
                  : 'Inicia sesión para gestionar tus platos en tiempo real'}
              </Typography>

              {error && <Alert severity="error" onClose={clearError} sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

              <Box component="form" onSubmit={handleAuthSubmit}>
                <Stack spacing={2}>
                  {isRegister && (
                    <>
                      <TextField
                        label="Nombre del Restaurante"
                        fullWidth
                        required
                        value={authRestName}
                        onChange={(e) => setAuthRestName(e.target.value)}
                      />
                      <TextField
                        label="Código de Invitación B2B"
                        fullWidth
                        required
                        value={authRegCode}
                        onChange={(e) => setAuthRegCode(e.target.value)}
                        placeholder="SMART2026 o el código de tu administrador"
                      />
                    </>
                  )}
                  <TextField
                    label="Correo Electrónico"
                    type="email"
                    fullWidth
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                  <TextField
                    label="Contraseña"
                    type="password"
                    fullWidth
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                  />

                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large" 
                    disabled={loadingAction}
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 'bold' }}
                  >
                    {loadingAction ? <CircularProgress size={24} /> : (isRegister ? 'Registrar Restaurante' : 'Iniciar Sesión')}
                  </Button>
                </Stack>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button 
                  variant="text" 
                  onClick={() => { setIsRegister(!isRegister); clearError(); }} 
                  sx={{ textTransform: 'none' }}
                >
                  {isRegister ? '¿Ya tienes una cuenta? Inicia Sesión' : '¿No tienes cuenta? Registra tu restaurante'}
                </Button>
                
                <Divider sx={{ my: 1 }}>o usa el demo</Divider>
                
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleFillDemo}
                  sx={{ textTransform: 'none', borderRadius: 3 }}
                >
                  Probar Demo (Autocompletar)
                </Button>
              </Box>
            </Paper>
          </Container>
        </Box>

        {/* Modular corporate footer for registration help */}
        <Footer restaurantName="SmartMenu Pro" />
      </Box>
    );
  }

  // 2. AUTHENTICATED: Main Admin Dashboard
  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 10 }}>
      {/* Top Profile Banner */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          bgcolor: 'white', 
          borderBottom: '1px solid #e0e0e0', 
          borderRadius: 0,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {restaurant?.name || 'Cargando marca...'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Rol: {user.role === 'admin' ? 'Administrador' : 'Colaborador'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button 
            variant="outlined" 
            href={menuPublicLink} 
            target="_blank" 
            startIcon={<OpenInNew />}
            sx={{ borderRadius: 3, textTransform: 'none' }}
          >
            Ver Menú Público
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={logout} 
            startIcon={<ExitToApp />}
            sx={{ borderRadius: 3, textTransform: 'none' }}
          >
            Salir
          </Button>
        </Stack>
      </Paper>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
          <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} variant="scrollable" scrollButtons="auto">
            <Tab 
              label={
                <Box sx={{ display: { xs: tabValue === 0 ? 'inline' : 'none', sm: 'inline' } }}>
                  Menú
                </Box>
              } 
              icon={<RestaurantMenu />} 
              iconPosition="start" 
              sx={{ fontWeight: 'bold' }} 
            />
            <Tab 
              label={
                <Box sx={{ display: { xs: tabValue === 1 ? 'inline' : 'none', sm: 'inline' } }}>
                  Personalización
                </Box>
              } 
              icon={<Palette />} 
              iconPosition="start" 
              sx={{ fontWeight: 'bold' }} 
            />
            <Tab 
              label={
                <Box sx={{ display: { xs: tabValue === 2 ? 'inline' : 'none', sm: 'inline' } }}>
                  Código QR
                </Box>
              } 
              icon={<QrCode />} 
              iconPosition="start" 
              sx={{ fontWeight: 'bold' }} 
            />
          </Tabs>
        </Box>

        {/* --------------------------------------------------------- */}
        {/* TAB 1: MENU CRUD GESTION */}
        {/* --------------------------------------------------------- */}
        <CustomTabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            {/* Left sidebar: Day of week selector */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 4, bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarToday color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Día de la Semana</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  El menú se organiza por el ciclo de días de la semana (Lunes a Domingo). Selecciona el día para programar los platos que ofrecerás de forma fija.
                </Typography>
                
                <FormControl fullWidth>
                  <InputLabel>Día a Editar</InputLabel>
                  <Select
                    value={selectedDay}
                    label="Día a Editar"
                    onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                  >
                    {DAYS_ORDER.map((d) => (
                      <SelectMenuItem key={d} value={d}>
                        {dayTranslations[d]}
                      </SelectMenuItem>
                    ))}
                  </Select>
                </FormControl>

                {hasMenuChanges && (
                  <Alert severity="warning" sx={{ mt: 3, borderRadius: 3 }}>
                    Tienes cambios locales sin guardar para el {dayTranslations[selectedDay]}.
                  </Alert>
                )}
              </Paper>
            </Grid>

            {/* Right side: Menu item list */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper elevation={2} sx={{ p: 4, borderRadius: 4, bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Platos del {dayTranslations[selectedDay]}</Typography>
                    <Typography variant="caption" color="text.secondary">Total: {localItems.length} platos</Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={openAddDish}
                    sx={{ borderRadius: 3 }}
                  >
                    Agregar Plato
                  </Button>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {loadingMenu ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress size={40} />
                  </Box>
                ) : (
                  <>
                    {localItems.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6, border: '1px dashed #ccc', borderRadius: 3 }}>
                        <RestaurantMenu sx={{ fontSize: 40, color: '#bdbdbd', mb: 1 }} />
                        <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 'bold' }}>No hay platos para este día</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Agrega tu primer plato para el {dayTranslations[selectedDay]}.</Typography>
                        <Button variant="outlined" size="small" onClick={openAddDish}>Agregar Plato</Button>
                      </Box>
                    ) : (
                      <Stack spacing={2}>
                        {localItems.map((item) => (
                          <Paper 
                            key={item.id} 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              borderRadius: 4, 
                              display: 'flex', 
                              flexDirection: { xs: 'column', sm: 'row' },
                              justifyContent: 'space-between', 
                              alignItems: { xs: 'stretch', sm: 'center' },
                              gap: 2,
                              bgcolor: item.disabled ? '#f5f5f5' : (item.available ? 'transparent' : '#fafafa'),
                              borderColor: item.disabled ? '#e0e0e0' : (item.available ? '#e0e0e0' : '#ffebee'),
                              opacity: item.disabled ? 0.65 : 1,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                              transition: 'all 0.25s ease',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                borderColor: item.disabled ? '#ccc' : (item.available ? '#ccc' : '#ffebee')
                              }
                            }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: { xs: 'column', sm: 'row' }, 
                              gap: 2, 
                              alignItems: { xs: 'flex-start', sm: 'center' }, 
                              width: '100%' 
                            }}>
                              {item.imageUrl && (
                                <Box sx={{ 
                                  position: 'relative', 
                                  width: { xs: '100%', sm: 60 }, 
                                  height: { xs: 150, sm: 60 }, 
                                  flexShrink: 0,
                                  borderRadius: 2,
                                  overflow: 'hidden'
                                }}>
                                  <Box 
                                    component="img" 
                                    src={item.imageUrl} 
                                    sx={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover',
                                      filter: item.available ? 'none' : 'grayscale(40%) brightness(0.7)'
                                    }} 
                                  />
                                  {!item.available && (
                                    <Box 
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'rgba(0, 0, 0, 0.4)',
                                      }}
                                    >
                                      <Typography 
                                        sx={{ 
                                          fontSize: { xs: '0.9rem', sm: '0.65rem' }, 
                                          fontWeight: 'bold', 
                                          color: '#ffc107', 
                                          border: { xs: '2px solid #ffc107', sm: '1.5px solid #ffc107' }, 
                                          borderRadius: '4px',
                                          px: 1,
                                          py: 0.3,
                                          textTransform: 'uppercase',
                                          transform: 'rotate(-8deg)',
                                        }}
                                      >
                                        Agotado
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              )}
                              <Box sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineBreak: 'anywhere' }}>{item.name}</Typography>
                                  <Chip label={categoryTranslations[item.category]} size="small" variant="outlined" />
                                  {item.disabled && <Chip label="Inactivo" size="small" color="default" />}
                                  {!item.disabled && !item.available && <Chip label="Agotado" size="small" color="error" />}
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '100%', lineBreak: 'anywhere', mb: 1 }}>
                                  {item.description}
                                </Typography>
                                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
                                  ${item.price.toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>

                            <Divider sx={{ display: { xs: 'block', sm: 'none' }, my: 0.5 }} />

                            <Stack 
                              direction="row" 
                              spacing={1.5} 
                              sx={{ 
                                justifyContent: { xs: 'flex-end', sm: 'flex-start' }, 
                                alignSelf: { xs: 'stretch', sm: 'center' } 
                              }}
                            >
                              <IconButton 
                                color={item.disabled ? "default" : "info"} 
                                onClick={() => handleToggleDisabled(item)} 
                                size="small" 
                                title={item.disabled ? "Habilitar en el menú público" : "Inhabilitar (Ocultar del menú público)"}
                                sx={{ 
                                  border: '1px solid #e0e0e0', 
                                  flexGrow: { xs: 1, sm: 0 }, 
                                  borderRadius: { xs: 2, sm: '50%' }, 
                                  py: { xs: 1, sm: 0.5 },
                                  px: { xs: 2, sm: 0.5 }
                                }}
                              >
                                {item.disabled ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' }, ml: 1, fontSize: '0.85rem', fontWeight: 'bold' }}>
                                  {item.disabled ? 'Mostrar' : 'Ocultar'}
                                </Box>
                              </IconButton>
                              <IconButton 
                                color={item.available ? "warning" : "success"} 
                                onClick={() => handleToggleAvailable(item)} 
                                size="small" 
                                title={item.available ? "Marcar como agotado" : "Marcar como disponible"}
                                sx={{ 
                                  border: '1px solid #e0e0e0', 
                                  flexGrow: { xs: 1, sm: 0 }, 
                                  borderRadius: { xs: 2, sm: '50%' }, 
                                  py: { xs: 1, sm: 0.5 },
                                  px: { xs: 2, sm: 0.5 }
                                }}
                              >
                                {item.available ? <NoFood fontSize="small" /> : <Restaurant fontSize="small" />}
                                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' }, ml: 1, fontSize: '0.85rem', fontWeight: 'bold' }}/>
                              </IconButton>
                              <IconButton 
                                color="primary" 
                                onClick={() => openEditDish(item)} 
                                size="small" 
                                title="Editar Plato"
                                sx={{ 
                                  border: '1px solid #e0e0e0', 
                                  flexGrow: { xs: 1, sm: 0 }, 
                                  borderRadius: { xs: 2, sm: '50%' }, 
                                  py: { xs: 1, sm: 0.5 },
                                  px: { xs: 2, sm: 0.5 }
                                }}
                              >
                                <Edit fontSize="small" />
                                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' }, ml: 1, fontSize: '0.85rem', fontWeight: 'bold' }}/>
                              </IconButton>
                              <IconButton 
                                color="error" 
                                onClick={() => handleDishDelete(item.id)} 
                                size="small" 
                                title="Eliminar"
                                sx={{ 
                                  border: '1px solid #e0e0e0', 
                                  flexGrow: { xs: 1, sm: 0 }, 
                                  borderRadius: { xs: 2, sm: '50%' }, 
                                  py: { xs: 1, sm: 0.5 },
                                  px: { xs: 2, sm: 0.5 }
                                }}
                              >
                                <Delete fontSize="small" />
                                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' }, ml: 1, fontSize: '0.85rem', fontWeight: 'bold' }}/>
                              </IconButton>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CustomTabPanel>

        {/* --------------------------------------------------------- */}
        {/* TAB 2: PERSONALIZACION DE MARCA (WHITE-LABEL) */}
        {/* --------------------------------------------------------- */}
        <CustomTabPanel value={tabValue} index={1}>
          <BrandManager 
            restaurant={restaurant} 
            saveRestaurantSettings={saveRestaurantSettings} 
          />
        </CustomTabPanel>

        {/* --------------------------------------------------------- */}
        {/* TAB 3: QR CODE Y ASISTENTE DE VOZ */}
        {/* --------------------------------------------------------- */}
        <CustomTabPanel value={tabValue} index={2}>
          <Grid container spacing={4}>
            {/* QR Card */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper elevation={2} sx={{ p: 4, borderRadius: 4, textAlign: 'center', bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <QrCode color="primary" sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Generador de Código QR</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Tus clientes pueden escanear este código QR en las mesas para visualizar de manera instantánea el menú de hoy.
                </Typography>

                {qrCodeUrl ? (
                  <Box sx={{ p: 2, bgcolor: '#f9f9f9', display: 'inline-block', borderRadius: 4, mb: 3 }}>
                    <Box component="img" src={qrCodeUrl} alt="Restaurant QR" sx={{ width: 250, height: 250, display: 'block' }} />
                  </Box>
                ) : (
                  <CircularProgress />
                )}

                <Typography variant="subtitle2" sx={{ mb: 2 }}>Enlace de tu menú:</Typography>
                <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, bgcolor: '#fafafa' }}>
                  <Typography variant="body2" noWrap sx={{ maxWidth: '80%', fontSize: '0.8rem' }}>{menuPublicLink}</Typography>
                  <Button variant="text" size="small" href={menuPublicLink} target="_blank">Abrir</Button>
                </Paper>

                <Button variant="contained" href={qrCodeUrl} target="_blank" download="menu-qr.png" fullWidth sx={{ borderRadius: 3 }}>
                  Ver QR en Pantalla Completa
                </Button>
              </Paper>
            </Grid>

            {/* Voice assistant instructions */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper elevation={2} sx={{ p: 4, borderRadius: 4, bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Mic color="secondary" sx={{ fontSize: 30 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Integración con Asistente de Voz (Skill)</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                  Tu Menú Digital SmartMenu Pro está diseñado para ser omnicanal. Para configurar la integración oficial con Alexa o Google Assistant, sigue estas indicaciones técnicas:
                </Typography>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>1. Punto de Enlace (API Backend)</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Los asistentes de voz se conectan mediante HTTPS. Tu base de datos Firebase expone una Cloud Function con el siguiente JSON formateado para Skills:
                    </Typography>
                    <Paper component="pre" variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#f4f6f8', overflowX: 'auto', fontSize: '0.8rem' }}>
{`GET /api/voice-menu?r=${restaurant?.slug}&day=lunes
Response JSON:
{
  "speech": "El lunes en ${restaurant?.name || 'el restaurante'} ofrecemos: ${localItems.length > 0 ? localItems.slice(0, 3).map(i => i.name).join(', ') : 'nuestros platos tradicionales'}. ¡Que disfrutes!"
}`}
                    </Paper>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>2. Activación en el Asistente</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cuando el cliente active el Skill pronunciando <em>"Alexa, pregunta a SmartMenu qué hay el {dayTranslations[selectedDay]} en {restaurant?.name || 'el restaurante'}"</em>, nuestro servidor leerá el menú Firestore configurado por ti para ese día específico en tiempo real.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </CustomTabPanel>
      </Container>

      {/* --------------------------------------------------------- */}
      {/* DIALOG: CRUD FORM (Add / Edit Dish) */}
      {/* --------------------------------------------------------- */}
      <Dialog open={isDishOpen} onClose={() => setIsDishOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{editingDish ? 'Modificar Plato' : 'Nuevo Plato para el Menú'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1.5 }}>
            <TextField
              label="Nombre del Plato"
              fullWidth
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              placeholder="Ej: Lomo Saltado"
            />
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={3}
              value={dishDescription}
              onChange={(e) => setDishDescription(e.target.value)}
              placeholder="Descripción de ingredientes y preparación"
            />
            <TextField
              label="Precio ($)"
              fullWidth
              type="number"
              value={dishPrice}
              onChange={(e) => setDishPrice(e.target.value)}
              placeholder="Ej: 15.50"
            />
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={dishCategory}
                label="Categoría"
                onChange={(e) => setDishCategory(e.target.value as MenuItem['category'])}
              >
                <SelectMenuItem value="starter">Entradas</SelectMenuItem>
                <SelectMenuItem value="main">Platos Fuertes</SelectMenuItem>
                <SelectMenuItem value="dessert">Postres</SelectMenuItem>
                <SelectMenuItem value="drink">Bebidas</SelectMenuItem>
                <SelectMenuItem value="other">Otros</SelectMenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Imagen del Plato</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ borderRadius: 2 }}
                >
                  Cargar Imagen (Local)
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageFileChange}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">O pega un enlace de internet abajo</Typography>
                {dishImageUrl && (
                  <Box 
                    component="img" 
                    src={dishImageUrl} 
                    sx={{ width: 60, height: 60, borderRadius: 2, objectFit: 'cover', border: '1px solid #ddd' }} 
                  />
                )}
              </Box>
              <TextField
                label="Enlace de la Foto del Plato"
                fullWidth
                value={dishImageUrl}
                onChange={(e) => setDishImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... o Base64"
              />
            </Box>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={dishAvailable} 
                  onChange={(e) => setDishAvailable(e.target.checked)} 
                  color="success"
                />
              }
              label="Plato disponible hoy (en stock)"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setIsDishOpen(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleDishSaveSubmit} variant="contained" startIcon={<Save />}>
            Aplicar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
