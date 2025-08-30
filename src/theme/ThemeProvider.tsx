import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, AccentTheme, accentThemes } from './tokens';
import { useLocalStorage } from '@/lib/useLocalStorage';

interface ThemeContextType {
  mode: ThemeMode;
  accent: AccentTheme;
  highContrast: boolean;
  setMode: (mode: ThemeMode) => void;
  setHighContrast: (enabled: boolean) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  defaultHighContrast?: boolean;
}

export function ThemeProvider({
  children,
  defaultMode = 'system',
  defaultHighContrast = false,
}: ThemeProviderProps) {
  const [storedMode, setStoredMode] = useLocalStorage<ThemeMode>('admin.theme.mode', defaultMode);
  const [storedHighContrast, setStoredHighContrast] = useLocalStorage<boolean>('admin.theme.hc', defaultHighContrast);
  
  const [mode, setMode] = useState<ThemeMode>(storedMode);
  const accent: AccentTheme = 'brown';
  const [highContrast, setHighContrast] = useState<boolean>(storedHighContrast);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateResolvedTheme = () => {
      const theme = mode === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : mode;
      setResolvedTheme(theme);
    };

    updateResolvedTheme();
    mediaQuery.addEventListener('change', updateResolvedTheme);

    return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    const tokens = accentThemes[accent][resolvedTheme];
    
    // Apply theme tokens as CSS variables
    Object.entries(tokens).forEach(([key, value]) => {
      const cssVarName = key
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
      root.style.setProperty(`--${cssVarName}`, value);
    });

    // Set data attributes for CSS selectors
    root.setAttribute('data-theme', `${resolvedTheme} ${accent}`);
    root.setAttribute('data-mode', resolvedTheme);
    root.setAttribute('data-accent', accent);
    
    if (highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }

    // Apply to body class for compatibility
    document.body.className = document.body.className
      .replace(/\blight\b|\bdark\b/g, '')
      .trim();
    document.body.classList.add(resolvedTheme);
    
  }, [resolvedTheme, accent, highContrast]);

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    setStoredMode(newMode);
  };


  const handleHighContrastChange = (enabled: boolean) => {
    setHighContrast(enabled);
    setStoredHighContrast(enabled);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        accent,
        highContrast,
        setMode: handleModeChange,
        setHighContrast: handleHighContrastChange,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}