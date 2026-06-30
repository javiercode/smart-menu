import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Avatar, 
  Container 
} from '@mui/material';
import { RestaurantMenu } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMenuViewModel } from '../features/menu/hooks/useMenuViewModel';
import { MenuContainer } from '../features/menu/components/MenuContainer';
import { Footer } from '../components/Footer';
import { isFirebaseConfigured } from '../core/firebase/config';

export const LandingPage: React.FC = () => {
  if (!isFirebaseConfigured) {
    return null;
  }

  const [searchParams] = useSearchParams();
  
  // Default to the live Firebase seeded 'restaurante-el-sabor-demo' if no tenant is provided in query params
  const restaurantId = searchParams.get('r') || 'restaurante-el-sabor-demo';
  
  const {
    restaurant,
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
    });
  }, [restaurant]);

  return (
    <ThemeProvider theme={dynamicTheme}>
      <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              mb: 6
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

          {/* Orchestrated Menu Container (Atomic subcomponents for dates, categories & cards) */}
          <MenuContainer restaurantSlug={restaurantId} />
        </Box>

        {/* Modular Corporate Footer */}
        <Footer restaurantName={restaurant?.name} />
      </Box>
    </ThemeProvider>
  );
};
export default LandingPage;
