# Agent Core Principles

This document defines the fundamental principles that all AI agents must follow when working on this project.

## Mandatory Pre-Work Checklist

Before starting any work, every agent MUST:

1. **Check `agent_tasks/todo_progress.json`** - Verify task assignment and status
2. **Verify Task Assignment** - Never work on unassigned tasks
3. **Check Dependencies** - Ensure all dependencies are completed
4. **Review Agent Rules** - Read relevant agent rules files (see `.cursor/rules/agent_context.md` for required rules)
5. **Check for Locks** - Verify no other agent is working on related tasks

### Optional: Task-Specific File Creation

For **iterative tasks** (analysis, extraction, review, data collection), consider creating task-specific files:

1. **Context File** (`agent_tasks/context/[task_id]_context.md`) - Goal, scope, constraints
2. **Todos File** (`agent_tasks/todos/[task_id]_todos.md`) - Trackable items with check-offs
3. **Insights File** (`agent_tasks/insights/[task_id]_insights.md`) - Findings collected iteratively

**When to use**: Tasks that process multiple items, collect insights over time, or may span memory compaction events.

**See**: `agent_rules/iterative_work_pattern.md` for complete pattern and guidelines.

## Task Management Rules

### Task Assignment

- **Never work on unassigned tasks** - All tasks must have an `assigned_agent` field set
- **Check task status** - Only work on tasks with status `pending` or `in_progress` that are assigned to you
- **Update status immediately** - When changing task state, update `todo_progress.json` immediately
- **Lock before work** - Create lock file in `.lock/[task_id].lock` before starting

### Status Updates

When changing task status, you MUST:

1. Update `status` field in `todo_progress.json`
2. Update `updated_at` timestamp
3. If starting work: Set `assigned_agent` to your agent ID
4. If completing: Move to `completed_tasks.json` with completion metadata
5. If blocking: Document in `agent_tasks/blocked_tasks.md`

### Task Status Flow

```
pending → in_progress → review → completed
                ↓
            blocked
```

## Error Logging Requirements

All errors MUST be logged:

1. **Immediate Logging** - Log errors to `logs/agent_errors/[date].md` with full context
2. **Check Common Errors** - Always check `logs/common_errors.md` for known solutions
3. **Update Task** - Increment `retry_count` in `todo_progress.json`
4. **Document Error** - Add `last_error` field with error message
5. **Escalate if Needed** - If `retry_count > 3`, mark task as blocked

## Decision Documentation

All significant decisions MUST be documented:

- **Location**: `docs/decisions/[date]_[task_id].md`
- **Format**: Include decision, rationale, alternatives considered, impact
- **Update**: Keep decisions current and remove outdated ones

## Agent Coordination

### Never Modify Another Agent's Work

- **Check lock files** - Never modify files that have active locks
- **Coordinate changes** - Use `agent_comms/` for communication
- **Respect boundaries** - Don't modify another agent's in-progress work without explicit coordination

### Communication Protocol

- Use `agent_comms/[timestamp]_[agent].msg` for inter-agent communication
- Include: sender, receiver, message, related task IDs, urgency
- Check for messages before starting work

## Integration with BMAD System

This system integrates with the existing BMAD framework:

- **BMAD Agents** - All BMAD agents (PM, Architect, Dev, QA, etc.) must follow these principles
- **BMAD Workflows** - These rules complement BMAD workflows, not replace them
- **BMAD Tasks** - BMAD task definitions should reference these principles
- **BMAD Orchestrator** - The orchestrator enforces these rules during workflow execution

## Context Loading

For detailed context loading procedures and priority order, see `.cursor/rules/agent_context.md`.

## File Organization

- **Follow naming conventions** - See `.cursor/rules/file_organization.md`
- **Maintain structure** - Keep files in appropriate directories
- **Update documentation** - Keep docs in sync with code

## Security Rules

- **Never commit secrets** - See `.cursor/rules/security_rules.md`
- **Use environment variables** - All sensitive data in `.env` files
- **Validate inputs** - Always validate user inputs and API responses

## Quality Gates

Before marking a task complete:

1. ✅ Code implemented and follows standards
2. ✅ Tests written and passing
3. ✅ Documentation updated
4. ✅ No linter errors
5. ✅ Task status updated in `todo_progress.json`
6. ✅ Lock file removed
7. ✅ Communication sent if needed
8. ✅ No loops detected (see `agent_rules/loop_guard.md`)

## Violations

Violations of these principles should be:

1. Documented in `logs/agent_errors/[date].md`
2. Reported to project coordinator
3. Used to update agent rules if systemic issue

## Updates to These Rules

See `agent_rules/update_protocol.md` for how these rules are updated.
