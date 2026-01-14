# Error Handling Protocol

This document defines the standardized error handling process that all agents must follow.

## Error Handling Process

When an error occurs, follow these steps in order:

### Step 1: Immediate Logging

**Action**: Log the error immediately with full context

**Location**: `logs/agent_errors/[YYYY-MM-DD].md`

**Required Information**:

- Timestamp
- Agent ID
- Task ID
- Error message
- Stack trace (if available)
- Context (what was being attempted)
- Environment (dev/staging/prod)
- Related files/modules

**Format**:

```markdown
## [Timestamp] - [Agent ID] - [Task ID]

**Error**: [Error message]

**Context**: [What was being attempted]

**Stack Trace**:
```

[Stack trace if available]

```

**Files Involved**: [List of files]

**Environment**: [dev/staging/prod]
```

### Step 2: Check Common Errors

**Action**: Check `logs/common_errors.md` for known solutions

**Process**:

1. Search for similar error messages or patterns
2. If found, apply the documented solution
3. If solution works, document the resolution
4. If solution doesn't work, proceed to Step 3

### Step 3: Brainstorm Potential Causes

**Action**: If error is unknown, brainstorm 3 potential causes

**Documentation**: Add to error log entry

**Consider**:

- Configuration issues
- Dependency problems
- Data format mismatches
- Permission/access issues
- Environment-specific problems
- Race conditions
- Resource exhaustion

### Step 4: Test Elimination

**Action**: Test elimination from most to least likely cause

**Process**:

1. Start with most likely cause
2. Create test to verify hypothesis
3. If confirmed, fix and test
4. If not confirmed, move to next cause
5. Document each test and result

### Step 5: Document Process and Result

**Action**: Document the entire debugging process

**Location**: Same error log entry

**Include**:

- Hypotheses tested
- Tests performed
- Results of each test
- Final solution
- Root cause analysis
- Prevention strategies

### Step 6: Update Common Errors

**Action**: If new error/solution found, update `logs/common_errors.md`

**Format**:

```markdown
## [Error Pattern/Message]

**Symptoms**: [What you see]

**Root Cause**: [Why it happens]

**Solution**: [How to fix]

**Prevention**: [How to avoid]

**Related Tasks**: [Task IDs where this occurred]
```

### Step 7: Update Task Status

**Action**: Update task in `todo_progress.json`

**Updates Required**:

- Increment `retry_count`
- Set `last_error` to error message
- Update `updated_at` timestamp
- If `retry_count > 3`, change status to `blocked`

### Step 8: Escalation

**Action**: If `retry_count > 3`, escalate task

**Process**:

1. Mark task as `blocked` in `todo_progress.json`
2. Create entry in `agent_tasks/blocked_tasks.md`
3. Document root cause analysis
4. Identify dependencies or blockers
5. Notify project coordinator

## Error Categories

### Category 1: Configuration Errors

**Examples**:

- Missing environment variables
- Incorrect file paths
- Wrong API endpoints
- Invalid credentials

**Resolution**: Check configuration files, environment setup

### Category 2: Dependency Errors

**Examples**:

- Missing packages
- Version conflicts
- Circular dependencies
- Missing services

**Resolution**: Check dependencies, install missing items, resolve conflicts

### Category 3: Data Errors

**Examples**:

- Invalid data format
- Missing required fields
- Type mismatches
- Data corruption

**Resolution**: Validate data, fix format, add validation

### Category 4: Logic Errors

**Examples**:

- Algorithm bugs
- Race conditions
- State management issues
- Edge cases not handled

**Resolution**: Review logic, add tests, fix bugs

### Category 5: Integration Errors

**Examples**:

- API failures
- Service unavailability
- Protocol mismatches
- Authentication failures

**Resolution**: Check external services, verify protocols, retry with backoff

## Retry Logic

### Automatic Retries

For transient errors (network, temporary service unavailability):

1. **First retry**: Immediate (0 seconds)
2. **Second retry**: After 5 seconds
3. **Third retry**: After 15 seconds
4. **Fourth retry**: After 60 seconds
5. **After 4 retries**: Mark as blocked

### Manual Retries

For non-transient errors:

1. Fix the underlying issue
2. Reset `retry_count` to 0
3. Clear `last_error`
4. Change status back to `pending` or `in_progress`

## Error Recovery

### Recovery Strategies

1. **Rollback**: Revert to last known good state
2. **Skip**: Skip non-critical errors and continue
3. **Retry**: Retry with different parameters
4. **Alternative**: Use alternative implementation
5. **Manual Intervention**: Require human intervention

### Recovery Documentation

Document recovery strategy in:

- Error log entry
- Task notes in `todo_progress.json`
- `docs/agent_knowledge/` if lesson learned

## Prevention

### Proactive Measures

1. **Input Validation**: Validate all inputs
2. **Error Boundaries**: Use error boundaries in code
3. **Testing**: Write tests for error cases
4. **Monitoring**: Monitor for error patterns
5. **Documentation**: Document known issues

### Learning from Errors

1. **Pattern Recognition**: Identify common error patterns
2. **Root Cause Analysis**: Understand why errors occur
3. **Process Improvement**: Update processes to prevent errors
4. **Knowledge Sharing**: Share solutions in `logs/common_errors.md`

## Integration with Other Rules

This error handling protocol integrates with:

- **Loop Guard** (`agent_rules/loop_guard.md`): Loops are a type of error that needs recovery
- **Core Principles** (`agent_rules/core_principles.md`): Error handling is part of quality gates
- **Autonomy Protocol** (`agent_rules/autonomy_protocol.md`): Errors can occur during autonomous execution

## Integration with BMAD

This error handling protocol integrates with BMAD:

- **BMAD Tasks**: BMAD tasks should follow this protocol
- **BMAD Agents**: All BMAD agents use this error handling
- **BMAD Workflows**: Workflows include error handling steps
- **BMAD Knowledge Base**: Errors feed into BMAD knowledge base

## Metrics

Track error metrics:

- **Error Rate**: Errors per task
- **Resolution Time**: Time to resolve errors
- **Retry Count**: Average retries per error
- **Common Errors**: Most frequent error types

Store metrics in `logs/performance/[date]_metrics.log`
