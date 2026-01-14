# File Organization Rules

This document defines naming conventions, directory structure, and file placement guidelines.

## Directory Structure

### Core Directories

```
/
├── agent_tasks/          # Task management (JSON)
├── agent_rules/          # Agent coordination rules
├── agent_comms/          # Inter-agent communication
├── logs/                 # All logging
│   ├── agent_activity/   # Agent activity logs
│   ├── build/            # Build logs
│   ├── deployment/       # Deployment logs
│   ├── performance/     # Performance metrics
│   └── agent_errors/     # Error logs
├── specs/                # Task specifications
├── plan/                 # Implementation plans
├── ralph_logs/           # Ralph-Wiggum process logs
├── .lock/                # File locks (gitignored)
├── docs/                 # Documentation
│   ├── agent_knowledge/  # Lessons learned
│   ├── architecture/     # Architecture docs
│   ├── api/              # API documentation
│   └── workflows/        # Workflow documentation
├── claude_skills/        # Claude skills
├── mcp_servers/          # MCP server implementations
├── scripts/              # Utility scripts
└── .github/              # GitHub workflows
```

## Naming Conventions

### Files

**Markdown Files**:

- Use kebab-case: `file-name.md`
- Be descriptive: `user-authentication-spec.md` not `auth.md`
- Use consistent prefixes: `spec-`, `plan-`, `rule-`

**Code Files**:

- TypeScript/JavaScript: camelCase for files, PascalCase for components
- Python: snake_case
- Follow language conventions

**Configuration Files**:

- Use standard names: `package.json`, `tsconfig.json`, `.env`
- Use descriptive names for custom configs: `agent-config.json`

**Log Files**:

- Date-based: `YYYY-MM-DD.log` or `YYYY-MM-DD_agent_task.log`
- Include agent/task identifier when relevant

### Directories

- Use kebab-case: `agent-tasks/`, `agent-rules/`
- Be descriptive: `user-authentication/` not `auth/`
- Keep flat when possible, nest only when necessary

## File Placement Rules

### Documentation

- **Project docs**: `docs/`
- **Architecture**: `docs/architecture/`
- **API docs**: `docs/api/`
- **Workflows**: `docs/workflows/`
- **Agent knowledge**: `docs/agent_knowledge/`

### Code

- **Source code**: `src/` or `apps/` (monorepo)
- **Tests**: Co-located or `tests/` or `__tests__/`
- **Configs**: Root or `config/`

### Tasks and Planning

- **Task specs**: `specs/`
- **Implementation plans**: `plan/`
- **Task JSON**: `agent_tasks/`

### Logs

- **By date**: `logs/[category]/YYYY-MM-DD/`
- **By agent**: `logs/agent_activity/[date]/[agent]_[task].log`

## File Organization Principles

### 1. Single Source of Truth

- One file per concept
- No duplicates
- Update existing files, don't create new ones

### 2. Logical Grouping

- Group related files together
- Use subdirectories for organization
- Keep related files close

### 3. Discoverability

- Use clear, descriptive names
- Follow consistent patterns
- Document structure in README files

### 4. Scalability

- Structure supports growth
- Easy to add new files
- Clear where new files belong

## Specific Rules

### Task Files

- Task JSON: `agent_tasks/todo_progress.json`
- Completed tasks: `agent_tasks/completed_tasks.json`
- Blocked tasks: `agent_tasks/blocked_tasks.md`
- Task context: `agent_tasks/context/[task_id]_context.md` (for iterative tasks)
- Task todos: `agent_tasks/todos/[task_id]_todos.md` (for iterative tasks)
- Task insights: `agent_tasks/insights/[task_id]_insights.md` (for iterative tasks)

### Agent Rules

- Core principles: `agent_rules/core_principles.md`
- Error handling: `agent_rules/error_handling.md`
- Coordination: `agent_rules/parallel_coordination.md`
- Updates: `agent_rules/update_protocol.md`
- Autonomy: `agent_rules/autonomy_protocol.md`
- Loop guard: `agent_rules/loop_guard.md`
- Iterative work pattern: `agent_rules/iterative_work_pattern.md`

### Specs

- One file per topic: `specs/[topic].md`
- Pass "One Sentence Without 'And'" test
- Clear, focused topics

### Scripts

- Utility scripts: `scripts/`
- Use descriptive names: `migrate_tasks.js`, `validate_docs.js`
- Include shebang: `#!/usr/bin/env node`

## Gitignore Rules

### Always Ignore

- `.lock/` - Lock files
- `node_modules/` - Dependencies
- `.env` - Environment variables
- `*.log` - Log files (or specific log directories)
- `.DS_Store` - OS files
- `dist/`, `build/` - Build outputs

### Consider Ignoring

- `logs/` - If logs are temporary
- `.cursor/` - Cursor-specific (project-dependent)
- Temporary files

## Integration with BMAD

BMAD structure is separate but complementary:

- **BMAD core**: `.bmad-core/` (BMAD framework)
- **Project structure**: Root directories (this project)
- **Integration**: Reference BMAD from project files

## Best Practices

1. **Be Consistent**: Follow established patterns
2. **Be Descriptive**: Names should be self-explanatory
3. **Keep Flat**: Avoid deep nesting when possible
4. **Document Structure**: README files in key directories
5. **Review Regularly**: Reorganize if structure becomes messy

## Migration

When reorganizing:

1. Update all references
2. Update documentation
3. Test that everything still works
4. Commit reorganization separately
5. Document changes
