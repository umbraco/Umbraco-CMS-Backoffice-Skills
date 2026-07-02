#!/usr/bin/env bash
set -euo pipefail

# Claude Code WorktreeCreate hook.
#
# Input (stdin JSON):  { "name": "<slug>", "cwd": "<project-root>" }
# Output (stdout):     the worktree path on the LAST line (Claude Code reads it).
#                      All diagnostics go to stderr.
#
# What it does — and why:
# The repo ships a real Umbraco host (Umbraco-CMS.Skills/) that binds a fixed port
# (https 44325 / http 60290, from Properties/launchSettings.json). Two checkouts running
# that host at once would collide on those ports. So for each worktree we rewrite its
# launchSettings.json to port 0 — the OS then hands out a free ephemeral port, so every
# worktree's instance (and the primary checkout) can run simultaneously without clashing.
# The test-runner discovers the actual port from the "Now listening on" boot log.
#
# The host dir is committed (a worktree gets it for free) and uses SQLite with a gitignored
# DB file, so — unlike a shared SQL Server setup — there is no DB to copy or provision:
# each worktree does its own unattended install into its own DB file on first boot.

INPUT=$(cat)
NAME=$(echo "$INPUT" | jq -r '.name // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

if [ -z "$NAME" ]; then
  echo "Error: no name provided" >&2
  exit 1
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-${CWD:-$(git rev-parse --show-toplevel)}}"

# Directory slug: replace / with -. Branch: use as-is if it has a /, else prefix feature/.
DIR_SLUG=$(echo "$NAME" | tr '/' '-')
if [[ "$NAME" == *"/"* ]]; then
  BRANCH_NAME="$NAME"
else
  BRANCH_NAME="feature/$NAME"
fi

WORKTREE_PATH="$PROJECT_DIR/.claude/worktrees/$DIR_SLUG"

# --- Detect base branch ---
git -C "$PROJECT_DIR" fetch origin 2>/dev/null || true
BASE_BRANCH=""
for candidate in main master dev; do
  if git -C "$PROJECT_DIR" rev-parse --verify "origin/$candidate" >/dev/null 2>&1; then
    BASE_BRANCH="origin/$candidate"
    break
  fi
done
if [ -z "$BASE_BRANCH" ]; then
  echo "Error: could not find base branch (main, master, or dev)" >&2
  exit 1
fi
echo "Base branch: $BASE_BRANCH" >&2

# --- Handle existing worktree ---
if [ -d "$WORKTREE_PATH" ]; then
  echo "Worktree already exists at $WORKTREE_PATH" >&2
  echo "$WORKTREE_PATH"
  exit 0
fi

# --- Create worktree ---
mkdir -p "$(dirname "$WORKTREE_PATH")"
if git -C "$PROJECT_DIR" rev-parse --verify "$BRANCH_NAME" >/dev/null 2>&1; then
  echo "Using existing local branch: $BRANCH_NAME" >&2
  git -C "$PROJECT_DIR" worktree add "$WORKTREE_PATH" "$BRANCH_NAME" >&2
elif git -C "$PROJECT_DIR" rev-parse --verify "origin/$BRANCH_NAME" >/dev/null 2>&1; then
  echo "Tracking remote branch: origin/$BRANCH_NAME" >&2
  git -C "$PROJECT_DIR" worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" --track "origin/$BRANCH_NAME" >&2
else
  echo "Creating new branch: $BRANCH_NAME from $BASE_BRANCH" >&2
  git -C "$PROJECT_DIR" worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" "$BASE_BRANCH" >&2
fi

# --- Rewrite the host's launchSettings.json to use a dynamic (OS-assigned) port ---
# port 0 => the OS picks a free port at boot, so this worktree's Umbraco instance never
# clashes with the primary checkout or other worktrees. The test-runner reads the real
# URL from the "Now listening on" boot log, so nothing needs to know the port in advance.
LAUNCH_SETTINGS="$WORKTREE_PATH/Umbraco-CMS.Skills/Properties/launchSettings.json"
if [ -f "$LAUNCH_SETTINGS" ]; then
  jq '
    .profiles["Umbraco.Web.UI"].applicationUrl = "https://127.0.0.1:0;http://127.0.0.1:0" |
    .iisSettings.iisExpress.sslPort = 0 |
    .iisSettings.iisExpress.applicationUrl = "http://127.0.0.1:0"
  ' "$LAUNCH_SETTINGS" > "$LAUNCH_SETTINGS.tmp" && mv "$LAUNCH_SETTINGS.tmp" "$LAUNCH_SETTINGS"
  echo "Rewrote Umbraco-CMS.Skills launchSettings.json to a dynamic port (0)" >&2
  echo "  (this is a local-only edit in the worktree — do not commit it)" >&2
else
  echo "Warning: launchSettings.json not found at $LAUNCH_SETTINGS — port not made dynamic" >&2
fi

# --- Ensure worktrees are gitignored ---
GITIGNORE="$PROJECT_DIR/.gitignore"
if [ -f "$GITIGNORE" ] && ! grep -q '.claude/worktrees/' "$GITIGNORE"; then
  { echo ""; echo "# Worktree directories"; echo ".claude/worktrees/"; } >> "$GITIGNORE"
  echo "Added .claude/worktrees/ to .gitignore" >&2
fi

# Output the worktree path (Claude Code reads the last stdout line).
echo "$WORKTREE_PATH"
