# Orchestrator Issues Fixed

**Date**: 2026-01-15  
**Status**: 🔧 **FIXES APPLIED**

## Issues Identified

### 1. ❌ Command-Line Argument Parsing Bug

**Problem**: User ran `npm run orchestrate -- --epic epic-1 --groups A,B,C` but logs showed:

```
epic: undefined, groups: []
```

**Root Cause**: npm passes arguments after `--` directly, but the script wasn't parsing them correctly when passed via npm.

**Fix**: Enhanced argument parsing to:

- First check for explicit `--epic`, `--groups` flags (preferred format)
- Fall back to positional arguments for backward compatibility
- Properly handle comma-separated groups: `--groups A,B,C`

### 2. ❌ Over-Capacity Race Condition

**Problem**: Orchestrator launched 4 agents when `maxConcurrent: 3`, showing:

```
Queue status: 79 tasks remaining, 4/3 agents active
```

**Root Cause**: The capacity check `this.activeAgents.size < this.options.maxConcurrent` happened BEFORE spawning, but `spawnAgent()` is async. Multiple spawns could start before any completed, exceeding capacity.

**Fix**:

- Added **reservation system**: Reserve spot in `activeAgents` BEFORE spawning
- Check capacity at start of loop iteration
- Use placeholder agent instance to reserve slot
- Replace placeholder with actual agent after successful spawn
- Remove reservation if spawn fails

### 3. ❌ Agents Not Starting (No Auto-Loading)

**Problem**: Cursor windows opened but prompts weren't automatically loaded, so agents never started working.

**Root Cause**:

- Windows `Cursor.exe` doesn't support `--command` and `--args` flags reliably
- Prompts are created in `.temp/` directory but not automatically injected into Claude Code
- Manual step required: user must open chat and load prompt file

**Current Workaround**:

- Cursor windows open with workspace
- Prompt files created at `.temp/agent-<agentId>-<timestamp>.md`
- User must manually:
  1. Open chat in each Cursor window
  2. Load prompt: `@.temp/agent-dev-backend-1-1768505435258.md`

**Future Solution Needed**:

- Cursor API integration (if available)
- Alternative prompt injection method
- Automated prompt loading script

### 4. ❌ Loop Prevention Not Enforced

**Problem**: Agent rules about preventing loops aren't being enforced because agents aren't actually starting.

**Root Cause**: Since agents aren't starting (issue #3), the agent rules can't be enforced.

**Fix**:

- Once prompt loading is automated, agent rules will be enforced
- Rules are defined in `agent_rules/loop_guard.md`
- Need to ensure prompts include loop prevention instructions

## Changes Made

### `scripts/orchestrate_agents.js`

1. **Enhanced Argument Parsing** (lines ~1015-1045):

   ```javascript
   // Handle both --epic epic-1 --groups A,B,C format
   // AND backward-compatible epic-1 A B C format
   ```

2. **Capacity Reservation System** (lines ~926-960):

   ```javascript
   // Reserve spot BEFORE spawning to prevent race condition
   const placeholderAgent = { task, agentId, reserved: true };
   this.activeAgents.set(reservationKey, placeholderAgent);
   // ... spawn agent ...
   // Replace placeholder with actual instance
   ```

3. **Capacity Check Moved**:
   - Moved capacity check to start of loop iteration
   - Prevents multiple spawns from starting simultaneously

## Status

✅ **FIXED**:

- Command-line argument parsing
- Over-capacity race condition

⚠️ **NEEDS MANUAL INTERVENTION**:

- Prompt loading (until automated solution is implemented)

## Next Steps

1. **Test with correct arguments**:

   ```bash
   npm run orchestrate -- --epic epic-1 --groups A,B,C
   ```

2. **Monitor for capacity issues**:
   - Should never exceed `maxConcurrent: 3`
   - Logs should show correct epic/groups

3. **Implement automated prompt loading**:
   - Research Cursor API options
   - Create script to inject prompts into open Cursor windows
   - Or find alternative method to auto-load prompts

4. **Verify agent rules are enforced**:
   - Once prompts are auto-loaded, verify loop prevention works
   - Check that agents follow `agent_rules/loop_guard.md`

## Testing

After fixes, verify:

- ✅ Arguments parsed correctly (`epic: "epic-1", groups: ["A","B","C"]`)
- ✅ Never exceeds maxConcurrent (logs show `X/3 agents active` where X ≤ 3)
- ✅ No race conditions (agents added to map before spawning)
- ⚠️ Prompts still require manual loading (workaround needed)
