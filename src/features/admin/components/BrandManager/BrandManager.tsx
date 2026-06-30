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
  CircularProgress 
} from '@mui/material';
import { Palette, Save } from '@mui/icons-material';
import { useBrandManager } from './useBrandManager';
import type { UseBrandManagerProps } from './useBrandManager';
import './BrandManager.css';

export interface BrandManagerProps extends UseBrandManagerProps {}

export const BrandManager: React.FC<BrandManagerProps> = (props) => {
  const {
    brandName,
    brandSlug,
    brandPrimary,
    brandSecondary,
    showVoice,
    loading,
    setBrandName,
    setBrandPrimary,
    setBrandSecondary,
    setShowVoice,
    handleSlugChange,
    handleSave,
  } = useBrandManager(props);

  return (
    <Paper elevation={2} className="brand-manager-card">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Palette color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Configuración de Marca Blanca
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Configura cómo se verá tu menú digital para tus clientes. Modifica el nombre, el enlace personalizado y los colores principales del sistema. El panel del cliente se adaptará inmediatamente.
      </Typography>

      <Grid container spacing={4}>
        {/* Left side: Inputs */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            <TextField
              label="Nombre Comercial"
              fullWidth
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />

            <TextField
              label="Enlace Personalizado (URL Slug)"
              fullWidth
              value={brandSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              helperText={`Tu menú se publicará en: ${window.location.origin}/?r=${brandSlug}`}
            />
            
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Color Primario (Encabezado y botones)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box 
                  component="input" 
                  type="color" 
                  value={brandPrimary} 
                  onChange={(e) => setBrandPrimary(e.target.value)} 
                  className="color-input-box" 
                />
                <TextField size="small" value={brandPrimary} onChange={(e) => setBrandPrimary(e.target.value)} />
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Color Secundario (Chips y etiquetas)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box 
                  component="input" 
                  type="color" 
                  value={brandSecondary} 
                  onChange={(e) => setBrandSecondary(e.target.value)} 
                  className="color-input-box" 
                />
                <TextField size="small" value={brandSecondary} onChange={(e) => setBrandSecondary(e.target.value)} />
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
              Vista previa del Menú
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                color: 'white', 
                bgcolor: brandPrimary || '#1976d2', 
                borderRadius: 3,
                mb: 2,
                transition: 'background-color 0.3s ease'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {brandName || 'Tu Restaurante'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Menú de Hoy
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
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={loading}
          sx={{ borderRadius: 3, px: 4, fontWeight: 'bold' }}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios de Marca'}
        </Button>
      </Box>
    </Paper>
  );
};
export default BrandManager;
