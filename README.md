# LifeOS Core

**Open-source AI life organization system for OpenClaw**

Version: 0.1.0 | License: MIT | Philosophy: Organize with consent

---

## What is LifeOS Core?

LifeOS Core is an AI-powered life organization system that works with any OpenClaw setup. It doesn't impose structure — it **discovers, suggests, and organizes with explicit user consent**.

### Key Principles

| Principle | Description |
|-----------|-------------|
| **Consent** | Asks before every change |
| **Flexibility** | Works with any folder structure |
| **Non-destructive** | Metadata layer, files stay put |
| **Local First** | Runs entirely on your machine |
| **Open Source** | MIT licensed, community driven |

---

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/7d-codes/lifeos-core.git
cd lifeos-core

# Make the CLI executable
chmod +x skill/lifeos

# Create symlink (optional, for global access)
ln -s "$(pwd)/skill/lifeos" /usr/local/bin/lifeos
```

### Usage

```bash
# Analyze your workspace
lifeos analyze

# See current organization state
lifeos status

# Preview organization suggestions (dry run)
lifeos organize

# Apply organization with consent prompts
lifeos organize --apply

# Batch apply all suggestions
lifeos organize --force
```

---

## Commands

### `lifeos analyze [path]`

Scans your workspace and generates an analysis report.

**Options:**
- `--verbose, -v` — Detailed output
- `--output, -o <file>` — Write report to file

**Example:**
```bash
lifeos analyze ~/workspace --verbose
```

### `lifeos organize [path]`

Suggests and applies organization to orphaned files.

**Options:**
- `--dry-run` — Preview only (default)
- `--apply` — Ask for consent on each change
- `--force` — Apply all after single confirmation

**Example:**
```bash
lifeos organize --apply
```

### `lifeos status [path]`

Shows current organization state with recommendations.

**Options:**
- `--verbose, -v` — Detailed output

**Example:**
```bash
lifeos status --verbose
```

### `lifeos rollback <timestamp>`

Restores files from a backup.

**Example:**
```bash
lifeos rollback 20260220_043000
```

---

## Safety & Consent

### Dry Run by Default

All `organize` commands default to dry-run mode. You must explicitly use `--apply` or `--force` to make changes.

### Backups

Before any modification, LifeOS creates a backup:
```
.lifeos/backups/20260220_043000/
```

### Change Log

Every change is logged:
```
.lifeos/changes.log
```

### Rollback

If something goes wrong:
```bash
lifeos rollback 20260220_043000
```

---

## File Categories

LifeOS automatically categorizes files:

| Category | Description | Example Paths |
|----------|-------------|---------------|
| `daily_note` | Daily notes | `memory/daily/*.md` |
| `project` | Project files | `life/areas/projects/*` |
| `person` | People/entities | `life/areas/people/*` |
| `area` | Life areas | `life/areas/*` |
| `knowledge` | Reference material | `knowledge/*` |
| `config` | System config | `SOUL.md`, `AGENTS.md` |
| `markdown` | Other markdown | `*.md` files |
| `other` | Non-markdown | Everything else |

---

## Dashboard (Phase 2)

A visual interface is in development:

```bash
lifeos dashboard
```

Features coming:
- 📋 Kanban board
- ✅ To-do list
- 📁 Project browser
- 🔍 Memory search
- 💬 Chat integration

---

## Project Status

**Phase 1: Core Skill** ✅ Complete
- CLI framework
- Workspace analyzer
- Consent-based organization
- Status display

**Phase 2: Dashboard** 🚧 In Progress
- Next.js dashboard
- Projects view
- Kanban board
- To-do list

**Phase 3: Integration** 📋 Planned
- WebSocket bridge
- Chat integration
- Memory search

**Phase 4: Distribution** 📋 Planned
- OpenClaw skill package
- Documentation
- GitHub release

See [prd.json](./prd.json) for detailed story tracking.

---

## Development

```bash
# Run tests
./tests/run.sh

# Test on sample workspace
./skill/lifeos analyze ./test-workspace --verbose
```

---

## Contributing

Contributions welcome! Please read our [Contributing Guide](./CONTRIBUTING.md).

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

*Built with 💙 for the OpenClaw community*
