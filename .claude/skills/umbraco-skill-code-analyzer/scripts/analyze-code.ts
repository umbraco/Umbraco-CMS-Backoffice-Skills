#!/usr/bin/env npx tsx

import { readFileSync, existsSync, writeFileSync, mkdtempSync, rmSync } from 'fs';
import { glob } from 'glob';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

// Get project root (script is at .claude/skills/umbraco-skill-code-analyzer/scripts/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '../../../../');

// Types
interface CodeBlock {
  language: string;
  code: string;
  startLine: number;
  endLine: number;
}

interface CodeIssue {
  line: number;
  type: 'invalid-import' | 'unknown-extension-type' | 'typescript-error' | 'deprecated-pattern';
  value: string;
  message: string;
  severity: 'error' | 'warning';
}

interface SkillAnalysis {
  skillPath: string;
  skillName: string;
  codeBlocks: number;
  issues: CodeIssue[];
}

interface AnalysisReport {
  timestamp: string;
  skillsScanned: number;
  codeBlocksAnalyzed: number;
  issuesFound: number;
  skills: SkillAnalysis[];
  statistics: {
    totalCodeBlocks: number;
    typescriptBlocks: number;
    importIssues: number;
    extensionTypeIssues: number;
    compilationErrors: number;
    deprecatedPatterns: number;
  };
}

// Known @umbraco-cms/backoffice submodules (common ones)
const KNOWN_BACKOFFICE_MODULES = new Set([
  'action',
  'audit-log',
  'auth',
  'block',
  'block-custom-view',
  'block-grid',
  'block-list',
  'block-rte',
  'block-type',
  'class-api',
  'code-editor',
  'collection',
  'components',
  'content',
  'content-type',
  'context-api',
  'controller-api',
  'culture',
  'current-user',
  'data-type',
  'dictionary',
  'document',
  'document-blueprint',
  'document-type',
  'element',
  'element-api',
  'entity',
  'entity-action',
  'entity-bulk-action',
  'entity-create-option-action',
  'event',
  'extension-api',
  'extension-registry',
  'external/lit',
  'external/monaco-editor',
  'external/router-slot',
  'external/uui',
  'header-app',
  'health-check',
  'help',
  'icon',
  'id',
  'imaging',
  'language',
  'lit-element',
  'localization',
  'localization-api',
  'log-viewer',
  'media',
  'media-type',
  'member',
  'member-group',
  'member-type',
  'menu',
  'modal',
  'models',
  'notification',
  'observable-api',
  'package',
  'packages',
  'partial-view',
  'picker',
  'picker-input',
  'picker-data-source',
  'property',
  'property-action',
  'property-editor',
  'property-type',
  'recycle-bin',
  'relation-type',
  'repository',
  'resources',
  'router',
  'rte',
  'script',
  'search',
  'section',
  'server-file-system',
  'sorter',
  'static-file',
  'store',
  'style',
  'stylesheet',
  'tag',
  'template',
  'temporary-file',
  'tiptap',
  'tree',
  'ufm',
  'user',
  'user-group',
  'user-permission',
  'utils',
  'validation',
  'variant',
  'webhook',
  'workspace',
]);

// Known Umbraco extension types
const KNOWN_EXTENSION_TYPES = new Set([
  'appEntryPoint',
  'authProvider',
  'backofficeEntryPoint',
  'blockEditorCustomView',
  'bundle',
  'collection',
  'collectionAction',
  'collectionView',
  'condition',
  'currentUserAction',
  'dashboard',
  'dashboardCollection',
  'dialog',
  'dynamicRootOrigin',
  'dynamicRootQueryStep',
  'entityAction',
  'entityBulkAction',
  'entityCreateOptionAction',
  'entityUserPermission',
  'entryPoint',
  'externalLoginProvider',
  'fileUploadPreview',
  'globalContext',
  'granularUserPermission',
  'headerApp',
  'healthCheck',
  'icons',
  'itemStore',
  'kind',
  'localization',
  'manifestPicker',
  'mfaLoginProvider',
  'modal',
  'monacoMarkdownEditorAction',
  'menu',
  'menuItem',
  'packageView',
  'pickerSearchResultItem',
  'previewApp',
  'propertyAction',
  'propertyEditorDataSource',
  'propertyEditorSchema',
  'propertyEditorUi',
  'propertyValuePreset',
  'repository',
  'searchProvider',
  'searchResultItem',
  'section',
  'sectionRoute',
  'sectionSidebarApp',
  'sectionView',
  'sidebar',
  'store',
  'theme',
  'tinyMcePlugin',
  'tiptapExtension',
  'tiptapToolbarExtension',
  'tiptapStatusbarExtension',
  'tree',
  'treeItem',
  'treeStore',
  'ufmComponent',
  'userGranularPermission',
  'userProfileApp',
  'workspace',
  'workspaceAction',
  'workspaceActionMenuItem',
  'workspaceContext',
  'workspaceFooterApp',
  'workspaceView',
]);

