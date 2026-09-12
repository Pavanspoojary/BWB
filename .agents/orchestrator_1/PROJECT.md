# Project: builtwhilebroke.tech

## Architecture
- **Framework**: Astro 5 (pure static output: 'static', zero-runtime hosting on Cloudflare Pages)
- **Styling**: Tailwind CSS v3 with @astrojs/tailwind and @tailwindcss/typography
- **Design System**: Brutalist Dark-Mode Terminal (Pitch Black `#050505`, Phosphor Green `#22c55e`, Warning Amber `#f59e0b`, Nuclear Red `#ef4444`, monospace fonts, hard borders, zero border-radius)
- **Content Engine**: Astro 5 Content Collections API (`src/content.config.ts`) with strict Zod frontmatter schema
- **Database**: Supabase client (`src/lib/supabase.ts`) with typed client, environment variable fallback, and TypeScript interfaces
- **Hosting**: Cloudflare Pages (`dist/` directory deployed as pure static assets, $0 runtime cost)

## Code Layout
```
/Users/pavanspoojary/Developer/builtwhilebroke/
├── astro.config.mjs               # Astro 5 configuration (output: 'static')
├── tailwind.config.mjs            # Tailwind configuration (brutalist theme tokens)
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies and scripts
├── src/
│   ├── content.config.ts          # Content collections config & Zod schema
│   ├── content/
│   │   └── hacks/                 # Markdown/MDX hack guides
│   │       ├── telegram-infinite-s3.md
│   │       ├── zero-dollar-production-stack.md
│   │       └── discord-cdn-autopsy.md
│   ├── layouts/
│   │   └── BaseLayout.astro       # Dark-mode brutalist terminal layout
│   ├── components/
│   │   ├── BurnCalculator.astro   # Dynamic SaaS burn savings calculator
│   │   ├── HackCatalog.astro      # Client-side filterable catalog
│   │   ├── SinMeter.astro         # Risk level / Sin meter badge
│   │   ├── BrutalRealityCheck.astro # Trade-offs and warnings section
│   │   ├── StickyPrCallout.astro  # Sticky PR contribution prompt
│   │   └── CodeBlock.astro        # Copyable syntax-highlighted code block
│   ├── pages/
│   │   ├── index.astro            # Homepage (Hero, Calculator, Catalog, Sticky PR)
│   │   └── hacks/
│   │       └── [slug].astro       # Dynamic hack guide route
│   └── lib/
│       ├── supabase.ts            # Supabase client utility module
│       └── types.ts               # TypeScript types and database definitions
├── tests/
│   └── e2e/                       # E2E test runner and test cases (Tiers 1-4)
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Astro 5 Static Config | Configure Astro 5 with `output: 'static'` for zero-runtime Cloudflare Pages | M1 | ORIGINAL_REQUEST R1 |
| 2 | Tailwind CSS Brutalist Setup | Configure Tailwind CSS v3 with monospaced tokens and typography plugin | M1 | ORIGINAL_REQUEST R1 |
| 3 | Content Layer Config | Define collections in `src/content.config.ts` using Astro 5 glob loader | M1 | ORIGINAL_REQUEST R1 |
| 4 | Strict Frontmatter Schema | Validate all 8 hack frontmatter fields with Zod | M1 | ORIGINAL_REQUEST R1 |
| 5 | Tooling & Build Scripts | Configure package.json scripts (dev, build, check, preview) | M1 | ORIGINAL_REQUEST R1 |
| 6 | Supabase Client Module | Implement `src/lib/supabase.ts` with createClient and fallback logic | M2 | ORIGINAL_REQUEST R3 |
| 7 | Supabase TypeScript Types | Define Database interface and hack submission types | M2 | ORIGINAL_REQUEST R3 |
| 8 | Supabase Config Fallback | Support URL `https://giyzluujybzqvyxwxfox.supabase.co` and key | M2 | ORIGINAL_REQUEST R3 |
| 9 | Terminal Base Layout | Terminal aesthetics, scanlines, header, nav, footer | M3 | ORIGINAL_REQUEST R2 |
| 10 | Dynamic Burn Calculator | Aggregates `estimated_monthly_savings` across active hacks ($/mo saved) | M3 | ORIGINAL_REQUEST R2 |
| 11 | Catalog Category Filter | Filter by Active Sacrilege, Clean Loophole, The Graveyard | M3 | ORIGINAL_REQUEST R2 |
| 12 | Catalog SaaS Target Filter | Filter by Auth, Storage, Database, Logging, Email | M3 | ORIGINAL_REQUEST R2 |
| 13 | Sticky PR Contribution Callout | Persistent banner linking to GitHub PR submission guidelines | M3 | ORIGINAL_REQUEST R2 |
| 14 | Hack Slug Route | Dynamic page `src/pages/hacks/[slug].astro` rendering markdown content | M3 | ORIGINAL_REQUEST R2 |
| 15 | Sin Meter / Risk Badge | Visual risk indicator (Low, TOS Gray Area, Nuclear) | M3 | ORIGINAL_REQUEST R2 |
| 16 | Diagram Rendering | UTF-8 ASCII and Mermaid.js architecture diagrams | M3 | ORIGINAL_REQUEST R2 |
| 17 | Copy-Ready Code Blocks | Monospaced syntax-highlighted code blocks with copy button | M3 | ORIGINAL_REQUEST R2 |
| 18 | Brutal Reality Check Component | Callout for trade-offs, edge cases, why not to do this at scale | M3 | ORIGINAL_REQUEST R2 |
| 19 | Guide: Telegram Infinite S3 | Full technical guide on chunking binary files via Bot API | M4 | ORIGINAL_REQUEST R4 |
| 20 | Guide: True $0 Production Stack | Full guide on Turso + Cloudflare Workers + Resend + Better Auth | M4 | ORIGINAL_REQUEST R4 |
| 21 | Guide: Discord CDN Autopsy | Full guide on historical Discord CDN abuse & attachment URL revocation | M4 | ORIGINAL_REQUEST R4 |
| 22 | Static Build Validation | Clean `npm run build` output generating valid `dist/` directory | M5 | ORIGINAL_REQUEST Acceptance |
| 23 | E2E Test Suite Pass | 100% pass of Tiers 1-4 opaque-box tests | M5 | ORIGINAL_REQUEST Acceptance |
| 24 | Git Commit & Push | Repository committed and pushed to `origin/master` | M5 | ORIGINAL_REQUEST R5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Requirement-driven test harness, runner, and Tiers 1-4 test cases | None | DONE |
| 1 | Framework & Content Engine | Astro 5, Tailwind CSS, content collections config with strict Zod schema | None | DONE |
| 2 | Supabase Database Integration | `src/lib/supabase.ts`, TypeScript database types, client initialization | M1 | IN_PROGRESS |
| 3 | Brutalist Terminal UI & Catalog | Layouts, components (BurnCalculator, HackCatalog, SinMeter, BrutalRealityCheck, Sticky PR, slug route) | M1 | IN_PROGRESS |
| 4 | Seed Hack Guides Content | 3 complete irreverent articles with frontmatter, diagrams, code, and reality checks | M1 | IN_PROGRESS |
| 5 | Final Integration, E2E Pass & Git Deployment | Run 100% E2E tests, verify build and types, commit and push to origin/master | M2, M3, M4, E2E | PLANNED |

