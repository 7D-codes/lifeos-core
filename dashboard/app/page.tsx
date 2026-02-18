'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/dashboard';
import { Sidebar } from '@/components/sidebar';
import { TodayView } from '@/components/today-view';
import { Task, Project } from '@/types';

export default function Dashboard() {
  const { selectedView, setTasks, setProjects } = useDashboardStore();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load data from API
    fetch('/api/data')
      .then(res => res.json())
      .then((data: { tasks: Task[]; projects: Project[] }) => {
        setTasks(data.tasks);
        setProjects(data.projects);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to load data:', error);
        setIsLoading(false);
      });
  }, [setTasks, setProjects]);
  
  const renderView = () => {
    if (isLoading) {
      return (
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      );
    }
    
    switch (selectedView) {
      case 'today':
        return <TodayView />;
      case 'kanban':
        return <div className="p-6">Kanban view (coming soon)</div>;
      case 'projects':
        return <div className="p-6">Projects view (coming soon)</div>;
      case 'calendar':
        return <div className="p-6">Calendar view (coming soon)</div>;
      case 'memory':
        return <div className="p-6">Memory search (coming soon)</div>;
      case 'quick':
        return <div className="p-6">Quick capture (coming soon)</div>;
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
