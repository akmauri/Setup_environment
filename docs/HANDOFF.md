# System Handoff Documentation

This document provides a complete overview of the AI Agent Development System for handoff to future agents or team members.

## System Overview

The AI Agent Development System is a comprehensive framework for coordinating multiple AI agents in enterprise web application development. It integrates with the existing BMAD (Build-Measure-Analyze-Deploy) framework to provide:

- Unified task management
- Agent coordination and communication
- Error handling and recovery
- Autonomous execution with safety checks
- Comprehensive logging and monitoring
- Documentation validation
- Integration with Claude skills and MCP servers

## Key Components

### 1. Task Management System

**Location**: `agent_tasks/`

**Files**:

- `todo_progress.json` - Machine-readable task list
- `completed_tasks.json` - Archive of completed work
- `blocked_tasks.md` - Analysis of blocked tasks

**Usage**:

- All agents must check this before starting work
- Update status immediately when changing task state
- Use migration script to convert from markdown: `node scripts/migrate_tasks.js`

### 2. Agent Rules

**Location**: `agent_rules/`

**Files**:

- `core_principles.md` - Fundamental principles all agents must follow
- `error_handling.md` - Standardized error handling protocol
- `parallel_coordination.md` - How agents coordinate parallel work
- `update_protocol.md` - How rules are updated
- `autonomy_protocol.md` - Autonomous execution with red line checks
- `loop_guard.md` - Loop detection and recovery procedures

**Usage**:

- All agents must read these before starting work
- Follow protocols exactly
- Flag violations

### 3. Logging System

**Location**: `logs/`

**Structure**:

- `agent_activity/[date]/` - Agent activity logs
- `build/` - Build logs
- `deployment/` - Deployment logs
- `performance/` - Performance metrics
- `agent_errors/[date].md` - Error logs
- `common_errors.md` - Knowledge base of common errors
- `autonomy/` - Autonomy decision logs

**Usage**:

- Log all errors immediately
- Check `common_errors.md` before escalating
- Use log rotation: `node scripts/log_rotation.js`

### 4. Ralph-Wiggum Process

**Location**: `specs/`, `plan/`, `ralph_logs/`

**Files**:

- `ralph_wiggum_process.md` - Process documentation
- `plan/PROMPT_PLANNING.md` - Planning phase prompt
- `plan/PROMPT_BUILDING.md` - Building phase prompt
- `plan/IMPLEMENTATION_PLAN.md` - Living implementation plan

**Usage**:

- Use for breaking down work into smallest units
- Follow three-phase process
- Each task must pass "One Sentence Without 'And'" test

### 5. Agent Coordination

**Location**: `.lock/`, `agent_comms/`

**Tools**:

- `scripts/manage_locks.js` - Lock management
- `scripts/check_dependencies.js` - Dependency checking
- `scripts/send_message.js` - Inter-agent communication

**Usage**:

- Acquire locks before modifying files
- Check dependencies before starting
- Communicate via `agent_comms/` when needed

### 6. Documentation System

**Location**: `docs/agent_knowledge/`

**Usage**:

- Document lessons learned
- Categorize by domain
- Validate with: `node scripts/validate_docs.js`

### 7. Claude Skills

**Location**: `claude_skills/`

**Files**:

- `skill_registry.json` - Registry of all skills
- `skill_development_guide.md` - How to create skills

**Usage**:

- Create skills for repetitive tasks
- Register in `skill_registry.json`
- Follow development guide

### 8. MCP Servers

**Location**: `mcp_servers/`

**Files**:

- `implementation_guide.md` - When and how to implement MCP servers
- `../workflow_decision_tree.md` - n8n vs code decision framework

**Usage**:

- Follow guide for MCP server implementation
- Use decision tree for n8n vs code choices

### 9. GitHub Integration

**Location**: `.github/workflows/`

**Files**:

- `ai_agent_pr.yml` - PR validation workflow
- `documentation_check.yml` - Documentation validation
- `PULL_REQUEST_TEMPLATE.md` - PR template

