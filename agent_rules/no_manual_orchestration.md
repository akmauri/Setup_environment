# No Manual Orchestration Protocol - Mandatory Rule

**Version**: v1.0.0  
**Last Updated**: 2026-01-14  
**Purpose**: Prevent agents from delegating execution to users and ensure agents execute work directly

## Directive

**The agent MUST NOT instruct the user to perform routine execution steps that the agent can do itself.**

**For single-session work**: The agent must orchestrate work INSIDE the current session using task decomposition, locks, checkpoints, and automatic status updates.

**For multi-agent work**: An automated orchestrator script (`scripts/orchestrate_agents.js`) handles spawning and coordinating multiple agent sessions. Agents should NOT manually coordinate with each other - the orchestrator handles this.

## Rule 1: No Manual Orchestration (Mandatory)

### Policy

The agent MUST NOT instruct the user to:

- Open additional Cursor chats/windows manually
- Copy/paste prompts into other chats manually
- Manually coordinate multiple agents (use orchestrator script instead)
- Perform routine execution steps that the agent can do itself:
  - Running commands (docker, migrations, tests, scripts)
  - Creating files (code, config, documentation)
  - Editing code (implementations, fixes, updates)
  - Updating JSON (task trackers, configs, lock files)
  - Creating lock files
  - Updating status trackers

### Required Behavior

If parallel work is desired, the agent must orchestrate it INSIDE the current session by:

1. **Decomposing work into task groups** - Break work into independent task groups using Ralph-Wiggum principles
2. **Acquiring locks** - Create `.lock/[task_id].lock` files before starting each task
3. **Executing tasks sequentially (simulated parallel)** - Work through task groups with clear checkpoints:
   - Implement Task A stub → Task B core → return to finish Task A
   - Interleave independent tasks to simulate parallel execution
4. **Updating task tracker files automatically** - Update `agent_tasks/todo_progress.json` after each task
5. **Verifying with tests and/or runtime checks** - Run verification (lint/test/typecheck) after each task group

### Allowed User Requests

The agent may only ask the user to do something manual if:

- It requires credentials/SSO/2FA the agent cannot access, OR
- It requires a GUI-only action outside the repo (e.g., approving a deployment in a web UI), OR
- It requires human product judgment/approval (e.g., "Should we use approach A or B?")

In these cases, the agent must:

- Explain why the manual step is unavoidable
- Minimize the ask to the smallest single action
- Resume execution immediately after the user completes it

### Prohibited Output

Any response containing the following is non-compliant:

- "Open X Cursor chats"
- "Copy/paste this into chat"
- "Run this command in another terminal"
- "Open a new chat window and..."
- "Manually coordinate..."
- "You should now..."
- Similar delegation language that asks the user to perform routine execution

## Rule 2: Execute the Guide, Don't Describe It (Mandatory)

### Default Mode

The agent must prefer taking actions over describing actions.

### When a Guide/Checklist Exists

If a file like `PARALLEL_EXECUTION_GUIDE.md` exists, the agent must:

1. **Open and follow it** - Read the guide and understand the steps
2. **Run the required commands** - Use the terminal tool to execute commands (docker, migrations, etc.)
3. **Perform the edits directly** - Make code changes, create files, update configs
4. **Update status trackers** - Update `agent_tasks/todo_progress.json` automatically
5. **Record verification results** - Run tests/logs and document results

### Output Contract

Responses must be in this order:

1. **"What I changed"** - Files/commands actually executed (not planned)
2. **"Evidence"** - Paths, diff summary, command output summary
3. **"Next single action I'm executing now"** - Not asking the user, but stating what's being done

The agent must not output a "Next action: run X" unless it is immediately executing X in the same flow.

### Prohibited Output

- "Next step: run docker-compose up -d" (without actually running it)
- "You should now execute..." (without executing it)
- "The next action is..." (without taking that action)
- Checklists of actions for the user to perform

## Rule 3: Execution Orchestration (Mandatory)

### Single-Session Orchestration (Default)

For most tasks, use single-session orchestration:

### Goal

Simulate parallel agents in one session by batching tasks with locks and checkpoints.

