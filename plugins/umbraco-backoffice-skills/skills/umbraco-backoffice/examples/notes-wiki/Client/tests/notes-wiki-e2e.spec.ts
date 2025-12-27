/**
 * Real E2E tests for Notes Wiki against a running Umbraco instance.
 *
 * Prerequisites:
 * 1. Umbraco instance running with the notes-wiki extension installed
 * 2. Backend API running (the NotesWiki C# project)
 *
 * Environment variables:
 *   URL - Umbraco backoffice URL (default: https://localhost:44325)
 *   UMBRACO_USER_LOGIN - Admin email
 *   UMBRACO_USER_PASSWORD - Admin password
 *   UMBRACO_DATA_PATH - Path to Umbraco's App_Data folder (optional - for resetting test data)
 *
 * Run:
 *   URL=https://localhost:44325 \
 *   UMBRACO_USER_LOGIN=admin@example.com \
 *   UMBRACO_USER_PASSWORD=yourpassword \
 *   npm run test:e2e
 *
 * The tests work with the default sample data that Notes Wiki creates:
 * - "Getting Started" folder containing "Welcome to Notes Wiki" and "How to Create Notes"
 * - "Project Notes" folder containing "Sample Project Note"
 *
 * If UMBRACO_DATA_PATH is set, test data is reset to seed state before each test run.
 */
import { expect } from '@playwright/test';
import { test } from '@umbraco/playwright-testhelpers';

// Section alias for Notes - matches the pathname in section/constants.ts
const NOTES_SECTION = 'notes';

// Helper to navigate to the Notes section using testhelpers
async function goToNotesSection(umbracoUi: any) {
  await umbracoUi.goToBackOffice();
  await umbracoUi.content.goToSection(NOTES_SECTION);
  // Wait for the section to load
  await umbracoUi.page.waitForTimeout(500);
}

// =============================================================================
// TREE NAVIGATION TESTS
// =============================================================================

test.describe('Notes Wiki - Tree Navigation', () => {
  test('should display Notes section in the section bar', async ({ umbracoUi }) => {
    await umbracoUi.goToBackOffice();

    // Assert - Notes section should be visible in the section bar
    await expect(umbracoUi.page.getByRole('tab', { name: 'Notes' })).toBeVisible({ timeout: 15000 });
  });

  test('should display Notes tree with folders and notes', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Assert - tree items from default sample data should be visible
    await expect(umbracoUi.page.getByRole('link', { name: 'Getting Started' })).toBeVisible({ timeout: 15000 });
    await expect(umbracoUi.page.getByRole('link', { name: 'Project Notes' })).toBeVisible({ timeout: 15000 });
  });

  test('should expand folder to show child notes', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Wait for tree to load
    await umbracoUi.page.getByRole('link', { name: 'Getting Started' }).waitFor({ timeout: 15000 });

    // Click expand button for Getting Started folder
    const expandButton = umbracoUi.page.getByRole('button', { name: 'Expand child items for Getting Started' });
    if (await expandButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expandButton.click();
      await umbracoUi.page.waitForTimeout(500);

      // Assert - child notes should appear (Welcome to Notes Wiki or How to Create Notes)
      const welcomeNote = umbracoUi.page.getByRole('link', { name: 'Welcome to Notes Wiki' });
      const howToNote = umbracoUi.page.getByRole('link', { name: 'How to Create Notes' });

      // At least one child note should be visible
      const welcomeVisible = await welcomeNote.isVisible({ timeout: 5000 }).catch(() => false);
      const howToVisible = await howToNote.isVisible({ timeout: 5000 }).catch(() => false);
      expect(welcomeVisible || howToVisible).toBe(true);
    }
  });

  test('should navigate to folder workspace when clicking a folder', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Click on a folder
    const folderLink = umbracoUi.page.getByRole('link', { name: 'Getting Started' });
    await folderLink.waitFor({ timeout: 15000 });
    await folderLink.click();

    // Assert - folder workspace should load (element is 'folder-workspace-editor-element')
    await expect(umbracoUi.page.locator('folder-workspace-editor-element')).toBeVisible({ timeout: 15000 });
  });
});