**Usage**:

- Automatically validates PRs
- Checks task assignments
- Validates documentation

### 10. Cursor Configuration

**Location**: `.cursor/rules/`

**Files**:

- `agent_context.md` - What context each agent should load
- `file_organization.md` - Naming conventions and structure
- `security_rules.md` - Security requirements

**Usage**:

- Agents load context as specified
- Follow file organization rules
- Never commit secrets

## Quick Start Guide

### For New Agents

1. **Read Agent Rules**:
   - Start with `agent_rules/core_principles.md`
   - Read `agent_rules/error_handling.md`
   - Read `agent_rules/autonomy_protocol.md`

2. **Check Task Status**:
   - Read `agent_tasks/todo_progress.json`
   - Find assigned tasks or unassigned tasks
   - Check dependencies

3. **Before Starting Work**:
   - Acquire lock: `node scripts/manage_locks.js check <task_id>`
   - Check for messages: `node scripts/send_message.js --check <agent_id>`
   - Load context as per `agent_context.md`

4. **During Work**:
   - Update task status in `todo_progress.json`
   - Log errors to `logs/agent_errors/[date].md`
   - Check `logs/common_errors.md` for solutions
   - Follow autonomy protocol for decisions

5. **After Completing Work**:
   - Release lock
   - Update task to completed
   - Move to `completed_tasks.json`
   - Document lessons learned

### For Project Coordinators

1. **Monitor Progress**:
   - Check `agent_tasks/todo_progress.json`
   - Review `logs/agent_activity/`
   - Check `human_review/flagged_not_blocking.md`

2. **Handle Blocking Issues**:
   - Review `human_review/blocking_issues.md`
   - Make decisions
   - Update status

3. **Review Flags**:
   - Weekly review of flagged items
   - Resolve or acknowledge
   - Update documentation if needed

4. **Maintain System**:
   - Run log rotation weekly
   - Review and update rules monthly
   - Validate documentation regularly

## Integration with BMAD

See `docs/bmad_integration.md` for complete integration guide.

**Key Points**:

- New system complements BMAD
- BMAD agents must follow new rules
- Task management syncs with BMAD workflows
- Shared logging and coordination

## Validation

Run validation to ensure system is working:

```bash
# Validate tasks
node scripts/validate_tasks.js

# Validate documentation
node scripts/validate_docs.js

# Check task assignments
node scripts/check_task_assignments.js

# Run full checklist
# See scripts/validation_checklist.md
```

## Troubleshooting

### Common Issues

1. **Lock conflicts**: Use `node scripts/manage_locks.js cleanup`
2. **Dependency issues**: Use `node scripts/check_dependencies.js`
3. **Task validation errors**: Check `scripts/validate_tasks.js` output
4. **Documentation drift**: Run `node scripts/validate_docs.js`

### Getting Help

1. Check `logs/common_errors.md`
2. Review `docs/agent_knowledge/`
3. Check agent rules
4. Review integration docs

## Maintenance Schedule

- **Daily**: Check for blocking issues
- **Weekly**: Review flags, run log rotation
- **Monthly**: Review and update rules, validate documentation
- **Quarterly**: Comprehensive system review

## Success Criteria

System is working correctly when:

- ✅ All tasks in machine-readable format
- ✅ Agents coordinate without conflicts
- ✅ Errors are logged and recoverable
- ✅ Documentation stays in sync
- ✅ Autonomy protocol prevents breaking changes
- ✅ GitHub workflows validate PRs
- ✅ Monitoring dashboard shows real-time status

## Next Steps

1. Review this handoff document
2. Run validation scripts
3. Test with sample tasks
4. Monitor first few agent interactions
5. Adjust as needed

## Support

For questions or issues:

1. Check this document
2. Review agent rules
3. Check logs
4. Review integration docs
5. Check BMAD documentation

---

**System Version**: 1.0.0
**Last Updated**: 2026-01-XX
**Status**: Ready for Use
