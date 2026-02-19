# LifeOS Memory System — Dashboard Developer Reference

Complete documentation for building dashboards that read LifeOS Memory data.

---

## Quick Overview

LifeOS Memory creates structured, linked data that any dashboard can read:
- **Projects** with milestones
- **Tasks** with full metadata and expanded prompts
- **Facts** extracted from daily notes
- **Graph** data for visualization
- **Obsidian-compatible** wiki-links

---

## File Structure Reference

```
~/.openclaw/workspace/
├── memory/
│   ├── daily/YYYY-MM-DD.md              # Human daily notes
│   └── facts/{project-slug}-{number}.json # Universal facts
├── life/
│   └── areas/
│       ├── projects/{slug}/
│       │   ├── summary.md               # Project docs (markdown)
│       │   ├── meta.json                # Project metadata
│       │   └── milestones/              # Optional milestone docs
│       │       └── {milestone-slug}.md
│       ├── people/{slug}/
│       │   ├── summary.md
│       │   └── meta.json
│       └── areas/{slug}/
│           ├── summary.md
│           └── meta.json
├── tasks/{project-slug}-{milestone}-{number}.json  # Task files
└── .openclaw/
    ├── graph.json                       # Graph visualization data
    └── memory-index.json                # Schema version
```

---

## Reading Data (Dashboard API)

### Get All Projects

```javascript
// Read all project meta.json files
const projects = await Promise.all(
  glob('life/areas/projects/*/meta.json').map(async (path) => {
    const content = await fs.readFile(path, 'utf-8');
    return JSON.parse(content);
  })
);

// Returns array of project objects
```

### Get All Tasks

```javascript
// Read all task JSON files
const tasks = await Promise.all(
  glob('tasks/*.json').map(async (path) => {
    const content = await fs.readFile(path, 'utf-8');
    return JSON.parse(content);
  })
);

// Returns array of task objects
```

### Get Graph Data

```javascript
// Read graph.json for visualization
const graph = await fs.readFile('.openclaw/graph.json', 'utf-8');
const { nodes, edges } = JSON.parse(graph);

// nodes: Array of entities with positions
// edges: Array of connections
```

### Get Daily Notes (Display Only)

```javascript
// Read daily notes for display (not structured data)
const dailyNotes = await Promise.all(
  glob('memory/daily/*.md').map(async (path) => {
    const content = await fs.readFile(path, 'utf-8');
    return {
      date: path.basename(path, '.md'),
      content
    };
  })
);
```

---

## JSON Schemas (Complete)

### Project Meta (`life/areas/projects/{slug}/meta.json`)

```json
{
  "id": "university-apps",
  "type": "project",
  "name": "University Applications 2026",
  "createdAt": "2026-02-19T10:00:00Z",
  "updatedAt": "2026-02-19T10:00:00Z",
  "status": "active",
  "priority": "high",
  "tags": ["education", "2026"],
  "milestones": [
    {
      "id": "sat",
      "name": "SAT Preparation",
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2026-03-01",
      "tasks": ["university-apps-sat-1", "university-apps-sat-2"]
    },
    {
      "id": "essays",
      "name": "Essays",
      "status": "todo",
      "priority": "medium",
      "dueDate": "2026-04-15",
      "tasks": []
    }
  ],
  "links": {
    "tasks": ["university-apps-sat-1", "university-apps-sat-2"],
    "people": ["mohammed"],
    "projects": [],
    "facts": ["university-apps-1"],
    "agents": ["research-assistant"]
  }
}
```

**Fields:**
- `id` (string, kebab-case): Project slug
- `type` (string): Always "project"
- `name` (string): Display name
- `createdAt` (ISO8601): When created
- `updatedAt` (ISO8601): Last modified
- `status` (enum): "active", "archived", "paused"
- `priority` (enum): "high", "medium", "low"
- `tags` (array): String tags
- `milestones` (array): Milestone objects
  - `id` (string): Milestone slug
  - `name` (string): Display name
  - `status` (enum): "todo", "in_progress", "done"
  - `priority` (enum): "high", "medium", "low"
  - `dueDate` (YYYY-MM-DD): Optional deadline
  - `tasks` (array): Task IDs in this milestone
