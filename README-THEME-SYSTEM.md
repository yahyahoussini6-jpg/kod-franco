# Theme System Documentation

## Overview

This admin dashboard includes a comprehensive theme system with:
- **Light/Dark mode support** with system preference detection
- **Brand accent presets**: Olive/Zayna, Purple/BrandHUB, Neutral
- **Token-based colors** via CSS variables integrated with Tailwind + shadcn
- **Status badges** for COD pipeline (French labels)
- **High contrast mode** for accessibility
- **Persistent user preferences** in localStorage

## Quick Start

The theme system is automatically initialized when the app starts. Users can access the theme switcher in the navigation bar.

### Theme Switcher

The `ThemeSwitcher` component provides:
- **Mode selection**: System / Light / Dark
- **Accent selection**: Olive, Purple, Neutral
- **High contrast toggle** for accessibility

```tsx
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

// Usage in any component
<ThemeSwitcher variant="outline" size="sm" />
```

### Using Theme Colors

Use semantic tokens instead of direct colors:

```tsx
// ✅ CORRECT - Using semantic tokens
<div className="bg-primary text-primary-foreground">
<Button variant="destructive">Delete</Button>
<p className="text-success">Success message</p>

// ❌ WRONG - Direct colors
<div className="bg-blue-500 text-white">
<Button className="bg-red-500">Delete</Button>
<p className="text-green-600">Success message</p>
```

### Order Status Badges

Use the `OrderStatusBadge` component for consistent status display:

```tsx
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { OrderStatus } from '@/theme/tokens';

const status: OrderStatus = 'en_preparation';

<OrderStatusBadge status={status} />
```

Available status values:
- `nouvelle` - Nouvelle
- `confirmee` - Confirmée  
- `en_preparation` - En préparation
- `expediee` - Expédiée
- `livree` - Livrée
- `annulee` - Annulée
- `retournee` - Retournée

## Adding a New Accent Theme

To add a new accent theme (e.g., "orange"):

### 1. Update tokens.ts

```tsx
// src/theme/tokens.ts
export type AccentTheme = 'olive' | 'purple' | 'neutral' | 'orange';

export const accentThemes: Record<AccentTheme, { light: ThemeTokens; dark: ThemeTokens }> = {
  // ... existing themes
  orange: {
    light: {
      // Define all required tokens with HSL values
      primary: '25 95% 53%', // Orange primary color
      primaryForeground: '0 0% 98%',
      accent: '45 94% 62%', // Complementary accent
      // ... all other required tokens
    },
    dark: {
      // Dark mode variant
      primary: '25 85% 63%',
      // ... all other required tokens
    }
  }
};
```

### 2. Update ThemeSwitcher.tsx

```tsx
// src/components/ThemeSwitcher.tsx
const accentOptions: { value: AccentTheme; label: string; color: string }[] = [
  // ... existing options
  { value: 'orange', label: 'Orange', color: '#ea580c' },
];
```

### 3. Test the Theme

1. Restart the development server
2. Open the theme switcher
3. Select the new "Orange" accent
4. Verify colors work in both light and dark modes
5. Test accessibility contrast ratios

## Theme Architecture

### File Structure

```
src/
├── theme/
│   ├── tokens.ts           # Theme definitions and types
│   └── ThemeProvider.tsx   # React context and logic
├── components/
│   ├── ThemeSwitcher.tsx   # Theme selection UI
│   └── OrderStatusBadge.tsx # Status badge component
├── styles/
│   └── theme.css           # CSS variables and utilities
└── lib/
    └── useLocalStorage.ts  # Persistence helper
```

### CSS Variables

All colors are defined as HSL values in CSS variables:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --success: 142.1 76.2% 36.3%;
  --status-nouvelle: 217 91% 94%;
  /* ... */
}
```

### Tailwind Integration

Colors are mapped to CSS variables in `tailwind.config.ts`:

```js
colors: {
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))'
  },
  success: {
    DEFAULT: 'hsl(var(--success))',
    foreground: 'hsl(var(--success-foreground))'
  },
  // ...
}
```

## Accessibility Features

- **WCAG AA compliance** for all color combinations
- **Focus ring styles** using `--ring` color
- **High contrast mode** with enhanced borders and shadows
- **Reduced motion support** via `prefers-reduced-motion`
- **Keyboard navigation** for theme switcher

## Persistence

User preferences are stored in localStorage:
- `admin.theme.mode` - Theme mode (system/light/dark)
- `admin.theme.accent` - Accent theme (olive/purple/neutral)  
- `admin.theme.hc` - High contrast enabled (boolean)

## Best Practices

1. **Always use semantic tokens** instead of direct colors
2. **Test in both light and dark modes** when adding new components
3. **Verify accessibility** using browser dev tools
4. **Use the OrderStatusBadge** component for consistent status display
5. **Follow HSL format** for all color values in tokens

## Troubleshooting

### Colors not updating
- Check that CSS variables are properly defined in `tokens.ts`
- Ensure Tailwind classes use `hsl(var(--variable-name))` format
- Verify the component is wrapped in `ThemeProvider`

### Status badges not showing
- Import `OrderStatusBadge` from the correct path
- Use valid `OrderStatus` enum values
- Check that status CSS variables are defined

### Theme switcher not working
- Verify localStorage permissions in browser
- Check browser console for JavaScript errors
- Ensure `ThemeProvider` wraps the entire app
