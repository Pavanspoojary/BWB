/**
 * Adversarial Stress-Test Harness for src/content.config.ts
 *
 * Imports the authoritative hackSchema from src/content.config.ts directly
 * and executes an exhaustive battery of adversarial inputs, boundary conditions,
 * type mismatches, and compliance fixtures.
 */

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve as pathResolve } from 'node:path';

// Register loader hook to resolve 'astro:content' to local shim
const loaderUrl = pathToFileURL(pathResolve('./tests/e2e/helpers/astro_loader.mjs')).href;
register(loaderUrl);

// Import live schema and enums directly from src/content.config.ts
const contentConfig = await import('../src/content.config.ts');
const { hackSchema, CategoryEnum, RiskLevelEnum, SaasTargetEnum } = contentConfig;

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  failures: [],
  categories: {},
};

function runTest(category, description, input, expectedSuccess, customValidator = null) {
  results.total++;
  if (!results.categories[category]) {
    results.categories[category] = { total: 0, passed: 0, failed: 0 };
  }
  results.categories[category].total++;

  const parseResult = hackSchema.safeParse(input);
  const actualSuccess = parseResult.success;

  let testPassed = actualSuccess === expectedSuccess;
  let detailMessage = '';

  if (testPassed && customValidator) {
    try {
      const customCheck = customValidator(parseResult);
      if (!customCheck.passed) {
        testPassed = false;
        detailMessage = customCheck.message;
      }
    } catch (err) {
      testPassed = false;
      detailMessage = `Custom validator threw: ${err.message}`;
    }
  }

  if (testPassed) {
    results.passed++;
    results.categories[category].passed++;
    console.log(`  ✔ [PASS] [${category}] ${description}`);
  } else {
    results.failed++;
    results.categories[category].failed++;
    const errMsg = actualSuccess
      ? `Expected parse failure, but schema PARSED successfully: ${JSON.stringify(parseResult.data)}`
      : `Expected parse success, but schema REJECTED input: ${JSON.stringify(parseResult.error.format())}`;
    const failureRecord = {
      category,
      description,
      expected: expectedSuccess ? 'PASS' : 'FAIL',
      actual: actualSuccess ? 'PASS' : 'FAIL',
      error: detailMessage || errMsg,
      input,
    };
    results.failures.push(failureRecord);
    console.log(`  ✖ [FAIL] [${category}] ${description}`);
    console.log(`     Details: ${detailMessage || errMsg}`);
  }
}

// Base compliant fixture
const baseValid = {
  title: 'Using Telegram as an Infinite S3 Bucket',
  description: 'Abuse Telegram Bot API 20MB file limit as an infinite free object store.',
  replaces_saas: 'AWS S3 + CloudFront',
  saas_target: 'Storage',
  estimated_monthly_savings: 45,
  category: 'Active Sacrilege',
  risk_level: 'Nuclear',
  primitives_abused: ['Telegram Bot API', 'File Chunking Engine'],
  author_github: 'builtwhilebroke',
  date_added: '2026-09-12',
};

console.log('\n============================================================');
console.log('ADVERSARIAL STRESS-TEST SUITE: src/content.config.ts');
console.log('============================================================\n');

// -------------------------------------------------------------
// 1. Compliant frontmatter fixtures (must parse successfully)
// -------------------------------------------------------------
console.log('▶ Category 1: Compliant Frontmatter Fixtures');

runTest('1. Compliant Fixtures', 'Seed Hack 1 (Telegram S3) valid frontmatter parses', {
  ...baseValid,
}, true);

runTest('1. Compliant Fixtures', 'Seed Hack 2 (True $0 Stack) valid frontmatter parses', {
  title: 'The True $0 Production Stack',
  description: 'Zero-cost sub-10ms global latency architecture using Turso SQLite + Workers.',
  replaces_saas: 'RDS PostgreSQL + Vercel Pro',
  saas_target: 'Database',
  estimated_monthly_savings: 120,
  category: 'Clean Loophole',
  risk_level: 'Low',
  primitives_abused: ['Turso SQLite', 'Cloudflare Workers', 'Resend', 'Better Auth'],
  author_github: 'pavanpoojary',
  date_added: '2026-09-12',
}, true);

