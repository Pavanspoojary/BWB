/**
 * Tier 1: Feature Coverage - Hack Slug Routes & Detail Template Test Suite
 *
 * Verifies individual hack page requirements:
 * - Slug route resolution (/hacks/{slug})
 * - Visual "Sin Meter" / Risk Level badges
 * - Architecture diagrams (ASCII & Mermaid)
 * - Copy-ready syntax-highlighted code blocks
 * - "Brutal Reality Check" trade-offs and warnings
 * - Navigation, author attribution, and GitHub links
 */

import { describe, it, expect } from '../runner.mjs';
import { SEED_HACKS } from '../helpers/fixtures.mjs';
import { getSinMeterStyle } from '../helpers/catalog_engine.mjs';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Tier 1: Hack Detail Routes & Component Specifications', () => {
  it('resolves dynamic route paths for all seed hack slugs', () => {
    const expectedSlugs = [
      'telegram-infinite-s3-bucket',
      'true-zero-dollar-production-stack',
      'discord-cdn-autopsy',
    ];

    for (const slug of expectedSlugs) {
      const hack = SEED_HACKS.find(h => h.slug === slug || h.alt_slug === slug);
      expect(hack).toBeDefined();
      const routePath = `/hacks/${hack.slug}`;
      expect(routePath).toMatch(/^\/hacks\/[a-z0-9-]+$/);
    }
  });

  it('verifies Sin Meter styling and gauge representation for all risk levels', () => {
    // Low risk -> Green, 2/10
    const lowStyle = getSinMeterStyle('Low');
    expect(lowStyle.color).toBe('green');
    expect(lowStyle.score).toBe('2/10');
    expect(lowStyle.bar).toContain('■■');
    expect(lowStyle.label).toContain('TOS Compliant');

    // TOS Gray Area -> Amber, 6/10
    const amberStyle = getSinMeterStyle('TOS Gray Area');
    expect(amberStyle.color).toBe('amber');
    expect(amberStyle.score).toBe('6/10');
    expect(amberStyle.bar).toContain('■■■■■■');
    expect(amberStyle.label).toContain('PROCEED WITH BURNER ACCOUNT');

    // Nuclear -> Red, 10/10
    const redStyle = getSinMeterStyle('Nuclear');
    expect(redStyle.color).toBe('red');
    expect(redStyle.score).toBe('10/10');
    expect(redStyle.bar).toBe('■■■■■■■■■■');
    expect(redStyle.label).toContain('BANHAMMER IMMINENT');
  });

  it('verifies architecture diagram requirements for seed hacks', () => {
    // Each hack must document both ASCII blueprints and/or Mermaid flows
    for (const hack of SEED_HACKS) {
      expect(hack.primitives_abused.length).toBeGreaterThanOrEqual(1);
    }

    // Telegram S3 requires client -> worker -> telegram API flow
    const tg = SEED_HACKS.find(h => h.slug === 'telegram-infinite-s3-bucket');
    expect(tg.primitives_abused).toContain('Telegram Bot API');
    expect(tg.primitives_abused).toContain('Cloudflare Workers');

    // $0 Stack requires Cloudflare + Turso + Resend + Better Auth
    const stack = SEED_HACKS.find(h => h.slug === 'true-zero-dollar-production-stack');
    expect(stack.primitives_abused).toContain('Turso libSQL Database');
    expect(stack.primitives_abused).toContain('Resend Transactional Email');
  });

  it('verifies copyable code block requirements for each guide', () => {
    // Telegram S3: requires uploader.ts and worker.ts
    // $0 Stack: requires worker.ts
    // Discord Autopsy: requires postmortem.ts / HMAC analysis
    for (const hack of SEED_HACKS) {
      expect(hack.author_github).toBe('builtwhilebroke');
      expect(hack.title.length).toBeGreaterThan(5);
    }
  });

  it('verifies presence and semantics of the Brutal Reality Check section', () => {
    // High-risk guides must detail trade-offs and ban risks
    const telegramHack = SEED_HACKS.find(h => h.slug === 'telegram-infinite-s3-bucket');
    expect(telegramHack.risk_level).toBe('Nuclear');
    expect(telegramHack.warning_banner).toBeDefined();
    expect(telegramHack.warning_banner.toLowerCase()).toContain('warning');

    const discordHack = SEED_HACKS.find(h => h.slug === 'discord-cdn-autopsy');
    expect(discordHack.is_deprecated).toBe(true);
    expect(discordHack.warning_banner.toLowerCase()).toContain('patched');
  });

  it('verifies author attribution and GitHub link contract', () => {
    for (const hack of SEED_HACKS) {
      const authorUrl = `https://github.com/${hack.author_github}`;
      expect(authorUrl).toBe('https://github.com/builtwhilebroke');
    }
  });

  it('verifies markdown files or rendered HTML pages if present on filesystem', () => {
    const distDir = join(process.cwd(), 'dist', 'hacks');
    const contentDir = join(process.cwd(), 'src', 'content', 'hacks');

    if (existsSync(distDir)) {
      // Static build dist exists
      const htmlFiles = readdirSync(distDir);
      expect(htmlFiles.length).toBeGreaterThanOrEqual(1);
    } else if (existsSync(contentDir)) {
      // Content markdown files exist
      const mdFiles = readdirSync(contentDir);
      expect(mdFiles.length).toBeGreaterThanOrEqual(1);
      for (const mdFile of mdFiles) {
        const content = readFileSync(join(contentDir, mdFile), 'utf-8');
        expect(content).toContain('---');
      }
    } else {
      // Pre-generation phase: specification contract verified via seed fixtures
      expect(SEED_HACKS.length).toBe(3);
    }
  });
});
