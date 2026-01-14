# Parallel Agent Coordination

This document defines how multiple AI agents coordinate when working in parallel on related tasks.

## File-Based Locking Mechanism

### Lock File Format

**Location**: `.lock/[task_id].lock`

**Content** (JSON):
```json
{
  "task_id": "task-123",
  "agent_id": "dev-agent",
  "locked_at": "2026-01-XXT00:00:00Z",
  "expires_at": "2026-01-XXT02:00:00Z",
  "reason": "Implementing feature X",
  "related_files": ["src/feature/x.ts", "src/feature/x.test.ts"]
}
```

### Lock Acquisition

Before starting work on a task:

1. **Check for existing locks** - Look for `.lock/[task_id].lock`
2. **Check expiration** - If lock exists but expired, remove it
3. **Create lock file** - Create lock file with your agent ID
4. **Set expiration** - Default 2 hours, extendable
5. **Verify lock** - Confirm lock file was created successfully

### Lock Release

When completing or pausing work:

1. **Remove lock file** - Delete `.lock/[task_id].lock`
2. **Update task status** - Update `todo_progress.json`
3. **Notify others** - Send message via `agent_comms/` if needed

### Lock Expiration

- **Default**: 2 hours
- **Extension**: Can extend by updating `expires_at`
- **Cleanup**: Expired locks are automatically removed
- **Override**: Only project coordinator can override locks

## Dependency Checking

### Before Starting Work

1. **Check `dependencies` field** - In `todo_progress.json`
2. **Verify dependency status** - All dependencies must be `completed`
3. **Check for blockers** - Dependencies must not be `blocked`
4. **Wait if needed** - If dependencies incomplete, wait or work on other tasks

### Dependency Resolution

- **Automatic**: System checks dependencies before task assignment
- **Manual**: Agents can manually check before starting
- **Notification**: Agents notified when dependencies complete

## Maximum Concurrent Agents

### Limits

- **Related Modules**: Maximum 3 agents on related modules simultaneously
- **Same File**: Only 1 agent per file at a time
- **Same Epic**: Maximum 5 agents per epic
- **Total Active**: Maximum 10 agents working simultaneously

### Enforcement

- **Lock System**: File locks enforce single-agent-per-file
- **Task Assignment**: System prevents over-assignment
- **Monitoring**: Track active agents in `logs/agent_activity/`

## Communication Protocol

### Message Format

**Location**: `agent_comms/[timestamp]_[agent_id].msg`

**Format** (JSON):
```json
{
  "from": "dev-agent",
  "to": ["architect-agent", "qa-agent"],
  "timestamp": "2026-01-XXT00:00:00Z",
  "type": "coordination|question|notification|blocker",
  "subject": "Brief subject",
  "message": "Detailed message",
  "related_tasks": ["task-123", "task-456"],
  "related_files": ["src/feature/x.ts"],
  "urgency": "low|medium|high|critical",
  "requires_response": true,
  "response_by": "2026-01-XXT01:00:00Z"
}
```

### Message Types

1. **coordination**: Coordinating work on related tasks
2. **question**: Asking for information or clarification
3. **notification**: Informing about changes or completion
4. **blocker**: Reporting a blocker that affects others

### Communication Rules

1. **Check messages** - Before starting work, check `agent_comms/` for relevant messages
2. **Respond promptly** - Respond to messages requiring response within 1 hour
3. **Use appropriate urgency** - Mark urgency correctly
4. **Include context** - Always include related tasks and files
5. **Archive old messages** - Move messages older than 7 days to archive

### Message Priority

- **critical**: Immediate attention required (blockers)
- **high**: Response within 1 hour
- **medium**: Response within 4 hours
- **low**: Response within 24 hours

## Coordination Patterns

### Pattern 1: Sequential Dependencies

**Scenario**: Task B depends on Task A

**Coordination**:
1. Agent A completes Task A
2. Agent A sends notification to Agent B
3. Agent B starts Task B after verifying completion

### Pattern 2: Parallel Independent

**Scenario**: Tasks A and B are independent

**Coordination**:
1. Both agents work simultaneously
2. No communication needed unless conflicts arise
3. Both update status independently

### Pattern 3: Shared Resources

**Scenario**: Tasks A and B modify same file/module

**Coordination**:
1. Agent A acquires lock
2. Agent A completes work and releases lock
3. Agent A notifies Agent B
4. Agent B acquires lock and proceeds

### Pattern 4: Integration Points

**Scenario**: Multiple agents working on components that integrate

**Coordination**:
1. Agents communicate interface requirements
2. Agents work in parallel on separate components
3. Agents coordinate integration testing
4. Agents resolve conflicts together

## Conflict Resolution

### File Conflicts

**Detection**:
- Lock file exists for same file
- Multiple agents try to modify same file

**Resolution**:
1. Check lock expiration
2. Communicate with locking agent
3. Coordinate changes
4. Use version control merge if needed

### Dependency Conflicts

**Detection**:
- Circular dependencies
- Conflicting requirements

**Resolution**:
1. Document conflict in `agent_comms/`
2. Escalate to project coordinator
3. Redesign dependencies if needed

### Resource Conflicts

**Detection**:
- Too many agents on related modules
- Resource exhaustion

**Resolution**:
1. Queue tasks appropriately
2. Prioritize based on dependencies
3. Limit concurrent work

## Best Practices

### Before Starting Work

1. ✅ Check for locks on related files
2. ✅ Verify all dependencies complete
3. ✅ Check for relevant messages
4. ✅ Acquire necessary locks
5. ✅ Notify affected agents

### During Work

1. ✅ Keep locks current (extend if needed)
2. ✅ Communicate significant changes
3. ✅ Update status regularly
4. ✅ Document decisions

### After Completing Work

1. ✅ Release all locks
2. ✅ Update task status
3. ✅ Notify dependent tasks
4. ✅ Send completion notification
5. ✅ Archive communication

## Integration with BMAD

This coordination system integrates with BMAD:

- **BMAD Orchestrator**: Uses this system for workflow coordination
- **BMAD Agents**: All agents follow these coordination rules
- **BMAD Workflows**: Workflows define coordination points
- **BMAD Tasks**: Tasks include dependency information

## Monitoring

### Active Locks

Track active locks in:
- `.lock/` directory (file system)
- `logs/agent_activity/[date]/locks.log`

### Agent Activity

Track agent activity in:
- `logs/agent_activity/[date]/[agent]_[task].log`
- `agent_tasks/todo_progress.json` (status updates)

### Communication

Track communication in:
- `agent_comms/` directory
- Summary in `logs/agent_activity/[date]/communications.log`

## Tools and Utilities

### Lock Management Script

**Location**: `scripts/manage_locks.js`

**Functions**:
- List active locks
- Remove expired locks
- Force unlock (coordinator only)
- Check lock conflicts

### Dependency Checker

**Location**: `scripts/check_dependencies.js`

**Functions**:
- Verify task dependencies
- Find blocking tasks
- Suggest task order
- Generate dependency graph

### Communication Helper

**Location**: `scripts/send_message.js`

**Functions**:
- Send formatted messages
- Check for pending messages
- Archive old messages
- Generate communication reports