runTest('1. Compliant Fixtures', 'Seed Hack 3 (Discord CDN Autopsy) valid frontmatter parses with is_deprecated', {
  title: 'The Discord CDN Autopsy',
  description: 'How developers abused Discord attachments as free CDNs, and why Discord revoked them.',
  replaces_saas: 'Cloudflare Images + BunnyCDN',
  saas_target: 'Storage',
  estimated_monthly_savings: 30,
  category: 'The Graveyard',
  risk_level: 'Nuclear',
  primitives_abused: ['Discord Webhook Attachment API', 'Media Proxy CDN'],
  author_github: 'graveyard-keeper',
  date_added: '2026-09-12',
  is_deprecated: true,
  warning_banner: 'DEPRECATED: Discord revoked permanent attachment URLs in Dec 2023.',
}, true);

runTest('1. Compliant Fixtures', 'Minimal compliant frontmatter (optional fields omitted)', {
  ...baseValid,
}, true, (res) => ({
  passed: res.data.is_deprecated === false && res.data.warning_banner === undefined,
  message: `Default value for is_deprecated was not false: ${res.data.is_deprecated}`,
}));

runTest('1. Compliant Fixtures', 'Compliant frontmatter with warning_banner and is_deprecated: false', {
  ...baseValid,
  warning_banner: 'Exercise extreme caution.',
  is_deprecated: false,
}, true);

// -------------------------------------------------------------
// 2. Negative and non-positive savings numbers (must fail)
// -------------------------------------------------------------
console.log('\n▶ Category 2: Negative and Non-Positive Savings');

runTest('2. Negative Savings', 'Negative integer -1 must fail', {
  ...baseValid,
  estimated_monthly_savings: -1,
}, false);

runTest('2. Negative Savings', 'Negative integer -45 must fail', {
  ...baseValid,
  estimated_monthly_savings: -45,
}, false);

runTest('2. Negative Savings', 'Extreme negative integer -999999 must fail', {
  ...baseValid,
  estimated_monthly_savings: -999999,
}, false);

runTest('2. Negative Savings', 'Negative floating point -12.5 must fail', {
  ...baseValid,
  estimated_monthly_savings: -12.5,
}, false);

runTest('2. Negative Savings', 'Zero savings (0) must fail (positive integer required)', {
  ...baseValid,
  estimated_monthly_savings: 0,
}, false);

runTest('2. Negative Savings', 'String negative savings "-45" must fail', {
  ...baseValid,
  estimated_monthly_savings: '-45',
}, false);

// -------------------------------------------------------------
// 3. Non-integer savings (must fail)
// -------------------------------------------------------------
console.log('\n▶ Category 3: Non-Integer Savings');

runTest('3. Non-Integer Savings', 'Positive floating point 45.5 must fail', {
  ...baseValid,
  estimated_monthly_savings: 45.5,
}, false);

runTest('3. Non-Integer Savings', 'Fractional positive float 0.1 must fail', {
  ...baseValid,
  estimated_monthly_savings: 0.1,
}, false);

runTest('3. Non-Integer Savings', 'Precision float 120.0001 must fail', {
  ...baseValid,
  estimated_monthly_savings: 120.0001,
}, false);

runTest('3. Non-Integer Savings', 'String number "45" must fail', {
  ...baseValid,
  estimated_monthly_savings: '45',
}, false);

runTest('3. Non-Integer Savings', 'NaN must fail', {
  ...baseValid,
  estimated_monthly_savings: NaN,
}, false);

runTest('3. Non-Integer Savings', 'Infinity must fail', {
  ...baseValid,
  estimated_monthly_savings: Infinity,
}, false);

runTest('3. Non-Integer Savings', '-Infinity must fail', {
  ...baseValid,
  estimated_monthly_savings: -Infinity,
}, false);

runTest('3. Non-Integer Savings', 'Null savings must fail', {
  ...baseValid,
  estimated_monthly_savings: null,
}, false);

runTest('3. Non-Integer Savings', 'Boolean savings must fail', {
  ...baseValid,
  estimated_monthly_savings: true,
}, false);

// -------------------------------------------------------------
// 4. Unknown categories outside ["Active Sacrilege", "Clean Loophole", "The Graveyard"] (must fail)
// -------------------------------------------------------------
console.log('\n▶ Category 4: Category Enum Validation');

