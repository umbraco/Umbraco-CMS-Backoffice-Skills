---
name: umbraco-quickstart
description: Getting started router - detects your environment and sets up what's needed
user_invocable: true
---

# Umbraco Quickstart

Detects your environment and sets up what's needed to create a working extension.

## Workflow

### 1. Check what exists

**Check for Umbraco instance:**
```bash
find . -name "*.csproj" -exec grep -l "Umbraco.Cms" {} \; 2>/dev/null | head -5
```

**Check for extension projects:**
```bash
find . -name "umbraco-package.json" 2>/dev/null | head -10
```

**Check for Umbraco CMS source in extended workspace:**
- Look for `Umbraco.Web.UI.Client/src` in current and extended workspace directories
- Extended workspace includes directories added via `/add-dir`

**Check for UUI library source in extended workspace:**
- Look for `@umbraco-ui/uui` packages in extended workspace directories

**Check if testing skills are installed:**
- Check if `umbraco-testing` skill is available

### 2. Take action based on findings

**If no Umbraco instance → Create one:**
```
No Umbraco project found. Creating one with /package-script-writer...
```
Then use `/package-script-writer` to create it.

**If no extensions → Create one:**
```
No extensions found. Creating one with /umbraco-extension-template...
```
Then use `/umbraco-extension-template` to create it.

**If extension not registered → Register it:**
```
Extension found but not registered. Registering with /umbraco-add-extension-reference...
```
Then use `/umbraco-add-extension-reference` to register it.

### 3. Warn about missing resources

Only warn (don't block) if these are missing:

**If CMS source not in extended workspace:**
```
⚠ Umbraco CMS source not found in extended workspace.
  For better code generation, add it:
  git clone https://github.com/umbraco/Umbraco-CMS.git
  /add-dir /path/to/Umbraco-CMS/src/Umbraco.Web.UI.Client
```

**If UUI source not in extended workspace:**
```
⚠ UUI library source not found in extended workspace.
  For UI component reference, add it:
  git clone https://github.com/umbraco/Umbraco.UI.git
  /add-dir /path/to/Umbraco.UI/packages/uui
```

**If testing skills not installed:**
```
⚠ Testing skills not installed.
  To add testing capabilities:
  /plugin install umbraco-cms-backoffice-testing-skills@umbraco-backoffice-marketplace
```

## Goal

The aim is to get the user to a working extension as quickly as possible. Don't just report - take action.

## Available skills

| Skill | Purpose |
|-------|---------|
| `/package-script-writer` | Create Umbraco instance |
| `/umbraco-backoffice` | Understand extension map |
| `/umbraco-extension-template` | Create new extension |
| `/umbraco-add-extension-reference` | Register extension |
| `/umbraco-testing` | Testing guidance (if installed) |
