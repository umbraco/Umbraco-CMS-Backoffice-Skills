#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import { dirname, resolve, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess, execSync } from 'child_process';

// Get project root (script is at .claude/skills/umbraco-skill-test-runner/scripts/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '../../../../');

// Types
type TestType = 'unit' | 'mocked' | 'e2e';
type TestStatus = 'passed' | 'failed' | 'skipped';

interface TestSuiteResult {
  example: string;
  path: string;
  type: TestType;
  command: string;
  status: TestStatus;
  duration: number;
  output?: string;
  error?: string;
}

interface TestReport {
  timestamp: string;
  umbracoStarted: boolean;
  umbracoUrl: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  results: TestSuiteResult[];
}

interface TestableExample {
  name: string;
  path: string;
  packageJsonPath: string;
  scripts: Record<string, string>;
  tests: { type: TestType; command: string }[];
}

// Config
const UMBRACO_URL = process.env.UMBRACO_URL || 'https://localhost:44325';
const UMBRACO_PROJECT_PATH = join(PROJECT_ROOT, 'Umbraco-CMS.Skills');
const TEST_TIMEOUT_UNIT = 60000;
const TEST_TIMEOUT_MOCKED = 120000;
const TEST_TIMEOUT_E2E = 180000;
const UMBRACO_STARTUP_TIMEOUT = 120000;

// Track Umbraco process if we start it
let umbracoProcess: ChildProcess | null = null;
let weStartedUmbraco = false;

/**
 * Discover all testable examples in the project
 */
async function discoverTestableExamples(): Promise<TestableExample[]> {
  const packageFiles = await glob('**/examples/**/package.json', {
    cwd: PROJECT_ROOT,
    ignore: ['**/node_modules/**', '**/dist/**']
  });

  const examples: TestableExample[] = [];

  for (const pkgPath of packageFiles) {
    const fullPath = join(PROJECT_ROOT, pkgPath);
    const content = JSON.parse(readFileSync(fullPath, 'utf-8'));
    const scripts = content.scripts || {};

    // Check if has any test scripts
    const tests: { type: TestType; command: string }[] = [];

    // Unit tests: npm test with web-test-runner
    if (scripts.test?.includes('web-test-runner')) {
      tests.push({ type: 'unit', command: 'npm test' });
    }

    // Mocked tests: explicit test:mocked script
    if (scripts['test:mocked']) {
      tests.push({ type: 'mocked', command: 'npm run test:mocked' });
    }

    // E2E tests: test:e2e script OR npm test with playwright (and NOT web-test-runner)
    if (scripts['test:e2e']) {
      tests.push({ type: 'e2e', command: 'npm run test:e2e' });
    } else if (scripts.test?.includes('playwright') && !scripts.test?.includes('web-test-runner')) {
      tests.push({ type: 'e2e', command: 'npm test' });
    }

    if (tests.length > 0) {
      const exampleDir = dirname(fullPath);
      const name = exampleDir.split('/').pop() || 'unknown';
      examples.push({
        name,
        path: relative(PROJECT_ROOT, exampleDir),
        packageJsonPath: fullPath,
        scripts,
        tests
      });
    }
  }

  return examples;
}

/**
 * Check if Umbraco is running at the given URL
 */
async function checkUmbracoHealth(url: string): Promise<boolean> {
  try {
    // Use curl for reliable HTTPS handling with self-signed certs
    const result = execSync(`curl -k -s -o /dev/null -w "%{http_code}" "${url}/umbraco" --connect-timeout 5`, {
      timeout: 10000,
      encoding: 'utf-8'
    });
    const statusCode = parseInt(result.trim(), 10);
    return statusCode > 0 && statusCode < 500;
  } catch {
    return false;
  }
}

/**
 * Wait for Umbraco to be ready
 */
async function waitForUmbraco(url: string, timeout: number): Promise<boolean> {
  const startTime = Date.now();
  const pollInterval = 2000;

  console.error(`Waiting for Umbraco at ${url}...`);

  while (Date.now() - startTime < timeout) {
    const ready = await checkUmbracoHealth(url);
    if (ready) {
      console.error('Umbraco is ready!');
      return true;
    }
    await new Promise(r => setTimeout(r, pollInterval));
  }

  console.error('Timeout waiting for Umbraco');
  return false;
}

