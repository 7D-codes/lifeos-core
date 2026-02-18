# LifeOS Core — UX Design Document

> A pro tool for managing life. Dense, scannable, keyboard-first.

---

## 1. Home Screen — The "Today" View

**Philosophy:** Show me what matters *now*. No fluff. Everything I need to decide "what do I do next?" at a glance.

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⌘K Search...                    🌙  Wed, Feb 18  │  [🔥 3]  [💬 2]  [👤]  │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │  🎯 TODAY'S FOCUS                                               │
│  NAV       │  ┌─────────────────────────────────────────────────────────┐    │
│  ─────     │  │  Finish Q1 roadmap draft                      [2h]  🔴  │    │
│  🏠 Today  │  │  Design system tokens for LifeOS               [4h]  🟡  │    │
│  📋 Kanban │  └─────────────────────────────────────────────────────────┘    │
│  📁 Projects│                                                                 │
│  📅 Calendar│  ⏰ TIME BLOCKS (Today)                                        │
│  🔍 Memory │  ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐   │
│  ⚡ Quick  │  │ 09:00   │ 10:00   │ 11:00   │ 12:00   │ 01:00   │ 02:00   │   │
│            │  │ ┌─────┐ │ ┌─────┐ │       │ │ ┌─────┐ │       │ │ ┌─────┐ │   │
│  ─────     │  │ │Focus│ │ │Focus│ │ Lunch │ │ │Deep │ │       │ │ │Call │ │   │
│  ⚙️ Settings│  │ │Work │ │ │Work │ │       │ │ │Work  │ │       │ │ │PM    │ │   │
│  ⌘,        │  │ └─────┘ │ └─────┘ │       │ │ └─────┘ │       │ │ └─────┘ │   │
│            │  └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘   │
│            │                                                                 │
│            │  📥 INBOX (5)          📌 PINNED              🔥 OVERDUE (2)    │
│            │  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐   │
│            │  │ □ Review PR    │   │ □ Tax docs     │   │ □ Email Sarah  │   │
│            │  │ □ Book flights │   │ □ Passport ren │   │ □ Fix deploy   │   │
│            │  │ □ Call mom     │   │                │   │                │   │
│            │  │ □ + Add...     │   │                │   │                │   │
│            │  └────────────────┘   └────────────────┘   └────────────────┘   │
│            │                                                                 │
│            │  📊 WEEKLY PROGRESS                                               │
│            │  Tasks: 12/20 ████████████░░░░░░░░  60%                          │
│            │  Focus:  18h  ████████████████░░░░  72%  (goal: 25h)             │
│            │  Deep:    4h  ██████░░░░░░░░░░░░░░  25%  (goal: 16h)             │
└────────────┴─────────────────────────────────────────────────────────────────┘
```

### Key Elements

| Element | Purpose | Interaction |
|---------|---------|-------------|
| **Focus Tasks** | Today's 1-3 must-dos | Click to expand, drag to reorder |
| **Time Blocks** | Visual schedule | Click to edit, drag to resize |
| **Inbox** | Quick capture buffer | Cmd+N to add, Enter to process |
| **Pinned** | Important but not urgent | Star from any view |
| **Overdue** | Fire that needs putting out | One-click reschedule |
| **Progress Bars** | Momentum visualization | Hover for breakdown |

### Keyboard Shortcuts (Always Visible)

```
⌘+N  New task    ⌘+Shift+N  New project    ⌘+K  Search    ⌘+.  Toggle sidebar
```

---

## 2. Navigation — Moving Between Views

**Philosophy:** Zero-friction context switching. Your fingers never leave the keyboard.

### Primary Navigation

```
Sidebar (collapsible with ⌘+.)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Icons + Labels (compact mode: icons only)
🏠 Today          ⌘+1
📋 Kanban         ⌘+2  
📁 Projects       ⌘+3
📅 Calendar       ⌘+4
🔍 Memory         ⌘+5
⚡ Quick Capture   ⌘+6
```

### Secondary Navigation — Command Palette

```
⌘+K opens universal command palette:

