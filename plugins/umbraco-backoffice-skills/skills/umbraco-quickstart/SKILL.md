---
name: umbraco-quickstart
description: Quick setup for Umbraco extension development - creates instance, extension, and registers it
argument-hint: "[UmbracoProjectName] [ExtensionName]"
user_invocable: true
---

# Umbraco Quickstart

Sets up everything needed for Umbraco extension development in one command.

## Usage

```bash
# Full setup with names provided
/umbraco-quickstart MyUmbracoSite MyExtension

# Just Umbraco instance name (will prompt for extension name)
/umbraco-quickstart MyUmbracoSite

# No arguments (will detect existing or prompt for names)
/umbraco-quickstart
```

## Workflow

### 1. Parse arguments

- **First argument**: Umbraco project name (e.g., "MyUmbracoSite")
- **Second argument**: Extension name (e.g., "MyExtension")

If arguments not provided, check what exists and prompt for missing names.

### 2. Check what exists

**Check for Umbraco instance:**
```bash
find . -name "*.csproj" -exec grep -l "Umbraco.Cms" {} \; 2>/dev/null | head -5
```

**Check for extension projects:**
```bash
find . -name "umbraco-package.json" 2>/dev/null | head -10
```

### 3. Take action

**If no Umbraco instance:**
- Use the provided name (first argument) or prompt for one
- Create with `/package-script-writer [ProjectName]`

**If no extension:**
- Use the provided name (second argument) or prompt for one
- Create with `/umbraco-extension-template [ExtensionName]`

**If extension not registered:**
- Register with `/umbraco-add-extension-reference [ExtensionName]`

### 4. Warn about optional resources

Check extended workspace (including `/add-dir` directories) and warn if missing:

**If CMS source not found:**
```
⚠ Umbraco CMS source not found in extended workspace.
  For better code generation, add it:
  git clone https://github.com/umbraco/Umbraco-CMS.git
  /add-dir /path/to/Umbraco-CMS/src/Umbraco.Web.UI.Client
```

**If UUI source not found:**
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

Get the user to a working extension as quickly as possible. Don't just report - take action.

## Example

```bash
/umbraco-quickstart MyUmbracoSite MyDashboard
```

This will:
1. Create Umbraco instance "MyUmbracoSite" (if not exists)
2. Create extension "MyDashboard"
3. Register the extension with the Umbraco project
4. Warn about missing CMS/UUI source if applicable
