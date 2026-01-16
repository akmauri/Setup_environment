# Fully Automated Agent Launch Flow

**Date**: 2026-01-15  
**Status**: ✅ **COMPLETE** - Fully automated from orchestrator to agent execution

## Overview

The system now automatically launches parallel Claude Code agents without any manual intervention. The entire flow from orchestrator → window launch → prompt injection → agent execution is automated.

## Complete Flow

### 1. Orchestrator Spawns Agent (`scripts/orchestrate_agents.js`)

```
Orchestrator → spawnAgent(agentId, task)
  ↓
  - Validates task and agent config
  - Reserves capacity (prevents over-spawning)
  - Calls launchClaudeCodeWindow()
```

### 2. Claude Code Window Launch (`scripts/launch_claude_code.js`)

```
launchClaudeCodeWindow(agentId, promptFile)
  ↓
  a. Detect Cursor Installation
     - Windows: Searches common paths for Cursor.exe
     - macOS/Linux: Checks PATH for 'cursor' command
     - Returns full path or command
  ↓
  b. Build Agent Prompt
     - Reads original prompt file
     - Loads loop_guard.md rules
     - Creates full prompt with context
     - Saves to .temp/agent-{agentId}-{timestamp}.md
  ↓
  c. Spawn Cursor Process
     - Executes: Cursor.exe [workspace] (Windows)
     - Detaches process (allows orchestrator to continue)
     - Waits 3 seconds for window to open
  ↓
  d. Automated Prompt Injection
     - Calls injectPromptWindows() (Windows only)
```

### 3. Aggressive Window Activation (`scripts/inject_prompt.ps1`)

```
injectPromptWindows(promptFile, projectRoot)
  ↓
  a. Find Cursor Window
     - Searches for Cursor processes
     - Selects most recently opened (StartTime desc)
     - Gets window handle
  ↓
  b. Aggressive Activation (ActivateCursorWindow function)
     Loop up to 10 retries:
       - Method 1: Restore if minimized (SW_RESTORE)
       - Method 2: AllowSetForegroundWindow() (Windows 10+)
       - Method 3: AttachThreadInput() + SetForegroundWindow()
       - Method 4: BringWindowToTop() + ShowWindow() + SetWindowPos()
       - Verify: GetForegroundWindow() == target hwnd
       - If not active: wait 500ms, retry
     ↓
     If still not active after 10 retries:
       - Get window rectangle
       - Calculate center coordinates
       - Click window center (SetCursorPos + mouse_event)
       - Verify activation
  ↓
  c. Final Verification
     - Double-check: GetForegroundWindow() == target hwnd
     - Only proceed if window is confirmed active
  ↓
  d. Send Keyboard Input
     - Ctrl+L (open chat)
     - Type: @relative/path/to/prompt.md
     - Enter (load prompt)
```

### 4. Agent Execution

```
Agent receives prompt
  ↓
  - Loads context from prompt file
  - Reads todo_progress.json
  - Selects available task
  - Implements task
  - Verifies work
  - Commits changes
  - Updates todo_progress.json
  - Moves to next task (autonomous loop)
```

## Key Features

### ✅ Window Activation Methods

1. **AllowSetForegroundWindow()** - Required for Windows 10+
2. **AttachThreadInput()** - Aggressive focus stealing
3. **SetForegroundWindow()** - Standard activation
4. **BringWindowToTop()** - Z-order manipulation
5. **ShowWindow() + SetWindowPos()** - Window positioning
6. **Click Fallback** - Clicks window center if all else fails

### ✅ Verification & Safety

- **Verification Loop**: Checks `GetForegroundWindow()` after each activation attempt
- **Final Check**: Confirms window is active before sending keys
- **Error Handling**: Falls back to manual instructions if activation fails
- **Multiple Windows**: Handles multiple Cursor windows (uses most recent)

### ✅ Automation Levels