/**
 * Start Umbraco if not running
 */
async function ensureUmbracoRunning(): Promise<boolean> {
  // Check if already running
  const running = await checkUmbracoHealth(UMBRACO_URL);
  if (running) {
    console.error(`Umbraco already running at ${UMBRACO_URL}`);
    return false;
  }

  // Check if project exists
  if (!existsSync(UMBRACO_PROJECT_PATH)) {
    console.error(`Umbraco project not found at ${UMBRACO_PROJECT_PATH}`);
    return false;
  }

  console.error(`Starting Umbraco from ${UMBRACO_PROJECT_PATH}...`);

  // Start Umbraco
  umbracoProcess = spawn('dotnet', ['run'], {
    cwd: UMBRACO_PROJECT_PATH,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true
  });

  // Log output for debugging
  umbracoProcess.stdout?.on('data', (data) => {
    console.error(`[Umbraco] ${data.toString().trim()}`);
  });

  umbracoProcess.stderr?.on('data', (data) => {
    console.error(`[Umbraco Error] ${data.toString().trim()}`);
  });

  // Wait for ready
  const ready = await waitForUmbraco(UMBRACO_URL, UMBRACO_STARTUP_TIMEOUT);
  if (ready) {
    weStartedUmbraco = true;
    return true;
  }

  // Failed to start, kill process
  stopUmbraco();
  return false;
}

/**
 * Stop Umbraco if we started it
 */
function stopUmbraco(): void {
  if (umbracoProcess && weStartedUmbraco) {
    console.error('Stopping Umbraco...');
    try {
      // Kill process group
      if (umbracoProcess.pid) {
        process.kill(-umbracoProcess.pid, 'SIGTERM');
      }
    } catch (e) {
      // Process may already be dead
    }
    umbracoProcess = null;
    weStartedUmbraco = false;
  }
}

/**
 * Run npm install in a directory
 */
async function runNpmInstall(dir: string): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn('npm', ['install', '--silent'], {
      cwd: dir,
      stdio: 'pipe'
    });

    proc.on('close', (code) => {
      resolve(code === 0);
    });

    proc.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Run a test command and capture output
 */