- `links` (object): Cross-references
  - `tasks`: Array of task IDs
  - `people`: Array of person slugs
  - `projects`: Array of related project slugs
  - `facts`: Array of fact IDs
  - `agents`: Array of agent IDs

---

### Task (`tasks/{project-slug}-{milestone}-{number}.json`)

```json
{
  "id": "university-apps-sat-1",
  "title": "Research SAT test dates and registration deadlines",
  "simplePrompt": "Find SAT dates",
  "expandedPrompt": "Act as a research assistant specializing in educational testing...\n\n**Context:**\n- User applying to Stanford (requires SAT)\n- Located in Saudi Arabia\n- Current date: February 2026\n\n**Task:**\nFind all SAT test dates for 2026...\n\n**Output Format:**\nMarkdown table with: Test Date, Registration Deadline...\n\n**Constraints:**\n- Use official College Board data\n- Highlight recommended date",
  "status": "in_progress",
  "priority": "high",
  "projectRef": "projects/university-apps",
  "milestoneRef": "sat",
  "assignedTo": "research-assistant",
  "linkedFacts": ["university-apps-1"],
  "linkedTasks": ["university-apps-sat-2"],
  "source": "daily/2026-02-19.md",
  "dueDate": "2026-02-21",
  "createdAt": "2026-02-19T10:00:00Z",
  "updatedAt": "2026-02-19T10:00:00Z"
}
```

**Fields:**
- `id` (string): `{project}-{milestone}-{number}` or `{project}-{number}`
- `title` (string): Display title
- `simplePrompt` (string): Original user request
- `expandedPrompt` (string): Detailed agent instructions
- `status` (enum): "todo", "in_progress", "done", "blocked"
- `priority` (enum): "high", "medium", "low"
- `projectRef` (string): "projects/{slug}"
- `milestoneRef` (string|null): Milestone slug or null
- `assignedTo` (string|null): Agent ID or null
- `linkedFacts` (array): Related fact IDs
- `linkedTasks` (array): Related task IDs (dependencies/next steps)
- `source` (string): Where task originated (daily note path)
- `dueDate` (YYYY-MM-DD|null): Optional deadline
- `createdAt` (ISO8601): When created
- `updatedAt` (ISO8601): Last modified

---

### Fact (`memory/facts/{project-slug}-{number}.json`)

```json
{
  "id": "university-apps-1",
  "type": "preference",
  "content": "User prefers Vercel for all hosting",
  "tags": ["hosting", "vercel", "preference"],
  "entityRef": "people/mohammed",
  "projectRef": "projects/university-apps",
  "source": "daily/2026-02-19.md",
  "universal": true,
  "confidence": 0.9,
  "createdAt": "2026-02-19T10:00:00Z"
}
```

**Fields:**
- `id` (string): `{project}-{number}`
- `type` (enum): "fact", "preference", "workflow", "constraint", "relationship"
- `content` (string): The fact text
- `tags` (array): String tags
- `entityRef` (string|null): Person slug (e.g., "people/mohammed")
- `projectRef` (string|null): Project slug (e.g., "projects/university-apps")
- `source` (string): Daily note where found
- `universal` (boolean): True if applies broadly
- `confidence` (0.0-1.0): Certainty level
- `createdAt` (ISO8601): When extracted

---

### Graph (`/.openclaw/graph.json`)

