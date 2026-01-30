---
name: umbraco-quickstart
description: Getting started router - detects your environment and guides you to the right skill
user_invocable: true
---

# Umbraco Quickstart

A smart getting started skill that detects your current environment and guides you to the appropriate next step.

## Workflow

### 1. Check the environment

Run these checks to understand the current project state:

**Check for Umbraco instance:**
```bash
find . -name "*.csproj" -exec grep -l "Umbraco.Cms" {} \; 2>/dev/null | head -5
```

**Check for extension projects:**
```bash
find . -name "umbraco-package.json" 2>/dev/null | head -10
```

**Check if testing skills are available:**
Look for the `umbraco-testing` skill. If not found, testing skills are not installed.

**Check for Umbraco CMS source:**
```bash
# Look for the backoffice client source in working directories
find . -path "*/Umbraco.Web.UI.Client/src" -type d 2>/dev/null | head -1
```

### 2. Present options based on findings

Based on the checks, present relevant options to the user:

#### If no Umbraco instance found:
> "I don't see an Umbraco project in this workspace. Would you like me to create one?"
>
> Use `/package-script-writer` to create a new Umbraco instance.

#### If Umbraco exists but no extensions:
> "You have an Umbraco instance but no extensions yet. Would you like to:"
> 1. Create a new extension → `/umbraco-extension-template`
> 2. Understand the backoffice extension map → `/umbraco-backoffice`

#### If extensions exist but may not be registered:
> "I found extension(s). Make sure they're registered with your Umbraco project."
>
> Use `/umbraco-add-extension-reference` to register them.

#### If CMS source not found:
> "**Tip:** For best results, add the Umbraco CMS source code to your workspace:"
> ```bash
> git clone https://github.com/umbraco/Umbraco-CMS.git
> /add-dir /path/to/Umbraco-CMS/src/Umbraco.Web.UI.Client
> ```
> This helps me generate more accurate, idiomatic code.

#### If testing skills not available:
> "**Note:** Testing skills are not installed. To add them:"
> ```bash
> /plugin install umbraco-cms-backoffice-testing-skills@umbraco-backoffice-marketplace
> ```

### 3. Available skills summary

Always show what's available:

| Need | Skill |
|------|-------|
| Create Umbraco instance | `/package-script-writer` |
| Understand backoffice | `/umbraco-backoffice` |
| Create extension | `/umbraco-extension-template` |
| Register extension | `/umbraco-add-extension-reference` |
| Testing (if installed) | `/umbraco-testing` |

## Example output

```
🔍 Checking your environment...

✓ Umbraco instance found: ./src/MyUmbracoSite/MyUmbracoSite.csproj
✓ Extension found: ./src/MyExtension/Client/umbraco-package.json
✗ Umbraco CMS source not found
✗ Testing skills not installed

What would you like to do?
1. Understand the backoffice extension map → /umbraco-backoffice
2. Create another extension → /umbraco-extension-template
3. Register an extension → /umbraco-add-extension-reference

💡 Tip: Add Umbraco CMS source for better code generation:
   git clone https://github.com/umbraco/Umbraco-CMS.git
   /add-dir /path/to/Umbraco-CMS/src/Umbraco.Web.UI.Client
```
