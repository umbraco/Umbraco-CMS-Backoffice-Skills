#!/usr/bin/env npx tsx

/**
 * Phase 3: VALIDATE - Static analysis + Playwright validation.
 *
 * Three levels:
 * 1. Static analysis - invokes existing analyze-code.ts patterns
 * 2. Doc comparison - compares generated code against doc snapshots
 * 3. Playwright MSW - runs mocked backoffice tests (when available)
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';
import {
  extractPatternsFromDoc,
  comparePatterns,
  writeJson,
  readJson,
  parseArgs,
  PROJECT_ROOT,
  SCRIPT_DIR,
  type DocPatterns,
  type PatternDrift,
} from './utils.js';

// --- Types ---

interface ValidationIssue {
  level: 'static' | 'doc-comparison' | 'playwright';
  severity: 'error' | 'warning' | 'info';
  file: string;
  message: string;
  line?: number;
}

interface ValidationResult {
  runDir: string;
  timestamp: string;
  issues: ValidationIssue[];
  staticAnalysis: {
    passed: boolean;
    importIssues: number;
    typeIssues: number;
    deprecatedPatterns: number;
    compilationErrors: number;
  };
  docComparison: {
    passed: boolean;
    drifts: PatternDrift[];
  };
  playwright: {
    ran: boolean;
    passed: boolean;
    testsPassed: number;
    testsFailed: number;
    error?: string;
  };
  overallPassed: boolean;
}

// --- Known Patterns (from analyze-code.ts) ---

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

// --- Static Analysis ---

function analyzeImports(code: string, filename: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const importPattern = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"](@umbraco-cms\/backoffice\/[^'"]+)['"]/g;

  const lines = code.split('\n');
  lines.forEach((line, index) => {
    importPattern.lastIndex = 0;
    let match;
    while ((match = importPattern.exec(line)) !== null) {
      const importPath = match[1];
      const modulePath = importPath.replace('@umbraco-cms/backoffice/', '');
      const basePath = modulePath.split('/')[0];
      if (!KNOWN_BACKOFFICE_MODULES.has(modulePath) && !KNOWN_BACKOFFICE_MODULES.has(basePath)) {
        issues.push({
          level: 'static',
          severity: 'warning',
          file: filename,
          message: `Unknown import path: ${importPath}`,
          line: index + 1,
        });
      }
    }
  });

  return issues;
}

function analyzeExtensionTypes(code: string, filename: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Only check manifest-like code
  const hasManifestIndicators = /\b(alias|element|js|kind|meta)\s*:/i.test(code);
  if (!hasManifestIndicators) return issues;

  const typePattern = /type:\s*['"]([^'"]+)['"]/g;
  const lines = code.split('\n');
  lines.forEach((line, index) => {
    typePattern.lastIndex = 0;
    let match;
    while ((match = typePattern.exec(line)) !== null) {
      if (!KNOWN_EXTENSION_TYPES.has(match[1])) {
        issues.push({
          level: 'static',
          severity: 'warning',
          file: filename,
          message: `Unknown extension type: '${match[1]}'`,
          line: index + 1,
        });
      }
    }
  });

  return issues;
}

function analyzeDeprecatedPatterns(code: string, filename: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const deprecated = [
    { pattern: /ManifestDashboard(?!Collection)/g, message: 'ManifestDashboard type changed, check current docs' },
    { pattern: /from ['"]@umbraco-cms\/backoffice\/lit['"]/g, message: 'Import from @umbraco-cms/backoffice/lit-element instead' },
  ];

  const lines = code.split('\n');
  lines.forEach((line, index) => {
    for (const { pattern, message } of deprecated) {
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        issues.push({
          level: 'static',
          severity: 'warning',
          file: filename,
          message,
          line: index + 1,
        });
      }
    }
  });

  return issues;
}

function runStaticAnalysis(outputDir: string): {
  issues: ValidationIssue[];
  stats: ValidationResult['staticAnalysis'];
} {
  const issues: ValidationIssue[] = [];
  const stats = { passed: true, importIssues: 0, typeIssues: 0, deprecatedPatterns: 0, compilationErrors: 0 };

  if (!existsSync(outputDir)) {
    return { issues, stats };
  }

  const files = readdirSync(outputDir).filter(f =>
    f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.json')
  );

  for (const file of files) {
    const code = readFileSync(join(outputDir, file), 'utf-8');

    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const importIssues = analyzeImports(code, file);
      stats.importIssues += importIssues.length;
      issues.push(...importIssues);

      const typeIssues = analyzeExtensionTypes(code, file);
      stats.typeIssues += typeIssues.length;
      issues.push(...typeIssues);

      const deprecatedIssues = analyzeDeprecatedPatterns(code, file);
      stats.deprecatedPatterns += deprecatedIssues.length;
      issues.push(...deprecatedIssues);
    }

    if (file.endsWith('.json')) {
      const typeIssues = analyzeExtensionTypes(code, file);
      stats.typeIssues += typeIssues.length;
      issues.push(...typeIssues);
    }
  }

  stats.passed = issues.filter(i => i.severity === 'error').length === 0;
  return { issues, stats };
}

// --- Doc Comparison ---

function runDocComparison(
  outputDir: string,
  docSnapshotDir: string
): { issues: ValidationIssue[]; drifts: PatternDrift[] } {
  const issues: ValidationIssue[] = [];
  let drifts: PatternDrift[] = [];

  if (!existsSync(outputDir) || !existsSync(docSnapshotDir)) {
    return { issues, drifts };
  }

  // Read all doc snapshots
  const docFiles = readdirSync(docSnapshotDir).filter(f => f.endsWith('.txt'));
  const combinedDocText = docFiles
    .map(f => readFileSync(join(docSnapshotDir, f), 'utf-8'))
    .join('\n\n');

  if (!combinedDocText) return { issues, drifts };

  const docPatterns = extractPatternsFromDoc(combinedDocText);

  // Read all generated code
  const codeFiles = readdirSync(outputDir).filter(f =>
    f.endsWith('.ts') || f.endsWith('.js')
  );
  const combinedCode = codeFiles
    .map(f => readFileSync(join(outputDir, f), 'utf-8'))
    .join('\n\n');

  if (!combinedCode) return { issues, drifts };

  const codePatterns = extractPatternsFromDoc(combinedCode);
  drifts = comparePatterns(codePatterns, docPatterns);

  for (const drift of drifts) {
    issues.push({
      level: 'doc-comparison',
      severity: drift.severity,
      file: 'generated-code',
      message: drift.message,
    });
  }

  return { issues, drifts };
}

// --- Playwright Validation ---

function runPlaywrightTests(
  outputDir: string,
  extensionType: string
): ValidationResult['playwright'] {
  const result = { ran: false, passed: false, testsPassed: 0, testsFailed: 0 };

  // Check if playwright test template exists for this extension type
  const templateDir = resolve(SCRIPT_DIR, '..', 'templates', 'playwright-tests');
  const templateFile = join(templateDir, `${extensionType}.spec.ts.tmpl`);

  if (!existsSync(templateFile)) {
    result.error = `No Playwright template for extension type: ${extensionType}`;
    return result;
  }

  // For now, Playwright tests are opt-in and require UMBRACO_CLIENT_PATH
  if (!process.env.UMBRACO_CLIENT_PATH) {
    result.error = 'UMBRACO_CLIENT_PATH not set - skipping Playwright tests';
    return result;
  }

  // TODO: Scaffold Vite project, install deps, run Playwright
  // This is the most complex part and will be implemented incrementally
  result.error = 'Playwright MSW tests not yet wired (static analysis only for now)';
  return result;
}

// --- Main ---

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const runDir = args['run-dir'];
  const docSnapshotDir = args['doc-snapshots'];
  const extensionType = args['extension-type'] || 'dashboard';

  if (!runDir) {
    console.error('Usage: npx tsx validate.ts --run-dir <path> [--doc-snapshots <path>] [--extension-type dashboard]');
    process.exit(1);
  }

  const outputDir = join(runDir, 'outputs');
  console.error(`Validating: ${outputDir}`);

  // Level 1: Static analysis
  const { issues: staticIssues, stats: staticStats } = runStaticAnalysis(outputDir);
  console.error(`Static analysis: ${staticIssues.length} issues (${staticStats.importIssues} imports, ${staticStats.typeIssues} types, ${staticStats.deprecatedPatterns} deprecated)`);

  // Level 2: Doc comparison
  let docIssues: ValidationIssue[] = [];
  let docDrifts: PatternDrift[] = [];
  if (docSnapshotDir && existsSync(docSnapshotDir)) {
    const docResult = runDocComparison(outputDir, docSnapshotDir);
    docIssues = docResult.issues;
    docDrifts = docResult.drifts;
    console.error(`Doc comparison: ${docDrifts.length} drifts`);
  }

  // Level 3: Playwright
  const playwrightResult = runPlaywrightTests(outputDir, extensionType);
  if (playwrightResult.error) {
    console.error(`Playwright: ${playwrightResult.error}`);
  }

  // Combine results
  const allIssues = [...staticIssues, ...docIssues];
  const result: ValidationResult = {
    runDir,
    timestamp: new Date().toISOString(),
    issues: allIssues,
    staticAnalysis: staticStats,
    docComparison: {
      passed: docDrifts.filter(d => d.severity === 'error').length === 0,
      drifts: docDrifts,
    },
    playwright: playwrightResult,
    overallPassed: staticStats.passed &&
      docDrifts.filter(d => d.severity === 'error').length === 0,
  };

  // Write results
  const resultPath = join(runDir, 'validation-result.json');
  writeJson(resultPath, result);

  // Output to stdout
  console.log(JSON.stringify(result, null, 2));

  console.error(`\nOverall: ${result.overallPassed ? 'PASSED' : 'FAILED'} (${allIssues.length} issues)`);
}

main().catch(error => {
  console.error('Validation failed:', error);
  process.exit(2);
});
