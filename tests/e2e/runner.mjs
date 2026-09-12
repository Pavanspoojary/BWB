/**
 * BuiltWhileBroke.tech - Self-Contained E2E Test Runner
 *
 * An independent, zero-dependency test runner supporting:
 * - Full suite execution across all 4 Tiers
 * - Single-tier filtering (--tier 1, --tier 2, etc.)
 * - Test suite name filtering (--suite <pattern>)
 * - Standalone execution of individual *.test.mjs files
 * - Brutalist terminal formatting, pass/fail counts, execution timings, failure details
 */

import { readdirSync, statSync } from 'node:fs';
import { resolve, join, relative, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TESTS_ROOT = __dirname;

// Global Registry
const suites = [];
let currentSuite = null;
let isDirectRunner = false;
let executionStarted = false;

export function describe(name, fn) {
  const suite = {
    name,
    tests: [],
    beforeAll: [],
    afterAll: [],
    beforeEach: [],
    afterEach: [],
  };
  const prevSuite = currentSuite;
  currentSuite = suite;
  suites.push(suite);
  try {
    fn();
  } finally {
    currentSuite = prevSuite;
  }
}

export function it(name, fn) {
  const testCase = { name, fn, skip: false };
  if (currentSuite) {
    currentSuite.tests.push(testCase);
  } else {
    // Default top-level suite
    let rootSuite = suites.find(s => s.name === 'Default');
    if (!rootSuite) {
      rootSuite = { name: 'Default', tests: [], beforeAll: [], afterAll: [], beforeEach: [], afterEach: [] };
      suites.push(rootSuite);
    }
    rootSuite.tests.push(testCase);
  }
}

export const test = it;

it.skip = function (name, fn) {
  if (currentSuite) {
    currentSuite.tests.push({ name, fn, skip: true });
  }
};

export function beforeAll(fn) {
  if (currentSuite) currentSuite.beforeAll.push(fn);
}

export function afterAll(fn) {
  if (currentSuite) currentSuite.afterAll.push(fn);
}

export function beforeEach(fn) {
  if (currentSuite) currentSuite.beforeEach.push(fn);
}

export function afterEach(fn) {
  if (currentSuite) currentSuite.afterEach.push(fn);
}

export { assert };

export function expect(actual) {
  return {
    toBe(expected) {
      assert.strictEqual(actual, expected, `Expected ${JSON.stringify(actual)} to strictly equal ${JSON.stringify(expected)}`);
    },
    toEqual(expected) {
      assert.deepStrictEqual(actual, expected, `Expected ${JSON.stringify(actual)} to deep equal ${JSON.stringify(expected)}`);
    },
    toContain(expected) {
      if (typeof actual === 'string' || Array.isArray(actual)) {
        assert(actual.includes(expected), `Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
      } else if (actual instanceof Set || actual instanceof Map) {
        assert(actual.has(expected), `Expected collection to contain key ${JSON.stringify(expected)}`);
      } else {
        throw new Error(`toContain cannot inspect type ${typeof actual}`);
      }
    },
    toBeGreaterThan(expected) {
      assert(actual > expected, `Expected ${actual} > ${expected}`);
    },
    toBeGreaterThanOrEqual(expected) {
      assert(actual >= expected, `Expected ${actual} >= ${expected}`);
    },
    toBeLessThan(expected) {
      assert(actual < expected, `Expected ${actual} < ${expected}`);
    },
    toBeLessThanOrEqual(expected) {
      assert(actual <= expected, `Expected ${actual} <= ${expected}`);
    },
    toMatch(regex) {
      assert(regex.test(actual), `Expected "${actual}" to match pattern ${regex}`);
    },
    toBeTruthy() {
      assert(Boolean(actual), `Expected ${JSON.stringify(actual)} to be truthy`);
    },
    toBeFalsy() {
      assert(!Boolean(actual), `Expected ${JSON.stringify(actual)} to be falsy`);
    },
    toBeDefined() {
      assert(actual !== undefined, `Expected value to be defined`);
    },
    toBeUndefined() {
      assert(actual === undefined, `Expected value to be undefined, received ${JSON.stringify(actual)}`);
    },
    toThrow(expectedPattern) {
      assert.throws(actual, expectedPattern);
    },
    not: {
      toBe(expected) {
        assert.notStrictEqual(actual, expected, `Expected ${JSON.stringify(actual)} NOT to strictly equal ${JSON.stringify(expected)}`);
      },
      toEqual(expected) {
        assert.notDeepStrictEqual(actual, expected, `Expected ${JSON.stringify(actual)} NOT to deep equal ${JSON.stringify(expected)}`);
      },
      toContain(expected) {
        if (typeof actual === 'string' || Array.isArray(actual)) {
          assert(!actual.includes(expected), `Expected ${JSON.stringify(actual)} NOT to contain ${JSON.stringify(expected)}`);
        }
      },
      toMatch(regex) {
        assert(!regex.test(actual), `Expected "${actual}" NOT to match pattern ${regex}`);
      },
      toBeTruthy() {
        assert(!Boolean(actual), `Expected ${JSON.stringify(actual)} to NOT be truthy`);
      }
    }
  };
}

// Find all test files matching filter
function findTestFiles(dir, filter = () => true) {
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTestFiles(fullPath, filter));
    } else if (entry.isFile() && entry.name.endsWith('.test.mjs')) {
      if (filter(fullPath)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

// Color and formatting helpers
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m\x1b[37m',
  bgGreen: '\x1b[42m\x1b[30m',
};

async function executeSuites({ bail = false } = {}) {
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const failureDetails = [];
  const startTime = Date.now();

  for (const suite of suites) {
    if (!suite.tests.length) continue;
    console.log(`\n${c.cyan}${c.bold}▶ SUITE:${c.reset} ${suite.name}`);

    // Run beforeAll hooks
    for (const hook of suite.beforeAll) {
      await hook();
    }

    for (const testCase of suite.tests) {
      if (testCase.skip) {
        console.log(`  ${c.yellow}○ [SKIP]${c.reset} ${c.dim}${testCase.name}${c.reset}`);
        skipped++;
        continue;
      }

      // Run beforeEach hooks
      for (const hook of suite.beforeEach) {
        await hook();
      }

      const testStart = Date.now();
      try {
        await testCase.fn();
        const duration = Date.now() - testStart;
        console.log(`  ${c.green}✔ [PASS]${c.reset} ${c.dim}(${duration}ms)${c.reset} ${testCase.name}`);
        passed++;
      } catch (err) {
        const duration = Date.now() - testStart;
        console.log(`  ${c.red}✖ [FAIL]${c.reset} ${c.dim}(${duration}ms)${c.reset} ${testCase.name}`);
        failed++;
        failureDetails.push({
          suite: suite.name,
          test: testCase.name,
          error: err,
        });

        if (bail) {
          console.log(`\n${c.red}${c.bold}[BAIL] Test execution halted on first failure.${c.reset}`);
          break;
        }
      }

      // Run afterEach hooks
      for (const hook of suite.afterEach) {
        try {
          await hook();
        } catch (hookErr) {
          console.error(`  ${c.red}✖ [afterEach hook error]:${c.reset}`, hookErr.message);
        }
      }
    }

    // Run afterAll hooks
    for (const hook of suite.afterAll) {
      try {
        await hook();
      } catch (hookErr) {
        console.error(`  ${c.red}✖ [afterAll hook error]:${c.reset}`, hookErr.message);
      }
    }

    if (bail && failed > 0) break;
  }

  const totalDuration = Date.now() - startTime;

  // Print Failure Summaries
  if (failureDetails.length > 0) {
    console.log(`\n${c.red}${c.bold}========================== FAILURES ==========================${c.reset}`);
    failureDetails.forEach((f, idx) => {
      console.log(`\n${c.red}${c.bold}${idx + 1}) [${f.suite}] ${f.test}${c.reset}`);
      console.log(`${c.red}${f.error?.stack || f.error?.message || f.error}${c.reset}`);
    });
    console.log(`${c.red}${c.bold}==============================================================${c.reset}`);
  }

  // Summary Card
  const total = passed + failed + skipped;
  console.log(`\n${c.bold}------------------------------------------------------------${c.reset}`);
  console.log(`${c.bold}TEST RUN RESULTS:${c.reset}`);
  console.log(`  Total Tests: ${c.bold}${total}${c.reset}`);
  console.log(`  Passed:      ${c.green}${c.bold}${passed}${c.reset}`);
  console.log(`  Failed:      ${failed > 0 ? c.red + c.bold : c.dim}${failed}${c.reset}`);
  console.log(`  Skipped:     ${skipped > 0 ? c.yellow : c.dim}${skipped}${c.reset}`);
  console.log(`  Duration:    ${c.cyan}${totalDuration}ms${c.reset}`);
  console.log(`${c.bold}------------------------------------------------------------${c.reset}`);

  if (failed === 0) {
    console.log(`${c.bgGreen} STATUS: ALL TESTS PASSED (100% SUCCESS) ${c.reset}\n`);
    return 0;
  } else {
    console.log(`${c.bgRed} STATUS: TEST SUITE FAILED (${failed} ERRORS) ${c.reset}\n`);
    return 1;
  }
}

// Standalone runner logic
async function runCli() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${c.bold}BUILTWHILEBROKE.TECH E2E TEST RUNNER${c.reset}
Usage:
  node tests/e2e/runner.mjs [options]

Options:
  --tier <1|2|3|4>, -t <1|2|3|4>   Run tests only for the specified Tier
  --suite <name>, -s <name>        Filter test files by filename substring
  --bail                           Stop immediately on the first test failure
  --help, -h                       Show this help message
`);
    process.exit(0);
  }

  let tierFilter = null;
  const tierIdx = args.findIndex(a => a === '--tier' || a === '-t');
  if (tierIdx !== -1 && args[tierIdx + 1]) {
    tierFilter = args[tierIdx + 1];
  }

  let suiteFilter = null;
  const suiteIdx = args.findIndex(a => a === '--suite' || a === '-s');
  if (suiteIdx !== -1 && args[suiteIdx + 1]) {
    suiteFilter = args[suiteIdx + 1].toLowerCase();
  }

  const bail = args.includes('--bail');

  console.log(`${c.bold}+-------------------------------------------------------------+${c.reset}`);
  console.log(`${c.bold}|    BUILTWHILEBROKE.TECH // E2E OPAQUE-BOX TEST HARNESS     |${c.reset}`);
  console.log(`${c.bold}+-------------------------------------------------------------+${c.reset}`);
  console.log(`  Environment: Node.js ${process.version} (${process.platform})`);
  console.log(`  Target Root: ${TESTS_ROOT}`);
  if (tierFilter) console.log(`  Filter: Tier ${tierFilter} only`);
  if (suiteFilter) console.log(`  Filter: Suite contains "${suiteFilter}"`);

  // Discover test files
  const testFiles = findTestFiles(TESTS_ROOT, filePath => {
    const rel = relative(TESTS_ROOT, filePath);
    if (tierFilter) {
      if (!rel.includes(`tier${tierFilter}`)) return false;
    }
    if (suiteFilter) {
      if (!rel.toLowerCase().includes(suiteFilter)) return false;
    }
    return true;
  });

  if (testFiles.length === 0) {
    console.log(`\n${c.yellow}[!] No test files found matching criteria.${c.reset}`);
    process.exit(0);
  }

  console.log(`\nDiscovered ${testFiles.length} test suite file(s):`);
  for (const file of testFiles) {
    console.log(`  • ${relative(TESTS_ROOT, file)}`);
  }

  // Import all test files to register suites
  for (const file of testFiles) {
    const fileUrl = pathToFileURL(file).href;
    await import(fileUrl);
  }

  // Execute
  const exitCode = await executeSuites({ bail });
  process.exit(exitCode);
}

// Auto-run if executed directly as CLI script
const currentFileResolved = resolve(__filename);
const entryFileResolved = process.argv[1] ? resolve(process.argv[1]) : '';

if (entryFileResolved === currentFileResolved) {
  isDirectRunner = true;
  runCli().catch(err => {
    console.error('Fatal runner error:', err);
    process.exit(1);
  });
} else {
  // If imported by an individual test file executed via `node file.test.mjs`
  process.on('beforeExit', async () => {
    if (!executionStarted && suites.length > 0 && !isDirectRunner) {
      executionStarted = true;
      const code = await executeSuites();
      process.exit(code);
    }
  });
}
