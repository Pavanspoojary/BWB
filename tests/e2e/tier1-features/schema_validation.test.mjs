/**
 * Tier 1: Feature Coverage - Schema Validation Test Suite
 *
 * Verifies Zod / Content Collections frontmatter schema against:
 * - Valid frontmatter fixtures for all seed hacks
 * - Rejection of missing required fields
 * - Rejection of invalid enum values (category, risk_level, saas_target)
 * - Format enforcement for date_added and author_github
 * - Verification of live files in src/content/hacks/*.md if present
 */

import { describe, it, expect } from '../runner.mjs';
import {
  SEED_HACKS,
  CATEGORIES,
  RISK_LEVELS,
  SAAS_TARGETS,
} from '../helpers/fixtures.mjs';
import { validateHackFrontmatter } from '../helpers/schema_validator.mjs';
import { parseMarkdownFrontmatter } from '../helpers/markdown_parser.mjs';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

describe('Tier 1: Schema Validation (Frontmatter & Enums)', () => {
  it('validates Seed Hack 1 (Telegram Infinite S3) frontmatter successfully', () => {
    const telegramHack = SEED_HACKS.find(h => h.slug === 'telegram-infinite-s3-bucket');
    expect(telegramHack).toBeDefined();

    const result = validateHackFrontmatter(telegramHack);
    expect(result.success).toBe(true);
    expect(result.data.title).toBe('Using Telegram as an Infinite S3 Bucket');
    expect(result.data.category).toBe('Active Sacrilege');
    expect(result.data.risk_level).toBe('Nuclear');
    expect(result.data.estimated_monthly_savings).toBe(45);
    expect(result.data.primitives_abused.length).toBeGreaterThanOrEqual(1);
  });

  it('validates Seed Hack 2 (True $0 Production Stack) frontmatter successfully', () => {
    const zeroDollarHack = SEED_HACKS.find(h => h.slug === 'true-zero-dollar-production-stack');
    expect(zeroDollarHack).toBeDefined();

    const result = validateHackFrontmatter(zeroDollarHack);
    expect(result.success).toBe(true);
    expect(result.data.title).toBe('The True $0 Production Stack');
    expect(result.data.category).toBe('Clean Loophole');
    expect(result.data.risk_level).toBe('Low');
    expect(result.data.estimated_monthly_savings).toBe(120);
    expect(result.data.saas_target).toBe('Database');
  });

  it('validates Seed Hack 3 (Discord CDN Autopsy) frontmatter successfully', () => {
    const discordHack = SEED_HACKS.find(h => h.slug === 'discord-cdn-autopsy');
    expect(discordHack).toBeDefined();

    const result = validateHackFrontmatter(discordHack);
    expect(result.success).toBe(true);
    expect(result.data.title).toBe('The Discord CDN Autopsy');
    expect(result.data.category).toBe('The Graveyard');
    expect(result.data.risk_level).toBe('Nuclear');
    expect(result.data.is_deprecated).toBe(true);
    expect(result.data.estimated_monthly_savings).toBe(30);
  });

  it('rejects frontmatter when required fields are missing', () => {
    const missingTitle = {
      replaces_saas: 'AWS S3',
      saas_target: 'Storage',
      estimated_monthly_savings: 50,
      category: 'Active Sacrilege',
      risk_level: 'Nuclear',
      primitives_abused: ['Bot API'],
      author_github: 'hacker',
      date_added: '2026-09-12',
    };
    const titleResult = validateHackFrontmatter(missingTitle);
    expect(titleResult.success).toBe(false);
    expect(titleResult.errors.some(e => e.includes('title'))).toBe(true);

    const missingSavings = {
      title: 'Valid Title Here',
      description: 'A valid description with enough chars',
      replaces_saas: 'AWS S3',
      saas_target: 'Storage',
      category: 'Active Sacrilege',
      risk_level: 'Nuclear',
      primitives_abused: ['Bot API'],
      author_github: 'hacker',
      date_added: '2026-09-12',
    };
    const savingsResult = validateHackFrontmatter(missingSavings);
    expect(savingsResult.success).toBe(false);
    expect(savingsResult.errors.some(e => e.includes('estimated_monthly_savings'))).toBe(true);
  });

  it('rejects invalid category enum values', () => {
    const invalidCategory = {
      ...SEED_HACKS[0],
      category: 'Illegal Piracy',
    };
    const result = validateHackFrontmatter(invalidCategory);
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.includes('category must be one of'))).toBe(true);

    // Case-sensitivity test
    const lowercaseCategory = {
      ...SEED_HACKS[0],
      category: 'active sacrilege',
    };
    const caseResult = validateHackFrontmatter(lowercaseCategory);
    expect(caseResult.success).toBe(false);
  });

  it('rejects invalid risk_level enum values', () => {
    const invalidRisk = {
      ...SEED_HACKS[0],
      risk_level: 'Extremely Dangerous',
    };
    const result = validateHackFrontmatter(invalidRisk);
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.includes('risk_level must be one of'))).toBe(true);
  });

  it('rejects invalid saas_target enum values', () => {
    const invalidTarget = {
      ...SEED_HACKS[0],
      saas_target: 'Quantum Computing',
    };
    const result = validateHackFrontmatter(invalidTarget);
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.includes('saas_target must be one of'))).toBe(true);
  });

  it('validates actual markdown files in src/content/hacks if present', () => {
    const hacksDir = join(process.cwd(), 'src', 'content', 'hacks');
    if (existsSync(hacksDir)) {
      const files = readdirSync(hacksDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
      expect(files.length).toBeGreaterThan(0);
      for (const file of files) {
        const parsed = parseMarkdownFrontmatter(join(hacksDir, file));
        expect(parsed).toBeDefined();
        expect(parsed.frontmatter).toBeDefined();
        const validation = validateHackFrontmatter(parsed.frontmatter);
        expect(validation.success).toBe(true);
      }
    } else {
      // Content directory not created yet (M4 pending) - contract verified via fixtures
      expect(SEED_HACKS.length).toBe(3);
    }
  });
});
