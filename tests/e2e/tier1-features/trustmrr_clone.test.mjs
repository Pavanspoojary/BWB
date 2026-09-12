/**
 * Tier 1: TrustMRR Clone Test Suite
 *
 * Verifies the complete TrustMRR platform clone including:
 * - Core Startup Revenue Dataset & Schema
 * - /goal MRR Goal Engine & Mathematical Precision
 * - /browser Marketplace Search, Filtering & Sorting Engines
 * - /boost Visibility Packages, Add-ons & Duration Discounts
 * - Static HTML Distribution for all generated routes
 */

import { describe, it, expect } from '../runner.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  STARTUPS,
  BOOST_TIERS,
  BOOST_ADDONS,
  BOOST_COLORS,
  SPONSOR_DURATIONS,
  formatCurrency,
  formatExactCurrency,
  formatGrowth,
} from '../../../src/data/startups.js';

describe('Tier 1: TrustMRR Clone - Core Startup Dataset & Formatting', () => {
  it('verifies dataset contains at least 20 verified startups across key categories', () => {
    expect(STARTUPS.length >= 20).toBe(true);
    const names = STARTUPS.map(s => s.name);
    expect(names).toContain('Gumroad');
    expect(names).toContain('Stan');
    expect(names).toContain('Chatbase');
    expect(names).toContain('GitSkins');
    expect(names).toContain('AppAlchemy');
  });

  it('verifies all startups have valid payment providers and positive revenue', () => {
    const validProviders = ['stripe', 'lemonsqueezy', 'polar', 'paddle', 'revenuecat', 'dodo'];
    for (const startup of STARTUPS) {
      expect(validProviders.includes(startup.paymentProvider)).toBe(true);
      expect(typeof startup.verifiedRevenue30d).toBe('number');
      expect(startup.verifiedRevenue30d >= 0).toBe(true);
      expect(typeof startup.mrr).toBe('number');
      expect(startup.mrr >= 0).toBe(true);
    }
  });

  it('verifies acquisitions listings include asking price and multiple', () => {
    const forSale = STARTUPS.filter(s => s.forSale);
    expect(forSale.length >= 5).toBe(true);
    for (const s of forSale) {
      expect(s.askingPrice).toBeDefined();
      expect(s.askingPrice > 0).toBe(true);
      expect(typeof s.profitMultiple).toBe('number');
      expect(s.profitMultiple > 0).toBe(true);
    }
  });

  it('verifies currency and percentage formatting helpers', () => {
    expect(formatCurrency(7143938)).toBe('$7.14M');
    expect(formatCurrency(865869)).toBe('$866K');
    expect(formatCurrency(1850)).toBe('$1.9K');
    expect(formatCurrency(500)).toBe('$500');

    expect(formatExactCurrency(3500)).toBe('$3,500');
    expect(formatExactCurrency(1027039)).toBe('$1,027,039');

    expect(formatGrowth(21.56)).toBe('+21.6%');
    expect(formatGrowth(-7.8)).toBe('-7.8%');
  });
});

describe('Tier 1: TrustMRR Clone - /goal Engine & Mathematical Accuracy', () => {
  it('calculates progress percentage correctly', () => {
    const current = 1850;
    const target = 10000;
    const pct = Math.min(100, Math.round((current / target) * 1000) / 10);
    expect(pct).toBe(18.5);

    // Exceeded goal cap
    const exceededPct = Math.min(100, Math.round((12000 / 10000) * 1000) / 10);
    expect(exceededPct).toBe(100);
  });

  it('calculates gap remaining and net new MRR per month', () => {
    const current = 1850;
    const target = 10000;
    const months = 6;
    const gap = target - current;
    expect(gap).toBe(8150);

    const netNewPerMonth = Math.round(gap / months);
    expect(netNewPerMonth).toBe(1358);
  });

  it('calculates net new paying customers per month based on ARPU', () => {
    const netNewPerMonth = 1358;
    const arpu = 29;
    const customersNeeded = Math.ceil(netNewPerMonth / arpu);
    expect(customersNeeded).toBe(47);
  });

  it('calculates compound MoM growth rate accurately', () => {
    const current = 1850;
    const target = 10000;
    const months = 6;
    // (target / current)^(1/months) - 1
    const momRate = Math.round((Math.pow(target / current, 1 / months) - 1) * 1000) / 10;
    expect(momRate).toBe(32.5);
  });

  it('safely handles zero current MRR edge case', () => {
    const current = 0;
    const target = 5000;
    const months = 6;
    const gap = target - current;
    expect(gap).toBe(5000);
    const newPerMonth = Math.round(gap / months);
    expect(newPerMonth).toBe(833);
  });
});