### Protocol

1. **Read the epic plan + story docs** - Load referenced docs (e.g., `RALPH_WIGGUM_EPIC1_PLAN.md`, `docs/stories/*`)
2. **Build a task list with IDs and dependencies** - Create or update task list in `agent_tasks/todo_progress.json`
3. **For each task**:
   a) **Acquire lock**: Create `.lock/[task_id].lock` with agent name + timestamp
   b) **Mark in_progress**: Update `agent_tasks/todo_progress.json` with status `in_progress`
   c) **Implement changes**: Make code changes, create files, update configs in the repo
   d) **Run verification**: Execute the smallest verification (lint/test/typecheck or targeted script)
   e) **Mark completed**: Update `agent_tasks/todo_progress.json` with status `completed` + timestamp
   f) **Release lock**: Delete `.lock/[task_id].lock` file

### Concurrency Note

Even in a single chat, tasks can be interleaved:

- Implement Task A stub → Task B core → return to finish Task A
- Work on independent tasks in sequence to simulate parallel execution

But must preserve:

- Locks + tracker updates for each task
- Clear checkpoints between task groups
- Dependency verification before starting dependent tasks

### Multi-Agent Orchestration (For Large Epics)

For large epics or when true parallel execution is needed, use the automated orchestrator:

```bash
# Spawn multiple agents automatically
node scripts/orchestrate_agents.js --epic epic-1 --groups A,B,C

# Or run specific tasks in parallel
node scripts/orchestrate_agents.js --tasks task-1,task-2,task-3

# Or use a config file
node scripts/orchestrate_agents.js --config orchestrator.config.json
```

**The orchestrator:**

- Automatically spawns multiple Cursor CLI agent sessions
- Assigns tasks to appropriate agent specialties (dev-backend, dev-frontend, qa, etc.)
- Manages locks and dependencies
- Monitors progress and handles failures
- Updates `todo_progress.json` automatically
- No manual coordination needed

**Agents running under orchestrator:**

- Follow all agent rules (`agent_rules/parallel_coordination.md`)
- Use lock files for coordination
- Check dependencies before starting
- Update task status in `todo_progress.json`
- Communicate via `agent_comms/` if needed

### Completion Criteria

No task is "done" without:

- Code changes saved
- Verification run (lint/test/typecheck)
- Tracker updated (`todo_progress.json`)
- Lock released

## Rule 4: Anti-Paperwork / No Fake Progress (Mandatory)

### Policy

The agent must not claim:

- "ready", "complete", "done", "foundation is complete", "system is ready"
- "tasks are assigned", "plan is ready", "ready for execution"

unless it provides evidence:

- File paths changed OR commands run OR tests passing
- Actual code/files created or modified
- Verification results documented

### Required Evidence

When claiming completion or readiness, the agent must provide:

- **File paths**: List of files created/modified
- **Command output**: Summary of commands executed and their results
- **Test results**: Test output or verification status
- **Status updates**: Evidence of `todo_progress.json` updates

### Planning vs. Execution

If only planning occurred, must label it as:

- "Planning only — no repo state changes yet."
- "Task breakdown complete — ready to execute."
- "Analysis complete — implementation pending."

### Prohibited Claims

- "Foundation is complete" (without showing files created)
- "System is ready" (without showing what was built)
- "Tasks are ready" (without showing task list created)
- "Ready for parallel execution" (without showing execution plan in tracker)

## Integration with Existing Systems

### Ralph-Wiggum Process Integration

This protocol integrates with Ralph-Wiggum process:

- **Phase 1 (Task Analysis)**: Agent breaks down tasks using "One Sentence Without 'And'" test
- **Phase 2 (Agent Assignment)**: Agent assigns tasks to itself in `todo_progress.json` (single-session = self-assignment)
- **Phase 3 (Parallel Execution)**: Agent executes tasks sequentially with locks and checkpoints (simulated parallel)
- **Phase 4 (Integration)**: Agent integrates completed tasks and runs tests

**Key Point**: Ralph-Wiggum's parallel execution is achieved through single-session sequential execution with proper task decomposition and interleaving.

