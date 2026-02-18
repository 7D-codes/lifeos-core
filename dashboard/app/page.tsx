'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboard';
import { Sidebar } from '@/components/sidebar';
import { TodayView } from '@/components/today-view';
import { getAllTasks, getProjects, getDailyNotes } from '@/lib/parser';

export default function Dashboard() {
  const { selectedView, setTasks, setProjects } = useDashboardStore();
  
  useEffect(() => {
    // Load initial data
    try {
      const tasks = getAllTasks();
      const projects = getProjects();
      setTasks(tasks);
      setProjects(projects);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, [setTasks, setProjects]);
  
  const renderView = () => {
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
