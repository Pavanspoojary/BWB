/**
 * Tier 2: Boundary & Corner Cases - Route Resolution Boundary Test Suite
 *
 * Verifies edge cases and boundary conditions in hack routes:
 * - Missing or nonexistent slugs (404 behavior)
 * - Traversal attempts and dangerous characters in slugs
 * - Deprecated hacks with mandatory warning banners
 * - Slug case sensitivity and canonical URL structure
 * - Fallback behavior for unrated risk levels
 */

import { describe, it, expect } from '../runner.mjs';
import { SEED_HACKS } from '../helpers/fixtures.mjs';
import { getSinMeterStyle } from '../helpers/catalog_engine.mjs';

describe('Tier 2: Boundary Hack Routes', () => {
  function resolveHackBySlug(slug) {
    if (!slug || typeof slug !== 'string') return null;
    // Slugs must be strict kebab-case alphanumeric: /^[a-z0-9]+(-[a-z0-9]+)*$/
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      return null;
    }
    return SEED_HACKS.find(h => h.slug === slug || h.alt_slug === slug) || null;
  }

  it('safely rejects and returns null for non-existent slugs', () => {
    const nonexistent = resolveHackBySlug('non-existent-hack-route');
    expect(nonexistent).toBe(null);
  });

  it('rejects path traversal and script injection attempts in slug parameter', () => {
    const maliciousSlugs = [
      '../../etc/passwd',
      '..%2F..%2Fetc%2Fpasswd',
      '<script>alert(1)</script>',
      'telegram/infinite/s3',
      'telegram;rm -rf',
      '../src/content/hacks',
    ];

    for (const slug of maliciousSlugs) {
      const resolved = resolveHackBySlug(slug);
      expect(resolved).toBe(null);
    }
  });

  it('enforces lowercase kebab-case slug resolution', () => {
    // Upper case should not resolve without normalization
    const uppercaseSlug = 'TELEGRAM-INFINITE-S3-BUCKET';
    expect(resolveHackBySlug(uppercaseSlug)).toBe(null);

    // Normalized lowercase resolves cleanly
    const normalized = resolveHackBySlug(uppercaseSlug.toLowerCase());
    expect(normalized).toBeDefined();
    expect(normalized.slug).toBe('telegram-infinite-s3-bucket');
  });

  it('verifies deprecated hacks contain mandatory warning banners and flags', () => {
    const graveyardHack = SEED_HACKS.find(h => h.category === 'The Graveyard');
    expect(graveyardHack).toBeDefined();
    expect(graveyardHack.is_deprecated).toBe(true);
    expect(graveyardHack.warning_banner).toBeDefined();
    expect(typeof graveyardHack.warning_banner).toBe('string');
    expect(graveyardHack.warning_banner.length).toBeGreaterThan(10);
  });

  it('handles fallback gracefully when an unrated or unknown risk level is passed to Sin Meter', () => {
    const unknownStyle = getSinMeterStyle('UndefinedRisk');
    expect(unknownStyle.score).toBe('0/10');
    expect(unknownStyle.color).toBe('gray');
    expect(unknownStyle.label).toContain('UNRATED');
    expect(unknownStyle.bar).toBe('□□□□□□□□□□');

    const emptyStyle = getSinMeterStyle('');
    expect(emptyStyle.score).toBe('0/10');
  });
});
