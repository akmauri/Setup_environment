# Orchestrator Debugging Guide

**Date**: 2026-01-15  
**Status**: Active Debugging

## Current Issues

The orchestrator initializes and loads tasks but doesn't appear to be processing them.

## Diagnostic Steps

### 1. Check Task Queue

Run the simple test:

```bash
node scripts/test_orchestrator_simple.js
```

This shows:

- How many tasks are loaded
- Which tasks match filters
- What groups are extracted
- Which prompt files exist

### 2. Check Orchestrator Logs

```bash
Get-ChildItem logs\orchestrator -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | ForEach-Object { Get-Content $_.FullName -Tail 100 }
```

Look for:

- "Queue status" messages
- "Selected agent" messages
- "Task cannot start" messages
- "Spawning" messages
- Any error messages

### 3. Common Issues

#### Issue: No tasks match filters

**Symptom**: "WARNING: No tasks match filters"
**Fix**: Check if epic_id or groups filter is too restrictive

#### Issue: Tasks have null groups

**Symptom**: Tasks filtered out when group filter is applied
**Fix**: Group filtering now allows null groups (tasks without explicit group pass through)

#### Issue: No agent available

**Symptom**: "No available agent for task X"
**Fix**: Check if agent IDs match prompt file names

#### Issue: Prompt file not found

**Symptom**: "No prompt file found for agent X"
**Fix**: Ensure prompt files exist in `agent_prompts/` directory

#### Issue: Lock file blocking

**Symptom**: "Task cannot start: locked"
**Fix**: Clean up expired locks:

```bash
npm run locks:cleanup
```

## Test Results

From `test_orchestrator_simple.js`:

- ✅ 133 total tasks
- ✅ 18 tasks for epic-1
- ✅ 9 pending/in_progress tasks
- ✅ Groups extracted: C, A, B (some tasks have null groups)
- ✅ 7 prompt files found

## Next Steps

1. Run orchestrator with detailed logging
2. Check logs for why tasks aren't starting
3. Verify agents are being selected
4. Check if Claude Code windows are launching

---

**To debug**: Run orchestrator and check logs:

```bash
npm run orchestrate -- --epic epic-1 --groups A,B,C
# Then check the latest log file
```
