# Cursor CLI Authentication

**Last Updated**: 2026-01-16  
**Status**: ⚠️ **AUTHENTICATION REQUIRED**

## Current Status

✅ **Working**:

- Cursor CLI is installed and detected: `wsl -d Ubuntu ~/.local/bin/agent`
- Orchestrator successfully finds and launches agents
- Ctrl+C shutdown is working properly
- Agent spawning via WSL is functional

❌ **Issue**:

- Agents require authentication before they can execute tasks
- Error: `"Authentication required. Please run 'agent login' first, or set CURSOR_API_KEY environment variable"`

## Authentication Options

### Option 1: Login via WSL (Recommended)

Run the login command in WSL:

```bash
wsl -d Ubuntu ~/.local/bin/agent login
```

This will:

- Open a browser for authentication
- Save credentials in WSL
- Allow agents to run authenticated commands

**Verify authentication**:

```bash
wsl -d Ubuntu ~/.local/bin/agent --version
# Should work without authentication errors
```

### Option 2: Set CURSOR_API_KEY Environment Variable

If you have a Cursor API key, set it in WSL:

```bash
# In WSL
export CURSOR_API_KEY="your-api-key-here"
echo 'export CURSOR_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

**Note**: Get API key from Cursor settings or account dashboard.

### Option 3: Use Claude Code Windows Instead

Instead of CLI agents, use Claude Code windows (which don't require CLI authentication):

1. Ensure `scripts/launch_claude_code.js` is working
2. The orchestrator will automatically use Claude Code windows if available
3. Claude Code windows use Cursor IDE authentication (already logged in)

**Current issue**: `"Claude Code launcher not available"` - this needs to be fixed.

## Why Authentication is Needed

The Cursor CLI `agent` command requires authentication to:

- Execute prompts and commands
- Access Cursor's API services
- Ensure secure agent execution

This is a security feature to prevent unauthorized use of Cursor's services.

## Next Steps

1. **Quick Fix**: Login once in WSL:

   ```bash
   wsl -d Ubuntu ~/.local/bin/agent login
   ```

2. **Verify**: Test that agents can run authenticated:

   ```bash
   wsl -d Ubuntu ~/.local/bin/agent -p "test prompt"
   ```

3. **Or**: Fix Claude Code launcher to avoid CLI authentication entirely

## Related Files

- `scripts/orchestrate_agents.js` - Orchestrator that spawns agents
- `scripts/launch_claude_code.js` - Claude Code window launcher (alternative to CLI)
- `docs/CURSOR_CLI_INSTALL_WINDOWS.md` - CLI installation docs
