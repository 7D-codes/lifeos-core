# LifeOS Core Dashboard - System Design

## Overview

A self-hostable, open-source dashboard that visualizes OpenClaw's memory files (markdown) in kanban, calendar, and list views.

**Philosophy:** Start minimal. No database if we can avoid it. Parse markdown live. Deploy anywhere.

---

## 1. Data Flow

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  OpenClaw Host  │────▶│  Sync Layer  │────▶│  Dashboard API  │
│  (Memory Files) │     │  (Optional)  │     │  (File Parser)  │
└─────────────────┘     └──────────────┘     └─────────────────┘
                                                    │
                                                    ▼
                                              ┌─────────────┐
                                              │  Web UI     │
                                              │  (React/Vue)│
                                              └─────────────┘
```

### Options (in order of complexity)

| Approach | How It Works | Best For |
|----------|--------------|----------|
| **A. Direct File Access** | Dashboard mounts OpenClaw's workspace via NFS/SMB/SSHFS | Same network, simple setup |
| **B. Git Sync** | OpenClaw commits to git, dashboard pulls | Already using git for memory |
| **C. Sync API** | OpenClaw pushes to a sync endpoint | Real-time updates, remote hosts |
| **D. S3/Cloud Sync** | Files sync via rclone/S3 | Cloud-native, multi-device |

### Recommended: Git Sync (Option B)

Most OpenClaw users already version-control their workspace. Leverage that.

```yaml
# OpenClaw Host
cron: "*/5 * * * *"
script: |
  cd ~/openclaw-workspace
  git add memory/
  git commit -m "auto: memory update $(date)" || true
  git push origin main

# Dashboard Host
webhook: "https://dashboard.example.com/api/sync"
# or polling: pull every 30s
```

---

## 2. Storage Architecture

### Decision: **No Database (Initially)**

Parse markdown files on-demand. Cache in memory.

```
memory/
├── daily/
│   ├── 2026-02-18.md
│   ├── 2026-02-17.md
│   └── ...
├── life/
│   ├── areas/
│   │   ├── health.md
│   │   ├── work.md
│   │   └── relationships.md
│   └── projects/
│       ├── lifeos-core.md
│       └── book-writing.md
└── AGENTS.md
```

### Parser Strategy

```typescript
// Pseudocode for file parser
interface ParsedDocument {
  path: string;
  frontmatter: Record<string, any>;
  content: string;
  tasks: Task[];
  events: Event[];
  tags: string[];
  modified: Date;
}

// Extract structured data from markdown
function parseMarkdown(filePath: string): ParsedDocument {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, content } = extractFrontmatter(raw);
  
  return {
    path: filePath,
    frontmatter,
    content,
    tasks: extractTasks(content),      // - [ ] or - [x]
    events: extractEvents(content),    // @YYYY-MM-DD or parsed dates
    tags: extractTags(content),        // #tag or [[tag]]
    modified: fs.statSync(filePath).mtime
  };
}
```

### In-Memory Cache

```typescript
// Simple LRU cache
const cache = new Map<string, ParsedDocument>();
const CACHE_TTL = 30_000; // 30 seconds

// On request: check cache, else parse
function getDocument(path: string) {
  const cached = cache.get(path);
  if (cached && Date.now() - cached._cachedAt < CACHE_TTL) {
    return cached;
  }
  const doc = parseMarkdown(path);
  (doc as any)._cachedAt = Date.now();
  cache.set(path, doc);
  return doc;
}
```

### When to Add a Database

| Trigger | Solution |
|---------|----------|
| >10,000 files | SQLite for indexing |
| Full-text search needed | SQLite FTS5 or Meilisearch |
| Multi-user support | PostgreSQL |
| Real-time collaboration | PostgreSQL + WebSocket |

---

## 3. Sync Strategy

### Option Matrix

| Strategy | Latency | Complexity | Use Case |
|----------|---------|------------|----------|
| **Manual Refresh** | User-triggered | None | Low-frequency updates |
| **Polling (30s)** | 30s delay | Low | Simple, reliable |
| **Git Webhook** | ~5s | Medium | Already using git |
| **File Watch + WS** | <1s | High | Same-machine setup |
| **SSE Stream** | <1s | Medium | Remote, real-time |

### Recommended: Polling + Git Webhook Hybrid

```typescript
// Dashboard backend
class SyncManager {
  private lastCommit: string = '';
  