┌─────────────────────────────────────────┐
│  > type to search...                    │
├─────────────────────────────────────────┤
│  Go to > Today              ⌘+1         │
│  Go to > Kanban             ⌘+2         │
│  Go to > Projects > LifeOS  ⌘+3         │
│  ─────────────────────────────────────  │
│  Create > New task          ⌘+N         │
│  Create > New project       ⌘+Shift+N   │
│  Create > New time block                │
│  ─────────────────────────────────────  │
│  Search > "roadmap" (3 results)         │
│  Search > "design" (12 results)         │
└─────────────────────────────────────────┘
```

### Context-Aware Navigation

- **From any task:** `⌘+Shift+M` → Move to project
- **From any view:** `E` → Edit selected item
- **From any view:** `Space` → Quick preview (without leaving context)
- **From any view:** `Esc` → Back / Clear selection

---

## 3. Core Views

### 3.1 Dashboard/Today View

*See Section 1 for layout.*

**Key Behaviors:**
- **Auto-refresh:** Updates every minute for time blocks
- **Smart sorting:** Overdue > Focus > Pinned > Inbox
- **Quick actions:** Hover any item for `□ Complete` `✎ Edit` `⏰ Snooze` `📌 Pin`

### 3.2 Kanban Board

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📋 KANBAN: Product Development                        [+ Add Column]       │
├────────────────────┬────────────────────┬────────────────────┬──────────────┤
│  BACKLOG (12)      │  TODO (5)          │  IN PROGRESS (3)   │  DONE (24)   │
│  ─────────────     │  ─────────────     │  ─────────────     │  ─────────── │
│  □ User research   │  □ API design      │  ■ Auth flow       │  ■ Setup     │
│    #design 🔴      │    #backend 🟡     │    @alex 🟡        │  ■ Config    │
│  □ Competitor      │  □ DB schema       │  ■ Dashboard UI    │  ■ Sprint 1  │
│    analysis 🟡     │    #backend 🔴     │    @sarah 🔴       │              │
│  □ Analytics       │  □ Mobile mockups  │  ■ Email templates │              │
│    spec 🟢         │    #design 🟡      │    @me 🟡          │              │
│                    │                    │                    │              │
│  [+ Add task]      │  [+ Add task]      │  [+ Add task]      │              │
└────────────────────┴────────────────────┴────────────────────┴──────────────┘

Drag cards between columns    Double-click to edit    Right-click for menu
```

**Features:**
- **Drag & drop:** Cards between columns, columns reorderable
- **WIP limits:** Visual warning when column exceeds limit (e.g., IN PROGRESS max 3)
- **Quick filter:** `#tag` `@assignee` `!priority` filters at top
- **Swimlanes:** Group by assignee, priority, or tag (toggle with `V`)

### 3.3 Projects List

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📁 PROJECTS                                    [+ New Project]  🔽 Sort    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  🔴  LifeOS Core                    ████████░░  80%  Due: Mar 15      │ │
│  │      12/15 tasks  •  3 in progress  •  2 overdue  •  @me @alex        │ │
│  │      #productivity #v1                                              │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  🟡  Personal Website               █████░░░░░  45%  Due: Apr 1       │ │
│  │      9/20 tasks  •  1 in progress  •  0 overdue  •  @me               │ │
│  │      #side-project #portfolio                                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  🟢  Reading List                   ██████████  100% Done: Jan 30     │ │
│  │      20/20 tasks  •  Archived  •  #learning                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  Status: 🔴 Active  🟡 Paused  🟢 Completed  ⚪ Archived                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- **Progress visualization:** Mini progress bars + completion %
- **Health indicators:** Overdue count, blocked tasks, days since activity
- **Nested projects:** Expandable hierarchy (arrow on left)
- **Bulk actions:** Select multiple, apply tags/assignees/archive

