/**
 * Tier 1: Feature Coverage - Rule-Based Moderation Engine Test Suite
 *
 * Verifies rule-based content moderation for sticky notes:
 * - Profanity and abusive language detection
 * - Leetspeak and delimiter evasion normalization (e.g. f.u.c.k, sh!t)
 * - Severe hate speech and violent harassment filtering
 * - False positive protection for legitimate English terms (classic, pass, assistant)
 * - Commercial spam, crypto airdrop scams, get-rich schemes, casino spam
 * - Repetitive gibberish, word spam, and shouting detection
 * - Malicious URL filtering (javascript:, raw IPs, localhost, invalid TLDs)
 * - Maker handle validation and system account impersonation blocks
 * - Structural field length and substance constraints
 */

import { describe, it, expect } from '../runner.mjs';
import {
  moderateStickyNote,
  checkProfanityAndAbuse,
  checkSpamPatterns,
  validateUrl,
  validateHandle,
  normalizeLeetspeak,
} from '../../../src/lib/moderationEngine.ts';

describe('Tier 1: Rule-Based Moderation Engine - Profanity & Abuse', () => {
  it('detects plain profanity in text', () => {
    const r1 = checkProfanityAndAbuse('This app is absolute bullshit');
    expect(r1.flagged).toBe(true);

    const r2 = checkProfanityAndAbuse('What a fucking great tool');
    expect(r2.flagged).toBe(true);

    const r3 = checkProfanityAndAbuse('Built for dumbass founders');
    expect(r3.flagged).toBe(true);
  });

  it('normalizes and catches leetspeak obfuscations', () => {
    // Leetspeak normalization helpers
    expect(normalizeLeetspeak('sh!t')).toBe('shit');
    expect(normalizeLeetspeak('f4gg0t')).toBe('faggot');
    expect(normalizeLeetspeak('@ssh0le')).toBe('asshole');

    const r1 = checkProfanityAndAbuse('sh!t product');
    expect(r1.flagged).toBe(true);

    const r2 = checkProfanityAndAbuse('f.u.c.k this app');
    expect(r2.flagged).toBe(true);

    const r3 = checkProfanityAndAbuse('b*i*t*c*h mode');
    expect(r3.flagged).toBe(true);

    const r4 = checkProfanityAndAbuse('fuuuuuck');
    expect(r4.flagged).toBe(true);
  });

  it('blocks severe slurs, hate speech, and violent threats', () => {
    const r1 = checkProfanityAndAbuse('go kys right now');
    expect(r1.flagged).toBe(true);

    const r2 = checkProfanityAndAbuse('kill yourself please');
    expect(r2.flagged).toBe(true);

    const r3 = checkProfanityAndAbuse('n!gger token');
    expect(r3.flagged).toBe(true);

    const r4 = checkProfanityAndAbuse('bomb threat generator');
    expect(r4.flagged).toBe(true);
  });

  it('protects against Scunthorpe false positives in legitimate tech words', () => {
    // None of these legitimate terms should trigger profanity rules
    const legitimateWords = [
      'Neotic product changelog',
      'Classical music streamer',
      'PassKey auth manager',
      'AI assistant for lawyers',
      'Financial analyst copilot',
      'Document converter tool',
      'Cocktail recipe finder',
      'Bass guitar tuner app',
      'Grassroots campaign tracker',
      'Scunthorpe indie meetup',
    ];

    for (const text of legitimateWords) {
      const check = checkProfanityAndAbuse(text);
      expect(check.flagged).toBe(false);
    }
  });
});

describe('Tier 1: Rule-Based Moderation Engine - Spam & Scams', () => {
  it('detects crypto airdrop and pump-and-dump scams', () => {
    const r1 = checkSpamPatterns('Claim free crypto airdrop today');
    expect(r1.flagged).toBe(true);

    const r2 = checkSpamPatterns('Connect wallet to claim 1000 USDT');
    expect(r2.flagged).toBe(true);

    const r3 = checkSpamPatterns('Double your btc in 24 hours guaranteed');
    expect(r3.flagged).toBe(true);

    const r4 = checkSpamPatterns('100x gem guaranteed send eth to address');
    expect(r4.flagged).toBe(true);
  });

  it('detects financial get-rich schemes and phishing patterns', () => {
    const r1 = checkSpamPatterns('Make $500 a day from home');
    expect(r1.flagged).toBe(true);

    const r2 = checkSpamPatterns('Get rich quick with this AI loophole');
    expect(r2.flagged).toBe(true);

    const r3 = checkSpamPatterns('Passive income guaranteed with zero work');
    expect(r3.flagged).toBe(true);

    const r4 = checkSpamPatterns('Free gift card giveaway click now');
    expect(r4.flagged).toBe(true);
  });

  it('detects adult, pharma, and casino spam', () => {
    const r1 = checkSpamPatterns('Best online casino with free spins bonus');
    expect(r1.flagged).toBe(true);

    const r2 = checkSpamPatterns('Buy viagra online without prescription');
    expect(r2.flagged).toBe(true);

    const r3 = checkSpamPatterns('Exclusive onlyfans leaks archive');
    expect(r3.flagged).toBe(true);
  });

  it('detects solicitation channel and bot spam', () => {
    const r1 = checkSpamPatterns('Contact on whatsapp +1234567890');
    expect(r1.flagged).toBe(true);

    const r2 = checkSpamPatterns('Join my telegram group t.me/joinchat/12345');
    expect(r2.flagged).toBe(true);
  });

  it('detects gibberish repetition, word spam, and shouting', () => {
    // Character repetition
    const r1 = checkSpamPatterns('Check out aaaaaaaaapp');
    expect(r1.flagged).toBe(true);

    // Repetitive word spam
    const r2 = checkSpamPatterns('buy buy buy this product now');
    expect(r2.flagged).toBe(true);

    // Shouting ALL-CAPS
    const r3 = checkSpamPatterns('THE MOST INCREDIBLE SOFTWARE EVER CREATED');
    expect(r3.flagged).toBe(true);

    // Excessive punctuation
    const r4 = checkSpamPatterns('Best app ever!!!!!');
    expect(r4.flagged).toBe(true);
  });
});

