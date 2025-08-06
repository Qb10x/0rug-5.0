'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background fixed inset-0 overflow-auto">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="lg:ml-64 transition-all duration-300">
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </div>
    </div>
  );
} 