# Validation Checklist

Use this checklist to validate all components of the AI agent development system.

## Task Management System

- [ ] `agent_tasks/todo_progress.json` exists and is valid JSON
- [ ] `agent_tasks/completed_tasks.json` exists and is valid JSON
- [ ] `agent_tasks/blocked_tasks.md` exists
- [ ] Migration script works: `node scripts/migrate_tasks.js`
- [ ] Task validation works: `node scripts/validate_tasks.js`
- [ ] All tasks have required fields
- [ ] Dependencies resolve correctly
- [ ] Status values are valid

## Agent Rules

- [ ] `agent_rules/core_principles.md` exists
- [ ] `agent_rules/error_handling.md` exists
- [ ] `agent_rules/parallel_coordination.md` exists
- [ ] `agent_rules/update_protocol.md` exists
- [ ] `agent_rules/autonomy_protocol.md` exists
- [ ] All rules are well-formatted
- [ ] Rules reference each other correctly

## Logging System

- [ ] `logs/` directory structure exists
- [ ] `logs/common_errors.md` exists
- [ ] Log rotation script works: `node scripts/log_rotation.js`
- [ ] Log directories are created correctly
- [ ] Log files follow naming conventions

## Ralph-Wiggum Process

- [ ] `ralph_wiggum_process.md` exists
- [ ] `specs/` directory exists
- [ ] `plan/` directory exists
- [ ] `ralph_logs/` directory exists
- [ ] `plan/PROMPT_PLANNING.md` exists
- [ ] `plan/PROMPT_BUILDING.md` exists
- [ ] `plan/IMPLEMENTATION_PLAN.md` exists

## Agent Coordination

- [ ] `.lock/` directory exists
- [ ] `agent_comms/` directory exists
- [ ] Lock management script works: `node scripts/manage_locks.js`
- [ ] Dependency checker works: `node scripts/check_dependencies.js`
- [ ] Message script works: `node scripts/send_message.js`

## Documentation System

- [ ] `docs/agent_knowledge/` directory exists
- [ ] `docs/agent_knowledge/README.md` exists
- [ ] Documentation validation works: `node scripts/validate_docs.js`
- [ ] Documentation structure is correct

## Claude Skills

- [ ] `claude_skills/` directory exists
- [ ] `claude_skills/skill_registry.json` exists
- [ ] `claude_skills/skill_development_guide.md` exists
- [ ] Registry is valid JSON

## MCP Servers

- [ ] `mcp_servers/` directory exists
- [ ] `mcp_servers/implementation_guide.md` exists
- [ ] `workflow_decision_tree.md` exists

## GitHub Integration

- [ ] `.github/workflows/` directory exists
- [ ] `.github/workflows/ai_agent_pr.yml` exists
- [ ] `.github/workflows/documentation_check.yml` exists
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` exists
- [ ] Workflows are valid YAML

## Cursor Configuration

- [ ] `.cursor/rules/agent_context.md` exists
- [ ] `.cursor/rules/file_organization.md` exists
- [ ] `.cursor/rules/security_rules.md` exists
- [ ] All rules are well-formatted

## Validation Scripts

- [ ] `scripts/validate_tasks.js` works
- [ ] `scripts/validate_docs.js` works
- [ ] `scripts/check_task_assignments.js` works
- [ ] All scripts have shebangs
- [ ] All scripts are executable

## Monitoring

- [ ] Monitoring dashboard instructions exist
- [ ] Dashboard template exists (if applicable)

## BMAD Integration

- [ ] Integration documentation exists
- [ ] BMAD agents reference new rules
- [ ] Workflows integrate with new systems

## Risk Assessment

- [ ] Risk assessment document exists
- [ ] All risks are documented
- [ ] Mitigation strategies are defined

## Final Validation

- [ ] All directories created
- [ ] All files created
- [ ] All scripts work
- [ ] Documentation is complete
- [ ] Integration is documented
