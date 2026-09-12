/**
 * Tier 4: Real-World Application Scenarios Test Suite
 *
 * Simulates end-to-end multi-step developer workflows:
 * - Scenario 1: Cash-strapped founder searching for S3 replacement & evaluating risk
 * - Scenario 2: Pragmatic developer discovering and vetting the True $0 Stack
 * - Scenario 3: Forensic developer inspecting the Discord CDN Autopsy postmortem
 * - Scenario 4: Community contributor preparing a pull request with schema validation
 * - Scenario 5: Constrained viewport / mobile user searching, filtering, and 404 recovery
 */

import { describe, it, expect } from '../runner.mjs';
import { SEED_HACKS } from '../helpers/fixtures.mjs';
import {
  filterCatalog,
  calculateActiveBurnSavings,
  getSinMeterStyle,
} from '../helpers/catalog_engine.mjs';
import { validateHackFrontmatter } from '../helpers/schema_validator.mjs';

describe('Tier 4: Real-World Application Scenarios', () => {
  it('Scenario 1: Cash-strapped founder replaces AWS S3 and evaluates risk trade-offs', () => {
    // Step 1: Founder visits site, checks baseline active savings
    const initialEconomics = calculateActiveBurnSavings(SEED_HACKS);
    expect(initialEconomics.activeTotal).toBe(165);

    // Step 2: Filters by SaaS target "Storage"
    const storageHacks = filterCatalog(SEED_HACKS, { saasTarget: 'Storage' });
    expect(storageHacks.length).toBe(2);

    // Step 3: Selects the active storage hack (Telegram Infinite S3)
    const telegramHack = storageHacks.find(h => h.category === 'Active Sacrilege');
    expect(telegramHack).toBeDefined();
    expect(telegramHack.slug).toBe('telegram-infinite-s3-bucket');

    // Step 4: Inspects Sin Meter badge
    const sinStyle = getSinMeterStyle(telegramHack.risk_level);
    expect(sinStyle.color).toBe('red');
    expect(sinStyle.score).toBe('10/10');
    expect(sinStyle.label).toContain('BANHAMMER IMMINENT');

    // Step 5: Verifies savings and primitives
    expect(telegramHack.estimated_monthly_savings).toBe(45);
    expect(telegramHack.primitives_abused).toContain('Telegram Bot API');
    expect(telegramHack.primitives_abused).toContain('Cloudflare Workers');

    // Step 6: Verifies reality check warnings
    expect(telegramHack.warning_banner).toBeDefined();
    expect(telegramHack.warning_banner).toContain('WARNING');
  });

  it('Scenario 2: Developer vets the True $0 Production Stack for TOS compliance', () => {
    // Step 1: Developer filters by "Clean Loophole"
    const loopholeHacks = filterCatalog(SEED_HACKS, { category: 'Clean Loophole' });
    expect(loopholeHacks.length).toBe(1);

    const stackHack = loopholeHacks[0];
    expect(stackHack.title).toBe('The True $0 Production Stack');

    // Step 2: Vets risk rating (must be Low / TOS compliant)
    const sinStyle = getSinMeterStyle(stackHack.risk_level);
    expect(sinStyle.color).toBe('green');
    expect(sinStyle.score).toBe('2/10');
    expect(sinStyle.label).toContain('LAW-ABIDING CITIZEN');

    // Step 3: Verifies all 4 primitives are free-tier compliant
    expect(stackHack.primitives_abused).toEqual([
      'Cloudflare Workers Free Tier',
      'Turso libSQL Database',
      'Resend Transactional Email',
      'Better Auth Self-Hosted SQLite',
    ]);

    // Step 4: Calculates annual cost savings ($120/mo * 12 = $1,440/yr)
    const annualSavings = stackHack.estimated_monthly_savings * 12;
    expect(annualSavings).toBe(1440);
  });

  it('Scenario 3: Forensic developer investigates Discord CDN autopsy and migration path', () => {
    // Step 1: Developer looks up memorialized hacks in The Graveyard
    const deadHacks = filterCatalog(SEED_HACKS, { category: 'The Graveyard' });
    expect(deadHacks.length).toBe(1);

    const discordHack = deadHacks[0];
    expect(discordHack.slug).toBe('discord-cdn-autopsy');
    expect(discordHack.is_deprecated).toBe(true);

    // Step 2: Confirms warning banner details HMAC cryptographic expiration
    expect(discordHack.warning_banner).toContain('HMAC');
    expect(discordHack.warning_banner).toContain('24 hours');

    // Step 3: Verifies graveyard savings are excluded from active monthly burn calculation
    const economics = calculateActiveBurnSavings(SEED_HACKS);
    expect(economics.activeTotal).toBe(165); // Excludes $30 Discord CDN
    expect(economics.graveyardTotal).toBe(30);
  });

  it('Scenario 4: Community developer prepares a compliant PR contribution', () => {
    // Step 1: Developer constructs new hack blueprint
    const proposedHack = {
      title: 'GitHub Actions Artifacts as Temporary Blob Cache',
      description: 'Using ephemeral GitHub Action build artifact storage as a zero-dollar fast cache.',
      replaces_saas: 'Redis / Upstash',
      saas_target: 'Storage',
      estimated_monthly_savings: 40,
      category: 'Active Sacrilege',
      risk_level: 'TOS Gray Area',
      primitives_abused: ['GitHub Actions API', 'Artifact Storage API'],
      author_github: 'indie-hacker-42',
      date_added: '2026-09-12',
      is_deprecated: false,
    };

    // Step 2: Validates against strict Zod frontmatter contract
    const validation = validateHackFrontmatter(proposedHack);
    expect(validation.success).toBe(true);

    // Step 3: Evaluates site burn impact once merged
    const updatedCatalog = [...SEED_HACKS, validation.data];
    const newEconomics = calculateActiveBurnSavings(updatedCatalog);
    // Baseline $165 + $40 = $205/mo
    expect(newEconomics.activeTotal).toBe(205);
    expect(newEconomics.annualAvoided).toBe(205 * 12); // $2,460/yr
  });

  it('Scenario 5: Mobile user performs keyword search, filter toggle, and empty state recovery', () => {
    // Step 1: Search by partial keyword "turso"
    const searchMatch = filterCatalog(SEED_HACKS, { query: 'turso' });
    expect(searchMatch.length).toBe(1);
    expect(searchMatch[0].slug).toBe('true-zero-dollar-production-stack');

    // Step 2: Search by non-existent technology "Kubernetes Enterprise"
    const emptySearch = filterCatalog(SEED_HACKS, { query: 'Kubernetes Enterprise' });
    expect(emptySearch.length).toBe(0);

    // Step 3: Verify empty state economics
    const emptyEconomics = calculateActiveBurnSavings(emptySearch);
    expect(emptyEconomics.activeTotal).toBe(0);

    // Step 4: Clear search query, reset to ALL -> full catalog restored
    const restored = filterCatalog(SEED_HACKS, { query: '' });
    expect(restored.length).toBe(3);
  });
});
