import { create } from 'zustand';
import { Task, Project, TimeBlock, DashboardStats } from '@/types';

interface DashboardState {
  // Data
  tasks: Task[];
  projects: Project[];
  timeBlocks: TimeBlock[];
  
  // UI State
  selectedView: 'today' | 'kanban' | 'projects' | 'calendar' | 'memory';
  sidebarOpen: boolean;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  setProjects: (projects: Project[]) => void;
  setTimeBlocks: (blocks: TimeBlock[]) => void;
  setSelectedView: (view: DashboardState['selectedView']) => void;
  toggleSidebar: () => void;
  
  // Task actions
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  
  // Computed
  getTodayTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getStats: () => DashboardStats;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  tasks: [],
  projects: [],
  timeBlocks: [],
  selectedView: 'today',
  sidebarOpen: true,
  
  setTasks: (tasks) => set({ tasks }),
  setProjects: (projects) => set({ projects }),
  setTimeBlocks: (timeBlocks) => set({ timeBlocks }),
  setSelectedView: (selectedView) => set({ selectedView }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  updateTaskStatus: (taskId, status) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status, updatedAt: new Date() } : t
      ),
    }));
  },
  
  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },
  
  getTodayTasks: () => {
    const today = new Date().toDateString();
    return get().tasks.filter(
      (t) => !t.dueDate || t.dueDate.toDateString() === today
    );
  },
  
  getOverdueTasks: () => {
    const now = new Date();
    return get().tasks.filter(
      (t) => t.dueDate && t.dueDate < now && t.status !== 'done'
    );
  },
  
  getStats: () => {
    const tasks = get().tasks;
    const completed = tasks.filter((t) => t.status === 'done').length;
    return {
      totalTasks: tasks.length,
      completedTasks: completed,
      focusHours: Math.floor(Math.random() * 20) + 10, // Placeholder
      deepWorkHours: Math.floor(Math.random() * 10) + 2, // Placeholder
    };
  },
}));
