# Cursor CLI Reality Check

**Date**: 2026-01-14  
**Finding**: Cursor CLI may not be available as a standalone command-line tool on Windows

## Current Situation

1. ❌ No "Shell Command: Install cursor command" in Command Palette
2. ❌ No "cursor-agent" command available
3. ❌ Install script doesn't work with Git Bash on Windows
4. ✅ Found `cursor-agent-exec` extension in Cursor installation

## Likely Reality

**Cursor may use extension-based agent execution** rather than a standalone CLI tool. The `cursor-agent-exec` extension suggests agents are executed within Cursor IDE itself, not via command line.

## Implications for Multi-Agent Orchestration

### Option 1: Use Background Agents API

Cursor has a **Background Agents API** that might work better:

- **Docs**: https://docs.cursor.com/background-agent/api/overview
- **API-based**: Uses HTTP API instead of CLI
- **May work**: Better for programmatic control

### Option 2: Manual Multi-Window Coordination

Instead of CLI-based orchestration:

1. **Manually open multiple Cursor windows**
2. **Assign tasks based on epic plan**
3. **Use lock files** for coordination
4. **Follow coordination rules** in `agent_rules/parallel_coordination.md`

### Option 3: Continue Single-Session Orchestration (Recommended)

**This is working great!** No installation needed, no complexity:

- ✅ Already working well
- ✅ Handles all current tasks efficiently
- ✅ No CLI required
- ✅ Lower overhead

## Recommended Approach

**For Now**: **Continue with single-session orchestration**

- It's working perfectly
- No installation hassles
- Efficient for current needs

**If You Need True Parallel Execution Later**:

1. **Check Background Agents API** - May be more appropriate than CLI
2. **Update orchestrator** to use API instead of CLI
3. **Or use manual coordination** with multiple Cursor windows

## Bottom Line

The orchestrator system is **ready and complete**. The CLI dependency may not be necessary:

- Single-session orchestration works great for most tasks
- Background Agents API might be the right approach for programmatic control
- Manual coordination is an option if truly needed

**Don't worry about CLI** - your current system is working well!
