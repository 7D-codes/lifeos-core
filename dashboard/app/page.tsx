'use client';

import { useEffect } from 'react';
import { useDashboardStore, initializeDashboard } from '@/store/dashboard';
import { Sidebar } from '@/components/sidebar';
import { TodayView } from '@/components/today-view';

export default function Dashboard() {
  const { selectedView } = useDashboardStore();
  
  useEffect(() => {
    initializeDashboard();
  }, []);
  
  const renderView = () => {
    switch (selectedView) {
      case 'today':
        return <TodayView />;
      case 'kanban':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Kanban Board</h1>
            <p className="text-muted-foreground">Coming soon — drag & drop task management</p>
          </div>
        );
      case 'projects':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Projects</h1>
            <p className="text-muted-foreground">Coming soon — project & milestone overview</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Calendar</h1>
            <p className="text-muted-foreground">Coming soon — time blocking & scheduling</p>
          </div>
        );
      case 'memory':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Memory Search</h1>
            <p className="text-muted-foreground">Coming soon — search across all notes & facts</p>
          </div>
        );
      case 'quick':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Quick Capture</h1>
            <p className="text-muted-foreground">Coming soon — rapid task & note entry</p>
          </div>
        );
      default:
        return <TodayView />;
    }
  };
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
}
