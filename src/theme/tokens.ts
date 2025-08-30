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
export type AccentTheme = 'olive' | 'purple' | 'neutral';

export const accentThemes: Record<AccentTheme, { light: ThemeTokens; dark: ThemeTokens }> = {
  olive: {
    light: {
      // Core colors - Olive/Zayna theme
      background: '0 0% 100%',
      foreground: '72 15% 15%',
      card: '0 0% 100%',
      cardForeground: '72 15% 15%',
      popover: '0 0% 100%',
      popoverForeground: '72 15% 15%',
      primary: '72 40% 25%', // #636b2f
      primaryForeground: '0 0% 98%',
      secondary: '72 10% 92%',
      secondaryForeground: '72 15% 15%',
      muted: '72 10% 92%',
      mutedForeground: '72 8% 45%',
      accent: '36 65% 45%', // #b38b37
      accentForeground: '0 0% 98%',
      destructive: '4 90% 41%', // #b3261e
      destructiveForeground: '0 0% 98%',
      border: '72 15% 85%',
      input: '72 15% 85%',
      ring: '72 40% 25%',
      
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
      sidebarForeground: '72 15% 26%',
      sidebarPrimary: '72 40% 25%',
      sidebarPrimaryForeground: '0 0% 98%',
      sidebarAccent: '72 10% 95%',
      sidebarAccentForeground: '72 40% 25%',
      sidebarBorder: '72 15% 91%',
      sidebarRing: '72 40% 25%',
      
      radius: '0.5rem'
    },
    dark: {
      // Core colors - Olive/Zayna theme dark
      background: '72 15% 8%',
      foreground: '0 0% 95%',
      card: '72 15% 8%',
      cardForeground: '0 0% 95%',
      popover: '72 15% 8%',
      popoverForeground: '0 0% 95%',
      primary: '72 25% 75%',
      primaryForeground: '72 15% 8%',
      secondary: '72 10% 15%',
      secondaryForeground: '0 0% 95%',
      muted: '72 10% 15%',
      mutedForeground: '72 8% 65%',
      accent: '36 65% 65%',
      accentForeground: '72 15% 8%',
      destructive: '4 90% 55%',
      destructiveForeground: '0 0% 98%',
      border: '72 10% 15%',
      input: '72 10% 15%',
      ring: '72 25% 75%',
      
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
      sidebarBackground: '72 15% 6%',
      sidebarForeground: '72 10% 95%',
      sidebarPrimary: '72 25% 75%',
      sidebarPrimaryForeground: '72 15% 8%',
      sidebarAccent: '72 10% 12%',
      sidebarAccentForeground: '72 10% 95%',
      sidebarBorder: '72 10% 12%',
      sidebarRing: '72 25% 75%',
      
      radius: '0.5rem'
    }
  },
  
  purple: {
    light: {
      // Core colors - Purple/BrandHUB theme
      background: '0 0% 100%',
      foreground: '252 25% 15%',
      card: '0 0% 100%',
      cardForeground: '252 25% 15%',
      popover: '0 0% 100%',
      popoverForeground: '252 25% 15%',
      primary: '252 62% 43%', // #582BAF
      primaryForeground: '0 0% 98%',
      secondary: '252 15% 92%',
      secondaryForeground: '252 25% 15%',
      muted: '252 15% 92%',
      mutedForeground: '252 10% 45%',
      accent: '45 94% 62%', // #F5C542
      accentForeground: '252 25% 15%',
      destructive: '4 90% 41%', // #b3261e
      destructiveForeground: '0 0% 98%',
      border: '252 15% 85%',
      input: '252 15% 85%',
      ring: '252 62% 43%',
      
      // Extended colors
      success: '151 55% 31%', // #1e7f4f
      successForeground: '0 0% 98%',
      warning: '36 100% 35%', // #b26a00
      warningForeground: '0 0% 98%',
      info: '217 91% 60%',
      infoForeground: '0 0% 98%',
      
      // Status colors
      statusNouvelle: '217 91% 94%',
      statusNouvelleForeground: '217 91% 25%',
      statusConfirmee: '252 62% 92%',
      statusConfirmeeForeground: '252 62% 25%',
      statusEnPreparation: '45 94% 92%',
      statusEnPreparationForeground: '45 94% 25%',
      statusExpediee: '217 91% 94%',
      statusExpedieeForeground: '217 91% 25%',
      statusLivree: '151 55% 92%',
      statusLivreeForeground: '151 55% 25%',
      statusAnnulee: '4 90% 94%',
      statusAnnuleeForeground: '4 90% 25%',
      statusRetournee: '36 100% 94%',
      statusRetourneeForeground: '36 100% 25%',
      
      // Sidebar colors
      sidebarBackground: '0 0% 98%',
      sidebarForeground: '252 25% 26%',
      sidebarPrimary: '252 62% 43%',
      sidebarPrimaryForeground: '0 0% 98%',
      sidebarAccent: '252 15% 95%',
      sidebarAccentForeground: '252 62% 43%',
      sidebarBorder: '252 15% 91%',
      sidebarRing: '252 62% 43%',
      
      radius: '0.5rem'
    },
    dark: {
      // Core colors - Purple/BrandHUB theme dark
      background: '252 25% 8%',
      foreground: '0 0% 95%',
      card: '252 25% 8%',
      cardForeground: '0 0% 95%',
      popover: '252 25% 8%',
      popoverForeground: '0 0% 95%',
      primary: '252 45% 75%',
      primaryForeground: '252 25% 8%',
      secondary: '252 15% 15%',
      secondaryForeground: '0 0% 95%',
      muted: '252 15% 15%',
      mutedForeground: '252 10% 65%',
      accent: '45 94% 72%',
      accentForeground: '252 25% 8%',
      destructive: '4 90% 55%',
      destructiveForeground: '0 0% 98%',
      border: '252 15% 15%',
      input: '252 15% 15%',
      ring: '252 45% 75%',
      
      // Extended colors
      success: '151 55% 55%',
      successForeground: '0 0% 98%',
      warning: '36 100% 55%',
      warningForeground: '0 0% 98%',
      info: '217 91% 70%',
      infoForeground: '0 0% 98%',
      
      // Status colors
      statusNouvelle: '217 91% 15%',
      statusNouvelleForeground: '217 91% 85%',
      statusConfirmee: '252 62% 15%',
      statusConfirmeeForeground: '252 62% 85%',
      statusEnPreparation: '45 94% 15%',
      statusEnPreparationForeground: '45 94% 85%',
      statusExpediee: '217 91% 15%',
      statusExpedieeForeground: '217 91% 85%',
      statusLivree: '151 55% 15%',
      statusLivreeForeground: '151 55% 85%',
      statusAnnulee: '4 90% 15%',
      statusAnnuleeForeground: '4 90% 85%',
      statusRetournee: '36 100% 15%',
      statusRetourneeForeground: '36 100% 85%',
      
      // Sidebar colors
      sidebarBackground: '252 25% 6%',
      sidebarForeground: '252 15% 95%',
      sidebarPrimary: '252 45% 75%',
      sidebarPrimaryForeground: '252 25% 8%',
      sidebarAccent: '252 15% 12%',
      sidebarAccentForeground: '252 15% 95%',
      sidebarBorder: '252 15% 12%',
      sidebarRing: '252 45% 75%',
      
      radius: '0.5rem'
    }
  },
  
  neutral: {
    light: {
      // Core colors - Neutral theme
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      popover: '0 0% 100%',
      popoverForeground: '222.2 84% 4.9%',
      primary: '221.2 83.2% 53.3%', // #2563eb
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96.1%',
      secondaryForeground: '222.2 47.4% 11.2%',
      muted: '210 40% 96.1%',
      mutedForeground: '215.4 16.3% 46.9%',
      accent: '151 55% 41.5%', // #10b981
      accentForeground: '210 40% 98%',
      destructive: '0 72.2% 50.6%', // #dc2626
      destructiveForeground: '210 40% 98%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '221.2 83.2% 53.3%',
      
      // Extended colors
      success: '142.1 76.2% 36.3%', // #16a34a
      successForeground: '210 40% 98%',
      warning: '24.6 95% 53.1%', // #d97706
      warningForeground: '210 40% 98%',
      info: '217 91% 60%',
      infoForeground: '210 40% 98%',
      
      // Status colors
      statusNouvelle: '217 91% 94%',
      statusNouvelleForeground: '217 91% 25%',
      statusConfirmee: '221.2 83.2% 94%',
      statusConfirmeeForeground: '221.2 83.2% 25%',
      statusEnPreparation: '151 55% 92%',
      statusEnPreparationForeground: '151 55% 25%',
      statusExpediee: '217 91% 94%',
      statusExpedieeForeground: '217 91% 25%',
      statusLivree: '142.1 76.2% 92%',
      statusLivreeForeground: '142.1 76.2% 25%',
      statusAnnulee: '0 72.2% 94%',
      statusAnnuleeForeground: '0 72.2% 25%',
      statusRetournee: '24.6 95% 94%',
      statusRetourneeForeground: '24.6 95% 25%',
      
      // Sidebar colors
      sidebarBackground: '0 0% 98%',
      sidebarForeground: '240 5.3% 26.1%',
      sidebarPrimary: '240 5.9% 10%',
      sidebarPrimaryForeground: '0 0% 98%',
      sidebarAccent: '240 4.8% 95.9%',
      sidebarAccentForeground: '240 5.9% 10%',
      sidebarBorder: '220 13% 91%',
      sidebarRing: '217.2 91.2% 59.8%',
      
      radius: '0.5rem'
    },
    dark: {
      // Core colors - Neutral theme dark
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      popover: '222.2 84% 4.9%',
      popoverForeground: '210 40% 98%',
      primary: '217.2 91.2% 59.8%',
      primaryForeground: '222.2 47.4% 11.2%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      accent: '151 55% 51.5%',
      accentForeground: '222.2 84% 4.9%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '212.7 26.8% 83.9%',
      
      // Extended colors
      success: '142.1 70.6% 45.3%',
      successForeground: '210 40% 98%',
      warning: '24.6 95% 63.1%',
      warningForeground: '222.2 84% 4.9%',
      info: '217 91% 70%',
      infoForeground: '210 40% 98%',
      
      // Status colors
      statusNouvelle: '217 91% 15%',
      statusNouvelleForeground: '217 91% 85%',
      statusConfirmee: '221.2 83.2% 15%',
      statusConfirmeeForeground: '221.2 83.2% 85%',
      statusEnPreparation: '151 55% 15%',
      statusEnPreparationForeground: '151 55% 85%',
      statusExpediee: '217 91% 15%',
      statusExpedieeForeground: '217 91% 85%',
      statusLivree: '142.1 76.2% 15%',
      statusLivreeForeground: '142.1 76.2% 85%',
      statusAnnulee: '0 72.2% 15%',
      statusAnnuleeForeground: '0 72.2% 85%',
      statusRetournee: '24.6 95% 15%',
      statusRetourneeForeground: '24.6 95% 85%',
      
      // Sidebar colors
      sidebarBackground: '240 5.9% 10%',
      sidebarForeground: '240 4.8% 95.9%',
      sidebarPrimary: '224.3 76.3% 48%',
      sidebarPrimaryForeground: '0 0% 100%',
      sidebarAccent: '240 3.7% 15.9%',
      sidebarAccentForeground: '240 4.8% 95.9%',
      sidebarBorder: '240 3.7% 15.9%',
      sidebarRing: '217.2 91.2% 59.8%',
      
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