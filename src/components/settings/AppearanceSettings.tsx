// Appearance Settings Component - following 0rug.com coding guidelines

import React from 'react';
import { ThemeToggleWithText } from '@/components/ui/ThemeToggle';

// Appearance settings component
export function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Theme Settings
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Customize the appearance of your 0rug Analytics dashboard.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Theme Mode</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose between light and dark themes
            </p>
          </div>
          <ThemeToggleWithText />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Color Scheme</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" name="colorScheme" value="blue" defaultChecked className="mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Blue (Default)</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="colorScheme" value="green" className="mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Green</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="colorScheme" value="purple" className="mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Purple</span>
              </label>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Font Size</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" name="fontSize" value="small" className="mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Small</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="fontSize" value="medium" defaultChecked className="mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Medium</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="fontSize" value="large" className="mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Large</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Display Options</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Show animations</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Compact mode</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">High contrast mode</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 