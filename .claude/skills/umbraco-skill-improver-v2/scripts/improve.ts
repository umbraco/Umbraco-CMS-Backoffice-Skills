#!/usr/bin/env npx tsx

/**
 * Skill Improver v2 - Single-file improvement loop.
 *
 * Differences from v1:
 * - 13 pass/fail boolean checks instead of 5 weighted float dimensions
 * - 1 eval prompt, 1 run per iteration (not 3 prompts, 2 runs)
 * - Flat iteration-N/ output (not nested eval-N/run-N/)
 * - Everything inline - no subprocess scripts
 */

import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, unlinkSync } from 'fs';
import { join, resolve, dirname } from 'path';
import {
  parseSkillMd,
  fetchDoc,
  extractPatternsFromDoc,
  comparePatterns,
  runClaudeP,
  ensureDir,
  writeJson,
  readJson,
  generateDiff,
  getResultsDir,
  skillNameFromPath,
  parseArgs,
  PROJECT_ROOT,
  type ParsedSkill,
  type DocPatterns,
  type PatternDrift,
} from './utils.js';

// ============================================================
// Known patterns (from v1 validate.ts)
// ============================================================

const KNOWN_BACKOFFICE_MODULES = new Set([
  'action', 'audit-log', 'auth', 'block', 'block-custom-view', 'block-grid',
  'block-list', 'block-rte', 'block-type', 'class-api', 'code-editor',
  'collection', 'components', 'content', 'content-type', 'context-api',
  'controller-api', 'culture', 'current-user', 'data-type', 'dictionary',
  'document', 'document-blueprint', 'document-type', 'element', 'element-api',
  'entity', 'entity-action', 'entity-bulk-action', 'entity-create-option-action',
  'event', 'extension-api', 'extension-registry', 'external/lit',
  'external/monaco-editor', 'external/router-slot', 'external/uui',
  'header-app', 'health-check', 'help', 'icon', 'id', 'imaging', 'language',
  'lit-element', 'localization', 'localization-api', 'log-viewer', 'media',
  'media-type', 'member', 'member-group', 'member-type', 'menu', 'modal',
  'models', 'notification', 'observable-api', 'package', 'packages',
  'partial-view', 'picker', 'picker-input', 'picker-data-source', 'property',
  'property-action', 'property-editor', 'property-type', 'recycle-bin',
  'relation-type', 'repository', 'resources', 'router', 'rte', 'script',
  'search', 'section', 'server-file-system', 'sorter', 'static-file', 'store',
  'style', 'stylesheet', 'tag', 'template', 'temporary-file', 'tiptap', 'tree',
  'ufm', 'user', 'user-group', 'user-permission', 'utils', 'validation',
  'variant', 'webhook', 'workspace',
]);

const KNOWN_EXTENSION_TYPES = new Set([
  'appEntryPoint', 'authProvider', 'backofficeEntryPoint', 'blockEditorCustomView',
  'bundle', 'collection', 'collectionAction', 'collectionView', 'condition',
  'currentUserAction', 'dashboard', 'dashboardCollection', 'dialog',
  'dynamicRootOrigin', 'dynamicRootQueryStep', 'entityAction', 'entityBulkAction',
  'entityCreateOptionAction', 'entityUserPermission', 'entryPoint',
  'externalLoginProvider', 'fileUploadPreview', 'globalContext',
  'granularUserPermission', 'headerApp', 'healthCheck', 'icons', 'itemStore',
  'kind', 'localization', 'manifestPicker', 'mfaLoginProvider', 'modal',
  'monacoMarkdownEditorAction', 'menu', 'menuItem', 'packageView',
  'pickerSearchResultItem', 'previewApp', 'propertyAction',
  'propertyEditorDataSource', 'propertyEditorSchema', 'propertyEditorUi',
  'propertyValuePreset', 'repository', 'searchProvider', 'searchResultItem',
  'section', 'sectionRoute', 'sectionSidebarApp', 'sectionView', 'sidebar',
  'store', 'theme', 'tinyMcePlugin', 'tiptapExtension', 'tiptapToolbarExtension',
  'tiptapStatusbarExtension', 'tree', 'treeItem', 'treeStore', 'ufmComponent',
  'userGranularPermission', 'userProfileApp', 'workspace', 'workspaceAction',
  'workspaceActionMenuItem', 'workspaceContext', 'workspaceFooterApp',
  'workspaceView',
]);

