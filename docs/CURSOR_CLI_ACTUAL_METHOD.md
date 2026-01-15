# Cursor CLI Installation - The Actual Method

**Date**: 2026-01-14  
**Discovered**: Cursor has a different CLI installation method

## The Correct Command

Based on Cursor documentation, the CLI is installed via:

### In Cursor IDE Command Palette:

1. **Press `Ctrl+Shift+P`**
2. **Type**: `Shell Command`
3. **Select**: `Shell Command: Install 'cursor' command in PATH`

This installs the `cursor` command (not `cursor-agent`).

## Important: Command Name Difference

- ❌ **Not**: `cursor-agent` (this is what our orchestrator is looking for)
- ✅ **Actually**: `cursor` (this is what Cursor installs)

## After Installation

Verify with:

```powershell
cursor --version
```

## Update Orchestrator

We may need to update the orchestrator to use `cursor` instead of `cursor-agent`, or check if `cursor-agent` is an alias/subcommand of `cursor`.

## Check After Installing

1. Install via Command Palette (see above)
2. Verify: `cursor --version`
3. Check available commands: `cursor --help`
4. See if agent commands exist: `cursor agent --help` or similar

## Next Steps

1. **Install via Command Palette** using the method above
2. **Check what commands are available** (`cursor --help`)
3. **Update orchestrator** if needed to use correct command name
4. **Test orchestrator** once CLI is installed

---

**Note**: The orchestrator currently looks for `cursor-agent`, but Cursor may install `cursor` with agent subcommands.
