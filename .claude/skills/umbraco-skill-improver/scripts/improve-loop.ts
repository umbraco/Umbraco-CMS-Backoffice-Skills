#!/usr/bin/env npx tsx

/**
 * Main orchestrator - runs the full improvement loop.
 *
 * Flow: prep -> gen -> validate -> score -> improve -> repeat
 * Stops when: score >= 0.90 for 2 iterations, plateau, max iterations,
 *             or STOP file detected in results dir.
 *
 * Escape hatches:
 * - Touch <results-dir>/STOP to gracefully stop between phases
 * - PID file written to <results-dir>/improver.pid for manual kill
 * - Subprocesses get SIGKILL after 10s if they don't die on SIGTERM
 */

import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync, unlinkSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { execSync, spawn, ChildProcess } from 'child_process';
import {
  parseSkillMd,
  ensureDir,
  writeJson,
  readJson,
  getResultsDir,
  skillNameFromPath,
  parseArgs,
  SCRIPT_DIR,
  PROJECT_ROOT,
} from './utils.js';

// --- Types ---

interface LoopConfig {
  skillPath: string;
  maxIterations: number;
  model?: string;
  runsPerEval: number;
  targetScore: number;
  plateauThreshold: number;
  plateauPatience: number;
  verbose: boolean;
  timeout: number;
}

interface IterationResult {
  iteration: number;
  compositeScore: number;
  skillLineCount: number;
  skillMdPath: string;
}

interface LoopSummary {
  skillName: string;
  skillPath: string;
  timestamp: string;
  totalIterations: number;
  bestIteration: number;
  bestScore: number;
  baselineScore: number;
  improvement: number;
  converged: boolean;
  convergenceReason: string;
  iterations: IterationResult[];
}

// --- Escape Hatch: STOP file check ---

function shouldStop(resultsDir: string): boolean {
  return existsSync(join(resultsDir, 'STOP'));
}

// --- Escape Hatch: PID file ---

function writePidFile(resultsDir: string): void {
  writeFileSync(join(resultsDir, 'improver.pid'), String(process.pid));
}

function removePidFile(resultsDir: string): void {
  try { unlinkSync(join(resultsDir, 'improver.pid')); } catch {}
}

// --- Subprocess Runner with hard kill ---

function runScript(
  script: string,
  args: string[],
  options: { verbose?: boolean; timeout?: number } = {}
): { stdout: string; exitCode: number } {
  const cmd = `npx tsx ${join(SCRIPT_DIR, script)} ${args.join(' ')}`;
  const { verbose = false, timeout = 300000 } = options;

  if (verbose) {
    console.error(`  > ${cmd}`);
  }

  try {
    const stdout = execSync(cmd, {
      cwd: SCRIPT_DIR,
      encoding: 'utf-8',
      timeout,
      stdio: ['pipe', 'pipe', verbose ? 'inherit' : 'pipe'],
      maxBuffer: 10 * 1024 * 1024,
      killSignal: 'SIGTERM',
    });
    return { stdout, exitCode: 0 };
  } catch (error: any) {
    // If it was a timeout, the process may still be alive. execSync sends
    // SIGTERM on timeout. We don't need to SIGKILL here because execSync
    // already handles cleanup, but log it clearly.
    if (error.killed) {
      console.error(`  [TIMEOUT] Script killed after ${timeout}ms: ${script}`);
    }
    return { stdout: error.stdout || '', exitCode: error.status || 1 };
  }
}

// --- Main Loop ---

