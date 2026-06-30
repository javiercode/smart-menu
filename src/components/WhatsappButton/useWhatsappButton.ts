export const useWhatsappButton = (phoneNumber: string, defaultMessage: string) => {
  const handleOpenChat = () => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank');
  };

  return { handleOpenChat };
};
