# 🎨 0rug Platform Color System

## Overview

The 0rug platform uses a **centralized color system** to ensure consistency and make it easy to change colors across the entire application. All colors are defined in one place and used throughout the platform.

## 📁 Color Files

### 1. `src/lib/theme/colors.ts`
- **Purpose**: Comprehensive color definitions and theme objects
- **Contains**: Mercury-inspired color palette, light/dark themes, gradients, component colors
- **Usage**: For advanced theming and CSS custom properties

### 2. `src/lib/theme/colorUtils.ts`
- **Purpose**: Tailwind CSS class mappings for common color patterns
- **Contains**: Priority colors, status colors, alert type colors, risk level colors
- **Usage**: For components that need Tailwind classes

### 3. `src/lib/theme/colorConfig.ts`
- **Purpose**: Simple color configuration for easy changes
- **Contains**: Platform colors, helper functions
- **Usage**: For quick color changes across the platform

## 🎯 How to Change Colors

### Option 1: Quick Color Change (Recommended)

Edit `src/lib/theme/colorConfig.ts`:

```typescript
export const platformColors = {
  primary: {
    main: '#00ff88', // Change this to your new primary color
    light: '#33ff87',
    dark: '#00cc6a',
  },
  // ... other colors
};
```

### Option 2: Advanced Color Change

Edit `src/lib/theme/colors.ts`:

```typescript
export const colors = {
  primary: {
    500: '#00ff88', // Change this to your new primary color
    // ... other shades
  },
  // ... other color groups
};
```

### Option 3: Component-Specific Colors

Edit `src/lib/theme/colorUtils.ts`:

```typescript
export const colorUtils = {
  priority: {
    high: {
      bg: 'bg-red-500', // Change to your preferred color
      text: 'text-red-500',
      // ... other properties
    },
    // ... other priorities
  },
  // ... other color utilities
};
```

## 🚀 Usage Examples

### In Components

```typescript
// Import color utilities
import { getPriorityColor, getStatusColor, getAlertTypeColor } from '@/lib/theme/colorUtils';

// Use in component
const priorityColors = getPriorityColor('high');
const statusColors = getStatusColor('success');
const alertTypeColors = getAlertTypeColor('whale');

// Apply to elements
<Badge className={priorityColors.bg}>High Priority</Badge>
<div className={statusColors.text}>Success Message</div>
```

### For Quick Color Changes

```typescript
// Import color config
import { getColor } from '@/lib/theme/colorConfig';

// Get specific color
const primaryColor = getColor('primary', 'main');
const successColor = getColor('status', 'success', 'main');
```

## 🎨 Color Categories

### 1. **Primary Colors**
- `primary.main`: Main brand color (#00ff88 - Warm Green)
- `primary.light`: Light variant
- `primary.dark`: Dark variant

### 2. **Status Colors**
- `status.success`: Green for success states
- `status.warning`: Yellow for warnings
- `status.error`: Red for errors
- `status.info`: Blue for information

### 3. **Priority Colors**
- `priority.high`: Red for high priority
- `priority.medium`: Yellow for medium priority
- `priority.low`: Green for low priority

### 4. **Alert Type Colors**
- `alertType.whale`: Blue for whale alerts
- `alertType.swap`: Green for swap alerts
- `alertType.rug`: Red for rug pull alerts
- `alertType.volume`: Yellow for volume alerts
- `alertType.new_token`: Purple for new token alerts
- `alertType.honeypot`: Orange for honeypot alerts

### 5. **Risk Level Colors**
- `riskLevel.low`: Green for low risk
- `riskLevel.medium`: Yellow for medium risk
- `riskLevel.high`: Red for high risk
- `riskLevel.critical`: Dark red for critical risk

## 🔄 Migration Guide

### From Hardcoded Colors to Centralized System

**Before:**
```typescript
<div className="bg-red-500 text-white">High Priority</div>
<span className="text-green-600">Success</span>
```

**After:**
```typescript
import { getPriorityColor, getStatusColor } from '@/lib/theme/colorUtils';

const priorityColors = getPriorityColor('high');
const statusColors = getStatusColor('success');

<div className={priorityColors.bg}>High Priority</div>
<span className={statusColors.text}>Success</span>
```

## 🎯 Benefits

1. **Consistency**: All colors are defined in one place
2. **Easy Changes**: Change colors globally by editing one file
3. **Theme Support**: Built-in light/dark theme support
4. **Type Safety**: TypeScript ensures correct color usage
5. **Maintainability**: Easy to update and maintain

## 🚀 Quick Start

1. **To change the primary color**: Edit `platformColors.primary.main` in `colorConfig.ts`
2. **To change status colors**: Edit `platformColors.status` in `colorConfig.ts`
3. **To add new colors**: Add to `colorConfig.ts` and update `colorUtils.ts`
4. **To use in components**: Import from `colorUtils.ts` and use helper functions

## 📝 Best Practices

1. **Always use the centralized system** instead of hardcoded colors
2. **Use helper functions** like `getPriorityColor()` for consistency
3. **Test both light and dark themes** when changing colors
4. **Update documentation** when adding new color categories
5. **Use semantic color names** (e.g., `success` instead of `green`)

## 🔧 Troubleshooting

### Common Issues

1. **Color not updating**: Make sure you're using the centralized system, not hardcoded colors
2. **TypeScript errors**: Check that color types match the expected interface
3. **Dark theme issues**: Ensure colors work in both light and dark themes
4. **Tailwind conflicts**: Use the `colorUtils.ts` mappings for Tailwind classes

### Debugging

```typescript
// Check what colors are being used
import { colorUtils } from '@/lib/theme/colorUtils';
console.log(colorUtils.priority.high);

// Check color configuration
import { platformColors } from '@/lib/theme/colorConfig';
console.log(platformColors.primary);
``` 