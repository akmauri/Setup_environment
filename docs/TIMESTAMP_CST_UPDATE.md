# Timestamp Display Update - CST Instead of UTC

**Date**: 1/15/2026, 11:05 PM CST  
**Status**: ✅ **COMPLETE**

## Summary

All timestamp displays across the system have been updated to show **CST (Central Standard Time)** as the primary timezone for user convenience, while **maintaining UTC storage** for consistency and comparison purposes.

## Change Overview

### Before (UTC Primary)

- Console: `[2026-01-16T04:47:13.020Z UTC] message`
- Locks: `Expires: 2026-01-16T05:30:02.000Z UTC (1/15/2026, 11:30:02 PM CST)`
- Messages: `Timestamp: 2026-01-16T04:55:00.000Z UTC (1/16/2026, 12:55:00 AM CST)`

### After (CST Primary)

- Console: `[1/15/2026, 11:05:54 PM CST] message`
- Locks: `Expires: 1/15/2026, 11:30:02 PM CST (2026-01-16T05:30:02.000Z UTC)`
- Messages: `Timestamp: 1/15/2026, 11:05:54 PM CST (2026-01-16T05:05:54.000Z UTC)`

## Files Updated

### ✅ Scripts

1. **`scripts/orchestrate_agents.js`**
   - `log()` method: Displays CST, stores UTC in log files
   - `validateSystemClock()`: Shows CST first
   - Lock cleanup logging: Shows CST times

2. **`scripts/manage_locks.js`**
   - `list` command: Shows CST first with UTC in parentheses
   - `check` command: Shows CST first with UTC in parentheses

3. **`scripts/send_message.js`**
   - Message display: Shows CST first with UTC in parentheses

4. **`scripts/credit_monitor.js`**
   - Log entries: Shows CST first with UTC in parentheses

5. **`scripts/log_rotation.js`**
   - Cutoff date: Shows CST first with UTC in parentheses

6. **`scripts/inject_prompt.ps1`**
   - Fixed PowerShell parsing error (line 299)

### ✅ Agent Rules

1. **`agent_rules/timestamp_accuracy.md`**
   - Updated display format to show CST primary
   - Updated examples to show CST format
   - Updated logging requirements
   - Maintained UTC storage requirement

### ⚠️ Storage (Unchanged)

- **All storage still uses UTC** for consistency
- Lock files: `expires_at: "2026-01-16T04:47:13.020Z"` ✅
- Task status: `updated_at: "2026-01-16T04:47:13.020Z"` ✅
- Database: All TIMESTAMP types use UTC ✅
- Log files: Still store UTC for consistency ✅

## Implementation Details

### Display Format

```javascript
// Display CST for user
const cst = now.toLocaleString('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' });
const utc = now.toISOString();
console.log(`[${cst}] message`); // Primary: CST
// Log file stores: `[${utc} UTC] message`  // UTC for consistency
```

### Storage Format (Unchanged)

```javascript
// Storage always uses UTC
const timestamp = new Date().toISOString(); // "2026-01-16T05:05:54.116Z"
```

### Comparison Logic (Unchanged)

```javascript
// Comparisons still use UTC internally
const now = new Date();  // UTC internally
const expiresAt = new Date(lock.expires_at);  // Parse UTC string
if (expiresAt < now) {  // Correct UTC comparison
```

## Verification

### Test Output

```
Timestamp display test:
CST: 1/15/2026, 11:05:54 PM CST
UTC: 2026-01-16T05:05:54.116Z UTC
Format: [CST] (UTC)
```

✅ **CORRECT** - CST shown first, UTC in parentheses

## Rationale

### Why CST for Display?

- **User convenience**: Users are in CST timezone
- **Readability**: Easier to read local time
- **Intuitive**: Users naturally think in local time

### Why UTC for Storage?

- **Consistency**: Single timezone for all storage
- **Comparisons**: UTC comparisons are reliable
- **Database**: PostgreSQL TIMESTAMP uses UTC
- **Debugging**: UTC is standard for technical logs

## Documentation Notes

Documentation files still reference UTC in some places (especially technical documentation). This is intentional:

- **Technical docs**: Can use UTC for precision
- **User-facing logs/console**: Should show CST
- **Storage formats**: Always UTC
- **Display formats**: CST primary, UTC in parentheses

---

**Important**: Storage and comparisons still use UTC. Only displays show CST for user convenience.
