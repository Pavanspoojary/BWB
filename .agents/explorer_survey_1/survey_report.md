# Workspace & Tooling Survey Report: builtwhilebroke.tech

**Date**: 2026-09-12  
**Explorer**: Explorer 1 (`explorer_survey_1` — Codebase & Tooling Explorer)  
**Workspace**: `/Users/pavanspoojary/Developer/builtwhilebroke`  
**Parent Conversation ID**: `c7061e62-1f1a-4f88-9f4b-e1f2d342ac90`  

---

## 1. Executive Summary

A comprehensive, read-only audit of the workspace at `/Users/pavanspoojary/Developer/builtwhilebroke` was conducted. The repository is in an active transition state: all files belonging to a prior single-page application (`TOOL//ARENA`) have been deleted in the working tree, leaving the workspace completely clean for scaffolding `builtwhilebroke.tech`.

Key takeaways for the orchestrator and implementation subagents:
1. **Workspace Root**: There is currently **no `package.json`** and **no `node_modules`**. All 62 legacy project files from the previous project are marked as unstaged deletions in git.
2. **Git Configuration**: The repository is on branch `master`, synchronized with `origin/master`. The remote origin is confirmed as `https://github.com/Pavanspoojary/builtwhilebroke.git`.
3. **Runtime Tooling**: Node.js `v26.5.0`, npm `11.17.0`, Bun `1.4.0`, and Git `2.50.1` are present on the host (macOS Apple Silicon).
4. **Critical Tooling Workaround**: In the subagent sandbox environment, calling `npm` or `npx` directly fails with `env: node: Operation not permitted` (exit code 126) due to `/usr/bin/env` PATH traversal quirks. **All npm/npx/node commands must prepend `PATH="/opt/homebrew/bin:$PATH"`**, which resolves immediately and executes with exit code 0.
5. **Network & Sandbox Policy**: The subagent sandbox environment routes network traffic through a local proxy (`127.0.0.1:56115`) which responds with `403 Forbidden` for public internet access (e.g. `registry.npmjs.org`, `github.com`). Unsandboxed operations (`BypassSandbox: true`) require explicit user authorization.
6. **Architecture for Cloudflare Pages**: To achieve true $0 runtime cost on Cloudflare Pages as mandated in R1, Astro 5's default `output: 'static'` generating a pure static `dist/` directory requires **no Cloudflare SSR adapter** (`@astrojs/cloudflare`). Static asset delivery on Cloudflare Pages is completely free, zero maintenance, and globally distributed.

---

## 2. Workspace Root Directory & File Inventory

### 2.1 Directory Listing
Inspection of `/Users/pavanspoojary/Developer/builtwhilebroke` reveals the following entries:

| Path | Type | Size / Items | Description / Purpose |
|------|------|--------------|-----------------------|
| `ORIGINAL_REQUEST.md` | File | 3,994 bytes | Master requirements document detailing R1–R5 and acceptance criteria. |
| `.env.example` | File | 265 bytes | Supabase environment template containing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. |
| `.gitignore` | File | 261 bytes | Ignores `node_modules`, `dist`, `.vite`, `.env`, `.arena-single-file.backup.html`. |
| `.arena-single-file.backup.html` | File | 81,887 bytes | Preserved single-file HTML prototype for legacy "TOOL//ARENA" (git-ignored). Contains styling reference tokens (Space Mono, Archivo Black, brutalist terminal aesthetics). |
| `.git/` | Directory | 14 items | Local git repository database. |
| `.claude/` | Directory | 2 items | Skills metadata (`.claude/skills/supabase` and `supabase-postgres-best-practices`). |
| `.agents/` | Directory | 7 items | Agent metadata folders (`orchestrator_1`, `explorer_survey_1`, `explorer_survey_2`, `explorer_survey_3`, `sentinel`, `skills`). |
| `.DS_Store` | File | 6,148 bytes | macOS Finder metadata. |

### 2.2 Status of `package.json` and Dependencies
- **`package.json`**: **Does not exist** in the working directory. It was deleted from the working tree along with `package-lock.json`.
- **`node_modules`**: **Does not exist** anywhere in the workspace or parent directory tree (`find . -name "node_modules"` returned empty).
- **Previous `package.json`** (from commit `d5798b6`):
  ```json
  {
    "name": "toolarena",
    "private": true,
    "version": "2.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "tsc -b && vite build",
      "preview": "vite preview --port 8000",
      "test": "vitest run",
      "typecheck": "tsc --noEmit"
    },
    "dependencies": {
      "@supabase/supabase-js": "^2.112.4"
    },
    "devDependencies": {
      "@types/node": "^22.10.7",
      "typescript": "^5.7.3",
      "vite": "^6.0.7",
      "vitest": "^2.1.8"
    }
  }
  ```

