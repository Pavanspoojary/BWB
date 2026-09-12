/**
 * Tier 3: Cross-Feature Interactions - Filter & Calculator Pairwise Test Suite
 *
 * Verifies dynamic interplay between catalog filtering and financial burn calculations:
 * - Filtering by category updates both visible items and filtered active savings
 * - Filtering by SaaS target updates both visible items and filtered active savings
 * - Filtering by search query reflects precise subset economics
 * - Empty filter results update calculator to $0/mo active
 * - Resetting filters restores full $165/mo active baseline
 */

import { describe, it, expect } from '../runner.mjs';
import { SEED_HACKS } from '../helpers/fixtures.mjs';
import { filterCatalog, calculateActiveBurnSavings } from '../helpers/catalog_engine.mjs';

describe('Tier 3: Cross-Feature (Filter ↔ Calculator Dynamics)', () => {
  it('updates visible items and active savings when filtering by "Active Sacrilege"', () => {
    const filteredHacks = filterCatalog(SEED_HACKS, { category: 'Active Sacrilege' });
    expect(filteredHacks.length).toBe(1);
    expect(filteredHacks[0].slug).toBe('telegram-infinite-s3-bucket');

    const economics = calculateActiveBurnSavings(filteredHacks);
    expect(economics.activeTotal).toBe(45);
    expect(economics.graveyardTotal).toBe(0);
    expect(economics.annualAvoided).toBe(540); // $45 * 12
  });

  it('updates visible items and active savings when filtering by "Clean Loophole"', () => {
    const filteredHacks = filterCatalog(SEED_HACKS, { category: 'Clean Loophole' });
    expect(filteredHacks.length).toBe(1);
    expect(filteredHacks[0].slug).toBe('true-zero-dollar-production-stack');

    const economics = calculateActiveBurnSavings(filteredHacks);
    expect(economics.activeTotal).toBe(120);
    expect(economics.graveyardTotal).toBe(0);
    expect(economics.annualAvoided).toBe(1440); // $120 * 12
  });

  it('verifies filtering by "The Graveyard" isolates memorialized savings ($0 active, $30 graveyard)', () => {
    const filteredHacks = filterCatalog(SEED_HACKS, { category: 'The Graveyard' });
    expect(filteredHacks.length).toBe(1);
    expect(filteredHacks[0].slug).toBe('discord-cdn-autopsy');

    const economics = calculateActiveBurnSavings(filteredHacks);
    expect(economics.activeTotal).toBe(0); // Graveyard is inactive
    expect(economics.graveyardTotal).toBe(30);
    expect(economics.annualAvoided).toBe(0);
  });

  it('calculates aggregate economics when filtering by SaaS Target "Storage"', () => {
    // Both Telegram S3 ($45 active) and Discord CDN ($30 graveyard) match Storage
    const filteredHacks = filterCatalog(SEED_HACKS, { saasTarget: 'Storage' });
    expect(filteredHacks.length).toBe(2);

    const economics = calculateActiveBurnSavings(filteredHacks);
    expect(economics.activeTotal).toBe(45);
    expect(economics.graveyardTotal).toBe(30);
    expect(economics.activeTotal + economics.graveyardTotal).toBe(75);
  });

  it('calculates economics when filtering by query string "Cloudflare"', () => {
    // Both Telegram S3 ($45) and True $0 Stack ($120) use Cloudflare Workers
    const filteredHacks = filterCatalog(SEED_HACKS, { query: 'Cloudflare' });
    expect(filteredHacks.length).toBe(2);

    const economics = calculateActiveBurnSavings(filteredHacks);
    expect(economics.activeTotal).toBe(165);
    expect(economics.annualAvoided).toBe(1980);
  });

  it('verifies that zero matching filter results drive active savings to $0/mo', () => {
    const filteredHacks = filterCatalog(SEED_HACKS, {
      category: 'Clean Loophole',
      saasTarget: 'Storage',
    });
    expect(filteredHacks.length).toBe(0);

    const economics = calculateActiveBurnSavings(filteredHacks);
    expect(economics.activeTotal).toBe(0);
    expect(economics.graveyardTotal).toBe(0);
    expect(economics.annualAvoided).toBe(0);
  });

  it('restores baseline economics when filters are reset to default (ALL / ALL)', () => {
    // Baseline state: 3 hacks, $165 active, $30 graveyard, $1,980/yr
    const allHacks = filterCatalog(SEED_HACKS, { category: 'ALL', saasTarget: 'ALL', query: '' });
    expect(allHacks.length).toBe(3);

    const economics = calculateActiveBurnSavings(allHacks);
    expect(economics.activeTotal).toBe(165);
    expect(economics.graveyardTotal).toBe(30);
    expect(economics.annualAvoided).toBe(1980);
  });
});
