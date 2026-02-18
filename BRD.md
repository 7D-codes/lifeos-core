# LifeOS Core — Business Requirements Document

**Product:** LifeOS Core Dashboard  
**Version:** 0.1.0  
**Date:** February 18, 2026  
**Status:** R&D Complete, Ready for Build  
**Repository:** https://github.com/7D-codes/lifeos-core

---

## 1. Executive Summary

### The Big Idea

LifeOS Core is an **AI-native personal operating system** that bridges the gap between OpenClaw's conversational interface and the need for persistent, visual organization.

**Core Question:** What's the gap between owning OpenClaw with Telegram vs owning one with a dashboard?

**Answer:** The dashboard isn't just for launching agents — it's for **seeing your life** that OpenClaw manages. It's Notion 2.0, but agent-native.

### Why Now

- OpenClaw users give their AI its own machine — they never see the files
- Telegram is great for quick commands, terrible for visualization and planning
- The productivity tool market is mature but not AI-native
- Window of opportunity before Notion/Obsidian fully integrate AI

### The Vision

**Morning:** Open dashboard → See AI-generated daily brief, time blocks, priorities  
**Day:** Quick capture tasks, agents process them, dashboard updates  
**Evening:** Review what got done, what rolls over, patterns emerge  

Not a separate app. Your OpenClaw, visible.

---

## 2. Problem Statement

### Current State Pain Points

| Pain Point | Current Solution | Why It Fails |
|------------|------------------|--------------|
| **No visibility** | Check Telegram history | Ephemeral, scroll-heavy |
| **No planning** | Mental models or external tools | Context switching, stale data |
| **No patterns** | Memory files exist but unseen | Can't see trends without effort |
| **No focus** | Everything in chat | No prioritization visualization |
| **No time blocking** | Calendar app | Disconnected from actual tasks |

### Target Users

1. **Power Users (Primary)** — Already using OpenClaw daily, technical, want mission control
2. **Productivity Optimizers** — Tried Notion/Obsidian, want something AI-native
3. **Time-Poor Professionals** — Need automated organization, willing to trust AI

---

## 3. Solution: The Dashboard

### Core Value Proposition

> "Your AI-powered life dashboard — everything OpenClaw knows about your life, visible, organized, actionable."

### Key Differentiators

| Feature | LifeOS | Notion | Obsidian | Cron/Amie |
|---------|--------|--------|----------|-----------|
| **AI-Native** | ✅ Built around agents | ⚠️ Bolted-on | ❌ No AI | ❌ No AI |
| **Self-Hosted** | ✅ Open source | ❌ Cloud | ✅ Local files | ❌ Cloud |
| **Time Blocks** | ✅ Integrated | ❌ No | ❌ No | ✅ Yes |
| **Agent Control** | ✅ Native | ❌ No | ❌ No | ❌ No |
| **Auto-Organization** | ✅ AI-suggested | ❌ Manual | ❌ Manual | ❌ Manual |

### What It Is (and Isn't)

**It IS:**
- A visual layer on top of your OpenClaw data
- A planning and review tool
- A time blocking interface
- A mission control for agents

**It ISN'T:**
- A replacement for Telegram (complement)
- A generic productivity app (AI-native first)
- A complicated setup (self-hostable in minutes)

---

## 4. Product Features

### 4.1 Views

#### Today View (Home)
**Purpose:** Start your day with clarity

