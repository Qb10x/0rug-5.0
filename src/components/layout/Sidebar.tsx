'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  Bot,
  Home,
  Settings,
  Menu,
  X
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

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

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
      id: 'pools',
      title: 'LP Pool Scanner',
      description: 'Real-time pool detection',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/pools',
      color: 'from-blue-500 to-cyan-500',
      badge: 'Live'
    },
    {
      id: 'whales',
      title: 'Whale Tracker',
      description: 'Monitor large movements',
      icon: <Users className="w-5 h-5" />,
      href: '/whales',
      color: 'from-purple-500 to-pink-500',
      badge: 'Live'
    },

    {
      id: 'tokens',
      title: 'Token Profiles',
      description: 'Token analytics',
      icon: <TrendingUp className="w-5 h-5" />,
      href: '/tokens',
      color: 'from-orange-500 to-red-500',
      badge: 'Live'
    },
    {
      id: 'risk',
      title: 'Risk Score',
      description: 'Pool risk assessment',
      icon: <Shield className="w-5 h-5" />,
      href: '/risk',
      color: 'from-yellow-500 to-orange-500',
      badge: 'Live'
    },
    {
      id: 'trading',
      title: 'Jupiter Trading',
      description: 'Real trading with fees',
      icon: <Zap className="w-5 h-5" />,
      href: '/trading',
      color: 'from-indigo-500 to-purple-500',
      badge: 'Live'
    },
    {
      id: 'alerts',
      title: 'Real-Time Alerts',
      description: 'Telegram & Discord',
      icon: <Bot className="w-5 h-5" />,
      href: '/alerts',
      color: 'from-teal-500 to-cyan-500',
      badge: 'Live'
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
        className={`fixed left-0 top-0 h-full bg-sidebar backdrop-blur-sm border-r border-sidebar-border z-50 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">0</span>
              </div>
              <h1 className="text-lg font-bold text-sidebar-foreground">0rug Analytics</h1>
            </motion.div>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors duration-200 text-sidebar-foreground"
            >
              {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </button>
            
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent transition-colors duration-200 text-sidebar-foreground"
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
                          ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        isActive 
                          ? 'bg-primary/20' 
                          : 'bg-sidebar-accent opacity-60 group-hover:opacity-100'
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
                              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                            </div>
                            {item.badge && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
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
                          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom navigation */}
          <div className="border-t border-sidebar-border p-4">
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
                          ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        isActive 
                          ? 'bg-primary/20' 
                          : 'bg-sidebar-accent opacity-60 group-hover:opacity-100'
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
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
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
        className="fixed top-4 left-4 z-30 lg:hidden p-2 bg-sidebar backdrop-blur-sm rounded-lg border border-sidebar-border"
      >
        <Menu className="w-5 h-5 text-sidebar-foreground" />
      </button>
    </>
  );
} 