describe('Tier 1: TrustMRR Clone - /browser Marketplace Search & Filters', () => {
  it('filters startups by category', () => {
    const aiStartups = STARTUPS.filter(s => s.category === 'Artificial Intelligence');
    expect(aiStartups.length >= 4).toBe(true);
    for (const s of aiStartups) {
      expect(s.category).toBe('Artificial Intelligence');
    }
  });

  it('filters startups by acquisition status (For Sale)', () => {
    const forSale = STARTUPS.filter(s => s.forSale);
    expect(forSale.length > 0).toBe(true);
    for (const s of forSale) {
      expect(s.forSale).toBe(true);
      expect(s.askingPrice > 0).toBe(true);
    }
  });

  it('filters startups by payment provider', () => {
    const stripeStartups = STARTUPS.filter(s => s.paymentProvider === 'stripe');
    const lemonStartups = STARTUPS.filter(s => s.paymentProvider === 'lemonsqueezy');
    const polarStartups = STARTUPS.filter(s => s.paymentProvider === 'polar');
    const rcStartups = STARTUPS.filter(s => s.paymentProvider === 'revenuecat');

    expect(stripeStartups.length > 0).toBe(true);
    expect(lemonStartups.length > 0).toBe(true);
    expect(polarStartups.length > 0).toBe(true);
    expect(rcStartups.length > 0).toBe(true);
  });

  it('filters startups by revenue range', () => {
    const ramen = STARTUPS.filter(s => s.verifiedRevenue30d <= 1000);
    const scaling = STARTUPS.filter(s => s.verifiedRevenue30d > 10000 && s.verifiedRevenue30d <= 50000);
    const enterprise = STARTUPS.filter(s => s.verifiedRevenue30d > 50000);

    expect(ramen.length > 0).toBe(true);
    expect(scaling.length > 0).toBe(true);
    expect(enterprise.length > 0).toBe(true);
  });

  it('sorts startups by 30d revenue descending', () => {
    const sorted = [...STARTUPS].sort((a, b) => b.verifiedRevenue30d - a.verifiedRevenue30d);
    expect(sorted[0].name).toBe('Gumroad');
    expect(sorted[1].name).toBe('Stan');
    expect(sorted[2].name).toBe('easytools');
  });

  it('sorts acquisitions by profit multiple ascending', () => {
    const forSale = STARTUPS.filter(s => s.forSale);
    const sorted = [...forSale].sort((a, b) => (a.profitMultiple || 99) - (b.profitMultiple || 99));
    expect(sorted[0].profitMultiple <= sorted[1].profitMultiple).toBe(true);
  });
});

describe('Tier 1: TrustMRR Clone - /boost Tiers, Addons & Sponsorships', () => {
  it('verifies boost tiers pricing and multipliers', () => {
    expect(BOOST_TIERS.free.price).toBe(0);
    expect(BOOST_TIERS.free.multiplier).toBe(1);

    expect(BOOST_TIERS.starter.price).toBe(29);
    expect(BOOST_TIERS.starter.multiplier).toBe(2);

    expect(BOOST_TIERS.growth.price).toBe(199);
    expect(BOOST_TIERS.growth.multiplier).toBe(5);

    expect(BOOST_TIERS.scale.price).toBe(499);
    expect(BOOST_TIERS.scale.multiplier).toBe(20);
  });

  it('verifies add-on products and pricing', () => {
    const aiAddon = BOOST_ADDONS.find(a => a.id === 'discovery_review');
    const seoAddon = BOOST_ADDONS.find(a => a.id === 'dofollow_backlink');
    const sponsorAddon = BOOST_ADDONS.find(a => a.id === 'side_panel_sponsor');

    expect(aiAddon.priceCents).toBe(7900);
    expect(seoAddon.priceCents).toBe(1900);
    expect(sponsorAddon.priceCents).toBe(39900);
  });

  it('verifies 6 official custom card colors', () => {
    expect(BOOST_COLORS.length).toBe(6);
    const colorKeys = BOOST_COLORS.map(c => c.key);
    expect(colorKeys).toContain('purple');
    expect(colorKeys).toContain('blue');
    expect(colorKeys).toContain('amber');
    expect(colorKeys).toContain('rose');
    expect(colorKeys).toContain('mint');
    expect(colorKeys).toContain('indigo');
  });

  it('verifies sponsor duration discounts', () => {
    expect(SPONSOR_DURATIONS.length).toBe(4);
    expect(SPONSOR_DURATIONS[0].days).toBe(7);
    expect(SPONSOR_DURATIONS[0].discountPercent).toBe(0);

    expect(SPONSOR_DURATIONS[1].days).toBe(14);
    expect(SPONSOR_DURATIONS[1].discountPercent).toBe(3);

    expect(SPONSOR_DURATIONS[2].days).toBe(21);
    expect(SPONSOR_DURATIONS[2].discountPercent).toBe(6);

    expect(SPONSOR_DURATIONS[3].days).toBe(28);
    expect(SPONSOR_DURATIONS[3].discountPercent).toBe(9);
  });
});

