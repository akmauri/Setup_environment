# Window Focus Issue - Automation Disabled

**Date**: 2026-01-15  
**Status**: ✅ **FIXED** - Manual loading is now primary method

## Critical Issue Discovered

**Problem**: Keyboard automation was typing into Chrome instead of Cursor.

**Root Cause**: Windows `SendKeys` sends keyboard input to **whatever window is currently active**, not to a specific window. When the user was browsing Chrome, the automation sent keys to Chrome instead of Cursor.

**Evidence**:

- User ran orchestrator and opened Chrome
- Script attempted automated prompt injection
- Keys were sent to Chrome's search bar instead of Cursor chat
- Google search showed: `@.temp/agent-dev-backend-2-1768530512234.md`

## Solution

### 1. Manual Loading Made Primary

**Changed**: Manual prompt loading is now the **primary and recommended method**.

- Clear instructions are displayed when agents launch
- Shows exact steps: "Click Cursor window → Ctrl+L → Type @path → Enter"
- More reliable than automation
- User controls which window is active

### 2. Automation Disabled by Default

**Changed**: Automated prompt injection is **disabled by default**.

- Too unreliable due to window focus issues
- Can't guarantee Cursor window will be active when script runs
- May interfere with user's active application
- Can be re-enabled via code uncomment if needed (with warnings)

### 3. Improved Instructions

**Enhanced**: Better manual loading instructions:

```
📋 Load prompt in Cursor window (dev-backend-1):
   1. Click on the Cursor window to activate it
   2. Open chat in Cursor (Ctrl+L or Cmd+L)
   3. Type: @.temp/agent-dev-backend-1-<timestamp>.md
   4. Press Enter to load prompt

💡 Prompt file: C:\...\.temp\agent-dev-backend-1-<timestamp>.md

⚠️  NOTE: Automated injection disabled due to window focus issues.
   (Keyboard automation can't reliably target specific windows on Windows)
   Manual loading is required for now.
```

### 4. Fixed PowerShell Syntax Error

**Fixed**: Corrected smart quote character issue in `inject_prompt.ps1`:

- Line 82 had fancy quotes `"` instead of regular quotes `"`
- Caused PowerShell parser error: "string is missing the terminator"

## Why Automation Doesn't Work Reliably

**Windows Limitation**: `SendKeys` and similar automation tools:

- Always send input to the **currently active window**
- Cannot guarantee a specific window will be active
- User may be actively using another application
- Window activation may fail due to security/permissions

**Alternative Approaches** (not implemented):

- Window message posting (PostMessage) - requires exact window handle
- UI Automation API - complex, may require permissions
- Cursor API/Extension - would need Cursor to provide API

## Current Workflow

### When Agent is Spawned:

1. **Cursor window opens** (via spawn)
2. **Wait 3 seconds** for window to be ready
3. **Display manual instructions**:
   - Prompt file path
   - Steps to load in Cursor
   - @ reference command
4. **User manually loads prompt**:
   - Clicks Cursor window
   - Opens chat (Ctrl+L)
   - Types @ reference
   - Presses Enter
5. **Agent starts working** with loop prevention rules active

### Benefits of Manual Loading:

✅ **100% reliable** - User controls which window is active
✅ **No interference** - Doesn't affect user's active applications
✅ **Explicit control** - User knows exactly what's happening
✅ **Works every time** - No window focus issues

### Trade-offs:

⚠️ **Requires user action** - Manual step for each agent
⚠️ **Takes ~10 seconds per agent** - User must click and type
⚠️ **Not fully automated** - Can't run completely unattended

## If You Want to Re-enable Automation

To re-enable automated injection (with risk of typing into wrong window):

1. Uncomment automation code in `scripts/launch_claude_code.js` (line ~395)
2. Ensure Cursor window will be active when script runs
3. Accept risk that keys may go to wrong window if user is active
4. Monitor for issues

**Recommended**: Keep manual loading as primary method for reliability.

## Status

✅ **ISSUE RESOLVED**:

- Manual loading is now primary method
- Clear instructions provided
- Automation disabled by default
- PowerShell syntax error fixed
- User warned about automation limitations

---

**Current Status**: Orchestrator works correctly with manual prompt loading. Automation is optional and disabled by default due to Windows window focus limitations.