runTest('4. Category Enum', 'Unknown category "Illegal Piracy" must fail', {
  ...baseValid,
  category: 'Illegal Piracy',
}, false);

runTest('4. Category Enum', 'Unknown category "Hacks" must fail', {
  ...baseValid,
  category: 'Hacks',
}, false);

runTest('4. Category Enum', 'Lowercase "active sacrilege" must fail (case sensitivity)', {
  ...baseValid,
  category: 'active sacrilege',
}, false);

runTest('4. Category Enum', 'Uppercase "CLEAN LOOPHOLE" must fail', {
  ...baseValid,
  category: 'CLEAN LOOPHOLE',
}, false);

runTest('4. Category Enum', 'Padded " The Graveyard" with leading whitespace must fail', {
  ...baseValid,
  category: ' The Graveyard',
}, false);

runTest('4. Category Enum', 'Padded "Active Sacrilege " with trailing whitespace must fail', {
  ...baseValid,
  category: 'Active Sacrilege ',
}, false);

runTest('4. Category Enum', 'Empty string category must fail', {
  ...baseValid,
  category: '',
}, false);

runTest('4. Category Enum', 'Numeric category 123 must fail', {
  ...baseValid,
  category: 123,
}, false);

runTest('4. Category Enum', 'Null category must fail', {
  ...baseValid,
  category: null,
}, false);

// -------------------------------------------------------------
// 5. Unknown risk levels outside ["Low", "TOS Gray Area", "Nuclear"] (must fail)
// -------------------------------------------------------------
console.log('\n▶ Category 5: Risk Level Enum Validation');

runTest('5. Risk Level Enum', 'Unknown risk "Medium" must fail', {
  ...baseValid,
  risk_level: 'Medium',
}, false);

runTest('5. Risk Level Enum', 'Unknown risk "High" must fail', {
  ...baseValid,
  risk_level: 'High',
}, false);

runTest('5. Risk Level Enum', 'Unknown risk "Critical" must fail', {
  ...baseValid,
  risk_level: 'Critical',
}, false);

runTest('5. Risk Level Enum', 'Lowercase "nuclear" must fail (case sensitivity)', {
  ...baseValid,
  risk_level: 'nuclear',
}, false);

runTest('5. Risk Level Enum', 'Lowercase "low" must fail', {
  ...baseValid,
  risk_level: 'low',
}, false);

runTest('5. Risk Level Enum', 'Lowercase "tos gray area" must fail', {
  ...baseValid,
  risk_level: 'tos gray area',
}, false);

runTest('5. Risk Level Enum', 'Padded " Nuclear" must fail', {
  ...baseValid,
  risk_level: ' Nuclear',
}, false);

runTest('5. Risk Level Enum', 'Empty string risk_level must fail', {
  ...baseValid,
  risk_level: '',
}, false);

runTest('5. Risk Level Enum', 'Boolean risk_level must fail', {
  ...baseValid,
  risk_level: true,
}, false);

// -------------------------------------------------------------
// 6. Unknown SaaS target enum outside ["Auth", "Storage", "Database", "Logging", "Email"]
// -------------------------------------------------------------
console.log('\n▶ Category 6: SaaS Target Enum Validation');

runTest('6. SaaS Target Enum', 'Valid target "Auth" passes', { ...baseValid, saas_target: 'Auth' }, true);
runTest('6. SaaS Target Enum', 'Valid target "Storage" passes', { ...baseValid, saas_target: 'Storage' }, true);
runTest('6. SaaS Target Enum', 'Valid target "Database" passes', { ...baseValid, saas_target: 'Database' }, true);
runTest('6. SaaS Target Enum', 'Valid target "Logging" passes', { ...baseValid, saas_target: 'Logging' }, true);
runTest('6. SaaS Target Enum', 'Valid target "Email" passes', { ...baseValid, saas_target: 'Email' }, true);

runTest('6. SaaS Target Enum', 'Unknown target "Compute" must fail', {
  ...baseValid,
  saas_target: 'Compute',
}, false);

runTest('6. SaaS Target Enum', 'Unknown target "Analytics" must fail', {
  ...baseValid,
  saas_target: 'Analytics',
}, false);

runTest('6. SaaS Target Enum', 'Lowercase "storage" must fail', {
  ...baseValid,
  saas_target: 'storage',
}, false);

