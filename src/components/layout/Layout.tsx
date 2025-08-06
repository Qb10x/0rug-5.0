'use client';

import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Always visible */}
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      
      {/* Main content - Adjusts for sidebar */}
      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </div>
    </div>
  );
} 