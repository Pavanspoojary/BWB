# Original User Request

## 2026-09-12T07:50:25Z

Build and deliver the complete, production-ready codebase and content schema for "builtwhilebroke.tech"—an irreverent, open-source library documenting radical architecture hacks that replace expensive SaaS tools with abused zero-dollar developer primitives.

Working directory: /Users/pavanspoojary/Developer/builtwhilebroke
Integrity mode: development

## Requirements

### R1. Framework & Content Engine (Astro + Tailwind CSS)
- Build with Astro 5 and Tailwind CSS configured for zero-runtime-cost static hosting on Cloudflare Pages.
- Implement Astro Content Collections with a strict Zod schema validating frontmatter for all hacks:
  - title: string
  - replaces_saas: string (e.g., "AWS S3 + CloudFront")
  - estimated_monthly_savings: number (e.g., 45)
  - category: enum ["Active Sacrilege", "Clean Loophole", "The Graveyard"]
  - risk_level: enum ["Low", "TOS Gray Area", "Nuclear"]
  - primitives_abused: array of strings
  - author_github: string
  - date_added: ISO date string

### R2. Dark-Mode Brutalist Terminal UI & Catalog
- High-contrast, dark-mode-first terminal/brutalist design system with monospaced accents and responsive mobile/desktop layouts.
- Hero Section: Includes a dynamic calculator aggregating "Total Monthly SaaS Burn Saved by This Site: $X,XXX/mo" across all active hacks.
- Filterable Catalog: Client-side filtering by category (Active Sacrilege, Clean Loophole, The Graveyard) and replaced SaaS target (Auth, Storage, Database, Logging, Email).
- Sticky PR Contribution Callout: "Submit a Hack via PR" prompt with direct link to GitHub contribution instructions.
- Individual Hack Page Template:
  - Visual "Sin Meter" / Risk Level badge (Low, TOS Gray Area, Nuclear).
  - Architecture flow diagrams rendered via Mermaid.js or ASCII diagrams.
  - Syntax-highlighted, copy-paste ready implementation code.
  - "Brutal Reality Check" section detailing technical trade-offs, edge cases, and why you shouldn't do this at scale.

### R3. Supabase Database Integration
- Configure Supabase database client using the provided environment variables:
  - URL: https://giyzluujybzqvyxwxfox.supabase.co
  - Key: sb_publishable_7h-rq_hVl5FId2zrQfhUmQ_HzUy9Dxi
- Provide a clean database utility module (src/lib/supabase.ts) and TypeScript types to support database queries and mutations.

### R4. Comprehensive Seed Hack Guides
Author three full-length, irreverent, technical articles in Markdown/MDX:
1. Active Sacrilege: "Using Telegram as an Infinite S3 Bucket" — chunking binary files through bot APIs, channel IDs as namespaces, and streaming reverse proxies.
2. Clean Loophole: "The True $0 Production Stack" — Turso SQLite + Cloudflare Workers + Resend + Better Auth for zero-cost sub-10ms global latency.
3. The Graveyard: "The Discord CDN Autopsy" — how developers abused Discord attachments as free CDNs, and why Discord revoked permanent attachment URLs.

### R5. Git Version Control & Deployment Readiness
- Maintain clean repository structure and commit all code.
- Ensure the remote origin (https://github.com/Pavanspoojary/builtwhilebroke.git) is configured and all changes are pushed.

## Acceptance Criteria

### Automated Verification
- [ ] npm run build runs cleanly to completion without warnings or errors, generating a valid static dist/ directory.
- [ ] Astro content collection validation passes all seed hack files against the Zod schema without type errors.
- [ ] TypeScript / Astro check passes with 0 errors.

### Functional Verification
- [ ] Real-time monthly burn calculator accurately sums estimated_monthly_savings from all loaded content.
- [ ] Catalog filtering by category and service replaced updates the visible hacks instantly.
- [ ] All 3 hack slug routes render individual pages with risk badges, diagrams, code blocks, and trade-offs.
- [ ] Supabase client initializes cleanly with environment variables.
- [ ] Git repository is committed and pushed to origin/master.
