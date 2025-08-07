'use client';

import React from 'react';
import { Search, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { colorUtils } from '@/lib/theme/colorUtils';

interface AlertFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterPriority: string;
  setFilterPriority: (priority: string) => void;
  showRead: boolean;
  setShowRead: (show: boolean) => void;
}

// Filter and search controls for alerts
export default function AlertFilters({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterPriority,
  setFilterPriority,
  showRead,
  setShowRead
}: AlertFiltersProps) {
  return (
    <div className={`${colorUtils.background.card} rounded-xl shadow-sm border ${colorUtils.border.primary} p-6 mb-8`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${colorUtils.text.muted} w-5 h-5`} />
            <Input
              placeholder="Search alerts by title or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="whale">Whale Movement</SelectItem>
              <SelectItem value="swap">Large Swap</SelectItem>
              <SelectItem value="rug">Rug Pull</SelectItem>
              <SelectItem value="volume">Volume Spike</SelectItem>
              <SelectItem value="new_token">New Token</SelectItem>
              <SelectItem value="honeypot">Honeypot</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showRead ? "default" : "outline"}
            size="sm"
            onClick={() => setShowRead(!showRead)}
          >
            {showRead ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {showRead ? 'Show All' : 'Unread Only'}
          </Button>
        </div>
      </div>
    </div>
  );
} 