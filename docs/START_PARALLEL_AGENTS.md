# Starting Parallel Agents with Claude Code

**Status**: Ready to Execute  
**Story**: 2.5 - LinkedIn OAuth Integration  
**Agent Type**: Claude Code (Primary), Cursor Browser (Fallback)

## Quick Start: True Parallel Execution

### Step 1: Open Multiple Claude Code Agents

1. **Open First Claude Code Agent:**
   - Click "Claude Code: Open" (or use the agent dropdown)
   - This opens a new Claude Code agent window

2. **Repeat for Each Agent:**
   - Open 6 Claude Code agent windows total (one per assigned agent)
   - Or start with 2-3 agents and add more as needed

### Step 2: Load Agent Prompts

In each Claude Code agent window, load the corresponding prompt:

**Agent 1 (dev-oauth-1):**

```
Load: agent_prompts/dev-oauth-1.md
```

**Agent 2 (dev-oauth-2):**

```
Load: agent_prompts/dev-oauth-2.md
```

**Agent 3 (dev-oauth-3):**

```
Load: agent_prompts/dev-oauth-3.md
```

**Agent 4 (dev-backend-1):**

```
Load: agent_prompts/dev-backend-1.md
```

**Agent 5 (dev-backend-2):**

```
Load: agent_prompts/dev-backend-2.md
```

**Agent 6 (qa-1):**

```
Load: agent_prompts/qa-1.md
```

### Step 3: Agents Work Autonomously

Each agent will:

1. Read their assigned tasks from `agent_tasks/todo_progress.json`
2. Check dependencies and locks
3. Acquire locks before starting work
4. Implement tasks autonomously
5. Run verification (type-check, lint)
6. Commit changes
7. Release locks
8. Move to next task

**No user input required** - agents work continuously until all tasks complete.

## Agent Assignment Summary

### dev-oauth-1 (5 tasks)

- Task 2.5.1: Create LinkedIn OAuth config ✅ (already done)
- Task 2.5.2: Add LinkedIn OAuth scopes ✅ (already done)
- Task 2.5.3: Create LinkedIn service ✅ (already done)
- Task 2.5.4: Exchange code for tokens ✅ (already done)
- Task 2.5.5: Exchange for long-lived tokens ✅ (already done)

### dev-oauth-2 (5 tasks)

- Task 2.5.6: Refresh LinkedIn tokens
- Task 2.5.7: Get personal profile
- Task 2.5.8: Get company pages
- Task 2.5.9: Get company page info
- Task 2.5.12: Support personal profiles

### dev-oauth-3 (4 tasks)

- Task 2.5.13: Support company pages
- Task 2.5.14: Store accounts
- Task 2.5.15: Update token refresh service
- Task 2.5.21: Validate tokens

### dev-backend-1 (4 tasks)

- Task 2.5.10: OAuth initiation endpoint
- Task 2.5.11: OAuth callback handler
- Task 2.5.16: List accounts endpoint
- Task 2.5.17: Disconnect endpoint

### dev-backend-2 (4 tasks)

- Task 2.5.18: Token revocation
- Task 2.5.19: Update label endpoint
- Task 2.5.20: Tier limit enforcement
- Task 2.5.22: Health check endpoint

### qa-1 (3 tasks)

- Task 2.5.23: Display account type
- Task 2.5.24: Error handling for permissions
- Task 2.5.25: Error handling for access problems

## Fallback: Cursor Browser Agents

If you run out of Claude Code credits:

1. **Switch to Cursor Browser Agents:**
   - Use the agent dropdown to select "Cursor Browser" agents
   - Load the same agent prompts
   - Agents will work the same way, just using browser-based execution

2. **Hybrid Approach:**
   - Use Claude Code for complex tasks (services, logic)
   - Use Cursor Browser for simpler tasks (routes, endpoints)

## Monitoring Parallel Execution

### Check Active Agents

```bash
# List active locks (shows which agents are working)
ls -la .lock/

# Check task progress
cat agent_tasks/todo_progress.json | jq '.tasks[] | select(.story_id=="2.5") | {task_id, assigned_agent, status}'
```

### Check Completion

```bash
# Count completed tasks
cat agent_tasks/todo_progress.json | jq '[.tasks[] | select(.story_id=="2.5" and .status=="completed")] | length'

# List in-progress tasks
cat agent_tasks/todo_progress.json | jq '.tasks[] | select(.story_id=="2.5" and .status=="in_progress")'
```

## Current Status

- ✅ Infrastructure ready (locks, communication, task tracking)
- ✅ Tasks assigned to 6 agents
- ✅ Agent prompts created
- ⏳ **Waiting for parallel agents to start**

## Next Action

**Open 6 Claude Code agent windows and load the agent prompts to start true parallel execution.**

Each agent will work autonomously, coordinating via file locks and task status.
