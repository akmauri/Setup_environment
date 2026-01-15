# Quick Cursor CLI Installation Guide

**Problem**: The automated install script doesn't work with Git Bash on Windows (MINGW64 not recognized).

## Solution: Manual Installation Options

### Option 1: Check if Already Installed with Cursor IDE

The CLI might already be bundled with Cursor IDE:

1. **Open Cursor IDE**
2. **Press Ctrl+Shift+P** to open Command Palette
3. **Search for**: "Cursor CLI" or "Install CLI"
4. **Follow any prompts**

### Option 2: Use WSL (Windows Subsystem for Linux)

If you have WSL installed:

```bash
# Open WSL
wsl

# Install
curl https://cursor.com/install -fsS | bash

# Verify
cursor-agent --version
```

### Option 3: Download Windows Installer

1. **Visit**: https://www.cursor.so/download
2. **Look for**: Windows CLI installer or standalone CLI
3. **Download and install**
4. **Verify**: `cursor-agent --version`

### Option 4: Continue with Single-Session Orchestration

**This works perfectly fine!** The orchestrator is ready for when CLI is installed, but single-session orchestration is working well for now.

## Quick Test

Once installed, test with:

```powershell
# Verify CLI
cursor-agent --version

# Test orchestrator
npm run orchestrate -- --epic epic-1 --groups A,B
```

## Recommendation

**For now**: Continue using **single-session orchestration** - it's working great!

**Later**: Install CLI when you need true parallel execution for very large epics.