**Components:**
- **Focus Tasks** — Today's 1-3 must-dos (AI-prioritized)
- **Time Blocks** — Visual calendar with task integration
- **Inbox** — Quick capture buffer (process, don't just collect)
- **Pinned** — Important but not urgent (star from any view)
- **Overdue** — Fire that needs putting out
- **Progress Bars** — Weekly stats (tasks, focus hours, deep work)

**Interactions:**
- Click to expand tasks
- Drag to reorder priorities
- Cmd+N to add new task
- Hover for breakdown details

#### Kanban Board
**Purpose:** Project and status visualization

**Components:**
- **Columns:** Backlog → Todo → In Progress → Review → Done
- **Swimlanes:** By project or priority
- **WIP Limits:** Visual indicators when overloaded
- **Quick Filters:** Show only high priority, only today's tasks

**Interactions:**
- Drag cards between columns
- Drag to reorder within column
- Hover for quick actions (complete, archive, edit)
- Inline create (click empty space)

#### Projects View
**Purpose:** Strategic overview of all workstreams

**Components:**
- **Project Cards:** Progress bars, health indicators (🟢🟡🔴), last activity
- **Hierarchy:** Nested subprojects
- **Status:** Active, paused, archived
- **Metrics:** Tasks completed/remaining, velocity

**Interactions:**
- Click to expand project details
- Filter by status, tag, date
- Sort by priority, activity, due date

#### Calendar / Time Blocks
**Purpose:** Schedule your day with intention

**Components:**
- **Day/Week/Month views**
- **Time blocks** with color coding (deep work, meetings, admin)
- **Task integration** — drag tasks into time slots
- **Conflict detection** — overlapping blocks highlighted

**Interactions:**
- Click to create block
- Drag to resize/move
- Right-click for quick templates ("Focus session", "Meeting")

#### Memory Search
**Purpose:** Find anything across your knowledge base

**Components:**
- **Universal search** — tasks, notes, projects, people
- **Natural language** — "what did I decide about X?"
- **Filters:** By date, project, tag, type
- **AI summaries** — "Here's what you need to know about..."

**Interactions:**
- Cmd+K to open from anywhere
- Type to search, Enter to open
- Arrow keys to navigate results

### 4.2 Agent Integration

**Agent Status Panel:**
- See which agents are running
- View recent agent outputs
- Kill/restart agents
- Configure agent schedules

**Agent-Driven Features:**
- Morning brief (auto-generated daily overview)
- End-of-day summary (what got done, what didn't)
- Weekly review (patterns, suggestions)
- Smart suggestions ("You have 2 hours free — work on X?")

### 4.3 Interactions & UX

**Design Principles:**
1. **Dense information** — No wasted space
2. **Dark mode first** — #0D0D0D background
3. **Keyboard-first** — Every action has a shortcut
4. **Fast** — <100ms for any interaction
5. **Pro tool feel** — Power, reliability, speed

**Keyboard Shortcuts:**
```
Cmd+K        Universal search
Cmd+N        New task
Cmd+Shift+N  New project
Cmd+1-6      Switch views (Today, Kanban, Projects, Calendar, Memory, Quick)
Cmd+.        Toggle sidebar
Cmd+Enter    Complete task
Esc          Close modal/back
```

**Animations:**
- Satisfying completion (task strikethrough + fade)
- Smooth drag-drop
- Progress bar transitions
- Undo toast (3 seconds)

---

## 5. Technical Architecture

### 5.1 Philosophy

**Start minimal. No database if we can avoid it. Parse markdown live.**

### 5.2 Data Flow

```
OpenClaw Host ──► Git Sync ──► Dashboard API ──► Web UI
(memory files)   (optional)   (file parser)     (React)
```

**Sync Options:**
1. **Git sync** (recommended) — Leverage existing version control
2. **Direct mount** — NFS/SMB for same-network setups
3. **Sync API** — OpenClaw pushes to endpoint
4. **Cloud sync** — S3/rclone for multi-device

### 5.3 Storage

**No Database (Initially)**
- Parse markdown files on-demand
- In-memory LRU cache (30s TTL)
- Add SQLite only if >10k files or full-text search needed

**Parser Strategy:**
```typescript
interface ParsedDocument {
  path: string;
  frontmatter: Record<string, any>;
  content: string;
  tasks: Task[];
  events: Event[];
  tags: string[];
  modified: Date;
}
```

### 5.4 Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **State** | Zustand (client), SWR (server) |
| **Parsing** | remark, gray-matter, date-fns |
| **Drag-Drop** | @dnd-kit/core |
| **Icons** | Lucide React |

### 5.5 Deployment

**Option A: Same Machine (Simplest)**
```bash
docker run -v /path/to/openclaw:/data -p 3000:3000 lifeos/dashboard
```

**Option B: Separate Machine (Git Sync)**
```bash
# Dashboard pulls from git
git clone https://github.com/user/openclaw-workspace
cd dashboard && npm run dev
```

**Option C: Vercel (Advanced)**
- Requires external storage or API
- Good for demo, not for daily use

### 5.6 Security

- **Path traversal protection** — Sanitize all file paths
- **HTTP Basic Auth** — For MVP (user:password)
- **Future:** Authelia/Authentik for multi-user
- **Markdown sanitization** — Prevent XSS

---

## 6. Business Model

### 6.1 Open Core Strategy

**Core (MIT Licensed):**
- Dashboard UI
- File parsers
- Sync logic
- Basic agent integration

**Commercial Add-ons (Future):**
- Managed cloud hosting
- Multi-user teams
- Advanced AI features
- Priority support

### 6.2 Sustainability

**Phase 1 (Months 0-6):** Community building
- GitHub sponsors
- Donations

**Phase 2 (Months 6-18):** Managed offering
- $10-20/month for hosted version
- Enterprise support contracts

**Phase 3 (Year 2+):** Platform
- Agent marketplace (revenue share)
- Premium integrations

### 6.3 Competitive Moat

**Not any single feature — the combination of:**
1. Open source (community trust)
2. Self-hosted (data ownership)
3. Agent-native architecture (first-class AI)
4. Community (plugins, integrations)

---

## 7. Success Metrics

### 7.1 Adoption (6 Months)
- 100+ GitHub stars
- 50+ active installations
- 10+ community contributions

### 7.2 Retention (12 Months)
- 50% weekly active rate
- Average 5+ sessions/week per user
- <10% churn rate

### 7.3 Revenue (18 Months)
- $10K MRR from managed offering
- 500+ paying users
- 2 enterprise contracts

### 7.4 Impact (3 Years)
- Category leader in "AI-native personal OS"
- 10,000+ active installations
- Sustainable open-source project

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Notion adds agent features** | High | High | Move fast, build community |
| **Setup too complex** | Medium | High | One-command Docker deploy |
| **No one wants dashboard** | Low | Critical | Validate with beta users first |
| **Security issues** | Medium | High | Audits, responsible disclosure |
| **Burnout (solo maintainer)** | Medium | High | Build core team early |

---

## 9. Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Dashboard scaffold (Next.js + shadcn/ui)
- [ ] File parser (markdown → structured data)
- [ ] Today view (focus tasks, time blocks)
- [ ] Git sync setup

### Phase 2: Core Views (Weeks 3-4)
- [ ] Kanban board (drag-drop)
- [ ] Projects view (progress bars)
- [ ] Calendar / time blocks
- [ ] Memory search

### Phase 3: Polish (Weeks 5-6)
- [ ] Keyboard shortcuts
- [ ] Animations & transitions
- [ ] Mobile responsive
- [ ] Docker deployment

### Phase 4: Launch (Week 7)
- [ ] Documentation
- [ ] GitHub repo public
- [ ] Hacker News launch
- [ ] Community onboarding

---

## 10. Appendices

### A. Competitive Analysis

**Notion (Primary Threat)**
- Strengths: Ecosystem, templates, integrations
- Weaknesses: Not AI-native, slow, bloated
- Our edge: Agent-first, fast, self-hosted

**Obsidian (Secondary)**
- Strengths: Local files, extensible
- Weaknesses: No agents, steep learning curve
- Our edge: AI-native, better UX

**Cron/Amie (Tertiary)**
- Strengths: Beautiful calendar, time blocking
- Weaknesses: No task management, no agents
- Our edge: Integrated tasks + agents

**Flowise/Langflow (Different Market)**
- For: Agent builders/devs
- Not for: Daily personal productivity

### B. User Personas

**Persona 1: The Builder**
- Technical, already using OpenClaw
- Wants: Agent control, monitoring, debugging
- Pain: No visibility into what agents are doing

**Persona 2: The Optimizer**
- Tried every productivity tool
- Wants: Automated organization, time blocking
- Pain: Tools require too much manual upkeep

**Persona 3: The Professional**
- Busy, time-poor
- Wants: Morning brief, end-of-day summary
- Pain: Can't see the big picture

### C. Technical Decisions

**Why No Database (Initially)?**
- Simpler deployment
- Fewer failure modes
- Can add later if needed

**Why Git Sync?**
- Most OpenClaw users already use git
- Version history "for free"
- Works offline

**Why Next.js?**
- Familiar to contributors
- Great ecosystem
- Easy deployment

---

**Document Status:** COMPLETE  
**Next Step:** Begin Phase 1 development  
**Owner:** LifeOS Core Team  

*Research sources:*
- `research/business-strategy.md` — Market analysis, competitive landscape
- `research/system-design.md` — Architecture, deployment options
- `research/ux-design.md` — Screens, interactions, design principles
