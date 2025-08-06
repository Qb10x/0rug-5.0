'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { 
  Palette, 
  Bell, 
  Shield, 
  Database, 
  Zap, 
  User,
  Save,
  CheckCircle
} from 'lucide-react';
import { SettingsSection } from '@/components/settings/SettingsTypes';

// Settings page component
export default function SettingsPage() {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('appearance');
  const [saved, setSaved] = useState(false);

  // Settings sections configuration
  const sections: SettingsSection[] = [
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Theme and display settings',
      icon: <Palette className="w-5 h-5" />,
      color: 'from-purple-500 to-blue-500'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Alert and notification preferences',
      icon: <Bell className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Privacy and security settings',
      icon: <Shield className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'performance',
      title: 'Performance',
      description: 'Data refresh and caching',
      icon: <Zap className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'data',
      title: 'Data & Storage',
      description: 'Data management and storage',
      icon: <Database className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'account',
      title: 'Account',
      description: 'User profile and preferences',
      icon: <User className="w-5 h-5" />,
      color: 'from-pink-500 to-purple-500'
    }
  ];

  // Handle save settings
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Render section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'appearance':
        return <AppearanceSettings theme={theme} />;
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Notification Preferences
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Configure how you receive alerts and updates.
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Alert Channels</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Email notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Push notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Telegram alerts</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Discord notifications</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Security Settings
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage your account security and privacy.
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Security Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Two-factor authentication</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Session timeout</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">API key authentication</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Performance Settings
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Optimize data refresh and caching settings.
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Auto Refresh</h4>
                <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <option value="15">15 seconds</option>
                  <option value="30" selected>30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Data Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage your data storage and export settings.
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Export Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="radio" name="exportFormat" value="csv" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">CSV</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="exportFormat" value="json" className="mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">JSON</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="exportFormat" value="xlsx" className="mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Excel</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Account Settings
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage your account profile and preferences.
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Profile Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue="0rug User"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue="user@0rug.com"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <AppearanceSettings theme={theme} />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          {/* Settings Sidebar */}
          <SettingsSidebar
            sections={sections}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          {/* Settings Content */}
          <div className="flex-1 p-8">
            <div className="max-w-4xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Settings
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Configure your 0rug Analytics preferences
                  </p>
                </div>
                
                <motion.button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {saved ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Settings Content */}
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                {renderSectionContent()}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 