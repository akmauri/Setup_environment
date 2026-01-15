# Multi-Agent Orchestration Guide

**Version**: 1.0.0  
**Last Updated**: 2026-01-14  
**Status**: ✅ Ready for Use

## Overview

The Multi-Agent Orchestration system enables true parallel execution of tasks by spawning multiple Cursor agent sessions automatically. This provides genuine parallelism for large epics and independent tasks.

## When to Use Multi-Agent Orchestration

### Use Multi-Agent When:

- ✅ **Large Epics**: Epic has 10+ independent tasks
- ✅ **Multiple Groups**: Epic has 3+ independent task groups (A, B, C)
- ✅ **Different Specialties**: Tasks require different agent types (backend, frontend, QA)
- ✅ **True Parallelism Needed**: Tasks can genuinely run simultaneously
- ✅ **Time Constraints**: Need maximum speed for deadline

### Use Single-Session When:

- ✅ **Small Tasks**: < 5 tasks or sequential dependencies
- ✅ **Simple Work**: All tasks similar type/complexity
- ✅ **Debugging**: Need full context in one session
- ✅ **Prototyping**: Exploring approaches before parallelizing

## Setup

### 1. Install Cursor CLI

The orchestrator requires Cursor CLI to spawn agent sessions:

```bash
curl https://cursor.com/install -fsS | bash
```

Verify installation:

```bash
cursor-agent --version
```

### 2. Verify Agent Rules

Ensure all agent rules are in place:

- ✅ `agent_rules/parallel_coordination.md` - Multi-agent coordination rules
- ✅ `agent_rules/no_manual_orchestration.md` - Updated for orchestrator
- ✅ `agent_rules/core_principles.md` - Core agent behavior

### 3. Initialize Directories

The orchestrator automatically creates needed directories:

- `.lock/` - Lock files for coordination
- `agent_comms/` - Agent-to-agent communication
- `logs/orchestrator/` - Orchestrator execution logs

## Usage

### Basic Usage

#### Run Epic Tasks by Groups

```bash
node scripts/orchestrate_agents.js --epic epic-1 --groups A,B,C
```

This will:

1. Load tasks from `agent_tasks/todo_progress.json` for epic-1
2. Filter to groups A, B, C
3. Spawn appropriate agents for each task
4. Coordinate via lock files
5. Monitor progress and handle completion

#### Run Specific Tasks

```bash
node scripts/orchestrate_agents.js --tasks task-123,task-456,task-789
```

#### Use Configuration File

```bash
node scripts/orchestrate_agents.js --config orchestrator.config.json
```

#### Memory Management (Workaround)

If you encounter memory issues, use the memory limit flag:

```bash
# Increase memory limit to 4GB
node scripts/orchestrate_agents.js --epic epic-1 --max-memory 4096 --max-concurrent 2

# Or use npm script
npm run orchestrate:high-memory -- --epic epic-1 --groups A,B
```

**Note**: See `docs/TECHNICAL_DEBT.md` (TD-001) for details on memory limitations and workarounds. Single-session orchestration works perfectly and is recommended for most cases.

### Configuration File

Create `orchestrator.config.json`:

```json
{
  "epic": "epic-1",
  "groups": ["A", "B", "C"],
  "maxConcurrent": 3,
  "monitorInterval": 5000,
  "agentOverrides": {
    "task-123": "dev-frontend",
    "task-456": "qa"
  }
}
```

### Known Limitations

**Memory Limits**: The orchestrator may hit Node.js heap limits when spawning multiple agents. See `docs/TECHNICAL_DEBT.md` (TD-001) for details.

**Workarounds**:

1. Use `--max-memory` flag to increase heap limit
2. Reduce concurrency with `--max-concurrent 1`
3. Use single-session orchestration (recommended default)

### Advanced Options

```bash
# Limit concurrent agents
node scripts/orchestrate_agents.js --epic epic-1 --max-concurrent 2

# Run specific groups
node scripts/orchestrate_agents.js --epic epic-1 --groups A,B

# Combine options
node scripts/orchestrate_agents.js --epic epic-1 --groups A,B,C --max-concurrent 5
```

## How It Works

### 1. Task Loading

Orchestrator loads tasks from `agent_tasks/todo_progress.json`:

- Filters by epic, groups, or specific task IDs
- Sorts by priority and dependencies
- Filters to pending/in_progress tasks only

### 2. Agent Assignment

Matches tasks to agents based on:

- **Task Type**: Identifies backend/frontend/testing tasks
- **Agent Specialty**: Maps to dev-backend, dev-frontend, qa, architect
- **Current Load**: Selects agent with lowest load
- **Concurrency Limits**: Respects max concurrent per agent type

### 3. Task Execution

For each task:

