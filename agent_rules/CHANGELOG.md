# Agent Rules Changelog

## v1.1.0 - 2026-01-XX

### Added
- **Iterative Work Pattern** (`agent_rules/iterative_work_pattern.md`): New rule defining a three-file pattern (Context, Todos, Insights) for iterative tasks that require processing multiple items, collecting insights, and maintaining context across memory compaction events.

### Changed
- **Agent Context Guide** (`.cursor/rules/agent_context.md`): 
  - Added "Memory Compaction Recovery" section with explicit procedures for recovering context after memory compaction
  - Added `iterative_work_pattern.md` to required Agent Rules list
  
- **Core Principles** (`agent_rules/core_principles.md`):
  - Added "Optional: Task-Specific File Creation" section after Mandatory Pre-Work Checklist
  - Documents when and how to use the three-file pattern for iterative tasks

- **File Organization** (`.cursor/rules/file_organization.md`):
  - Added new task file locations to "Task Files" section:
    - `agent_tasks/context/[task_id]_context.md`
    - `agent_tasks/todos/[task_id]_todos.md`
    - `agent_tasks/insights/[task_id]_insights.md`
  - Added `iterative_work_pattern.md` to "Agent Rules" section

### Rationale
These changes improve agent continuity and progress tracking for iterative tasks by:
- Providing persistent context files that survive memory compaction
- Enabling visible progress tracking with markdown todos
- Supporting iterative insights collection
- Formalizing recovery procedures after memory compaction events

### Impact
- **Affected Agents**: All agents working on iterative tasks
- **Affected Processes**: Task initialization, progress tracking, memory compaction recovery
- **Breaking Changes**: None - this is an additive enhancement
- **Migration Required**: No - existing tasks continue to work, new iterative tasks can optionally use this pattern

---

## v1.0.0 - 2026-01-XX

### Added
- Core Principles (`agent_rules/core_principles.md`)
- Error Handling Protocol (`agent_rules/error_handling.md`)
- Parallel Agent Coordination (`agent_rules/parallel_coordination.md`)
- Agent Rules Update Protocol (`agent_rules/update_protocol.md`)
- Autonomous Execution Protocol (`agent_rules/autonomy_protocol.md`)
- Loop Guard (`agent_rules/loop_guard.md`)
