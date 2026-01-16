# Prompt Loading Workaround

**Date**: 2026-01-15  
**Issue**: Cursor windows open but prompts aren't automatically loaded into Claude Code

## Problem

When the orchestrator launches Cursor windows, they open with the workspace, but:

- Prompts aren't automatically loaded into Claude Code chat
- Agents can't start working because they don't have their instructions
- Manual intervention required for each agent window

## Root Cause

Windows `Cursor.exe` doesn't reliably support:

- `--command workbench.action.openChat` (may not work)
- `--args` for passing prompt files
- Programmatic injection of prompts into Claude Code

## Current Workaround

### Manual Steps (Per Agent Window)

1. **Open Claude Code window** (automatically opened by orchestrator)
2. **Open chat panel** (Ctrl+L or click chat icon)
3. **Load prompt file**:
   - Type: `@.temp/agent-dev-backend-1-<timestamp>.md`
   - Or copy-paste the prompt file path shown in orchestrator logs
   - Press Enter

### Prompt File Locations

Prompts are created in:

```
.temp/agent-<agentId>-<timestamp>.md
```

Example:

```
.temp/agent-dev-backend-1-1768505435258.md
```

Paths are logged by orchestrator:

```
[2026-01-15T19:30:37.285Z] ✅ Claude Code window launched successfully for Backend Developer 1 {
  taskId: 'task-1768362388844-14',
  promptFile: 'C:\\Users\\akmau\\Desktop\\Dev\\Setup_environment\\.temp\\agent-dev-backend-1-1768505435258.md',
  processPid: 13436
}
```

## Automated Solution Options (Future)

### Option 1: Cursor API Integration

- Research if Cursor has an API for programmatic prompt injection
- May require Cursor Pro or Enterprise features

### Option 2: Keyboard Automation

- Use Windows automation (AutoHotkey, PowerShell SendKeys)
- Simulate Ctrl+L, paste prompt path, Enter
- **Risky**: May interfere with user activity

### Option 3: File Watcher + Instructions

- Create a `.agent-start.md` file in workspace root
- Include instructions in the file that Claude Code auto-loads
- Have orchestrator write agent instructions to this file
- **Limitation**: Only works for one agent at a time

### Option 4: Clipboard + Instructions

- Copy prompt file path to clipboard
- Display instructions: "Press Ctrl+V in Claude Code chat"
- **Simple but still manual**

### Option 5: Cursor Extension

- Create a Cursor extension that watches for `.temp/agent-*.md` files
- Auto-loads prompts when new files are detected
- **Requires extension development**

## Recommended Approach

For now, use **manual loading** until Cursor API or extension options are available.

To make this easier:

1. Keep orchestrator logs visible to see prompt file paths
2. Use Cursor's multi-window feature to see all agent windows
3. Load prompts in sequence (one per window)

## Status

⚠️ **Manual intervention required** until automated solution is implemented.

---

**Quick Reference**:

1. Open Claude Code window (already open)
2. Press `Ctrl+L` to open chat
3. Type `@.temp/agent-<agentId>-<timestamp>.md` (from logs)
4. Press Enter