```json
{
  "schemaVersion": "1.0",
  "generatedAt": "2026-02-19T12:00:00Z",
  "nodes": [
    {
      "id": "projects/university-apps",
      "type": "project",
      "label": "University Applications",
      "status": "active",
      "priority": "high",
      "archived": false,
      "x": 100,
      "y": 100
    },
    {
      "id": "university-apps-sat",
      "type": "milestone",
      "label": "SAT Preparation",
      "status": "in_progress",
      "priority": "high",
      "x": 200,
      "y": 200
    },
    {
      "id": "university-apps-sat-1",
      "type": "task",
      "label": "Research SAT dates",
      "status": "in_progress",
      "priority": "high",
      "x": 300,
      "y": 200
    },
    {
      "id": "agents/research-assistant",
      "type": "agent",
      "label": "Research Assistant",
      "x": 400,
      "y": 150
    },
    {
      "id": "people/mohammed",
      "type": "person",
      "label": "Mohammed",
      "x": 100,
      "y": 300
    }
  ],
  "edges": [
    {
      "from": "university-apps-sat",
      "to": "projects/university-apps",
      "type": "part_of"
    },
    {
      "from": "university-apps-sat-1",
      "to": "university-apps-sat",
      "type": "belongs_to"
    },
    {
      "from": "university-apps-sat-1",
      "to": "agents/research-assistant",
      "type": "assigned_to"
    },
    {
      "from": "university-apps-sat-1",
      "to": "university-apps-sat-2",
      "type": "depends_on"
    }
  ]
}
```

**Node Types:**
- `project` — Blue
- `milestone` — Light blue
- `task` — Green (todo), Yellow (in_progress), Gray (done), Red (blocked)
- `agent` — Purple
- `person` — Orange
- `fact` — Gray
- `area` — Yellow

**Edge Types:**
- `part_of` — Milestone → Project
- `belongs_to` — Task → Milestone or Task → Project
- `assigned_to` — Task → Agent
- `depends_on` — Task → Task
- `references` — Any wiki-link connection

---

## Dashboard Views

### 1. Project List View

**Data needed:** All project meta.json files

**Display:**
- Project name + priority badge
- Status indicator (active/archived/paused)
- Milestone count + completed count
- Task count + completion percentage
- Tags
- Due date (if any milestone has one)

**Example:**
```
University Applications 2026          [HIGH]
[Active] 2 milestones • 5 tasks • 40% complete
Due: March 1, 2026
Tags: education, 2026
```

---

### 2. Project Detail View

**Data needed:** Project meta.json + related tasks + graph data

**Display:**
- Project header (name, status, priority)
- Summary markdown (rendered)
- Milestones as columns or timeline
- Tasks grouped by milestone
- Assigned agents
- Related facts
- Graph visualization (mini)

**Milestone Card:**
```
SAT Preparation                    [HIGH]
Status: In Progress
Due: March 1, 2026
Tasks: 2 total, 1 done
├── [✓] Research SAT dates
└── [ ] Book test
```

---

### 3. Task List View

**Data needed:** All task JSONs

**Filters:**
- Status (todo, in_progress, done, blocked)
- Priority (high, medium, low)
- Project
- Assigned agent
- Due date range

**Columns:**
- Status icon
- Title
- Project (badge)
- Milestone
- Assigned to
- Priority
- Due date

**Example:**
```
[○] Research SAT dates                    university-apps/sat   [Research Assistant]  HIGH  Feb 21
[○] Book test                             university-apps/sat   [Unassigned]          HIGH  Feb 22
[○] Draft personal statement              university-apps/essays [Unassigned]         MED   Mar 15
```

---

### 4. Task Detail View

**Data needed:** Task JSON + related data

**Display:**
- Title + status + priority
- Project link (clickable)
- Milestone link (if set)
- Assigned agent (with change button)
- Due date
- Simple prompt (collapsed)
- Expanded prompt (full, for reference)
- Linked tasks (dependencies)
- Linked facts
- Source (link to daily note)

**Actions:**
- Change status
- Assign to agent
- Set due date
- Edit (link to edit mode)

---

### 5. Graph Visualization View

**Data needed:** graph.json

**Libraries:**
- `react-force-graph` (3D/2D force-directed)
- `cytoscape.js` (stable layouts)
- `vis-network` (simple)