### 3.4 Calendar / Time Blocks

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📅 CALENDAR                                            Week  |  Month     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Time    Mon 2/17    Tue 2/18    Wed 2/19    Thu 2/20    Fri 2/21   Weekend │
│  ─────────────────────────────────────────────────────────────────────────  │
│  08:00   ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐              │
│          │Gym  │    │     │    │     │    │     │    │     │              │
│  09:00   └─────┘    └─────┘    │Deep │    │     │    │     │              │
│          ┌─────┐    ┌─────┐    │Work │    │     │    │     │              │
│  10:00   │Stand│    │Deep │    │     │    │     │    │     │              │
│          │up   │    │Work │    └─────┘    └─────┘    └─────┘              │
│  11:00   └─────┘    │     │    ┌─────┐    ┌─────┐    ┌─────┐              │
│          ┌─────┐    └─────┘    │Focus│    │     │    │     │              │
│  12:00   │Lunch│    ┌─────┐    │Task │    │     │    │     │              │
│          │     │    │Lunch│    └─────┘    │     │    │     │              │
│  01:00   └─────┘    │     │    ┌─────┐    └─────┘    └─────┘              │
│          ┌─────┐    └─────┘    │Call │                                     │
│  02:00   │Deep │    ┌─────┐    │PM   │                                     │
│          │Work │    │Admin│    └─────┘                                     │
│  03:00   │     │    │     │                                                │
│          │     │    │     │                                                │
│  04:00   └─────┘    └─────┘                                                │
│                                                                             │
│  Legend: 🟦 Deep Work  🟨 Focus Time  🟩 Meeting  🟥 Personal              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- **Time block types:** Deep work, Focus, Meeting, Personal (color-coded)
- **Task integration:** Drag tasks from sidebar into calendar
- **Quick edit:** Click to edit, drag to resize/move
- **Conflict detection:** Red overlap warning
- **Focus mode:** Highlight only one block type (filter)

### 3.5 Memory Search

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔍 MEMORY                                                    ⌘+Shift+F     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Search across everything...                                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Filters: [All] [Tasks] [Projects] [Notes] [Files] [Time]          [🔽 Date]│
│                                                                             │
│  Found 23 results for "roadmap":                                            │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  📋  Finish Q1 roadmap draft                                    Today       │
│      Task in "LifeOS Core" • @me • 🔴 High priority                         │
│      "...update the roadmap to reflect new priorities..."                   │
│                                                                             │
│  📝  Roadmap Planning Notes                                     Feb 15      │
│      Note in "LifeOS Core/Planning"                                         │
│      "Q1 objectives: 1) Launch beta..."                                     │
│                                                                             │
│  📅  Roadmap Review Meeting                                     Feb 10      │
│      Calendar event • 2:00-3:00pm                                           │
│      With: @alex, @sarah                                                    │
│                                                                             │
│  📁  2024_Roadmap.pdf                                           Jan 20      │
│      File in "LifeOS Core/Documents"                                        │
│      234 KB • last modified by @me                                          │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  💡 Tip: Use "from:lastweek" "@alex" "#urgent" for advanced filters        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- **Unified search:** Tasks, notes, files, calendar events in one place
- **Natural language:** "meetings last week" "tasks from @alex"
- **Preview pane:** Space to preview without losing search context
- **Saved searches:** Star queries for quick access
- **Related items:** "You might also want..." suggestions

---

## 4. Interactions

### 4.1 Drag & Drop

```
┌─────────────────────────────────────────┐
│  Drag Source → Drop Target → Action     │
├─────────────────────────────────────────┤
│  Task → Kanban column   → Move status   │
│  Task → Calendar slot   → Schedule it   │
│  Task → Project list    → Reassign      │
│  Task → Today view      → Add to focus  │
│  File → Task            → Attachment    │
│  Tag → Task             → Add tag       │
└─────────────────────────────────────────┘
```

**Visual feedback:**
- Ghost preview of dragged item
- Drop zones highlight on hover
- Invalid drops show "🚫" cursor
- Multi-select drag shows count badge

### 4.2 Create Flow

**Quick Create (inline):**
```
[+ Add task] → Type → Enter → Next task
              ↑ Tab for metadata
```