// -------------------------------------------------------------
// 7. Missing required fields (must fail)
// -------------------------------------------------------------
console.log('\n▶ Category 7: Missing Required Fields');

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
  const clone = { ...baseValid };
  delete clone[field];
  runTest('7. Missing Required Fields', `Missing required field "${field}" must fail`, clone, false);
}

runTest('7. Missing Required Fields', 'Empty object {} must fail', {}, false);
runTest('7. Missing Required Fields', 'Null input must fail', null, false);
runTest('7. Missing Required Fields', 'Undefined input must fail', undefined, false);
runTest('7. Missing Required Fields', 'Array input [] must fail', [], false);

// -------------------------------------------------------------
// 8. Empty strings on required string fields (must fail)
// -------------------------------------------------------------
console.log('\n▶ Category 8: Empty String Boundary on Required Fields');

runTest('8. Empty Strings', 'Empty string title must fail', { ...baseValid, title: '' }, false);
runTest('8. Empty Strings', 'Empty string description must fail', { ...baseValid, description: '' }, false);
runTest('8. Empty Strings', 'Empty string replaces_saas must fail', { ...baseValid, replaces_saas: '' }, false);
runTest('8. Empty Strings', 'Empty string author_github must fail', { ...baseValid, author_github: '' }, false);

// -------------------------------------------------------------
// 9. Primitives Abused array boundaries (must fail)
// -------------------------------------------------------------
console.log('\n▶ Category 9: Primitives Abused Array Validation');

runTest('9. Primitives Abused', 'Empty array [] must fail', { ...baseValid, primitives_abused: [] }, false);
runTest('9. Primitives Abused', 'Array with empty string [""] must fail', { ...baseValid, primitives_abused: [''] }, false);
runTest('9. Primitives Abused', 'String instead of array must fail', { ...baseValid, primitives_abused: 'Telegram Bot API' }, false);
runTest('9. Primitives Abused', 'Array of numbers [123] must fail', { ...baseValid, primitives_abused: [123] }, false);
runTest('9. Primitives Abused', 'Array with null [null] must fail', { ...baseValid, primitives_abused: [null] }, false);
runTest('9. Primitives Abused', 'Valid array with single primitive passes', { ...baseValid, primitives_abused: ['Telegram Bot API'] }, true);
runTest('9. Primitives Abused', 'Valid array with multiple primitives passes', {
  ...baseValid,
  primitives_abused: ['Cloudflare Workers', 'Turso SQLite', 'Resend', 'Better Auth'],
}, true);

// -------------------------------------------------------------
// 10. Date format validation (must fail on invalid formats)
// -------------------------------------------------------------
console.log('\n▶ Category 10: Date Format Validation');

runTest('10. Date Format', 'Standard YYYY-MM-DD "2026-09-12" passes', { ...baseValid, date_added: '2026-09-12' }, true);
runTest('10. Date Format', 'Valid leap day "2024-02-29" passes', { ...baseValid, date_added: '2024-02-29' }, true);
runTest('10. Date Format', 'Non-date string "not-a-date" must fail', { ...baseValid, date_added: 'not-a-date' }, false);
runTest('10. Date Format', 'Relative string "yesterday" must fail', { ...baseValid, date_added: 'yesterday' }, false);
runTest('10. Date Format', 'Slash formatted "2026/09/12" must fail', { ...baseValid, date_added: '2026/09/12' }, false);
runTest('10. Date Format', 'US formatted "09-12-2026" must fail', { ...baseValid, date_added: '09-12-2026' }, false);
runTest('10. Date Format', 'Dot formatted "2026.09.12" must fail', { ...baseValid, date_added: '2026.09.12' }, false);
runTest('10. Date Format', 'Missing day "2026-09" must fail', { ...baseValid, date_added: '2026-09' }, false);
runTest('10. Date Format', 'Single digit day "2026-09-1" must fail', { ...baseValid, date_added: '2026-09-1' }, false);
runTest('10. Date Format', 'Single digit month "2026-9-12" must fail', { ...baseValid, date_added: '2026-9-12' }, false);
runTest('10. Date Format', 'Full ISO 8601 with timestamp "2026-09-12T13:30:00Z" must fail (regex requires YYYY-MM-DD)', {
  ...baseValid,
  date_added: '2026-09-12T13:30:00Z',
}, false);
runTest('10. Date Format', 'Epoch timestamp number 1726123456 must fail', { ...baseValid, date_added: 1726123456 }, false);
runTest('10. Date Format', 'Empty string date must fail', { ...baseValid, date_added: '' }, false);

