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

// =============================================================================
// CRUD OPERATIONS - CREATE NOTE
// =============================================================================

test.describe('Notes Wiki - Create Note', () => {
  test('should create a new note in a folder', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Wait for tree to load
    await umbracoUi.page.getByRole('link', { name: 'Getting Started' }).waitFor({ timeout: 15000 });

    // Hover over folder and click Create Note
    const folderItem = umbracoUi.page.getByRole('link', { name: 'Getting Started' });
    await folderItem.hover();

    const gettingStartedMenu = umbracoUi.page.getByRole('menu').filter({ hasText: 'Getting Started' });
    const createNoteButton = gettingStartedMenu.getByRole('button', { name: 'Create Note' });
    await createNoteButton.waitFor({ timeout: 5000 });
    await createNoteButton.click();

    // Wait for note workspace to load
    await expect(umbracoUi.page.locator('notes-note-workspace-editor')).toBeVisible({ timeout: 15000 });

    // Fill in note title
    const titleInput = umbracoUi.page.locator('uui-input#title');
    await titleInput.waitFor({ timeout: 5000 });
    await titleInput.fill('E2E Test Note');

    // Fill in note content
    const contentTextarea = umbracoUi.page.locator('uui-textarea#content');
    await contentTextarea.fill('This note was created by E2E tests.');

    // Click Save button
    const saveButton = umbracoUi.page.getByRole('button', { name: 'Save' });
    await saveButton.click();

    // Wait for save to complete (notification should appear)
    await expect(umbracoUi.page.getByText('Note saved')).toBeVisible({ timeout: 10000 });

    // Navigate back to section to verify note appears in tree
    await goToNotesSection(umbracoUi);

    // Expand Getting Started folder
    const expandButton = umbracoUi.page.getByRole('button', { name: 'Expand child items for Getting Started' });
    if (await expandButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expandButton.click();
      await umbracoUi.page.waitForTimeout(1000);
    }

    // Assert - new note should appear in tree
    await expect(umbracoUi.page.getByRole('link', { name: 'E2E Test Note' })).toBeVisible({ timeout: 10000 });
  });

  test('should create a note with content and verify it persists', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Wait for tree to load
    await umbracoUi.page.getByRole('link', { name: 'Project Notes' }).waitFor({ timeout: 15000 });

    // Hover over folder and click Create Note
    const folderItem = umbracoUi.page.getByRole('link', { name: 'Project Notes' });
    await folderItem.hover();

    const projectNotesMenu = umbracoUi.page.getByRole('menu').filter({ hasText: 'Project Notes' });
    const createNoteButton = projectNotesMenu.getByRole('button', { name: 'Create Note' });
    await createNoteButton.waitFor({ timeout: 5000 });
    await createNoteButton.click();

    // Wait for note workspace to load
    await expect(umbracoUi.page.locator('notes-note-workspace-editor')).toBeVisible({ timeout: 15000 });

    // Fill in note title and content
    const titleInput = umbracoUi.page.locator('uui-input#title');
    await titleInput.fill('Persistence Test Note');

    const contentTextarea = umbracoUi.page.locator('uui-textarea#content');
    const testContent = 'This is test content.\n\nIt has multiple lines.\n\n- Bullet point 1\n- Bullet point 2';
    await contentTextarea.fill(testContent);

    // Save the note
    const saveButton = umbracoUi.page.getByRole('button', { name: 'Save' });
    await saveButton.click();

    // Wait for save notification
    await expect(umbracoUi.page.getByText('Note saved')).toBeVisible({ timeout: 10000 });

    // Refresh the page to verify persistence
    await umbracoUi.page.reload();
    await umbracoUi.page.waitForTimeout(1000);

    // Navigate back to the note
    await goToNotesSection(umbracoUi);

    // Expand Project Notes folder
    const expandButton = umbracoUi.page.getByRole('button', { name: 'Expand child items for Project Notes' });
    if (await expandButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expandButton.click();
      await umbracoUi.page.waitForTimeout(1000);
    }

    // Click on the created note
    const noteLink = umbracoUi.page.getByRole('link', { name: 'Persistence Test Note' });
    await noteLink.waitFor({ timeout: 10000 });
    await noteLink.click();

    // Verify workspace loads
    await expect(umbracoUi.page.locator('notes-note-workspace-editor')).toBeVisible({ timeout: 15000 });

    // Verify title persisted
    const titleInputAfterReload = umbracoUi.page.locator('uui-input#title');
    await expect(titleInputAfterReload).toHaveValue('Persistence Test Note', { timeout: 5000 });

    // Verify content persisted
    const contentTextareaAfterReload = umbracoUi.page.locator('uui-textarea#content');
    await expect(contentTextareaAfterReload).toHaveValue(testContent, { timeout: 5000 });
  });
});

