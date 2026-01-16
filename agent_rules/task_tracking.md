# Task Tracking Requirements

**Last Updated**: 2026-01-16  
**Status**: ✅ **MANDATORY**

## Overview

All agents MUST track their activity, errors, and progress. This ensures:

- Orchestrator can monitor agent progress
- Tasks are properly updated in `todo_progress.json`
- Activity logs are maintained for debugging
- Decisions are documented for future reference

## Mandatory Tracking Actions

### 1. Task Status Updates (CRITICAL)

**When starting work**:

```json
{
  "status": "in_progress",
  "updated_at": "2026-01-16T09:00:00.000Z",
  "assigned_agent": "dev-backend-1"
}
```

**When completing work**:

```json
{
  "status": "completed",
  "actual_completion_time": "2026-01-16T10:30:00.000Z",
  "updated_at": "2026-01-16T10:30:00.000Z"
}
```

**When blocking work**:

```json
{
  "status": "blocked",
  "blocked_reason": "Requires API credentials from user",
  "needs_human_intervention": true,
  "updated_at": "2026-01-16T10:30:00.000Z"
}
```

**File**: `agent_tasks/todo_progress.json`

**CRITICAL**: Orchestrator monitors this file. If you don't update it, orchestrator won't know you're working.

### 2. Activity Logging

**Location**: `logs/agent_activity/[YYYY-MM-DD].md`

**Format**:

```markdown
## [Timestamp] Agent: dev-backend-1 | Task: task-1234567890-1

**Action**: Started implementing health check endpoint
**Files Modified**: apps/api/src/routes/health.ts
**Result**: Created GET /health route handler
**Next**: Add database health check
```

**When to log**:

- Starting a task
- Completing a task
- Making significant progress
- Encountering issues
- Making important decisions

### 3. Error Logging

**Location**: `logs/agent_errors/[YYYY-MM-DD].md`

**Format**:

```markdown
## [Timestamp] Agent: dev-backend-1 | Task: task-1234567890-1

**Error**: Database connection failed
**Context**: Attempting to create health check endpoint
**Stack Trace**: [error stack]
**Resolution**: Checked database credentials, fixed connection string
**Status**: Resolved
```

**When to log**:

- Any error encountered
- Task failures
- Unexpected behavior
- Blocking issues

**Also update**:

- `todo_progress.json`: Increment `retry_count`, add `last_error`

### 4. Decision Documentation

**Location**: `docs/decisions/[YYYY-MM-DD]_[task_id].md`

**Format**:

```markdown
# Decision: [Brief Description]

**Date**: 2026-01-16
**Agent**: dev-backend-1
**Task**: task-1234567890-1
**Epic**: epic-1
**Story**: story-1.5

## Decision

[What was decided]

## Rationale

[Why this decision was made]

## Alternatives Considered

1. [Alternative 1] - [Why not chosen]
2. [Alternative 2] - [Why not chosen]

## Impact

[Expected impact on system/other tasks]
```

**When to document**:

- Significant architectural decisions
- Technology choices
- Approach changes
- Trade-offs made

### 5. Git Commits

**Format**: `[Agent] [Task-ID] Description`

**Example**:

```
[dev-backend-1] [task-1234567890-1] Create health check endpoint

- Added GET /health route handler
- Returns 200 OK with timestamp
- Follows REST API standards
```

**When to commit**:

- After completing a task (MANDATORY)
- After making significant changes
- Before marking task as completed
- **Every 30 minutes** of active work (periodic backup - see `agent_rules/git_github_best_practices.md`)

**CRITICAL**: See `agent_rules/git_github_best_practices.md` for complete Git/GitHub requirements including:

- Periodic commit requirements (every 30 minutes)
- Push requirements (every 2 hours minimum)
- Backup safety measures
- Branch management

## Synchronization Requirements

### Automatic Sync (ORCHESTRATOR HANDLES THIS)

**CRITICAL**: The orchestrator automatically syncs tasks on startup and periodically during execution.

**You don't need to manually sync** - the orchestrator:

1. ✅ Auto-syncs from `IMPLEMENTATION_PLAN.md` on startup
2. ✅ Auto-syncs every 5 minutes during execution
3. ✅ Loads agent-suggested tasks automatically
4. ✅ Reloads tasks when queue empties

**Just update `todo_progress.json`** when you change task status - orchestrator handles the rest.

### Creating Agent-Suggested Tasks

If you discover a task that needs to be done during development:

**Option 1: Add to todo_progress.json directly**

```json
{
  "task_id": "task-agent-1234567890-1",
  "description": "Fix memory leak in health check",
  "epic_id": "epic-1",
  "story_id": "story-1.5",
  "status": "pending",
  "source": "agent-suggested",
  "priority": 99,
  ...
}
```

**Option 2: Use script**

```bash
node scripts/add_agent_suggested_task.js --description "Fix memory leak" --epic epic-1 --story story-1.5
```

**Priority**: Agent-suggested tasks have lower priority than plan tasks, but will be processed after all plan tasks are done.

## Validation

Before starting work, validate:

```bash
npm run tasks:validate
```

This ensures:

- All epics have stories
- All stories have tasks
- `todo_progress.json` is populated

## Integration with Orchestrator

The orchestrator:

- Monitors `todo_progress.json` for status changes
- Detects when tasks move from `pending` → `in_progress` → `completed`
- Reloads tasks periodically to pick up new work
- Tracks progress via status changes

**Your responsibility**:

- Update `todo_progress.json` when status changes
- Log activity for debugging
- Document decisions for future reference

## Examples

### Example: Starting a Task

1. **Update todo_progress.json**:

   ```json
   {
     "status": "in_progress",
     "updated_at": "2026-01-16T09:00:00.000Z",
     "assigned_agent": "dev-backend-1"
   }
   ```

2. **Log activity**:

   ```markdown
   ## [2026-01-16 09:00:00] Agent: dev-backend-1 | Task: task-1234567890-1

   **Action**: Starting implementation of health check endpoint
   **Plan**: Create GET /health route, add database check, add Redis check
   ```

### Example: Completing a Task

1. **Update todo_progress.json**:

   ```json
   {
     "status": "completed",
     "actual_completion_time": "2026-01-16T10:30:00.000Z",
     "updated_at": "2026-01-16T10:30:00.000Z"
   }
   ```

2. **Log activity**:

   ```markdown
   ## [2026-01-16 10:30:00] Agent: dev-backend-1 | Task: task-1234567890-1

   **Action**: Completed health check endpoint
   **Files Created**: apps/api/src/routes/health.ts
   **Tests**: Added unit tests, all passing
   **Result**: ✅ Task completed successfully
   ```

3. **Commit**:
   ```bash
   git commit -m "[dev-backend-1] [task-1234567890-1] Create health check endpoint"
   ```

## Related Rules

- `agent_rules/core_principles.md` - Core principles including tracking
- `agent_rules/error_handling.md` - Error handling requirements
- `agent_rules/autonomy_protocol.md` - Autonomous execution with logging
- `docs/TASK_MANAGEMENT_SYSTEM.md` - Complete task management documentation
