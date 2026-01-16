# Timestamp Accuracy Rule

**Version**: 1.0.0  
**Last Updated**: 2026-01-16  
**Purpose**: Ensure all timestamps are accurate, consistent, and clearly labeled

## Directive

**ALL agents, scripts, API routes, documentation, logs, notes, and source code MUST ensure timestamp accuracy and consistency.** This rule applies to the ENTIRE system, not just the orchestrator.

Incorrect timestamps in logs and data files can cause critical issues with:

- Lock expiration checks
- Task scheduling
- Debugging and troubleshooting
- Audit trails
- Database queries
- API responses
- User-facing displays

## Timestamp Standards

### Storage Format

**ALL internal storage MUST use UTC in ISO 8601 format**:

```
2026-01-16T04:47:13.020Z
```

**Examples**:

- Lock files: `expires_at: "2026-01-16T04:47:13.020Z"`
- Task status: `updated_at: "2026-01-16T04:47:13.020Z"`
- Log entries: `[2026-01-16T04:47:13.020Z] message`

### Display Format

**ALL displays MUST show CST (Central Standard Time) as primary timezone**:

```
1/15/2026, 10:47:13 PM CST (2026-01-16T04:47:13.020Z UTC)
```

Or if space is limited, show CST first with UTC in parentheses:

```
1/15/2026, 10:47:13 PM CST
```

**Note**: Storage always uses UTC. Only displays show CST for user convenience.

### Comparison Logic

**ALL date comparisons MUST use UTC**:

```javascript
// ✅ CORRECT
const now = new Date();
const expiresAt = new Date(lock.expires_at);
if (expiresAt < now) {
  // Both in UTC
  // Lock expired
}

// ❌ WRONG
const nowLocal = new Date().toLocaleString(); // Local time string
const expiresAt = new Date(lock.expires_at).toLocaleString(); // Local time string
if (expiresAt < nowLocal) {
  // String comparison, timezone issues
  // BUG!
}
```

## Timezone Handling

### Node.js/JavaScript

- `new Date()` - Creates date from system clock (timezone-aware)
- `.toISOString()` - Converts to UTC ISO string ✅ **USE THIS FOR STORAGE**
- `.toLocaleString()` - Converts to local time string ⚠️ **ONLY FOR DISPLAY**
- `Date.now()` - Current time in UTC milliseconds ✅ **USE THIS FOR COMPARISONS**

### System Clock Validation

**On startup, validate system clock accuracy**:

1. Check if system time is significantly off (e.g., > 5 minutes)
2. Warn if clock skew detected
3. Prevent critical operations if clock is too far off

## Implementation Requirements

### Scripts Must (ALL scripts in `scripts/` directory)

1. **Store all timestamps as UTC ISO strings**
2. **Compare all timestamps in UTC**
3. **Display timestamps with timezone labels**
4. **Validate system clock on startup** (where applicable)

**Applies to**:

- `scripts/orchestrate_agents.js`
- `scripts/manage_locks.js`
- `scripts/send_message.js`
- `scripts/credit_monitor.js`
- `scripts/log_rotation.js`
- `scripts/create_story_tasks.js`
- `scripts/autonomous_execution_loop.js`
- `scripts/autonomous_agent_loop.js`
- **ALL other scripts**

### API Routes Must (ALL API routes in `apps/api/src/`)

1. **Store all timestamps as UTC ISO strings**
2. **Compare all timestamps in UTC**
3. **Display timestamps with timezone labels in responses**
4. **Never use local time strings for storage**

**Applies to**:

- `apps/api/src/index.ts`
- `apps/api/src/routes/*.ts`
- `apps/api/src/services/*.ts`
- `apps/api/src/middleware/*.ts`
- **ALL API code**

### Database Must (ALL database schemas)

1. **Store all timestamps as UTC (TIMESTAMP type in PostgreSQL is UTC)**
2. **Never store local time strings**
3. **Always use UTC for queries and comparisons**

**Applies to**:

- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/*.sql`
- **ALL database operations**

### Agents Must (ALL agent prompts and execution)

1. **Use UTC for all timestamp operations**
2. **Include timezone in timestamp displays**
3. **Never assume timezone from context**
4. **Log timezone information when reporting timestamps**

**Applies to**:

- All agent prompts in `agent_prompts/`
- All agent execution in Claude Code windows
- All task status updates

### Documentation Must (ALL documentation files)

1. **Use CST timestamps for display**: `1/15/2026, 10:47:13 PM CST`
2. **Include UTC in parentheses when relevant**: `(2026-01-16T04:47:13.020Z UTC)`
3. **Always label timezone**: Don't use unlabeled timestamps
4. **For technical precision**: Use ISO UTC format: `2026-01-16T04:47:13.020Z UTC`

**Applies to**:

- All files in `docs/`
- All files in `logs/`
- All markdown files (`*.md`)
- All notes and documentation

### Logging Requirements (ALL log files)

**All log entries MUST**:

- Display CST timestamps: `[1/15/2026, 10:47:13 PM CST]`
- Store UTC in log files (for consistency and comparison)
- Include UTC in parentheses when relevant: `(2026-01-16T04:47:13.020Z UTC)`
- Always label timezone clearly

**Applies to**:

- `logs/orchestrator/*.log`
- `logs/agent_activity/*.log`
- `logs/agent_errors/*.md`
- `logs/autonomy/*.md`
- **ALL log files**

## Common Pitfalls

### ❌ Pitfall 1: Mixing UTC and Local Time

```javascript
// BAD
const lock = {
  created: new Date().toLocaleString(), // Local time string
  expires: new Date(Date.now() + 3600000).toISOString(), // UTC string
};
// Comparison will fail due to different formats
```

### ❌ Pitfall 2: String Comparison

```javascript
// BAD
const now = new Date().toLocaleString(); // "1/15/2026, 10:47:13 PM"
const expires = new Date(lock.expires_at).toLocaleString(); // "1/16/2026, 12:47:13 AM"
if (expires < now) { // String comparison, wrong!
```

### ❌ Pitfall 3: Timezone Assumptions

```javascript
// BAD - assumes UTC
const date = new Date('2026-01-16 04:47:13'); // May parse as local time!
```

### ✅ Correct Patterns

```javascript
// GOOD - Always use UTC for storage
const lock = {
  created: new Date().toISOString(), // UTC string
  expires: new Date(Date.now() + 3600000).toISOString(), // UTC string
};

// GOOD - Compare Date objects (always UTC internally)
const now = new Date();
const expires = new Date(lock.expires_at);
if (expires < now) {
  // Correct comparison
}

// GOOD - Display with both timezones
const date = new Date(lock.expires_at);
console.log(
  `${date.toISOString()} UTC (${date.toLocaleString('en-US', { timeZoneName: 'short' })})`
);
```

## Clock Validation

### On Startup

**Critical scripts should validate system clock**:

```javascript
function validateSystemClock() {
  const now = new Date();
  const nowISO = now.toISOString();

  // Check if date is reasonable (not too far in past/future)
  const minDate = new Date('2020-01-01');
  const maxDate = new Date('2030-01-01');

  if (now < minDate || now > maxDate) {
    throw new Error(`System clock appears incorrect: ${nowISO}`);
  }

  // Log timezone information
  const offset = -now.getTimezoneOffset(); // Minutes from UTC
  const offsetHours = offset / 60;
  console.log(`[INFO] System timezone: UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`);
  console.log(
    `[INFO] Current time: ${nowISO} UTC (${now.toLocaleString('en-US', { timeZoneName: 'short' })})`
  );
}
```

### Clock Skew Detection

**If comparing to external time source**:

- NTP server
- API timestamps
- Database server time

Detect and warn if skew > 5 minutes.

## File Locations

### Timestamp Generation

- `scripts/orchestrate_agents.js` - Log timestamps, lock creation
- `scripts/manage_locks.js` - Lock expiration display
- `scripts/launch_claude_code.js` - Any timestamp generation

### Validation Points

- Orchestrator startup
- Lock creation
- Task status updates
- Log file creation

## Enforcement

### Pre-commit Checks

- Verify all `new Date()` calls use `.toISOString()` for storage
- Verify all comparisons use Date objects, not strings
- Verify all displays include timezone labels

### Runtime Checks

- Validate system clock on startup
- Log timezone information
- Warn if timestamps seem unreasonable

## Examples

### Lock Creation (Correct)

```javascript
async createLock(task, agentId) {
  const lockData = {
    locked_at: new Date().toISOString(), // UTC
    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // UTC, 2 hours later
  };
  await fs.writeFile(lockFile, JSON.stringify(lockData, null, 2));
}
```

### Lock Expiration Check (Correct)

```javascript
async lockExists(lockFile) {
  const lockContent = JSON.parse(await fs.readFile(lockFile, 'utf-8'));
  const expiresAt = new Date(lockContent.expires_at); // Parse UTC string
  const now = new Date(); // Current time (UTC internally)
  if (expiresAt < now) { // Correct UTC comparison
    await fs.unlink(lockFile);
    return false;
  }
  return true;
}
```

### Lock Display (Correct)

```javascript
const expiresAt = new Date(lock.expires_at);
const expiresCST = expiresAt.toLocaleString('en-US', {
  timeZone: 'America/Chicago',
  timeZoneName: 'short',
});
const expiresUTC = expiresAt.toISOString();
console.log(`Expires: ${expiresCST} (${expiresUTC} UTC)`);
```

## System-Wide Enforcement

### Scope

**This rule applies to the ENTIRE system, including**:

- ✅ All scripts in `scripts/` directory
- ✅ All API routes and services in `apps/api/src/`
- ✅ All database operations in `packages/db/`
- ✅ All agent prompts in `agent_prompts/`
- ✅ All documentation in `docs/` and markdown files
- ✅ All log files in `logs/`
- ✅ All notes and lists
- ✅ All source code

### Code Reviews

**When reviewing code, verify**:

1. All `new Date()` calls use `.toISOString()` for storage
2. All date comparisons use `Date` objects, not strings
3. All displays include UTC label: `timestamp UTC (local time)`
4. No unlabeled timestamps in console output
5. No mixing of UTC and local time without clear labels

### Automated Checks

**Future enhancements** (recommended):

- Pre-commit hook to check timestamp usage
- ESLint rule to enforce UTC for storage
- TypeScript types for UTC timestamps
- Runtime validation of timestamp format

## Integration with Other Rules

This rule integrates with:

- **Error Handling** (`agent_rules/error_handling.md`): Timestamp errors are critical errors
- **Logging Requirements**: All logs must use UTC timestamps
- **Lock Management**: Lock expiration relies on accurate timestamps
- **Agent Rules**: All agent rules must reference this for timestamp accuracy

## Files Updated (System-Wide)

### Scripts ✅

- `scripts/orchestrate_agents.js` - Clock validation, UTC labels
- `scripts/manage_locks.js` - UTC + local time display
- `scripts/send_message.js` - UTC + local time in message display
- `scripts/credit_monitor.js` - UTC labels in log entries
- `scripts/log_rotation.js` - UTC labels in cutoff date display

### API ✅

- All API routes use `Date.now()` (UTC milliseconds) - ✅ Correct
- API responses should include UTC labels when displaying timestamps
- Database operations use UTC TIMESTAMP type - ✅ Correct

### Documentation ✅

- All new documentation files use UTC timestamps with labels
- `docs/TIMESTAMP_ISSUE_INVESTIGATION.md` - Investigation report
- `docs/TIMESTAMP_FIX_IMPLEMENTED.md` - Implementation details
- `docs/TIMESTAMP_ACCURACY_SUMMARY.md` - Summary

### Rules ✅

- `agent_rules/timestamp_accuracy.md` - Comprehensive system-wide rule

---

**CRITICAL**: Incorrect timestamps can cause:

- Locks never expiring (or expiring too early)
- Task scheduling failures
- Debugging nightmares
- Audit trail corruption
- Database query failures
- API response inconsistencies

**Always use UTC for storage and comparison, display with timezone labels!**

**This rule applies to the ENTIRE system - scripts, API, database, agents, documentation, logs, notes, and source code.**