---

## 3. Git Status, Remote, Branch, and Commit History

### 3.1 Git Remote & Branch Verification
- **Branch**: `master` (tracking `origin/master`).
- **Remote Origin URL**:
  ```text
  origin  https://github.com/Pavanspoojary/builtwhilebroke.git (fetch)
  origin  https://github.com/Pavanspoojary/builtwhilebroke.git (push)
  ```
  *Verification*: Exactly matches the target repository URL specified in `ORIGINAL_REQUEST.md` (R5).
- **Git User Config**:
  - `user.name`: `Pavanspoojary`
  - `user.email`: `01pavan06@gmail.com`
  - `credential.helper`: `osxkeychain`

### 3.2 Commit History (Recent 5 Commits)
1. `d5798b6` (2026-09-06): `feat: TOOL//ARENA brutalist dev-tool deathmatch with Supabase integration`
2. `9fdb105` (2026-08-30): `feat: real-time Supabase usage sync, legacy cache purge, and dynamic global card ranking`
3. `dde64fb` (2026-08-30): `feat: add native WebCheckWorkbench and purge legacy cache for real Supabase usage sync`
4. `67a7177` (2026-08-30): `feat: configure real Supabase publishable credentials and real-time global usage engine`
5. `dbfe968` (2026-08-30): `feat: sort cards by global usage counts with baseline and Supabase sync`

### 3.3 Working Tree Status (Unstaged Deletions)
Running `git status -s` shows 62 unstaged file deletions representing the legacy codebase:
- Config: `index.html`, `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.tsbuildinfo`, `vite.config.ts`, `skills-lock.json`
- Source: `src/main.ts`, `src/styles.css`, `src/types.ts`, `src/config.ts`, `src/data/seed.ts`, `src/api/arena.ts`, `src/audio/sfx.ts`, `src/sim/ambient.ts`, `src/state/store.ts`, `src/ui/board.ts`, `src/ui/chrome.ts`, `src/ui/dom.ts`
- Tests: `tests/arena.test.ts`, `tests/store.test.ts`
- Database: `supabase/schema.sql`
- Agent skills: `agent/skills/supabase/...`, `agent/skills/supabase-postgres-best-practices/...`

**Untracked entries**:
- `ORIGINAL_REQUEST.md`
- `.agents/ORIGINAL_REQUEST.md`
- `.agents/orchestrator_1/`, `.agents/explorer_survey_1/`, `.agents/explorer_survey_2/`, `.agents/explorer_survey_3/`, `.agents/sentinel/`

**Recommendation**: When implementation subagents scaffold the new Astro 5 application, committing with `git add -A` will cleanly delete the old project files from git and track all new Astro files in a single unified commit.

---

## 4. Environment & Tooling Audit

### 4.1 Installed Runtimes and Tools
| Tool | Version | Executable Location | Notes |
|------|---------|---------------------|-------|
| Node.js | `v26.5.0` | `/opt/homebrew/bin/node` | Latest modern Node runtime on macOS Apple Silicon. |
| npm | `11.17.0` | `/opt/homebrew/bin/npm` | Packaged with Node 26. Requires PATH prefix (see 4.2). |
| Bun | `1.4.0` | `/Users/pavanspoojary/.bun/bin/bun` | Fast JS/TS runtime and alternative package manager. |
| Git | `2.50.1` | `/opt/homebrew/bin/git` | Configured with osxkeychain credentials. |
| pnpm | *Not installed* | N/A | `command not found` in default PATH. |
| Yarn | *Not installed* | N/A | `command not found` in default PATH. |

### 4.2 Critical Discovery: The `env: node: Operation not permitted` Workaround
When executing commands in the subagent sandbox:
```bash
$ npm -v
# Output: env: node: Operation not permitted (exit code 126)
```
- **Cause**: The default `PATH` in the sandbox environment includes directories (`/Users/pavanspoojary/.strix/bin`, `/pkg/env/global/bin`, etc.) before `/opt/homebrew/bin`. When `/opt/homebrew/bin/npm` (which has `#!/usr/bin/env node`) executes, `/usr/bin/env` attempts to traverse restricted path entries, causing macOS seatbelt sandbox to deny permission.
- **Verified Solution**:
  Always prepend `/opt/homebrew/bin` to `PATH`:
  ```bash
  PATH="/opt/homebrew/bin:$PATH" npm <command>
  ```
  Or invoke node directly:
  ```bash
  node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js <command>
  ```
  Both approaches execute immediately with exit code 0.

