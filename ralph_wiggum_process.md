# Ralph-Wiggum Parallel Agent Coordination Process

This document describes the Ralph-Wiggum process for breaking down work into the smallest possible units and coordinating parallel agent execution.

## Overview

The Ralph-Wiggum process is named after the principle of breaking work into "tiny tasks" - the smallest possible units that can be completed independently. This enables maximum parallelization and efficient agent coordination.

## The Four Phases

### Phase 1: Task Analysis (Claude)

**Goal**: Break work into the smallest possible units

**Process**:
1. **Analyze Requirements**: Understand what needs to be built
2. **Identify Dependencies**: Map what depends on what
3. **Break into Units**: Create tasks that pass the "One Sentence Without 'And'" test
4. **Estimate Complexity**: Classify each unit as low/medium/high complexity
5. **Document Specs**: Create spec files in `specs/` directory

**Output**:
- Spec files in `specs/` (one per "Topic of Concern")
- Task breakdown in `plan/IMPLEMENTATION_PLAN.md`
- Dependency graph

**Tools**:
- Use `plan/PROMPT_PLANNING.md` for this phase
- Create specs that are single, focused topics

**Success Criteria**:
- Each task can be described in one sentence without "and"
- Dependencies are clearly identified
- Complexity is estimated
- Specs are clear and actionable

### Phase 2: Agent Assignment (Auto-LLM)

**Goal**: Assign tasks to agents based on specialty and load

**Process**:
1. **Load Task List**: Read `agent_tasks/todo_progress.json`
2. **Identify Available Agents**: Check agent capabilities and current load
3. **Match Tasks to Agents**: Assign based on:
   - Agent specialty (Dev, QA, Architect, etc.)
   - Current workload
   - Task complexity
   - Agent availability
4. **Load Balance**: Distribute work evenly
5. **Set Timeouts**: Define maximum time per task
6. **Set Fallbacks**: Define what happens if agent fails

**Output**:
- Updated `agent_tasks/todo_progress.json` with assignments
- Agent work queues
- Timeout and fallback configurations

**Rules**:
- Maximum 3 agents on related modules simultaneously
- Maximum 10 agents working total
- Assign based on agent specialty
- Balance workload across agents

**Success Criteria**:
- All tasks have assigned agents
- Workload is balanced
- Dependencies respected
- Timeouts and fallbacks set

### Phase 3: Parallel Execution

**Goal**: Execute independent units simultaneously

**Process**:
1. **Check Dependencies**: Agents verify dependencies are complete
2. **Acquire Locks**: Agents acquire file locks for their work
3. **Execute Tasks**: Agents work on assigned tasks in parallel
4. **Update Status**: Agents update task status regularly
5. **Handle Dependencies**: Dependent tasks queue appropriately
6. **Progress Aggregation**: System aggregates progress

**Coordination**:
- File-based locking (`.lock/[task_id].lock`)
- Agent communication (`agent_comms/`)
- Status updates (`todo_progress.json`)
- Dependency checking

**Success Criteria**:
- Independent tasks run simultaneously
- Dependent tasks wait appropriately
- No conflicts or race conditions
- Progress tracked accurately

### Phase 4: Integration & Testing

**Goal**: Assemble completed units and validate

**Process**:
1. **Assemble Units**: Combine completed tasks
2. **Run Integration Tests**: Test how units work together
3. **Fix Integration Issues**: Resolve any conflicts or issues
4. **Validate**: Ensure everything works as expected
5. **Deploy or Iterate**: Deploy if complete, or iterate if needed

**Output**:
- Integrated system
- Test results
- Deployment artifacts (if ready)
- Lessons learned

**Success Criteria**:
- All units integrate successfully
- Tests pass
- System works end-to-end
- Documentation updated

## The "One Sentence Without 'And'" Test

Each task must be describable in a single sentence without using "and". This ensures tasks are:

- **Focused**: One clear objective
- **Atomic**: Can't be broken down further
- **Testable**: Clear success criteria
- **Independent**: Minimal dependencies

**Examples**:

✅ **Good**: "Create React component for login form with email/password fields"
✅ **Good**: "Implement JWT token generation service"
✅ **Good**: "Write unit tests for user authentication endpoint"

❌ **Bad**: "Implement user authentication and profile management" (uses "and", two separate concerns)
❌ **Bad**: "Set up database and create user model" (uses "and", two separate tasks)
❌ **Bad**: "Build authentication system" (too vague, could be broken down)

## Specs Directory Structure

**Location**: `specs/`

**Format**: One file per "Topic of Concern"

**Naming**: `[topic].md` (e.g., `user-authentication.md`, `oauth-integration.md`)

**Content**:
- Clear description of the topic
- Requirements
- Acceptance criteria
- Dependencies
- Technical notes

**Example**:
```markdown
# User Authentication

## Description
Implement Google OAuth 2.0 authentication for user login.

## Requirements
- OAuth flow with Google
- JWT token generation
- Session management

## Acceptance Criteria
- User can sign in with Google
- JWT token is generated
- Session is maintained

## Dependencies
- Google OAuth credentials configured
- Database user model exists

## Technical Notes
- Use NextAuth.js for OAuth
- Store tokens securely
```

## Integration with BMAD

The Ralph-Wiggum process integrates with BMAD:

- **BMAD Planning**: Ralph-Wiggum Phase 1 aligns with BMAD planning
- **BMAD Agents**: BMAD agents execute Ralph-Wiggum Phase 3 tasks
- **BMAD Workflows**: BMAD workflows can use Ralph-Wiggum breakdown
- **BMAD Tasks**: BMAD tasks follow Ralph-Wiggum principles

## Tools and Prompts

### Planning Prompt

**Location**: `plan/PROMPT_PLANNING.md`

**Purpose**: Guide Phase 1 task analysis

**Usage**: Load this prompt when analyzing requirements

### Building Prompt

**Location**: `plan/PROMPT_BUILDING.md`

**Purpose**: Guide Phase 3 parallel execution

**Usage**: Load this prompt in autonomous loop

### Implementation Plan

**Location**: `plan/IMPLEMENTATION_PLAN.md`

**Purpose**: Living document with prioritized TODO list

**Maintained By**: Planning phase, updated by building phase

## Autonomous Loop

The building phase runs in an autonomous loop:

```bash
while [ tasks remain ]; do
  cat plan/PROMPT_BUILDING.md | claude
  # Loop continues until plan is complete
done
```

**Loop Steps**:
1. Load context (specs, plan, code)
2. Select top-priority task
3. Implement task
4. Apply backpressure (run tests)
5. Update plan
6. Commit changes
7. Loop

**Exit Conditions**:
- All tasks complete
- Manual stop (Ctrl+C)
- Error requiring intervention
- Max iterations reached

## Best Practices

1. **Break Down Aggressively**: Smaller is better
2. **Test Early**: Write tests alongside code
3. **Document Decisions**: Record why, not just what
4. **Communicate**: Keep agents informed
5. **Iterate Quickly**: Fast feedback loops

## Metrics

Track Ralph-Wiggum process metrics:

- **Task Breakdown**: Average tasks per epic
- **Parallelization**: Average concurrent agents
- **Completion Time**: Time per task
- **Integration Success**: Percentage of successful integrations

Store in `logs/performance/ralph_wiggum_metrics.log`
