#!/usr/bin/env npx tsx

import { readFileSync, existsSync, mkdirSync, writeFileSync, mkdtempSync, rmSync } from 'fs';
import { dirname, resolve, join, basename } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { execSync, execFileSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const SCRIPT_DIR = __dirname;
export const SKILL_DIR = resolve(__dirname, '..');
export const PROJECT_ROOT = resolve(__dirname, '../../../../');

// --- SKILL.md Parsing ---

export interface SkillFrontmatter {
  name: string;
  description: string;
  version?: string;
  'allowed-tools'?: string;
  [key: string]: string | undefined;
}

export interface ParsedSkill {
  frontmatter: SkillFrontmatter;
  content: string;
  docUrls: string[];
  codeBlocks: CodeBlock[];
  lineCount: number;
}

export interface CodeBlock {
  language: string;
  code: string;
  startLine: number;
  endLine: number;
}

export function parseSkillMd(skillPath: string): ParsedSkill {
  const skillMdPath = skillPath.endsWith('SKILL.md')
    ? skillPath
    : join(skillPath, 'SKILL.md');

  if (!existsSync(skillMdPath)) {
    throw new Error(`SKILL.md not found at: ${skillMdPath}`);
  }

  const content = readFileSync(skillMdPath, 'utf-8');
  const lines = content.split('\n');

  // Parse frontmatter
  const frontmatter: SkillFrontmatter = { name: '', description: '' };
  let bodyStart = 0;

  if (lines[0]?.trim() === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        bodyStart = i + 1;
        break;
      }
      const match = lines[i].match(/^(\S+):\s*(.+)$/);
      if (match) {
        frontmatter[match[1]] = match[2].trim();
      }
    }
  }

  const body = lines.slice(bodyStart).join('\n');

  // Extract doc URLs
  const docUrls = extractDocUrls(content);

  // Extract code blocks
  const codeBlocks = extractCodeBlocks(content);

  return {
    frontmatter,
    content,
    docUrls,
    codeBlocks,
    lineCount: lines.length,
  };
}

// --- URL Extraction ---

export function extractDocUrls(content: string): string[] {
  const urlPattern = /https?:\/\/[^\s\)>\]"']+/g;
  const matches = content.match(urlPattern) || [];
  // Deduplicate and filter to doc-like URLs
  return [...new Set(matches)].filter(url =>
    url.includes('docs.umbraco.com') ||
    url.includes('github.com/umbraco') ||
    url.includes('apidocs.umbraco.com')
  );
}

// --- Code Block Extraction ---

export function extractCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let currentBlock: Partial<CodeBlock> = {};
  let codeLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (line.startsWith('```') && !inCodeBlock) {
      inCodeBlock = true;
      const language = line.slice(3).trim().toLowerCase();
      currentBlock = { language: language || 'unknown', startLine: lineNum };
      codeLines = [];
    } else if (line.startsWith('```') && inCodeBlock) {
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

// --- Doc Fetching ---

export async function fetchDoc(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'text/html,text/plain' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return `[FETCH_ERROR: ${response.status} ${response.statusText}]`;
    }
    const html = await response.text();
    // Strip HTML tags for plain-text comparison
    return stripHtml(html);
  } catch (error: any) {
    return `[FETCH_ERROR: ${error.message}]`;
  }
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// --- Doc Pattern Extraction ---

export interface DocPatterns {
  baseClasses: string[];
  imports: string[];
  decorators: string[];
  registrationPatterns: string[];
  manifestFields: string[];
}

