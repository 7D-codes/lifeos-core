# LifeOS Core — Product Requirements Document

**Version:** 0.1.0  
**Status:** In Development  
**License:** MIT  
**Philosophy:** Organize with consent, respect existing workflows

---

## 1. Vision

LifeOS Core is an **open-source AI life organization system** that works with any OpenClaw setup. It doesn't impose structure — it discovers, suggests, and organizes with explicit user consent.

### Key Differentiators

| Feature | LifeOS Core | Other Tools |
|---------|-------------|-------------|
| **Consent** | Asks before every change | Auto-organizes |
| **Flexibility** | Works with any structure | Requires specific setup |
| **Non-destructive** | Metadata layer, files stay put | Moves/renames files |
| **Open Source** | MIT licensed, community driven | Proprietary |
| **Local First** | Runs on your machine | Cloud required |

---

## 2. Architecture

```
┌─────────────────────────────────────────┐
│           User's OpenClaw               │
│  ┌─────────────────────────────────┐    │
│  │      LifeOS Core Skill          │    │
│  │  ┌─────────┐  ┌──────────────┐  │    │
│  │  │ Analyze │  │   Organize   │  │    │
│  │  │ (read)  │  │ (consent-based)│  │    │
│  │  └────┬────┘  └──────┬───────┘  │    │
│  │       └──────────────┘           │    │
│  │              │                   │    │
│  │       ┌──────▼──────┐            │    │
│  │       │   Metadata  │            │    │
│  │       │   Layer     │            │    │
│  │       └──────┬──────┘            │    │
│  └──────────────┼───────────────────┘    │
│                 │                        │
│  ┌──────────────▼───────────────────┐    │
│  │      Dashboard (Optional)        │    │
│  │   Reads metadata, displays UI    │    │
│  └──────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## 3. Components

### 3.1 Skill (`skill/`)

**Purpose:** Core functionality that integrates with OpenClaw

**Scripts:**
- `analyze.sh` — Scans workspace, generates report
- `organize.sh` — Suggests and applies organization (with consent)
- `dashboard.sh` — Starts local dashboard
- `status.sh` — Shows current organization state

**Key Behaviors:**
- Dry-run by default
- Requires explicit `--apply` for changes
- Creates backups before modifications
- Logs all changes with rollback capability

### 3.2 Dashboard (`dashboard/`)

**Purpose:** Visual interface for organization

**Views:**
- **Kanban** — Project boards from metadata
- **To-Do** — Tasks from daily notes + reminders
- **Projects** — Active projects with status
- **Memory** — Searchable knowledge graph
- **Files** — Browse with smart filtering

**Key Behaviors:**
- Reads from `.lifeos/metadata.json` files
- Never modifies source files directly
- Works offline (local-first)
- Optional WebSocket bridge to running OpenClaw

### 3.3 Bridge (`bridge/`)

**Purpose:** WebSocket bridge for dashboard-to-OpenClaw communication

**Use Cases:**
- Real-time chat with your OpenClaw through dashboard
- Send commands from dashboard UI
- Receive notifications/status updates

---

## 4. User Flows

### 4.1 First-Time Setup

```
1. User installs skill: openclaw skills install lifeos-core
2. User runs: lifeos analyze
3. Sees report of current workspace state
4. User runs: lifeos organize --apply
5. Skill asks for consent on each change
6. Workspace is gradually organized
```

### 4.2 Daily Use

```
1. User runs: lifeos dashboard
2. Dashboard opens in browser
3. User sees kanban, todos, projects
4. User adds tasks, updates projects
5. Changes sync back to metadata/files
```

### 4.3 Discovery Mode

```
1. User drops random files into workspace
2. User runs: lifeos analyze --verbose
3. Skill finds unorganized files
4. Suggests categorization
5. User approves/rejects each suggestion
```

---

## 5. Data Model

### 5.1 Metadata Files (`.lifeos/`)

```json
// .lifeos/metadata.json
{
  "version": "0.1.0",
  "created": "2026-02-18T19:00:00Z",
  "project": {
    "id": "project-001",
    "name": "LifeOS Core",
    "status": "active",
    "path": "~/Projects/lifeos-core"
  },
  "tags": ["open-source", "ai", "organization"],
  "relationships": [
    { "type": "depends_on", "target": "openclaw" },
    { "type": "related_to", "target": "lifeos-dashboard" }
  ]
}
```

### 5.2 Change Log (`.lifeos/changes.log`)

```
2026-02-18T19:00:00Z [1708278000] CREATE_DIR: memory/daily/
2026-02-18T19:00:01Z [1708278000] CREATE_FILE: SOUL.md
2026-02-18T19:00:02Z [1708278000] CREATE_FILE: AGENTS.md
```

### 5.3 Analysis Report (`.lifeos/analysis-report.json`)

```json
{
  "analysisDate": "2026-02-18T19:00:00Z",
  "workspacePath": "/Users/mac/.openclaw/workspace",
  "summary": {
    "totalFiles": 1247,
    "markdownFiles": 342,
    "dailyNotes": 45,
    "projects": 12,
    "orphanedFiles": 23
  },
  "findings": [...],
  "recommendations": [...]
}
```

---

## 6. Safety & Consent

### 6.1 Consent Levels

| Level | Behavior |
|-------|----------|
| **Dry Run** (default) | Preview only, no changes |
| **Ask Each** (`--apply`) | Confirm every change individually |
| **Batch** (`--apply --force`) | Apply all after single confirmation |

### 6.2 Backup Strategy

- Backup created before any `--apply` run
- Backups stored in `.lifeos/backups/<timestamp>/`
- Rollback: `lifeos rollback <timestamp>`

### 6.3 Change Logging

- Every change logged to `.lifeos/changes.log`
- Timestamp + change ID for grouping
- Action type + target for clarity

---

## 7. Implementation Phases

### Phase 1: Core Skill (Week 1)
- [ ] `analyze.sh` — Workspace scanning
- [ ] `organize.sh` — Consent-based organization
- [ ] `status.sh` — Current state display
- [ ] Basic metadata generation

### Phase 2: Dashboard MVP (Week 2)
- [ ] Next.js dashboard scaffold
- [ ] Read metadata files
- [ ] Kanban view
- [ ] Project list view

### Phase 3: Integration (Week 3)
- [ ] WebSocket bridge
- [ ] Chat integration
- [ ] Real-time updates
- [ ] Memory search

### Phase 4: Polish (Week 4)
- [ ] Documentation
- [ ] Tests
- [ ] Release v0.1.0
- [ ] GitHub repo public

---

## 8. Success Metrics

- **Adoption:** 100 GitHub stars in first month
- **Retention:** Users run analyze >3 times/week
- **Safety:** Zero data loss incidents
- **Satisfaction:** Users report feeling more organized

---

## 9. Open Questions

1. Should we support non-markdown files (PDFs, images)?
2. How deep should AI classification go?
3. Should we integrate with external tools (Calendar, Todoist)?
4. What's the migration path from other tools?

---

*Last updated: 2026-02-18*  
*Status: In Development*