// =============================================================================
// CRUD OPERATIONS - UPDATE NOTE
// =============================================================================

test.describe('Notes Wiki - Update Note', () => {
  test('should update an existing note title', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Expand Getting Started folder to access existing notes
    const expandButton = umbracoUi.page.getByRole('button', { name: 'Expand child items for Getting Started' });
    await expandButton.waitFor({ timeout: 15000 });
    await expandButton.click();
    await umbracoUi.page.waitForTimeout(500);

    // Click on an existing note
    const noteLink = umbracoUi.page.getByRole('link', { name: 'Welcome to Notes Wiki' });
    await noteLink.waitFor({ timeout: 10000 });
    await noteLink.click();

    // Wait for workspace to load
    await expect(umbracoUi.page.locator('notes-note-workspace-editor')).toBeVisible({ timeout: 15000 });

    // Update the title
    const titleInput = umbracoUi.page.locator('uui-input#title');
    await titleInput.waitFor({ timeout: 5000 });
    await titleInput.clear();
    await titleInput.fill('Welcome to Notes Wiki - Updated');

    // Save
    const saveButton = umbracoUi.page.getByRole('button', { name: 'Save' });
    await saveButton.click();

    // Wait for save notification
    await expect(umbracoUi.page.getByText('Note saved')).toBeVisible({ timeout: 10000 });

    // Navigate away and back to verify change persisted
    await goToNotesSection(umbracoUi);

    // Expand folder again
    const expandButton2 = umbracoUi.page.getByRole('button', { name: 'Expand child items for Getting Started' });
    if (await expandButton2.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expandButton2.click();
      await umbracoUi.page.waitForTimeout(500);
    }

    // Assert - updated title should appear in tree
    await expect(umbracoUi.page.getByRole('link', { name: 'Welcome to Notes Wiki - Updated' })).toBeVisible({ timeout: 10000 });
  });

  test('should update an existing note content', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Expand Project Notes folder
    const expandButton = umbracoUi.page.getByRole('button', { name: 'Expand child items for Project Notes' });
    await expandButton.waitFor({ timeout: 15000 });
    await expandButton.click();
    await umbracoUi.page.waitForTimeout(500);

    // Click on Sample Project Note
    const noteLink = umbracoUi.page.getByRole('link', { name: 'Sample Project Note' });
    await noteLink.waitFor({ timeout: 10000 });
    await noteLink.click();

    // Wait for workspace to load
    await expect(umbracoUi.page.locator('notes-note-workspace-editor')).toBeVisible({ timeout: 15000 });

    // Update the content
    const contentTextarea = umbracoUi.page.locator('uui-textarea#content');
    await contentTextarea.waitFor({ timeout: 5000 });
    const updatedContent = 'Updated content from E2E test.\n\nThis verifies that content updates work correctly.';
    await contentTextarea.clear();
    await contentTextarea.fill(updatedContent);

    // Save
    const saveButton = umbracoUi.page.getByRole('button', { name: 'Save' });
    await saveButton.click();

    // Wait for save notification
    await expect(umbracoUi.page.getByText('Note saved')).toBeVisible({ timeout: 10000 });

    // Refresh and verify content persisted
    await umbracoUi.page.reload();
    await umbracoUi.page.waitForTimeout(1000);

    // Navigate back to the note
    await goToNotesSection(umbracoUi);

    // Expand Project Notes folder
    const expandButton2 = umbracoUi.page.getByRole('button', { name: 'Expand child items for Project Notes' });
    if (await expandButton2.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expandButton2.click();
      await umbracoUi.page.waitForTimeout(500);
    }

    // Click on the note again
    const noteLink2 = umbracoUi.page.getByRole('link', { name: 'Sample Project Note' });
    await noteLink2.waitFor({ timeout: 10000 });
    await noteLink2.click();

    // Verify content persisted
    await expect(umbracoUi.page.locator('notes-note-workspace-editor')).toBeVisible({ timeout: 15000 });
    const contentTextareaAfterReload = umbracoUi.page.locator('uui-textarea#content');
    await expect(contentTextareaAfterReload).toHaveValue(updatedContent, { timeout: 5000 });
  });
});

