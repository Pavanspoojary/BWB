## 2026-09-12T08:07:10Z

You are Worker M3 (Brutalist Terminal UI & Catalog Worker) for builtwhilebroke.tech.
Your working directory is: /Users/pavanspoojary/Developer/builtwhilebroke/.agents/worker_m3

MANDATORY FIRST STEP:
Read the following authoritative files:
- /Users/pavanspoojary/Developer/builtwhilebroke/ORIGINAL_REQUEST.md
- /Users/pavanspoojary/Developer/builtwhilebroke/.agents/orchestrator_1/PROJECT.md
- /Users/pavanspoojary/Developer/builtwhilebroke/.agents/explorer_survey_2/survey_report.md
- /Users/pavanspoojary/Developer/builtwhilebroke/.agents/explorer_survey_3/survey_report.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL ENVIRONMENT INSTRUCTIONS:
- Whenever executing commands with run_command, you MUST prepend `PATH="/opt/homebrew/bin:$PATH"`.

YOUR MISSION (Milestone 3):
Implement the complete Dark-Mode Brutalist Terminal UI System:
1. `src/layouts/BaseLayout.astro`:
   - Pitch black `#050505`, panel black `#0d0d0d`, terminal borders `#262626`, phosphor green `#22c55e`, amber `#f59e0b`, red `#ef4444`.
   - CRT terminal aesthetics (subtle scanline overlay, monospace font stack, sharp square corners `rounded-none`).
   - Terminal header with animated status dot (`[SYSTEM: ONLINE]`), title, GitHub link, and terminal footer.
2. `src/components/BurnCalculator.astro`:
   - Aggregates `estimated_monthly_savings` across active hacks.
   - Displays prominently: "Total Monthly SaaS Burn Saved: $XXX/mo" ($X,XXX/yr avoided spend).
   - Reactive / dynamic visual display with monospaced counter formatting.
3. `src/components/HackCatalog.astro`:
   - Client-side filterable catalog by category ("Active Sacrilege", "Clean Loophole", "The Graveyard") and SaaS target ("Auth", "Storage", "Database", "Logging", "Email").
   - Filter pill buttons with active state highlighting (phosphor green, warning amber, nuclear red).
   - Search input for real-time text query filtering across title, description, and abused primitives.
   - Responsive grid of brutalist hack cards displaying: title, replaces_saas, category badge, risk badge, monthly savings, primitives tags, author GitHub link, and link to `/hacks/[slug]`.
   - Empty state message when filters match 0 results.
4. `src/components/StickyPrCallout.astro`:
   - Sticky PR contribution callout banner with "Submit a Hack via PR" linking to GitHub repository instructions.
5. `src/components/SinMeter.astro`:
   - Visual "Sin Meter" widget displaying risk level: "Low" (green phosphor), "TOS Gray Area" (warning amber), "Nuclear" (critical red).
6. `src/components/BrutalRealityCheck.astro`:
   - High-contrast callout box detailing trade-offs, edge cases, scalability boundaries, and "why you shouldn't do this at scale".
7. `src/components/CodeBlock.astro`:
   - Syntax-highlighted monospaced code container with tab title and copy-to-clipboard button with visual feedback.
8. `src/pages/index.astro`:
   - Homepage layout pulling collection entries via `getCollection('hacks')`, rendering Hero, BurnCalculator, StickyPrCallout, and HackCatalog.
9. `src/pages/hacks/[slug].astro`:
   - Dynamic route rendering individual hack pages via `getStaticPaths()`.
   - Renders header metadata, Sin Meter risk badge, monthly savings, author link, abused primitives, architecture diagrams (ASCII/Mermaid), Markdown content via `<Content />`, and Brutal Reality Check section.
10. Verify with `PATH="/opt/homebrew/bin:$PATH" npm run check`, `PATH="/opt/homebrew/bin:$PATH" npm test`, and `PATH="/opt/homebrew/bin:$PATH" npx astro build`.

EXCLUSIVE FILE OWNERSHIP:
`src/layouts/**`, `src/components/**`, `src/pages/**`.
DO NOT modify `src/lib/**` or `src/content/hacks/**`.

DELIVERABLE:
Write your full report to: /Users/pavanspoojary/Developer/builtwhilebroke/.agents/worker_m3/handoff.md
Send message to orchestrator with summary, build verification results, and report path.
