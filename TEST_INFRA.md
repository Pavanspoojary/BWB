# TEST_INFRA.md — BuiltWhileBroke.tech E2E Test Suite Architecture

## 1. Overview & Architecture

The E2E test harness for `builtwhilebroke.tech` is an independent, zero-dependency, opaque-box testing system written in pure Node.js (ESM). It validates the system behavior at pre-agreed public seams, enforcing strict contracts derived from `ORIGINAL_REQUEST.md`, `PROJECT.md`, and `survey_report.md`.

```
tests/e2e/
├── runner.mjs                         # Independent ESM test runner & assertion engine
├── helpers/
│   ├── fixtures.mjs                   # Authoritative seed data & enum definitions
│   ├── schema_validator.mjs           # Zod-compliant frontmatter validator
│   ├── catalog_engine.mjs             # Burn calculator & filtering logic engine
│   └── markdown_parser.mjs            # Raw markdown & frontmatter extractor
├── tier1-features/                    # TIER 1: Feature Coverage (42 tests)
│   ├── schema_validation.test.mjs     # Zod schema, required fields, enums
│   ├── burn_calculator.test.mjs       # SaaS monthly burn aggregation ($165/mo)
│   ├── catalog_filtering.test.mjs     # Category, SaaS target, search filters
│   ├── hack_routes.test.mjs           # Route resolution, Sin Meter, diagrams, reality check
│   ├── supabase_integration.test.mjs  # Supabase client URL, key, fallback logic
│   └── static_build.test.mjs          # Static generation rules, zero SSR runtime
├── tier2-boundary/                    # TIER 2: Boundary & Corner Cases (23 tests)
│   ├── boundary_schema.test.mjs       # String lengths, leap year dates, negative savings
│   ├── boundary_calculator.test.mjs   # Large numbers, single hack, NaN resilience, graveyard
│   ├── boundary_filtering.test.mjs    # Disjoint sets, regex characters, whitespace trimming
│   └── boundary_routes.test.mjs       # Nonexistent slugs, path traversal, deprecated warnings
├── tier3-cross-feature/               # TIER 3: Cross-Feature Interactions (12 tests)
│   ├── cross_filter_calculator.test.mjs # Filter state coupled to dynamic savings calculation
│   └── cross_schema_route.test.mjs    # Risk level binding to visual Sin Meter styles
└── tier4-application/                 # TIER 4: Real-World Scenarios (5 tests)
    └── scenarios.test.mjs             # Multi-step developer workflows & personas
```

---

## 2. Test Execution Commands

All tests can be run using native Node.js (v20+) with zero external npm dependencies required:

```bash
# Run the entire E2E test suite (All 4 Tiers, 82 tests)
PATH="/opt/homebrew/bin:$PATH" node tests/e2e/runner.mjs

# Run individual Tiers
PATH="/opt/homebrew/bin:$PATH" node tests/e2e/runner.mjs --tier 1
PATH="/opt/homebrew/bin:$PATH" node tests/e2e/runner.mjs --tier 2
PATH="/opt/homebrew/bin:$PATH" node tests/e2e/runner.mjs --tier 3
PATH="/opt/homebrew/bin:$PATH" node tests/e2e/runner.mjs --tier 4

# Run specific test suites by substring
PATH="/opt/homebrew/bin:$PATH" node tests/e2e/runner.mjs --suite schema
PATH="/opt/homebrew/bin:$PATH" node tests/e2e/runner.mjs --suite calculator
PATH="/opt/homebrew/bin:$PATH" node tests/e2e/runner.mjs --suite filtering

# Halt execution immediately on first failure
PATH="/opt/homebrew/bin:$PATH" node tests/e2e/runner.mjs --bail

# Execute an individual test file directly
PATH="/opt/homebrew/bin:$PATH" node tests/e2e/tier1-features/schema_validation.test.mjs
```

---

## 3. Tier Hierarchy & Coverage

