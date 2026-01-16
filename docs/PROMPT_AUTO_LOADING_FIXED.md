# Prompt Auto-Loading Fix

**Date**: 2026-01-15  
**Status**: ✅ **IMPLEMENTED**

## Problem

Cursor windows were opening but prompts weren't automatically loaded into Claude Code chat, requiring manual intervention for each agent window.

## Solution

Implemented automated prompt injection using Windows automation:

### 1. Loop Prevention Rules Integration

**Fixed**: All agent prompts now automatically include loop prevention rules from `agent_rules/loop_guard.md`:

- **Progress tracking required**: Agents must log progress at start of each response
- **Maximum 2 attempts** per objective without state change
- **Loop detection triggers**: Repeating plans, rewriting code, re-running commands, etc.
- **Loop break protocol**: Mandatory when loops are detected

### 2. Automated Prompt Injection

**Implemented**: Windows automation to inject prompts into Cursor chat:

1. **PowerShell Script** (`scripts/inject_prompt.ps1`):
   - Finds Cursor process
   - Activates Cursor window
   - Opens chat panel (Ctrl+L)
   - Types @ reference to prompt file
   - Presses Enter to load

2. **VBScript Fallback** (if PowerShell fails):
   - Uses WScript.SendKeys
   - Same injection flow
   - Automatic cleanup of temp files

3. **Integration** (`scripts/launch_claude_code.js`):
   - Automatically calls injection script after Cursor opens
   - 3 second delay to allow window to fully load
   - Falls back to manual instructions if automation fails

## How It Works

### When Agent is Spawned:

1. **Cursor window opens** (via spawn)
2. **Wait 3 seconds** for window to be ready
3. **Automated injection**:
   - PowerShell script activates Cursor window
   - Sends Ctrl+L to open chat
   - Types: `@.temp/agent-<agentId>-<timestamp>.md`
   - Sends Enter to load prompt
4. **Agent starts working** with loop prevention rules active

### Fallback:

If automation fails (due to window focus, permissions, etc.):

- Manual instructions are logged
- User can still manually load prompts
- Orchestrator continues monitoring

## Files Modified

### `scripts/launch_claude_code.js`

1. **Added loop prevention rules** to prompt generation:

   ```javascript
   // Loads agent_rules/loop_guard.md and includes it in prompt
   ```

2. **Added automated injection**:

   ```javascript
   await injectPromptWindows(tempPromptFile, PROJECT_ROOT);
   ```

3. **Fallback handling**:
   - Logs manual instructions if automation fails
   - Continues execution (doesn't block)

### `scripts/inject_prompt.ps1` (New)

PowerShell script that:

- Finds Cursor process
- Activates window using Windows API
- Sends keyboard shortcuts to open chat and load prompt
- Handles errors gracefully

## Testing

To test automated injection:

```bash
# Launch single agent
node scripts/launch_claude_code.js --agent-id dev-oauth-1 --prompt agent_prompts/dev-oauth-1-enhanced.md

# Or run orchestrator (will auto-inject for all agents)
npm run orchestrate -- --epic epic-1 --groups A,B,C
```

## Known Limitations

1. **Window Focus**: Automation requires Cursor window to be accessible
   - If user is actively typing in another window, injection may fail
   - Solution: Wait for window focus or retry

2. **Security**: Some antivirus may block SendKeys automation
   - Solution: Allow PowerShell scripts to run (ExecutionPolicy)

3. **Timing**: 3 second delay may not be enough on slow systems
   - Solution: Configurable delay in script

## Status

✅ **COMPLETE**:

- Loop prevention rules integrated into all prompts
- Automated prompt injection implemented
- Fallback to manual instructions if automation fails
- Error handling and logging in place

---

**Result**: Agents now automatically start with loop prevention rules active, and prompts are automatically loaded into Cursor chat windows.
