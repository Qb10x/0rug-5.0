'use client';

import React, { useState } from 'react';
import { Zap, RefreshCw, Settings, Search, Plus, Bell } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AlertStats from '@/components/alerts/AlertStats';
import AlertFilters from '@/components/alerts/AlertFilters';
import AlertList from '@/components/alerts/AlertList';
import { useAlertEngine } from '@/hooks/useAlertEngine';
import { getStatusColor, colorUtils } from '@/lib/theme/colorUtils';

// Main alerts page with smart AI integration
export default function AlertsPage() {
  const {
    alerts,
    stats,
    isMonitoring,
    isTestingNotifications,
    monitorToken,
    testNotifications,
    markAsRead,
    toggleStar,
    getFilteredAlerts,
    refreshAlerts
  } = useAlertEngine();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showRead, setShowRead] = useState(true);
  const [tokenToMonitor, setTokenToMonitor] = useState('');

  // Get filtered alerts
  const filteredAlerts = getFilteredAlerts(searchTerm, filterType, filterPriority, showRead);

  // Handle token monitoring
  const handleMonitorToken = async () => {
    if (tokenToMonitor.trim()) {
      await monitorToken(tokenToMonitor.trim());
      setTokenToMonitor('');
    }
  };

  // Handle notification testing
  const handleTestNotifications = async () => {
    const results = await testNotifications();
    if (results) {
      alert(`Notification Test Results:\nTelegram: ${results.telegram ? '✅' : '❌'}\nDiscord: ${results.discord ? '✅' : '❌'}`);
    }
  };

  const infoColors = getStatusColor('info');

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <div className={`${colorUtils.background.card} border-b ${colorUtils.border.primary}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 ${infoColors.bgLight} rounded-lg`}>
                    <Zap className={`w-6 h-6 ${infoColors.text}`} />
                  </div>
                  <div>
                    <h1 className={`text-2xl font-bold ${colorUtils.text.primary}`}>Real-Time Alerts</h1>
                    <p className={`text-sm ${colorUtils.text.secondary}`}>AI-powered monitoring with smart analysis</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleTestNotifications}
                  disabled={isTestingNotifications}
                >
                  <Bell className={`w-4 h-4 mr-2 ${isTestingNotifications ? 'animate-pulse' : ''}`} />
                  {isTestingNotifications ? 'Testing...' : 'Test Notifications'}
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button 
                  size="sm" 
                  onClick={refreshAlerts}
                  disabled={isMonitoring}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isMonitoring ? 'animate-spin' : ''}`} />
                  {isMonitoring ? 'Monitoring...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <AlertStats stats={stats} />

          {/* Token Monitoring Section */}
          <div className={`${colorUtils.background.card} rounded-xl shadow-sm border ${colorUtils.border.primary} p-6 mb-8`}>
            <div className="flex items-center space-x-2 mb-4">
              <Search className={`w-5 h-5 ${colorUtils.text.muted}`} />
              <h3 className={`text-lg font-semibold ${colorUtils.text.primary}`}>Monitor Token</h3>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter token address to monitor..."
                  value={tokenToMonitor}
                  onChange={(e) => setTokenToMonitor(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleMonitorToken}
                disabled={!tokenToMonitor.trim() || isMonitoring}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Monitor</span>
              </Button>
            </div>
            <p className={`text-sm ${colorUtils.text.secondary} mt-2`}>
              Enter a token address to analyze it with our smart AI tools and generate alerts
            </p>
          </div>

          {/* Filters and Search */}
          <AlertFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            showRead={showRead}
            setShowRead={setShowRead}
          />

          {/* Alerts List */}
          <AlertList
            alerts={filteredAlerts}
            onMarkAsRead={markAsRead}
            onToggleStar={toggleStar}
          />
        </div>
      </div>
    </Layout>
  );
} 