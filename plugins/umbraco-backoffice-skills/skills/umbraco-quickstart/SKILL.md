---
name: umbraco-quickstart
description: Quick setup for Umbraco extension development - creates instance, extension, and registers it
argument-hint: "[UmbracoProjectName] [ExtensionName] [--email admin@example.com] [--password Admin123456]"
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
user_invocable: true
---

# Umbraco Quickstart

Sets up everything needed for Umbraco extension development in one command.

## Usage

```bash
# Full setup with custom credentials
/umbraco-quickstart MyUmbracoSite MyExtension --email a@a.co.uk --password Admin123456

# With default credentials (admin@test.com / SecurePass1234)
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
- **`--email`** (optional): Admin email (default: `admin@test.com`)
- **`--password`** (optional): Admin password (default: `SecurePass1234`)

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

### 5. Plan what to build

Once setup is complete, **enter plan mode** to help the user design their extension:

1. Tell the user setup is complete and show the login credentials
2. Ask them to describe what they want to build
3. **Use `/plan` to enter planning mode** before creating the implementation plan

```
✅ Setup complete! Your extension is ready.

Login: admin@test.com / SecurePass1234

What would you like to build? Describe your idea and I'll help you plan the implementation.

Examples:
- "A dashboard that shows recent content changes"
- "A property editor for picking colours"
- "A tree in Settings for managing custom data"
```

When the user describes what they want:
1. Enter plan mode with `/plan`
2. Use `/umbraco-backoffice` to identify which extension types are needed
3. Create a detailed plan with the specific skills required
4. Exit plan mode and ask if they want to proceed with implementation

This turns quickstart into a complete onboarding experience - from zero to planning to building.

## Goal

Get the user to a working extension as quickly as possible. Don't just report - take action.

## Default Credentials

When creating an Umbraco instance, these defaults are used:

- **Email:** `admin@test.com`
- **Password:** `SecurePass1234`

These are safe for local development and don't contain special characters that cause escaping issues.

## Example

```bash
/umbraco-quickstart MyUmbracoSite MyDashboard
```

This will:
1. Create Umbraco instance (e.g. "MyUmbracoSite") if not exists
2. Create extension (e.g. "MyDashboard")
3. Register the extension with the Umbraco project
4. Warn about missing CMS/UUI source if applicable

**Login with:** `admin@test.com` / `SecurePass1234`
