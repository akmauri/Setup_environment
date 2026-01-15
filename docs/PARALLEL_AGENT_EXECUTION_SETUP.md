# Parallel Agent Execution Setup

**Created**: 2026-01-15  
**Purpose**: Enable true parallel execution with multiple agents working simultaneously

## Overview

This system enables multiple Cursor agents to work in parallel on different tasks, coordinating via file locks and communication channels.

## Quick Start

### Step 1: Assign Tasks to Agents

```bash
node scripts/parallel_agent_coordinator.js --story=2.5 --assign
```

This will:

- Break down Story 2.5 tasks
- Assign tasks to specialized agents (dev-oauth-1, dev-oauth-2, dev-backend-1, qa-1, etc.)
- Create agent prompt files in `agent_prompts/`

### Step 2: Start Multiple Agents

**Option A: Manual (Recommended for now)**

1. Open multiple Cursor windows (one per agent)
2. In each window, load the corresponding agent prompt:
   - Window 1: Load `agent_prompts/dev-oauth-1.md`
   - Window 2: Load `agent_prompts/dev-oauth-2.md`
   - Window 3: Load `agent_prompts/dev-backend-1.md`
   - etc.

3. Each agent will:
   - Read their assigned tasks
   - Acquire locks before starting work
   - Work autonomously
   - Update task status
   - Release locks when done

**Option B: Automated (Future)**

Once Cursor CLI is available, the orchestrator can spawn agents automatically.

### Step 3: Monitor Progress

```bash
# Check task status
cat agent_tasks/todo_progress.json | jq '.tasks[] | select(.story_id=="2.5")'

# Check active locks
ls -la .lock/

# Check agent communications
ls -la agent_comms/
```

## Agent Coordination

### File Locks

Before starting work, agents acquire locks:

- Location: `.lock/[task_id].lock`
- Format: JSON with agent_id, locked_at, expires_at
- Expiration: 2 hours (auto-removed if expired)

### Task Status

Agents update `agent_tasks/todo_progress.json`:

- `pending` → `in_progress` (when starting)
- `in_progress` → `completed` (when done)
- Updates `assigned_agent`, `updated_at`, `actual_completion_time`

### Communication

Agents communicate via `agent_comms/`:

- Messages: `[timestamp]_[agent_id].msg`
- Format: JSON with from, to, message, urgency

## Agent Types

- **dev-oauth-{N}**: OAuth integration specialists (3 agents)
- **dev-backend-{N}**: Backend developers (2 agents)
- **qa-{N}**: QA testers (2 agents)

## Parallel Execution Rules

1. **Maximum 3 agents** on related modules simultaneously
2. **Maximum 10 agents** working total
3. **One agent per file** at a time (enforced by locks)
4. **Dependencies respected** (agents wait for dependencies)

## Example: Story 2.5 (LinkedIn OAuth)

### Task Groups

**Group 1: OAuth Config & Setup** (dev-oauth-1)

- Task 2.5.1: Create LinkedIn OAuth config
- Task 2.5.2: Add LinkedIn OAuth scopes

**Group 2: Service Implementation** (dev-oauth-1, dev-oauth-2, dev-oauth-3)

- Task 2.5.3: Create LinkedIn service
- Task 2.5.4: Exchange code for tokens
- Task 2.5.5: Exchange for long-lived tokens
- Task 2.5.6: Refresh tokens
- Task 2.5.7: Get personal profile
- Task 2.5.8: Get company pages
- Task 2.5.9: Get company page info

**Group 3: Routes & Endpoints** (dev-backend-1, dev-backend-2)

- Task 2.5.10: OAuth initiation endpoint
- Task 2.5.11: OAuth callback handler
- Task 2.5.16: List accounts endpoint
- Task 2.5.17: Disconnect endpoint
- Task 2.5.19: Update label endpoint
- Task 2.5.22: Health check endpoint

**Group 4: Integration** (dev-oauth-2)

- Task 2.5.12: Support personal profiles
- Task 2.5.13: Support company pages
- Task 2.5.14: Store accounts
- Task 2.5.15: Update token refresh service

**Group 5: Testing** (qa-1, qa-2)

- All testing tasks (if any)

## Agent Workflow

Each agent follows this workflow:

1. **Load Context**
   - Read `plan/IMPLEMENTATION_PLAN.md`
   - Read `specs/linkedin-oauth-integration.md`
   - Read relevant code files

2. **Find Next Task**
   - Check `agent_tasks/todo_progress.json`
   - Find assigned task with status `pending`
   - Verify dependencies are complete
   - Check no lock exists

3. **Acquire Lock**
   - Create `.lock/[task_id].lock`
   - Update task status to `in_progress`

4. **Implement**
   - Write code
   - Follow coding standards
   - Add tests if needed

5. **Verify**
   - Run `npm run type-check`
   - Run `npm run lint`
   - Fix any issues

6. **Commit**
   - Stage changes
   - Commit with message: `[Agent-ID] [Task-ID] Description`

7. **Complete**
   - Mark task as `completed` in `todo_progress.json`
   - Release lock
   - Move to next task

## Monitoring

### Check Active Agents

```bash
# List active locks (shows which agents are working)
ls -la .lock/

# Check task assignments
cat agent_tasks/todo_progress.json | jq '.tasks[] | select(.assigned_agent) | {task_id, assigned_agent, status}'
```

### Check Progress

```bash
# Count completed tasks
cat agent_tasks/todo_progress.json | jq '[.tasks[] | select(.story_id=="2.5" and .status=="completed")] | length'

# List in-progress tasks
cat agent_tasks/todo_progress.json | jq '.tasks[] | select(.story_id=="2.5" and .status=="in_progress")'
```

## Troubleshooting

### Lock Conflicts

If a lock exists but agent is not working:

1. Check lock expiration: `cat .lock/[task_id].lock`
2. If expired, remove: `rm .lock/[task_id].lock`
3. Agent can retry

### Dependency Issues

If task is blocked by dependencies:

1. Check dependency status in `todo_progress.json`
2. Wait for dependencies to complete
3. Or work on other available tasks

### Agent Stuck

If agent appears stuck:

1. Check `agent_comms/` for messages
2. Check lock expiration
3. Manually release lock if needed
4. Reassign task if necessary

## Next Steps

1. Run task assignment: `node scripts/parallel_agent_coordinator.js --story=2.5 --assign`
2. Open multiple Cursor windows
3. Load agent prompts in each window
4. Agents work autonomously in parallel
5. Monitor progress via `todo_progress.json` and locks
