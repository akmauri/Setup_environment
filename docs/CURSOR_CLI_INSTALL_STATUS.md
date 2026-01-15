# Cursor CLI Installation Status

**Date**: 2026-01-14  
**Status**: ⚠️ Manual Installation Required

## Issue

The automated installation script (`curl https://cursor.com/install -fsS | bash`) does not recognize Git Bash's MINGW64 environment as a supported OS.

**Error**: `Unsupported operating system: MINGW64_NT-10.0-26200`

## Solutions

### Option 1: Check if Cursor CLI is Already Installed

Cursor CLI might be installed with Cursor IDE. Check:

```powershell
# Check common locations
Get-ChildItem "$env:LOCALAPPDATA\Programs\cursor" -Recurse -Filter "cursor-agent*" -ErrorAction SilentlyContinue
Get-ChildItem "$env:USERPROFILE\.cursor" -Recurse -Filter "cursor-agent*" -ErrorAction SilentlyContinue
Get-ChildItem "$env:ProgramFiles\Cursor" -Recurse -Filter "cursor-agent*" -ErrorAction SilentlyContinue

# Check if in PATH
Get-Command cursor-agent -ErrorAction SilentlyContinue
```

### Option 2: Manual Installation via Cursor IDE

1. **Open Cursor IDE**
2. **Check if CLI is available**: Open Command Palette (Ctrl+Shift+P)
3. **Search for "Cursor CLI"** or **"Install CLI"**
4. **Follow on-screen instructions**

### Option 3: Download Windows Installer

1. **Visit**: https://www.cursor.so/download
2. **Look for**: Windows CLI installer or standalone CLI download
3. **Download and install** the Windows-specific installer
4. **Add to PATH** if not automatically added

### Option 4: Use WSL (Windows Subsystem for Linux)

If you have WSL installed:

```bash
# In WSL terminal
curl https://cursor.com/install -fsS | bash
cursor-agent --version
```

### Option 5: Alternative Approach - Manual Agent Coordination

If Cursor CLI installation is problematic, you can use manual coordination:

1. **Use Single-Session Orchestration** (current working approach)
2. **Manually open multiple Cursor windows** for true parallelism
3. **Use lock files** for coordination (`.lock/[task_id].lock`)
4. **Follow coordination rules** in `agent_rules/parallel_coordination.md`

## Current Recommendation

**For now**: Continue using **single-session orchestration** which is working well. The orchestrator script is ready for when Cursor CLI is installed.

**When Cursor CLI is installed**: The orchestrator will automatically work with true multi-agent execution.

## Next Steps

1. **Check if CLI is already installed** (Option 1 above)
2. **Try manual installation** (Option 2 or 3)
3. **If successful**: Test orchestrator with `npm run orchestrate -- --epic epic-1 --groups A,B`
4. **If not successful**: Continue with single-session orchestration (current approach works fine)

## Verification

Once installed, verify with:

```powershell
cursor-agent --version
```

If this works, you're ready to use the multi-agent orchestrator!

---

**Status**: Installation guide updated  
**Action**: Try manual installation methods or continue with single-session orchestration