  // Primary: Git polling (every 30s)
  async pollGitRemote() {
    const latest = await git.revparse(['HEAD']);
    if (latest !== this.lastCommit) {
      await this.pullAndReindex();
      this.lastCommit = latest;
    }
  }
  
  // Secondary: Webhook for immediate updates
  async handleWebhook(payload: GitWebhookPayload) {
    if (payload.ref === 'refs/heads/main') {
      await this.pullAndReindex();
      this.lastCommit = payload.after;
    }
  }
}
```

### Client-Side Refresh

```typescript
// React hook
function useMemoryData() {
  const { data, mutate } = useSWR('/api/memory', fetcher, {
    refreshInterval: 30000, // 30s polling
  });
  
  // Manual refresh button
  const refresh = () => mutate();
  
  return { data, refresh, lastUpdated: data?._timestamp };
}
```

---

## 4. Security

### Threat Model

| Risk | Mitigation |
|------|------------|
| Unauthorized dashboard access | HTTP Basic Auth or Authelia/Authentik |
| File path traversal | Strict path validation, chroot jail |
| XSS via markdown | Sanitize HTML, use markdown-it with security |
| Data exposure in transit | HTTPS/TLS everywhere |
| Git token exposure | Environment variables, never commit |

### Implementation

```typescript
// Path traversal protection
const ALLOWED_ROOT = '/data/openclaw-workspace';

function safeResolve(requestedPath: string): string {
  const resolved = path.resolve(ALLOWED_ROOT, requestedPath);
  if (!resolved.startsWith(ALLOWED_ROOT)) {
    throw new Error('Path traversal detected');
  }
  return resolved;
}

// Authentication middleware (simple)
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  const expected = 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64');
  
  if (auth !== expected) {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).send('Authentication required');
  }
  next();
}
```

### Multi-User Considerations (Future)

```yaml
# docker-compose.yml with auth proxy
services:
  dashboard:
    image: lifeos-core:latest
    environment:
      - AUTH_MODE=proxy  # Trust upstream auth headers
      
  authelia:
    image: authelia/authelia
    # Handles 2FA, SSO, session management
```

---

## 5. Deployment Options

### A. Local/Same Machine (Easiest)

```yaml
# docker-compose.yml
services:
  lifeos-dashboard:
    image: ghcr.io/openclaw/lifeos-core:latest
    volumes:
      - ~/openclaw-workspace:/data:ro
    ports:
      - "3000:3000"
    environment:
      - MEMORY_PATH=/data
      - AUTH_USER=admin
      - AUTH_PASS=${DASHBOARD_PASSWORD}
```

### B. Separate Machine (Git Sync)

```yaml
services:
  lifeos-dashboard:
    image: ghcr.io/openclaw/lifeos-core:latest
    environment:
      - SYNC_MODE=git
      - GIT_REPO=https://github.com/user/openclaw-memory.git
      - GIT_TOKEN=${GITHUB_TOKEN}
      - SYNC_INTERVAL=30
    ports:
      - "3000:3000"
```

### C. Vercel/Netlify (Serverless)

```typescript
// api/memory.ts - Vercel serverless function
import { parseMemoryFiles } from '@lifeos/parser';

