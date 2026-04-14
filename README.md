# Umbraco Backoffice Skills Marketplace

> **Experimental Beta:** This project is an exploration of what's possible with Skills for Umbraco. It's evolving as we learn what works best.

A Claude Code plugin marketplace with 66 skills for Umbraco backoffice customization and testing.

## Quick Start

Add the marketplace:
```bash
/plugin marketplace add umbraco/Umbraco-CMS-Backoffice-Skills
```

Install the plugins:
```bash
# Backoffice extension skills (58 skills)
/plugin install umbraco-cms-backoffice-skills@umbraco-backoffice-marketplace

# Testing skills (8 skills) - optional but recommended
/plugin install umbraco-cms-backoffice-testing-skills@umbraco-backoffice-marketplace
```

---

## Install for Other Editors (Cursor, GitHub Copilot, Windsurf, and more)

These skills use the open [SKILL.md](https://agentskills.io/home) format. Install them into any supported editor using the [Vercel Skills CLI](https://github.com/vercel-labs/skills).

> **Important:** Always use the `-a` flag to target your editor, otherwise skills will be symlinked into every supported agent directory.

```bash
# For Cursor
npx skills add umbraco/Umbraco-CMS-Backoffice-Skills --skill '*' -a cursor

# For GitHub Copilot
npx skills add umbraco/Umbraco-CMS-Backoffice-Skills --skill '*' -a github-copilot

# For Windsurf
npx skills add umbraco/Umbraco-CMS-Backoffice-Skills --skill '*' -a windsurf
```

Or install specific skills:
```bash
npx skills add umbraco/Umbraco-CMS-Backoffice-Skills --skill umbraco-dashboard --skill umbraco-tree -a cursor
```

All editors load skills **on-demand** — only the skill relevant to your current task is loaded into context, so installing all 66 skills won't affect performance.

---

## Documentation

| Guide | Description |
|-------|-------------|
| **[What Are Skills?](docs/what-are-skills.md)** | What skills are, the problem they solve, how they work across editors |
| **[Quickstart](docs/quickstart.md)** | Set up Umbraco + extension, the PLAN -> BUILD -> VALIDATE workflow |
| **[Backoffice Skills](docs/backoffice-skills.md)** | All 58 extension skills, the extension map, working examples |
| **[Testing Skills](docs/testing-skills.md)** | The 4-level testing pyramid, 8 testing skills explained |
| **[Tips for Best Results](docs/tips.md)** | Source code references, prompting advice, editor requirements |
| **[How It Works](docs/how-it-works.md)** | SKILL.md anatomy, skill selection, plugin packaging |
| **[Staying Current](docs/staying-current.md)** | How skills stay accurate with runtime doc fetching and validation |

---

## Project Structure

```
Umbraco-CMS-Backoffice-Skills/
├── .claude-plugin/marketplace.json     # Marketplace manifest
├── plugins/
│   ├── umbraco-backoffice-skills/      # Plugin with 58 extension skills
│   │   ├── .claude-plugin/plugin.json
│   │   └── skills/
│   │       ├── umbraco-dashboard/SKILL.md
│   │       ├── umbraco-tree/SKILL.md
│   │       └── ... (57 skills)
│   └── umbraco-testing-skills/         # Plugin with 8 testing skills
│       ├── .claude-plugin/plugin.json
│       └── skills/
│           ├── umbraco-testing/SKILL.md
│           ├── umbraco-e2e-testing/SKILL.md
│           └── ... (8 skills + examples)
├── docs/                              # Documentation
├── examples/                           # Working code examples
├── Umbraco-CMS.Skills/                 # .NET test project
└── .claude/
    ├── commands/                       # Local commands
    └── settings.local.json             # Local permissions
```

## License

MIT

## Credits

Built by Phil W ([@hifi-phil](https://github.com/hifi-phil))

Skills based on [Umbraco CMS](https://umbraco.com/) backoffice documentation.

### Example Attribution

The **TimeDashboard** and **tree-example** examples are based on work by Kevin Jump ([@KevinJump](https://github.com/KevinJump)):
- **TimeDashboard:** [KevinJump/TimeDashboard](https://github.com/KevinJump/TimeDashboard)
- **tree-example:** [KevinJump/Umbraco-Tree-Example](https://github.com/KevinJump/Umbraco-Tree-Example)
- **Blog Series:** [Early Adopter's Guide to Umbraco v14](https://dev.to/kevinjump/series/26505)

These examples demonstrate sections, trees, workspaces, menus, header apps, modals, and server communication patterns for Umbraco backoffice extensions.
