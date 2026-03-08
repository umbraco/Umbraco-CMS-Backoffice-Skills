#!/usr/bin/env npx tsx

/**
 * Phase 1: PREP - Generate eval prompts + assertions for a skill.
 *
 * Parses SKILL.md, fetches doc URLs, diffs skill examples against docs,
 * and generates 3 eval prompts (basic/intermediate/advanced) with assertions.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import {
  parseSkillMd,
  extractDocUrls,
  extractPatternsFromDoc,
  comparePatterns,
  fetchDoc,
  ensureDir,
  writeJson,
  getResultsDir,
  skillNameFromPath,
  parseArgs,
  type ParsedSkill,
  type DocPatterns,
  type PatternDrift,
} from './utils.js';

// --- Types ---

interface EvalAssertion {
  type: 'structural' | 'pattern' | 'doc-accuracy' | 'playwright';
  description: string;
  check: string; // Machine-readable check identifier
}

interface EvalPrompt {
  id: number;
  name: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  prompt: string;
  expectedOutput: string;
  assertions: EvalAssertion[];
}

interface EvalSet {
  skillName: string;
  skillPath: string;
  timestamp: string;
  docUrls: string[];
  patternDrifts: PatternDrift[];
  evals: EvalPrompt[];
}

// --- Extension Type Detection ---

function detectExtensionType(skill: ParsedSkill): string {
  const content = skill.content.toLowerCase();
  const name = skill.frontmatter.name;

  // Match against known extension type names in skill name
  const typeMap: Record<string, string> = {
    'dashboard': 'dashboard',
    'tree': 'tree',
    'property-editor-ui': 'propertyEditorUi',
    'property-editor': 'propertyEditorUi',
    'workspace': 'workspace',
    'section': 'section',
    'header-app': 'headerApp',
    'menu': 'menu',
    'menu-item': 'menuItem',
    'collection': 'collection',
    'entity-action': 'entityAction',
    'entry-point': 'entryPoint',
    'modal': 'modal',
    'condition': 'condition',
  };

  for (const [key, value] of Object.entries(typeMap)) {
    if (name.includes(key)) return value;
  }

  // Fallback: check code blocks for type declarations
  for (const block of skill.codeBlocks) {
    const typeMatch = block.code.match(/type:\s*['"](\w+)['"]/);
    if (typeMatch) return typeMatch[1];
  }

  return 'dashboard'; // Default
}

// --- Eval Prompt Generation ---

function generateEvalPrompts(
  skill: ParsedSkill,
  extensionType: string,
  docPatterns: DocPatterns,
  drifts: PatternDrift[]
): EvalPrompt[] {
  const skillName = skill.frontmatter.name;
  const friendlyType = extensionType
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase();

  // Common structural assertions for all extension types
  const structuralAssertions: EvalAssertion[] = [
    {
      type: 'structural',
      description: 'Generated code includes a manifest (umbraco-package.json or inline)',
      check: 'has-manifest',
    },
    {
      type: 'structural',
      description: `Manifest has type: "${extensionType}"`,
      check: `manifest-type-${extensionType}`,
    },
    {
      type: 'structural',
      description: 'Manifest has alias field',
      check: 'manifest-has-alias',
    },
    {
      type: 'structural',
      description: 'Manifest has name field',
      check: 'manifest-has-name',
    },
  ];

  // Pattern assertions based on doc patterns
  const patternAssertions: EvalAssertion[] = [];

  if (docPatterns.baseClasses.length > 0) {
    patternAssertions.push({
      type: 'pattern',
      description: `Uses documented base class: ${docPatterns.baseClasses.join(' or ')}`,
      check: 'correct-base-class',
    });
  }

  if (docPatterns.imports.length > 0) {
    patternAssertions.push({
      type: 'pattern',
      description: 'Import paths match current documentation',
      check: 'correct-imports',
    });
  }

  if (docPatterns.registrationPatterns.length > 0) {
    patternAssertions.push({
      type: 'pattern',
      description: `Uses documented registration: ${docPatterns.registrationPatterns.join(' or ')}`,
      check: 'correct-registration',
    });
  }

  // Doc-accuracy assertions based on detected drift
  const docAssertions: EvalAssertion[] = drifts
    .filter(d => d.severity === 'warning' || d.severity === 'error')
    .map(d => ({
      type: 'doc-accuracy' as const,
      description: `Avoids drift: ${d.message}`,
      check: `no-drift-${d.category}`,
    }));

  // Playwright assertions
  const playwrightAssertions: EvalAssertion[] = [
    {
      type: 'playwright',
      description: 'Extension compiles without errors',
      check: 'compiles',
    },
    {
      type: 'playwright',
      description: 'Extension renders in mocked backoffice',
      check: 'renders',
    },
    {
      type: 'playwright',
      description: 'No console errors during render',
      check: 'no-console-errors',
    },
  ];

  const allAssertions = [
    ...structuralAssertions,
    ...patternAssertions,
    ...docAssertions,
    ...playwrightAssertions,
  ];

  // Generate 3 difficulty levels
  return [
    {
      id: 1,
      name: `Basic ${friendlyType}`,
      difficulty: 'basic',
      prompt: `Create a simple Umbraco ${friendlyType} extension. It should display a heading and some basic content. Use the ${skillName} skill for implementation guidance. Generate all necessary files including the manifest and element implementation.`,
      expectedOutput: `A working ${friendlyType} with manifest and element implementation following current Umbraco docs`,
      assertions: [
        ...structuralAssertions,
        ...patternAssertions.slice(0, 2),
        playwrightAssertions[0],
      ],
    },
    {
      id: 2,
      name: `Intermediate ${friendlyType}`,
      difficulty: 'intermediate',
      prompt: `Create an Umbraco ${friendlyType} extension that fetches and displays data. It should use Umbraco's Context API to consume a context, display a loading state, and render the data in a UUI box. Use the ${skillName} skill. Generate all necessary files.`,
      expectedOutput: `A ${friendlyType} with context consumption, loading state, and data display following current patterns`,
      assertions: [
        ...structuralAssertions,
        ...patternAssertions,
        ...docAssertions.slice(0, 2),
        playwrightAssertions[0],
        playwrightAssertions[1],
      ],
    },
    {
      id: 3,
      name: `Advanced ${friendlyType}`,
      difficulty: 'advanced',
      prompt: `Create a production-ready Umbraco ${friendlyType} extension with: context API integration, localization support, proper error handling, and conditions for section visibility. Use the ${skillName} skill. Generate all files including manifest, element, and any supporting files. Follow current Umbraco documentation patterns exactly.`,
      expectedOutput: `A complete, production-ready ${friendlyType} with context, localization, error handling, and conditions`,
      assertions: allAssertions,
    },
  ];
}

// --- Main ---

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const skillPath = args['skill-path'];

  if (!skillPath) {
    console.error('Usage: npx tsx generate-eval-set.ts --skill-path <path>');
    process.exit(1);
  }

  console.error(`Generating eval set for: ${skillPath}`);

  // Parse skill
  const skill = parseSkillMd(skillPath);
  const skillName = skillNameFromPath(skillPath);
  console.error(`Skill: ${skillName} (${skill.docUrls.length} doc URLs, ${skill.codeBlocks.length} code blocks)`);

  // Detect extension type
  const extensionType = detectExtensionType(skill);
  console.error(`Extension type: ${extensionType}`);

  // Fetch docs and snapshot
  const resultsDir = getResultsDir(skillName);
  const docSnapshotDir = join(resultsDir, 'doc-snapshots');
  ensureDir(docSnapshotDir);

  console.error('Fetching documentation...');
  const docTexts: string[] = [];
  for (const url of skill.docUrls) {
    console.error(`  Fetching: ${url}`);
    const text = await fetchDoc(url);
    const filename = url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 100) + '.txt';
    writeFileSync(join(docSnapshotDir, filename), text);
    docTexts.push(text);
  }

  const combinedDocText = docTexts.join('\n\n');

  // Extract patterns from docs
  const docPatterns = extractPatternsFromDoc(combinedDocText);
  console.error(`Doc patterns: ${docPatterns.baseClasses.length} base classes, ${docPatterns.imports.length} imports`);

  // Extract patterns from skill
  const skillText = skill.codeBlocks.map(b => b.code).join('\n\n');
  const skillPatterns = extractPatternsFromDoc(skillText);

  // Compare patterns
  const drifts = comparePatterns(skillPatterns, docPatterns);
  if (drifts.length > 0) {
    console.error(`Pattern drifts detected: ${drifts.length}`);
    for (const d of drifts) {
      console.error(`  [${d.severity}] ${d.message}`);
    }
  }

  // Generate eval prompts
  const evals = generateEvalPrompts(skill, extensionType, docPatterns, drifts);

  // Build eval set
  const evalSet: EvalSet = {
    skillName,
    skillPath,
    timestamp: new Date().toISOString(),
    docUrls: skill.docUrls,
    patternDrifts: drifts,
    evals,
  };

  // Write eval set
  const evalSetPath = join(resultsDir, 'eval-set.json');
  writeJson(evalSetPath, evalSet);

  // Output to stdout
  console.log(JSON.stringify(evalSet, null, 2));

  console.error(`\nEval set saved to: ${evalSetPath}`);
  console.error(`Generated ${evals.length} eval prompts with ${evals.reduce((s, e) => s + e.assertions.length, 0)} total assertions`);
}

main().catch(error => {
  console.error('Failed to generate eval set:', error);
  process.exit(2);
});
