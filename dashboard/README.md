# LifeOS Core Dashboard

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone and run
git clone https://github.com/7D-codes/lifeos-core
cd lifeos-core/dashboard

# Start with Docker Compose
docker-compose up -d

# Open http://localhost:3000
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

### Option 3: Static Export

```bash
# Build static files
npm run build

# Serve with any static server
npx serve out
```

## Configuration

Set environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `WORKSPACE_PATH` | `/data` | Path to OpenClaw workspace |

## Features

- **Today View** — Focus tasks, time blocks, progress
- **Kanban Board** — Drag-drop task management (coming)
- **Projects** — Progress tracking (coming)
- **Calendar** — Time blocking (coming)
- **Memory Search** — Find anything (coming)

## Development

```bash
# Add shadcn component
npx shadcn@latest add button

# Run linter
npm run lint

# Build for production
npm run build
```
