# Agent Progress Troubleshooting Guide

**Last Updated**: 2026-01-16  
**Status**: Active Debugging Guide

## Problem: Agents Not Progressing on Tasks

### Symptoms

- Agents spawn successfully
- Tasks remain in `pending` or `in_progress` status
- Orchestrator shows "Queue empty, waiting for agents to complete"
- Agents appear idle (no status updates in `todo_progress.json`)

### Root Causes Identified

#### 1. CLI Agents Not Updating `todo_progress.json`

**Problem**: CLI agents (via `agent -p --force`) execute but don't update task status in `todo_progress.json`.

**Evidence**:

- Tasks remain in `in_progress` status indefinitely
- No status changes in `todo_progress.json`
- Orchestrator monitors via `todo_progress.json` but agents never update it

**Solution**: Enhanced agent prompts with explicit `todo_progress.json` update instructions.

#### 2. Task Sorting Not Following Epic → Story Hierarchy

**Problem**: Tasks processed by priority/dependencies, not Epic → Story order.

**Evidence**:

- Tasks from different stories/epics processed out of order
- No systematic progression through work breakdown structure

**Solution**: Implemented Epic → Story → Priority → Dependencies sorting.

#### 3. No Automatic Continuation

**Problem**: Orchestrator doesn't automatically reload tasks or assign next task after completion.

**Evidence**:

- Queue empties but more tasks exist
- Agents complete but don't get next task
- Orchestrator stops when queue empty even if work remains

**Solution**: Implemented automatic task reloading and continuation.

## Investigation Results

### Current Task Structure

Tasks in `todo_progress.json` have:

- `epic_id`: e.g., "epic-1"
- `story_id`: e.g., "story-1.2"
- `task_id`: e.g., "task-1768362388844-36"
- `status`: "pending", "in_progress", "completed", "blocked"
- `assigned_agent`: agent ID or null

### Orchestrator Behavior

1. **Task Loading**: Loads tasks from `todo_progress.json`, filters by epic/groups
2. **Task Sorting**: NOW sorted by Epic → Story → Priority → Dependencies
3. **Agent Spawning**: Launches agents for tasks when capacity available
4. **Progress Monitoring**: Monitors `todo_progress.json` for status changes
5. **Task Reloading**: Reloads tasks periodically and after completion

### Agent Behavior (Expected vs Actual)

**Expected**:

1. Agent receives task prompt with task details
2. Agent updates `todo_progress.json` to `in_progress`
3. Agent implements task
4. Agent updates `todo_progress.json` to `completed`
5. Orchestrator detects completion, assigns next task

**Actual (Issues Found)**:

- ✅ Agent receives task prompt
- ❓ Agent may not update `todo_progress.json` immediately
- ❓ Agent may not update `todo_progress.json` on completion
- ❓ CLI agents might exit without updating status

## Solutions Implemented

### 1. Enhanced Task Sorting

**Before**:

```javascript
// Sort by priority and dependencies only
filteredTasks.sort((a, b) => {
  if (a.priority !== b.priority) return a.priority - b.priority;
  return (a.dependencies?.length || 0) - (b.dependencies?.length || 0);
});
```

**After**:

```javascript
// Sort by Epic → Story → Priority → Dependencies
filteredTasks.sort((a, b) => {
  // 1. Epic order
  // 2. Story order
  // 3. Priority
  // 4. Dependencies
});
```

### 2. Automatic Task Reloading

**Before**: Queue empties, orchestrator stops

**After**:

- Reload tasks after each agent completion
- Reload tasks periodically (every 100 seconds)
- Continue until all epics/stories/tasks are complete

### 3. Enhanced Agent Prompts

**Before**: Generic task instructions

**After**:

- Explicit `todo_progress.json` update instructions
- Epic/Story context included
- Continue-to-next-task instructions
- Human intervention handling

### 4. Human Intervention Tracking

**Before**: Failed tasks just marked as failed

**After**:

- Track retry count (max 3)
- Mark as `blocked` with `needs_human_intervention: true` after 3 failures
- Continue to next available task (don't block progress)
- Log blocked tasks for human review

### 5. Epic/Story Progress Tracking

**Added**:

- Epic/Story breakdown in task loading logs
- Epic/Story progress logging on task completion
- Current epic/story tracking

## Verification Steps

### 1. Check Task Sorting

```bash
# Run orchestrator and check logs for:
# - Epic breakdown: "epic-1: X tasks"
# - Story breakdown: "story-1.1: Y tasks"
# - Tasks should be in Epic → Story order
```

### 2. Check Task Reloading

```bash
# Run orchestrator and watch for:
# - "Reloaded tasks from todo_progress.json: X new tasks available"
# - Queue should reload after tasks complete
```

### 3. Check Agent Updates

```bash
# Monitor todo_progress.json:
watch -n 2 'cat agent_tasks/todo_progress.json | jq ".tasks[] | select(.status==\"in_progress\" or .status==\"completed\")"'

# Should see:
# - Tasks change from "pending" to "in_progress" when agents start
# - Tasks change from "in_progress" to "completed" when agents finish
```

### 4. Check Human Intervention Tracking

```bash
# Check for blocked tasks:
node scripts/manage_tasks.js list --status blocked

# Should show tasks with:
# - retry_count >= 3
# - needs_human_intervention: true
# - blocked_reason explaining why
```

## Remaining Issues (If Any)

### CLI Agent Status Updates

**Status**: ⚠️ **POTENTIAL ISSUE**

**Problem**: CLI agents via `agent -p --force` might not update `todo_progress.json` directly.

**Possible Solutions**:

1. Use Claude Code windows instead (which can update files directly)
2. Create wrapper script that updates `todo_progress.json` after CLI agent completes
3. Use orchestrator monitoring to detect completion via process exit + file changes

**Investigation Needed**:

- Verify if CLI agents can update `todo_progress.json`
- Check if orchestrator can detect completion via process exit
- Test with actual agent execution

## Related Documentation

- `docs/ORCHESTRATOR_EXECUTION_STRATEGY.md` - Execution strategy documentation
- `agent_rules/autonomy_protocol.md` - Autonomous execution rules
- `agent_rules/core_principles.md` - Core principles including task management
- `scripts/orchestrate_agents.js` - Orchestrator implementation

## Next Steps

1. ✅ Enhanced task sorting (Epic → Story → Task)
2. ✅ Automatic task reloading
3. ✅ Enhanced agent prompts
4. ✅ Human intervention tracking
5. ⚠️ **Verify CLI agents can update `todo_progress.json`**
6. ⚠️ **Test end-to-end: Epic → Story → Task completion**
7. ⚠️ **Monitor and log agent behavior**
