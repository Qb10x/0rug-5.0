# 🎨 0rug Color System Guide

## Quick Color Changes

**To change colors across the entire platform, edit these files:**

### 1. `src/lib/theme/colorConfig.ts` - Main Color Configuration
```typescript
export const platformColors = {
  primary: {
    main: '#00ff88', // ← Change this for new primary color
  },
  status: {
    success: { main: '#10b981' }, // ← Change success color
    error: { main: '#ef4444' },   // ← Change error color
  },
  // ... other colors
};
```

### 2. `src/lib/theme/colorUtils.ts` - Tailwind Classes
```typescript
export const colorUtils = {
  priority: {
    high: { bg: 'bg-red-500' }, // ← Change high priority color
    medium: { bg: 'bg-yellow-500' }, // ← Change medium priority
    low: { bg: 'bg-green-500' }, // ← Change low priority
  },
  // ... other utilities
};
```

## Usage in Components

```typescript
// Import color utilities
import { getPriorityColor, getStatusColor } from '@/lib/theme/colorUtils';

// Use in component
const priorityColors = getPriorityColor('high');
<Badge className={priorityColors.bg}>High Priority</Badge>
```

## Color Categories

- **Primary**: Main brand color (#00ff88)
- **Status**: Success, warning, error, info
- **Priority**: High, medium, low priority alerts
- **Alert Types**: Whale, swap, rug, volume, new_token, honeypot
- **Risk Levels**: Low, medium, high, critical

## Benefits

✅ **One source of truth** for all colors  
✅ **Easy to change** colors globally  
✅ **Consistent** across all components  
✅ **Type-safe** with TypeScript  
✅ **Theme support** for light/dark modes  

## Migration Status

**✅ Completed:**
- AlertItem component
- AlertStats component  
- TokenAnalysisCard component
- RiskAssessment component
- LPLockAnalysisCard component
- WalletManager component
- AlertFilters component
- AlertList component
- Alerts page (dark theme)
- Color system architecture
- Documentation

**🔄 In Progress:**
- Remaining trading components
- API response components
- Modal components

**📋 To Do:**
- Update remaining components to use centralized system
- Test all color changes work correctly
- Add more color categories as needed

## Recent Updates

**Latest Migration (Current Session):**
- ✅ **Dark Theme Implementation** - Alerts page now uses centralized dark theme
- ✅ AlertStats - Now uses `getGradientCardColor()` for consistent colors
- ✅ AlertFilters - Updated to use `colorUtils` for dark theme
- ✅ AlertList - Updated to use `colorUtils` for dark theme
- ✅ Alerts Page - Complete dark theme migration with `colorUtils`
- ✅ All components follow building rules (under 350 lines, modular design)

**Dark Theme Features:**
- Background: `from-gray-900 via-gray-800 to-gray-900`
- Cards: `bg-gray-800` with `border-gray-700`
- Text: `text-gray-100` for primary, `text-gray-400` for secondary
- Consistent with sidebar dark theme

**Color System Architecture:**
- `colorConfig.ts` - Simple color definitions
- `colorUtils.ts` - Tailwind class mappings with dark theme support
- `colors.ts` - Advanced theming and CSS variables
- Helper functions for easy usage

**Build Status:** ✅ **SUCCESS** - All migrated components compile correctly 