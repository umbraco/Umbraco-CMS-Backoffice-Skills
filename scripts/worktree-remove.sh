#!/usr/bin/env bash
set -euo pipefail

# Claude Code WorktreeRemove hook.
#
# Input (stdin JSON): { "worktree_path": "<absolute-path>" }
#
# Kills anything still rooted in / holding files under the worktree (a `dotnet run` host,
# its compiled binary, a vite dev server from the mocked suites, a Playwright browser, etc.)
# before removing the worktree — otherwise `git worktree remove` fails on a busy directory.

INPUT=$(cat)
WORKTREE_PATH=$(echo "$INPUT" | jq -r '.worktree_path // empty')

if [ -z "$WORKTREE_PATH" ]; then
  echo "Error: no worktree_path provided" >&2
  exit 1
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || echo "")}"
DIR_SLUG=$(basename "$WORKTREE_PATH")
echo "Removing worktree: $DIR_SLUG" >&2

# --- Kill anything holding the worktree ---
#   1. Anything whose argv mentions the worktree path (pgrep -f)
#   2. Anything with open file handles inside the worktree (lsof +D)
#   3. The compiled host binary path (covers re-parented orphans)
kill_holders() {
  local signal="$1" pids
  pids=$( {
    pgrep -f "$WORKTREE_PATH" 2>/dev/null
    lsof -t +D "$WORKTREE_PATH" 2>/dev/null
    pgrep -f "$WORKTREE_PATH/Umbraco-CMS.Skills/bin/" 2>/dev/null
  } | sort -u | tr '\n' ' ')
  if [ -n "$pids" ]; then
    echo "Sending $signal to: $pids" >&2
    echo "$pids" | xargs kill -"$signal" 2>/dev/null || true
    return 0
  fi
  return 1
}

if kill_holders TERM; then
  sleep 2
  kill_holders KILL >/dev/null 2>&1 || true
  sleep 1
fi

# --- Remove worktree ---
if [ -n "$PROJECT_DIR" ]; then
  git -C "$PROJECT_DIR" worktree remove --force "$WORKTREE_PATH" 2>/dev/null || {
    echo "Force remove failed, trying prune + rm..." >&2
    git -C "$PROJECT_DIR" worktree prune 2>/dev/null || true
    rm -rf "$WORKTREE_PATH" 2>/dev/null || true
  }
else
  rm -rf "$WORKTREE_PATH" 2>/dev/null || true
fi

echo "Worktree $DIR_SLUG removed" >&2