**Features:**
- Zoom/pan
- Click node to open detail
- Drag to rearrange
- Color by type
- Filter by type (show/hide agents, facts, etc.)
- Search highlighting

**Example react-force-graph:**
```jsx
import { ForceGraph2D } from 'react-force-graph';

<ForceGraph2D
  graphData={graphData}
  nodeAutoColorBy="type"
  nodeLabel="label"
  linkDirectionalArrowLength={6}
  onNodeClick={handleNodeClick}
  nodeCanvasObject={(node, ctx, globalScale) => {
    // Custom rendering based on type
    const size = node.type === 'project' ? 8 : 5;
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = getColorForType(node.type);
    ctx.fill();
  }}
/>
```

---

### 6. Daily Notes View

**Data needed:** memory/daily/*.md files

**Display:**
- Calendar or list view
- Rendered markdown
- Clickable wiki-links (convert to router links)
- Extracted tasks highlighted
- Facts highlighted

**Wiki-link handling:**
```javascript
// Convert [[target|Display]] or [[target]] to links
const renderWikiLink = (match, target, display) => {
  const [project, milestone, task] = target.split('-');
  // Determine type from pattern
  if (task || (milestone && !isNaN(milestone))) {
    return `<a href="/tasks/${target}">${display || target}</a>`;
  } else if (milestone) {
    return `<a href="/projects/${project}#${milestone}">${display || target}</a>`;
  } else {
    return `<a href="/projects/${target}">${display || target}</a>`;
  }
};
```

---

## Writing Data (Dashboard Actions)

### Update Task Status

```javascript
// Read → Modify → Write
const taskPath = `tasks/${taskId}.json`;
const task = JSON.parse(await fs.readFile(taskPath, 'utf-8'));

task.status = 'in_progress'; // or 'done', 'blocked', 'todo'
task.updatedAt = new Date().toISOString();

await fs.writeFile(taskPath, JSON.stringify(task, null, 2));

// Regenerate graph
await regenerateGraph();
```

### Assign Task to Agent

```javascript
const taskPath = `tasks/${taskId}.json`;
const task = JSON.parse(await fs.readFile(taskPath, 'utf-8'));

task.assignedTo = 'uiux-craftsman';
task.updatedAt = new Date().toISOString();

await fs.writeFile(taskPath, JSON.stringify(task, null, 2));
await regenerateGraph();
```

### Create New Task (via Dashboard)

```javascript
// Generate ID
const projectSlug = 'university-apps';
const milestoneSlug = 'sat';
const nextNumber = await getNextTaskNumber(projectSlug, milestoneSlug);
const taskId = `${projectSlug}-${milestoneSlug}-${nextNumber}`;

// Create task object
const newTask = {
  id: taskId,
  title: 'New task title',
  simplePrompt: 'Simple description',
  expandedPrompt: 'Detailed agent instructions...',
  status: 'todo',
  priority: 'medium',
  projectRef: `projects/${projectSlug}`,
  milestoneRef: milestoneSlug,
  assignedTo: null,
  linkedFacts: [],
  linkedTasks: [],
  source: 'dashboard',
  dueDate: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Write file
await fs.writeFile(
  `tasks/${taskId}.json`,
  JSON.stringify(newTask, null, 2)
);

// Update project meta
const projectMeta = JSON.parse(
  await fs.readFile(`life/areas/projects/${projectSlug}/meta.json`, 'utf-8')
);
const milestone = projectMeta.milestones.find(m => m.id === milestoneSlug);
if (milestone) {
  milestone.tasks.push(taskId);
}
projectMeta.links.tasks.push(taskId);
projectMeta.updatedAt = new Date().toISOString();

await fs.writeFile(
  `life/areas/projects/${projectSlug}/meta.json`,
  JSON.stringify(projectMeta, null, 2)
);

// Regenerate graph
await regenerateGraph();
```

### Regenerate Graph

```javascript
const regenerateGraph = async () => {
  const projects = await loadProjects();
  const tasks = await loadTasks();
  const facts = await loadFacts();
  
  const nodes = [];
  const edges = [];
  
  // Add project nodes
  projects.forEach((project, i) => {
    nodes.push({
      id: `projects/${project.id}`,
      type: 'project',
      label: project.name,
      status: project.status,
      priority: project.priority,
      archived: project.status === 'archived',
      x: 100 + (i * 150),
      y: 100
    });
    
    // Add milestone nodes
    project.milestones.forEach((milestone, j) => {
      nodes.push({
        id: `${project.id}-${milestone.id}`,
        type: 'milestone',
        label: milestone.name,
        status: milestone.status,
        priority: milestone.priority,
        x: 100 + (i * 150),
        y: 200 + (j * 100)
      });
      
      edges.push({
        from: `${project.id}-${milestone.id}`,
        to: `projects/${project.id}`,
        type: 'part_of'
      });
    });
  });
  
  // Add task nodes and edges
  tasks.forEach((task, i) => {
    nodes.push({
      id: task.id,
      type: 'task',
      label: task.title,
      status: task.status,
      priority: task.priority,
      x: 300 + (i * 50),
      y: 300 + (i * 30)
    });
    
    // Link to milestone or project
    if (task.milestoneRef) {
      edges.push({
        from: task.id,
        to: `${task.projectRef.replace('projects/', '')}-${task.milestoneRef}`,
        type: 'belongs_to'
      });
    } else {
      edges.push({
        from: task.id,
        to: task.projectRef,
        type: 'belongs_to'
      });
    }
    
    // Link to agent
    if (task.assignedTo) {
      edges.push({
        from: task.id,
        to: `agents/${task.assignedTo}`,
        type: 'assigned_to'
      });
    }
    
    // Link to dependencies
    task.linkedTasks.forEach(linkedId => {
      edges.push({
        from: task.id,
        to: linkedId,
        type: 'depends_on'
      });
    });
  });
  
  // Write graph
  const graph = {
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    nodes,
    edges
  };
  
  await fs.writeFile('.openclaw/graph.json', JSON.stringify(graph, null, 2));
};
```

---

## API Routes (Suggested)

```
GET  /api/projects           → List all projects
GET  /api/projects/:id       → Get project + milestones + tasks
GET  /api/tasks              → List all tasks (with filters)
GET  /api/tasks/:id          → Get task detail
POST /api/tasks              → Create new task
PATCH /api/tasks/:id         → Update task (status, assignee, etc.)
GET  /api/graph              → Get graph data
GET  /api/daily              → List daily notes
GET  /api/daily/:date        → Get specific daily note
GET  /api/agents             → List available agents
GET  /api/facts              → List extracted facts
```

---

## Real-World Example: Complete Project

**Project:** University Applications  
**Milestones:** SAT Preparation, Essays, Recommendations

### File Structure

```
life/areas/projects/university-apps/
├── summary.md
├── meta.json
└── milestones/
    ├── sat.md
    ├── essays.md
    └── recommendations.md

tasks/
├── university-apps-sat-1.json
├── university-apps-sat-2.json
├── university-apps-essays-1.json
└── university-apps-essays-2.json

memory/facts/
└── university-apps-1.json
```

### Project Meta

```json
{
  "id": "university-apps",
  "type": "project",
  "name": "University Applications 2026",
  "createdAt": "2026-02-19T10:00:00Z",
  "updatedAt": "2026-02-19T10:00:00Z",
  "status": "active",
  "priority": "high",
  "tags": ["education", "2026"],
  "milestones": [
    {
      "id": "sat",
      "name": "SAT Preparation",
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2026-03-01",
      "tasks": ["university-apps-sat-1", "university-apps-sat-2"]
    },
    {
      "id": "essays",
      "name": "Essays",
      "status": "todo",
      "priority": "medium",
      "dueDate": "2026-04-15",
      "tasks": ["university-apps-essays-1", "university-apps-essays-2"]
    }
  ],
  "links": {
    "tasks": ["university-apps-sat-1", "university-apps-sat-2", "university-apps-essays-1", "university-apps-essays-2"],
    "people": ["mohammed"],
    "facts": ["university-apps-1"],
    "agents": []
  }
}
```

### Tasks

**university-apps-sat-1.json:**
```json
{
  "id": "university-apps-sat-1",
  "title": "Research SAT test dates and registration deadlines",
  "simplePrompt": "Find SAT dates",
  "expandedPrompt": "Act as a research assistant...",
  "status": "in_progress",
  "priority": "high",
  "projectRef": "projects/university-apps",
  "milestoneRef": "sat",
  "assignedTo": "research-assistant",
  "linkedFacts": ["university-apps-1"],
  "linkedTasks": ["university-apps-sat-2"],
  "dueDate": "2026-02-21",
  "createdAt": "2026-02-19T10:00:00Z",
  "updatedAt": "2026-02-19T10:00:00Z"
}
```

**university-apps-sat-2.json:**
```json
{
  "id": "university-apps-sat-2",
  "title": "Book SAT test for May or June",
  "simplePrompt": "Book the SAT",
  "expandedPrompt": "Act as a registration specialist...",
  "status": "todo",
  "priority": "high",
  "projectRef": "projects/university-apps",
  "milestoneRef": "sat",
  "assignedTo": null,
  "linkedFacts": [],
  "linkedTasks": [],
  "dueDate": "2026-02-25",
  "createdAt": "2026-02-19T10:00:00Z",
  "updatedAt": "2026-02-19T10:00:00Z"
}
```

### Graph Visualization

```
[University Applications] ──► [SAT Preparation] ──► [Research dates] ──► [Book test]
        │                              │
        │                         [Essays]
        │                              │
        ▼                              ▼
   [mohammed]                    [Draft essay]
```

---

## Common Patterns

### Getting Project Progress

```javascript
const getProjectProgress = (project) => {
  const totalTasks = project.milestones.reduce(
    (sum, m) => sum + m.tasks.length, 0
  );
  
  const completedTasks = tasks.filter(t => 
    project.links.tasks.includes(t.id) && t.status === 'done'
  ).length;
  
  return {
    total: totalTasks,
    completed: completedTasks,
    percentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  };
};
```

### Getting Upcoming Deadlines

```javascript
const getUpcomingDeadlines = (tasks, days = 7) => {
  const now = new Date();
  const cutoff = new Date(now + days * 24 * 60 * 60 * 1000);
  
  return tasks
    .filter(t => t.dueDate && t.status !== 'done')
    .filter(t => new Date(t.dueDate) <= cutoff)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};
```

### Filtering by Agent Workload

```javascript
const getAgentWorkload = (agentId, tasks) => {
  return tasks.filter(t => 
    t.assignedTo === agentId && 
    t.status !== 'done'
  );
};
```

---

## Error Handling

### Corrupted JSON

```javascript
const safeReadJSON = async (path) => {
  try {
    const content = await fs.readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Failed to read ${path}:`, err);
    return null; // Skip this file
  }
};
```

### Missing References

```javascript
const validateTask = (task, projects) => {
  const projectExists = projects.some(p => 
    `projects/${p.id}` === task.projectRef
  );
  
  if (!projectExists) {
    console.warn(`Task ${task.id} has invalid projectRef: ${task.projectRef}`);
  }
  
  return projectExists;
};
```

---

## Performance Tips

1. **Cache project list** — Doesn't change often
2. **Lazy load task details** — Only when opening task view
3. **Incremental graph updates** — Only regenerate changed nodes
4. **Virtual scroll** — For long task lists
5. **Debounced writes** — When editing fields rapidly

---

## Version

This reference documents **LifeOS Memory v0.5.1**

For updates: `clawhub update lifeos-memory`
