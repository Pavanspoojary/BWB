/**
 * Tier 2: Boundary & Corner Cases - Burn Calculator Boundary Test Suite
 *
 * Verifies edge cases in SaaS Burn calculations:
 * - Empty catalog (0 savings)
 * - Extremely large savings values without numerical overflow
 * - Single-item catalog calculations
 * - NaN, null, undefined, and non-numeric value resilience
 * - Catalog containing exclusively graveyard items ($0 active savings)
 * - Negative and zero savings resilience
 */

import { describe, it, expect } from '../runner.mjs';
import { calculateActiveBurnSavings } from '../helpers/catalog_engine.mjs';

describe('Tier 2: Boundary Burn Calculator', () => {
  it('calculates $0 savings for empty catalog array', () => {
    const result = calculateActiveBurnSavings([]);
    expect(result.activeTotal).toBe(0);
    expect(result.graveyardTotal).toBe(0);
    expect(result.annualAvoided).toBe(0);
  });

  it('handles extremely large savings figures without numerical overflow', () => {
    const largeCatalog = [
      {
        title: 'Enterprise Bandwidth Hijack',
        category: 'Active Sacrilege',
        estimated_monthly_savings: 500000, // $500k/mo
        is_deprecated: false,
      },
      {
        title: 'Cloudflare Zero-Egress Storage',
        category: 'Clean Loophole',
        estimated_monthly_savings: 1000000, // $1M/mo
        is_deprecated: false,
      },
    ];

    const result = calculateActiveBurnSavings(largeCatalog);
    expect(result.activeTotal).toBe(1500000);
    expect(result.annualAvoided).toBe(18000000); // $18M/year
  });

  it('calculates accurately for a single-item catalog', () => {
    const singleHack = [
      {
        title: 'Solo Hack',
        category: 'Active Sacrilege',
        estimated_monthly_savings: 77,
        is_deprecated: false,
      },
    ];

    const result = calculateActiveBurnSavings(singleHack);
    expect(result.activeTotal).toBe(77);
    expect(result.graveyardTotal).toBe(0);
    expect(result.annualAvoided).toBe(77 * 12);
  });

  it('safely handles non-numeric, null, or NaN savings values without crashing', () => {
    const corruptedCatalog = [
      {
        title: 'Corrupted Hack 1',
        category: 'Active Sacrilege',
        estimated_monthly_savings: NaN,
      },
      {
        title: 'Corrupted Hack 2',
        category: 'Clean Loophole',
        estimated_monthly_savings: undefined,
      },
      {
        title: 'Corrupted Hack 3',
        category: 'Active Sacrilege',
        estimated_monthly_savings: 'invalid',
      },
      {
        title: 'Valid Hack',
        category: 'Clean Loophole',
        estimated_monthly_savings: 50,
      },
    ];

    const result = calculateActiveBurnSavings(corruptedCatalog);
    expect(result.activeTotal).toBe(50);
    expect(Number.isFinite(result.activeTotal)).toBe(true);
  });

  it('safely handles zero and negative numbers by ignoring them in savings sum', () => {
    const negativeCatalog = [
      {
        title: 'Negative Hack',
        category: 'Active Sacrilege',
        estimated_monthly_savings: -100,
      },
      {
        title: 'Zero Hack',
        category: 'Clean Loophole',
        estimated_monthly_savings: 0,
      },
      {
        title: 'Legit Hack',
        category: 'Clean Loophole',
        estimated_monthly_savings: 65,
      },
    ];

    const result = calculateActiveBurnSavings(negativeCatalog);
    expect(result.activeTotal).toBe(65);
  });

  it('calculates $0 active savings when all items in catalog are Graveyard items', () => {
    const graveyardOnly = [
      {
        title: 'Dead Hack 1',
        category: 'The Graveyard',
        estimated_monthly_savings: 30,
        is_deprecated: true,
      },
      {
        title: 'Dead Hack 2',
        category: 'The Graveyard',
        estimated_monthly_savings: 40,
        is_deprecated: true,
      },
    ];

    const result = calculateActiveBurnSavings(graveyardOnly);
    expect(result.activeTotal).toBe(0);
    expect(result.graveyardTotal).toBe(70);
    expect(result.annualAvoided).toBe(0);
  });
});
