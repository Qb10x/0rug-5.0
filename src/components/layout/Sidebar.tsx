'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Zap, 
  Bot,
  Home,
  Settings,
  Menu,
  X,
  BookOpen
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Navigation item interface
interface NavItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  badge?: string;
}

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Handle collapse state change
  const handleCollapseChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onCollapseChange?.(collapsed);
  };

  // Navigation items
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Main analytics overview',
      icon: <Home className="w-5 h-5" />,
      href: '/',
      color: 'from-purple-500 to-blue-500'
    },
    {
      id: 'trading',
      title: 'MemeBot Chat',
              description: 'token analysis powered by AI',
      icon: <Bot className="w-5 h-5" />,
      href: '/trading',
      color: 'from-indigo-500 to-purple-500',
      badge: 'AI'
    },
    {
      id: 'alerts',
      title: 'Real-Time Alerts',
      description: 'Telegram & Discord',
      icon: <Zap className="w-5 h-5" />,
      href: '/alerts',
      color: 'from-teal-500 to-cyan-500',
      badge: 'Live'
    },
    {
      id: 'docs',
      title: 'Documentation',
      description: 'Complete guide & FAQs',
      icon: <BookOpen className="w-5 h-5" />,
      href: '/docs',
      color: 'from-green-500 to-emerald-500',
      badge: 'New'
    }
  ];

  // Bottom navigation items
  const bottomNavItems: NavItem[] = [
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configuration',
      icon: <Settings className="w-5 h-5" />,
      href: '/settings',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed left-0 top-0 h-full bg-gray-900/80 backdrop-blur-sm border-r border-gray-700 z-50 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">0</span>
              </div>
              <h1 className="text-lg font-bold text-white">0rug Analytics</h1>
            </motion.div>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCollapseChange(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors duration-200 text-gray-300 hover:text-white"
            >
              {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </button>
            
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800/50 transition-colors duration-200 text-gray-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col h-full">
          {/* Main navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                
                return (
                  <Link key={item.id} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative flex items-center px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-800/50 opacity-60 group-hover:opacity-100'
                      }`}>
                        {item.icon}
                      </div>
                      
                      {/* Content */}
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex-1 min-w-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium truncate">{item.title}</p>
                              <p className="text-xs text-gray-400 truncate">{item.description}</p>
                            </div>
                            {item.badge && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-orange-400 rounded-r-full"
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom navigation */}
          <div className="border-t border-gray-700 p-4">
            <nav className="space-y-1">
              {bottomNavItems.map((item) => {
                const isActive = pathname === item.href;
                
                return (
                  <Link key={item.id} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative flex items-center px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-800/50 opacity-60 group-hover:opacity-100'
                      }`}>
                        {item.icon}
                      </div>
                      
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex-1 min-w-0"
                        >
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <p className="text-xs text-gray-400 truncate">{item.description}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
              
              {/* Theme Toggle */}
              <div className="pt-2">
                {!isCollapsed ? (
                  <ThemeToggle />
                ) : (
                  <div className="flex justify-center">
                    <ThemeToggle />
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </motion.div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700"
      >
        <Menu className="w-5 h-5 text-gray-300" />
      </button>
    </>
  );
} 