export default async function handler(req, res) {
  // Connect to external git or S3
  const data = await fetchFromGitOrS3();
  res.json(data);
}
```

**Trade-offs:**
- ✅ Easy deploy, CDN, auto-scaling
- ❌ Cold start latency, git auth complexity
- ❌ Need external store (can't access local files)

### D. Self-Hosted (Full Control)

```yaml
# docker-compose.full.yml
version: '3.8'
services:
  dashboard:
    build: .
    volumes:
      - memory-data:/data:ro
    environment:
      - NODE_ENV=production
      - MEMORY_PATH=/data
    networks:
      - internal
      
  caddy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    networks:
      - internal
      
  # Optional: For remote sync
  webhook-receiver:
    image: ghcr.io/openclaw/webhook-bridge
    environment:
      - WEBHOOK_SECRET=${WEBHOOK_SECRET}
    networks:
      - internal

volumes:
  memory-data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=openclaw-host,nolock,soft
      device: :/path/to/workspace
```

---

## MVP Architecture

For the first version, ship this:

```
┌─────────────────────────────────────────────┐
│  Single Docker Container                    │
│  ┌─────────────────────────────────────┐   │
│  │  Next.js (App Router)               │   │
│  │  ├── API: File parser (fs.readFile) │   │
│  │  ├── UI: Kanban, Calendar, List     │   │
│  │  └── Cache: In-memory LRU (30s TTL) │   │
│  └─────────────────────────────────────┘   │
│                    │                        │
│  ┌─────────────────────────────────────┐   │
│  │  Volume Mount: ~/openclaw-workspace │   │
│  │  (Read-only, bind mount)            │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 | File-based routing, API routes, SSG/SSR |
| UI | Tailwind + shadcn/ui | Fast, accessible, customizable |
| Calendar | date-fns + react-big-calendar | Flexible, timezone-aware |
| Kanban | @hello-pangea/dnd | Simple, maintained dnd library |
| Markdown | remark + gray-matter | Battle-tested parsing |
| Cache | node-cache | Simple, synchronous |

### File Structure

```
lifeos-core/
├── app/
│   ├── api/
│   │   └── memory/
│   │       ├── route.ts          # GET /api/memory
│   │       └── [path]/route.ts   # GET /api/memory/daily/2026-02-18
│   ├── page.tsx                  # Dashboard home
│   ├── kanban/page.tsx
│   ├── calendar/page.tsx
│   └── layout.tsx
├── lib/
│   ├── parser.ts                 # Markdown → JSON
│   ├── cache.ts                  # In-memory caching
│   └── git-sync.ts               # Optional git sync
├── components/
│   ├── kanban/
│   ├── calendar/
│   └── list/
└── Dockerfile
```

---

## Future Enhancements

1. **Plugins** - Custom parsers for different markdown formats
2. **Search** - SQLite FTS or Meilisearch integration
3. **Mobile App** - React Native or PWA
4. **Collaboration** - WebSocket sync for multi-user
5. **AI Features** - Auto-tagging, task extraction, summaries

---

## Open Questions

1. Do users already use git for their OpenClaw workspace?
2. What's the average size of a memory directory? (affects caching)
3. Priority of views: Kanban vs Calendar vs List?
4. Need write-back capability, or read-only dashboard?

---

## Appendix: Sample Config

```yaml
# config.yaml (mounted or env-based)
dashboard:
  title: "My LifeOS"
  refreshInterval: 30  # seconds
  
memory:
  path: "/data/memory"
  watch: false  # Enable for same-machine file watching
  
sync:
  enabled: true
  mode: "git"  # git | s3 | webhook
  git:
    repo: "https://github.com/user/memory"
    branch: "main"
    pollInterval: 300  # seconds
    
security:
  auth:
    type: "basic"  # basic | proxy | oauth
    username: "admin"
    password: "${AUTH_PASSWORD}"
  allowedHosts:
    - "dashboard.example.com"
    
views:
  kanban:
    columns:
      - "todo"
      - "in-progress"
      - "done"
    groupBy: "project"  # project | area | tag
  calendar:
    defaultView: "month"  # month | week | day
    firstDayOfWeek: 0  # Sunday
```
