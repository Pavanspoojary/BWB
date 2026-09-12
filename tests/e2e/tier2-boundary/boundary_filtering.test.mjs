/**
 * Tier 2: Boundary & Corner Cases - Catalog Filtering Boundary Test Suite
 *
 * Verifies edge cases and boundary conditions in catalog filtering:
 * - Empty matching results and empty-state triggering
 * - Leading/trailing whitespace in search queries
 * - Regex metacharacters and special characters in queries
 * - Multi-criteria disjoint filtering combinations
 * - Case-insensitivity across search queries
 * - Filtering against empty or null datasets
 */

import { describe, it, expect } from '../runner.mjs';
import { SEED_HACKS } from '../helpers/fixtures.mjs';
import { filterCatalog } from '../helpers/catalog_engine.mjs';

describe('Tier 2: Boundary Catalog Filtering', () => {
  it('handles search queries with leading and trailing whitespace', () => {
    const paddedQuery = '   Telegram   ';
    const results = filterCatalog(SEED_HACKS, { query: paddedQuery });
    expect(results.length).toBe(1);
    expect(results[0].slug).toBe('telegram-infinite-s3-bucket');
  });

  it('safely handles queries containing regex metacharacters without crashing', () => {
    // Queries with characters like *, +, ?, [, ], (, ), $, ^
    const specialQueries = [
      'S3 + CloudFront',
      '$0',
      'Better (Auth)',
      'Worker.*',
      '[Telegram]',
    ];

    for (const query of specialQueries) {
      // Should execute without throwing regex syntax error
      const results = filterCatalog(SEED_HACKS, { query });
      expect(Array.isArray(results)).toBe(true);
    }

    // Specific match check: "S3 + CloudFront" matches replaces_saas of Telegram
    const s3Results = filterCatalog(SEED_HACKS, { query: 'S3 + CloudFront' });
    expect(s3Results.length).toBe(1);
    expect(s3Results[0].slug).toBe('telegram-infinite-s3-bucket');
  });

  it('verifies disjoint multi-criteria filtering produces 0 results', () => {
    // "Clean Loophole" (category) + "Storage" (saasTarget) -> Disjoint in seed catalog
    const results = filterCatalog(SEED_HACKS, {
      category: 'Clean Loophole',
      saasTarget: 'Storage',
    });
    expect(results.length).toBe(0);

    // "The Graveyard" + "Database" -> Disjoint
    const graveDb = filterCatalog(SEED_HACKS, {
      category: 'The Graveyard',
      saasTarget: 'Database',
    });
    expect(graveDb.length).toBe(0);
  });

  it('verifies all-inclusive filter returns the full catalog unaltered', () => {
    const results = filterCatalog(SEED_HACKS, {
      category: 'ALL',
      saasTarget: 'ALL',
      query: '',
    });
    expect(results.length).toBe(SEED_HACKS.length);
    expect(results).toEqual(SEED_HACKS);
  });

  it('verifies full case insensitivity across query strings', () => {
    const upper = filterCatalog(SEED_HACKS, { query: 'TELEGRAM' });
    const lower = filterCatalog(SEED_HACKS, { query: 'telegram' });
    const mixed = filterCatalog(SEED_HACKS, { query: 'TeLeGrAm' });

    expect(upper.length).toBe(1);
    expect(lower.length).toBe(1);
    expect(mixed.length).toBe(1);
    expect(upper[0].slug).toBe(lower[0].slug);
    expect(lower[0].slug).toBe(mixed[0].slug);
  });

  it('gracefully handles empty catalog array without throwing', () => {
    const results = filterCatalog([], {
      category: 'Active Sacrilege',
      saasTarget: 'Storage',
      query: 'Telegram',
    });
    expect(results.length).toBe(0);
  });
});
