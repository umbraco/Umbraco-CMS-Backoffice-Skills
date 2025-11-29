/**
 * Note Workspace Context Token
 *
 * The context token is used for dependency injection.
 * Components consume this token to access the workspace context.
 *
 * CRITICAL: The first argument MUST be "UmbWorkspaceContext" so that:
 * 1. The workspace alias condition can find it
 * 2. WorkspaceViews can be displayed based on their conditions
 *
 * Skills used: umbraco-context-api
 */

import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import type { UmbWorkspaceContext } from "@umbraco-cms/backoffice/workspace";
import type { NoteWorkspaceContext } from "./note-workspace.context.js";
import { NOTES_NOTE_ENTITY_TYPE } from "../../constants.js";

export const NOTE_WORKSPACE_CONTEXT = new UmbContextToken<
  UmbWorkspaceContext,
  NoteWorkspaceContext
>(
  "UmbWorkspaceContext", // MUST match UMB_WORKSPACE_CONTEXT for conditions to work
  undefined,
  (context): context is NoteWorkspaceContext =>
    context.getEntityType?.() === NOTES_NOTE_ENTITY_TYPE
);
