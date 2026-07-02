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
  Divider
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
    isPrivacyOpen,
    isTermsOpen,
    leadName,
    leadMessage,
    setLeadName,
    setLeadMessage,
    setIsPrivacyOpen,
    setIsTermsOpen,
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
              <Button 
                size="small" 
                href="https://javiercode.github.io/portafolio/" 
                target="_blank"
                startIcon={<Info />} 
                className="footer-link-btn"
              >
                Quiénes Somos (Desarrollador)
              </Button>
              <Button 
                size="small" 
                onClick={() => setIsPrivacyOpen(true)}
                startIcon={<Security />} 
                className="footer-link-btn"
              >
                Políticas de Privacidad
              </Button>
              <Button 
                size="small" 
                onClick={() => setIsTermsOpen(true)}
                startIcon={<Gavel />} 
                className="footer-link-btn"
              >
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
            © {new Date().getFullYear()} SmartMenu Pro. Todos los derechos reservados. Desarrollado por javiercode.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>

            <Button 
              variant="contained" 
              color="primary" 
              component={Link}
              to="/admin"
              // variant="outlined"
              size="small"
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold', px: 3 }}
            >
              🔑 Panel de Control
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

      {/* MODAL 2: POLÍTICAS DE PRIVACIDAD (BOLIVIA) */}
      <Dialog open={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="primary" /> Políticas de Privacidad
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.primary" component="p" sx={{ lineHeight: 1.7, mb: 2 }}>
            La presente Política de Privacidad describe el tratamiento de datos personales por parte de **SmartMenu Pro**, una plataforma SaaS independiente creada, administrada y operada por el desarrollador de software senior **Javier (javiercode)**, con operaciones y sede en la **República de Bolivia**.
          </Typography>
          
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2, mb: 0.5 }}>
            1. Responsable del Tratamiento de Datos
          </Typography>
          <Typography variant="body2" color="text.secondary" component="p" sx={{ mb: 2 }}>
            El único responsable del tratamiento de las bases de datos de este servicio es el desarrollador independiente **Javier (javiercode)**, localizable mediante los portales de contacto oficiales y WhatsApp provistos en esta aplicación.
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2, mb: 0.5 }}>
            2. Información Recopilada
          </Typography>
          <Typography variant="body2" color="text.secondary" component="p" sx={{ mb: 2 }}>
            **Para Administradores y Restaurantes (B2B):** Recopilamos el correo electrónico, contraseña cifrada, nombre comercial del restaurante, logotipo (como Base64) y enlaces personalizados de acceso (slug) de forma estrictamente consentida durante el registro.
            <br /><br />
            **Para Clientes y Comensales (B2C):** **SmartMenu Pro no recopila, no registra, ni guarda ningún dato de carácter personal de tus clientes**. La navegación en el menú digital es completamente anónima y no utiliza cookies de rastreo de consumidores, protegiendo al 100% la privacidad e intimidad de los comensales bolivianos de conformidad con la Constitución Política del Estado Plurinacional de Bolivia.
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2, mb: 0.5 }}>
            3. Almacenamiento y Seguridad de Datos
          </Typography>
          <Typography variant="body2" color="text.secondary" component="p" sx={{ mb: 2 }}>
            Los datos son almacenados de forma segura en la infraestructura cloud de **Google Firebase (Cloud Firestore y Authentication)**. Implementamos reglas de seguridad estrictas en Firestore que restringen la lectura y escritura de tus menús exclusivamente a tu cuenta autenticada.
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2, mb: 0.5 }}>
            4. Derechos de Acceso y Eliminación
          </Typography>
          <Typography variant="body2" color="text.secondary" component="p" sx={{ mb: 2 }}>
            En cualquier momento, los dueños de restaurantes en Bolivia pueden solicitar la baja de su cuenta, eliminación definitiva de sus credenciales y de todos sus menús e imágenes guardados de forma gratuita, contactando al desarrollador por nuestro canal de soporte directo por WhatsApp.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setIsPrivacyOpen(false)} variant="contained">Entendido</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL 3: TÉRMINOS DEL SERVICIO (BOLIVIA) */}
      <Dialog open={isTermsOpen} onClose={() => setIsTermsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Gavel color="primary" /> Términos del Servicio
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.primary" component="p" sx={{ lineHeight: 1.7, mb: 2 }}>
            Bienvenido a **SmartMenu Pro**. Los siguientes Términos del Servicio regulan el acceso y uso de la plataforma SaaS independiente de menú digital inteligente para restaurantes en el territorio del **Estado Plurinacional de Bolivia**.
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2, mb: 0.5 }}>
            1. Propiedad y Licencia
          </Typography>
          <Typography variant="body2" color="text.secondary" component="p" sx={{ mb: 2 }}>
            La plataforma, su código fuente, arquitectura, diseño y marcas asociadas son propiedad intelectual exclusiva del desarrollador de software senior **Javier (javiercode)**, Bolivia. Se concede a los restaurantes registrados una licencia de uso limitada, no exclusiva, revocable e intransferible para gestionar y mostrar sus menús comerciales.
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2, mb: 0.5 }}>
            2. Uso Aceptable y Responsabilidad de Contenido
          </Typography>
          <Typography variant="body2" color="text.secondary" component="p" sx={{ mb: 2 }}>
            Cada restaurante registrado es el único responsable legal y comercial ante la ley boliviana del contenido de sus menús (precios, descripciones de ingredientes, alérgenos, fotos y disponibilidad de stock en mesa). Queda prohibido subir contenido pornográfico, ofensivo, difamatorio o ilegal bajo las leyes bolivianas vigentes.
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2, mb: 0.5 }}>
            3. Limitación de Responsabilidad (Exclusión de Garantías)
          </Typography>
          <Typography variant="body2" color="text.secondary" component="p" sx={{ mb: 2 }}>
            El sistema se provee **"tal cual está" (As-Is)** y **"según disponibilidad"**. Al ser un desarrollo independiente provisto por un único desarrollador senior (Javier), no se asumen garantías implícitas de infalibilidad. El desarrollador no será responsable de pérdidas de ingresos del restaurante, caídas temporales del servidor de hosting (GitHub Pages) o de la base de datos (Cloud Firebase), ni de reclamos de clientes finales del restaurante.
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2, mb: 0.5 }}>
            4. Modificaciones y Ley Aplicable
          </Typography>
          <Typography variant="body2" color="text.secondary" component="p" sx={{ mb: 2 }}>
            Estos términos se rigen en su totalidad por la **legislación civil y comercial aplicable en la República de Bolivia**. Cualquier disputa será resuelta en primera instancia mediante conciliación amistosa vía WhatsApp y, en su defecto, ante las autoridades de la ciudad de residencia del desarrollador en Bolivia.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setIsTermsOpen(false)} variant="contained">Aceptar Términos</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default Footer;