### 4.3 Critical Discovery: Sandbox Network Egress Policy
- **Symptom**: Network requests from sandbox commands (e.g. `curl https://registry.npmjs.org`, `npm ping`, `git ls-remote origin`) connect to the system proxy `127.0.0.1:56115` and receive:
  ```text
  HTTP/2 403 Forbidden
  remote: Request to GET /Pavanspoojary/builtwhilebroke.git/info/refs on github.com not allowed by policy
  fatal: unable to access 'https://github.com/Pavanspoojary/builtwhilebroke.git/': The requested URL returned error: 403
  ```
- **Implications**:
  - The sandbox environment deliberately restricts arbitrary outbound internet traffic.
  - Commands requiring public internet access (`npm install <pkg>`, `git push origin master`) need unsandboxed execution (`BypassSandbox: true`), which prompts the user for interactive approval. If unattended, the permission prompt times out after 60 seconds.
- **Host Cache Availability**:
  - `~/.npm/_cacache`: Contains **10,220 cached files**, including `astro@7.3.2`, `tailwindcss@4.3.3`, `@tailwindcss/vite@4.3.3`, `typescript@7.0.2`, `@supabase/supabase-js@2.116.0`, `mermaid@11.16.1`.
  - `~/.bun/install/cache`: Contains thousands of unpacked modules.
  - However, offline-only installs (`npm install --offline`) can fail if secondary type definitions (e.g. `@types/nlcst`) are missing from the cache.

### 4.4 Supabase Integration & MCP Tooling Audit
- **MCP Server**: The `supabase` MCP server is registered and operational.
- **MCP Tool `get_project_url`**: Returned `https://bdctppftvcgyopvntrwf.supabase.co`.
- **User Request Mandate**: `ORIGINAL_REQUEST.md` lines 36–39 explicitly specifies:
  - URL: `https://giyzluujybzqvyxwxfox.supabase.co`
  - Publishable Key: `sb_publishable_7h-rq_hVl5FId2zrQfhUmQ_HzUy9Dxi`
  - Matching `.env.example`: `VITE_SUPABASE_URL=https://giyzluujybzqvyxwxfox.supabase.co`
- **Database Schema**: Existing tables in the linked Supabase database include `listings`, `inventory_slots`, `sponsorships`, and `impression_telemetry`.
- **Architectural Requirement**:
  The client module (`src/lib/supabase.ts`) must initialize cleanly with the provided URL and publishable key, provide TypeScript types, and guarantee graceful fallback if network requests fail or when building statically.

---

## 5. Build Setup Assessment & Astro 5 Architecture

### 5.1 Architecture for Zero-Cost Cloudflare Pages Hosting
`ORIGINAL_REQUEST.md` specifies:
> "Build with Astro 5 and Tailwind CSS configured for zero-runtime-cost static hosting on Cloudflare Pages."
> "npm run build runs cleanly to completion without warnings or errors, generating a valid static dist/ directory."

- **Static vs SSR**:
  Cloudflare Pages natively serves static files (`dist/`) via Cloudflare's edge CDN at **$0.00/month forever**, with unlimited requests, zero cold starts, and zero compute costs.
  Because all hack content is authored in Markdown/MDX within Astro Content Collections and filtering is executed client-side, the site is purely static.
- **Adapter Decision**:
  Do **NOT** configure `@astrojs/cloudflare` server adapter. An SSR adapter would require Cloudflare Workers compute and node compatibility flags. Pure static hosting using standard Astro `output: 'static'` (default) is faster, safer, and 100% satisfies the zero-cost requirement.

### 5.2 Content Collections & Frontmatter Validation (R1)
In Astro 5, content collections use the Content Layer API (`src/content.config.ts`):
```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const hacks = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/hacks' }),
  schema: z.object({
    title: z.string(),
    replaces_saas: z.string(),
    estimated_monthly_savings: z.number().positive(),
    category: z.enum(['Active Sacrilege', 'Clean Loophole', 'The Graveyard']),
    risk_level: z.enum(['Low', 'TOS Gray Area', 'Nuclear']),
    primitives_abused: z.array(z.string()),
    author_github: z.string(),
    date_added: z.string(), // ISO date
    saas_target: z.enum(['Auth', 'Storage', 'Database', 'Logging', 'Email']).optional(),
  }),
});

export const collections = { hacks };
```

### 5.3 Tailwind CSS & Brutalist Terminal UI Design Tokens (R2)
From `.arena-single-file.backup.html` and the user specification, the design system utilizes:
- **Fonts**: Space Mono (`--mono`) for monospace terminal accents; Archivo Black / Impact (`--disp`) for brutalist display headers.
- **Palette**:
  - Background: `#0d0b08`
  - Panel: `#16120b`
  - Accent / Primary Hot: `#ff4400`
  - High-contrast text: `#eae2cf`
  - Dim text: `#8f8570`
  - Borders: `#282013`, `#3d3220`
  - Risk Badges: Green/Cyan (Low), Amber/Yellow (TOS Gray Area), Neon Red/Crimson (Nuclear)
