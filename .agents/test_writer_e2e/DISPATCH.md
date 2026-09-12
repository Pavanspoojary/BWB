## 2026-09-12T07:58:39Z
You are the E2E Test Writer for builtwhilebroke.tech.
Your working directory is: /Users/pavanspoojary/Developer/builtwhilebroke/.agents/test_writer_e2e

MANDATORY FIRST STEP:
Read the following authoritative files:
- /Users/pavanspoojary/Developer/builtwhilebroke/ORIGINAL_REQUEST.md
- /Users/pavanspoojary/Developer/builtwhilebroke/.agents/orchestrator_1/PROJECT.md
- /Users/pavanspoojary/Developer/builtwhilebroke/.agents/explorer_survey_3/survey_report.md

CRITICAL ENVIRONMENT INSTRUCTIONS:
- Whenever executing commands with run_command, you MUST prepend `PATH="/opt/homebrew/bin:$PATH"` (e.g., `PATH="/opt/homebrew/bin:$PATH" node ...`). Otherwise node fails with exit code 126.

YOUR MISSION (E2E Testing Track):
Design, implement, and verify the complete opaque-box E2E test suite for builtwhilebroke.tech:
1. Create `tests/e2e/runner.mjs`:
   - An independent, self-contained test runner that can run all tests, individual tiers (Tier 1, 2, 3, 4), or specific test suites.
   - Formats test outputs with pass/fail counts, execution time, and failure details.
   - Exits with code 0 on all tests pass, or non-zero on failure.
2. Implement 4 Tiers of comprehensive opaque-box tests covering all 24 features in `PROJECT.md § Feature Inventory`:
   - **Tier 1: Feature Coverage (>=5 tests per feature area)**:
     - `tests/e2e/tier1-features/schema_validation.test.mjs`: validates Zod schema against valid frontmatter fixtures, rejects missing/invalid fields, validates enums (category, risk_level, saas_target).
     - `tests/e2e/tier1-features/burn_calculator.test.mjs`: verifies calculation of total monthly burn savings across hacks (sums positive integer savings accurately).
     - `tests/e2e/tier1-features/catalog_filtering.test.mjs`: verifies filtering logic by category and SaaS target.
     - `tests/e2e/tier1-features/hack_routes.test.mjs`: verifies slug route resolution, rendering of Sin Meter, diagrams, copy-code blocks, and Brutal Reality Check.
     - `tests/e2e/tier1-features/supabase_integration.test.mjs`: verifies client initializes with URL and publishable key, validates fallback behavior.
     - `tests/e2e/tier1-features/static_build.test.mjs`: verifies static generation rules (pure HTML/CSS/JS, no runtime server requirements).
   - **Tier 2: Boundary & Corner Cases (>=5 tests per feature area)**:
     - `tests/e2e/tier2-boundary/boundary_schema.test.mjs`: tests boundary conditions for strings, dates, negative savings, unknown categories, zero primitives.
     - `tests/e2e/tier2-boundary/boundary_calculator.test.mjs`: empty catalog (0 savings), large savings values, single-item catalog, NaN/float protection.
     - `tests/e2e/tier2-boundary/boundary_filtering.test.mjs`: filtering with no matching results, all-inclusive filter, multi-criteria disjoint sets.
     - `tests/e2e/tier2-boundary/boundary_routes.test.mjs`: missing slug, special characters in slug, deprecated hacks with warning banners.
   - **Tier 2/3/4 ...**
