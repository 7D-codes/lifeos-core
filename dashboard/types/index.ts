export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  projectId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'completed';
  progress: number;
  taskCount: {
    total: number;
    completed: number;
  };
  path: string;
}

export interface TimeBlock {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'deep_work' | 'meeting' | 'admin' | 'break' | 'personal';
  taskId?: string;
}

export interface DailyNote {
  date: Date;
  path: string;
  tasks: Task[];
  events: TimeBlock[];
  content: string;
}

export interface ParsedDocument {
  path: string;
  frontmatter: Record<string, unknown>;
  content: string;
  tasks: Task[];
  events: TimeBlock[];
  tags: string[];
  modified: Date;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  focusHours: number;
  deepWorkHours: number;
}
