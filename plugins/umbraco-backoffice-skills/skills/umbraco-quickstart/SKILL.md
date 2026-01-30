---
name: umbraco-quickstart
description: Getting started router - detects your environment and guides you to the right skill
user_invocable: true
---

# Umbraco Quickstart

Detects your current environment and guides you to the appropriate next step.

## Workflow

### 1. Detect what's available

Run these checks and report findings to the user:

**Check for Umbraco instance:**
```bash
find . -name "*.csproj" -exec grep -l "Umbraco.Cms" {} \; 2>/dev/null | head -5
```

**Check for extension projects:**
```bash
find . -name "umbraco-package.json" 2>/dev/null | head -10
```

**Check for Umbraco CMS source (for better code generation):**
- Look in current working directories for `Umbraco.Web.UI.Client/src`
- This may be added via `/add-dir` - check the conversation context for additional directories
- If not found, warn the user

**Check for UUI library source (for UI components):**
- Look for `@umbraco-ui/uui` source in working directories
- If not found, warn the user

**Check if testing skills are installed:**
- Check if `umbraco-testing` skill is available

### 2. Report findings

Present a summary of what was detected:

```
Environment check:

✓ Umbraco instance: ./src/MyUmbracoSite/MyUmbracoSite.csproj
✓ Extensions: ./src/MyExtension/Client/umbraco-package.json
⚠ Umbraco CMS source not found - add for better code generation
⚠ UUI library source not found - add for UI component reference
⚠ Testing skills not installed
```

### 3. Provide guidance based on findings

**If no Umbraco instance:**
→ Suggest `/package-script-writer` to create one

**If no extensions:**
→ Suggest `/umbraco-extension-template` to create one
→ Or `/umbraco-backoffice` to understand the extension map first

**If extensions exist:**
→ Remind about `/umbraco-add-extension-reference` to register them

**If CMS source missing:**
```
For better code generation, add the Umbraco CMS source:
  git clone https://github.com/umbraco/Umbraco-CMS.git
  /add-dir /path/to/Umbraco-CMS/src/Umbraco.Web.UI.Client
```

**If UUI source missing:**
```
For UI component reference, add the UUI library:
  git clone https://github.com/umbraco/Umbraco.UI.git
  /add-dir /path/to/Umbraco.UI/packages/uui
```

**If testing skills not installed:**
```
To add testing capabilities:
  /plugin install umbraco-cms-backoffice-testing-skills@umbraco-backoffice-marketplace
```

## Available skills

| Skill | Purpose |
|-------|---------|
| `/package-script-writer` | Create Umbraco instance |
| `/umbraco-backoffice` | Understand extension map |
| `/umbraco-extension-template` | Create new extension |
| `/umbraco-add-extension-reference` | Register extension |
| `/umbraco-testing` | Testing guidance (if installed) |