export function extractPatternsFromDoc(docText: string): DocPatterns {
  const patterns: DocPatterns = {
    baseClasses: [],
    imports: [],
    decorators: [],
    registrationPatterns: [],
    manifestFields: [],
  };

  // Base classes
  const classPatterns = [
    /class\s+\w+\s+extends\s+([\w.]+(?:\([^)]*\))?)/g,
    /(UmbLitElement|UmbElementMixin|UmbControllerBase)/g,
  ];
  for (const p of classPatterns) {
    let m;
    while ((m = p.exec(docText)) !== null) {
      if (!patterns.baseClasses.includes(m[1] || m[0])) {
        patterns.baseClasses.push(m[1] || m[0]);
      }
    }
  }

  // Import paths
  const importPattern = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = importPattern.exec(docText)) !== null) {
    if (!patterns.imports.includes(m[1])) {
      patterns.imports.push(m[1]);
    }
  }

  // Decorators
  const decoratorPattern = /@(customElement|state|property|query)\b/g;
  while ((m = decoratorPattern.exec(docText)) !== null) {
    if (!patterns.decorators.includes(m[1])) {
      patterns.decorators.push(m[1]);
    }
  }

  // Registration patterns
  if (/customElements\.define\s*\(/.test(docText)) {
    patterns.registrationPatterns.push('customElements.define');
  }
  if (/@customElement\s*\(/.test(docText)) {
    patterns.registrationPatterns.push('@customElement');
  }

  // Manifest fields
  const fieldPattern = /["']?(type|alias|name|element|js|kind|meta|conditions|weight)["']?\s*:/g;
  while ((m = fieldPattern.exec(docText)) !== null) {
    if (!patterns.manifestFields.includes(m[1])) {
      patterns.manifestFields.push(m[1]);
    }
  }

  return patterns;
}

// --- Pattern Comparison ---

export interface PatternDrift {
  category: string;
  skillPattern: string;
  docPattern: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export function comparePatterns(
  skillPatterns: DocPatterns,
  docPatterns: DocPatterns
): PatternDrift[] {
  const drifts: PatternDrift[] = [];

  // Check if skill uses patterns not in docs
  for (const cls of skillPatterns.baseClasses) {
    if (!docPatterns.baseClasses.some(d => d.includes(cls) || cls.includes(d))) {
      drifts.push({
        category: 'base-class',
        skillPattern: cls,
        docPattern: docPatterns.baseClasses.join(', ') || 'none found',
        severity: 'warning',
        message: `Skill uses ${cls} but docs show: ${docPatterns.baseClasses.join(', ') || 'different patterns'}`,
      });
    }
  }

  // Check registration pattern drift
  for (const reg of skillPatterns.registrationPatterns) {
    if (!docPatterns.registrationPatterns.includes(reg)) {
      drifts.push({
        category: 'registration',
        skillPattern: reg,
        docPattern: docPatterns.registrationPatterns.join(', ') || 'none found',
        severity: 'warning',
        message: `Skill uses ${reg} but docs prefer: ${docPatterns.registrationPatterns.join(', ')}`,
      });
    }
  }

  // Check import path drift
  for (const imp of skillPatterns.imports) {
    if (imp.startsWith('@umbraco-cms/') && !docPatterns.imports.some(d => d === imp)) {
      drifts.push({
        category: 'import',
        skillPattern: imp,
        docPattern: 'not found in docs',
        severity: 'info',
        message: `Import ${imp} not found in current docs`,
      });
    }
  }

  return drifts;
}

// --- File Helpers ---

export function ensureDir(dirPath: string): void {
  mkdirSync(dirPath, { recursive: true });
}

export function writeJson(filePath: string, data: unknown): void {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf-8')) as T;
}

export function getResultsDir(skillName: string): string {
  const date = new Date().toISOString().split('T')[0];
  return join(PROJECT_ROOT, 'results', skillName, date);
}

// --- Skill Name from Path ---

export function skillNameFromPath(skillPath: string): string {
  const resolved = resolve(skillPath);
  return basename(resolved);
}

// --- CLI Argument Parsing ---

export function parseArgs(args: string[]): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--')
        ? args[i + 1]
        : 'true';
      parsed[key] = value;
      if (value !== 'true') i++;
    }
  }
  return parsed;
}

// --- Subprocess Helpers ---

export function runClaudeP(
  prompt: string,
  options: {
    cwd?: string;
    model?: string;
    timeout?: number;
    skillPath?: string;
    noTools?: boolean;
  } = {}
): { stdout: string; stderr: string; exitCode: number } {
  const { cwd = PROJECT_ROOT, model, timeout = 120000, noTools = false } = options;

  // Write prompt to temp file to avoid ARG_MAX and shell escaping issues
  const tmpDir = mkdtempSync(join(tmpdir(), 'claude-p-'));
  const promptFile = join(tmpDir, 'prompt.txt');
  writeFileSync(promptFile, prompt);

  const claudeArgs = ['--output-format', 'json', '--max-turns', '1'];
  if (model) {
    claudeArgs.push('--model', model);
  }
  if (noTools) {
    claudeArgs.push('--disallowedTools', 'Bash Read Write Edit Glob Grep Agent Skill WebFetch WebSearch');
  }

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
    return { stdout, stderr: '', exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.status || 1,
    };
  } finally {
    try { rmSync(tmpDir, { recursive: true }); } catch {}
  }
}

// --- Diff Generation ---

export function generateDiff(oldContent: string, newContent: string): string {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  const diffs: string[] = [];
  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === undefined) {
      diffs.push(`+${i + 1}: ${newLine}`);
    } else if (newLine === undefined) {
      diffs.push(`-${i + 1}: ${oldLine}`);
    } else if (oldLine !== newLine) {
      diffs.push(`-${i + 1}: ${oldLine}`);
      diffs.push(`+${i + 1}: ${newLine}`);
    }
  }

  return diffs.join('\n');
}
