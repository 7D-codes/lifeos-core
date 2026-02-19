export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type Priority = 'high' | 'medium' | 'low';
export type ProjectStatus = 'active' | 'archived' | 'paused';

export interface Milestone {
  id: string;
  name: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: Priority;
  dueDate?: string;
  tasks: string[];
}

export interface Project {
  id: string;
  type: 'project';
  name: string;
  status: ProjectStatus;
  priority: Priority;
  tags: string[];
  milestones: Milestone[];
  links: {
    tasks: string[];
    people: string[];
    projects: string[];
    facts: string[];
    agents: string[];
  };
  createdAt: string;
  updatedAt: string;
  path: string;
  summary?: string;
}

export interface Task {
  id: string;
  title: string;
  simplePrompt: string;
  expandedPrompt: string;
  status: TaskStatus;
  priority: Priority;
  projectRef: string;
  milestoneRef: string | null;
  assignedTo: string | null;
  linkedFacts: string[];
  linkedTasks: string[];
  source: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Fact {
  id: string;
  type: 'preference' | 'workflow' | 'constraint' | 'relationship' | 'fact';
  content: string;
  tags: string[];
  entityRef: string | null;
  projectRef: string | null;
  source: string;
  universal: boolean;
  confidence: number;
  createdAt: string;
}

export interface GraphNode {
  id: string;
  type: 'project' | 'milestone' | 'task' | 'agent' | 'person' | 'fact' | 'area';
  label: string;
  status?: string;
  priority?: Priority;
  archived?: boolean;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: 'part_of' | 'belongs_to' | 'assigned_to' | 'depends_on' | 'references';
}

export interface GraphData {
  schemaVersion: string;
  generatedAt: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface DailyNote {
  date: string;
  content: string;
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

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
  totalProjects: number;
  activeProjects: number;
}

// Legacy types for backwards compatibility
export interface ParsedDocument {
  path: string;
  frontmatter: Record<string, unknown>;
  content: string;
  tasks: LegacyTask[];
  events: TimeBlock[];
  tags: string[];
  modified: Date;
}

export interface LegacyTask {
  id: string;
  title: string;
  status: 'todo' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  projectId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
