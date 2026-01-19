#!/usr/bin/env npx tsx

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { retry, handleAll, ExponentialBackoff } from 'cockatiel';

// Get project root (script is at .claude/skills/umbraco-skill-validator/scripts/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '../../../../');

// Types
interface Issue {
  line: number;
  type: 'broken-url' | 'missing-skill' | 'invalid-path' | 'missing-file' | 'redirect';
  value: string;
  status: number | null;
  message: string;
}

interface SkillValidation {
  skillPath: string;
  skillName: string;
  issues: Issue[];
}

interface ValidationReport {
  timestamp: string;
  skillsScanned: number;
  issuesFound: number;
  skills: SkillValidation[];
  statistics: {
    urlsChecked: number;
    urlsBroken: number;
    skillRefsChecked: number;
    skillRefsMissing: number;
    pathsChecked: number;
    pathsInvalid: number;
  };
}

// Patterns
const EXTERNAL_URL_PATTERN = /https?:\/\/[^\s\)>\]]+/g;
const SKILL_REF_PATTERN = /`(umbraco-[a-z-]+)`/g;
const INTERNAL_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const IMPORT_PATH_PATTERN = /@umbraco-cms\/backoffice\/[a-z-]+/g;

// Config
const URL_TIMEOUT = 5000;
const URL_BATCH_DELAY = 100;
const GITHUB_API_BASE = 'https://api.github.com/repos/umbraco/Umbraco-CMS/contents';

// Retry policy with exponential backoff
const urlRetryPolicy = retry(handleAll, {
  maxAttempts: 5,
  backoff: new ExponentialBackoff()
});

// URLs to skip (localhost, example domains, etc.)
const SKIP_URL_PATTERNS = [
  /^https?:\/\/localhost/,
  /^https?:\/\/127\.0\.0\.1/,
  /^https?:\/\/example\.com/,
  /^https?:\/\/my-docs\.com/,  // Example placeholder
  /^http:\/\/www\.w3\.org/,     // XML namespaces
];

// Find all SKILL.md files
async function discoverSkills(basePath: string): Promise<string[]> {
  const pattern = '**/SKILL.md';
  const files = await glob(pattern, {
    cwd: basePath,
    ignore: ['**/node_modules/**', '**/dist/**']
  });
  return files.map(f => join(basePath, f));
}

// Extract links from content with line numbers
function extractLinks(content: string): {
  urls: { line: number; url: string }[];
  skillRefs: { line: number; name: string }[];
  internalLinks: { line: number; text: string; path: string }[];
  importPaths: { line: number; path: string }[];
} {
  const lines = content.split('\n');
  const urls: { line: number; url: string }[] = [];
  const skillRefs: { line: number; name: string }[] = [];
  const internalLinks: { line: number; text: string; path: string }[] = [];
  const importPaths: { line: number; path: string }[] = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // External URLs
    let match;
    while ((match = EXTERNAL_URL_PATTERN.exec(line)) !== null) {
      // Clean up URL (remove trailing punctuation)
      let url = match[0].replace(/[.,;:!?'")\]}>]+$/, '');
      urls.push({ line: lineNum, url });
    }
    EXTERNAL_URL_PATTERN.lastIndex = 0;

    // Skill references
    while ((match = SKILL_REF_PATTERN.exec(line)) !== null) {
      skillRefs.push({ line: lineNum, name: match[1] });
    }
    SKILL_REF_PATTERN.lastIndex = 0;

    // Internal links (markdown)
    while ((match = INTERNAL_LINK_PATTERN.exec(line)) !== null) {
      const path = match[2];
      // Skip external URLs and anchors
      if (!path.startsWith('http') && !path.startsWith('#')) {
        internalLinks.push({ line: lineNum, text: match[1], path });
      }
    }
    INTERNAL_LINK_PATTERN.lastIndex = 0;

    // Import paths
    while ((match = IMPORT_PATH_PATTERN.exec(line)) !== null) {
      importPaths.push({ line: lineNum, path: match[0] });
    }
    IMPORT_PATH_PATTERN.lastIndex = 0;
  });

  return { urls, skillRefs, internalLinks, importPaths };
}

// Check URL accessibility with retries
async function checkUrl(url: string): Promise<{ status: number; redirect?: string }> {
  try {
    return await urlRetryPolicy.execute(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), URL_TIMEOUT);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'manual'
      });

      clearTimeout(timeout);

      // Handle redirects
      if (response.status >= 300 && response.status < 400) {
        const redirect = response.headers.get('location');
        return { status: response.status, redirect: redirect || undefined };
      }

      // Server error (5xx) - throw to trigger retry
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }

      return { status: response.status };
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return { status: 408 }; // Timeout
    }
    return { status: 0 }; // Network error after all retries
  }
}

// Check if skill exists
async function checkSkillExists(name: string, allSkillNames: string[]): Promise<boolean> {
  return allSkillNames.includes(name);
}

// Check internal file path
function checkFilePath(path: string, basePath: string): boolean {
  const resolved = resolve(basePath, path);
  return existsSync(resolved);
}

