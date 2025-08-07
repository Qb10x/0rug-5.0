'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import AlertItem from './AlertItem';
import { colorUtils } from '@/lib/theme/colorUtils';

interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'whale' | 'swap' | 'rug' | 'volume' | 'new_token' | 'honeypot';
  priority: 'high' | 'medium' | 'low';
  status: 'sent' | 'pending' | 'failed';
  channels: string[];
  timestamp: Date;
  tokenAddress?: string;
  amount?: string;
  walletAddress?: string;
  isRead: boolean;
  isStarred: boolean;
}

interface AlertListProps {
  alerts: Alert[];
  onMarkAsRead: (alertId: string) => void;
  onToggleStar: (alertId: string) => void;
}

// Display list of alerts with animations
export default function AlertList({ alerts, onMarkAsRead, onToggleStar }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className={`w-12 h-12 ${colorUtils.text.muted} mx-auto mb-4`} />
        <h3 className={`text-lg font-medium ${colorUtils.text.primary} mb-2`}>No alerts found</h3>
        <p className={colorUtils.text.secondary}>Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {alerts.map((alert, index) => (
          <AlertItem
            key={alert.id}
            alert={alert}
            onMarkAsRead={onMarkAsRead}
            onToggleStar={onToggleStar}
          />
        ))}
      </AnimatePresence>
    </div>
  );
} 