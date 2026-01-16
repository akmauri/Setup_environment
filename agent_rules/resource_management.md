# Resource Management: Prevent Endless Execution

**Version**: v1.0.0  
**Last Updated**: 2026-01-16  
**Purpose**: Prevent agents and orchestrators from wasting processing resources through endless execution or idle loops

## Directive

**All agents and orchestrators MUST detect idle/stuck states and automatically stop or escalate rather than continuing indefinitely.**

## Resource Waste Indicators

The following behaviors indicate resource waste and MUST be prevented:

1. **Endless Idling**: Running continuously without making progress for extended periods
2. **Repetitive Logging**: Outputting the same log message repeatedly without state changes
3. **Polling Loops**: Checking status repeatedly without new information or actions
4. **Stuck Agents**: Agents that are active but not making measurable progress
5. **Orchestrator Waiting**: Orchestrator waiting indefinitely for agents that never complete

## Agent Responsibilities

### Progress Detection

Agents MUST track and report progress:

1. **State Change Tracking**: Record each measurable state change (file created/updated, test run, commit made, task status updated)
2. **Progress Timestamps**: Update `lastProgressTime` when any state change occurs
3. **Idle Detection**: If no progress for **10 minutes**, agents MUST:
   - Output a "Stuck Report" (see `loop_guard.md`)
   - Attempt ONE recovery action
   - If recovery fails, mark task as `blocked` and stop execution

### Stopping Criteria

Agents MUST stop execution when:

- All assigned tasks are complete
- Task is marked as `blocked`
- No progress for 10+ minutes despite recovery attempts
- User explicitly requests stop (via shutdown signal or lock file)

### Prohibited Behaviors

Agents MUST NOT:

- ❌ Continue running indefinitely when no tasks are available
- ❌ Output the same log message repeatedly (> 3 times per minute)
- ❌ Poll the same resource without making changes (> 5 times without state change)
- ❌ Wait for user input without timeout (> 2 minutes)
- ❌ Retry the same failed action indefinitely (> 3 attempts without changes)

## Orchestrator Responsibilities

### Idle Timeout Enforcement

The orchestrator MUST:

1. **Track Agent Progress**: Monitor `lastProgressTime` for each active agent
2. **Idle Detection**: If agent makes no progress for **15 minutes**:
   - Log warning with idle duration
   - Mark agent's task as stuck/failed
   - Release lock file
   - Remove agent from active list
3. **Reduce Log Noise**: Limit repetitive "waiting" messages to once per 30 seconds
4. **Graceful Shutdown**: Support SIGINT/SIGTERM for manual stop

### Stopping Criteria

The orchestrator MUST stop when:

- All tasks are complete AND all agents have exited
- User requests stop (Ctrl+C / SIGINT / SIGTERM)
- Maximum runtime exceeded (configurable, default: 24 hours)
- Critical error prevents continuation

### Prohibited Behaviors

The orchestrator MUST NOT:

- ❌ Continue monitoring agents that are clearly stuck (> 15 min idle)
- ❌ Spam logs with identical "waiting" messages every 5 seconds
- ❌ Ignore shutdown signals (SIGINT, SIGTERM)
- ❌ Run indefinitely when no productive work is happening

## Implementation

### Agent Implementation

```javascript
// Track last progress time
let lastProgressTime = Date.now();

// After each state change
function recordProgress() {
  lastProgressTime = Date.now();
}

// Check idle state
function checkIdle() {
  const idleMinutes = (Date.now() - lastProgressTime) / (1000 * 60);
  if (idleMinutes > 10) {
    // Mark as stuck and stop
    markTaskAsBlocked('idle_timeout', `No progress for ${idleMinutes.toFixed(1)} minutes`);
    stopExecution();
  }
}
```

### Orchestrator Implementation

```javascript
// Monitor agent progress with idle detection
monitorAgentProgress(agentInstance) {
  const idleTimeoutMinutes = 15;
  const checkInterval = setInterval(() => {
    const idleMinutes = (Date.now() - agentInstance.lastProgressTime) / (1000 * 60);
    if (idleMinutes > idleTimeoutMinutes) {
      // Mark agent as stuck
      handleAgentExit(agentInstance, 1, 'idle_timeout');
    }
  }, 5000);
}
```

## Manual Stop Mechanisms

### For Agents

1. **Lock File Removal**: Remove `.lock/[task_id].lock` to signal stop
2. **Task Status Update**: Mark task as `blocked` or `cancelled` in `todo_progress.json`
3. **Shutdown Signal**: Agents should respond to process termination signals

### For Orchestrator

1. **Ctrl+C / SIGINT**: Gracefully shutdown (kill agents, release locks, exit)
2. **SIGTERM**: Same as SIGINT
3. **Lock File**: Create `.lock/.orchestrator.stop` to signal shutdown
4. **Process Kill**: As last resort, kill orchestrator process (may leave stale locks)

## Integration with Other Rules

This rule integrates with:

- **Loop Guard** (`agent_rules/loop_guard.md`): Idle detection is a form of loop detection
- **Core Principles** (`agent_rules/core_principles.md`): Resource management is a core principle
- **Error Handling** (`agent_rules/error_handling.md`): Idle/stuck states are errors requiring handling
- **Autonomy Protocol** (`agent_rules/autonomy_protocol.md`): Autonomous execution must include resource limits

## Metrics

Track resource usage:

- **Idle Timeouts**: Count of times agents/orchestrators stopped due to idle timeout
- **Manual Stops**: Count of times user manually stopped execution
- **Wasted Time**: Time spent in idle/stuck states
- **Resource Usage**: CPU/memory usage during execution

Store in `logs/performance/resource_metrics.log`

## Success Criteria

The system is properly managing resources when:

- ✅ No agent runs for > 10 minutes without progress
- ✅ No orchestrator waits indefinitely for stuck agents
- ✅ Manual stop mechanisms work reliably
- ✅ Repetitive logging is minimized (< 1 duplicate per 30 seconds)
- ✅ Idle timeouts trigger correctly and prevent resource waste