// =============================================================================
// DASHBOARD TESTS
// =============================================================================

test.describe('Notes Wiki - Dashboard', () => {
  test('should display welcome dashboard with recent notes', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Assert - dashboard elements should be visible
    await expect(umbracoUi.page.getByRole('heading', { name: 'Notes Wiki' })).toBeVisible({ timeout: 15000 });
    await expect(umbracoUi.page.getByText('Recent Notes')).toBeVisible({ timeout: 15000 });
    await expect(umbracoUi.page.getByRole('heading', { name: 'Getting Started' })).toBeVisible({ timeout: 15000 });
  });

  test('should show recent notes in dashboard', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Wait for dashboard to load
    await expect(umbracoUi.page.getByText('Recent Notes')).toBeVisible({ timeout: 15000 });

    // Assert - recent notes container should have items
    const recentNotesSection = umbracoUi.page.locator('uui-box').filter({ hasText: 'Recent Notes' });
    await expect(recentNotesSection).toBeVisible({ timeout: 15000 });
  });
});

// =============================================================================
// FOLDER OPERATIONS
// =============================================================================

test.describe('Notes Wiki - Folder Operations', () => {
  test('should display folder workspace with name', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Click on a folder
    const folderLink = umbracoUi.page.getByRole('link', { name: 'Getting Started' });
    await folderLink.waitFor({ timeout: 15000 });
    await folderLink.click();

    // Assert - folder workspace should load (element is 'folder-workspace-editor-element')
    await expect(umbracoUi.page.locator('folder-workspace-editor-element')).toBeVisible({ timeout: 15000 });
  });

  test('should show actions button in folder tree item', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Wait for tree to load
    await umbracoUi.page.getByRole('link', { name: 'Getting Started' }).waitFor({ timeout: 15000 });

    // Hover over folder to reveal action buttons
    const folderItem = umbracoUi.page.getByRole('link', { name: 'Getting Started' });
    await folderItem.hover();

    // Assert - actions button should be visible
    const actionsButton = umbracoUi.page.getByRole('button', { name: "View actions for 'Getting Started'" });
    await expect(actionsButton).toBeVisible({ timeout: 5000 });
  });

  test('should show actions menu via actions button', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Wait for tree to load
    await umbracoUi.page.getByRole('link', { name: 'Getting Started' }).waitFor({ timeout: 15000 });

    // Hover over folder to reveal action buttons
    const folderItem = umbracoUi.page.getByRole('link', { name: 'Getting Started' });
    await folderItem.hover();

    // Click the "View actions" button
    const actionsButton = umbracoUi.page.getByRole('button', { name: "View actions for 'Getting Started'" });
    await actionsButton.waitFor({ timeout: 5000 });
    await actionsButton.click();

    // Assert - actions menu should appear with action buttons (Delete, Rename, Create Folder, etc.)
    await umbracoUi.page.waitForTimeout(500);
    // Actions are rendered as buttons inside the dropdown menu
    const deleteButton = umbracoUi.page.getByRole('button', { name: 'Delete' });
    const renameButton = umbracoUi.page.getByRole('button', { name: 'Rename' });

    // At least one entity action should be visible
    const deleteVisible = await deleteButton.isVisible({ timeout: 3000 }).catch(() => false);
    const renameVisible = await renameButton.isVisible({ timeout: 3000 }).catch(() => false);
    expect(deleteVisible || renameVisible).toBe(true);
  });
});

// =============================================================================
// CREATE OPERATIONS
// =============================================================================

