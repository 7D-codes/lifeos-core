# LifeOS Core

**Open-source AI life organization system.**

A skill-based platform that brings structure to any OpenClaw setup — with your consent, respecting your existing workflow.

## Philosophy

- **Opt-in, not opt-out** — We ask before changing anything
- **Works with your setup** — Not everyone has the same structure
- **Metadata-first** — Organize without moving files
- **Project-centric** — Everything belongs somewhere
- **Open source** — Community driven, transparent

## Components

### 1. LifeOS Skill (`skill/`)
Installable OpenClaw skill that:
- Analyzes your existing structure
- Suggests organization (asks first)
- Creates metadata indexes
- Provides CLI commands

### 2. Dashboard (`dashboard/`)
Optional web UI:
- Reads from your local OpenClaw
- Kanban, To-Do, Projects, Memory views
- No hosting required — runs locally or on Vercel

### 3. Bridge (`bridge/`)
WebSocket bridge for dashboard-to-OpenClaw communication

## Quick Start

```bash
# Install the skill
openclaw skills install lifeos-core

# Run analysis (dry-run, no changes)
lifeos analyze --dry-run

# Apply suggestions (with confirmation)
lifeos organize

# Start dashboard
lifeos dashboard
```

## Project Structure

```
lifeos-core/
├── skill/              # OpenClaw skill
│   ├── SKILL.md
│   ├── manifest.json
│   └── scripts/
│       ├── analyze.sh
│       ├── organize.sh
│       └── dashboard.sh
├── dashboard/          # Next.js dashboard
│   ├── src/
│   └── package.json
├── bridge/             # WebSocket bridge
│   └── src/
├── docs/               # Documentation
└── README.md
```

## License

MIT — Open source, free forever.
