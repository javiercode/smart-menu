import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Stack,
  Divider,
} from '@mui/material';
import { WhatsApp, Security, Info, Gavel } from '@mui/icons-material';
import { WhatsappButton } from '../WhatsappButton';
import { useFooter } from './useFooter';
import './Footer.css';

export interface FooterProps {
  restaurantName?: string;
}

export const Footer: React.FC<FooterProps> = ({ restaurantName }) => {
  const {
    isLeadOpen,
    leadName,
    leadMessage,
    setLeadName,
    setLeadMessage,
    handleOpenLead,
    handleCloseLead,
    handleLeadSubmit,
  } = useFooter(restaurantName);

  const adminWhatsAppNumber = import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER || '51999999999';

  return (
    <Box component="footer" className="footer-container">
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
          {/* Section 1: Brand & Logo */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" className="footer-title">
              SmartMenu Pro
            </Typography>
            <Typography variant="body2" className="footer-desc">
              La plataforma omnicanal líder para la digitalización inteligente de restaurantes. Lleva tu menú a la web, móviles y asistentes de voz en minutos.
            </Typography>
          </Grid>

          {/* Section 2: Institutional Links */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle1" className="footer-subtitle">
              Enlaces Institucionales
            </Typography>
            <Stack spacing={1} sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}>
              <Button size="small" component={Link} to="/" startIcon={<Info />} className="footer-link-btn">
                Quiénes Somos
              </Button>
              <Button size="small" component={Link} to="/" startIcon={<Security />} className="footer-link-btn">
                Políticas de Privacidad
              </Button>
              <Button size="small" component={Link} to="/" startIcon={<Gavel />} className="footer-link-btn">
                Términos del Servicio
              </Button>
            </Stack>
          </Grid>

          {/* Section 3: B2B Call To Action */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' }, gap: 2 }}>
            <Typography variant="subtitle1" className="footer-subtitle">
              ¿Quieres tu propio menú?
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleOpenLead}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold', px: 3 }}
            >
              🚀 Crear Mi Menú Gratis
            </Button>
            
            {/* Integrated WhatsappButton for direct customer support */}
            <WhatsappButton 
              phoneNumber={adminWhatsAppNumber} 
              message="¡Hola! Necesito soporte o información de SmartMenu Pro." 
              label="Soporte por WhatsApp"
            />
          </Grid>
        </Grid>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />

        {/* Section 4: Copyright & Bottom buttons */}
        <Box className="footer-bottom">
          <Typography variant="body2" className="footer-copy">
            © {new Date().getFullYear()} SmartMenu Pro. Todos los derechos reservados.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              component={Link}
              to="/admin"
              variant="outlined"
              size="small"
              sx={{ 
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.8)',
                borderRadius: 3, 
                textTransform: 'none', 
                fontWeight: 600, 
                fontSize: '0.75rem',
                px: 2,
                '&:hover': { borderColor: 'white', color: 'white', bgcolor: 'rgba(255, 255, 255, 0.05)' }
              }}
            >
              🔑 Acceso Administrador (Panel de Control)
            </Button>
          </Box>
        </Box>
      </Container>

      {/* B2B Lead Capture Dialog Form */}
      <Dialog open={isLeadOpen} onClose={handleCloseLead} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WhatsApp color="success" /> ¡Crea tu Menú Digital!
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Ingresa tu nombre y un mensaje. Generaremos un chat directo por WhatsApp con nuestro equipo de ventas para crear tu cuenta de inmediato.
          </Typography>
          <Box component="form" onSubmit={handleLeadSubmit}>
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
            <DialogActions sx={{ px: 0, pb: 0, mt: 3 }}>
              <Button onClick={handleCloseLead} color="inherit">Cancelar</Button>
              <Button 
                type="submit"
                variant="contained" 
                color="success" 
                startIcon={<WhatsApp />}
                sx={{ fontWeight: 'bold', borderRadius: 2, textTransform: 'none' }}
              >
                Enviar por WhatsApp
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default Footer;
