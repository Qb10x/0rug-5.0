'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Activity, AlertTriangle, MessageSquare, Eye, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getGradientCardColor } from '@/lib/theme/colorUtils';

interface AlertStatsData {
  total: number;
  sentToday: number;
  highPriority: number;
  activeChannels: number;
  unread: number;
  starred: number;
}

interface AlertStatsProps {
  stats: AlertStatsData;
}

// Display alert statistics in animated cards
export default function AlertStats({ stats }: AlertStatsProps) {
  const statCards = [
    { 
      label: 'Total Alerts', 
      value: stats.total, 
      icon: Bell, 
      colorType: 'info' as const
    },
    { 
      label: 'Sent Today', 
      value: stats.sentToday, 
      icon: Activity, 
      colorType: 'success' as const
    },
    { 
      label: 'High Priority', 
      value: stats.highPriority, 
      icon: AlertTriangle, 
      colorType: 'error' as const
    },
    { 
      label: 'Active Channels', 
      value: stats.activeChannels, 
      icon: MessageSquare, 
      colorType: 'purple' as const
    },
    { 
      label: 'Unread', 
      value: stats.unread, 
      icon: Eye, 
      colorType: 'orange' as const
    },
    { 
      label: 'Starred', 
      value: stats.starred, 
      icon: Star, 
      colorType: 'warning' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
      {statCards.map((card, index) => {
        const cardColors = getGradientCardColor(card.colorType);
        
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + 1) * 0.1 }}
          >
            <Card className={`${cardColors.gradient} text-white`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${cardColors.textColor} text-sm font-medium`}>{card.label}</p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                  <card.icon className={`w-8 h-8 ${cardColors.iconColor}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
} 