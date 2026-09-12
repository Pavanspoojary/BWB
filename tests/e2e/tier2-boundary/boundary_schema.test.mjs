/**
 * Tier 2: Boundary & Corner Cases - Schema Boundaries Test Suite
 *
 * Verifies edge cases and boundary limits for frontmatter schema:
 * - String length boundaries (title 3-120, description 10-280, replaces_saas >=2)
 * - Calendar date boundaries and invalid dates (e.g. Feb 30, month 13)
 * - Numeric boundaries (0, -1, floating point decimals)
 * - Empty primitives array boundary
 * - GitHub username regex boundaries
 */

import { describe, it, expect } from '../runner.mjs';
import { SEED_HACKS } from '../helpers/fixtures.mjs';
import { validateHackFrontmatter } from '../helpers/schema_validator.mjs';

describe('Tier 2: Boundary Schema Validation', () => {
  const baseValid = { ...SEED_HACKS[0] };

  it('tests title length boundary conditions (min 3, max 120)', () => {
    // 2 chars -> fail
    expect(validateHackFrontmatter({ ...baseValid, title: 'AB' }).success).toBe(false);

    // 3 chars -> pass
    expect(validateHackFrontmatter({ ...baseValid, title: 'ABC' }).success).toBe(true);

    // 120 chars -> pass
    const exact120 = 'A'.repeat(120);
    expect(validateHackFrontmatter({ ...baseValid, title: exact120 }).success).toBe(true);

    // 121 chars -> fail
    const tooLong121 = 'A'.repeat(121);
    expect(validateHackFrontmatter({ ...baseValid, title: tooLong121 }).success).toBe(false);
  });

  it('tests description length boundary conditions (min 10, max 280)', () => {
    // 9 chars -> fail
    expect(validateHackFrontmatter({ ...baseValid, description: 'Short 123' }).success).toBe(false);

    // 10 chars -> pass
    expect(validateHackFrontmatter({ ...baseValid, description: '1234567890' }).success).toBe(true);

    // 280 chars -> pass
    const exact280 = 'D'.repeat(280);
    expect(validateHackFrontmatter({ ...baseValid, description: exact280 }).success).toBe(true);

    // 281 chars -> fail
    const tooLong281 = 'D'.repeat(281);
    expect(validateHackFrontmatter({ ...baseValid, description: tooLong281 }).success).toBe(false);
  });

  it('tests date format and calendar validity boundaries', () => {
    // Invalid format (US format)
    expect(validateHackFrontmatter({ ...baseValid, date_added: '09-12-2026' }).success).toBe(false);
    expect(validateHackFrontmatter({ ...baseValid, date_added: '2026/09/12' }).success).toBe(false);

    // Calendar non-existent date: Feb 30
    expect(validateHackFrontmatter({ ...baseValid, date_added: '2026-02-30' }).success).toBe(false);

    // Month 13
    expect(validateHackFrontmatter({ ...baseValid, date_added: '2026-13-01' }).success).toBe(false);

    // Valid leap year check: 2024-02-29
    expect(validateHackFrontmatter({ ...baseValid, date_added: '2024-02-29' }).success).toBe(true);

    // Non-leap year Feb 29: 2025-02-29 -> fail
    expect(validateHackFrontmatter({ ...baseValid, date_added: '2025-02-29' }).success).toBe(false);
  });

  it('tests zero, negative, and floating point savings boundary conditions', () => {
    // Zero savings -> fail (must be positive integer)
    expect(validateHackFrontmatter({ ...baseValid, estimated_monthly_savings: 0 }).success).toBe(false);

    // Negative savings -> fail
    expect(validateHackFrontmatter({ ...baseValid, estimated_monthly_savings: -1 }).success).toBe(false);
    expect(validateHackFrontmatter({ ...baseValid, estimated_monthly_savings: -500 }).success).toBe(false);

    // Minimum valid positive integer: 1 -> pass
    expect(validateHackFrontmatter({ ...baseValid, estimated_monthly_savings: 1 }).success).toBe(true);

    // Float / fractional savings -> fail (must be integer)
    expect(validateHackFrontmatter({ ...baseValid, estimated_monthly_savings: 45.99 }).success).toBe(false);
  });

  it('tests empty and invalid primitives_abused array boundaries', () => {
    // Empty array -> fail
    expect(validateHackFrontmatter({ ...baseValid, primitives_abused: [] }).success).toBe(false);

    // Array with empty strings -> fail
    expect(validateHackFrontmatter({ ...baseValid, primitives_abused: [''] }).success).toBe(false);
    expect(validateHackFrontmatter({ ...baseValid, primitives_abused: ['   '] }).success).toBe(false);

    // Exactly 1 valid primitive -> pass
    expect(validateHackFrontmatter({ ...baseValid, primitives_abused: ['Telegram Bot API'] }).success).toBe(true);
  });

  it('tests GitHub username formatting boundary conditions', () => {
    // Valid handles
    expect(validateHackFrontmatter({ ...baseValid, author_github: 'a' }).success).toBe(true);
    expect(validateHackFrontmatter({ ...baseValid, author_github: 'octocat' }).success).toBe(true);
    expect(validateHackFrontmatter({ ...baseValid, author_github: 'built-while-broke' }).success).toBe(true);

    // Invalid handles: leading dash
    expect(validateHackFrontmatter({ ...baseValid, author_github: '-octocat' }).success).toBe(false);

    // Invalid handles: contains @ symbol
    expect(validateHackFrontmatter({ ...baseValid, author_github: '@octocat' }).success).toBe(false);

    // Invalid handles: contains space
    expect(validateHackFrontmatter({ ...baseValid, author_github: 'octo cat' }).success).toBe(false);
  });
});
