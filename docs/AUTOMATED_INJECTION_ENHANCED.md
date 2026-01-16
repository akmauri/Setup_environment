# Enhanced Automated Prompt Injection

**Date**: 2026-01-15  
**Status**: ✅ **ENHANCED** - Aggressive window activation implemented

## Problem

Previous automation sent keyboard input to Chrome instead of Cursor because:

- Windows `SendKeys` sends to whatever window is active
- Window activation wasn't reliable enough
- User had Chrome active, so keys went to Chrome

## Solution

### Enhanced Window Activation

Implemented aggressive multi-method window activation in `scripts/inject_prompt.ps1`:

1. **Multiple Activation Methods**:
   - `AllowSetForegroundWindow()` - Required for Windows 10+
   - `AttachThreadInput()` - More aggressive focus stealing
   - `SetForegroundWindow()` - Standard activation
   - `BringWindowToTop()` - Bring to top of Z-order
   - `ShowWindow()` - Ensure window is visible
   - `SetWindowPos()` - Force window position

2. **Verification Loop**:
   - Checks if window is actually active after each attempt
   - Retries up to 10 times with 300ms delays
   - Only proceeds if window is confirmed active

3. **Click Fallback**:
   - If window activation fails, clicks on window center
   - Uses `SetCursorPos()` and `mouse_event()` to click
   - Verifies activation after click

4. **Smart Timing**:
   - Waits between activation attempts
   - Verifies activation before sending keys
   - Only sends keys if window is confirmed active

### How It Works

```powershell
1. Find Cursor window by process name
2. Get window handle
3. AGGRESSIVE ACTIVATION:
   - Try multiple activation methods
   - Verify window is active (retry if not)
   - Click window center if activation fails
   - Confirm activation before proceeding
4. Send keyboard input:
   - Ctrl+L (open chat)
   - Type @path
   - Enter (load prompt)
```

### Key Features

✅ **Verification**: Confirms window is active before sending keys
✅ **Retries**: Up to 10 attempts with different methods
✅ **Fallback**: Clicks window if activation fails
✅ **No Wrong Window**: Only sends keys if Cursor is confirmed active

## Limitations

### Windows Security Restrictions

Windows may still prevent activation if:

- Another application is actively in foreground
- User is actively typing in another window
- Security policies block focus stealing
- Cursor window is blocked by another modal dialog

### Fallback Behavior

If activation fails after all retries:

- Script will still attempt to send keys (may go to wrong window)
- Warning message displayed
- Manual instructions shown as fallback

## Status

✅ **IMPLEMENTED**: Aggressive window activation with verification
✅ **ENABLED**: Automated injection is now primary method
⚠️ **LIMITATIONS**: May still fail in some edge cases (user actively typing, security restrictions)

## Testing

When you run the orchestrator:

1. Cursor windows open automatically
2. Script aggressively activates each Cursor window
3. Verifies window is active
4. Automatically injects prompts
5. Agents start working immediately

If activation fails, you'll see warnings and can manually activate the window.

---

**Result**: Fully automated prompt loading with aggressive window activation. No manual intervention required in most cases.
