# Agent Context Guide

This document is the **single source of truth** for context loading procedures. All agents must follow the context loading priority defined here.

## Context Loading Priority

When an agent starts work, it should load context in this order:

### 1. Task Context (Required)

- `agent_tasks/todo_progress.json` - Current task status and assignment
- `plan/IMPLEMENTATION_PLAN.md` - Current implementation plan
- Related spec files in `specs/` - Task-specific requirements

### 2. Agent Rules (Required)

- `agent_rules/rule_enforcement.md` - **MANDATORY**: Rule compliance protocol (must be checked first)
- `.cursor/rules/file_discovery.md` - **MANDATORY**: File discovery and hidden file verification before file creation
- `agent_rules/no_manual_orchestration.md` - **MANDATORY**: Execute actions directly, never delegate to users
- `agent_rules/testing_validation.md` - **MANDATORY**: Run tests/validation before marking tasks complete
- `agent_rules/core_principles.md` - Fundamental principles
- `agent_rules/error_handling.md` - Error handling protocol
- `agent_rules/parallel_coordination.md` - Coordination rules
- `agent_rules/update_protocol.md` - Rule update process
- `agent_rules/autonomy_protocol.md` - Autonomous execution with red line checks
- `agent_rules/loop_guard.md` - Loop detection and recovery procedures
- `agent_rules/env_var_handling.md` - **MANDATORY**: Environment variable handling (prevents .env loops)
- `agent_rules/iterative_work_pattern.md` - Pattern for iterative tasks (if applicable)
- `ralph_wiggum_process.md` - Ralph-Wiggum parallel agent coordination process

### 3. Project Context (Required)

- `docs/ARCHITECTURE.md` - System architecture
- `docs/prd.md` - Product requirements
- `.cursor/rules/project-overview.mdc` - Project overview
- `.cursor/rules/development-workflow.mdc` - Development workflow

### 4. Domain-Specific Context (As Needed)

- `docs/agent_knowledge/` - Lessons learned
- `logs/common_errors.md` - Common error solutions
- Related code files - Implementation details
- BMAD agent definitions - If using BMAD agents

## Agent-Specific Context

### Developer Agent

**Must Load**:

- Coding standards (`.cursor/rules/code-standards.mdc`)
- Architecture document
- Related code files
- Test files

**Should Load**:

- Agent knowledge for similar tasks
- Common errors related to implementation
- BMAD dev agent definition (if using BMAD)

### QA Agent

**Must Load**:

- Test requirements
- Test frameworks documentation
- Related test files
- Acceptance criteria from specs

**Should Load**:

- Testing patterns from agent knowledge
- Common test errors
- BMAD QA agent definition (if using BMAD)

### Architect Agent

**Must Load**:

- Architecture document
- System design patterns
- Technology stack documentation
- Integration requirements

**Should Load**:

- Architecture decisions from `docs/decisions/`
- BMAD architect agent definition (if using BMAD)

### PM Agent

**Must Load**:

- PRD and project brief
- Epics and stories
- Task status
- Implementation plan

**Should Load**:

- BMAD PM agent definition (if using BMAD)
- Workflow definitions

## BMAD Integration

When using BMAD agents:

1. **Load BMAD Agent Definition**: Load from `.bmad-core/agents/[agent].md`
2. **Load BMAD Config**: Read `.bmad-core/core-config.yaml`
3. **Follow BMAD Workflows**: Use BMAD workflow definitions
4. **Use BMAD Templates**: Reference BMAD templates when applicable

## Context Management

### Avoid Context Overload

- Only load what's needed for current task
- Use subagents for research to keep main context clean
- Reference documents rather than loading entire content
- Use summaries for large documents

### Context Updates

- Update context when requirements change
- Refresh context if working on task for extended time
- Reload context after errors or blockers

### Memory Compaction Recovery

**When memory compaction occurs** (or when resuming work after a break), you MUST:

1. **Check for Task-Specific Context Files**:
   - Look for `agent_tasks/context/[task_id]_context.md`
   - If found, load it first to restore task understanding
   - Review goal, scope, and success criteria

2. **Load Task Progress Files**:
   - Load `agent_tasks/todos/[task_id]_todos.md` if it exists
   - Load `agent_tasks/insights/[task_id]_insights.md` if it exists
   - These files preserve progress across memory compaction

3. **Verify Continuity**:
   - Confirm you understand where work left off
   - Verify no critical information was lost
   - Review any notes or findings already collected

4. **Continue from Last State**:
   - Resume from the last unprocessed item
   - Don't repeat work that's already been done
   - Build on insights already collected

**For iterative tasks**, see `agent_rules/iterative_work_pattern.md` for the complete pattern.

## Context Sources

### Primary Sources

- `docs/` - Project documentation
- `agent_rules/` - Agent coordination rules
- `agent_tasks/` - Task management
- `.cursor/rules/` - Cursor-specific rules
- `.bmad-core/` - BMAD framework (if using)

### Secondary Sources

- `logs/` - Error logs and activity logs
- `docs/agent_knowledge/` - Lessons learned
- `claude_skills/` - Reusable skills
- `specs/` - Task specifications

## Best Practices

1. **Start Fresh**: Load context at start of each task
2. **Stay Focused**: Only load relevant context
3. **Update Regularly**: Refresh context as work progresses
4. **Document Decisions**: Add to agent knowledge when learning
5. **Share Context**: Use agent communication for shared context
