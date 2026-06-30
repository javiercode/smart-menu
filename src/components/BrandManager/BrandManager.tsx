import React from 'react';
import { 
  Paper, 
  Typography, 
  Grid, 
  Stack, 
  TextField, 
  Box, 
  FormControlLabel, 
  Checkbox, 
  Chip, 
  Button, 
  CircularProgress,
  Avatar,
  Tooltip
} from '@mui/material';
import { Palette, Save, CloudUpload, RestaurantMenu } from '@mui/icons-material';
import { useBrandManager } from './useBrandManager';
import type { UseBrandManagerProps } from './useBrandManager';
import './BrandManager.css';

export interface BrandManagerProps extends UseBrandManagerProps {}

export interface ColorPalettePreset {
  name: string;
  primary: string;
  secondary: string;
}

// 6 Gorgeous pre-defined professional restaurant color palettes
export const PALETTE_PRESETS: ColorPalettePreset[] = [
  { name: 'Elegante Verde (Orgánico / Café)', primary: '#2e7d32', secondary: '#ed6c02' },
  { name: 'Gourmet Rojo (Bistró / Carnes)', primary: '#9e0a0a', secondary: '#b8860b' },
  { name: 'Moderno Azul (Elegante / Familiar)', primary: '#1976d2', secondary: '#dc004e' },
  { name: 'Cálido Naranja (Pizzería / Fast-Food)', primary: '#e65100', secondary: '#212121' },
  { name: 'Prestigioso Café (Pastelería / Café)', primary: '#4e342e', secondary: '#d7ccc8' },
  { name: 'Fresco Turquesa (Marisquería / Sushi)', primary: '#00695c', secondary: '#827717' }
];

export const BrandManager: React.FC<BrandManagerProps> = (props) => {
  const {
    brandName,
    brandSlug,
    brandPrimary,
    brandSecondary,
    brandLogo,
    showVoice,
    loading,
    setBrandName,
    setBrandPrimary,
    setBrandSecondary,
    setBrandLogo,
    setShowVoice,
    handleSlugChange,
    handleLogoFileChange,
    handleSave,
  } = useBrandManager(props);

  const handleSelectPreset = (preset: ColorPalettePreset) => {
    setBrandPrimary(preset.primary);
    setBrandSecondary(preset.secondary);
  };

  return (
    <Paper elevation={2} className="brand-manager-card">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Palette color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Configuración de Marca Blanca
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Configura cómo se verá tu menú digital para tus clientes. Modifica el nombre, el logotipo, el enlace de acceso, y los colores principales del sistema. El panel del cliente se adaptará inmediatamente.
      </Typography>

      <Grid container spacing={4}>
        {/* Left side: Inputs */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            <TextField
              label="Nombre Comercial del Restaurante"
              fullWidth
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />

            <TextField
              label="Enlace Personalizado (URL Slug)"
              fullWidth
              value={brandSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              helperText={`Tus clientes entrarán mediante: ${window.location.origin}/?r=${brandSlug}`}
            />

            {/* B2B Logo Upload Section */}
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 3, bgcolor: '#fafafa' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                Logotipo del Restaurante
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                {brandLogo ? (
                  <Avatar src={brandLogo} sx={{ width: 64, height: 64, border: '2px solid #ddd', boxShadow: '0 3px 6px rgba(0,0,0,0.1)' }} />
                ) : (
                  <Avatar sx={{ width: 64, height: 64, bgcolor: brandPrimary || '#1976d2', color: 'white' }}>
                    <RestaurantMenu />
                  </Avatar>
                )}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Subir Logotipo (Local)
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleLogoFileChange}
                  />
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>O pega un enlace de internet abajo</Typography>
              <TextField
                label="Enlace alternativo del Logo"
                fullWidth
                size="small"
                value={brandLogo}
                onChange={(e) => setBrandLogo(e.target.value)}
                placeholder="https://... o Base64"
              />
            </Box>
            
            {/* User Friendly Pre-defined Color Palettes */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                Paleta de Colores de Marca
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Selecciona una de nuestras combinaciones profesionales diseñadas por diseñadores. El sistema se adaptará automáticamente.
              </Typography>
              
              {/* Presets Grid */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                {PALETTE_PRESETS.map((p) => {
                  const isSelected = brandPrimary === p.primary && brandSecondary === p.secondary;
                  return (
                    <Tooltip title={p.name} key={p.name} arrow>
                      <Box 
                        onClick={() => handleSelectPreset(p)}
                        className={`preset-circle-container ${isSelected ? 'active-preset' : ''}`}
                        sx={{
                          borderColor: isSelected ? 'primary.main' : 'divider'
                        }}
                      >
                        {/* Left half primary color, right half secondary */}
                        <Box sx={{ display: 'flex', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                          <Box sx={{ width: '50%', height: '100%', bgcolor: p.primary }} />
                          <Box sx={{ width: '50%', height: '100%', bgcolor: p.secondary }} />
                        </Box>
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>

              {/* Custom Color Pickers row */}
              <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 3, bgcolor: '#fbfbfb' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                  ¿Prefieres colores personalizados?
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Color Principal</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        component="input" 
                        type="color" 
                        value={brandPrimary} 
                        onChange={(e) => setBrandPrimary(e.target.value)} 
                        className="color-input-picker" 
                      />
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{brandPrimary}</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Color Secundario</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        component="input" 
                        type="color" 
                        value={brandSecondary} 
                        onChange={(e) => setBrandSecondary(e.target.value)} 
                        className="color-input-picker" 
                      />
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{brandSecondary}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={showVoice} 
                    onChange={(e) => setShowVoice(e.target.checked)} 
                    color="primary"
                  />
                }
                label="Activar sección 'SmartMenu Voice Assistant' en menú público"
              />
            </Box>
          </Stack>
        </Grid>

        {/* Right side: Visual Live Preview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" className="brand-preview-card">
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 2 }}>
              Vista previa de tu Menú Digital
            </Typography>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                color: 'white', 
                bgcolor: brandPrimary || '#1976d2', 
                borderRadius: 4,
                mb: 3,
                textAlign: 'center',
                transition: 'background-color 0.3s ease',
                position: 'relative'
              }}
            >
              {brandLogo ? (
                <Avatar src={brandLogo} sx={{ width: 64, height: 64, mx: 'auto', mb: 1.5, border: '3px solid white', boxShadow: '0 3px 6px rgba(0,0,0,0.15)' }} />
              ) : (
                <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 1.5, bgcolor: 'white', color: brandPrimary || '#1976d2', border: '3px solid white' }}>
                  <RestaurantMenu sx={{ fontSize: 32 }} />
                </Avatar>
              )}
              <Typography variant="h5" sx={{ fontWeight: '800' }}>
                {brandName || 'Tu Restaurante'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 300 }}>
                Menú Digital en Tiempo Real
              </Typography>
            </Paper>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Chip label="Platos Fuertes" size="small" sx={{ bgcolor: brandPrimary || '#1976d2', color: 'white', fontWeight: 'bold', transition: 'background-color 0.3s ease' }} />
              <Chip label="Entradas" size="small" variant="outlined" sx={{ color: brandSecondary || '#dc004e', borderColor: brandSecondary || '#dc004e', transition: 'color 0.3s ease, border-color 0.3s ease' }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={loading}
          sx={{ borderRadius: 3, px: 5, py: 1.2, fontWeight: 'bold' }}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios de Marca'}
        </Button>
      </Box>
    </Paper>
  );
};
export default BrandManager;