// Check Umbraco-CMS path via GitHub API
async function checkUmbracoPath(path: string): Promise<boolean> {
  // Build list of potential local Umbraco-CMS locations
  const localPaths: string[] = [];

  // Check environment variable first (e.g., UMBRACO_CMS_PATH=/path/to/Umbraco-CMS)
  if (process.env.UMBRACO_CMS_PATH) {
    localPaths.push(process.env.UMBRACO_CMS_PATH);
  }

  // Check relative paths from project root
  localPaths.push(
    join(PROJECT_ROOT, '../Umbraco-CMS'),
    join(PROJECT_ROOT, '../../Umbraco-CMS'),
    join(PROJECT_ROOT, 'Umbraco-CMS')
  );

  for (const localBase of localPaths) {
    const localPath = join(localBase, path.replace('/Umbraco-CMS/', '').replace(/^\//, ''));
    if (existsSync(localPath)) {
      return true;
    }
  }

  // Fall back to GitHub API
  try {
    const apiPath = path.replace('/Umbraco-CMS/', '').replace(/^\//, '');
    const response = await fetch(`${GITHUB_API_BASE}/${apiPath}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'skill-validator'
      }
    });
    return response.status === 200;
  } catch {
    return false; // Can't verify, assume valid
  }
}

// Validate a single skill file
async function validateSkill(
  skillPath: string,
  allSkillNames: string[],
  stats: ValidationReport['statistics']
): Promise<SkillValidation> {
  const content = readFileSync(skillPath, 'utf-8');
  const skillDir = dirname(skillPath);
  const skillName = skillDir.split('/').pop() || 'unknown';
  const issues: Issue[] = [];

  const { urls, skillRefs, internalLinks } = extractLinks(content);

  // Check URLs
  for (const { line, url } of urls) {
    // Skip localhost and example URLs
    if (SKIP_URL_PATTERNS.some(pattern => pattern.test(url))) {
      continue;
    }

    stats.urlsChecked++;
    await new Promise(r => setTimeout(r, URL_BATCH_DELAY)); // Rate limiting

    const result = await checkUrl(url);

    if (result.status === 0) {
      stats.urlsBroken++;
      issues.push({
        line,
        type: 'broken-url',
        value: url,
        status: 0,
        message: 'Network error or invalid URL'
      });
    } else if (result.status >= 400) {
      stats.urlsBroken++;
      issues.push({
        line,
        type: 'broken-url',
        value: url,
        status: result.status,
        message: `HTTP ${result.status}`
      });
    } else if (result.redirect) {
      issues.push({
        line,
        type: 'redirect',
        value: url,
        status: result.status,
        message: `Redirects to: ${result.redirect}`
      });
    }
  }

  // Check skill references
  for (const { line, name } of skillRefs) {
    stats.skillRefsChecked++;
    const exists = await checkSkillExists(name, allSkillNames);
    if (!exists) {
      stats.skillRefsMissing++;
      issues.push({
        line,
        type: 'missing-skill',
        value: name,
        status: null,
        message: `Skill '${name}' not found`
      });
    }
  }

  // Check internal links
  for (const { line, path } of internalLinks) {
    stats.pathsChecked++;

    // Handle Umbraco-CMS paths
    if (path.includes('Umbraco-CMS') || path.includes('Umbraco.Web.UI.Client')) {
      const exists = await checkUmbracoPath(path);
      if (!exists) {
        stats.pathsInvalid++;
        issues.push({
          line,
          type: 'invalid-path',
          value: path,
          status: null,
          message: 'Path not found in Umbraco-CMS'
        });
      }
    } else {
      // Local relative path
      const exists = checkFilePath(path, skillDir);
      if (!exists) {
        stats.pathsInvalid++;
        issues.push({
          line,
          type: 'missing-file',
          value: path,
          status: null,
          message: 'File not found'
        });
      }
    }
  }

  return { skillPath, skillName, issues };
}

// Main validation function
async function validate(): Promise<ValidationReport> {
  const basePath = PROJECT_ROOT;
  console.error('Starting validation from:', basePath);

  // Discover all skills
  const skillPaths = await discoverSkills(basePath);
  console.error(`Found ${skillPaths.length} SKILL.md files`);

  // Extract all skill names for reference checking
  const allSkillNames = skillPaths.map(p => {
    const dir = dirname(p);
    return dir.split('/').pop() || '';
  }).filter(Boolean);

  const stats: ValidationReport['statistics'] = {
    urlsChecked: 0,
    urlsBroken: 0,
    skillRefsChecked: 0,
    skillRefsMissing: 0,
    pathsChecked: 0,
    pathsInvalid: 0
  };

  // Validate each skill
  const skills: SkillValidation[] = [];
  for (const skillPath of skillPaths) {
    console.error(`Validating: ${skillPath}`);
    const result = await validateSkill(skillPath, allSkillNames, stats);
    if (result.issues.length > 0) {
      skills.push(result);
    }
  }

  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    skillsScanned: skillPaths.length,
    issuesFound: skills.reduce((sum, s) => sum + s.issues.length, 0),
    skills,
    statistics: stats
  };

  return report;
}

// Run validation
validate()
  .then(report => {
    // Output JSON to stdout
    console.log(JSON.stringify(report, null, 2));

    // Also save to file in project root
    const reportPath = join(PROJECT_ROOT, 'validation-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.error(`\nReport saved to ${reportPath}`);
    console.error(`Skills scanned: ${report.skillsScanned}`);
    console.error(`Issues found: ${report.issuesFound}`);

    // Exit with error code if issues found
    process.exit(report.issuesFound > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Validation failed:', error);
    process.exit(2);
  });