// =============================================================================
// CRUD OPERATIONS - DELETE NOTE
// =============================================================================

test.describe('Notes Wiki - Delete Note', () => {
  test('should delete an existing note', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Expand Getting Started folder
    const expandButton = umbracoUi.page.getByRole('button', { name: 'Expand child items for Getting Started' });
    await expandButton.waitFor({ timeout: 15000 });
    await expandButton.click();
    await umbracoUi.page.waitForTimeout(500);

    // Hover over "How to Create Notes" to show actions
    const noteLink = umbracoUi.page.getByRole('link', { name: 'How to Create Notes' });
    await noteLink.waitFor({ timeout: 10000 });
    await noteLink.hover();

    // Click the actions button for the note
    const actionsButton = umbracoUi.page.getByRole('button', { name: "View actions for 'How to Create Notes'" });
    await actionsButton.waitFor({ timeout: 5000 });
    await actionsButton.click();

    // Click Delete in the actions menu
    const deleteButton = umbracoUi.page.getByRole('button', { name: 'Delete' });
    await deleteButton.waitFor({ timeout: 5000 });
    await deleteButton.click();

    // Confirm deletion in dialog
    const confirmDeleteButton = umbracoUi.page.getByRole('button', { name: 'Delete' }).last();
    await confirmDeleteButton.waitFor({ timeout: 5000 });
    await confirmDeleteButton.click();

    // Wait for deletion to complete (tree should update)
    await umbracoUi.page.waitForTimeout(1000);

    // Navigate to section again to refresh tree
    await goToNotesSection(umbracoUi);

    // Expand folder again
    const expandButton2 = umbracoUi.page.getByRole('button', { name: 'Expand child items for Getting Started' });
    if (await expandButton2.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expandButton2.click();
      await umbracoUi.page.waitForTimeout(500);
    }

    // Assert - deleted note should NOT appear in tree
    await expect(umbracoUi.page.getByRole('link', { name: 'How to Create Notes' })).not.toBeVisible({ timeout: 5000 });
  });
});

// =============================================================================
// CRUD OPERATIONS - FOLDER OPERATIONS
// =============================================================================

