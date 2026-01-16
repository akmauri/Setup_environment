# Agent Core Principles

This document defines the fundamental principles that all AI agents must follow when working on this project.

## Rule Enforcement

**IMPORTANT**: All agents MUST follow the **Rule Enforcement Protocol** (`agent_rules/rule_enforcement.md`) which ensures automatic compliance with all rules, including:

- No manual orchestration - execute actions directly, never delegate to users
- Ralph-Wiggum process application when appropriate
- Multi-agent coordination when beneficial (or single-session orchestration)
- All pre-action verification checklists
- Quality gates and error handling
- **Timestamp accuracy** - All timestamps must use UTC, be clearly labeled, and be validated (`agent_rules/timestamp_accuracy.md`)
- **Resource management** - Prevent endless execution and resource waste (`agent_rules/resource_management.md`)

**Rule compliance is MANDATORY and AUTOMATIC** - agents must verify rule compliance before every action without requiring reminders.

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

### Epic → Story → Task Execution Strategy

**CRITICAL**: Work follows a hierarchical structure:

1. **Epic Level**: Process epics in order (epic-1, epic-2, epic-3, etc.)
2. **Story Level**: Within each epic, process stories in order (story-1.1, story-1.2, etc.)
3. **Task Level**: Within each story, process tasks by priority and dependencies

**After completing a task**:

- The orchestrator automatically assigns you the next available task
- Continue working autonomously: Epic → Story → Task
- **DO NOT stop** until all tasks are complete or blocked
- **DO NOT ask for permission** to continue

### Task Assignment

- **Never work on unassigned tasks** - All tasks must have an `assigned_agent` field set
- **Check task status** - Only work on tasks with status `pending` or `in_progress` that are assigned to you
- **Update status immediately** - When changing task state, update `todo_progress.json` immediately
- **Lock before work** - Create lock file in `.lock/[task_id].lock` before starting (orchestrator creates it)

### Status Updates

When changing task status, you MUST:

1. Update `status` field in `todo_progress.json`
2. Update `updated_at` timestamp
3. If starting work: Set `assigned_agent` to your agent ID
4. If completing: Move to `completed_tasks.json` with completion metadata
5. If blocking: Document in `agent_tasks/blocked_tasks.md`

### Task Status Flow

```
pending → in_progress → completed
                ↓
            blocked (needs_human_intervention: true)
```

**After task completes or fails**:

- **Continue to next available task** immediately
- Don't stop, don't ask permission
- Orchestrator will assign next task automatically
- Work through Epic → Story → Task systematically

### Human Intervention Tasks

When a task requires human intervention:

- Mark status as `blocked` with `blocked_reason`
- Set `needs_human_intervention: true`
- Increment `retry_count` (after 3 failures, mark as blocked)
- **Continue to next available task** (don't stop progress)
- Human can review blocked tasks later

## Error Logging Requirements

All errors MUST be logged:

1. **Immediate Logging** - Log errors to `logs/agent_errors/[date].md` with full context
2. **Check Common Errors** - Always check `logs/common_errors.md` for known solutions
3. **Update Task** - Increment `retry_count` in `todo_progress.json`
4. **Document Error** - Add `last_error` field with error message
5. **Escalate if Needed** - If `retry_count > 3`, mark task as blocked

## Activity Tracking Requirements

All agent activity MUST be tracked:

1. **Task Status Updates** - Always update `todo_progress.json` when:
   - Starting work: Set `status` to `in_progress`, update `updated_at`
   - Completing work: Set `status` to `completed`, set `actual_completion_time`, update `updated_at`
   - Blocking work: Set `status` to `blocked`, add `blocked_reason`, update `updated_at`
2. **Progress Logging** - Log significant progress to:
   - `logs/agent_activity/[date].md` - Daily activity log
   - Include: timestamp, agent ID, task ID, action taken, result
3. **Decision Logging** - Document significant decisions to:
   - `docs/decisions/[date]_[task_id].md` - Decision rationale and impact
4. **File Changes** - Track file modifications:
   - Git commits with clear messages: `[Agent] [Task-ID] Description`
   - **Periodic commits** every 30 minutes (backup safety - see `agent_rules/git_github_best_practices.md`)
   - **Regular pushes** to GitHub every 2 hours minimum (remote backup)
   - Update relevant documentation when making changes

   **CRITICAL**: See `agent_rules/git_github_best_practices.md` for complete Git/GitHub requirements.

5. **Creating New Tasks** - If you discover a task that needs to be done:
   - Add to `todo_progress.json` with `source: "agent-suggested"`
   - Or use: `node scripts/add_agent_suggested_task.js --description "..." --epic epic-1`
   - Orchestrator will automatically pick it up (lower priority than plan tasks)
6. **Synchronization** - Orchestrator handles automatic sync:
   - ✅ Auto-syncs from `IMPLEMENTATION_PLAN.md` on startup
   - ✅ Auto-syncs every 5 minutes during execution
   - ✅ Loads agent-suggested tasks automatically
   - **You just update `todo_progress.json`** - orchestrator handles the rest

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

## No Manual Orchestration

**CRITICAL**: Agents must execute actions directly, not describe them or delegate to users.

- **Never ask users to**: Open chats, copy/paste, run routine commands, manually coordinate
- **Always execute**: Run commands, create files, update trackers, acquire locks directly
- **Single-session orchestration**: Use locks, checkpoints, and task interleaving in one session
- **Provide evidence**: Show file paths, command output, test results for completion claims

See `agent_rules/no_manual_orchestration.md` for complete protocol.

## Ralph Process Integration

The **Ralph Process** is an autonomous AI agent loop that implements PRD items one at a time until all are complete. It works directly in Cursor's chat interface with Claude.

**When to use Ralph Process:**

- Implementing PRD stories systematically
- Working through a backlog of user stories
- Ensuring all acceptance criteria are met
- Maintaining quality through automated checks

**Ralph Process Files:**

- `prd.json` - PRD in JSON format with story status (`passes: true/false`)
- `progress.txt` - Append-only learnings file
- `scripts/ralph/ralph-prompt.md` - Ralph prompt for Cursor chat
- `scripts/ralph/convert-prd-to-json.js` - PRD converter script

**How to use:**

1. Convert PRD to JSON: `node scripts/ralph/convert-prd-to-json.js docs/prd.md prd.json`
2. Load `scripts/ralph/ralph-prompt.md` in Cursor chat
3. Start Ralph: "Start Ralph process - implement next story from prd.json"

**See**: `docs/RALPH_IMPLEMENTATION.md` for complete documentation.

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
- **Env var handling** - See `agent_rules/env_var_handling.md` for proper env var handling (prevents loops)
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
