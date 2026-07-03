---
description: Create a lightweight skill for Umbraco backoffice concepts that pulls from web documentation
argument-hint: "[concept-name]"
allowed-tools: Read, Write, WebFetch
---

Create a lightweight Claude Code skill for: **{{arg}}**

## Documentation URLs (Use these in the skill)

1. **Extending Overview**: `https://docs.umbraco.com/umbraco-cms/17.latest/extend-your-project/backoffice-extensions/extending-overview`
2. **Foundation**: `https://docs.umbraco.com/umbraco-cms/17.latest/extend-your-project/backoffice-extensions/foundation`
3. **Workspaces**: `https://docs.umbraco.com/umbraco-cms/17.latest/extend-your-project/backoffice-extensions/extending-overview/extension-types/workspaces`

## What to Create

Create a minimal SKILL.md at: `.claude/skills/umbraco-{{arg}}/SKILL.md`

The skill should:
1. **Explain the concept** in 2-3 simple sentences
2. **List the documentation URLs** to fetch
3. **Show 1-2 minimal examples**
4. **That's it** - keep it simple!

## Skill Template

```markdown
---
name: umbraco-{{arg}}
description: Implement {{arg}} in Umbraco backoffice using official docs
version: 1.0.0
location: managed
allowed-tools: Read, Write, Edit, WebFetch
---

# Umbraco {{arg}}

## What is it?
[2-3 sentence explanation]

## Documentation
Always fetch the latest docs before implementing:

- **Main docs**: https://docs.umbraco.com/umbraco-cms/17.latest/extend-your-project/backoffice-extensions/extending-overview/extension-types/{{arg}}
- **Foundation**: https://docs.umbraco.com/umbraco-cms/17.latest/extend-your-project/backoffice-extensions/foundation
- **Extension Registry**: https://docs.umbraco.com/umbraco-cms/17.latest/extend-your-project/backoffice-extensions/extending-overview/extension-registry

## Workflow

1. **Fetch docs** - Use WebFetch on the URLs above
2. **Ask questions** - What section? What functionality? Who can access?
3. **Generate files** - Create manifest + implementation based on latest docs
4. **Explain** - Show what was created and how to test

## Minimal Examples

### Manifest (umbraco-package.json)
```json
{
  "type": "{{arg}}",
  "alias": "my.{{arg}}",
  "name": "My {{arg}}",
  [minimal manifest from docs]
}
```

### Implementation (element.js)
```javascript
[minimal web component implementation from docs]
```

That's it! Always fetch fresh docs, keep examples minimal, generate complete working code.
```

## Your Task

1. Fetch the documentation URL for {{arg}}
2. Extract a 2-3 sentence explanation
3. Find 1 minimal example
4. Create the SKILL.md file using the template above
5. Done!

Keep it simple - the skill will fetch full docs dynamically when used.