### Multi-Agent Coordination Integration

This protocol works with multi-agent coordination rules:

- **Lock files**: Same `.lock/[task_id].lock` format
- **Task tracker**: Same `agent_tasks/todo_progress.json` format
- **Dependency checking**: Same dependency verification process
- **Communication**: Uses `agent_comms/` if needed (though single-session reduces need)

**Key Point**: True multi-agent coordination is available via `scripts/orchestrate_agents.js`. The orchestrator:

- Spawns multiple Cursor CLI agent sessions automatically
- Uses the same lock/tracker system for coordination
- Handles dependency management and task assignment
- Monitors agent progress and handles failures
- Requires no manual coordination from users or agents

For single-session work, use single-session orchestration. For large epics or parallel execution needs, use the orchestrator.

### Parallel Execution Guide Integration

The `PARALLEL_EXECUTION_GUIDE.md` should be updated to reflect single-session execution:

- Remove "Open 3 separate Cursor chat windows" instructions
- Replace with "Execute tasks sequentially with locks and checkpoints"
- Keep task groups and dependencies
- Keep lock file protocol
- Keep status tracking

## Execution Pattern

### Example: Executing Epic 1 Tasks

**Before (Non-Compliant)**:

```
"Open 3 Cursor chats and assign:
- Chat 1: Backend agent - User model
- Chat 2: Frontend agent - OAuth components
- Chat 3: Backend agent - Auth middleware"
```

**After (Compliant)**:

```
1. Reading RALPH_WIGGUM_EPIC1_PLAN.md and task list
2. Acquiring lock for task-group-a (User Model)
3. Creating user model migration [executing now]
4. Updating todo_progress.json [executing now]
5. Releasing lock for task-group-a
6. Acquiring lock for task-group-b (OAuth Components)
7. Creating SignInButton component [executing now]
...
```

## Verification Checklist

Before responding, verify:

- [ ] I am not asking the user to open chats or copy/paste
- [ ] I am not asking the user to run commands I can run
- [ ] I am executing actions, not just describing them
- [ ] I am updating task trackers automatically
- [ ] I am creating/releasing lock files
- [ ] I am providing evidence (file paths, command output) for any completion claims
- [ ] I am following single-session orchestration protocol
- [ ] I am not claiming "ready" or "complete" without evidence

## Violations

Violations of this rule should be:

1. **Immediately corrected** - Agent must re-respond with compliant behavior
2. **Documented** - Logged in `logs/agent_errors/[date].md`
3. **Escalated** - If systemic issue, update agent rules

## Best Practices

1. **Default to Execution**: When in doubt, execute rather than describe
2. **Batch Related Tasks**: Group independent tasks and execute them in sequence
3. **Use Checkpoints**: Clear checkpoints between task groups
4. **Provide Evidence**: Always show what was changed/executed
5. **Update Trackers**: Keep `todo_progress.json` current
6. **Respect Locks**: Use lock files even in single-session to maintain protocol

## Metrics

Track orchestration metrics:

- **Manual Delegations Prevented**: Count of times agent avoided asking user
- **Tasks Executed Directly**: Count of tasks agent executed vs. described
- **Evidence Provided**: Count of completion claims with evidence
- **Single-Session Efficiency**: Time saved by single-session vs. manual coordination

Store in `logs/performance/orchestration_metrics.log`

## Agent Activation Directive

Every agent activation MUST include:

```markdown
## NO MANUAL ORCHESTRATION DIRECTIVE

You operate under mandatory no-manual-orchestration rules. You MUST:

1. Execute actions directly, not describe them
2. Orchestrate work in single session using locks and checkpoints
3. Update task trackers automatically
4. Provide evidence for any completion claims
5. Never ask user to open chats, copy/paste, or run routine commands

If a guide exists (like PARALLEL_EXECUTION_GUIDE.md), you must execute it yourself.
```

## Updates to This Rule

See `agent_rules/update_protocol.md` for how this rule is updated. This rule should be reviewed when:

- New orchestration patterns emerge
- Violations indicate missing guidance
- Process improvements are identified
- External orchestrator is added (would update but not replace this rule)
