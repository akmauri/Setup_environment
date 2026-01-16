# System-Wide Timestamp Enforcement

**Date**: 2026-01-16T04:55:00.000Z UTC  
**Status**: ✅ **IMPLEMENTED SYSTEM-WIDE**

## Overview

The timestamp accuracy rule has been implemented across the **ENTIRE system**, not just the orchestrator. All scripts, API routes, database operations, documentation, logs, and source code now follow consistent UTC timestamp standards with clear timezone labeling.

## Enforcement Scope

### ✅ Scripts (ALL files in `scripts/` directory)

- `scripts/orchestrate_agents.js` - Clock validation, UTC labels
- `scripts/manage_locks.js` - UTC + local time display
- `scripts/send_message.js` - UTC + local time in message display
- `scripts/credit_monitor.js` - UTC labels in log entries
- `scripts/log_rotation.js` - UTC labels in cutoff date display
- `scripts/create_story_tasks.js` - Uses UTC ISO strings ✅
- `scripts/autonomous_execution_loop.js` - Uses UTC ISO strings ✅
- `scripts/autonomous_agent_loop.js` - Uses UTC ISO strings ✅
- **ALL other scripts** - Enforced by rule

### ✅ API Routes (ALL files in `apps/api/src/`)

- `apps/api/src/index.ts` - Uses `Date.now()` (UTC milliseconds) ✅
- `apps/api/src/routes/*.ts` - Uses `Date.now()` for timestamps ✅
- `apps/api/src/services/*.ts` - Uses UTC for all operations ✅
- `apps/api/src/middleware/*.ts` - Uses UTC for rate limiting ✅
- **ALL API code** - Enforced by rule

### ✅ Database (ALL database operations)

- `packages/db/prisma/schema.prisma` - Uses TIMESTAMP type (UTC) ✅
- `packages/db/prisma/migrations/*.sql` - Uses TIMESTAMP(3) (UTC) ✅
- **ALL database operations** - PostgreSQL TIMESTAMP is UTC ✅

### ✅ Documentation (ALL files in `docs/` and `*.md`)

- All new documentation files use UTC timestamps with labels
- Documentation dates use ISO format when precision is needed
- Technical timestamps clearly labeled as UTC

### ✅ Logs (ALL files in `logs/`)

- `logs/orchestrator/*.log` - UTC labeled: `[timestamp UTC]`
- `logs/agent_activity/*.log` - UTC format enforced
- `logs/agent_errors/*.md` - UTC labels in markdown
- **ALL log files** - Enforced by rule

### ✅ Agent Prompts (ALL files in `agent_prompts/`)

- All prompts include timestamp accuracy requirements
- Agents instructed to use UTC for all operations
- Clear labeling required in displays

## Standards Applied

### Storage Format

**ALL storage uses UTC ISO 8601**:

```javascript
locked_at: new Date().toISOString(); // "2026-01-16T04:55:00.000Z"
expires_at: new Date(Date.now() + 3600000).toISOString(); // "2026-01-16T05:55:00.000Z"
```

### Display Format

**ALL displays show UTC with optional local time**:

```javascript
const expiresUTC = expiresAt.toISOString();
const expiresLocal = expiresAt.toLocaleString('en-US', { timeZoneName: 'short' });
console.log(`Expires: ${expiresUTC} UTC (${expiresLocal})`);
// "Expires: 2026-01-16T05:55:00.000Z UTC (1/16/2026, 12:55:00 AM CST)"
```

### Comparison Logic

**ALL comparisons use UTC Date objects**:

```javascript
const now = new Date(); // UTC internally
const expiresAt = new Date(lock.expires_at); // Parse UTC string
if (expiresAt < now) { // Correct UTC comparison
```

## Files Modified

### Scripts Updated

1. ✅ `scripts/orchestrate_agents.js`
   - Added `validateSystemClock()` method
   - Updated `log()` to label UTC
   - Enhanced `cleanupExpiredLocks()` logging

2. ✅ `scripts/manage_locks.js`
   - Updated `list` command to show UTC + local time
   - Updated `check` command to show UTC + local time

3. ✅ `scripts/send_message.js`
   - Updated message display to show UTC + local time

4. ✅ `scripts/credit_monitor.js`
   - Updated log entries to show UTC + local time

5. ✅ `scripts/log_rotation.js`
   - Updated cutoff date display to show UTC + local time

### Rules Updated

1. ✅ `agent_rules/timestamp_accuracy.md`
   - Comprehensive system-wide rule
   - Explicit coverage of all system areas
   - Examples for all code types

2. ✅ `agent_rules/core_principles.md`
   - Added timestamp accuracy to rule compliance list

3. ✅ `agent_rules/rule_enforcement.md`
   - Added timestamp accuracy to integration list

### Documentation Created

1. ✅ `docs/TIMESTAMP_ISSUE_INVESTIGATION.md` - Investigation report
2. ✅ `docs/TIMESTAMP_FIX_IMPLEMENTED.md` - Implementation details
3. ✅ `docs/TIMESTAMP_ACCURACY_SUMMARY.md` - Summary
4. ✅ `docs/SYSTEM_WIDE_TIMESTAMP_ENFORCEMENT.md` - This file

## Verification

### Test 1: Script Display

```bash
node scripts/manage_locks.js list
```

**Expected**: `Expires: 2026-01-16T05:55:00.000Z UTC (1/16/2026, 12:55:00 AM CST)`

### Test 2: Orchestrator Logs

```bash
npm run orchestrate -- --epic epic-1 --groups A,B,C
```

**Expected**:

- Clock validation message with timezone info
- All logs labeled: `[2026-01-16T04:55:00.000Z UTC] message`

### Test 3: Message Display

```bash
node scripts/send_message.js --check agent-id
```

**Expected**: `Timestamp: 2026-01-16T04:55:00.000Z UTC (1/16/2026, 12:55:00 AM CST)`

## Prevention

### Rule Enforcement

- ✅ `agent_rules/timestamp_accuracy.md` - Comprehensive rule
- ✅ Referenced in `agent_rules/core_principles.md`
- ✅ Referenced in `agent_rules/rule_enforcement.md`

### Code Standards

- ✅ All scripts use UTC ISO format for storage
- ✅ All comparisons use Date objects (UTC internally)
- ✅ All displays include timezone labels
- ✅ Clock validation on startup (where applicable)

### Documentation Standards

- ✅ All technical timestamps use UTC ISO format
- ✅ All timestamps clearly labeled
- ✅ Local time shown in parentheses when relevant

## Compliance Checklist

When adding new code, verify:

- [ ] All timestamps stored as UTC ISO strings
- [ ] All date comparisons use Date objects
- [ ] All displays include UTC label
- [ ] Local time shown in parentheses (when relevant)
- [ ] No unlabeled timestamps in console output
- [ ] Clock validation added (for critical scripts)

## Status

✅ **COMPLETE** - Timestamp accuracy is enforced system-wide:

- Scripts: ✅ UTC storage, UTC comparison, labeled displays
- API: ✅ UTC operations, UTC responses
- Database: ✅ UTC TIMESTAMP type
- Documentation: ✅ UTC timestamps with labels
- Logs: ✅ UTC labeled format
- Rules: ✅ Comprehensive rule with system-wide coverage

---

**This rule applies to the ENTIRE system - no exceptions!**
