#!/usr/bin/env npx tsx

/**
 * Phase 4: SCORE - Composite scoring for an iteration.
 *
 * Dimensions:
 * - Structural correctness (0.25) - manifest shape, required fields
 * - Code quality (0.20) - static analysis pass rate
 * - Playwright pass (0.30) - extension renders/works
 * - Doc accuracy (0.10) - patterns match current docs
 * - Skill compactness (0.15) - smaller skills that maintain quality score higher
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import {
  writeJson,
  readJson,
  parseArgs,
} from './utils.js';

// --- Types ---

interface ValidationResult {
  staticAnalysis: {
    passed: boolean;
    importIssues: number;
    typeIssues: number;
    deprecatedPatterns: number;
    compilationErrors: number;
  };
  docComparison: {
    passed: boolean;
    drifts: Array<{ severity: string }>;
  };
  playwright: {
    ran: boolean;
    passed: boolean;
    testsPassed: number;
    testsFailed: number;
  };
  issues: Array<{ level: string; severity: string }>;
}

interface RunResult {
  evalId: number;
  evalName: string;
  runNumber: number;
  success: boolean;
  outputDir: string;
}

interface ScoreBreakdown {
  structural: number;
  codeQuality: number;
  playwright: number;
  docAccuracy: number;
  compactness: number;
  composite: number;
}

interface IterationScore {
  iteration: number;
  timestamp: string;
  skillLineCount: number;
  runsAnalyzed: number;
  perRunScores: Array<{
    evalId: number;
    runNumber: number;
    scores: ScoreBreakdown;
  }>;
  averageScores: ScoreBreakdown;
  weights: Record<string, number>;
}

// --- Weights ---

const WEIGHTS = {
  structural: 0.25,
  codeQuality: 0.20,
  playwright: 0.30,
  docAccuracy: 0.10,
  compactness: 0.15,
};

// --- Structural Score ---

function scoreStructural(outputDir: string): number {
  if (!existsSync(outputDir)) return 0;

  const files = readdirSync(outputDir);
  let score = 0;
  let checks = 0;

  // Check for manifest
  checks++;
  const hasManifest = files.some(f => f.includes('package.json') || f.includes('manifest'));
  if (hasManifest) {
    score++;

    // Read manifest and check required fields
    const manifestFile = files.find(f => f.includes('package.json') || f.includes('manifest'));
    if (manifestFile) {
      const content = readFileSync(join(outputDir, manifestFile), 'utf-8');

      checks++;
      if (/"type"\s*:/.test(content)) score++;

      checks++;
      if (/"alias"\s*:/.test(content)) score++;

      checks++;
      if (/"name"\s*:/.test(content)) score++;

      checks++;
      if (/"element"\s*:|"js"\s*:/.test(content)) score++;
    }
  }

  // Check for element implementation
  checks++;
  const hasElement = files.some(f =>
    (f.endsWith('.ts') || f.endsWith('.js')) && !f.includes('package.json')
  );
  if (hasElement) {
    score++;

    // Check element has class definition
    const elementFile = files.find(f =>
      (f.endsWith('.ts') || f.endsWith('.js')) && !f.includes('package.json')
    );
    if (elementFile) {
      const content = readFileSync(join(outputDir, elementFile), 'utf-8');

      checks++;
      if (/class\s+\w+/.test(content)) score++;

      checks++;
      if (/render\s*\(/.test(content)) score++;

      checks++;
      if (/html\s*`/.test(content)) score++;
    }
  }

  return checks > 0 ? score / checks : 0;
}

// --- Code Quality Score ---

function scoreCodeQuality(validationResult: ValidationResult | null): number {
  if (!validationResult) return 0.5; // Neutral if no validation

  const totalIssues = validationResult.issues.length;
  const errorCount = validationResult.issues.filter(i => i.severity === 'error').length;
  const warningCount = validationResult.issues.filter(i => i.severity === 'warning').length;

  // Deduct for issues: errors cost 0.15 each, warnings cost 0.05 each
  const deduction = Math.min(1.0, errorCount * 0.15 + warningCount * 0.05);
  return Math.max(0, 1.0 - deduction);
}

// --- Playwright Score ---

function scorePlaywright(validationResult: ValidationResult | null): number {
  if (!validationResult || !validationResult.playwright.ran) {
    // If Playwright didn't run, give partial credit based on static analysis
    // This prevents penalizing when Playwright isn't available
    if (validationResult?.staticAnalysis.passed) return 0.5;
    return 0.3;
  }

  const { testsPassed, testsFailed } = validationResult.playwright;
  const total = testsPassed + testsFailed;
  return total > 0 ? testsPassed / total : 0;
}

// --- Doc Accuracy Score ---

function scoreDocAccuracy(validationResult: ValidationResult | null): number {
  if (!validationResult) return 0.5;

  const drifts = validationResult.docComparison.drifts;
  if (drifts.length === 0) return 1.0;

  const errorDrifts = drifts.filter(d => d.severity === 'error').length;
  const warningDrifts = drifts.filter(d => d.severity === 'warning').length;

  const deduction = Math.min(1.0, errorDrifts * 0.25 + warningDrifts * 0.10);
  return Math.max(0, 1.0 - deduction);
}

// --- Compactness Score ---

function scoreCompactness(skillLineCount: number): number {
  // Target: 50-150 lines is ideal
  // Penalize both too short (insufficient guidance) and too long (bloated)
  if (skillLineCount < 20) return 0.3;
  if (skillLineCount <= 50) return 0.7 + (skillLineCount - 20) / 100;
  if (skillLineCount <= 100) return 1.0;
  if (skillLineCount <= 150) return 1.0 - (skillLineCount - 100) / 500;
  if (skillLineCount <= 300) return 0.9 - (skillLineCount - 150) / 500;
  return Math.max(0.3, 0.6 - (skillLineCount - 300) / 1000);
}

// --- Score a Single Run ---

function scoreRun(
  outputDir: string,
  validationResult: ValidationResult | null,
  skillLineCount: number
): ScoreBreakdown {
  const structural = scoreStructural(outputDir);
  const codeQuality = scoreCodeQuality(validationResult);
  const playwright = scorePlaywright(validationResult);
  const docAccuracy = scoreDocAccuracy(validationResult);
  const compactness = scoreCompactness(skillLineCount);

  const composite =
    structural * WEIGHTS.structural +
    codeQuality * WEIGHTS.codeQuality +
    playwright * WEIGHTS.playwright +
    docAccuracy * WEIGHTS.docAccuracy +
    compactness * WEIGHTS.compactness;

  return {
    structural: Math.round(structural * 1000) / 1000,
    codeQuality: Math.round(codeQuality * 1000) / 1000,
    playwright: Math.round(playwright * 1000) / 1000,
    docAccuracy: Math.round(docAccuracy * 1000) / 1000,
    compactness: Math.round(compactness * 1000) / 1000,
    composite: Math.round(composite * 1000) / 1000,
  };
}

// --- Main ---

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const iterDir = args['iteration-dir'];
  const skillLineCount = parseInt(args['skill-lines'] || '100');
  const iteration = parseInt(args['iteration'] || '0');

  if (!iterDir) {
    console.error('Usage: npx tsx score-iteration.ts --iteration-dir <path> [--skill-lines 100] [--iteration 0]');
    process.exit(1);
  }

  console.error(`Scoring iteration ${iteration}: ${iterDir}`);

  // Find all eval/run directories
  const perRunScores: IterationScore['perRunScores'] = [];

  if (!existsSync(iterDir)) {
    console.error(`Iteration directory not found: ${iterDir}`);
    process.exit(1);
  }

  const evalDirs = readdirSync(iterDir)
    .filter(d => d.startsWith('eval-') && statSync(join(iterDir, d)).isDirectory());

  for (const evalDir of evalDirs) {
    const evalId = parseInt(evalDir.replace('eval-', ''));
    const evalPath = join(iterDir, evalDir);

    const runDirs = readdirSync(evalPath)
      .filter(d => d.startsWith('run-') && statSync(join(evalPath, d)).isDirectory());

    for (const runDir of runDirs) {
      const runNumber = parseInt(runDir.replace('run-', ''));
      const runPath = join(evalPath, runDir);
      const outputDir = join(runPath, 'outputs');

      // Try to load validation result
      let validationResult: ValidationResult | null = null;
      const validationPath = join(runPath, 'validation-result.json');
      if (existsSync(validationPath)) {
        validationResult = readJson<ValidationResult>(validationPath);
      }

      const scores = scoreRun(outputDir, validationResult, skillLineCount);
      perRunScores.push({ evalId, runNumber, scores });

      console.error(`  Eval ${evalId} Run ${runNumber}: composite=${scores.composite} (struct=${scores.structural} quality=${scores.codeQuality} pw=${scores.playwright} docs=${scores.docAccuracy} compact=${scores.compactness})`);
    }
  }

  // Compute averages
  const avgScores: ScoreBreakdown = {
    structural: 0, codeQuality: 0, playwright: 0,
    docAccuracy: 0, compactness: 0, composite: 0,
  };

  if (perRunScores.length > 0) {
    for (const run of perRunScores) {
      avgScores.structural += run.scores.structural;
      avgScores.codeQuality += run.scores.codeQuality;
      avgScores.playwright += run.scores.playwright;
      avgScores.docAccuracy += run.scores.docAccuracy;
      avgScores.compactness += run.scores.compactness;
      avgScores.composite += run.scores.composite;
    }
    const n = perRunScores.length;
    avgScores.structural = Math.round(avgScores.structural / n * 1000) / 1000;
    avgScores.codeQuality = Math.round(avgScores.codeQuality / n * 1000) / 1000;
    avgScores.playwright = Math.round(avgScores.playwright / n * 1000) / 1000;
    avgScores.docAccuracy = Math.round(avgScores.docAccuracy / n * 1000) / 1000;
    avgScores.compactness = Math.round(avgScores.compactness / n * 1000) / 1000;
    avgScores.composite = Math.round(avgScores.composite / n * 1000) / 1000;
  }

  const result: IterationScore = {
    iteration,
    timestamp: new Date().toISOString(),
    skillLineCount,
    runsAnalyzed: perRunScores.length,
    perRunScores,
    averageScores: avgScores,
    weights: WEIGHTS,
  };

  // Write scores
  const scoresPath = join(iterDir, 'scores.json');
  writeJson(scoresPath, result);

  console.log(JSON.stringify(result, null, 2));
  console.error(`\nAverage composite score: ${avgScores.composite} (${perRunScores.length} runs)`);
}

main().catch(error => {
  console.error('Scoring failed:', error);
  process.exit(2);
});