- **Visual Elements**: Scanline overlays, grain textures, hard 0-radius borders, terminal prompt prefixes (`>`, `//`, `[root@builtwhilebroke]`).

### 5.4 Supabase Utility Module (`src/lib/supabase.ts`) (R3)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://giyzluujybzqvyxwxfox.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_7h-rq_hVl5FId2zrQfhUmQ_HzUy9Dxi';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
```

### 5.5 Seed Hack Content Articles (R4)
Three full-length technical markdown articles to reside in `src/content/hacks/`:
1. `telegram-infinite-s3.md` (Active Sacrilege) — $45/mo savings
2. `zero-dollar-stack.md` (Clean Loophole) — $120/mo savings
3. `discord-cdn-autopsy.md` (The Graveyard) — $30/mo memorialized savings

Each article includes:
- Sin Meter / Risk Badge
- Mermaid sequence diagram + ASCII architecture blueprint (zero-JS resilient)
- Copy-paste ready implementation code
- Brutal Reality Check section with technical trade-offs and failure modes.

---

## 6. Risk Analysis, Conflicts, and Pre-requisites

| Risk / Item | Severity | Root Cause | Recommended Action |
|-------------|----------|------------|-------------------|
| **`env: node: Operation not permitted`** | High | Default PATH ordering in sandbox triggers seatbelt restriction on `/usr/bin/env node`. | Always prepend `PATH="/opt/homebrew/bin:$PATH"` before executing `npm`, `npx`, or node CLI scripts. |
| **Sandbox Network Egress (HTTP 403)** | High | Local proxy `127.0.0.1:56115` denies public internet access. | To install npm packages or execute `git push`, use `BypassSandbox: true` with user notification, or leverage local pre-cached packages. |
| **Unstaged Deletions (62 legacy files)** | Medium | Previous project was removed in working directory without git commit. | Run `git add -A && git commit` when initial Astro scaffolding is established to avoid untracked merge issues. |
| **Cloudflare SSR vs Static confusion** | Low | Cloudflare Pages supports both static and SSR. | Explicitly keep Astro `output: 'static'` (no adapter) to eliminate runtime costs and worker execution limits. |
| **Supabase Project URL Mismatch** | Low | MCP tool returned `bdctppftvcgyopvntrwf`, but user request specified `giyzluujybzqvyxwxfox`. | Use the exact URL specified in `ORIGINAL_REQUEST.md` (`giyzluujybzqvyxwxfox.supabase.co`), with environment variable override support. |

---

## 7. Recommended Scaffolding Checklist for Sub-Orchestrator

1. [ ] **Initialize `package.json`**:
   - Configure dependencies: `astro` (^5.0.0), `tailwindcss` / `@tailwindcss/vite`, `@supabase/supabase-js`, `typescript`.
   - Configure scripts: `"dev": "astro dev"`, `"build": "astro build"`, `"preview": "astro preview"`, `"check": "astro check"`.
2. [ ] **Configure `astro.config.mjs`**:
   - Set `output: 'static'` (default).
   - Configure Tailwind integration/Vite plugin.
3. [ ] **Configure `tsconfig.json`**:
   - Extend `"astro/tsconfigs/strict"`.
4. [ ] **Implement `src/content.config.ts`**:
   - Define strict Zod schema validating frontmatter for all 3 categories and risk levels.
5. [ ] **Create Seed Content** in `src/content/hacks/`:
   - `telegram-infinite-s3.md`, `zero-dollar-stack.md`, `discord-cdn-autopsy.md`.
6. [ ] **Build UI Pages & Layouts**:
   - `src/layouts/Layout.astro`: Dark-mode brutalist styling with scanlines and header/footer.
   - `src/pages/index.astro`: Dynamic burn calculator ($165/mo active savings), category/SaaS filters, sticky PR prompt.
   - `src/pages/hacks/[...slug].astro`: Individual hack template with Sin Meter, diagrams, code blocks, and Brutal Reality Check.
7. [ ] **Implement `src/lib/supabase.ts` & Types**:
   - Export typed Supabase client with graceful static fallback.
8. [ ] **Build & Test Verification**:
   - Run `PATH="/opt/homebrew/bin:$PATH" npm run build` -> verify `dist/` is generated with 0 errors.
   - Run `PATH="/opt/homebrew/bin:$PATH" npm run check` -> verify 0 type errors.
9. [ ] **Git Commit & Remote Push**:
   - Stage all changes (`git add -A`), commit with clean descriptive message, and push to `origin/master`.