// Deprecated patterns to flag
// Note: UmbElementMixin is NOT deprecated - both UmbElementMixin and UmbLitElement are valid
const DEPRECATED_PATTERNS = [
  { pattern: /ManifestDashboard(?!Collection)/g, message: 'ManifestDashboard type changed, check current docs' },
  { pattern: /from ['"]@umbraco-cms\/backoffice\/lit['"]/g, message: 'Import from @umbraco-cms/backoffice/lit-element instead' },
];

// Extract code blocks from markdown
function extractCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const lines = content.split('\n');

  let inCodeBlock = false;
  let currentBlock: Partial<CodeBlock> = {};
  let codeLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (line.startsWith('```') && !inCodeBlock) {
      // Start of code block
      inCodeBlock = true;
      const language = line.slice(3).trim().toLowerCase();
      currentBlock = {
        language: language || 'unknown',
        startLine: lineNum,
      };
      codeLines = [];
    } else if (line.startsWith('```') && inCodeBlock) {
      // End of code block
      inCodeBlock = false;
      currentBlock.endLine = lineNum;
      currentBlock.code = codeLines.join('\n');

      if (currentBlock.language && currentBlock.code) {
        blocks.push(currentBlock as CodeBlock);
      }
      currentBlock = {};
    } else if (inCodeBlock) {
      codeLines.push(line);
    }
  }

  return blocks;
}

// Check import paths
function analyzeImports(code: string, startLine: number): CodeIssue[] {
  const issues: CodeIssue[] = [];
  const importPattern = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"](@umbraco-cms\/backoffice\/[^'"]+)['"]/g;

  const lines = code.split('\n');
  lines.forEach((line, index) => {
    const lineNum = startLine + index;
    let match;

    // Reset regex for each line
    importPattern.lastIndex = 0;

    while ((match = importPattern.exec(line)) !== null) {
      const importPath = match[1];
      const modulePath = importPath.replace('@umbraco-cms/backoffice/', '');

      // Check if module is known
      if (!KNOWN_BACKOFFICE_MODULES.has(modulePath)) {
        // Check if it's a subpath of a known module
        const basePath = modulePath.split('/')[0];
        if (!KNOWN_BACKOFFICE_MODULES.has(basePath)) {
          issues.push({
            line: lineNum,
            type: 'invalid-import',
            value: importPath,
            message: `Unknown import path: ${importPath}`,
            severity: 'warning',
          });
        }
      }
    }
  });

  return issues;
}

