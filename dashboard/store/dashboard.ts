import { create } from 'zustand';
import {
  Task,
  Project,
  Fact,
  GraphData,
  Milestone,
  DashboardStats,
  Priority,
  TaskStatus,
} from '@/types';

interface DashboardState {
  // Data
  tasks: Task[];
  projects: Project[];
  facts: Fact[];
  graph: GraphData | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // UI State
  selectedView: 'today' | 'kanban' | 'projects' | 'calendar' | 'memory' | 'quick';
  sidebarOpen: boolean;
  selectedProjectId: string | null;
  selectedTaskId: string | null;
  
  // Actions
  refreshData: () => Promise<void>;
  setSelectedView: (view: DashboardState['selectedView']) => void;
  toggleSidebar: () => void;
  selectProject: (id: string | null) => void;
  selectTask: (id: string | null) => void;
  
  // Task actions
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  assignTask: (taskId: string, agentId: string | null) => Promise<void>;
  updateTaskPriority: (taskId: string, priority: Priority) => Promise<void>;
  
  // Computed getters
  getOverdueTasks: () => Task[];
  getTodaysTasks: () => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByPriority: (priority: Priority) => Task[];
  getHighPriorityTasks: () => Task[];
  getUnassignedTasks: () => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getTasksByMilestone: (projectId: string, milestoneId: string) => Task[];
  getProjectById: (id: string) => Project | undefined;
  getTaskById: (id: string) => Task | undefined;
  getProjectProgress: (projectId: string) => {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    percentage: number;
  } | null;
  getMilestoneProgress: (milestone: Milestone) => {
    total: number;
    completed: number;
    percentage: number;
  };
  getStats: () => DashboardStats;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  tasks: [],
  projects: [],
  facts: [],
  graph: null,
  isLoading: true,
  error: null,
  selectedView: 'today',
  sidebarOpen: true,
  selectedProjectId: null,
  selectedTaskId: null,
  
  // Data loading
  refreshData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Failed to fetch data');
      
      const data = await res.json();
      set({
        tasks: data.tasks || [],
        projects: data.projects || [],
        facts: data.facts || [],
        graph: data.graph || null,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false,
      });
    }
  },
  
  // UI actions
  setSelectedView: (selectedView) => set({ selectedView }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  selectProject: (id) => set({ selectedProjectId: id }),
  selectTask: (id) => set({ selectedTaskId: id }),
  
  // Task actions - call API to update
  updateTaskStatus: async (taskId, status) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status }),
      });
      
      if (!res.ok) throw new Error('Failed to update task');
      
      const updated = await res.json();
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? updated : t
        ),
      }));
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  },
  
  assignTask: async (taskId, agentId) => {
    try {
      const res = await fetch('/api/tasks/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, agentId }),
      });
      
      if (!res.ok) throw new Error('Failed to assign task');
      
      const updated = await res.json();
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? updated : t
        ),
      }));
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  },
  
  updateTaskPriority: async (taskId, priority) => {
    try {
      const res = await fetch('/api/tasks/priority', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, priority }),
      });
      
      if (!res.ok) throw new Error('Failed to update priority');
      
      const updated = await res.json();
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? updated : t
        ),
      }));
    } catch (error) {
      console.error('Failed to update task priority:', error);
    }
  },
  
  // Computed getters
  getOverdueTasks: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().tasks.filter(t => 
      t.dueDate && t.dueDate < today && t.status !== 'done'
    );
  },
  
  getTodaysTasks: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().tasks.filter(t => t.dueDate === today);
  },
  
  getTasksByStatus: (status) => {
    return get().tasks.filter((t) => t.status === status);
  },
  
  getTasksByPriority: (priority) => {
    return get().tasks.filter((t) => t.priority === priority);
  },
  
  getHighPriorityTasks: () => {
    return get().tasks.filter((t) => t.priority === 'high' && t.status !== 'done');
  },
  
  getUnassignedTasks: () => {
    return get().tasks.filter((t) => !t.assignedTo && t.status !== 'done');
  },
  
  getTasksByProject: (projectId) => {
    return get().tasks.filter((t) => 
      t.projectRef === `projects/${projectId}`
    );
  },
  
  getTasksByMilestone: (projectId, milestoneId) => {
    return get().tasks.filter((t) => 
      t.projectRef === `projects/${projectId}` && 
      t.milestoneRef === milestoneId
    );
  },
  
  getProjectById: (id) => {
    return get().projects.find((p) => p.id === id);
  },
  
  getTaskById: (id) => {
    return get().tasks.find((t) => t.id === id);
  },
  
  getProjectProgress: (projectId) => {
    const projectTasks = get().tasks.filter(t => 
      t.projectRef === `projects/${projectId}`
    );
    const completed = projectTasks.filter(t => t.status === 'done').length;
    const inProgress = projectTasks.filter(t => t.status === 'in_progress').length;
    const todo = projectTasks.filter(t => t.status === 'todo').length;
    
    return {
      total: projectTasks.length,
      completed,
      inProgress,
      todo,
      percentage: projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0,
    };
  },
  
  getMilestoneProgress: (milestone) => {
    const milestoneTasks = get().tasks.filter(t => 
      milestone.tasks.includes(t.id)
    );
    const completed = milestoneTasks.filter(t => t.status === 'done').length;
    
    return {
      total: milestoneTasks.length,
      completed,
      percentage: milestoneTasks.length > 0 ? Math.round((completed / milestoneTasks.length) * 100) : 0,
    };
  },
  
  getStats: () => {
    const tasks = get().tasks;
    const projects = get().projects;
    const today = new Date().toISOString().split('T')[0];
    
    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
      todoTasks: tasks.filter(t => t.status === 'todo').length,
      highPriorityTasks: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
      overdueTasks: tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done').length,
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
    };
  },
}));

// Auto-load data on first use
let initialized = false;
export function initializeDashboard() {
  if (typeof window === 'undefined') return;
  if (!initialized) {
    initialized = true;
    useDashboardStore.getState().refreshData();
  }
}