// Corner check: Regex vs Calendar Date Check
// The schema specifies regex: /^\d{4}-\d{2}-\d{2}$/
const calendarImpossiblePassesRegex = hackSchema.safeParse({ ...baseValid, date_added: '2026-02-30' }).success;
console.log(`  ℹ [ADVISORY] Regex vs Calendar validation: '2026-02-30' matches /^\\d{4}-\\d{2}-\\d{2}$/: ${calendarImpossiblePassesRegex}`);

// -------------------------------------------------------------
// 11. Optional & default fields validation
// -------------------------------------------------------------
console.log('\n▶ Category 11: Optional and Default Fields');

runTest('11. Optional/Default Fields', 'Explicit warning_banner string passes', {
  ...baseValid,
  warning_banner: 'Warning: Experimental API',
}, true);

runTest('11. Optional/Default Fields', 'Numeric warning_banner must fail', {
  ...baseValid,
  warning_banner: 12345,
}, false);

runTest('11. Optional/Default Fields', 'Boolean warning_banner must fail', {
  ...baseValid,
  warning_banner: true,
}, false);

runTest('11. Optional/Default Fields', 'Explicit is_deprecated: true passes', {
  ...baseValid,
  is_deprecated: true,
}, true, (res) => ({
  passed: res.data.is_deprecated === true,
  message: 'is_deprecated was not true',
}));

runTest('11. Optional/Default Fields', 'String is_deprecated "true" must fail', {
  ...baseValid,
  is_deprecated: 'true',
}, false);

// -------------------------------------------------------------
// 12. Boundary, Extremes & Security Injections
// -------------------------------------------------------------
console.log('\n▶ Category 12: Extremes, Security & Injection Attacks');

runTest('12. Security & Boundaries', 'Minimum positive savings (1) passes', {
  ...baseValid,
  estimated_monthly_savings: 1,
}, true);

runTest('12. Security & Boundaries', 'Very large positive savings (1,000,000) passes', {
  ...baseValid,
  estimated_monthly_savings: 1000000,
}, true);

runTest('12. Security & Boundaries', 'SQL injection string in title parses safely as string', {
  ...baseValid,
  title: "'; DROP TABLE hacks; SELECT * FROM users WHERE '1'='1",
}, true);

runTest('12. Security & Boundaries', 'XSS payload in description parses safely as string', {
  ...baseValid,
  description: '<script>alert("XSS")</script><img src="x" onerror="alert(1)">',
}, true);

runTest('12. Security & Boundaries', 'Unicode & emoji characters parse cleanly', {
  ...baseValid,
  title: '🚀 Abusing Cloudflare Workers 💀 Free Database 💸',
}, true);

// -------------------------------------------------------------
// Summary Report
// -------------------------------------------------------------
console.log('\n============================================================');
console.log('ADVERSARIAL STRESS-TEST SUMMARY');
console.log('============================================================');
console.log(`Total Tests Executed: ${results.total}`);
console.log(`Passed:               ${results.passed}`);
console.log(`Failed:               ${results.failed}`);
const passRate = ((results.passed / results.total) * 100).toFixed(2);
console.log(`Pass Rate:            ${passRate}%`);
console.log('------------------------------------------------------------');
console.log('Category Breakdown:');
for (const [cat, data] of Object.entries(results.categories)) {
  const catRate = ((data.passed / data.total) * 100).toFixed(1);
  console.log(`  • ${cat.padEnd(35)} : ${data.passed}/${data.total} (${catRate}%)`);
}
console.log('============================================================\n');

if (results.failures.length > 0) {
  console.log('FAILURE DETAILS:');
  for (const [idx, fail] of results.failures.entries()) {
    console.log(`\n[#${idx + 1}] [${fail.category}] ${fail.description}`);
    console.log(`     Expected: ${fail.expected} | Actual: ${fail.actual}`);
    console.log(`     Error: ${fail.error}`);
  }
}

// Exit code 0 if all tests pass, exit code 1 if any fail
process.exit(results.failed === 0 ? 0 : 1);
