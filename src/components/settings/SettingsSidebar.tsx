// Settings Sidebar Component - following 0rug.com coding guidelines

import React from 'react';
import { motion } from 'framer-motion';
import { SettingsSection } from './SettingsTypes';

// Settings sidebar props
interface SettingsSidebarProps {
  sections: SettingsSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

// Settings sidebar component
export function SettingsSidebar({
  sections,
  activeSection,
  onSectionChange
}: SettingsSidebarProps) {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Settings
        </h2>
        
        <nav className="space-y-2">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-gradient-to-r text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`p-2 rounded-lg ${
                activeSection === section.id
                  ? 'bg-white/20'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {section.icon}
              </div>
              <div>
                <div className="font-medium">{section.title}</div>
                <div className="text-sm opacity-75">{section.description}</div>
              </div>
            </motion.button>
          ))}
        </nav>
      </div>
    </div>
  );
} 