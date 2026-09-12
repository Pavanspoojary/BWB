/**
 * Authoritative Test Fixtures derived from:
 * - ORIGINAL_REQUEST.md
 * - PROJECT.md (§ Architecture, § Feature Inventory, § Interface Contracts)
 * - survey_report.md (§ 2, § 3, § 4, § 5, § 6)
 */

export const CATEGORIES = Object.freeze([
  'Active Sacrilege',
  'Clean Loophole',
  'The Graveyard',
]);

export const RISK_LEVELS = Object.freeze([
  'Low',
  'TOS Gray Area',
  'Nuclear',
]);

export const SAAS_TARGETS = Object.freeze([
  'Auth',
  'Storage',
  'Database',
  'Logging',
  'Email',
]);

export const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const SEED_HACKS = Object.freeze([
  {
    slug: 'telegram-infinite-s3-bucket',
    alt_slug: 'telegram-infinite-s3',
    title: 'Using Telegram as an Infinite S3 Bucket',
    description: 'Abusing Telegram Bot API and private channels as a zero-cost, unmetered blob storage layer bypassing AWS S3 egress fees.',
    replaces_saas: 'AWS S3 + CloudFront',
    saas_target: 'Storage',
    estimated_monthly_savings: 45,
    category: 'Active Sacrilege',
    risk_level: 'Nuclear',
    primitives_abused: [
      'Telegram Bot API',
      'Private Channel Storage',
      'Cloudflare Workers',
      'Multipart Streaming',
    ],
    author_github: 'builtwhilebroke',
    date_added: '2026-09-12',
    warning_banner: 'WARNING: Storing arbitrary files in Telegram channels violates Bot API Terms of Service. Expect account suspension if detected.',
    is_deprecated: false,
  },
  {
    slug: 'true-zero-dollar-production-stack',
    alt_slug: 'zero-dollar-production-stack',
    title: 'The True $0 Production Stack',
    description: 'A 100% TOS-compliant zero-dollar stack combining Cloudflare Workers, Turso libSQL, Better Auth, and Resend.',
    replaces_saas: 'Vercel Pro + PlanetScale + Clerk + SendGrid',
    saas_target: 'Database',
    estimated_monthly_savings: 120,
    category: 'Clean Loophole',
    risk_level: 'Low',
    primitives_abused: [
      'Cloudflare Workers Free Tier',
      'Turso libSQL Database',
      'Resend Transactional Email',
      'Better Auth Self-Hosted SQLite',
    ],
    author_github: 'builtwhilebroke',
    date_added: '2026-09-12',
    warning_banner: undefined,
    is_deprecated: false,
  },
  {
    slug: 'discord-cdn-autopsy',
    alt_slug: 'discord-cdn-autopsy',
    title: 'The Discord CDN Autopsy',
    description: 'Postmortem analysis of how developers abused Discord attachment URLs as a free CDN and how the 2024 HMAC patch broke thousands of websites.',
    replaces_saas: 'Imgur API / AWS S3 / Cloudinary',
    saas_target: 'Storage',
    estimated_monthly_savings: 30,
    category: 'The Graveyard',
    risk_level: 'Nuclear',
    primitives_abused: [
      'Discord Attachments API',
      'Discord Webhooks',
      'cdn.discordapp.com Unauthenticated Edge Cache',
    ],
    author_github: 'builtwhilebroke',
    date_added: '2026-09-12',
    warning_banner: 'PATCHED: Discord attachment links expire after 24 hours via mandatory cryptographic HMAC signatures.',
    is_deprecated: true,
  },
]);

export const SUPABASE_CONFIG = Object.freeze({
  DEFAULT_URL: 'https://giyzluujybzqvyxwxfox.supabase.co',
  DEFAULT_ANON_KEY: 'sb_publishable_7h-rq_hVl5FId2zrQfhUmQ_HzUy9Dxi',
});
