'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Plus, 
  Shield, 
  Bell,
  Clock,
  MessageSquare,
  Star,
  StarOff,
  MoreVertical,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getPriorityColor, getStatusColor, getAlertTypeColor } from '@/lib/theme/colorUtils';

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

interface AlertItemProps {
  alert: Alert;
  onMarkAsRead: (alertId: string) => void;
  onToggleStar: (alertId: string) => void;
}

// Get icon for alert type
const getAlertIcon = (type: Alert['type']) => {
  switch (type) {
    case 'whale': return <Users className="w-5 h-5" />;
    case 'swap': return <TrendingUp className="w-5 h-5" />;
    case 'rug': return <AlertTriangle className="w-5 h-5" />;
    case 'volume': return <Activity className="w-5 h-5" />;
    case 'new_token': return <Plus className="w-5 h-5" />;
    case 'honeypot': return <Shield className="w-5 h-5" />;
    default: return <Bell className="w-5 h-5" />;
  }
};

// Format time ago from timestamp
const formatTimeAgo = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Individual alert item component
export default function AlertItem({ alert, onMarkAsRead, onToggleStar }: AlertItemProps) {
  const priorityColors = getPriorityColor(alert.priority);
  const statusColors = getStatusColor(alert.status === 'sent' ? 'success' : alert.status === 'pending' ? 'warning' : 'error');
  const alertTypeColors = getAlertTypeColor(alert.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
        !alert.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className={`p-3 rounded-lg ${alertTypeColors.bg}`}>
                {getAlertIcon(alert.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {alert.title}
                  </h3>
                  <Badge className={priorityColors.bg}>
                    {alert.priority.toUpperCase()}
                  </Badge>
                  <Badge className={statusColors.bgLight}>
                    {alert.status.toUpperCase()}
                  </Badge>
                  {alert.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                </div>
                
                <p className="text-gray-600 mb-3">{alert.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTimeAgo(alert.timestamp)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{alert.channels.join(', ')}</span>
                  </div>
                  
                  {alert.amount && (
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{alert.amount}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleStar(alert.id)}
              >
                {alert.isStarred ? (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                ) : (
                  <StarOff className="w-4 h-4 text-gray-400" />
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onMarkAsRead(alert.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Read
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Resend Alert
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 