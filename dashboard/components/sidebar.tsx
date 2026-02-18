'use client';

import { useDashboardStore } from '@/store/dashboard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Home,
  LayoutKanban,
  FolderKanban,
  Calendar,
  Search,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { id: 'today', label: 'Today', icon: Home, shortcut: '⌘1' },
  { id: 'kanban', label: 'Kanban', icon: LayoutKanban, shortcut: '⌘2' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, shortcut: '⌘3' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, shortcut: '⌘4' },
  { id: 'memory', label: 'Memory', icon: Search, shortcut: '⌘5' },
  { id: 'quick', label: 'Quick', icon: Zap, shortcut: '⌘6' },
] as const;

export function Sidebar() {
  const { selectedView, setSelectedView, sidebarOpen, toggleSidebar } = useDashboardStore();
  
  return (
    <div
      className={cn(
        'h-screen border-r bg-card flex flex-col transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {sidebarOpen && (
          <span className="font-bold text-lg">LifeOS</span>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = selectedView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setSelectedView(item.id as typeof selectedView)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  <span className="text-xs opacity-50">{item.shortcut}</span>
                </>
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-2 border-t">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-5 h-5" />
          {sidebarOpen && <span>Settings</span>}
        </button>
      </div>
    </div>
  );
}