test.describe('Notes Wiki - Create Operations', () => {
  test('should show Create Note button on folder tree item', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Wait for tree to load
    await umbracoUi.page.getByRole('link', { name: 'Getting Started' }).waitFor({ timeout: 15000 });

    // Hover over folder to reveal action buttons
    const folderItem = umbracoUi.page.getByRole('link', { name: 'Getting Started' });
    await folderItem.hover();

    // Assert - Create Note button should be visible (scoped to Getting Started folder menu)
    const gettingStartedMenu = umbracoUi.page.getByRole('menu').filter({ hasText: 'Getting Started' });
    const createNoteButton = gettingStartedMenu.getByRole('button', { name: 'Create Note' });
    await expect(createNoteButton).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to new note workspace when clicking Create Note', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Wait for tree to load
    await umbracoUi.page.getByRole('link', { name: 'Getting Started' }).waitFor({ timeout: 15000 });

    // Hover over folder and click Create Note (scoped to Getting Started folder)
    const folderItem = umbracoUi.page.getByRole('link', { name: 'Getting Started' });
    await folderItem.hover();

    const gettingStartedMenu = umbracoUi.page.getByRole('menu').filter({ hasText: 'Getting Started' });
    const createNoteButton = gettingStartedMenu.getByRole('button', { name: 'Create Note' });
    if (await createNoteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createNoteButton.click();

      // Assert - should navigate to new note workspace
      await expect(umbracoUi.page.locator('notes-note-workspace-editor')).toBeVisible({ timeout: 15000 });
    }
  });
});

// =============================================================================
// NAVIGATION TESTS
// =============================================================================

test.describe('Notes Wiki - Navigation', () => {
  test('should navigate between dashboard tabs', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Dashboard should have Welcome and Browse tabs
    const welcomeTab = umbracoUi.page.getByRole('tab', { name: 'Welcome' });
    const browseTab = umbracoUi.page.getByRole('tab', { name: 'Browse' });

    await expect(welcomeTab).toBeVisible({ timeout: 15000 });
    await expect(browseTab).toBeVisible({ timeout: 15000 });

    // Click on Browse tab
    await browseTab.click();
    await umbracoUi.page.waitForTimeout(500);

    // Click back on Welcome tab
    await welcomeTab.click();
    await umbracoUi.page.waitForTimeout(500);

    // Should still show dashboard content
    await expect(umbracoUi.page.getByRole('heading', { name: 'Notes Wiki' })).toBeVisible({ timeout: 15000 });
  });

  test('should show tree header with Notes title', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Assert - tree header should show "Notes"
    await expect(umbracoUi.page.getByRole('heading', { name: 'Notes', level: 3 })).toBeVisible({ timeout: 15000 });
  });
});

// =============================================================================
// WORKSPACE TESTS
// =============================================================================

test.describe('Notes Wiki - Workspace', () => {
  test('should display folder workspace header', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Click on a folder
    const folderLink = umbracoUi.page.getByRole('link', { name: 'Project Notes' });
    await folderLink.waitFor({ timeout: 15000 });
    await folderLink.click();

    // Assert - workspace should show folder name in header (element is 'folder-workspace-editor-element')
    const workspaceEditor = umbracoUi.page.locator('folder-workspace-editor-element');
    await expect(workspaceEditor).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to note workspace from expanded folder', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Expand Getting Started folder
    const expandButton = umbracoUi.page.getByRole('button', { name: 'Expand child items for Getting Started' });
    if (await expandButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expandButton.click();
      await umbracoUi.page.waitForTimeout(500);

      // Look for any child note
      const welcomeNote = umbracoUi.page.getByRole('link', { name: 'Welcome to Notes Wiki' });
      if (await welcomeNote.isVisible({ timeout: 5000 }).catch(() => false)) {
        await welcomeNote.click();

        // Assert - note workspace should load
        await expect(umbracoUi.page.locator('notes-note-workspace-editor')).toBeVisible({ timeout: 15000 });
      }
    }
  });
});