async function runTest(
  example: TestableExample,
  test: { type: TestType; command: string }
): Promise<TestSuiteResult> {
  const startTime = Date.now();
  const exampleDir = join(PROJECT_ROOT, example.path);

  // Determine timeout
  const timeout = test.type === 'unit' ? TEST_TIMEOUT_UNIT :
                  test.type === 'mocked' ? TEST_TIMEOUT_MOCKED : TEST_TIMEOUT_E2E;

  // Build environment for E2E tests
  const env = { ...process.env };
  if (test.type === 'e2e') {
    env.URL = UMBRACO_URL;
    // Credentials should be set in environment already
  }

  return new Promise((resolve) => {
    const [cmd, ...args] = test.command.split(' ');
    const proc = spawn(cmd, args, {
      cwd: exampleDir,
      stdio: 'pipe',
      env,
      shell: true
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    const timeoutId = setTimeout(() => {
      proc.kill('SIGTERM');
      resolve({
        example: example.name,
        path: example.path,
        type: test.type,
        command: test.command,
        status: 'failed',
        duration: Date.now() - startTime,
        error: 'Test timed out'
      });
    }, timeout);

    proc.on('close', (code) => {
      clearTimeout(timeoutId);
      resolve({
        example: example.name,
        path: example.path,
        type: test.type,
        command: test.command,
        status: code === 0 ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        output: stdout.slice(-2000), // Last 2000 chars
        error: code !== 0 ? stderr.slice(-2000) : undefined
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timeoutId);
      resolve({
        example: example.name,
        path: example.path,
        type: test.type,
        command: test.command,
        status: 'failed',
        duration: Date.now() - startTime,
        error: err.message
      });
    });
  });
}

/**
 * Main test runner
 */
async function runTests(): Promise<TestReport> {
  console.error('Starting test runner from:', PROJECT_ROOT);

  // Discover testable examples
  const examples = await discoverTestableExamples();
  console.error(`Found ${examples.length} testable examples`);

  const results: TestSuiteResult[] = [];
  let umbracoStarted = false;

  // Separate tests by type
  const unitTests: { example: TestableExample; test: { type: TestType; command: string } }[] = [];
  const mockedTests: { example: TestableExample; test: { type: TestType; command: string } }[] = [];
  const e2eTests: { example: TestableExample; test: { type: TestType; command: string } }[] = [];

  for (const example of examples) {
    for (const test of example.tests) {
      if (test.type === 'unit') {
        unitTests.push({ example, test });
      } else if (test.type === 'mocked') {
        mockedTests.push({ example, test });
      } else {
        e2eTests.push({ example, test });
      }
    }
  }

  // Run unit tests first
  console.error(`\n=== Running ${unitTests.length} unit test suites ===`);
  for (const { example, test } of unitTests) {
    console.error(`Running: ${example.name} (${test.command})`);

    // Install dependencies
    const exampleDir = join(PROJECT_ROOT, example.path);
    if (!existsSync(join(exampleDir, 'node_modules'))) {
      console.error('  Installing dependencies...');
      await runNpmInstall(exampleDir);
    }

    const result = await runTest(example, test);
    results.push(result);
    console.error(`  ${result.status.toUpperCase()} (${result.duration}ms)`);
  }

  // Run mocked tests
  console.error(`\n=== Running ${mockedTests.length} mocked test suites ===`);
  for (const { example, test } of mockedTests) {
    console.error(`Running: ${example.name} (${test.command})`);

    const exampleDir = join(PROJECT_ROOT, example.path);
    if (!existsSync(join(exampleDir, 'node_modules'))) {
      console.error('  Installing dependencies...');
      await runNpmInstall(exampleDir);
    }

    const result = await runTest(example, test);
    results.push(result);
    console.error(`  ${result.status.toUpperCase()} (${result.duration}ms)`);
  }

  // Run E2E tests
  console.error(`\n=== Running ${e2eTests.length} E2E test suites ===`);

  // Check credentials
  const hasCredentials = process.env.UMBRACO_USER_LOGIN && process.env.UMBRACO_USER_PASSWORD;
  if (!hasCredentials && e2eTests.length > 0) {
    console.error('Warning: UMBRACO_USER_LOGIN and UMBRACO_USER_PASSWORD not set');
    console.error('E2E tests may fail without credentials');
  }

  // Ensure Umbraco is running for E2E tests
  if (e2eTests.length > 0) {
    umbracoStarted = await ensureUmbracoRunning();
    if (!await checkUmbracoHealth(UMBRACO_URL)) {
      console.error('Umbraco is not available, skipping E2E tests');
      for (const { example, test } of e2eTests) {
        results.push({
          example: example.name,
          path: example.path,
          type: test.type,
          command: test.command,
          status: 'skipped',
          duration: 0,
          error: 'Umbraco not available'
        });
      }
    } else {
      for (const { example, test } of e2eTests) {
        console.error(`Running: ${example.name} (${test.command})`);

        const exampleDir = join(PROJECT_ROOT, example.path);
        if (!existsSync(join(exampleDir, 'node_modules'))) {
          console.error('  Installing dependencies...');
          await runNpmInstall(exampleDir);
        }

        const result = await runTest(example, test);
        results.push(result);
        console.error(`  ${result.status.toUpperCase()} (${result.duration}ms)`);
      }
    }
  }

  // Stop Umbraco if we started it
  stopUmbraco();

  // Build report
  const report: TestReport = {
    timestamp: new Date().toISOString(),
    umbracoStarted,
    umbracoUrl: UMBRACO_URL,
    summary: {
      total: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length
    },
    results
  };

  return report;
}

// Handle process exit
process.on('SIGINT', () => {
  stopUmbraco();
  process.exit(1);
});

process.on('SIGTERM', () => {
  stopUmbraco();
  process.exit(1);
});

// Run tests
runTests()
  .then(report => {
    // Output JSON to stdout
    console.log(JSON.stringify(report, null, 2));

    // Also save to file in project root
    const reportPath = join(PROJECT_ROOT, 'test-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.error(`\nReport saved to ${reportPath}`);
    console.error(`Total: ${report.summary.total}, Passed: ${report.summary.passed}, Failed: ${report.summary.failed}, Skipped: ${report.summary.skipped}`);

    // Exit with 0 (report only mode - don't fail on test failures)
    process.exit(0);
  })
  .catch(error => {
    console.error('Test runner failed:', error);
    stopUmbraco();
    process.exit(2);
  });
