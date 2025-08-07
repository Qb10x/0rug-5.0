import { colors } from './colors';

// Centralized color utility for consistent theming
export const colorUtils = {
  // Priority colors
  priority: {
    high: {
      bg: 'bg-red-500',
      text: 'text-red-500',
      bgLight: 'bg-red-100',
      textLight: 'text-red-800',
      border: 'border-red-500',
      hover: 'hover:bg-red-600',
    },
    medium: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-500',
      bgLight: 'bg-yellow-100',
      textLight: 'text-yellow-800',
      border: 'border-yellow-500',
      hover: 'hover:bg-yellow-600',
    },
    low: {
      bg: 'bg-green-500',
      text: 'text-green-500',
      bgLight: 'bg-green-100',
      textLight: 'text-green-800',
      border: 'border-green-500',
      hover: 'hover:bg-green-600',
    },
  },

  // Status colors
  status: {
    success: {
      bg: 'bg-green-500',
      text: 'text-green-500',
      bgLight: 'bg-green-100',
      textLight: 'text-green-800',
      border: 'border-green-500',
      hover: 'hover:bg-green-600',
    },
    warning: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-500',
      bgLight: 'bg-yellow-100',
      textLight: 'text-yellow-800',
      border: 'border-yellow-500',
      hover: 'hover:bg-yellow-600',
    },
    error: {
      bg: 'bg-red-500',
      text: 'text-red-500',
      bgLight: 'bg-red-100',
      textLight: 'text-red-800',
      border: 'border-red-500',
      hover: 'hover:bg-red-600',
    },
    info: {
      bg: 'bg-blue-500',
      text: 'text-blue-500',
      bgLight: 'bg-blue-100',
      textLight: 'text-blue-800',
      border: 'border-blue-500',
      hover: 'hover:bg-blue-600',
    },
  },

  // Alert type colors
  alertType: {
    whale: {
      bg: 'bg-blue-100',
      text: 'text-blue-500',
      border: 'border-blue-500',
    },
    swap: {
      bg: 'bg-green-100',
      text: 'text-green-500',
      border: 'border-green-500',
    },
    rug: {
      bg: 'bg-red-100',
      text: 'text-red-500',
      border: 'border-red-500',
    },
    volume: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-500',
      border: 'border-yellow-500',
    },
    new_token: {
      bg: 'bg-purple-100',
      text: 'text-purple-500',
      border: 'border-purple-500',
    },
    honeypot: {
      bg: 'bg-orange-100',
      text: 'text-orange-500',
      border: 'border-orange-500',
    },
  },

  // Action colors
  action: {
    primary: {
      bg: 'bg-blue-500',
      text: 'text-white',
      hover: 'hover:bg-blue-600',
      disabled: 'disabled:bg-gray-300',
    },
    secondary: {
      bg: 'bg-green-500',
      text: 'text-white',
      hover: 'hover:bg-green-600',
      disabled: 'disabled:bg-gray-300',
    },
    danger: {
      bg: 'bg-red-500',
      text: 'text-white',
      hover: 'hover:bg-red-600',
      disabled: 'disabled:bg-gray-300',
    },
  },

  // Price change colors
  priceChange: {
    positive: {
      text: 'text-green-500',
      bg: 'bg-green-100',
    },
    negative: {
      text: 'text-red-500',
      bg: 'bg-red-100',
    },
    neutral: {
      text: 'text-yellow-500',
      bg: 'bg-yellow-100',
    },
  },

  // Risk level colors
  riskLevel: {
    low: {
      text: 'text-green-500',
      bg: 'bg-green-100',
      progress: 'bg-green-500',
    },
    medium: {
      text: 'text-yellow-500',
      bg: 'bg-yellow-100',
      progress: 'bg-yellow-500',
    },
    high: {
      text: 'text-red-500',
      bg: 'bg-red-100',
      progress: 'bg-red-500',
    },
    critical: {
      text: 'text-red-600',
      bg: 'bg-red-100',
      progress: 'bg-red-600',
    },
  },

  // Gradient colors with proper text colors
  gradients: {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600',
    secondary: 'bg-gradient-to-r from-green-500 to-green-600',
    success: 'bg-gradient-to-r from-green-500 to-green-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    error: 'bg-gradient-to-r from-red-500 to-red-600',
    info: 'bg-gradient-to-r from-blue-500 to-blue-600',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
    orange: 'bg-gradient-to-r from-orange-500 to-orange-600',
  },

  // Gradient card colors with proper text colors
  gradientCards: {
    info: {
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
      textColor: 'text-blue-100',
      iconColor: 'text-blue-200',
    },
    success: {
      gradient: 'bg-gradient-to-r from-green-500 to-green-600',
      textColor: 'text-green-100',
      iconColor: 'text-green-200',
    },
    error: {
      gradient: 'bg-gradient-to-r from-red-500 to-red-600',
      textColor: 'text-red-100',
      iconColor: 'text-red-200',
    },
    warning: {
      gradient: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-100',
      iconColor: 'text-yellow-200',
    },
    purple: {
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
      textColor: 'text-purple-100',
      iconColor: 'text-purple-200',
    },
    orange: {
      gradient: 'bg-gradient-to-r from-orange-500 to-orange-600',
      textColor: 'text-orange-100',
      iconColor: 'text-orange-200',
    },
  },

  // Text colors
  text: {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-600 dark:text-gray-400',
    muted: 'text-gray-500 dark:text-gray-500',
    inverse: 'text-white',
  },

  // Background colors
  background: {
    primary: 'bg-white dark:bg-gray-900',
    secondary: 'bg-gray-50 dark:bg-gray-800',
    card: 'bg-white dark:bg-gray-800',
    modal: 'bg-white dark:bg-gray-900',
  },

  // Border colors
  border: {
    primary: 'border-gray-200 dark:border-gray-700',
    secondary: 'border-gray-300 dark:border-gray-600',
    accent: 'border-blue-500 dark:border-blue-400',
  },
};

// Helper function to get priority color classes
export const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
  return colorUtils.priority[priority];
};

// Helper function to get status color classes
export const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info') => {
  return colorUtils.status[status];
};

// Helper function to get alert type color classes
export const getAlertTypeColor = (type: 'whale' | 'swap' | 'rug' | 'volume' | 'new_token' | 'honeypot') => {
  return colorUtils.alertType[type];
};

// Helper function to get risk level color classes
export const getRiskLevelColor = (level: 'low' | 'medium' | 'high' | 'critical') => {
  return colorUtils.riskLevel[level];
};

// Helper function to get price change color classes
export const getPriceChangeColor = (isPositive: boolean) => {
  return isPositive ? colorUtils.priceChange.positive : colorUtils.priceChange.negative;
};

// Helper function to get action color classes
export const getActionColor = (action: 'primary' | 'secondary' | 'danger') => {
  return colorUtils.action[action];
};

// Helper function to get gradient card color classes
export const getGradientCardColor = (type: 'info' | 'success' | 'error' | 'warning' | 'purple' | 'orange') => {
  return colorUtils.gradientCards[type];
}; 