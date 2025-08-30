export interface ThemeTokens {
  // Core colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  
  // Extended colors
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;
  
  // Status colors for COD pipeline
  statusNouvelle: string;
  statusNouvelleForeground: string;
  statusConfirmee: string;
  statusConfirmeeForeground: string;
  statusEnPreparation: string;
  statusEnPreparationForeground: string;
  statusExpediee: string;
  statusExpedieeForeground: string;
  statusLivree: string;
  statusLivreeForeground: string;
  statusAnnulee: string;
  statusAnnuleeForeground: string;
  statusRetournee: string;
  statusRetourneeForeground: string;
  
  // Sidebar colors
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  
  // Border radius
  radius: string;
}

export type ThemeMode = 'system' | 'light' | 'dark';
export type AccentTheme = 'brown';

export const accentThemes: Record<AccentTheme, { light: ThemeTokens; dark: ThemeTokens }> = {
  brown: {
    light: {
      // Core colors - Brown theme
      background: '0 0% 100%',
      foreground: '25 15% 15%',
      card: '0 0% 100%',
      cardForeground: '25 15% 15%',
      popover: '0 0% 100%',
      popoverForeground: '25 15% 15%',
      primary: '25 40% 35%', // Brown primary
      primaryForeground: '0 0% 98%',
      secondary: '25 10% 92%',
      secondaryForeground: '25 15% 15%',
      muted: '25 10% 92%',
      mutedForeground: '25 8% 45%',
      accent: '30 45% 45%',
      accentForeground: '0 0% 98%',
      destructive: '4 90% 41%',
      destructiveForeground: '0 0% 98%',
      border: '25 15% 85%',
      input: '25 15% 85%',
      ring: '25 40% 35%',
      
      // Extended colors
      success: '123 40% 34%', // #2e7d32
      successForeground: '0 0% 98%',
      warning: '36 100% 35%', // #b26a00
      warningForeground: '0 0% 98%',
      info: '217 91% 60%',
      infoForeground: '0 0% 98%',
      
      // Status colors
      statusNouvelle: '217 91% 94%',
      statusNouvelleForeground: '217 91% 25%',
      statusConfirmee: '72 40% 92%',
      statusConfirmeeForeground: '72 40% 25%',
      statusEnPreparation: '36 65% 92%',
      statusEnPreparationForeground: '36 65% 25%',
      statusExpediee: '217 91% 94%',
      statusExpedieeForeground: '217 91% 25%',
      statusLivree: '123 40% 92%',
      statusLivreeForeground: '123 40% 25%',
      statusAnnulee: '4 90% 94%',
      statusAnnuleeForeground: '4 90% 25%',
      statusRetournee: '36 100% 94%',
      statusRetourneeForeground: '36 100% 25%',
      
      // Sidebar colors
      sidebarBackground: '0 0% 98%',
      sidebarForeground: '25 15% 26%',
      sidebarPrimary: '25 40% 35%',
      sidebarPrimaryForeground: '0 0% 98%',
      sidebarAccent: '25 10% 95%',
      sidebarAccentForeground: '25 40% 35%',
      sidebarBorder: '25 15% 91%',
      sidebarRing: '25 40% 35%',
      
      radius: '0.5rem'
    },
    dark: {
      // Core colors - Brown theme dark
      background: '25 15% 8%',
      foreground: '0 0% 95%',
      card: '25 15% 8%',
      cardForeground: '0 0% 95%',
      popover: '25 15% 8%',
      popoverForeground: '0 0% 95%',
      primary: '25 25% 75%',
      primaryForeground: '25 15% 8%',
      secondary: '25 10% 15%',
      secondaryForeground: '0 0% 95%',
      muted: '25 10% 15%',
      mutedForeground: '25 8% 65%',
      accent: '30 45% 65%',
      accentForeground: '25 15% 8%',
      destructive: '4 90% 55%',
      destructiveForeground: '0 0% 98%',
      border: '25 10% 15%',
      input: '25 10% 15%',
      ring: '25 25% 75%',
      
      // Extended colors
      success: '123 40% 55%',
      successForeground: '0 0% 98%',
      warning: '36 100% 55%',
      warningForeground: '0 0% 98%',
      info: '217 91% 70%',
      infoForeground: '0 0% 98%',
      
      // Status colors
      statusNouvelle: '217 91% 15%',
      statusNouvelleForeground: '217 91% 85%',
      statusConfirmee: '72 40% 15%',
      statusConfirmeeForeground: '72 40% 85%',
      statusEnPreparation: '36 65% 15%',
      statusEnPreparationForeground: '36 65% 85%',
      statusExpediee: '217 91% 15%',
      statusExpedieeForeground: '217 91% 85%',
      statusLivree: '123 40% 15%',
      statusLivreeForeground: '123 40% 85%',
      statusAnnulee: '4 90% 15%',
      statusAnnuleeForeground: '4 90% 85%',
      statusRetournee: '36 100% 15%',
      statusRetourneeForeground: '36 100% 85%',
      
      // Sidebar colors
      sidebarBackground: '25 15% 6%',
      sidebarForeground: '25 10% 95%',
      sidebarPrimary: '25 25% 75%',
      sidebarPrimaryForeground: '25 15% 8%',
      sidebarAccent: '25 10% 12%',
      sidebarAccentForeground: '25 10% 95%',
      sidebarBorder: '25 10% 12%',
      sidebarRing: '25 25% 75%',
      
      radius: '0.5rem'
    }
  }
};

export const statusLabels = {
  nouvelle: 'Nouvelle',
  confirmee: 'Confirmée',
  en_preparation: 'En préparation',
  expediee: 'Expédiée',
  livree: 'Livrée',
  annulee: 'Annulée',
  retournee: 'Retournée'
} as const;

export type OrderStatus = keyof typeof statusLabels;