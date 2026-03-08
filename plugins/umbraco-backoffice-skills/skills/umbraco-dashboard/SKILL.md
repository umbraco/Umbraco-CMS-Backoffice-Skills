---
name: umbraco-dashboard
description: Implement dashboards in Umbraco backoffice using official docs
version: 1.0.0
location: managed
allowed-tools: Read, Write, Edit, WebFetch
---

# Umbraco Dashboard

## What is it?
Dashboards are customizable components that appear in Umbraco's backoffice sections, shown when a section is selected.

## Documentation
Always fetch the latest docs before implementing:

- **Main docs**: https://docs.umbraco.com/umbraco-cms/customizing/extending-overview/extension-types/dashboard
- **Tutorial**: https://docs.umbraco.com/umbraco-cms/tutorials/creating-a-custom-dashboard

## Reference Example

**Location**: `/Umbraco-CMS/src/Umbraco.Web.UI.Client/examples/dashboard-with-property-dataset/`

Study this for production patterns.

## Related Skills

- **UmbLitElement / Element API**: `umbraco-umbraco-element`
- **Context API**: `umbraco-context-api`
- **Localization**: `umbraco-localization`
- **State Management**: `umbraco-state-management`
- **Conditions**: `umbraco-conditions`

## Workflow

1. Fetch docs
2. Ask: What section? What functionality? Who can access?
3. Generate manifest + implementation
4. Explain what was created and how to test

## Minimal Examples

### Manifest (umbraco-package.json)
```json
{
  "type": "dashboard",
  "alias": "my.dashboard",
  "name": "My Dashboard",
  "element": "/App_Plugins/MyDashboard/dashboard.js",
  "meta": {
    "label": "My Dashboard",
    "pathname": "my-dashboard"
  },
  "conditions": [
    {
      "alias": "Umb.Condition.SectionAlias",
      "match": "Umb.Section.Content"
    }
  ]
}
```

### Implementation (dashboard.js)
```javascript
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { html, css, customElement } from '@umbraco-cms/backoffice/external/lit';

@customElement('my-dashboard')
export default class MyDashboardElement extends UmbLitElement {
  render() {
    return html`
      <uui-box headline="My Dashboard">
        <p>Dashboard content goes here</p>
      </uui-box>
    `;
  }

  static styles = css`
    :host {
      display: block;
      padding: var(--uui-size-space-4);
    }
  `;
}
```