### Tier 1: Feature Coverage (42 tests)
- **`schema_validation.test.mjs` (8 tests)**: Validates all 3 seed hacks against the strict frontmatter contract; rejects missing required fields; rejects invalid enum values for `category`, `risk_level`, and `saas_target`.
- **`burn_calculator.test.mjs` (7 tests)**: Verifies exact summation of active monthly savings ($45 Telegram + $120 True $0 Stack = $165/mo); isolates $30 graveyard savings; checks annual avoided spend ($1,980/year); checks currency formatting.
- **`catalog_filtering.test.mjs` (8 tests)**: Validates filtering by category (`Active Sacrilege`, `Clean Loophole`, `The Graveyard`), target (`Storage`, `Database`), keyword search query, and empty state detection.
- **`hack_routes.test.mjs` (7 tests)**: Verifies slug route resolution, Sin Meter visual ratings, architecture diagrams (ASCII/Mermaid), copyable code blocks, and Brutal Reality Check warnings.
- **`supabase_integration.test.mjs` (6 tests)**: Verifies default Supabase project URL (`https://giyzluujybzqvyxwxfox.supabase.co`), publishable key (`sb_publishable_7h-rq_hVl5FId2zrQfhUmQ_HzUy9Dxi`), fallback initialization, and Database schema types.
- **`static_build.test.mjs` (6 tests)**: Verifies Astro static generation configuration (`output: 'static'`), absence of Node.js SSR runtime entrypoints for Cloudflare Pages, build scripts, and dark brutalist theme tokens.

### Tier 2: Boundary & Corner Cases (23 tests)
- **`boundary_schema.test.mjs` (6 tests)**: Title lengths (2, 3, 120, 121 chars), description lengths (9, 10, 280, 281 chars), calendar date validity (Feb 30 rejection, leap years), zero/negative/fractional savings, GitHub handle constraints.
- **`boundary_calculator.test.mjs` (6 tests)**: Empty catalog ($0), extreme financial numbers ($1.5M/mo), single hack ($77/mo), NaN/null/undefined resilience, and graveyard-only catalog ($0 active).
- **`boundary_filtering.test.mjs` (6 tests)**: Leading/trailing whitespace query trimming, regex metacharacters in queries (`S3 + CloudFront`), disjoint multi-criteria filtering, case insensitivity, empty catalog safety.
- **`boundary_routes.test.mjs` (5 tests)**: Non-existent slugs (404), path traversal rejection (`../../etc/passwd`), deprecated warning banners, kebab-case enforcement, unrated risk fallback.

### Tier 3: Cross-Feature Interactions (12 tests)
- **`cross_filter_calculator.test.mjs` (7 tests)**: Pairwise interplay between dynamic UI filter selection and the financial burn calculator: category filters dynamically isolate subset savings; search queries update active burn; empty filters produce $0 active; resetting restores full $165/mo baseline.
- **`cross_schema_route.test.mjs` (5 tests)**: Binds frontmatter `risk_level` directly to route visual Sin Meter styling (Low -> green 2/10, TOS Gray Area -> amber 6/10, Nuclear -> red 10/10) and verifies breadcrumb construction.

### Tier 4: Real-World Application Scenarios (5 tests)
- **`scenarios.test.mjs` (5 tests)**:
  1. *Cash-strapped founder*: Discovers S3 alternative, inspects Telegram Bot API architecture, evaluates FLOOD_WAIT_X and TOS banhammer trade-offs in Brutal Reality Check.
  2. *Pragmatic developer*: Vets True $0 Production Stack for 100% compliance, reviews 4 zero-dollar primitives, calculates $1,440/yr savings.
  3. *Forensic developer*: Investigates Discord CDN autopsy, reviews 24-hour HMAC expiration killshot, verifies graveyard isolation.
  4. *Community contributor*: Authors a new Redis cache hack, validates against Zod schema, calculates updated $205/mo site savings.
  5. *Mobile user*: Operates within constrained 320px viewport, searches, filters, and recovers from empty search states.

---

## 4. Progressive Testability

The test suite is architected to support progressive verification during multi-agent implementation:
- **Fixture / Contract Mode**: Executes without requiring a pre-existing production build, allowing immediate testing of core logic, calculations, schemas, and routes.
- **Live Filesystem Inspection**: Automatically inspects `src/content/hacks/*.md`, `src/lib/supabase.ts`, `astro.config.mjs`, and `dist/index.html` as they are created by upstream milestone workers.
- **Exit Code Guarantee**: Always exits with code `0` on 100% success, or non-zero on failure, enabling automated CI/CD gating.
