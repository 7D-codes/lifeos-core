'use server';

import fs from 'fs';
import path from 'path';
import {
  Task,
  Project,
  Fact,
  GraphData,
  Milestone,
} from '@/types';

const WORKSPACE_PATH = process.env.WORKSPACE_PATH || '/Users/mac/.openclaw/workspace';

// Helper: Safe JSON read
function readJSON<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error);
    return null;
  }
}

// Helper: Safe file list
function listFiles(dir: string, ext?: string): string[] {
  try {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    if (ext) {
      return files.filter(f => f.endsWith(ext));
    }
    return files;
  } catch {
    return [];
  }
}

function listDirs(dir: string): string[] {
  try {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
  } catch {
    return [];
  }
}

// ===== TASKS =====

export async function getAllTasks(): Promise<Task[]> {
  const tasksDir = path.join(WORKSPACE_PATH, 'tasks');
  const files = listFiles(tasksDir, '.json');
  
  const tasks: Task[] = [];
  for (const file of files) {
    const task = readJSON<Task>(path.join(tasksDir, file));
    if (task) tasks.push(task);
  }
  
  return tasks.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getTaskById(id: string): Promise<Task | null> {
  const taskPath = path.join(WORKSPACE_PATH, 'tasks', `${id}.json`);
  return readJSON<Task>(taskPath);
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const allTasks = await getAllTasks();
  return allTasks.filter(t => t.projectRef === `projects/${projectId}`);
}

export async function getTasksByMilestone(projectId: string, milestoneId: string): Promise<Task[]> {
  const allTasks = await getAllTasks();
  return allTasks.filter(t => 
    t.projectRef === `projects/${projectId}` && 
    t.milestoneRef === milestoneId
  );
}

export async function getOverdueTasks(): Promise<Task[]> {
  const allTasks = await getAllTasks();
  const today = new Date().toISOString().split('T')[0];
  return allTasks.filter(t => 
    t.dueDate && 
    t.dueDate < today && 
    t.status !== 'done'
  );
}

export async function getTasksDueToday(): Promise<Task[]> {
  const allTasks = await getAllTasks();
  const today = new Date().toISOString().split('T')[0];
  return allTasks.filter(t => t.dueDate === today);
}

// ===== PROJECTS =====

export async function getAllProjects(): Promise<Project[]> {
  const projectsDir = path.join(WORKSPACE_PATH, 'life', 'areas', 'projects');
  const projectDirs = listDirs(projectsDir);
  
  const projects: Project[] = [];
  for (const dir of projectDirs) {
    const project = await getProjectById(dir);
    if (project) projects.push(project);
  }
  
  return projects.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export async function getProjectById(id: string): Promise<Project | null> {
  const metaPath = path.join(WORKSPACE_PATH, 'life', 'areas', 'projects', id, 'meta.json');
  const meta = readJSON<Project>(metaPath);
  
  if (!meta) return null;
  
  const summaryPath = path.join(WORKSPACE_PATH, 'life', 'areas', 'projects', id, 'summary.md');
  let summary: string | undefined;
  try {
    if (fs.existsSync(summaryPath)) {
      summary = fs.readFileSync(summaryPath, 'utf-8');
    }
  } catch {}
  
  return {
    ...meta,
    path: path.join(WORKSPACE_PATH, 'life', 'areas', 'projects', id),
    summary,
  };
}

export async function getActiveProjects(): Promise<Project[]> {
  const allProjects = await getAllProjects();
  return allProjects.filter(p => p.status === 'active');
}

export async function getProjectProgress(project: Project): Promise<{
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  percentage: number;
}> {
  const tasks = await getTasksByProject(project.id);
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const total = tasks.length;
  
  return {
    total,
    completed,
    inProgress,
    todo,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export async function getMilestoneProgress(milestone: Milestone): Promise<{
  total: number;
  completed: number;
  percentage: number;
}> {
  const tasks = (await Promise.all(
    milestone.tasks.map(id => getTaskById(id))
  )).filter(Boolean) as Task[];
  
  const completed = tasks.filter(t => t.status === 'done').length;
  
  return {
    total: tasks.length,
    completed,
    percentage: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
  };
}

// ===== FACTS =====

export async function getAllFacts(): Promise<Fact[]> {
  const factsDir = path.join(WORKSPACE_PATH, 'memory', 'facts');
  const files = listFiles(factsDir, '.json');
  
  const facts: Fact[] = [];
  for (const file of files) {
    const fact = readJSON<Fact>(path.join(factsDir, file));
    if (fact) facts.push(fact);
  }
  
  return facts.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ===== GRAPH =====

export async function getGraphData(): Promise<GraphData | null> {
  const graphPath = path.join(WORKSPACE_PATH, '.openclaw', 'graph.json');
  return readJSON<GraphData>(graphPath);
}

// ===== STATS =====

export async function getDashboardStats(): Promise<{
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    blocked: number;
    highPriority: number;
    overdue: number;
  };
  projects: {
    total: number;
    active: number;
    archived: number;
    paused: number;
  };
  facts: {
    total: number;
    universal: number;
  };
}> {
  const tasks = await getAllTasks();
  const projects = await getAllProjects();
  const facts = await getAllFacts();
  const today = new Date().toISOString().split('T')[0];
  
  return {
    tasks: {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      todo: tasks.filter(t => t.status === 'todo').length,
      blocked: tasks.filter(t => t.status === 'blocked').length,
      highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
      overdue: tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done').length,
    },
    projects: {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      archived: projects.filter(p => p.status === 'archived').length,
      paused: projects.filter(p => p.status === 'paused').length,
    },
    facts: {
      total: facts.length,
      universal: facts.filter(f => f.universal).length,
    },
  };
}

// ===== WRITE OPERATIONS =====

export async function saveTask(task: Task): Promise<void> {
  'use server';
  const taskPath = path.join(WORKSPACE_PATH, 'tasks', `${task.id}.json`);
  task.updatedAt = new Date().toISOString();
  fs.writeFileSync(taskPath, JSON.stringify(task, null, 2));
}

export async function updateTaskStatus(taskId: string, status: Task['status']): Promise<Task | null> {
  'use server';
  const task = await getTaskById(taskId);
  if (!task) return null;
  
  task.status = status;
  task.updatedAt = new Date().toISOString();
  await saveTask(task);
  
  return task;
}

export async function assignTask(taskId: string, agentId: string | null): Promise<Task | null> {
  'use server';
  const task = await getTaskById(taskId);
  if (!task) return null;
  
  task.assignedTo = agentId;
  task.updatedAt = new Date().toISOString();
  await saveTask(task);
  
  return task;
}

export async function updateTaskPriority(taskId: string, priority: Task['priority']): Promise<Task | null> {
  'use server';
  const task = await getTaskById(taskId);
  if (!task) return null;
  
  task.priority = priority;
  task.updatedAt = new Date().toISOString();
  await saveTask(task);
  
  return task;
}

// Ensure workspace structure exists
export async function ensureWorkspaceStructure(): Promise<void> {
  const dirs = [
    path.join(WORKSPACE_PATH, 'tasks'),
    path.join(WORKSPACE_PATH, 'memory', 'daily'),
    path.join(WORKSPACE_PATH, 'memory', 'facts'),
    path.join(WORKSPACE_PATH, 'life', 'areas', 'projects'),
    path.join(WORKSPACE_PATH, '.openclaw'),
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
