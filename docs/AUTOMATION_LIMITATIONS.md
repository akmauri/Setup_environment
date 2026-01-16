# Automation Limitations - Manual Loading Required

**Date**: 2026-01-15  
**Status**: ✅ **RESOLVED** - Manual loading is primary method

## Why Automated Prompt Injection Doesn't Work

### The Problem

When we tried automated prompt injection using Windows `SendKeys`, the keyboard input went to **Chrome** instead of **Cursor**. This happened because:

1. **Windows SendKeys limitation**: `SendKeys.SendWait()` sends keyboard input to **whatever window is currently active**, not to a specific window
2. **User was browsing Chrome**: While the orchestrator was running, the user had Chrome open and active
3. **Automation couldn't force focus**: Even with `SetForegroundWindow()`, Windows may prevent forcing focus if user is actively using another window
4. **Result**: Keys were sent to Chrome's search bar instead of Cursor's chat

### Evidence

- User ran orchestrator and opened Chrome
- Script attempted automated injection
- Chrome search bar received: `@.temp/agent-dev-backend-2-1768530512234.md`
- Google search executed instead of Cursor prompt loading

## Why Window Activation Fails

### Windows Security

Windows prevents applications from:

- Forcibly stealing focus from the active window
- Interrupting user input
- Taking control of keyboard/mouse

### Technical Limitations

1. **SetForegroundWindow restrictions**:
   - Only works if process has permission
   - May be blocked by Windows if user is active in another window
   - Doesn't guarantee window will remain active

2. **SendKeys behavior**:
   - Always sends to currently active window
   - Can't target a specific window handle
   - No way to send "only to Cursor"

3. **Timing issues**:
   - Window activation may not complete before SendKeys runs
   - User may switch windows during automation
   - Multiple Cursor windows may confuse which one to target

## Solution: Manual Loading

### Why Manual Loading is Better

✅ **100% Reliable**: User controls which window is active
✅ **No Interference**: Doesn't affect user's active applications  
✅ **Explicit Control**: User knows exactly what's happening
✅ **Works Every Time**: No window focus issues
✅ **Simple**: Just click, type, enter

### Manual Loading Steps

For each agent window:

1. **Click on Cursor window** to activate it
2. **Open chat** (Ctrl+L or Cmd+L)
3. **Type**: `@.temp/agent-<agentId>-<timestamp>.md`
4. **Press Enter** to load prompt

**Time**: ~10 seconds per agent window

## Current Implementation

### Orchestrator Behavior

1. **Launches Cursor windows** (automatically)
2. **Displays clear instructions** (for each agent):

   ```
   📋 Load prompt in Cursor window (dev-backend-1):
      1. Click on the Cursor window to activate it
      2. Open chat in Cursor (Ctrl+L or Cmd+L)
      3. Type: @.temp/agent-dev-backend-1-<timestamp>.md
      4. Press Enter to load prompt

   💡 Prompt file: C:\...\.temp\agent-dev-backend-1-<timestamp>.md
   ```

3. **Waits for user** to manually load prompts
4. **Monitors progress** via `todo_progress.json`

### Automation Status

- ✅ **Disabled by default** (too unreliable)
- ⚠️ **Can be re-enabled** (but will have same issues)
- 📝 **Code exists** (commented out in `launch_claude_code.js`)

## Alternative Approaches (Not Implemented)

### 1. Cursor API/Extension

**Ideal solution** (if available):

- Cursor provides API for prompt injection
- Can target specific window
- Doesn't use keyboard automation

**Status**: Research needed - may not exist

### 2. UI Automation API

**Complex solution**:

- Windows UI Automation framework
- Can target specific window controls
- Requires permissions
- Complex implementation

**Status**: Possible but complex

### 3. PostMessage API

**Low-level solution**:

- Send Windows messages directly to Cursor window
- Requires exact window handle and message format
- May not work with Cursor's chat interface

**Status**: Research needed

## Recommendation

**Keep manual loading as primary method**:

- Most reliable
- User has explicit control
- No automation issues
- Simple and predictable

**Future improvement**: If Cursor provides an API for prompt injection, use that instead of keyboard automation.

## Status

✅ **RESOLVED**: Manual loading is primary method, automation disabled.

---

**Bottom Line**: Manual loading takes ~10 seconds per agent but is 100% reliable. Automation saves time but is too unreliable on Windows due to window focus limitations.
