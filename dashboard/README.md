# LifeOS Core Dashboard

Dashboard for the LifeOS Memory system. Reads structured JSON data from OpenClaw workspace and displays projects, milestones, tasks, and facts.

**Version:** 0.2.0 (LifeOS Memory v0.5.1 compatible)

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/7D-codes/lifeos-core
cd lifeos-core/dashboard

# Copy environment file
cp .env.example .env.local
# Edit .env.local to set your WORKSPACE_PATH

docker-compose up -d

# Open http://localhost:3000
```

### Option 2: Local Development

```bash
git clone https://github.com/7D-codes/lifeos-core
cd lifeos-core/dashboard

# Install dependencies
npm install

# Set environment
cp .env.example .env.local
# Edit .env.local

# Run dev server
npm run dev

# Open http://localhost:3000
```

---

## Configuration

Create `.env.local`:

```env
# Required: Path to OpenClaw workspace
WORKSPACE_PATH=/Users/mac/.openclaw/workspace

# Optional: Port (default 3000)
PORT=3000
```

**Linux/Mac:** `WORKSPACE_PATH=/home/user/.openclaw/workspace`  
**Windows:** `WORKSPACE_PATH=C:\Users\User\.openclaw\workspace`

---

## Prerequisites

**Required:** LifeOS Memory skill installed and workspace structure created.

```bash
# Install the skill
clawhub install lifeos-memory

# Create workspace structure (skill does this automatically)
# Or manually:
mkdir -p ~/.openclaw/workspace/{tasks,memory/daily,memory/facts,life/areas/projects,.openclaw}
```

---

## Workspace Structure

The dashboard expects this file structure:

```
~/.openclaw/workspace/
├── tasks/
│   └── {project}-{milestone}-{number}.json    # Task files
├── life/areas/projects/
│   └── {project-slug}/
│       ├── meta.json                           # Project metadata
│       └── summary.md                          # Project docs (optional)
├── memory/
│   ├── daily/YYYY-MM-DD.md                     # Daily notes
│   └── facts/{project}-{number}.json          # Extracted facts
└── .openclaw/
    └── graph.json                              # Graph data (optional)
```

---

## Creating Sample Data

### 1. Create a Project

Create `~/.openclaw/workspace/life/areas/projects/university-apps/meta.json`:

```json
{
  "id": "university-apps",
  "type": "project",
  "name": "University Applications 2026",
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
    }
  ],
  "links": {
    "tasks": ["university-apps-sat-1", "university-apps-sat-2"],
    "people": [],
    "projects": [],
    "facts": [],
    "agents": []
  },
  "createdAt": "2026-02-19T10:00:00Z",
  "updatedAt": "2026-02-19T10:00:00Z"
}
```

### 2. Create Tasks

Create `~/.openclaw/workspace/tasks/university-apps-sat-1.json`:

```json
{
  "id": "university-apps-sat-1",
  "title": "Research SAT test dates and registration deadlines",
  "simplePrompt": "Find SAT dates",
  "expandedPrompt": "Act as a research assistant specializing in educational testing...",
  "status": "in_progress",
  "priority": "high",
  "projectRef": "projects/university-apps",
  "milestoneRef": "sat",
  "assignedTo": "research-assistant",
  "linkedFacts": [],
  "linkedTasks": ["university-apps-sat-2"],
  "source": "daily/2026-02-19.md",
  "dueDate": "2026-02-21",
  "createdAt": "2026-02-19T10:00:00Z",
  "updatedAt": "2026-02-19T10:00:00Z"
}
```

Create `~/.openclaw/workspace/tasks/university-apps-sat-2.json`:

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
  "source": "daily/2026-02-19.md",
  "dueDate": "2026-02-25",
  "createdAt": "2026-02-19T10:00:00Z",
  "updatedAt": "2026-02-19T10:00:00Z"
}
```

### 3. Refresh Dashboard

The dashboard auto-refreshes on load. Click the refresh button or reload the page to see new data.

---

## Features

### Today View
- High priority tasks
- Tasks due today
- Overdue tasks
- Project overview
- Task status toggle (click the circle)

### Coming Soon
- **Kanban Board** — Drag & drop task management
- **Projects** — Full project & milestone view
- **Calendar** — Time blocking
- **Memory Search** — Search across facts & notes
- **Quick Capture** — Rapid task entry

---

## API Endpoints

```
GET  /api/data              → All data (tasks, projects, facts, stats)
PATCH /api/tasks            → Update task status/priority
```

---

## Development

```bash
# Add shadcn component
npx shadcn@latest add button

# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## Troubleshooting

### "No data showing"
- Check `WORKSPACE_PATH` in `.env.local` is correct
- Verify files exist in the workspace
- Check browser console for errors

### "Cannot find module 'fs'"
- This is expected during build — API routes use server-side code
- Build should still complete successfully

### "Failed to load data"
- Ensure workspace directories exist
- Check file permissions
- Verify JSON files are valid

---

## Data Types

See `DASHBOARD_REFERENCE.md` for complete:
- JSON schemas
- File structure
- Type definitions
- API examples

---

## Related

- **LifeOS Memory Skill:** https://clawhub.ai/skills/lifeos-memory
- **LifeOS Memory Docs:** `DASHBOARD_REFERENCE.md`

---

## Changelog

### v0.2.0 (2026-02-19)
- Updated for LifeOS Memory v0.5.1
- Reads JSON task files instead of markdown
- Supports milestones
- New data layer with proper types

### v0.1.0 (2026-02-18)
- Initial dashboard
- Today view with tasks
- Sidebar navigation