// Check extension types in manifests
// Only flags `type:` when it appears in an Umbraco manifest context
// (code that contains manifest-like properties: alias, name, element, js, etc.)
function analyzeExtensionTypes(code: string, startLine: number): CodeIssue[] {
  const issues: CodeIssue[] = [];

  // First check if this code block looks like it contains Umbraco manifests
  // Manifests typically have: type + (alias OR name OR element OR js OR kind)
  const hasManifestIndicators = /\b(alias|element|js|kind|meta)\s*:/i.test(code);
  const hasManifestType = /\bManifest\w*\b/.test(code);
  const hasRegisterExtension = /registerExtension|registerMany|\.register\s*\(/.test(code);

  // Skip if this doesn't look like manifest code
  if (!hasManifestIndicators && !hasManifestType && !hasRegisterExtension) {
    return issues;
  }

  const typePattern = /type:\s*['"]([^'"]+)['"]/g;

  const lines = code.split('\n');
  lines.forEach((line, index) => {
    const lineNum = startLine + index;
    let match;

    typePattern.lastIndex = 0;

    while ((match = typePattern.exec(line)) !== null) {
      const extType = match[1];

      if (!KNOWN_EXTENSION_TYPES.has(extType)) {
        issues.push({
          line: lineNum,
          type: 'unknown-extension-type',
          value: extType,
          message: `Unknown extension type: '${extType}'`,
          severity: 'warning',
        });
      }
    }
  });

  return issues;
}

// Check for deprecated patterns
function analyzeDeprecatedPatterns(code: string, startLine: number): CodeIssue[] {
  const issues: CodeIssue[] = [];
  const lines = code.split('\n');

  lines.forEach((line, index) => {
    const lineNum = startLine + index;

    for (const { pattern, message } of DEPRECATED_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        issues.push({
          line: lineNum,
          type: 'deprecated-pattern',
          value: line.trim().slice(0, 50),
          message,
          severity: 'warning',
        });
      }
    }
  });

  return issues;
}

// TypeScript compilation check
function checkTypeScriptCompilation(
  codeBlocks: CodeBlock[],
  skillPath: string
): CodeIssue[] {
  const issues: CodeIssue[] = [];

  // Filter to TypeScript blocks only
  const tsBlocks = codeBlocks.filter(b =>
    b.language === 'typescript' || b.language === 'ts'
  );

  if (tsBlocks.length === 0) return issues;

  // Create temp directory
  let tempDir: string;
  try {
    tempDir = mkdtempSync(join(tmpdir(), 'skill-analyzer-'));
  } catch {
    console.error('Failed to create temp directory');
    return issues;
  }

  try {
    // Write tsconfig
    const tsconfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: false,  // Be lenient for examples
        skipLibCheck: true,
        noEmit: true,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        experimentalDecorators: true,
        useDefineForClassFields: false,
        types: [],
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      },
      include: ['*.ts'],
    };

    writeFileSync(join(tempDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

    // Write each code block as a separate file
    const fileMap: Map<string, CodeBlock> = new Map();

    tsBlocks.forEach((block, index) => {
      const fileName = `block_${index}.ts`;

      // Add common type stubs for Umbraco imports
      const stubbedCode = `
// Type stubs for compilation check
declare module '@umbraco-cms/backoffice/*' {
  const content: any;
  export default content;
  export * from content;
}
declare module '@tiptap/core' {
  export const Node: any;
  export const Mark: any;
  export const Extension: any;
  export type Editor = any;
}

${block.code}
`;

      writeFileSync(join(tempDir, fileName), stubbedCode);
      fileMap.set(fileName, block);
    });

    // Run TypeScript compiler
    try {
      execSync(`npx tsc --project ${tempDir}/tsconfig.json 2>&1`, {
        encoding: 'utf-8',
        cwd: tempDir,
        timeout: 30000,
      });
    } catch (error: any) {
      // Parse TypeScript errors
      const output = error.stdout || error.message || '';
      const errorLines = output.split('\n');

      for (const errorLine of errorLines) {
        // Parse error format: file.ts(line,col): error TS####: message
        const match = errorLine.match(/block_(\d+)\.ts\((\d+),\d+\):\s*(error|warning)\s+TS\d+:\s*(.+)/);
        if (match) {
          const blockIndex = parseInt(match[1]);
          const lineInBlock = parseInt(match[2]);
          const severity = match[3] as 'error' | 'warning';
          const message = match[4];

          const block = tsBlocks[blockIndex];
          if (block) {
            // Adjust line number (subtract stub lines, add block start)
            const adjustedLine = block.startLine + Math.max(0, lineInBlock - 10);

            issues.push({
              line: adjustedLine,
              type: 'typescript-error',
              value: message.slice(0, 80),
              message: `TypeScript: ${message}`,
              severity,
            });
          }
        }
      }
    }
  } finally {
    // Cleanup temp directory
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }

  return issues;
}