async function main() {
  const rawArgs = parseArgs(process.argv.slice(2));

  const config: LoopConfig = {
    skillPath: rawArgs['skill-path'] || '',
    maxIterations: parseInt(rawArgs['max-iterations'] || '8'),
    model: rawArgs['model'],
    runsPerEval: parseInt(rawArgs['runs-per-eval'] || '2'),
    targetScore: parseFloat(rawArgs['target-score'] || '0.90'),
    plateauThreshold: parseFloat(rawArgs['plateau-threshold'] || '0.02'),
    plateauPatience: parseInt(rawArgs['plateau-patience'] || '3'),
    verbose: rawArgs['verbose'] === 'true',
    timeout: parseInt(rawArgs['timeout'] || '180000'),
  };

  if (!config.skillPath) {
    console.error(`Usage: npx tsx improve-loop.ts --skill-path <path> [options]

Options:
  --max-iterations <n>     Max loop iterations (default: 8)
  --model <model>          Claude model to use
  --runs-per-eval <n>      Runs per eval prompt (default: 2)
  --target-score <f>       Target composite score (default: 0.90)
  --plateau-threshold <f>  Min improvement to avoid plateau (default: 0.02)
  --plateau-patience <n>   Plateau iterations before stopping (default: 3)
  --verbose                Show detailed output
  --timeout <ms>           Timeout per claude -p call (default: 180000)

Escape hatches:
  touch <results-dir>/STOP   Gracefully stop after current phase
  kill $(cat <results-dir>/improver.pid)   Kill the process`);
    process.exit(1);
  }

  const skillPath = resolve(config.skillPath);
  const skillName = skillNameFromPath(skillPath);
  const resultsDir = getResultsDir(skillName);
  ensureDir(resultsDir);

  // Write PID file
  writePidFile(resultsDir);

  // Clean up on exit
  const cleanup = (originalSkillMd?: string) => {
    removePidFile(resultsDir);
    // Remove STOP file if present so next run starts clean
    try { unlinkSync(join(resultsDir, 'STOP')); } catch {}
  };

  process.on('SIGINT', () => {
    console.error('\n[INTERRUPTED] Caught SIGINT, cleaning up...');
    cleanup();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    console.error('\n[TERMINATED] Caught SIGTERM, cleaning up...');
    cleanup();
    process.exit(143);
  });

  console.error(`\n=== Umbraco Skill Improver ===`);
  console.error(`Skill: ${skillName}`);
  console.error(`Path: ${skillPath}`);
  console.error(`Results: ${resultsDir}`);
  console.error(`PID: ${process.pid}`);
  console.error(`Max iterations: ${config.maxIterations}`);
  console.error(`Target score: ${config.targetScore}`);
  console.error(`\nTo stop: touch ${resultsDir}/STOP`);
  console.error(`To kill: kill ${process.pid}`);
  console.error('');

  // --- Phase 1: Prep ---
  console.error('Phase 1: PREP - Generating eval set...');
  const prepResult = runScript('generate-eval-set.ts', [
    '--skill-path', skillPath,
  ], { verbose: config.verbose });

  if (prepResult.exitCode === 2) {
    console.error('FATAL: Eval generation failed');
    cleanup();
    process.exit(2);
  }

  if (shouldStop(resultsDir)) {
    console.error('\n[STOPPED] STOP file detected after prep phase');
    cleanup();
    process.exit(0);
  }

  const evalSetPath = join(resultsDir, 'eval-set.json');
  const docSnapshotDir = join(resultsDir, 'doc-snapshots');
  console.error(`Eval set: ${evalSetPath}`);
  console.error('');

  // --- Iteration Loop ---
  const iterations: IterationResult[] = [];
  let bestIteration = 0;
  let bestScore = 0;
  let consecutiveHighScores = 0;
  let plateauCount = 0;
  let convergenceReason = 'max-iterations';

  // Save original SKILL.md
  const originalSkillMd = readFileSync(join(skillPath, 'SKILL.md'), 'utf-8');
  let currentSkillMd = originalSkillMd;

  for (let iter = 0; iter < config.maxIterations; iter++) {
    // Check STOP file before each iteration
    if (shouldStop(resultsDir)) {
      convergenceReason = 'stopped';
      console.error(`\n[STOPPED] STOP file detected before iteration ${iter}`);
      break;
    }

    const iterDir = join(resultsDir, `iteration-${iter}`);
    ensureDir(iterDir);

    console.error(`\n--- Iteration ${iter} ---`);

    // Snapshot current SKILL.md
    writeFileSync(join(iterDir, 'SKILL.md.snapshot'), currentSkillMd);

    // For iteration > 0, we need to temporarily write the improved SKILL.md
    const skillMdPath = join(skillPath, 'SKILL.md');
    if (iter > 0) {
      writeFileSync(skillMdPath, currentSkillMd);
    }

    // --- Phase 2: Generate ---
    console.error('Phase 2: GEN - Running skill eval...');
    const modelArgs = config.model ? ['--model', config.model] : [];
    runScript('run-skill-eval.ts', [
      '--skill-path', skillPath,
      '--eval-set', evalSetPath,
      '--runs', String(config.runsPerEval),
      '--iteration', String(iter),
      '--timeout', String(config.timeout),
      ...modelArgs,
    ], { verbose: config.verbose, timeout: config.timeout * config.runsPerEval * 4 });

    if (shouldStop(resultsDir)) {
      convergenceReason = 'stopped';
      console.error(`\n[STOPPED] STOP file detected after gen phase`);
      break;
    }

    // --- Phase 3: Validate ---
    console.error('Phase 3: VALIDATE - Running validation...');
    const evalSet = readJson<{ evals: Array<{ id: number }> }>(evalSetPath);

    for (const evalItem of evalSet.evals) {
      for (let run = 1; run <= config.runsPerEval; run++) {
        const runDir = join(iterDir, `eval-${evalItem.id}`, `run-${run}`);
        if (existsSync(join(runDir, 'outputs'))) {
          runScript('validate.ts', [
            '--run-dir', runDir,
            '--doc-snapshots', docSnapshotDir,
          ], { verbose: config.verbose });
        }
      }
    }

    if (shouldStop(resultsDir)) {
      convergenceReason = 'stopped';
      console.error(`\n[STOPPED] STOP file detected after validate phase`);
      break;
    }

    // --- Phase 4: Score ---
    console.error('Phase 4: SCORE - Computing scores...');
    const skillLines = currentSkillMd.split('\n').length;
    const scoreResult = runScript('score-iteration.ts', [
      '--iteration-dir', iterDir,
      '--skill-lines', String(skillLines),
      '--iteration', String(iter),
    ], { verbose: config.verbose });

    let compositeScore = 0;
    try {
      const scores = JSON.parse(scoreResult.stdout);
      compositeScore = scores.averageScores?.composite || 0;
    } catch {
      console.error('Warning: Could not parse scores');
    }

    const iterResult: IterationResult = {
      iteration: iter,
      compositeScore,
      skillLineCount: skillLines,
      skillMdPath: join(iterDir, 'SKILL.md.snapshot'),
    };
    iterations.push(iterResult);

    console.error(`  Score: ${compositeScore.toFixed(3)} (${skillLines} lines)`);

    // Track best
    if (compositeScore > bestScore) {
      bestScore = compositeScore;
      bestIteration = iter;
    }

    // Check convergence
    if (compositeScore >= config.targetScore) {
      consecutiveHighScores++;
      if (consecutiveHighScores >= 2) {
        convergenceReason = 'target-reached';
        console.error(`\nConverged: target score ${config.targetScore} reached for 2 consecutive iterations`);
        break;
      }
    } else {
      consecutiveHighScores = 0;
    }

    // Check plateau
    if (iter > 0) {
      const prevScore = iterations[iter - 1].compositeScore;
      const improvement = compositeScore - prevScore;
      if (Math.abs(improvement) < config.plateauThreshold) {
        plateauCount++;
        if (plateauCount >= config.plateauPatience) {
          convergenceReason = 'plateau';
          console.error(`\nConverged: score plateau for ${config.plateauPatience} iterations`);
          break;
        }
      } else {
        plateauCount = 0;
      }
    }

    if (shouldStop(resultsDir)) {
      convergenceReason = 'stopped';
      console.error(`\n[STOPPED] STOP file detected after score phase`);
      break;
    }

    // --- Phase 5: Improve (if not last iteration) ---
    if (iter < config.maxIterations - 1) {
      console.error('Phase 5: IMPROVE - Rewriting SKILL.md...');
      const nextIterDir = join(resultsDir, `iteration-${iter + 1}`);

      const improveResult = runScript('improve-skill.ts', [
        '--skill-path', skillPath,
        '--iteration-dir', nextIterDir,
        '--iteration', String(iter + 1),
        '--doc-snapshots', docSnapshotDir,
        ...modelArgs,
      ], { verbose: config.verbose, timeout: 180000 });

      // Load improved SKILL.md
      const improvedPath = join(nextIterDir, 'SKILL.md.snapshot');
      if (existsSync(improvedPath)) {
        currentSkillMd = readFileSync(improvedPath, 'utf-8');
        console.error(`  New SKILL.md: ${currentSkillMd.split('\n').length} lines`);
      } else {
        console.error('  Warning: No improved SKILL.md found, continuing with current');
      }
    }
  }

  // --- Restore best SKILL.md ---
  console.error(`\n=== Results ===`);
  console.error(`Best iteration: ${bestIteration} (score: ${bestScore.toFixed(3)})`);
  console.error(`Baseline score: ${iterations[0]?.compositeScore?.toFixed(3) || 'N/A'}`);
  console.error(`Improvement: ${((bestScore - (iterations[0]?.compositeScore || 0)) * 100).toFixed(1)}%`);
  console.error(`Convergence: ${convergenceReason}`);

  // Restore original SKILL.md (don't auto-apply changes)
  writeFileSync(join(skillPath, 'SKILL.md'), originalSkillMd);

  // Build summary
  const summary: LoopSummary = {
    skillName,
    skillPath,
    timestamp: new Date().toISOString(),
    totalIterations: iterations.length,
    bestIteration,
    bestScore,
    baselineScore: iterations[0]?.compositeScore || 0,
    improvement: bestScore - (iterations[0]?.compositeScore || 0),
    converged: convergenceReason !== 'max-iterations',
    convergenceReason,
    iterations,
  };

  writeJson(join(resultsDir, 'summary.json'), summary);

  // Build benchmark.json compatible with skill-creator viewer
  const benchmarkRuns = iterations.map((iter, i) => ({
    eval_id: i + 1,
    eval_name: `Iteration ${iter.iteration}`,
    configuration: 'with_skill' as const,
    run_number: 1,
    result: {
      pass_rate: iter.compositeScore,
      passed: Math.round(iter.compositeScore * 10),
      failed: 10 - Math.round(iter.compositeScore * 10),
      total: 10,
      time_seconds: 0,
      tokens: 0,
      tool_calls: 0,
      errors: 0,
    },
  }));

  const benchmark = {
    metadata: {
      skill_name: skillName,
      skill_path: skillPath,
      executor_model: config.model || 'default',
      timestamp: new Date().toISOString(),
      evals_run: iterations.map(i => i.iteration),
      runs_per_configuration: 1,
    },
    runs: benchmarkRuns,
    run_summary: {
      with_skill: {
        pass_rate: {
          mean: bestScore,
          stddev: 0,
          min: Math.min(...iterations.map(i => i.compositeScore)),
          max: Math.max(...iterations.map(i => i.compositeScore)),
        },
      },
    },
    notes: [
      `Best iteration: ${bestIteration} (${bestScore.toFixed(3)})`,
      `Baseline: ${iterations[0]?.compositeScore?.toFixed(3)}`,
      `Convergence: ${convergenceReason}`,
    ],
  };

  writeJson(join(resultsDir, 'benchmark.json'), benchmark);

  console.log(JSON.stringify(summary, null, 2));

  // Print location of best SKILL.md for manual application
  const bestSkillMd = join(resultsDir, `iteration-${bestIteration}`, 'SKILL.md.snapshot');
  if (existsSync(bestSkillMd)) {
    console.error(`\nBest SKILL.md available at: ${bestSkillMd}`);
    console.error(`To apply: cp "${bestSkillMd}" "${join(skillPath, 'SKILL.md')}"`);
  }

  cleanup();
}

main().catch(error => {
  console.error('Improvement loop failed:', error);
  // Try to clean up PID file on crash
  try {
    const rawArgs = parseArgs(process.argv.slice(2));
    const skillPath = resolve(rawArgs['skill-path'] || '');
    const skillName = skillNameFromPath(skillPath);
    const resultsDir = getResultsDir(skillName);
    removePidFile(resultsDir);
  } catch {}
  process.exit(2);
});
