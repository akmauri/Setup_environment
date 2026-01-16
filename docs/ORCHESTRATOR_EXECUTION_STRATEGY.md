# Orchestrator Execution Strategy: Epic → Story → Task

**Last Updated**: 2026-01-16  
**Status**: ✅ **IMPLEMENTED**

## Overview

The orchestrator now systematically processes work following a hierarchical structure:

**Epic → Story → Task**

This ensures:

- Systematic completion of all work
- Proper sequencing within epics and stories
- Automatic continuation to next available task
- Tasks requiring human intervention are marked but don't block progress

## Execution Hierarchy

### 1. Epic Level

- Epics are processed in order: `epic-1`, `epic-2`, `epic-3`, etc.
- All tasks within an epic are completed before moving to the next epic
- Epic progress is tracked and logged

### 2. Story Level

- Within each epic, stories are processed in order: `story-1.1`, `story-1.2`, `story-1.3`, etc.
- All tasks within a story are completed before moving to the next story
- Story progress is tracked and logged

### 3. Task Level

- Within each story, tasks are processed by:
  1. **Priority** (lower number = higher priority)
  2. **Dependencies** (tasks without dependencies first)
- Tasks are executed until completion or blocked status

## Task Sorting Algorithm

Tasks are sorted using this priority order:

1. **Epic Order**: Process epics sequentially (epic-1, epic-2, etc.)
2. **Story Order**: Within epic, process stories sequentially (story-1.1, story-1.2, etc.)
3. **Priority**: Lower number = higher priority
4. **Dependencies**: Tasks without dependencies come first

This ensures systematic execution: **Epic → Story → Priority → Dependencies**

## Automatic Continuation

### Task Completion Flow

1. **Agent completes task**:
   - Task status updated to `completed` in `todo_progress.json`
   - Lock file released
   - Dependent tasks notified

2. **Orchestrator automatically**:
   - Reloads tasks from `todo_progress.json`
   - Assigns next available task to the agent
   - Continues until all tasks are complete

3. **Task failure**:
   - Task retried (up to 3 attempts)
   - After 3 failures: marked as `blocked` with `needs_human_intervention: true`
   - Agent continues to next available task
   - Human intervention tasks are tracked separately

### Continuous Execution

The orchestrator:

- **Reloads tasks** periodically (every 100 seconds) and after each completion
- **Continues processing** until all epics/stories/tasks are complete
- **Stops only when**:
  - All tasks are complete
  - All tasks are blocked (needs human intervention)
  - User manually stops (Ctrl+C, stop file)

## Human Intervention Handling

### Marking Tasks for Human Intervention

Tasks are automatically marked as needing human intervention when:

- Task fails 3+ times (retry_count >= 3)
- Task is manually marked as `blocked`

### Task Status Flow

```
pending → in_progress → completed
                ↓
            blocked (needs_human_intervention: true)
```

### After Marking

- Task is marked with `needs_human_intervention: true`
- Task is marked as `blocked` with `blocked_reason`
- **Agent continues to next available task** (doesn't stop)
- Human can review blocked tasks later
- Blocked tasks don't block other work

## Progress Tracking

### Epic/Story Tracking

The orchestrator logs progress at each level:

```
[INFO] Epic epic-1 progress: Task task-XXX completed
[INFO] Story story-1.1: 5/10 tasks complete
[INFO] Epic epic-1: Story story-1.1 complete, moving to story-1.2
```

### Queue Status

Periodic status updates include:

- Current epic being processed
- Current story being processed
- Tasks remaining in epic/story
- Overall progress (epic breakdown, story breakdown)

## Agent Behavior

### Required Actions

Agents **MUST**:

1. **Update `todo_progress.json` immediately** when starting work
   - Set status to `in_progress`
   - Update `updated_at` timestamp

2. **Update `todo_progress.json` when completing**
   - Set status to `completed`
   - Set `actual_completion_time`
   - Update `updated_at` timestamp

3. **Continue to next task** after completion
   - Don't stop, don't ask permission
   - Orchestrator will assign next task automatically

4. **Mark blocked tasks** if human intervention needed
   - Set status to `blocked`
   - Set `blocked_reason`
   - Continue to next available task

### Agent Prompts

Agents receive prompts with:

- Epic ID and Story ID context
- Explicit instructions to update `todo_progress.json`
- Instructions to continue autonomously
- Clear next-task continuation guidance

## Configuration

### Orchestrator Options

```javascript
{
  epic: 'epic-1',           // Filter by epic (optional)
  groups: ['A', 'B', 'C'],  // Filter by groups (optional)
  tasks: [],                // Specific tasks (optional)
  maxConcurrent: 3,         // Max parallel agents
  idleTimeoutMinutes: 15    // Agent idle timeout
}
```

### Running Orchestrator

```bash
# Process specific epic
npm run orchestrate -- --epic epic-1

# Process epic with specific groups
npm run orchestrate -- --epic epic-1 --groups A,B,C

# Process all available tasks (systematic epic→story→task)
npm run orchestrate
```

## Troubleshooting

### Agents Not Progressing

**Symptoms**: Agents spawn but tasks never complete

**Causes**:

1. Agents not updating `todo_progress.json`
2. CLI agents exiting without updating status
3. Agents waiting for input that never comes

**Solutions**:

1. Check agent prompts include explicit `todo_progress.json` update instructions
2. Verify agents are actually executing (check logs)
3. Ensure agents have correct permissions to write to `todo_progress.json`

### Tasks Not Being Reloaded

**Symptoms**: Queue empties but more tasks exist

**Causes**:

1. Tasks have wrong status (not `pending` or `in_progress`)
2. Tasks filtered out by epic/group filters
3. Reload mechanism not working

**Solutions**:

1. Check task statuses in `todo_progress.json`
2. Verify epic/group filters match tasks
3. Check orchestrator logs for reload messages

### Human Intervention Tasks Not Tracked

**Symptoms**: Tasks fail repeatedly but aren't marked

**Causes**:

1. Retry count not being tracked
2. `markTaskNeedsHumanIntervention` not being called
3. Task status not being updated

**Solutions**:

1. Check `retry_count` in `todo_progress.json`
2. Verify `handleAgentExit` calls `markTaskNeedsHumanIntervention`
3. Check orchestrator logs for failure tracking

## Integration with Agent Rules

This strategy integrates with:

- **Autonomy Protocol** (`agent_rules/autonomy_protocol.md`): Agents work autonomously until all tasks complete
- **No Manual Orchestration** (`agent_rules/no_manual_orchestration.md`): Agents execute directly, don't wait for permission
- **Resource Management** (`agent_rules/resource_management.md`): Prevents endless loops, tracks progress
- **Parallel Coordination** (`agent_rules/parallel_coordination.md`): Uses locks for coordination

## Success Criteria

The orchestrator is working correctly when:

- ✅ Tasks are sorted: Epic → Story → Priority → Dependencies
- ✅ Agents continue to next task after completion
- ✅ Tasks reload automatically when queue empties
- ✅ Human intervention tasks are marked but don't block progress
- ✅ Epic/story progress is logged and tracked
- ✅ All epics/stories/tasks are processed systematically

## Related Files

- `scripts/orchestrate_agents.js` - Main orchestrator implementation
- `agent_tasks/todo_progress.json` - Task tracking file
- `agent_rules/autonomy_protocol.md` - Autonomous execution rules
- `agent_rules/resource_management.md` - Resource management rules
- `docs/EPICS_STORIES.md` - Epic/story definitions