1. **Fully Automated** (Windows):
   - Window opens automatically
   - Window activates automatically
   - Prompt loads automatically
   - Agent starts working automatically

2. **Semi-Automated** (macOS/Linux):
   - Window opens automatically
   - Manual prompt loading required (Cursor CLI limitations)

## Error Handling

### Window Activation Fails

If window activation fails after all retries:

```
⚠️  WARNING: Could not activate Cursor window!
   Manual loading required:
   1. Click on the Cursor window (PID: XXXX) to activate it
   2. Press Ctrl+L to open chat
   3. Type: @relative/path/to/prompt.md
   4. Press Enter
```

### PowerShell Script Fails

If PowerShell script fails:

```
⚠️  Automatic prompt injection failed: [error]
📋 Manual loading (fallback):
   1. Click on the Cursor window to activate it
   2. Open chat in Cursor (Ctrl+L)
   3. Type: @relative/path/to/prompt.md
   4. Press Enter to load prompt
```

### Cursor Not Found

If Cursor installation not detected:

```
❌ Cursor not found. Please install Cursor IDE first.
   Common installation paths:
   - C:\Users\...\AppData\Local\Programs\cursor\Cursor.exe
   - C:\Users\...\AppData\Roaming\cursor\Cursor.exe
```

## Timing Considerations

### Delays

1. **Window Opening**: 3 seconds after `spawn()` (line 373)
2. **Prompt Injection Delay**: 3 seconds (PowerShell script parameter)
3. **Activation Retries**: 300ms between attempts, 500ms if failed
4. **Key Sends**: 800ms after Ctrl+L, 500ms after typing, Enter immediately

### Total Time

- Window spawn: ~0.5 seconds
- Window ready: 3 seconds
- Activation (typical): 0.3-1 seconds (1-3 retries)
- Key injection: ~1.5 seconds
- **Total: ~5-6 seconds per agent**

For 3 parallel agents: ~5-6 seconds (sequential window spawning)

## Testing

### Manual Test

```bash
# Test single agent launch
node scripts/launch_claude_code.js \
  --agent-id dev-oauth-1 \
  --prompt agent_prompts/dev-oauth-1.md

# Expected output:
# ✅ Cursor window launched
# 🤖 Attempting automated prompt injection...
# ✅ Cursor window is confirmed active. Sending keyboard input...
# ✅ Prompt injection completed: @.temp/agent-dev-oauth-1-XXXXX.md
# ✅ Prompt automatically injected for dev-oauth-1
```

### Orchestrator Test

```bash
# Test orchestrator with automated injection
npm run orchestrate -- --epic epic-1 --groups A,B,C

# Expected flow:
# 1. Orchestrator loads tasks
# 2. For each task, spawns Claude Code window
# 3. Each window activates automatically
# 4. Prompts load automatically
# 5. Agents start working immediately
```

## Limitations

### Windows Security

Windows may prevent activation if:

- Another application is actively in foreground
- User is actively typing in another window
- Security policies block focus stealing
- Cursor window is blocked by modal dialog

**Solution**: Script retries 10 times with multiple methods, falls back to clicking.

### Multiple Cursor Windows

If multiple Cursor windows are open:

- Script selects most recently opened (by StartTime)
- May target wrong window if timing is off

**Solution**: Orchestrator spawns windows sequentially with delays.

### macOS/Linux

- Cursor CLI limitations prevent automated prompt injection
- Manual loading required (Ctrl+L or Cmd+L, type @path, Enter)

**Future**: Could use AppleScript (macOS) or xdotool (Linux) for automation.

## Status

✅ **COMPLETE**: Fully automated flow from orchestrator to agent execution
✅ **TESTED**: Window activation, prompt injection verified
✅ **DOCUMENTED**: Complete flow documented
⚠️ **LIMITATIONS**: Windows security may block activation in some edge cases

---

**Result**: Zero manual intervention required for Windows. Orchestrator → Agent execution is fully automated.
