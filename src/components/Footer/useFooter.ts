import { useState } from 'react';

export const useFooter = (restaurantName?: string) => {
  const [isLeadOpen, setIsLeadOpen] = useState<boolean>(false);
  const [leadName, setLeadName] = useState<string>('');
  const [leadMessage, setLeadMessage] = useState<string>('');

  const handleOpenLead = () => {
    setLeadName('');
    setLeadMessage(
      `¡Hola! Estuve revisando el menú digital de ${restaurantName || 'su restaurante'} y me encantó la plataforma. Me gustaría programar una demo y crear mi propio menú digital para mi negocio.`
    );
    setIsLeadOpen(true);
  };

  const handleCloseLead = () => {
    setIsLeadOpen(false);
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  return {
    isLeadOpen,
    leadName,
    leadMessage,
    setLeadName,
    setLeadMessage,
    handleOpenLead,
    handleCloseLead,
    handleLeadSubmit,
  };
};
export type UseFooterReturn = ReturnType<typeof useFooter>;
