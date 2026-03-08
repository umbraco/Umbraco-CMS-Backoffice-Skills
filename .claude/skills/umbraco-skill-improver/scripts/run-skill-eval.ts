#!/usr/bin/env npx tsx

/**
 * Phase 2: GEN - Run skill via claude -p, capture generated code.
 *
 * For each eval prompt, runs `claude -p` with the skill content embedded,
 * captures all generated files to an outputs directory.
 */

import { writeFileSync, mkdtempSync, rmSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { execFileSync } from 'child_process';
import {
  ensureDir,
  writeJson,
  readJson,
  getResultsDir,
  skillNameFromPath,
  parseArgs,
  parseSkillMd,
  PROJECT_ROOT,
} from './utils.js';

// --- Types ---

interface EvalPrompt {
  id: number;
  name: string;
  difficulty: string;
  prompt: string;
  expectedOutput: string;
  assertions: Array<{ type: string; description: string; check: string }>;
}

interface EvalSet {
  skillName: string;
  skillPath: string;
  evals: EvalPrompt[];
}

interface RunResult {
  evalId: number;
  evalName: string;
  runNumber: number;
  success: boolean;
  outputDir: string;
  transcript: string;
  durationMs: number;
  error?: string;
}

// --- Code Extraction from Claude Output ---

function extractFilesFromOutput(output: string): Map<string, string> {
  // Try to parse as JSON first (claude -p --output-format json)
  try {
    const parsed = JSON.parse(output);
    const text = parsed.result || parsed.content || '';
    return extractFilesFromText(text);
  } catch {
    // Not JSON, treat as plain text
  }

  return extractFilesFromText(output);
}

function extractFilesFromText(text: string): Map<string, string> {
  const files = new Map<string, string>();

  // Match code blocks with file paths
  // Pattern 1: ### filename.ext or **filename.ext** followed by code block
  const fileBlockPattern = /(?:#{1,4}\s+|[\*_]{2})`?([\w\-./]+\.(?:ts|js|json|html|css))`?[\*_]{0,2}\s*\n```(?:\w+)?\n([\s\S]*?)```/g;
  let match;
  while ((match = fileBlockPattern.exec(text)) !== null) {
    const filename = match[1].trim();
    if (filename && !files.has(filename)) {
      files.set(filename, match[2].trim());
    }
  }

  // Pattern 2: ```typescript // filename.ext on same line as opening fence
  const namedBlockPattern = /```(\w+)\s+(?:\/\/\s*)?([\w\-./]+\.(?:ts|js|json|html|css))\n([\s\S]*?)```/g;
  while ((match = namedBlockPattern.exec(text)) !== null) {
    const filename = match[2].trim();
    if (!files.has(filename) && !filename.startsWith('#')) {
      files.set(filename, match[3].trim());
    }
  }

  // Pattern 3: If no named files found, extract by content type
  if (files.size === 0) {
    const codeBlockPattern = /```(\w+)?\n([\s\S]*?)```/g;
    let blockIndex = 0;
    while ((match = codeBlockPattern.exec(text)) !== null) {
      const lang = match[1] || 'txt';
      const code = match[2].trim();

      if (code.includes('"type"') && code.includes('"alias"')) {
        files.set('umbraco-package.json', code);
      } else if (lang === 'typescript' || lang === 'ts') {
        const name = code.includes('class ') || code.includes('export default')
          ? 'element.ts'
          : `file-${blockIndex}.ts`;
        if (!files.has(name)) files.set(name, code);
      } else if (lang === 'javascript' || lang === 'js') {
        files.set(`element.js`, code);
      }
      blockIndex++;
    }
  }

  return files;
}

// --- Claude -p via execFileSync ---

function runClaude(
  prompt: string,
  options: {
    cwd?: string;
    model?: string;
    timeout?: number;
  } = {}
): { output: string; durationMs: number; success: boolean; error?: string } {
  const { cwd = PROJECT_ROOT, model, timeout = 180000 } = options;
  const startTime = Date.now();

  // Write prompt to temp file, then pipe it to claude -p -
  const tmpDir = mkdtempSync(join(tmpdir(), 'skill-eval-'));
  const promptFile = join(tmpDir, 'prompt.txt');
  writeFileSync(promptFile, prompt);

  const claudeArgs = [
    '--output-format', 'json',
    '--max-turns', '3',
    '--disallowedTools', 'Bash Read Write Edit Glob Grep Agent Skill WebFetch WebSearch NotebookEdit',
  ];
  if (model) {
    claudeArgs.push('--model', model);
  }

  // Build shell command: cat prompt | claude -p -
  const shellCmd = `cat ${JSON.stringify(promptFile)} | claude -p - ${claudeArgs.map(a => JSON.stringify(a)).join(' ')}`;

  // Remove CLAUDECODE env var to allow nesting
  const env = { ...process.env };
  delete env.CLAUDECODE;

  try {
    const stdout = execFileSync('bash', ['-c', shellCmd], {
      cwd,
      timeout,
      encoding: 'utf-8',
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,
    });
    return {
      output: stdout,
      durationMs: Date.now() - startTime,
      success: true,
    };
  } catch (error: any) {
    return {
      output: error.stdout || '',
      durationMs: Date.now() - startTime,
      success: false,
      error: error.status
        ? `Exit code: ${error.status}\n${error.stderr || ''}`
        : `Error: ${error.message}`,
    };
  } finally {
    try { rmSync(tmpDir, { recursive: true }); } catch {}
  }
}

// --- Main ---

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const skillPath = args['skill-path'];
  const evalSetPath = args['eval-set'];
  const runsPerEval = parseInt(args['runs'] || '2');
  const model = args['model'];
  const timeout = parseInt(args['timeout'] || '180000');
  const iterationNum = parseInt(args['iteration'] || '0');

  if (!skillPath || !evalSetPath) {
    console.error('Usage: npx tsx run-skill-eval.ts --skill-path <path> --eval-set <path> [--runs 2] [--model <model>] [--iteration 0]');
    process.exit(1);
  }

  const evalSet = readJson<EvalSet>(evalSetPath);
  const skillName = skillNameFromPath(skillPath);
  const resultsDir = getResultsDir(skillName);
  const iterDir = join(resultsDir, `iteration-${iterationNum}`);

  // Load SKILL.md content to include in prompts
  const skill = parseSkillMd(skillPath);
  const skillContent = skill.content;

  console.error(`Running evals for: ${skillName} (iteration ${iterationNum})`);
  console.error(`Evals: ${evalSet.evals.length}, Runs per eval: ${runsPerEval}`);

  const allResults: RunResult[] = [];

  for (const evalPrompt of evalSet.evals) {
    for (let run = 1; run <= runsPerEval; run++) {
      const runDir = join(iterDir, `eval-${evalPrompt.id}`, `run-${run}`, 'outputs');
      ensureDir(runDir);

      console.error(`\n[Eval ${evalPrompt.id}/${evalSet.evals.length}] Run ${run}/${runsPerEval}: ${evalPrompt.name}`);

      // Build prompt with skill content embedded
      const fullPrompt = `You are an Umbraco backoffice extension developer. Follow the skill instructions below exactly when generating code.

IMPORTANT: Do NOT use any tools. Do NOT search for files or read documentation. Just output the code directly as text in your response. All the information you need is provided below.

## Skill: ${evalSet.skillName}

${skillContent}

## Task

${evalPrompt.prompt}

## Output Format

Output the code directly in your response. For each file, use a markdown heading with the filename followed by a fenced code block. You MUST use this exact format:

### umbraco-package.json
\`\`\`json
{ ... }
\`\`\`

### my-dashboard.element.ts
\`\`\`typescript
// code here
\`\`\`

Generate all necessary files. You MUST include both the manifest (umbraco-package.json) and the element implementation (.ts file).`;

      const result = runClaude(fullPrompt, { model, timeout });

      console.error(`  Duration: ${(result.durationMs / 1000).toFixed(1)}s, Success: ${result.success}`);

      // Extract files from output
      const files = extractFilesFromOutput(result.output);
      console.error(`  Extracted ${files.size} files`);

      // Write extracted files
      for (const [filename, content] of files) {
        const filePath = join(runDir, filename);
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, content);
        console.error(`    - ${filename} (${content.length} chars)`);
      }

      // Write raw transcript
      const transcriptPath = join(runDir, '..', 'transcript.txt');
      writeFileSync(transcriptPath, result.output);

      const runResult: RunResult = {
        evalId: evalPrompt.id,
        evalName: evalPrompt.name,
        runNumber: run,
        success: result.success && files.size > 0,
        outputDir: runDir,
        transcript: transcriptPath,
        durationMs: result.durationMs,
        error: result.error,
      };

      allResults.push(runResult);

      // Write individual run result
      writeJson(join(runDir, '..', 'run-result.json'), runResult);
    }
  }

  // Write combined results
  const summary = {
    skillName,
    iteration: iterationNum,
    timestamp: new Date().toISOString(),
    totalRuns: allResults.length,
    successfulRuns: allResults.filter(r => r.success).length,
    results: allResults,
  };

  writeJson(join(iterDir, 'run-results.json'), summary);
  console.log(JSON.stringify(summary, null, 2));

  console.error(`\nCompleted: ${summary.successfulRuns}/${summary.totalRuns} successful runs`);
}

main().catch(error => {
  console.error('Failed to run evals:', error);
  process.exit(2);
});
