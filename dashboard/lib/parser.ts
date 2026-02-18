import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Task, Project, ParsedDocument, TimeBlock } from '@/types';

const WORKSPACE_PATH = process.env.WORKSPACE_PATH || '/data';

export function parseMarkdown(filePath: string): ParsedDocument {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);
  
  const tasks = extractTasks(content, filePath);
  const events = extractEvents(content);
  const tags = extractTags(content);
  
  return {
    path: filePath,
    frontmatter,
    content,
    tasks,
    events,
    tags,
    modified: fs.statSync(filePath).mtime,
  };
}

function extractTasks(content: string, filePath: string): Task[] {
  const tasks: Task[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Match - [ ] or - [x] task patterns
    const match = line.match(/^- \[([ x])\] (.+)$/);
    if (match) {
      const isDone = match[1] === 'x';
      const title = match[2].trim();
      
      // Extract priority tags
      const priorityMatch = title.match(/#(urgent|high|medium|low)/);
      const priority = (priorityMatch?.[1] as Task['priority']) || 'medium';
      
      // Extract project tags
      const projectMatch = title.match(/#project\/([\w-]+)/);
      const projectId = projectMatch?.[1];
      
      // Extract date tags
      const dateMatch = title.match(/#due\/(\d{4}-\d{2}-\d{2})/);
      const dueDate = dateMatch ? new Date(dateMatch[1]) : undefined;
      
      tasks.push({
        id: `${path.basename(filePath)}-${index}`,
        title: title.replace(/#[\w\/]+/g, '').trim(),
        status: isDone ? 'done' : 'todo',
        priority,
        dueDate,
        projectId,
        tags: extractTags(title),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });
  
  return tasks;
}

function extractEvents(content: string): TimeBlock[] {
  const events: TimeBlock[] = [];
  // Match time blocks like "09:00-10:00 Meeting" or "## 09:00 Focus time"
  const timeRegex = /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s+(.+)/g;
  
  let match;
  while ((match = timeRegex.exec(content)) !== null) {
    const [, startHour, startMin, endHour, endMin, title] = match;
    
    events.push({
      id: `event-${match.index}`,
      title: title.trim(),
      startTime: new Date(2000, 0, 1, parseInt(startHour), parseInt(startMin)),
      endTime: new Date(2000, 0, 1, parseInt(endHour), parseInt(endMin)),
      type: inferBlockType(title),
    });
  }
  
  return events;
}

function extractTags(content: string): string[] {
  const tags: string[] = [];
  const tagRegex = /#([\w\/]+)/g;
  
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    tags.push(match[1]);
  }
  
  return [...new Set(tags)];
}

function inferBlockType(title: string): TimeBlock['type'] {
  const lower = title.toLowerCase();
  if (lower.includes('meeting') || lower.includes('call') || lower.includes('sync')) {
    return 'meeting';
  }
  if (lower.includes('focus') || lower.includes('deep') || lower.includes('work')) {
    return 'deep_work';
  }
  if (lower.includes('break') || lower.includes('lunch')) {
    return 'break';
  }
  if (lower.includes('admin') || lower.includes('email')) {
    return 'admin';
  }
  return 'personal';
}

export function getDailyNotes(): ParsedDocument[] {
  const dailyPath = path.join(WORKSPACE_PATH, 'memory', 'daily');
  
  if (!fs.existsSync(dailyPath)) {
    return [];
  }
  
  const files = fs.readdirSync(dailyPath)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(dailyPath, f));
  
  return files.map(parseMarkdown);
}

export function getProjects(): Project[] {
  const projectsPath = path.join(WORKSPACE_PATH, 'life', 'areas', 'projects');
  
  if (!fs.existsSync(projectsPath)) {
    return [];
  }
  
  return fs.readdirSync(projectsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => {
      const projectPath = path.join(projectsPath, dirent.name);
      const summaryPath = path.join(projectPath, 'summary.md');
      
      let progress = 0;
      let taskCount = { total: 0, completed: 0 };
      
      if (fs.existsSync(summaryPath)) {
        const doc = parseMarkdown(summaryPath);
        progress = doc.frontmatter.progress as number || 0;
        taskCount = {
          total: doc.tasks.length,
          completed: doc.tasks.filter(t => t.status === 'done').length,
        };
      }
      
      return {
        id: dirent.name,
        name: dirent.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        status: 'active',
        progress,
        taskCount,
        path: projectPath,
      };
    });
}

export function getAllTasks(): Task[] {
  const notes = getDailyNotes();
  return notes.flatMap(note => note.tasks);
}

export function getTodayTasks(): Task[] {
  const today = new Date().toISOString().split('T')[0];
  const todayPath = path.join(WORKSPACE_PATH, 'memory', 'daily', `${today}.md`);
  
  if (!fs.existsSync(todayPath)) {
    return [];
  }
  
  const doc = parseMarkdown(todayPath);
  return doc.tasks;
}