## Interface Contracts
### Content Engine ↔ UI Catalog (`src/content.config.ts` ↔ `src/components/HackCatalog.astro`)
- Content Collection Name: `hacks`
- Frontmatter Type: `HackFrontmatter`:
  - `title`: string
  - `description`: string
  - `replaces_saas`: string
  - `saas_target`: "Auth" | "Storage" | "Database" | "Logging" | "Email"
  - `estimated_monthly_savings`: number (positive integer)
  - `category`: "Active Sacrilege" | "Clean Loophole" | "The Graveyard"
  - `risk_level`: "Low" | "TOS Gray Area" | "Nuclear"
  - `primitives_abused`: string[]
  - `author_github`: string
  - `date_added`: string (YYYY-MM-DD)
  - `warning_banner`?: string
  - `is_deprecated`?: boolean

### Supabase Client Interface (`src/lib/supabase.ts`)
- Function: `getSupabase(): SupabaseClient<Database>`
- Fallback configuration:
  - URL: `import.meta.env.PUBLIC_SUPABASE_URL || "https://giyzluujybzqvyxwxfox.supabase.co"`
  - Anon Key: `import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_7h-rq_hVl5FId2zrQfhUmQ_HzUy9Dxi"`
- Export `supabase` instance and TypeScript types `Database`, `HackSubmission`.

### E2E Test Contract (`TEST_READY.md`)
- Test runner invocation: `node tests/e2e/runner.mjs`
- Exit code 0 on 100% test pass (82/82 passing).
