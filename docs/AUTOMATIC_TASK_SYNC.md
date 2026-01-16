# Automatic Task Sync System

**Last Updated**: 2026-01-16  
**Status**: ✅ **IMPLEMENTED**

## Overview

The orchestrator now **automatically syncs and populates tasks** without any manual intervention. You just start the orchestrator - it handles everything else.

## Automatic Sync Process

### On Orchestrator Startup

1. **Auto-sync from IMPLEMENTATION_PLAN.md**
   - Reads all tasks from `plan/IMPLEMENTATION_PLAN.md`
   - Merges with existing tasks in `todo_progress.json`
   - Preserves existing task status (won't overwrite `completed` or `in_progress`)

2. **Load agent-suggested tasks**
   - Reads from `agent_tasks/suggested_tasks.json`
   - Adds to `todo_progress.json` if not already present
   - Marks with `source: "agent-suggested"` for priority sorting

3. **Load tasks into queue**
   - Filters by epic/story if specified
   - Sorts by priority system
   - Ready for agent assignment

### During Execution

1. **Periodic auto-sync** (every ~5 minutes)
   - Syncs from `IMPLEMENTATION_PLAN.md`
   - Loads new agent-suggested tasks
   - Picks up newly available work

2. **Reload on queue empty**
   - When queue empties, auto-syncs and reloads
   - Ensures no work is missed
   - Continues until truly no tasks available

3. **Reload after task completion**
   - After each task completes, reloads to pick up next task
   - Ensures continuous execution

## Priority System

Tasks are processed in this order:

### 1. New Tasks (Highest Priority)

- Tasks from `IMPLEMENTATION_PLAN.md` (source: `plan` or no source)
- Fresh tasks that haven't been attempted
- **Priority**: 1

### 2. Rework Tasks (Medium Priority)

- Tasks with `retry_count > 0` (need reworking)
- Tasks with `status: "blocked"` that can be retried
- Higher `retry_count` = higher priority (needs more attention)
- **Priority**: 2

### 3. Agent-Suggested Tasks (Lower Priority)

- Tasks created by agents during development (source: `agent-suggested`)
- Discovered during implementation
- **Priority**: 3

Within each priority level, tasks are sorted by:

- Epic → Story → Task Priority → Dependencies

## Task Sources

### 1. IMPLEMENTATION_PLAN.md (Primary)

**Location**: `plan/IMPLEMENTATION_PLAN.md`

**Format**:

```markdown
### Story 1.5: Health Check

- [ ] Task 1.5.1: Create health check endpoint [Complexity: low] [Dependencies: none]
```

**Sync**: Automatic on startup and every 5 minutes

### 2. Agent-Suggested Tasks

**Location**: `agent_tasks/suggested_tasks.json`

**Created by**:

- Agents during development
- When discovering required work
- When identifying missing functionality

**Format**:

```json
{
  "tasks": [
    {
      "task_id": "task-agent-1234567890-1",
      "description": "Fix memory leak in health check",
      "epic_id": "epic-1",
      "story_id": "story-1.5",
      "source": "agent-suggested",
      "priority": 99,
      ...
    }
  ]
}
```

**How to create**:

```bash
# Option 1: Use script
npm run tasks:add -- --description "Fix memory leak" --epic epic-1 --story story-1.5

# Option 2: Add directly to todo_progress.json with source: "agent-suggested"
```

**Sync**: Automatic on startup and every 5 minutes

## Usage

### Starting Orchestrator

**Just run**:

```bash
npm run orchestrate -- --epic epic-1
```

**That's it!** The orchestrator:

1. ✅ Auto-syncs tasks from IMPLEMENTATION_PLAN.md
2. ✅ Loads agent-suggested tasks
3. ✅ Filters by epic/story if specified
4. ✅ Sorts by priority system
5. ✅ Starts assigning tasks to agents
6. ✅ Continues until all tasks complete

### No Manual Steps Required

- ❌ No need to run `npm run tasks:populate` first
- ❌ No need to manually sync
- ❌ No need to check if tasks are available
- ✅ Just start the orchestrator

## Continuous Execution

The orchestrator continues working until:

1. **All tasks complete** - All tasks have `status: "completed"`
2. **All tasks blocked** - All remaining tasks have `status: "blocked"` with `needs_human_intervention: true`
3. **No tasks available** - After final sync, no tasks found in any source
4. **User stops** - Manual stop via Ctrl+C or stop script

## Agent Responsibilities

Agents should:

1. **Update `todo_progress.json`** when status changes
2. **Create suggested tasks** if discovering required work:
   ```bash
   npm run tasks:add -- --description "Add error handling" --epic epic-1
   ```
3. **Continue working** - Orchestrator handles task assignment automatically

**No need to**:

- Manually sync tasks
- Check if tasks are available
- Worry about task population

## Task Priority Examples

### Example 1: New Task

```json
{
  "task_id": "task-1234567890-1",
  "description": "Create health check endpoint",
  "source": null, // or "plan"
  "retry_count": 0,
  "status": "pending"
}
```

**Priority**: 1 (New task - highest priority)

### Example 2: Rework Task

```json
{
  "task_id": "task-1234567890-2",
  "description": "Fix database connection",
  "retry_count": 2, // Failed twice, needs rework
  "status": "pending"
}
```

**Priority**: 2 (Rework task - medium priority, but higher than new tasks of same source)

### Example 3: Agent-Suggested Task

```json
{
  "task_id": "task-agent-1234567890-3",
  "description": "Add error logging",
  "source": "agent-suggested",
  "retry_count": 0,
  "status": "pending"
}
```

**Priority**: 3 (Agent-suggested - lower priority, processed after plan tasks)

## Integration

This system integrates with:

- **Epic → Story → Task execution** (`docs/ORCHESTRATOR_EXECUTION_STRATEGY.md`)
- **Task management system** (`docs/TASK_MANAGEMENT_SYSTEM.md`)
- **Agent tracking rules** (`agent_rules/task_tracking.md`)
- **Resource management** (`agent_rules/resource_management.md`)

## Troubleshooting

### No Tasks Available

**Symptom**: Orchestrator shows "No tasks match filters"

**Check**:

1. Run `npm run tasks:validate` to see task status
2. Check `IMPLEMENTATION_PLAN.md` has tasks for the epic/story
3. Check `agent_tasks/suggested_tasks.json` for agent-suggested tasks

**Solution**: Tasks will auto-sync on next orchestrator start

### Tasks Not Syncing

**Symptom**: New tasks in IMPLEMENTATION_PLAN.md not appearing

**Check**:

1. Orchestrator auto-syncs every 5 minutes
2. Check orchestrator logs for sync messages
3. Verify task format matches expected pattern

**Solution**: Wait for next auto-sync, or restart orchestrator

## Related Files

- `scripts/orchestrate_agents.js` - Auto-sync implementation
- `scripts/populate_tasks_from_plan.js` - Task population logic
- `scripts/add_agent_suggested_task.js` - Agent task creation
- `agent_tasks/suggested_tasks.json` - Agent-suggested tasks storage
- `docs/TASK_MANAGEMENT_SYSTEM.md` - Complete task management docs