**Full Create (modal):**
```
┌─────────────────────────────────────────┐
│  New Task                               │
│  ═══════════════════════════════════    │
│  Title: [________________________]      │
│                                         │
│  Project: [LifeOS Core ▼]               │
│  Priority: [🔴 High ▼]                  │
│  Due: [Today ▼]  Time estimate: [2h ▼]  │
│                                         │
│  Tags: [#design #v1 ___]                │
│  Assignee: [@me ▼]                      │
│                                         │
│  Description:                           │
│  [                                    ] │
│  [                                    ] │
│                                         │
│           [Cancel]  [⌘+Enter Save]      │
└─────────────────────────────────────────┘
```

### 4.3 Edit Flow

- **Inline:** Click text to edit, blur to save
- **Modal:** `E` or double-click for full edit
- **Bulk:** Select multiple, `E` for batch edit
- **History:** `⌘+Z` undo, `⌘+Shift+Z` redo (with toast notification)

### 4.4 Complete Flow

```
□ → ☑  with satisfying animation

On complete:
1. Strikethrough + dim
2. Brief celebration (micro-animation)
3. Auto-archive after 3 seconds (undo available)
4. Progress bars update
5. Confetti for milestone completions (optional toggle)
```

---

## 5. Visual Design Principles

### 5.1 Dark Mode First

```
Background:    #0D0D0D (near-black)
Surface:       #141414 (elevated)
Border:        #2A2A2A (subtle)
Text Primary:  #F0F0F0
Text Secondary:#888888
Text Muted:    #555555

Accent:        #3B82F6 (blue - primary)
Success:       #10B981 (green)
Warning:       #F59E0B (amber)
Error:         #EF4444 (red)

Priority Red:    #EF4444
Priority Yellow: #F59E0B
Priority Green:  #10B981
```

### 5.2 Dense Information Architecture

**Rules:**
- No wasted whitespace
- Information hierarchy through size/color, not space
- Collapsible sections for power users
- Font sizes: 12px (data), 14px (body), 16px (headings), 24px (titles)
- Line height: 1.3 (tight but readable)

### 5.3 Scannable Design

**Techniques:**
```
✓ Consistent icons (always same meaning)
✓ Color coding (priority, status, type)
✓ Visual grouping (cards, borders, whitespace)
✓ Progress indicators (bars, percentages, counts)
✓ Status badges (small, inline, informative)
```

### 5.4 Typography

```
Font Stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
Monospace:  'SF Mono', Monaco, 'Cascadia Code', monospace

Hierarchy:
H1: 24px / 600 weight / -0.02em
H2: 18px / 600 weight / -0.01em
H3: 14px / 600 weight / 0
Body: 14px / 400 weight / 0
Small: 12px / 400 weight / 0
Mono: 13px / 400 weight / 0
```

### 5.5 Pro Tool Feel

**What makes it feel pro:**

1. **Speed:** 60fps animations, instant response, optimistic updates
2. **Power:** Keyboard shortcuts everywhere, command palette, bulk actions
3. **Density:** Information-rich without clutter
4. **Consistency:** Same patterns everywhere (learn once, use everywhere)
5. **Reliability:** Auto-save, offline support, conflict resolution
6. **Feedback:** Every action has a reaction (sound optional, visual always)
7. **Customizable:** Themes, layouts, what shows on Today view

---

## 6. Micro-Interactions

| Action | Feedback |
|--------|----------|
| Complete task | Checkmark animation + strikethrough |
| Create item | Slide in from top |
| Delete | Slide out left + undo toast (5s) |
| Drag | Ghost + scale 1.05 |
| Drop | Scale pulse + color flash |
| Error | Shake + red border |
| Success | Subtle green flash |
| Loading | Skeleton screens, not spinners |
| Hover | Subtle lift (2px shadow) |

---

## 7. Responsive Considerations

**Desktop (primary):** Full layout, sidebar always visible
**Tablet:** Collapsible sidebar, touch-optimized drag
**Mobile:** Stacked views, swipe actions, floating action button

---

## 8. Accessibility

- **Keyboard:** All actions accessible without mouse
- **Screen readers:** Proper ARIA labels, live regions
- **Color:** Never rely on color alone (icons + text)
- **Motion:** Respect `prefers-reduced-motion`
- **Contrast:** WCAG AA minimum (AAA where possible)

---

*Document Version: 1.0*
*Last Updated: 2026-02-18*
*Next Review: Post-MVP feedback*
