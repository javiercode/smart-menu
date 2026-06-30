import { useState, useEffect } from 'react';
import { generateSlug } from '../../services/AuthService';
import { MenuService } from '../../services/MenuService';
import type { Restaurant } from '../../core/types';

export interface UseBrandManagerProps {
  restaurant: Restaurant | null;
  saveRestaurantSettings: (
    name: string,
    primaryColor: string,
    secondaryColor: string,
    showVoiceAssistant: boolean,
    slug: string,
    logoUrl: string
  ) => Promise<void>;
}

export const useBrandManager = ({ restaurant, saveRestaurantSettings }: UseBrandManagerProps) => {
  const [brandName, setBrandName] = useState<string>('');
  const [brandSlug, setBrandSlug] = useState<string>('');
  const [brandPrimary, setBrandPrimary] = useState<string>('');
  const [brandSecondary, setBrandSecondary] = useState<string>('');
  const [brandLogo, setBrandLogo] = useState<string>('');
  const [showVoice, setShowVoice] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Synchronize on load / parent change
  useEffect(() => {
    if (restaurant) {
      setBrandName(restaurant.name || '');
      setBrandSlug(restaurant.slug || '');
      setBrandPrimary(restaurant.primaryColor || '#1976d2');
      setBrandSecondary(restaurant.secondaryColor || '#dc004e');
      setBrandLogo(restaurant.logoUrl || '');
      setShowVoice(restaurant.showVoiceAssistant !== false);
    }
  }, [restaurant]);

  const handleSlugChange = (value: string) => {
    setBrandSlug(generateSlug(value));
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        alert('El logo es demasiado grande. Por favor elija un archivo de menos de 800KB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!restaurant) return;
    const cleanSlug = generateSlug(brandSlug);
    if (!cleanSlug) {
      alert('Por favor ingrese un enlace personalizado (slug) válido.');
      return;
    }

    setLoading(true);
    try {
      // Verify custom slug uniqueness if modified
      if (cleanSlug !== restaurant.slug) {
        const existing = await MenuService.getRestaurantBySlug(cleanSlug);
        if (existing) {
          alert(`El enlace personalizado "${cleanSlug}" ya está en uso por otro restaurante. Elija un nombre diferente.`);
          setLoading(false);
          return;
        }
      }

      await saveRestaurantSettings(brandName, brandPrimary, brandSecondary, showVoice, cleanSlug, brandLogo);
      alert('¡Configuración de marca guardada con éxito!');
    } catch (err) {
      alert('Error guardando la configuración de marca.');
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};
export type UseBrandManagerReturn = ReturnType<typeof useBrandManager>;