describe('Tier 1: Rule-Based Moderation Engine - URLs & Handles', () => {
  it('validates safe and legitimate URLs', () => {
    expect(validateUrl('https://neotic.app').valid).toBe(true);
    expect(validateUrl('https://builtwhilebroke.tech/').valid).toBe(true);
    expect(validateUrl('shiplog.dev').valid).toBe(true);
    expect(validateUrl('https://sub.domain.co.uk/path?q=1').valid).toBe(true);
    expect(validateUrl('').valid).toBe(true); // Optional
  });

  it('rejects unsafe protocols and script injections', () => {
    expect(validateUrl('javascript:alert(1)').valid).toBe(false);
    expect(validateUrl('data:text/html;base64,PHNjcmlwdD4=').valid).toBe(false);
    expect(validateUrl('vbscript:msgbox(1)').valid).toBe(false);
    expect(validateUrl('https://site.com/<script>evil()</script>').valid).toBe(false);
  });

  it('rejects localhost, raw IP addresses, and invalid domains', () => {
    expect(validateUrl('http://localhost:3000').valid).toBe(false);
    expect(validateUrl('http://127.0.0.1/admin').valid).toBe(false);
    expect(validateUrl('http://192.168.1.1').valid).toBe(false);
    expect(validateUrl('http://45.33.32.156').valid).toBe(false);
    expect(validateUrl('not-a-domain').valid).toBe(false);
  });

  it('validates legitimate maker handles', () => {
    expect(validateHandle('@pavan').valid).toBe(true);
    expect(validateHandle('steventey').valid).toBe(true);
    expect(validateHandle('@founder_123').valid).toBe(true);
    expect(validateHandle('').valid).toBe(true); // Optional -> @anon
  });

  it('rejects reserved system handles and malicious impersonation', () => {
    expect(validateHandle('@admin').valid).toBe(false);
    expect(validateHandle('@builtwhilebroke').valid).toBe(false);
    expect(validateHandle('@root').valid).toBe(false);
    expect(validateHandle('@system').valid).toBe(false);
    expect(validateHandle('@moderator').valid).toBe(false);
    expect(validateHandle('@support').valid).toBe(false);
  });

  it('rejects profanity in maker handles', () => {
    expect(validateHandle('@asshole_dev').valid).toBe(false);
    expect(validateHandle('@fucker').valid).toBe(false);
  });
});

describe('Tier 1: Rule-Based Moderation Engine - Full Sticky Note Orchestration', () => {
  it('approves clean legitimate developer products', () => {
    const result = moderateStickyNote({
      name: 'ShipLog',
      tagline: 'Changelog-as-a-service for indie hackers',
      url: 'https://shiplog.dev',
      maker: '@pavan',
    });

    expect(result.valid).toBe(true);
    expect(result.violations.length).toBe(0);
  });

  it('rejects abusive product names', () => {
    const result = moderateStickyNote({
      name: 'FuckApp',
      tagline: 'A fast project management suite for remote teams',
      url: 'https://fuckapp.dev',
      maker: '@builder',
    });

    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.field === 'name')).toBe(true);
  });

  it('rejects crypto scam pitches', () => {
    const result = moderateStickyNote({
      name: 'CoinDrop',
      tagline: 'Claim free crypto airdrop by connecting your wallet',
      url: 'https://coindrop.io',
      maker: '@crypto_wiz',
    });

    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.field === 'tagline')).toBe(true);
  });

  it('rejects empty or structurally invalid submissions', () => {
    const r1 = moderateStickyNote({
      name: '',
      tagline: '',
    });
    expect(r1.valid).toBe(false);
    expect(r1.violations.some(v => v.rule === 'NAME_REQUIRED')).toBe(true);
    expect(r1.violations.some(v => v.rule === 'TAGLINE_REQUIRED')).toBe(true);

    const r2 = moderateStickyNote({
      name: '$$$',
      tagline: 'Hi',
    });
    expect(r2.valid).toBe(false);
    expect(r2.violations.some(v => v.rule === 'NAME_NO_ALPHANUMERIC')).toBe(true);
    expect(r2.violations.some(v => v.rule === 'TAGLINE_TOO_SHORT')).toBe(true);
  });

  it('rejects multiple violations simultaneously and reports each offending field', () => {
    const result = moderateStickyNote({
      name: 'sh!t tool',
      tagline: 'Make $5000 a day with zero effort guaranteed',
      url: 'javascript:alert("pwned")',
      maker: '@admin',
    });

    expect(result.valid).toBe(false);
    expect(result.violations.length).toBe(4);
    expect(result.violations.some(v => v.field === 'name')).toBe(true);
    expect(result.violations.some(v => v.field === 'tagline')).toBe(true);
    expect(result.violations.some(v => v.field === 'url')).toBe(true);
    expect(result.violations.some(v => v.field === 'maker')).toBe(true);
  });
});
