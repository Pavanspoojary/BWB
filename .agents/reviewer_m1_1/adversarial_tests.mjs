import { z } from 'zod';

// Mirroring the exact schema from src/content.config.ts
export const CategoryEnum = z.enum([
  'Active Sacrilege',
  'Clean Loophole',
  'The Graveyard',
]);

export const RiskLevelEnum = z.enum([
  'Low',
  'TOS Gray Area',
  'Nuclear',
]);

export const SaasTargetEnum = z.enum([
  'Auth',
  'Storage',
  'Database',
  'Logging',
  'Email',
]);

export const hackSchema = z.object({
  category: CategoryEnum,
  risk_level: RiskLevelEnum,
  saas_target: SaasTargetEnum,
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  replaces_saas: z.string().min(1, 'replaces_saas is required'),
  estimated_monthly_savings: z.number().int().positive('Savings must be a positive integer'),
  primitives_abused: z.array(z.string().min(1)).min(1, 'At least one abused primitive must be listed'),
  author_github: z.string().min(1, 'author_github is required'),
  date_added: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date_added must be formatted as YYYY-MM-DD'),
  warning_banner: z.string().optional(),
  is_deprecated: z.boolean().optional().default(false),
});

const baseValid = {
  title: 'Using Telegram as an Infinite S3 Bucket',
  description: 'Abusing Telegram Bot API and private channels as a zero-cost, unmetered blob storage layer bypassing AWS S3 egress fees.',
  replaces_saas: 'AWS S3 + CloudFront',
  saas_target: 'Storage',
  estimated_monthly_savings: 45,
  category: 'Active Sacrilege',
  risk_level: 'Nuclear',
  primitives_abused: ['Telegram Bot API', 'Private Channel Storage'],
  author_github: 'builtwhilebroke',
  date_added: '2026-09-12',
};

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    testsFailed++;
  } else {
    console.log(`✔ PASS: ${message}`);
    testsPassed++;
  }
}

console.log('--- RUNNING ADVERSARIAL SCHEMA TESTS ---');

// 1. Valid base object
const validRes = hackSchema.safeParse(baseValid);
assert(validRes.success, 'Valid seed hack frontmatter passes schema');
assert(validRes.data?.is_deprecated === false, 'Default is_deprecated is false');

// 2. Test each required field missing
const requiredFields = [
  'title',
  'description',
  'replaces_saas',
  'saas_target',
  'estimated_monthly_savings',
  'category',
  'risk_level',
  'primitives_abused',
  'author_github',
  'date_added',
];

for (const field of requiredFields) {
  const testObj = { ...baseValid };
  delete testObj[field];
  const res = hackSchema.safeParse(testObj);
  assert(!res.success, `Missing required field '${field}' correctly rejected`);
}

// 3. Category enum tests
assert(!hackSchema.safeParse({ ...baseValid, category: 'Invalid Category' }).success, 'Invalid category rejected');
assert(!hackSchema.safeParse({ ...baseValid, category: 'active sacrilege' }).success, 'Lowercase category rejected');

// 4. Risk level enum tests
assert(!hackSchema.safeParse({ ...baseValid, risk_level: 'Medium' }).success, 'Invalid risk_level rejected');
assert(!hackSchema.safeParse({ ...baseValid, risk_level: 'nuclear' }).success, 'Lowercase risk_level rejected');

// 5. SaaS Target enum tests
assert(!hackSchema.safeParse({ ...baseValid, saas_target: 'Compute' }).success, 'Invalid saas_target rejected');

// 6. Savings validation
assert(!hackSchema.safeParse({ ...baseValid, estimated_monthly_savings: -10 }).success, 'Negative savings rejected');
assert(!hackSchema.safeParse({ ...baseValid, estimated_monthly_savings: 0 }).success, 'Zero savings rejected');
assert(!hackSchema.safeParse({ ...baseValid, estimated_monthly_savings: 45.5 }).success, 'Float savings rejected');
assert(!hackSchema.safeParse({ ...baseValid, estimated_monthly_savings: "45" }).success, 'String savings rejected');

// 7. Primitives abused validation
assert(!hackSchema.safeParse({ ...baseValid, primitives_abused: [] }).success, 'Empty primitives_abused rejected');
assert(!hackSchema.safeParse({ ...baseValid, primitives_abused: [''] }).success, 'Empty string primitive rejected');

// 8. Date formatting validation
assert(!hackSchema.safeParse({ ...baseValid, date_added: '2026/09/12' }).success, 'Slash date rejected');
assert(!hackSchema.safeParse({ ...baseValid, date_added: '12-09-2026' }).success, 'DD-MM-YYYY date rejected');
assert(!hackSchema.safeParse({ ...baseValid, date_added: '2026-9-12' }).success, 'Non-padded date rejected');
assert(!hackSchema.safeParse({ ...baseValid, date_added: 'invalid' }).success, 'Garbage date string rejected');

// 9. Warning banner and is_deprecated
assert(hackSchema.safeParse({ ...baseValid, warning_banner: 'Warning', is_deprecated: true }).success, 'Optional warning_banner and is_deprecated=true accepted');
assert(!hackSchema.safeParse({ ...baseValid, is_deprecated: 'true' }).success, 'String is_deprecated rejected');

console.log(`\nAdversarial test results: ${testsPassed} passed, ${testsFailed} failed.`);
process.exit(testsFailed > 0 ? 1 : 0);
