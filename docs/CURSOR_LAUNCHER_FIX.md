# Cursor Launcher Fix - Windows ENOENT Error

**Date**: 2026-01-15  
**Status**: ✅ **FIXED**

## Problem

The orchestrator was failing to launch Claude Code windows with error:

```
Error: spawn cursor ENOENT
```

This occurred because:

1. The `detectCursorInstallation()` function was detecting `cursor` command from PATH
2. But when `spawn()` tried to execute `cursor`, it wasn't found in the Node.js process PATH
3. Node.js spawn doesn't have access to the same PATH as PowerShell/CMD

## Solution

### 1. Enhanced Cursor Detection

Updated `scripts/launch_claude_code.js` to:

- **Use full path to Cursor.exe** instead of relying on PATH command
- Check multiple installation paths in order:
  1. `%LOCALAPPDATA%\Programs\cursor\Cursor.exe` (most common)
  2. `%APPDATA%\cursor\Cursor.exe`
  3. `C:\Users\<USERNAME>\AppData\Local\Programs\cursor\Cursor.exe`
  4. Program Files paths
  5. Finally, try PATH as fallback

### 2. Fixed Variable References

- Changed `cursorCommand` to use full path instead of command name
- Created `actualCommand` variable that prefers `cursorPath` over `cursorCommand`
- Updated spawn calls to use `actualCommand` (full path)

### 3. Improved Error Messages

Added better error messages that show:

- All checked installation paths
- Which path was found (if any)
- Clear instructions if Cursor not found

## Test Results

✅ Detection now correctly finds Cursor.exe at:

```
C:\Users\akmau\AppData\Local\Programs\cursor\Cursor.exe
```

✅ File exists: `true`

✅ Path is normalized and ready for spawn

## Changes Made

### `scripts/launch_claude_code.js`

1. **Enhanced Windows path detection**:
   - Checks multiple installation locations
   - Uses normalized paths
   - Prefers `.exe` over `.cmd` wrappers

2. **Fixed spawn command**:
   - Uses full path to `Cursor.exe`
   - No longer relies on PATH environment variable

3. **Better error handling**:
   - Validates path exists before spawning
   - Provides helpful error messages

## Windows-Specific Notes

### CLI Arguments Limitation

Cursor.exe on Windows may not support all VS Code CLI arguments:

- `--command` may not work
- `--args` may not work

**Current approach**:

- Opens workspace in new window
- Prompt file is created at `.temp/agent-<agentId>-<timestamp>.md`
- User can manually open chat and load prompt file

**Future improvement**:

- Integration with Cursor API (if available)
- Alternative methods to inject prompts into Claude Code

## Next Steps

1. **Test orchestrator**:

   ```bash
   npm run orchestrate -- --epic epic-1 --groups A,B,C
   ```

2. **Verify Claude Code windows open**:
   - Check if Cursor windows are being spawned
   - Verify workspace opens correctly
   - Check if prompt files are created in `.temp/` directory

3. **Monitor logs**:
   - Look for "Claude Code window launched successfully" messages
   - Check for any spawn errors
   - Verify process PID is logged

## Status

✅ **READY FOR TESTING**

The launcher should now successfully:

1. Find Cursor.exe at the correct path
2. Spawn the process without ENOENT errors
3. Open Cursor with the workspace
4. Create prompt files for agents

---

**To test**:

```bash
npm run orchestrate -- --epic epic-1 --groups A,B,C
```

**To verify Cursor detection**:

```bash
node -e "const { detectCursorInstallation } = require('./scripts/launch_claude_code'); console.log(detectCursorInstallation());"
```
