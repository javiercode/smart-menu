import React from 'react';
import { Button } from '@mui/material';
import { WhatsApp } from '@mui/icons-material';
import { useWhatsappButton } from './useWhatsappButton';
import './WhatsappButton.css';

export interface WhatsappButtonProps {
  phoneNumber: string;
  message: string;
  label?: string;
}

export const WhatsappButton: React.FC<WhatsappButtonProps> = ({ 
  phoneNumber, 
  message, 
  label = 'Contactar por WhatsApp' 
}) => {
  const { handleOpenChat } = useWhatsappButton(phoneNumber, message);

  return (
    <Button
      variant="contained"
      color="success"
      startIcon={<WhatsApp />}
      onClick={handleOpenChat}
      className="whatsapp-btn"
      sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold', px: 3, py: 1 }}
    >
      {label}
    </Button>
  );
};
