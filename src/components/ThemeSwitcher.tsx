import React from 'react';
import { Moon, Sun, Monitor, Palette, Contrast, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemeMode, AccentTheme } from '@/theme/tokens';

interface ThemeSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export function ThemeSwitcher({ variant = 'ghost', size = 'sm' }: ThemeSwitcherProps) {
  const { mode, accent, highContrast, setMode, setAccent, setHighContrast, resolvedTheme } = useTheme();

  const modeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'system', label: 'Système', icon: <Monitor className="mr-2 h-4 w-4" /> },
    { value: 'light', label: 'Clair', icon: <Sun className="mr-2 h-4 w-4" /> },
    { value: 'dark', label: 'Sombre', icon: <Moon className="mr-2 h-4 w-4" /> },
  ];

  const accentOptions: { value: AccentTheme; label: string; color: string }[] = [
    { value: 'olive', label: 'Olive / Zayna', color: '#636b2f' },
    { value: 'purple', label: 'Purple / BrandHUB', color: '#582BAF' },
    { value: 'neutral', label: 'Neutre', color: '#2563eb' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className="relative"
          aria-label="Options de thème"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Basculer le thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center">
          <Palette className="mr-2 h-4 w-4" />
          Thème et apparence
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Mode
        </DropdownMenuLabel>
        {modeOptions.map(({ value, label, icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setMode(value)}
            className="cursor-pointer"
          >
            {icon}
            {label}
            {mode === value && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Accent
        </DropdownMenuLabel>
        {accentOptions.map(({ value, label, color }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setAccent(value)}
            className="cursor-pointer"
          >
            <div 
              className="mr-2 h-4 w-4 rounded-full border"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            {label}
            {accent === value && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuCheckboxItem
          checked={highContrast}
          onCheckedChange={setHighContrast}
          className="cursor-pointer"
        >
          <Contrast className="mr-2 h-4 w-4" />
          Contraste élevé
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}