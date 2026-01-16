# Stale Lock Issue - Root Cause and Fix

**Date**: 2026-01-16  
**Status**: ✅ **FIXED** - Automatic cleanup implemented

## Problem

Tasks were stuck with "cannot start: locked" messages, preventing the orchestrator from processing work. This occurred even though no agents were actively working on those tasks.

## Root Cause

### How It Happened

1. **Orchestrator/Agent Crash**: When the orchestrator or an agent process crashes or is terminated (Ctrl+C, system restart, etc.), lock files remain in `.lock/` directory.

2. **Stale Locks**: Lock files have a 2-hour expiration, but if the orchestrator is restarted within that window, expired locks weren't proactively cleaned up.

3. **Reactive Cleanup Only**: The orchestrator only checked lock expiration when trying to start a **specific task**. It didn't clean up **all expired locks** on startup.

4. **Result**: Tasks appeared locked even though no agents were working on them, blocking the entire queue.

### Example Scenario

```
1. Orchestrator starts, spawns agent for task-36
2. Agent creates lock: .lock/task-36.lock (expires in 2 hours)
3. User stops orchestrator (Ctrl+C) before task completes
4. Lock file remains: .lock/task-36.lock (still valid for ~1.5 hours)
5. Orchestrator restarts, tries to start task-36
6. lockExists() checks task-36.lock → finds it → says "locked"
7. Task-36 cannot start, blocks queue
```

## Solution Implemented

### 1. Automatic Cleanup on Startup

**File**: `scripts/orchestrate_agents.js`

**Change**: Added `cleanupExpiredLocks()` method that runs automatically when orchestrator starts:

```javascript
async start() {
  await this.initialize();

  // Cleanup expired locks on startup to prevent stale locks from blocking tasks
  await this.cleanupExpiredLocks();

  this.log('Starting orchestration', ...);
}
```

**What it does**:

- Scans all `.lock/*.lock` files on startup
- Removes any locks that have expired (`expires_at < now`)
- Removes any invalid/corrupted lock files
- Logs how many locks were cleaned up

### 2. Existing Reactive Cleanup (Kept)

The existing `lockExists()` method still removes expired locks when checking a specific task:

```javascript
async lockExists(lockFile) {
  // Check if expired
  const expiresAt = new Date(lockContent.expires_at);
  if (expiresAt < new Date()) {
    await fs.unlink(lockFile);  // Remove expired lock
    return false;
  }
  return true;
}
```

This provides **defense in depth** - proactive cleanup on startup + reactive cleanup when needed.

## Prevention

### Automatic Prevention

✅ **Orchestrator startup cleanup**: Expired locks automatically removed when orchestrator starts  
✅ **Reactive cleanup**: Expired locks removed when checking specific tasks  
✅ **Lock expiration**: Locks automatically expire after 2 hours

### Manual Cleanup (If Needed)

If locks still cause issues (e.g., system crash during 2-hour window):

```bash
# Check locks
node scripts/manage_locks.js list

# Remove expired locks only
node scripts/manage_locks.js cleanup

# Force remove ALL locks (use with caution)
node scripts/manage_locks.js cleanup --force
```

## Testing

To verify the fix works:

1. **Create a test lock**:

   ```bash
   echo '{"task_id":"test-task","agent_id":"test-agent","locked_at":"2026-01-01T00:00:00Z","expires_at":"2026-01-01T00:00:00Z","reason":"test"}' > .lock/test-task.lock
   ```

2. **Start orchestrator**:

   ```bash
   npm run orchestrate -- --epic epic-1 --groups A,B,C
   ```

3. **Check logs**: Should see `Cleaned up 1 expired lock file(s) on startup`

4. **Verify**: `test-task.lock` should be removed

## Impact

✅ **Prevents stale locks**: Expired locks cleaned up automatically  
✅ **No manual intervention**: Fix happens automatically on startup  
✅ **Defense in depth**: Multiple layers of lock cleanup  
✅ **No breaking changes**: Existing behavior preserved, just added proactive cleanup

## Related Documentation

- `docs/ORCHESTRATOR_FIXED.md` - Initial fix documentation
- `scripts/manage_locks.js` - Manual lock management utility
- `agent_rules/parallel_coordination.md` - Lock mechanism documentation

---

**Result**: Stale locks are now automatically cleaned up on orchestrator startup, preventing tasks from getting stuck with "locked" errors.