// Analyze a single skill file
function analyzeSkill(skillPath: string, stats: AnalysisReport['statistics']): SkillAnalysis {
  const content = readFileSync(skillPath, 'utf-8');
  const skillDir = dirname(skillPath);
  const skillName = skillDir.split('/').pop() || 'unknown';
  const issues: CodeIssue[] = [];

  // Extract code blocks
  const codeBlocks = extractCodeBlocks(content);
  stats.totalCodeBlocks += codeBlocks.length;

  // Filter to TypeScript/JavaScript blocks
  const tsJsBlocks = codeBlocks.filter(b =>
    ['typescript', 'ts', 'javascript', 'js'].includes(b.language)
  );
  stats.typescriptBlocks += tsJsBlocks.filter(b =>
    b.language === 'typescript' || b.language === 'ts'
  ).length;

  // Analyze each code block
  for (const block of tsJsBlocks) {
    // Check imports
    const importIssues = analyzeImports(block.code, block.startLine);
    stats.importIssues += importIssues.length;
    issues.push(...importIssues);

    // Check extension types
    const typeIssues = analyzeExtensionTypes(block.code, block.startLine);
    stats.extensionTypeIssues += typeIssues.length;
    issues.push(...typeIssues);

    // Check deprecated patterns
    const deprecatedIssues = analyzeDeprecatedPatterns(block.code, block.startLine);
    stats.deprecatedPatterns += deprecatedIssues.length;
    issues.push(...deprecatedIssues);
  }

  // TypeScript compilation check (optional - can be slow)
  if (process.env.CHECK_TYPESCRIPT !== 'false') {
    const tsIssues = checkTypeScriptCompilation(codeBlocks, skillPath);
    stats.compilationErrors += tsIssues.length;
    issues.push(...tsIssues);
  }

  return {
    skillPath,
    skillName,
    codeBlocks: codeBlocks.length,
    issues,
  };
}

// Find all SKILL.md files
async function discoverSkills(basePath: string): Promise<string[]> {
  const pattern = '**/SKILL.md';
  const files = await glob(pattern, {
    cwd: basePath,
    ignore: ['**/node_modules/**', '**/dist/**']
  });
  return files.map(f => join(basePath, f));
}

// Main analysis function
async function analyze(): Promise<AnalysisReport> {
  const basePath = PROJECT_ROOT;
  console.error('Starting code analysis from:', basePath);

  // Discover all skills
  const skillPaths = await discoverSkills(basePath);
  console.error(`Found ${skillPaths.length} SKILL.md files`);

  const stats: AnalysisReport['statistics'] = {
    totalCodeBlocks: 0,
    typescriptBlocks: 0,
    importIssues: 0,
    extensionTypeIssues: 0,
    compilationErrors: 0,
    deprecatedPatterns: 0,
  };

  // Analyze each skill
  const skills: SkillAnalysis[] = [];
  for (const skillPath of skillPaths) {
    console.error(`Analyzing: ${skillPath}`);
    const result = analyzeSkill(skillPath, stats);
    if (result.issues.length > 0) {
      skills.push(result);
    }
  }

  const report: AnalysisReport = {
    timestamp: new Date().toISOString(),
    skillsScanned: skillPaths.length,
    codeBlocksAnalyzed: stats.totalCodeBlocks,
    issuesFound: skills.reduce((sum, s) => sum + s.issues.length, 0),
    skills,
    statistics: stats,
  };

  return report;
}

// Run analysis
analyze()
  .then(report => {
    // Output JSON to stdout
    console.log(JSON.stringify(report, null, 2));

    // Also save to file in project root
    const reportPath = join(PROJECT_ROOT, 'code-analysis-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.error(`\nReport saved to ${reportPath}`);
    console.error(`Skills scanned: ${report.skillsScanned}`);
    console.error(`Code blocks analyzed: ${report.codeBlocksAnalyzed}`);
    console.error(`Issues found: ${report.issuesFound}`);

    // Exit with error code if issues found
    process.exit(report.issuesFound > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Analysis failed:', error);
    process.exit(2);
  });