1. **Check Dependencies**: Verifies all dependencies completed
2. **Acquire Lock**: Creates `.lock/[task_id].lock` file
3. **Spawn Agent**: Launches Cursor CLI agent session
4. **Monitor Progress**: Watches agent output and status
5. **Handle Completion**: Updates status, releases lock, notifies dependents

### 4. Coordination

Agents coordinate via:

- **Lock Files**: Prevent conflicts (`.lock/[task_id].lock`)
- **Task Tracker**: Shared status (`agent_tasks/todo_progress.json`)
- **Communication**: Messages (`agent_comms/[timestamp]_[agent].msg`)
- **Dependencies**: Automatic dependency checking

### 5. Monitoring

Orchestrator continuously:

- Monitors active agents
- Checks for completed tasks
- Processes queue for new tasks
- Handles failures and retries
- Logs all activity

## Agent Types

### dev-backend

- **Specialty**: backend, database, api, middleware
- **Max Concurrent**: 2
- **Used For**: Database migrations, API endpoints, services, middleware

### dev-frontend

- **Specialty**: frontend, ui, components, pages
- **Max Concurrent**: 2
- **Used For**: React components, pages, UI utilities

### qa

- **Specialty**: testing, qa, validation
- **Max Concurrent**: 1
- **Used For**: Unit tests, integration tests, E2E tests

### architect

- **Specialty**: architecture, design, planning
- **Max Concurrent**: 1
- **Used For**: Architecture decisions, design patterns, planning

## Example: Epic 1 Execution

### Before (Single-Session)

```
Single Agent: 45 minutes
├── Group A: 15 min
├── Group B: 15 min
├── Group C: 15 min
```

### After (Multi-Agent)

```
3 Agents in Parallel: 15 minutes
├── Agent 1 (dev-backend): Group A - 15 min
├── Agent 2 (dev-frontend): Group B - 15 min
└── Agent 3 (dev-backend): Group C - 15 min

Total Time: 15 minutes (3x faster)
```

## Monitoring

### View Active Locks

```bash
node scripts/manage_locks.js list
```

### Check Task Status

```bash
node scripts/manage_locks.js check task-123
```

### View Orchestrator Logs

```bash
tail -f logs/orchestrator/orchestrator-*.log
```

### Check Agent Messages

```bash
node scripts/send_message.js --check all
```

## Troubleshooting

### Cursor CLI Not Found

```bash
# Install Cursor CLI
curl https://cursor.com/install -fsS | bash

# Verify installation
cursor-agent --version
```

### Agents Not Starting

- Check Cursor CLI is installed and in PATH
- Verify tasks exist in `todo_progress.json`
- Check dependencies are completed
- Review orchestrator logs

### Lock Conflicts

```bash
# List active locks
node scripts/manage_locks.js list

# Remove expired locks
node scripts/manage_locks.js cleanup

# Force remove lock (coordinator only)
node scripts/manage_locks.js remove task-123 --force
```

### Agent Failures

- Check agent output in orchestrator logs
- Verify task requirements are clear
- Check for dependency issues
- Review agent rules compliance

## Best Practices

1. **Break Down Tasks**: Use Ralph-Wiggum process to create atomic tasks
2. **Identify Dependencies**: Clearly mark dependencies in `todo_progress.json`
3. **Match Specialties**: Ensure tasks match agent specialties
4. **Monitor Progress**: Watch logs and task status regularly
5. **Handle Failures**: Review failed tasks and retry or fix

## Integration with Existing Systems

### Ralph-Wiggum Process

- ✅ Orchestrator works with Ralph-Wiggum task breakdown
- ✅ Respects "One Sentence Without 'And'" principle
- ✅ Handles atomic task units

### BMAD Integration

- ✅ Can use BMAD agent definitions
- ✅ Integrates with BMAD workflows
- ✅ Respects BMAD task structure

### Lock/Tracker System

- ✅ Uses existing lock file format
- ✅ Updates `todo_progress.json` automatically
- ✅ Follows `parallel_coordination.md` rules

## Limitations

1. **Cursor CLI Required**: Must have Cursor CLI installed
2. **True Parallelism**: Limited by system resources and Cursor API limits
3. **Task Granularity**: Works best with atomic, independent tasks
4. **Manual Intervention**: May need manual review for complex failures

## Next Steps

1. **Test Orchestrator**: Run with a small epic to verify setup
2. **Monitor Performance**: Compare single-session vs multi-agent times
3. **Tune Configuration**: Adjust maxConcurrent based on system resources
4. **Expand Usage**: Use for larger epics as confidence grows

---

**For Single-Session Orchestration**: See `agent_rules/no_manual_orchestration.md`  
**For Coordination Rules**: See `agent_rules/parallel_coordination.md`  
**For Task Management**: See `RALPH_WIGGUM_EPIC1_PLAN.md`
