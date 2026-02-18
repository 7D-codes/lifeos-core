---
name: lifeos-core
description: Open-source AI life organization system for OpenClaw
homepage: https://github.com/lifeos/core
metadata:
  {
    openclaw:
      {
        emoji: 🧠,
        requires: { bins: ["find", "grep", "jq"] },
      },
  }
---

# LifeOS Core

Organize your digital life with AI — **with your consent**.

## What It Does

LifeOS Core analyzes your OpenClaw workspace and helps you organize it:

1. **Analysis** — Scans your structure without changing anything
2. **Suggestions** — Recommends organization based on patterns
3. **Opt-in Changes** — Only applies changes with your explicit approval
4. **Metadata Layer** — Creates organization without moving files

## Key Principles

- **Consent First** — We ask before every change
- **Non-Destructive** — Your files stay where they are
- **Flexible** — Works with any folder structure
- **Transparent** — See exactly what will happen before it does

## Commands

### `lifeos analyze [--dry-run]`

Analyzes your workspace and reports findings:
- Unorganized files
- Duplicate notes
- Orphaned projects
- Memory gaps

```bash
# Preview what would be organized
lifeos analyze --dry-run

# Full analysis with recommendations
lifeos analyze --verbose
```

### `lifeos organize [--apply]`

Suggests and applies organization:

```bash
# See suggestions (dry run by default)
lifeos organize

# Apply with confirmation prompts
lifeos organize --apply

# Auto-apply (requires --force)
lifeos organize --apply --force
```

### `lifeos dashboard`

Starts the local dashboard:

```bash
# Start dashboard on default port
lifeos dashboard

# Start on custom port
lifeos dashboard --port 3001
```

### `lifeos status`

Shows current organization status:
- Active projects
- Recent memories
- Todo counts
- Health metrics

### `lifeos projects [list|create|archive]`

Manage projects:

```bash
# List all projects
lifeos projects list

# Create new project
lifeos projects create "New Business Idea"

# Archive completed project
lifeos projects archive "old-project"
```

## Configuration

Create `~/.openclaw/lifeos.json`:

```json
{
  "consent": {
    "requireConfirmation": true,
    "showDiffBeforeApply": true
  },
  "organization": {
    "defaultMethod": "metadata",
    "backupBeforeChanges": true,
    "preserveExistingStructure": true
  },
  "dashboard": {
    "port": 3456,
    "autoStart": false
  }
}
```

## How It Works

1. **Discovery** — Finds all markdown files, notes, projects
2. **Classification** — Uses AI to categorize content
3. **Metadata Generation** — Creates `.lifeos/metadata.json` files
4. **Visualization** — Dashboard reads metadata, not files

## Safety

- All changes are logged to `~/.lifeos/changes.log`
- Backups created before modifications
- `--dry-run` is default for all destructive operations
- Can rollback any change with `lifeos rollback <id>`

## Open Source

LifeOS Core is MIT licensed. Contribute at https://github.com/lifeos/core
