# Cursor CLI Installation for Windows

**Date**: 2026-01-14  
**Purpose**: Guide for installing Cursor CLI on Windows to enable multi-agent orchestration

## Prerequisites

- Windows 10/11
- PowerShell (comes with Windows)
- Git for Windows (optional, for bash script execution)

## Installation Methods

### Method 1: Using Git Bash (Recommended)

If you have Git for Windows installed, you can use Git Bash to run the installation script:

1. **Open Git Bash** (not PowerShell)
2. **Run the installation script**:
   ```bash
   curl https://cursor.com/install -fsS | bash
   ```
3. **Verify installation**:
   ```bash
   cursor-agent --version
   ```

### Method 2: Using WSL (Windows Subsystem for Linux)

If you have WSL installed:

1. **Open WSL terminal**
2. **Run the installation script**:
   ```bash
   curl https://cursor.com/install -fsS | bash
   ```
3. **Verify installation**:
   ```bash
   cursor-agent --version
   ```

### Method 3: Manual Download (If Methods 1-2 Don't Work)

1. **Visit Cursor Website**: Go to https://www.cursor.so/download
2. **Download CLI**: Look for CLI installer for Windows
3. **Run Installer**: Execute the downloaded installer
4. **Add to PATH**: Ensure `cursor-agent` is in your system PATH

### Method 4: Using Package Manager (If Available)

Check if Cursor CLI is available via:

- **Chocolatey**: `choco install cursor-cli` (if available)
- **Scoop**: `scoop install cursor-cli` (if available)
- **winget**: `winget install Cursor.CLI` (if available)

## Verification

After installation, verify in PowerShell:

```powershell
cursor-agent --version
```

If this command works, Cursor CLI is installed correctly.

## Troubleshooting

### "cursor-agent command not found"

**Issue**: The command is not in your PATH.

**Solutions**:

1. **Check installation location**: Cursor CLI is typically installed in:
   - `%LOCALAPPDATA%\Programs\cursor\bin\` or
   - `%USERPROFILE%\.cursor\bin\`

2. **Add to PATH manually**:

   ```powershell
   # Find the installation directory
   # Then add to PATH:
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\path\to\cursor\bin", "User")
   ```

3. **Restart PowerShell**: Close and reopen PowerShell after adding to PATH

### Installation Script Fails

If the bash script fails:

1. **Check prerequisites**: Ensure you have Git Bash or WSL installed
2. **Try manual download**: Use Method 3 instead
3. **Check Cursor documentation**: Visit https://docs.cursor.com for latest Windows installation instructions

### Verify Installation After PATH Update

```powershell
# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify
cursor-agent --version
```

## Next Steps

Once Cursor CLI is installed:

1. **Test the orchestrator**:

   ```powershell
   npm run orchestrate -- --epic epic-1 --groups A,B
   ```

2. **Check locks**:

   ```powershell
   npm run locks:list
   ```

3. **Run full test**:
   ```powershell
   npm run orchestrate -- --epic epic-1 --groups A,B,C
   ```

## Alternative: Manual Agent Spawning

If Cursor CLI installation is problematic, you can manually spawn agents:

1. **Open multiple Cursor windows**
2. **Assign tasks manually** based on `RALPH_WIGGUM_EPIC1_PLAN.md`
3. **Use lock files** for coordination (`.lock/[task_id].lock`)
4. **Update todo_progress.json** manually

However, the automated orchestrator provides better coordination and monitoring.

---

**Status**: Installation guide ready  
**Next**: Install Cursor CLI using one of the methods above
