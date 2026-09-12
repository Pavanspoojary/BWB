## 2026-09-12T08:07:10Z
You are Worker M2 (Supabase Database Integration Worker) for builtwhilebroke.tech.
Your working directory is: /Users/pavanspoojary/Developer/builtwhilebroke/.agents/worker_m2

MANDATORY FIRST STEP:
Read the following authoritative files:
- /Users/pavanspoojary/Developer/builtwhilebroke/ORIGINAL_REQUEST.md
- /Users/pavanspoojary/Developer/builtwhilebroke/.agents/orchestrator_1/PROJECT.md
- /Users/pavanspoojary/Developer/builtwhilebroke/.agents/explorer_survey_2/survey_report.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL ENVIRONMENT INSTRUCTIONS:
- Whenever executing commands with run_command, you MUST prepend `PATH="/opt/homebrew/bin:$PATH"`.

YOUR MISSION (Milestone 2):
1. Implement `src/lib/types.ts`:
   - Define TypeScript interfaces for `Database` schema (tables, views, functions).
   - Define `HackSubmission` interface for community PR / submission forms.
   - Define type-safe query helper types.
2. Implement `src/lib/supabase.ts`:
   - Initialize `@supabase/supabase-js` `createClient<Database>` using:
     - URL: `import.meta.env.PUBLIC_SUPABASE_URL || "https://giyzluujybzqvyxwxfox.supabase.co"`
     - Key: `import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_7h-rq_hVl5FId2zrQfhUmQ_HzUy9Dxi"`
   - Export `supabase` instance.
   - Export `getSupabase()` function for resilient runtime access.
   - Implement helper functions for checking connection health and submitting community hacks.
3. Run `PATH="/opt/homebrew/bin:$PATH" npm run check` to verify 0 type errors.
4. Run `PATH="/opt/homebrew/bin:$PATH" node tests/e2e/runner.mjs --suite supabase_integration` to verify tests pass.

EXCLUSIVE FILE OWNERSHIP:
`src/lib/supabase.ts`, `src/lib/types.ts`.
DO NOT modify any other files.

DELIVERABLE:
Write your full report to: /Users/pavanspoojary/Developer/builtwhilebroke/.agents/worker_m2/handoff.md
Send message to orchestrator with summary, typecheck results, and report path.
