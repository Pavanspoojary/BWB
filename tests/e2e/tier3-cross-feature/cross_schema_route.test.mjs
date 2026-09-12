/**
 * Tier 3: Cross-Feature Interactions - Schema ↔ Route Sin Meter Binding Test Suite
 *
 * Verifies that frontmatter schema properties flow directly into route UI components:
 * - risk_level enum values map directly to visual Sin Meter styles and CSS tokens
 * - Low -> green border, 2/10 score, "LAW-ABIDING CITIZEN"
 * - TOS Gray Area -> amber border, 6/10 score, "PROCEED WITH BURNER ACCOUNT"
 * - Nuclear -> red border, 10/10 score, "BANHAMMER IMMINENT"
 * - is_deprecated boolean triggers warning banner and graveyard styling
 * - Breadcrumb generation links schema category and slug together
 */

import { describe, it, expect } from '../runner.mjs';
import { SEED_HACKS } from '../helpers/fixtures.mjs';
import { getSinMeterStyle } from '../helpers/catalog_engine.mjs';
import { validateHackFrontmatter } from '../helpers/schema_validator.mjs';

describe('Tier 3: Cross-Feature (Schema ↔ Route Sin Meter Binding)', () => {
  it('maps Telegram S3 frontmatter risk_level ("Nuclear") to visual alert styles', () => {
    const hack = SEED_HACKS.find(h => h.slug === 'telegram-infinite-s3-bucket');
    expect(hack).toBeDefined();

    // Verify schema validation
    const validation = validateHackFrontmatter(hack);
    expect(validation.success).toBe(true);
    expect(validation.data.risk_level).toBe('Nuclear');

    // Verify route Sin Meter style output
    const style = getSinMeterStyle(validation.data.risk_level);
    expect(style.color).toBe('red');
    expect(style.cssBorder).toBe('border-red-600');
    expect(style.score).toBe('10/10');
    expect(style.label).toContain('BANHAMMER IMMINENT');
    expect(style.bar).toBe('■■■■■■■■■■');
  });

  it('maps True $0 Stack frontmatter risk_level ("Low") to visual safe styles', () => {
    const hack = SEED_HACKS.find(h => h.slug === 'true-zero-dollar-production-stack');
    expect(hack).toBeDefined();

    const validation = validateHackFrontmatter(hack);
    expect(validation.success).toBe(true);
    expect(validation.data.risk_level).toBe('Low');

    const style = getSinMeterStyle(validation.data.risk_level);
    expect(style.color).toBe('green');
    expect(style.cssBorder).toBe('border-green-500');
    expect(style.score).toBe('2/10');
    expect(style.label).toContain('LAW-ABIDING CITIZEN');
    expect(style.bar).toContain('■■');
  });

  it('maps hypothetical "TOS Gray Area" hack to warning amber styles', () => {
    const mockGrayAreaHack = {
      ...SEED_HACKS[0],
      title: 'Rotating AWS Free Tier Egress Proxies',
      risk_level: 'TOS Gray Area',
      category: 'Clean Loophole',
    };

    const validation = validateHackFrontmatter(mockGrayAreaHack);
    expect(validation.success).toBe(true);
    expect(validation.data.risk_level).toBe('TOS Gray Area');

    const style = getSinMeterStyle(validation.data.risk_level);
    expect(style.color).toBe('amber');
    expect(style.cssBorder).toBe('border-amber-500');
    expect(style.score).toBe('6/10');
    expect(style.label).toContain('PROCEED WITH BURNER ACCOUNT');
    expect(style.bar).toBe('■■■■■■□□□□');
  });

  it('binds is_deprecated frontmatter flag to warning banner and graveyard display', () => {
    const discordHack = SEED_HACKS.find(h => h.slug === 'discord-cdn-autopsy');
    expect(discordHack).toBeDefined();

    const validation = validateHackFrontmatter(discordHack);
    expect(validation.success).toBe(true);
    expect(validation.data.is_deprecated).toBe(true);
    expect(validation.data.category).toBe('The Graveyard');
    expect(validation.data.warning_banner).toBeDefined();
    expect(validation.data.warning_banner).toContain('PATCHED');
  });

  it('verifies route breadcrumb metadata generation from category and slug', () => {
    for (const hack of SEED_HACKS) {
      const categorySlug = hack.category.toLowerCase().replace(/\s+/g, '-');
      const breadcrumb = `$ cat /sys/hacks/${categorySlug}/${hack.slug}.md`;
      expect(breadcrumb).toMatch(/^\$ cat \/sys\/hacks\/[a-z0-9-]+\/[a-z0-9-]+\.md$/);
    }
  });
});
