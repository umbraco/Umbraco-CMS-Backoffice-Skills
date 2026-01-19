# Umbraco Testing Skills

A comprehensive skill set for testing Umbraco backoffice extensions at all levels - from unit tests to full E2E tests.

## Skills Included

| Skill | Description |
|-------|-------------|
| `umbraco-testing` | Router skill - choose the right testing approach |
| `umbraco-unit-testing` | Unit/component testing with @open-wc/testing |
| `umbraco-msw-testing` | MSW handler patterns for API mocking |
| `umbraco-mocked-backoffice` | Run full backoffice with MSW (no .NET backend) |
| `umbraco-e2e-testing` | E2E testing with Playwright + Testhelpers |
| `umbraco-test-builders` | JsonModels.Builders for test data |
| `umbraco-playwright-testhelpers` | Full API reference for testhelpers |
| `umbraco-example-generator` | Generate testable example extensions |

## Four Testing Levels

### Level 1: Unit/Component Tests
- Fast, isolated testing of Lit elements, contexts, controllers
- Uses `@open-wc/testing` with Web Test Runner
- No Umbraco instance required

### Level 2: Integration Tests (MSW)
- Testing with mocked backend APIs
- Can simulate errors, delays, edge cases
- Uses MSW (Mock Service Worker) v1.3.5

### Level 3: Mocked Backoffice E2E
- Testing extension UI in full backoffice
- No .NET backend required (all APIs mocked)
- Uses `VITE_EXTERNAL_EXTENSION` with Umbraco-CMS client

### Level 4: Real Backend E2E Tests
- Full acceptance tests against running Umbraco
- Uses `@umbraco/playwright-testhelpers`
- Real API and UI interaction

## Usage

Invoke the router skill to understand which testing approach to use:

```
skill: umbraco-testing
```

Or invoke specific skills directly:

```
skill: umbraco-unit-testing
skill: umbraco-msw-testing
skill: umbraco-mocked-backoffice
skill: umbraco-e2e-testing
```

Each testing skill is self-contained with Setup, Patterns, Examples, and Troubleshooting sections.