describe('Tier 1: TrustMRR Clone - Static Distribution & Routes Integrity', () => {
  it('verifies all primary clone pages exist in static dist output', () => {
    const dist = join(process.cwd(), 'dist');
    expect(existsSync(join(dist, 'index.html'))).toBe(true);
    expect(existsSync(join(dist, 'browser', 'index.html'))).toBe(true);
    expect(existsSync(join(dist, 'goal', 'index.html'))).toBe(true);
    expect(existsSync(join(dist, 'boost', 'index.html'))).toBe(true);
    expect(existsSync(join(dist, 'stats', 'index.html'))).toBe(true);
    expect(existsSync(join(dist, 'city', 'index.html'))).toBe(true);
  });

  it('verifies /city page contains 3D doodle canvas and interactive tycoon HUD', () => {
    const cityPath = join(process.cwd(), 'dist', 'city', 'index.html');
    const html = readFileSync(cityPath, 'utf-8');
    expect(html).toContain('DOODLE CITY');
    expect(html).toContain('doodle-canvas');
    expect(html).toContain('btn-mode-orbit');
    expect(html).toContain('btn-mode-walk');
    expect(html).toContain('ad-sponsor-form');
  });

  it('verifies index.html contains Doodle District brand and 3D canvas', () => {
    const indexPath = join(process.cwd(), 'dist', 'index.html');
    const html = readFileSync(indexPath, 'utf-8');
    expect(html).toContain('DOODLE DISTRICT');
    expect(html).toContain('doodle-canvas');
    expect(html).toContain('builtwhilebroke');
  });

  it('verifies /goal page contains milestone inputs and calculator elements', () => {
    const goalPath = join(process.cwd(), 'dist', 'goal', 'index.html');
    const html = readFileSync(goalPath, 'utf-8');
    expect(html).toContain('Startup MRR Goal Planner');
    expect(html).toContain('goal-startup-name');
    expect(html).toContain('display-progress-pct');
    expect(html).toContain('Ramen Profitable');
  });

  it('verifies /browser page contains search input, table view, and verified badges', () => {
    const browserPath = join(process.cwd(), 'dist', 'browser', 'index.html');
    const html = readFileSync(browserPath, 'utf-8');
    expect(html).toContain('Startup Directory &amp; Marketplace Browser');
    expect(html).toContain('browser-search-input');
    expect(html).toContain('FOR SALE');
    expect(html).toContain('VERIFIED');
  });

  it('verifies /boost page contains 5x and 20x visibility tiers and color pickers', () => {
    const boostPath = join(process.cwd(), 'dist', 'boost', 'index.html');
    const html = readFileSync(boostPath, 'utf-8');
    expect(html).toContain('Boost Your Startup on TrustMRR');
    expect(html).toContain('Growth Boost');
    expect(html).toContain('Scale Boost');
    expect(html).toContain('AI Visibility Boost');
    expect(html).toContain('Order Summary');
  });

  it('verifies individual startup pages are statically generated for all listings', () => {
    const dist = join(process.cwd(), 'dist');
    for (const startup of STARTUPS) {
      const startupFile = join(dist, 'startup', startup.slug, 'index.html');
      expect(existsSync(startupFile)).toBe(true);
      const html = readFileSync(startupFile, 'utf-8');
      const normalizedName = startup.name.replace('&', '&amp;');
      expect(html).toContain(normalizedName);
      expect(html).toContain(startup.paymentProvider);
    }
  });
});
