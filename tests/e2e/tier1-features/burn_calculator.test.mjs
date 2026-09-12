/**
 * Tier 1: Feature Coverage - Burn Calculator Test Suite
 *
 * Verifies calculation of total monthly burn savings across hacks:
 * - Sums positive integer savings accurately across active hacks ($165/mo)
 * - Excludes memorialized graveyard hacks from active savings tally
 * - Calculates annual avoided expenditure ($1,980/year)
 * - Computes per-category financial breakdown
 * - Dynamic addition of new hack savings
 * - Currency formatting ($X,XXX/mo)
 */

import { describe, it, expect } from '../runner.mjs';
import { SEED_HACKS } from '../helpers/fixtures.mjs';
import { calculateActiveBurnSavings } from '../helpers/catalog_engine.mjs';

describe('Tier 1: Dynamic SaaS Burn Calculator', () => {
  it('calculates active monthly burn savings for baseline seed hacks accurately ($165/mo)', () => {
    // Oracle: Telegram ($45) + True $0 Stack ($120) = $165
    // Discord CDN ($30) is Graveyard, thus excluded from active burn
    const result = calculateActiveBurnSavings(SEED_HACKS);
    expect(result.activeTotal).toBe(165);
  });

  it('correctly tracks and isolates graveyard savings from active total ($30/mo)', () => {
    const result = calculateActiveBurnSavings(SEED_HACKS);
    expect(result.graveyardTotal).toBe(30);
    // Active ($165) + Graveyard ($30) = $195 total documented potential
    expect(result.activeTotal + result.graveyardTotal).toBe(195);
  });

  it('calculates annual avoided expenditure accurately ($1,980/year)', () => {
    // Oracle: $165 * 12 = $1,980
    const result = calculateActiveBurnSavings(SEED_HACKS);
    expect(result.annualAvoided).toBe(1980);
    expect(result.annualAvoided).toBe(result.activeTotal * 12);
  });

  it('computes accurate financial breakdown by category', () => {
    const result = calculateActiveBurnSavings(SEED_HACKS);
    expect(result.categoryBreakdown['Active Sacrilege']).toBe(45);
    expect(result.categoryBreakdown['Clean Loophole']).toBe(120);
    expect(result.categoryBreakdown['The Graveyard']).toBe(30);
  });

  it('dynamically increments active total when new active hacks are appended', () => {
    const customHack = {
      title: 'Free Logging Hack',
      category: 'Active Sacrilege',
      estimated_monthly_savings: 80,
      is_deprecated: false,
    };
    const combined = [...SEED_HACKS, customHack];
    const result = calculateActiveBurnSavings(combined);
    // 165 + 80 = 245
    expect(result.activeTotal).toBe(245);
    expect(result.annualAvoided).toBe(245 * 12);
  });

  it('formats display currency string correctly ($X,XXX/mo)', () => {
    const result = calculateActiveBurnSavings(SEED_HACKS);
    const formatted = `$${result.activeTotal.toLocaleString('en-US')}/mo`;
    expect(formatted).toBe('$165/mo');

    const largeResult = { activeTotal: 4250 };
    const largeFormatted = `$${largeResult.activeTotal.toLocaleString('en-US')}/mo`;
    expect(largeFormatted).toBe('$4,250/mo');
  });

  it('gracefully handles empty catalog array with $0 savings', () => {
    const result = calculateActiveBurnSavings([]);
    expect(result.activeTotal).toBe(0);
    expect(result.graveyardTotal).toBe(0);
    expect(result.annualAvoided).toBe(0);
  });
});