const DEPRECATED_PATTERNS = [
  { pattern: /ManifestDashboard(?!Collection)/g, name: 'ManifestDashboard type' },
  { pattern: /from ['"]@umbraco-cms\/backoffice\/lit['"]/g, name: 'import from /lit (use /lit-element)' },
  { pattern: /UmbElementMixin/g, name: 'UmbElementMixin (use UmbLitElement)' },
  { pattern: /customElements\.define\s*\(/g, name: 'customElements.define (use @customElement decorator)' },
];

// ============================================================
// Types
// ============================================================

interface CheckResult {
  id: string;
  passed: boolean;
  detail?: string;
}

interface IterationResult {
  iteration: number;
  checks: CheckResult[];
  passed: number;
  total: number;
  score: number;
  files: Map<string, string>;
  skillLineCount: number;
}

interface LoopSummary {
  version: 'v2';
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
  iterations: Array<{
    iteration: number;
    score: number;
    passed: number;
    total: number;
    skillLineCount: number;
    checks: CheckResult[];
  }>;
}

// ============================================================
// File extraction from claude -p output
// ============================================================

function extractFilesFromOutput(output: string): Map<string, string> {
  let text = output;
  try {
    const parsed = JSON.parse(output);
    text = parsed.result || parsed.content || output;
  } catch {}

  const files = new Map<string, string>();

  // Pattern 1: ### filename.ext followed by code block
  const fileBlockPattern = /(?:#{1,4}\s+|[\*_]{2})`?([\w\-./]+\.(?:ts|js|json|html|css))`?[\*_]{0,2}\s*\n```(?:\w+)?\n([\s\S]*?)```/g;
  let match;
  while ((match = fileBlockPattern.exec(text)) !== null) {
    const filename = match[1].trim();
    if (filename && !files.has(filename)) files.set(filename, match[2].trim());
  }

  // Pattern 2: ```typescript // filename.ext
  const namedBlockPattern = /```(\w+)\s+(?:\/\/\s*)?([\w\-./]+\.(?:ts|js|json|html|css))\n([\s\S]*?)```/g;
  while ((match = namedBlockPattern.exec(text)) !== null) {
    const filename = match[2].trim();
    if (!files.has(filename) && !filename.startsWith('#')) files.set(filename, match[3].trim());
  }

  // Pattern 3: Infer from content
  if (files.size === 0) {
    const codeBlockPattern = /```(\w+)?\n([\s\S]*?)```/g;
    while ((match = codeBlockPattern.exec(text)) !== null) {
      const lang = match[1] || 'txt';
      const code = match[2].trim();
      if (code.includes('"type"') && code.includes('"alias"')) {
        files.set('umbraco-package.json', code);
      } else if (lang === 'typescript' || lang === 'ts') {
        if (!files.has('element.ts')) files.set('element.ts', code);
      } else if (lang === 'javascript' || lang === 'js') {
        if (!files.has('element.js')) files.set('element.js', code);
      }
    }
  }

  return files;
}

// ============================================================
// 13 Pass/Fail Checks
// ============================================================

function runChecks(
  files: Map<string, string>,
  docPatterns: DocPatterns | null,
  docDrifts: PatternDrift[]
): CheckResult[] {
  const checks: CheckResult[] = [];

  // 1. files-extracted - got at least 1 file
  checks.push({
    id: 'files-extracted',
    passed: files.size >= 1,
    detail: `${files.size} files extracted`,
  });

  // Find manifest and element files
  const manifestEntry = [...files.entries()].find(([f]) =>
    f.includes('package.json') || f.includes('manifest')
  );
  const elementEntry = [...files.entries()].find(([f]) =>
    (f.endsWith('.ts') || f.endsWith('.js')) && !f.includes('package.json') && !f.includes('manifest')
  );

  const manifestContent = manifestEntry?.[1] || '';
  const elementContent = elementEntry?.[1] || '';

  // 2. has-manifest
  checks.push({
    id: 'has-manifest',
    passed: !!manifestEntry,
    detail: manifestEntry ? manifestEntry[0] : 'no manifest found',
  });

  // 3. has-element
  checks.push({
    id: 'has-element',
    passed: !!elementEntry,
    detail: elementEntry ? elementEntry[0] : 'no element file found',
  });

  // 4. manifest-has-type
  checks.push({
    id: 'manifest-has-type',
    passed: /"type"\s*:/.test(manifestContent),
  });

  // 5. manifest-has-alias
  checks.push({
    id: 'manifest-has-alias',
    passed: /"alias"\s*:/.test(manifestContent),
  });

  // 6. manifest-has-name
  checks.push({
    id: 'manifest-has-name',
    passed: /"name"\s*:/.test(manifestContent),
  });

  // 7. manifest-has-element
  checks.push({
    id: 'manifest-has-element',
    passed: /"element"\s*:|"js"\s*:/.test(manifestContent),
  });

  // 8. element-has-class
  checks.push({
    id: 'element-has-class',
    passed: /class\s+\w+\s+extends\s/.test(elementContent),
  });

  // 9. element-has-render
  checks.push({
    id: 'element-has-render',
    passed: /render\s*\(/.test(elementContent),
  });

  // 10. valid-imports - no unknown @umbraco-cms/backoffice/* imports
  const allCode = [...files.values()].filter((_, i) => {
    const name = [...files.keys()][i];
    return name.endsWith('.ts') || name.endsWith('.js');
  }).join('\n');

  const importPattern = /@umbraco-cms\/backoffice\/([\w\-/]+)/g;
  let importMatch;
  const badImports: string[] = [];
  while ((importMatch = importPattern.exec(allCode)) !== null) {
    const modulePath = importMatch[1];
    const basePath = modulePath.split('/')[0];
    if (!KNOWN_BACKOFFICE_MODULES.has(modulePath) && !KNOWN_BACKOFFICE_MODULES.has(basePath)) {
      badImports.push(modulePath);
    }
  }
  checks.push({
    id: 'valid-imports',
    passed: badImports.length === 0,
    detail: badImports.length > 0 ? `bad: ${badImports.join(', ')}` : undefined,
  });

  // 11. valid-extension-type - no unknown extension type strings
  const typePattern = /type:\s*['"]([^'"]+)['"]/g;
  let typeMatch;
  const badTypes: string[] = [];
  // Check all files that look like manifests
  for (const [filename, content] of files) {
    if (!/\b(alias|element|js|kind|meta)\s*:/i.test(content)) continue;
    while ((typeMatch = typePattern.exec(content)) !== null) {
      if (!KNOWN_EXTENSION_TYPES.has(typeMatch[1])) {
        badTypes.push(typeMatch[1]);
      }
    }
  }
  checks.push({
    id: 'valid-extension-type',
    passed: badTypes.length === 0,
    detail: badTypes.length > 0 ? `unknown: ${badTypes.join(', ')}` : undefined,
  });

  // 12. no-deprecated - no deprecated patterns
  const deprecatedFound: string[] = [];
  for (const { pattern, name } of DEPRECATED_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(allCode)) {
      deprecatedFound.push(name);
    }
  }
  checks.push({
    id: 'no-deprecated',
    passed: deprecatedFound.length === 0,
    detail: deprecatedFound.length > 0 ? deprecatedFound.join(', ') : undefined,
  });

  // 13. docs-aligned - no warning/error pattern drifts vs fetched docs
  const significantDrifts = docDrifts.filter(d => d.severity === 'error' || d.severity === 'warning');
  checks.push({
    id: 'docs-aligned',
    passed: significantDrifts.length === 0,
    detail: significantDrifts.length > 0
      ? significantDrifts.map(d => d.message).join('; ')
      : undefined,
  });

  return checks;
}

// ============================================================
// Eval prompt generation (single prompt, not 3)
// ============================================================

function buildEvalPrompt(skill: ParsedSkill): string {
  return `You are an Umbraco backoffice extension developer. Follow the skill instructions below exactly when generating code.

IMPORTANT: Do NOT use any tools. Do NOT search for files or read documentation. Just output the code directly as text in your response. All the information you need is provided below.

## Skill: ${skill.frontmatter.name}

${skill.content}

## Task

Create an Umbraco extension following the skill above. It should:
1. Have a proper manifest (umbraco-package.json) with type, alias, name, and element fields
2. Have an element implementation using the correct base class and registration pattern
3. Use a Context API consumer to fetch and display data with a loading state
4. Render content in a UUI box component

## Output Format

Output the code directly in your response. For each file, use a markdown heading with the filename followed by a fenced code block:

### umbraco-package.json
\`\`\`json
{ ... }
\`\`\`

### my-element.ts
\`\`\`typescript
// code here
\`\`\`

Generate all necessary files. You MUST include both the manifest (umbraco-package.json) and the element implementation (.ts file).`;
}

// ============================================================
// SKILL.md improvement prompt
// ============================================================

function buildImprovementPrompt(
  currentSkillMd: string,
  checks: CheckResult[],
  docDrifts: PatternDrift[],
  docSnapshots: string
): string {
  const failedChecks = checks.filter(c => !c.passed);
  const passedChecks = checks.filter(c => c.passed);

  const checksSummary = checks
    .map(c => `- [${c.passed ? 'PASS' : 'FAIL'}] ${c.id}${c.detail ? ` (${c.detail})` : ''}`)
    .join('\n');

  const driftSummary = docDrifts.length > 0
    ? docDrifts.map(d => `- [${d.category}] Skill: ${d.skillPattern} -> Docs: ${d.docPattern}`).join('\n')
    : 'No drift detected';

  return `You are a skill improver for Umbraco backoffice skills. Your job is to rewrite a SKILL.md file to improve the quality of code that Claude generates when using this skill.

## Current SKILL.md

\`\`\`markdown
${currentSkillMd}
\`\`\`

## Check Results (${passedChecks.length}/${checks.length} passed)

${checksSummary}

## Documentation Drift
${driftSummary}

## Current Documentation (Fetched)
${docSnapshots.slice(0, 8000)}

## Rules

1. **DO NOT change the frontmatter** (name, description, version, location, allowed-tools)
2. **Fix code examples** to match current documentation patterns exactly
3. **Remove dead-weight instructions** that don't improve output quality
4. **Keep the skill compact** (target 50-150 lines of content)
5. **Ensure all import paths are correct** for @umbraco-cms/backoffice/*
6. **Use the patterns shown in the current docs**, not outdated patterns
7. **Include a working manifest example** with correct fields (type, alias, name, element)
8. **Include a working element implementation** with correct base class and @customElement registration
9. **Focus on fixing FAILED checks**: ${failedChecks.map(c => c.id).join(', ') || 'none'}

## Output

CRITICAL: Return ONLY the improved SKILL.md content (including frontmatter). Start your response with \`---\` (the frontmatter delimiter). Do NOT write any files. Do NOT use any tools. Do NOT wrap in a code block. Just output the raw markdown content starting with the frontmatter.`;
}

// ============================================================
// Extract SKILL.md from claude -p output
// ============================================================

function extractSkillMd(output: string): string | null {
  let text = output;
  try {
    const parsed = JSON.parse(output);
    text = parsed.result || parsed.content || output;
  } catch {}

  if (text.trim().startsWith('---')) return text.trim();

  const match = text.match(/```(?:markdown|md)?\n(---[\s\S]*?)```/);
  if (match) return match[1].trim();

  const fmMatch = text.match(/(---\n[\s\S]*?\n---[\s\S]*)/);
  if (fmMatch) return fmMatch[1].trim();

  return null;
}

// ============================================================
// Main loop
// ============================================================

async function main() {
  const rawArgs = parseArgs(process.argv.slice(2));

  const skillPath = resolve(rawArgs['skill-path'] || '');
  const maxIterations = parseInt(rawArgs['max-iterations'] || '4');
  const model = rawArgs['model'];
  const targetScore = parseFloat(rawArgs['target-score'] || '1.0');
  const timeout = parseInt(rawArgs['timeout'] || '180000');
  const verbose = rawArgs['verbose'] === 'true';

  if (!rawArgs['skill-path']) {
    console.error(`Usage: npx tsx improve.ts --skill-path <path> [options]

Options:
  --max-iterations <n>   Max loop iterations (default: 4)
  --model <model>        Claude model to use
  --target-score <f>     Target score (default: 1.0 = all 13 checks pass)
  --timeout <ms>         Timeout per claude -p call (default: 180000)
  --verbose              Show detailed output`);
    process.exit(1);
  }

  const skillName = skillNameFromPath(skillPath);
  const resultsDir = join(getResultsDir(skillName), 'v2');
  ensureDir(resultsDir);

  const startTime = Date.now();

  console.error(`\n=== Skill Improver v2 ===`);
  console.error(`Skill: ${skillName}`);
  console.error(`Path: ${skillPath}`);
  console.error(`Results: ${resultsDir}`);
  console.error(`Max iterations: ${maxIterations}`);
  console.error(`Scoring: 13 pass/fail checks`);
  console.error('');

  // --- Fetch docs once ---
  console.error('Fetching documentation...');
  const skill = parseSkillMd(skillPath);
  const docSnapshotDir = join(resultsDir, 'doc-snapshots');
  ensureDir(docSnapshotDir);

  const docTexts: string[] = [];
  for (const url of skill.docUrls) {
    console.error(`  Fetching: ${url}`);
    const text = await fetchDoc(url);
    const filename = url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 100) + '.txt';
    writeFileSync(join(docSnapshotDir, filename), text);
    docTexts.push(text);
  }

  const combinedDocText = docTexts.join('\n\n');
  const docPatterns = extractPatternsFromDoc(combinedDocText);
  console.error(`Doc patterns: ${docPatterns.baseClasses.length} base classes, ${docPatterns.imports.length} imports`);
  console.error('');

  // --- Save original, start loop ---
  const originalSkillMd = readFileSync(join(skillPath, 'SKILL.md'), 'utf-8');
  let currentSkillMd = originalSkillMd;

  const iterations: LoopSummary['iterations'] = [];
  let bestIteration = 0;
  let bestScore = 0;
  let convergenceReason = 'max-iterations';

  for (let iter = 0; iter < maxIterations; iter++) {
    const iterDir = join(resultsDir, `iteration-${iter}`);
    ensureDir(iterDir);

    console.error(`--- Iteration ${iter} ---`);

    // Snapshot current SKILL.md
    writeFileSync(join(iterDir, 'SKILL.md.snapshot'), currentSkillMd);

    // Write current SKILL.md to skill path for eval
    if (iter > 0) {
      writeFileSync(join(skillPath, 'SKILL.md'), currentSkillMd);
    }

    // --- Generate code via claude -p ---
    console.error('  Generating code...');
    const currentSkill = parseSkillMd(skillPath);
    const evalPrompt = buildEvalPrompt(currentSkill);

    const genResult = runClaudeP(evalPrompt, {
      model,
      timeout,
      cwd: PROJECT_ROOT,
    });

    // Extract files
    const files = extractFilesFromOutput(genResult.stdout);
    console.error(`  Extracted ${files.size} files`);

    // Write files to iteration dir
    const outputDir = join(iterDir, 'outputs');
    ensureDir(outputDir);
    for (const [filename, content] of files) {
      const filePath = join(outputDir, filename);
      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, content);
      if (verbose) console.error(`    - ${filename} (${content.length} chars)`);
    }

    // Save transcript
    writeFileSync(join(iterDir, 'transcript.txt'), genResult.stdout);

    // --- Run doc comparison on generated code ---
    const codeText = [...files.values()].join('\n\n');
    const codePatterns = extractPatternsFromDoc(codeText);
    const docDrifts = comparePatterns(codePatterns, docPatterns);

    // --- Run 13 checks ---
    const checks = runChecks(files, docPatterns, docDrifts);
    const passed = checks.filter(c => c.passed).length;
    const total = checks.length;
    const score = total > 0 ? passed / total : 0;

    const iterResult = {
      iteration: iter,
      checks,
      passed,
      total,
      score,
      skillLineCount: currentSkillMd.split('\n').length,
    };
    iterations.push(iterResult);

    // Write iteration results
    writeJson(join(iterDir, 'checks.json'), { checks, passed, total, score });

    console.error(`  Score: ${passed}/${total} (${(score * 100).toFixed(1)}%)`);
    for (const c of checks) {
      if (!c.passed) {
        console.error(`    FAIL: ${c.id}${c.detail ? ` - ${c.detail}` : ''}`);
      }
    }

    // Track best
    if (score > bestScore) {
      bestScore = score;
      bestIteration = iter;
    }

    // Check convergence
    if (score >= targetScore) {
      convergenceReason = 'target-reached';
      console.error(`\nConverged: all checks passing`);
      break;
    }

    // --- Improve SKILL.md (if not last iteration) ---
    if (iter < maxIterations - 1) {
      console.error('  Improving SKILL.md...');

      const docSnapshots = docTexts.map(t => t.slice(0, 3000)).join('\n\n');
      const improvePrompt = buildImprovementPrompt(
        currentSkillMd,
        checks,
        docDrifts,
        docSnapshots
      );

      const improveResult = runClaudeP(improvePrompt, {
        model,
        timeout: 180000,
        noTools: true,
      });

      const newSkillMd = extractSkillMd(improveResult.stdout);
      if (newSkillMd && newSkillMd.trim().startsWith('---')) {
        const diff = generateDiff(currentSkillMd, newSkillMd);
        writeFileSync(join(iterDir, 'SKILL.md.improved'), newSkillMd);
        writeFileSync(join(iterDir, 'SKILL.md.diff'), diff);
        currentSkillMd = newSkillMd;
        console.error(`  Improved: ${newSkillMd.split('\n').length} lines`);
      } else {
        console.error('  Warning: Could not extract improved SKILL.md, continuing with current');
      }
    }

    console.error('');
  }

  // --- Restore original SKILL.md ---
  writeFileSync(join(skillPath, 'SKILL.md'), originalSkillMd);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // --- Summary ---
  console.error(`\n=== Results ===`);
  console.error(`Best iteration: ${bestIteration} (score: ${bestScore.toFixed(3)})`);
  console.error(`Baseline score: ${iterations[0]?.score?.toFixed(3) || 'N/A'}`);
  console.error(`Improvement: ${((bestScore - (iterations[0]?.score || 0)) * 100).toFixed(1)}%`);
  console.error(`Convergence: ${convergenceReason}`);
  console.error(`Wall clock: ${elapsed}s`);

  const summary: LoopSummary = {
    version: 'v2',
    skillName,
    skillPath,
    timestamp: new Date().toISOString(),
    totalIterations: iterations.length,
    bestIteration,
    bestScore,
    baselineScore: iterations[0]?.score || 0,
    improvement: bestScore - (iterations[0]?.score || 0),
    converged: convergenceReason !== 'max-iterations',
    convergenceReason,
    iterations,
  };

  writeJson(join(resultsDir, 'summary.json'), summary);

  // Build benchmark.json compatible with v1 viewer
  const benchmark = {
    metadata: {
      skill_name: skillName,
      skill_path: skillPath,
      executor_model: model || 'default',
      timestamp: new Date().toISOString(),
      version: 'v2',
      scoring: '13 pass/fail boolean checks',
      wall_clock_seconds: parseFloat(elapsed),
    },
    runs: iterations.map((iter, i) => ({
      eval_id: i + 1,
      eval_name: `Iteration ${iter.iteration}`,
      configuration: 'with_skill' as const,
      run_number: 1,
      result: {
        pass_rate: iter.score,
        passed: iter.passed,
        failed: iter.total - iter.passed,
        total: iter.total,
        time_seconds: 0,
        tokens: 0,
        tool_calls: 0,
        errors: 0,
      },
    })),
    run_summary: {
      with_skill: {
        pass_rate: {
          mean: bestScore,
          stddev: 0,
          min: Math.min(...iterations.map(i => i.score)),
          max: Math.max(...iterations.map(i => i.score)),
        },
      },
    },
    notes: [
      `v2: 13 pass/fail checks, 1 eval per iteration`,
      `Best iteration: ${bestIteration} (${bestScore.toFixed(3)})`,
      `Baseline: ${iterations[0]?.score?.toFixed(3)}`,
      `Convergence: ${convergenceReason}`,
      `Wall clock: ${elapsed}s`,
    ],
  };

  writeJson(join(resultsDir, 'benchmark.json'), benchmark);

  console.log(JSON.stringify(summary, null, 2));

  // Print location of best SKILL.md
  const bestSkillMd = join(resultsDir, `iteration-${bestIteration}`, 'SKILL.md.snapshot');
  if (existsSync(bestSkillMd)) {
    console.error(`\nBest SKILL.md: ${bestSkillMd}`);
    console.error(`To apply: cp "${bestSkillMd}" "${join(skillPath, 'SKILL.md')}"`);
  }
}

main().catch(error => {
  console.error('Improvement loop failed:', error);
  process.exit(2);
});
