/**
 * Tier 1: Feature Coverage - Catalog Filtering Test Suite
 *
 * Verifies filtering logic across:
 * - Category filter tabs ('Active Sacrilege', 'Clean Loophole', 'The Graveyard')
 * - SaaS Target filters ('Auth', 'Storage', 'Database', 'Logging', 'Email')
 * - Real-time keyword query filtering
 * - Empty state detection when zero hacks match active filters
 */

import { describe, it, expect } from '../runner.mjs';
import { SEED_HACKS } from '../helpers/fixtures.mjs';
import { filterCatalog } from '../helpers/catalog_engine.mjs';

describe('Tier 1: Catalog Client-Side Filtering', () => {
  it('returns all hacks when category="ALL" and saasTarget="ALL"', () => {
    const results = filterCatalog(SEED_HACKS, { category: 'ALL', saasTarget: 'ALL' });
    expect(results.length).toBe(3);
    expect(results.map(h => h.slug)).toContain('telegram-infinite-s3-bucket');
    expect(results.map(h => h.slug)).toContain('true-zero-dollar-production-stack');
    expect(results.map(h => h.slug)).toContain('discord-cdn-autopsy');
  });

  it('filters catalog by category "Active Sacrilege"', () => {
    const results = filterCatalog(SEED_HACKS, { category: 'Active Sacrilege' });
    expect(results.length).toBe(1);
    expect(results[0].slug).toBe('telegram-infinite-s3-bucket');
    expect(results[0].category).toBe('Active Sacrilege');
    expect(results[0].risk_level).toBe('Nuclear');
  });

  it('filters catalog by category "Clean Loophole"', () => {
    const results = filterCatalog(SEED_HACKS, { category: 'Clean Loophole' });
    expect(results.length).toBe(1);
    expect(results[0].slug).toBe('true-zero-dollar-production-stack');
    expect(results[0].category).toBe('Clean Loophole');
    expect(results[0].risk_level).toBe('Low');
  });

  it('filters catalog by category "The Graveyard"', () => {
    const results = filterCatalog(SEED_HACKS, { category: 'The Graveyard' });
    expect(results.length).toBe(1);
    expect(results[0].slug).toBe('discord-cdn-autopsy');
    expect(results[0].category).toBe('The Graveyard');
    expect(results[0].is_deprecated).toBe(true);
  });

  it('filters catalog by SaaS target "Storage" (returns 2 items)', () => {
    // Both Telegram S3 and Discord CDN target Storage
    const results = filterCatalog(SEED_HACKS, { saasTarget: 'Storage' });
    expect(results.length).toBe(2);
    const slugs = results.map(h => h.slug);
    expect(slugs).toContain('telegram-infinite-s3-bucket');
    expect(slugs).toContain('discord-cdn-autopsy');
  });

  it('filters catalog by SaaS target "Database" (returns 1 item)', () => {
    const results = filterCatalog(SEED_HACKS, { saasTarget: 'Database' });
    expect(results.length).toBe(1);
    expect(results[0].slug).toBe('true-zero-dollar-production-stack');
  });

  it('filters catalog by free text search query matching title or abused primitives', () => {
    // Search by primitive
    const cfResults = filterCatalog(SEED_HACKS, { query: 'Cloudflare Workers' });
    expect(cfResults.length).toBe(2); // Telegram and True $0 stack both abuse Cloudflare Workers

    // Search by specific title term
    const discordResults = filterCatalog(SEED_HACKS, { query: 'Autopsy' });
    expect(discordResults.length).toBe(1);
    expect(discordResults[0].slug).toBe('discord-cdn-autopsy');
  });

  it('correctly returns 0 results when filters are mutually exclusive / no matches', () => {
    // There are no hacks with category Clean Loophole AND target Storage in seed
    const results = filterCatalog(SEED_HACKS, {
      category: 'Clean Loophole',
      saasTarget: 'Storage',
    });
    expect(results.length).toBe(0);

    // Target 'Email' alone has 0 matching seed hacks
    const emailResults = filterCatalog(SEED_HACKS, { saasTarget: 'Email' });
    expect(emailResults.length).toBe(0);
  });
});
