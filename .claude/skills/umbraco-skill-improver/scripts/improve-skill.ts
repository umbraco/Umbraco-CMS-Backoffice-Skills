#!/usr/bin/env npx tsx

/**
 * Phase 5: IMPROVE - LLM-based SKILL.md rewrite.
 *
 * Spawns `claude -p` with the skill-improver agent prompt, feeding it:
 * - Current SKILL.md + failure analysis + doc snapshot
 * Constraints: fix broken examples, remove dead-weight, match docs.
 * Cannot change frontmatter (name/description).
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import {
  parseSkillMd,
  runClaudeP,
  writeJson,
  readJson,
  ensureDir,
  generateDiff,
  parseArgs,
  skillNameFromPath,
  getResultsDir,
} from './utils.js';

// --- Types ---

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
  averageScores: ScoreBreakdown;
  perRunScores: Array<{
    evalId: number;
    runNumber: number;
    scores: ScoreBreakdown;
  }>;
}

interface ValidationResult {
  issues: Array<{ level: string; severity: string; file: string; message: string }>;
  docComparison: { drifts: Array<{ category: string; skillPattern: string; docPattern: string; message: string }> };
}

interface ImproveResult {
  iteration: number;
  originalLineCount: number;
  newLineCount: number;
  changesApplied: boolean;
  improvementPrompt: string;
  newSkillMd: string;
  diff: string;
}

// --- Build Improvement Prompt ---

function buildImprovementPrompt(
  currentSkillMd: string,
  scores: IterationScore,
  validationIssues: Array<{ level: string; severity: string; message: string }>,
  docDrifts: Array<{ category: string; skillPattern: string; docPattern: string; message: string }>,
  docSnapshots: string
): string {
  const failureSummary = validationIssues
    .filter(i => i.severity === 'error' || i.severity === 'warning')
    .map(i => `- [${i.severity}] ${i.message}`)
    .join('\n');

  const driftSummary = docDrifts
    .map(d => `- [${d.category}] Skill uses: ${d.skillPattern} -> Docs show: ${d.docPattern}`)
    .join('\n');

  const scoresSummary = `
Composite: ${scores.averageScores.composite}
- Structural: ${scores.averageScores.structural} (weight: 0.25)
- Code Quality: ${scores.averageScores.codeQuality} (weight: 0.20)
- Playwright: ${scores.averageScores.playwright} (weight: 0.30)
- Doc Accuracy: ${scores.averageScores.docAccuracy} (weight: 0.10)
- Compactness: ${scores.averageScores.compactness} (weight: 0.15)`;

  return `You are a skill improver for Umbraco backoffice skills. Your job is to rewrite a SKILL.md file to improve the quality of code that Claude generates when using this skill.

## Current SKILL.md

\`\`\`markdown
${currentSkillMd}
\`\`\`

## Current Scores
${scoresSummary}

## Validation Issues Found in Generated Code
${failureSummary || 'No issues found'}

## Documentation Drift (Skill vs Current Docs)
${driftSummary || 'No drift detected'}

## Current Documentation (Fetched)
${docSnapshots.slice(0, 8000)}

## Rules

1. **DO NOT change the frontmatter** (name, description, version, location, allowed-tools)
2. **Fix code examples** to match current documentation patterns exactly
3. **Remove dead-weight instructions** that don't improve output quality
4. **Keep the skill as compact as possible** - fewer lines = better (target 50-150 lines of content)
5. **Ensure all import paths are correct** for @umbraco-cms/backoffice/*
6. **Use the patterns shown in the current docs**, not outdated patterns
7. **Include a working manifest example** with correct fields
8. **Include a working element implementation** with correct base class and registration

## Output

CRITICAL: Return ONLY the improved SKILL.md content (including frontmatter). Start your response with \`---\` (the frontmatter delimiter). Do NOT write any files. Do NOT use any tools. Do NOT wrap in a code block. Just output the raw markdown content starting with the frontmatter.`;
}

// --- Extract SKILL.md from Claude Output ---

function extractSkillMd(output: string): string | null {
  // Try JSON format first
  try {
    const parsed = JSON.parse(output);
    const text = parsed.result || parsed.content || '';
    return extractFromText(text);
  } catch {
    return extractFromText(output);
  }
}

function extractFromText(text: string): string | null {
  // If it starts with ---, it's raw SKILL.md content
  if (text.trim().startsWith('---')) {
    return text.trim();
  }

  // Try to extract from code block
  const match = text.match(/```(?:markdown|md)?\n(---[\s\S]*?)```/);
  if (match) return match[1].trim();

  // Look for frontmatter anywhere
  const fmMatch = text.match(/(---\n[\s\S]*?\n---[\s\S]*)/);
  if (fmMatch) return fmMatch[1].trim();

  return null;
}

// --- Main ---

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const skillPath = args['skill-path'];
  const iterDir = args['iteration-dir'];
  const iteration = parseInt(args['iteration'] || '1');
  const model = args['model'];
  const docSnapshotDir = args['doc-snapshots'];

  if (!skillPath || !iterDir) {
    console.error('Usage: npx tsx improve-skill.ts --skill-path <path> --iteration-dir <path> [--iteration 1] [--model <model>] [--doc-snapshots <path>]');
    process.exit(1);
  }

  const skillName = skillNameFromPath(skillPath);
  console.error(`Improving skill: ${skillName} (iteration ${iteration})`);

  // Read current SKILL.md
  const skill = parseSkillMd(skillPath);
  const currentSkillMd = skill.content;

  // Read scores from previous iteration
  const prevIterDir = join(dirname(iterDir), `iteration-${iteration - 1}`);
  let scores: IterationScore | null = null;
  const scoresPath = join(prevIterDir, 'scores.json');
  if (existsSync(scoresPath)) {
    scores = readJson<IterationScore>(scoresPath);
  }

  if (!scores) {
    console.error(`Warning: No scores found at ${scoresPath}, using defaults`);
    scores = {
      iteration: iteration - 1,
      averageScores: {
        structural: 0.5, codeQuality: 0.5, playwright: 0.3,
        docAccuracy: 0.5, compactness: 0.5, composite: 0.4,
      },
      perRunScores: [],
    };
  }

  // Collect validation issues from previous iteration
  const validationIssues: Array<{ level: string; severity: string; message: string }> = [];
  const docDrifts: Array<{ category: string; skillPattern: string; docPattern: string; message: string }> = [];

  // Scan all validation results in previous iteration
  if (existsSync(prevIterDir)) {
    const { readdirSync, statSync } = await import('fs');
    const evalDirs = readdirSync(prevIterDir)
      .filter(d => d.startsWith('eval-'));

    for (const evalDir of evalDirs) {
      const evalPath = join(prevIterDir, evalDir);
      if (!statSync(evalPath).isDirectory()) continue;

      const runDirs = readdirSync(evalPath).filter(d => d.startsWith('run-'));
      for (const runDir of runDirs) {
        const valPath = join(evalPath, runDir, 'validation-result.json');
        if (existsSync(valPath)) {
          const val = readJson<ValidationResult>(valPath);
          validationIssues.push(...val.issues);
          docDrifts.push(...val.docComparison.drifts);
        }
      }
    }
  }

  // Read doc snapshots
  let docSnapshots = '';
  if (docSnapshotDir && existsSync(docSnapshotDir)) {
    const { readdirSync } = await import('fs');
    const docFiles = readdirSync(docSnapshotDir).filter(f => f.endsWith('.txt'));
    for (const f of docFiles) {
      const content = readFileSync(join(docSnapshotDir, f), 'utf-8');
      docSnapshots += content.slice(0, 3000) + '\n\n';
    }
  }

  // Build improvement prompt
  const prompt = buildImprovementPrompt(
    currentSkillMd,
    scores,
    validationIssues,
    docDrifts,
    docSnapshots
  );

  console.error('Running improvement via claude -p...');
  const result = runClaudeP(prompt, { model, timeout: 180000, noTools: true });

  if (result.exitCode !== 0) {
    console.error(`claude -p failed: ${result.stderr}`);
    process.exit(1);
  }

  // Extract improved SKILL.md
  const newSkillMd = extractSkillMd(result.stdout);
  if (!newSkillMd) {
    console.error('Failed to extract improved SKILL.md from output');
    console.error('Raw output:', result.stdout.slice(0, 500));
    process.exit(1);
  }

  // Validate frontmatter preserved
  const newLines = newSkillMd.split('\n');
  if (!newLines[0]?.trim().startsWith('---')) {
    console.error('Improved SKILL.md missing frontmatter');
    process.exit(1);
  }

  // Generate diff
  const diff = generateDiff(currentSkillMd, newSkillMd);

  // Save to iteration directory
  ensureDir(iterDir);
  writeFileSync(join(iterDir, 'SKILL.md.snapshot'), newSkillMd);
  writeFileSync(join(iterDir, 'SKILL.md.diff'), diff);

  const improveResult: ImproveResult = {
    iteration,
    originalLineCount: currentSkillMd.split('\n').length,
    newLineCount: newSkillMd.split('\n').length,
    changesApplied: newSkillMd !== currentSkillMd,
    improvementPrompt: prompt.slice(0, 500) + '...',
    newSkillMd,
    diff,
  };

  writeJson(join(iterDir, 'improve-result.json'), improveResult);
  console.log(JSON.stringify(improveResult, null, 2));

  console.error(`\nImprovement complete: ${improveResult.originalLineCount} -> ${improveResult.newLineCount} lines`);
  console.error(`Changes applied: ${improveResult.changesApplied}`);
}

main().catch(error => {
  console.error('Improvement failed:', error);
  process.exit(2);
});