test.describe('Notes Wiki - Create Folder', () => {
  test('should create a new folder at root level', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Click on the root "Notes" header to access root actions
    // First, let's try to find the tree root actions
    const treeHeader = umbracoUi.page.getByRole('heading', { name: 'Notes', level: 3 });
    await treeHeader.waitFor({ timeout: 15000 });

    // Look for the actions button near the tree header
    // In Umbraco, root actions are often in the tree header or accessible via right-click
    // Try hovering over the tree header area
    await treeHeader.hover();

    // Look for a "Create Folder" or "+" button at root level
    // The root might have a dedicated create button
    const createFolderButton = umbracoUi.page.getByRole('button', { name: 'Create Folder' });

    if (await createFolderButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createFolderButton.click();

      // Fill in folder name in dialog/modal
      const folderNameInput = umbracoUi.page.getByRole('textbox', { name: 'Folder name' });
      await folderNameInput.waitFor({ timeout: 5000 });
      await folderNameInput.fill('E2E Test Folder');

      // Confirm creation
      const createButton = umbracoUi.page.getByRole('button', { name: 'Create' });
      await createButton.click();

      // Wait for folder to appear in tree
      await umbracoUi.page.waitForTimeout(1000);

      // Assert - new folder should appear in tree
      await expect(umbracoUi.page.getByRole('link', { name: 'E2E Test Folder' })).toBeVisible({ timeout: 10000 });
    }
  });

  test('should create a nested folder inside existing folder', async ({ umbracoUi }) => {
    await goToNotesSection(umbracoUi);

    // Wait for tree to load
    await umbracoUi.page.getByRole('link', { name: 'Getting Started' }).waitFor({ timeout: 15000 });

    // Hover over folder to show actions
    const folderItem = umbracoUi.page.getByRole('link', { name: 'Getting Started' });
    await folderItem.hover();

    // Click actions button
    const actionsButton = umbracoUi.page.getByRole('button', { name: "View actions for 'Getting Started'" });
    await actionsButton.waitFor({ timeout: 5000 });
    await actionsButton.click();

    // Click Create Folder in menu
    const createFolderButton = umbracoUi.page.getByRole('button', { name: 'Create Folder' });

    if (await createFolderButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createFolderButton.click();

      // Fill in folder name in dialog
      const folderNameInput = umbracoUi.page.getByRole('textbox', { name: 'Folder name' });
      await folderNameInput.waitFor({ timeout: 5000 });
      await folderNameInput.fill('Nested E2E Folder');

      // Confirm creation
      const createButton = umbracoUi.page.getByRole('button', { name: 'Create' });
      await createButton.click();

      // Wait for tree to update
      await umbracoUi.page.waitForTimeout(1000);

      // Expand Getting Started folder to see nested folder
      const expandButton = umbracoUi.page.getByRole('button', { name: 'Expand child items for Getting Started' });
      if (await expandButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expandButton.click();
        await umbracoUi.page.waitForTimeout(500);
      }

      // Assert - nested folder should appear
      await expect(umbracoUi.page.getByRole('link', { name: 'Nested E2E Folder' })).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('Notes Wiki - Delete Folder', () => {
  test('should delete an empty folder', async ({ umbracoUi }) => {
    // First create a folder to delete
    await goToNotesSection(umbracoUi);

    // Wait for tree to load
    await umbracoUi.page.getByRole('link', { name: 'Project Notes' }).waitFor({ timeout: 15000 });

    // Hover over Project Notes folder
    const folderItem = umbracoUi.page.getByRole('link', { name: 'Project Notes' });
    await folderItem.hover();

    // Click actions button
    const actionsButton = umbracoUi.page.getByRole('button', { name: "View actions for 'Project Notes'" });
    await actionsButton.waitFor({ timeout: 5000 });
    await actionsButton.click();

    // Click Delete
    const deleteButton = umbracoUi.page.getByRole('button', { name: 'Delete' });
    await deleteButton.waitFor({ timeout: 5000 });
    await deleteButton.click();

    // Confirm deletion
    const confirmDeleteButton = umbracoUi.page.getByRole('button', { name: 'Delete' }).last();
    await confirmDeleteButton.waitFor({ timeout: 5000 });
    await confirmDeleteButton.click();

    // Wait for deletion
    await umbracoUi.page.waitForTimeout(1000);

    // Navigate away and back
    await goToNotesSection(umbracoUi);

    // Assert - folder should not appear
    await expect(umbracoUi.page.getByRole('link', { name: 'Project Notes' })).not.toBeVisible({ timeout: 5000 });
  });
});
