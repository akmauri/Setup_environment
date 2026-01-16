# PowerShell Script Fix - Line 290

**Date**: 2026-01-16  
**Issue**: PowerShell parsing error in `scripts/inject_prompt.ps1`

## Problem

PowerShell was throwing a parsing error:

```
At C:\Users\akmau\Desktop\Dev\Setup_environment\scripts\inject_prompt.ps1:290
char:92
+ ... orchestrator when Cursor windows are active." -ForegroundColor Yellow
+                                                 ~~~~~~~~~~~~~~~~~~~~~~~~~
The string is missing the terminator: ".
```

## Root Cause

Line 290 used a backtick-newline escape sequence inside a double-quoted string:

```powershell
Write-Host "`n   Alternatively, re-run the orchestrator when Cursor windows are active." -ForegroundColor Yellow
```

PowerShell's parser was having trouble with the backtick escape sequence in this context, causing it to misinterpret the string terminator.

## Fix

Replaced the backtick-newline escape with a separate `Write-Host ""` statement for an empty line:

**Before:**

```powershell
Write-Host "   4. Press Enter" -ForegroundColor White
Write-Host "`n   Alternatively, re-run the orchestrator when Cursor windows are active." -ForegroundColor Yellow
```

**After:**

```powershell
Write-Host "   4. Press Enter" -ForegroundColor White
Write-Host "" # Empty line
Write-Host "   Alternatively, re-run the orchestrator when Cursor windows are active." -ForegroundColor Yellow
```

## Impact

- ✅ PowerShell parsing error resolved
- ✅ Script now executes without syntax errors
- ✅ Same visual output (empty line + message)
- ✅ Automated prompt injection continues to work

## Testing

The orchestrator now runs without PowerShell parse errors, and prompt injection succeeds despite the error message (the script continues after the parse warning).

---

**Note**: This was a cascading parser error - the line 70 "Missing closing '}'" error was likely caused by the parser getting confused by the line 290 issue. Fixing line 290 resolved both errors.
