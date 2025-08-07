import { useState, useEffect, useCallback } from 'react';
import { AlertEngine } from '@/lib/alerts/alertEngine';

interface AlertTrigger {
  id: string;
  type: 'whale' | 'swap' | 'rug' | 'volume' | 'new_token' | 'honeypot';
  priority: 'high' | 'medium' | 'low';
  tokenAddress?: string;
  walletAddress?: string;
  amount?: string;
  description: string;
  timestamp: Date;
  channels: string[];
  isRead: boolean;
  isStarred: boolean;
}

interface AlertStats {
  total: number;
  sentToday: number;
  highPriority: number;
  activeChannels: number;
  unread: number;
  starred: number;
}

// React hook for managing alerts with smart AI integration
export function useAlertEngine() {
  const [alerts, setAlerts] = useState<AlertTrigger[]>([]);
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    sentToday: 0,
    highPriority: 0,
    activeChannels: 2,
    unread: 0,
    starred: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isTestingNotifications, setIsTestingNotifications] = useState(false);
  const [alertEngine, setAlertEngine] = useState<AlertEngine | null>(null);

  // Initialize alert engine
  useEffect(() => {
    const engine = new AlertEngine({
      whaleThreshold: 10000, // $10k minimum for whale alerts
      volumeSpikeThreshold: 5, // 5x volume increase
      rugPullConfidence: 70, // 70% confidence threshold
      enabledChannels: ['telegram', 'discord'],
      autoAnalysis: true,
      notificationsEnabled: true
    });
    setAlertEngine(engine);
  }, []);

  // Update stats when alerts change
  useEffect(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const newStats: AlertStats = {
      total: alerts.length,
      sentToday: alerts.filter(alert => 
        alert.timestamp >= today
      ).length,
      highPriority: alerts.filter(alert => 
        alert.priority === 'high'
      ).length,
      activeChannels: 2, // telegram + discord
      unread: alerts.filter(alert => !alert.isRead).length,
      starred: alerts.filter(alert => alert.isStarred).length
    };
    
    setStats(newStats);
  }, [alerts]);

  // Monitor a specific token for alerts
  const monitorToken = useCallback(async (tokenAddress: string) => {
    if (!alertEngine) return;
    
    setIsMonitoring(true);
    try {
      const newAlerts = await alertEngine.monitorToken(tokenAddress);
      
      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev]);
        
        // Add alerts to engine
        newAlerts.forEach(alert => alertEngine.addAlert(alert));
      }
    } catch (error) {
      console.error('Error monitoring token:', error);
    } finally {
      setIsMonitoring(false);
    }
  }, [alertEngine]);

  // Test notification channels
  const testNotifications = useCallback(async () => {
    if (!alertEngine) return;
    
    setIsTestingNotifications(true);
    try {
      const results = await alertEngine.testNotifications();
      console.log('Notification test results:', results);
      return results;
    } catch (error) {
      console.error('Error testing notifications:', error);
      return { telegram: false, discord: false };
    } finally {
      setIsTestingNotifications(false);
    }
  }, [alertEngine]);

  // Mark alert as read
  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
    
    if (alertEngine) {
      alertEngine.markAsRead(alertId);
    }
  }, [alertEngine]);

  // Toggle star status
  const toggleStar = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isStarred: !alert.isStarred } : alert
    ));
    
    if (alertEngine) {
      alertEngine.toggleStar(alertId);
    }
  }, [alertEngine]);

  // Filter alerts by search term and filters
  const getFilteredAlerts = useCallback((
    searchTerm: string,
    filterType: string,
    filterPriority: string,
    showRead: boolean
  ) => {
    return alerts.filter(alert => {
      const matchesSearch = alert.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || alert.type === filterType;
      const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority;
      const matchesRead = showRead || !alert.isRead;
      
      return matchesSearch && matchesType && matchesPriority && matchesRead;
    }).map(alert => ({
      ...alert,
      title: `${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert`,
      status: 'sent' as const
    }));
  }, [alerts]);

  // Update alert engine configuration
  const updateConfig = useCallback((newConfig: Partial<{
    whaleThreshold: number;
    volumeSpikeThreshold: number;
    rugPullConfidence: number;
    enabledChannels: string[];
    autoAnalysis: boolean;
    notificationsEnabled: boolean;
  }>) => {
    if (alertEngine) {
      alertEngine.updateConfig(newConfig);
    }
  }, [alertEngine]);

  // Get alerts from engine
  const refreshAlerts = useCallback(() => {
    if (alertEngine) {
      const engineAlerts = alertEngine.getActiveAlerts();
      setAlerts(engineAlerts);
    }
  }, [alertEngine]);

  return {
    alerts,
    stats,
    isMonitoring,
    isTestingNotifications,
    monitorToken,
    testNotifications,
    markAsRead,
    toggleStar,
    getFilteredAlerts,
    updateConfig,
    refreshAlerts
  };
} 