---
name: umbraco-testing
description: Router skill for choosing the right testing approach for Umbraco backoffice extensions
version: 1.0.0
location: managed
allowed-tools: Read, Write, Edit, WebFetch
---

# Umbraco Testing - Router

Entry point for testing Umbraco backoffice extensions. Use this skill to determine which testing approach to use, then invoke the appropriate specialized skill.

## Quick Reference

| Level | Skill | Use When |
|-------|-------|----------|
| 1 | `umbraco-unit-testing` | Testing contexts, elements, controllers in isolation |
| 2 | `umbraco-msw-testing` | Testing API error handling, loading states |
| 3 | `umbraco-mocked-backoffice` | Testing extension UI in full backoffice (no .NET) |
| 4 | `umbraco-e2e-testing` | Testing complete workflows against real Umbraco |

## Supporting Skills

| Skill | Purpose |
|-------|---------|
| `umbraco-test-builders` | JsonModels.Builders for test data |
| `umbraco-playwright-testhelpers` | Full API reference for testhelpers |
| `umbraco-example-generator` | Generate testable example extensions |

---

## Decision Guide

### Choose Unit Testing (`umbraco-unit-testing`)

Best for fast, isolated testing:
- Context logic and state management
- Lit element rendering and shadow DOM
- Observable subscriptions and state changes
- Controllers and utility functions

**Speed**: Milliseconds | **Backend**: None | **Browser**: Playwright launcher

---

### Choose MSW Testing (`umbraco-msw-testing`)

Best for testing API behavior without backend:
- API error handling (404, 500, validation)
- Loading spinners and skeleton states
- Network retry behavior
- Response edge cases and timeouts

**Speed**: Fast | **Backend**: None (mocked) | **Browser**: Playwright

---

### Choose Mocked Backoffice (`umbraco-mocked-backoffice`)

Best for testing extensions in realistic UI:
- Extension appears correctly in backoffice
- Workspace views, actions, footer apps work
- Extension registration and manifest loading
- Visual integration without .NET setup

**Speed**: Fast | **Backend**: None (MSW) | **Browser**: Chromium

---

### Choose E2E Testing (`umbraco-e2e-testing`)

Best for full acceptance testing:
- Complete user workflows end-to-end
- Data persistence and retrieval
- Authentication and permissions
- Real API responses and behaviors

**Speed**: Slower | **Backend**: Running Umbraco | **Browser**: Chromium

---

## Workflow

1. **Identify what to test** - context logic, element rendering, API handling, or full workflow
2. **Choose testing level** - use the decision guide above
3. **Invoke the skill** - each testing skill is self-contained with setup, patterns, and examples
4. **Generate test data** - use `umbraco-test-builders` if needed

---

## Reference Examples

The Umbraco-CMS repository contains extensive test examples:

| Type | Location |
|------|----------|
| Unit tests | `src/Umbraco.Web.UI.Client/examples/*/` |
| MSW handlers | `src/Umbraco.Web.UI.Client/src/mocks/handlers/` |
| E2E tests | `tests/Umbraco.Tests.AcceptanceTest/tests/` |
| Extensions | `src/Umbraco.Web.UI.Client/examples/` (27 examples) |
