# Parallel Execution Guide for Epic 1

**Created**: 2026-01-14  
**Status**: Ready to Execute  
**Epic**: Epic 1 - Foundation & Core Infrastructure

## Quick Start: How to Run Multiple Agents in Parallel

**Two Options:**

### Option A: Automated Multi-Agent Orchestration (Recommended for Large Epics)

Use the orchestrator script to spawn multiple agents automatically:

```bash
# Install Cursor CLI (one-time setup)
curl https://cursor.com/install -fsS | bash

# Run orchestrator
node scripts/orchestrate_agents.js --epic epic-1 --groups A,B,C
```

See `docs/MULTI_AGENT_ORCHESTRATION.md` for full documentation.

### Option B: Single-Session Orchestration (For Small Tasks)

For small tasks or sequential work, use single-session orchestration (default behavior).

---

## Manual Setup Steps

### Step 1: Start Docker Services (Required First)

```bash
# Make sure Docker Desktop is running
docker-compose up -d
```

This starts:

- PostgreSQL 15 on port 5432
- Redis 7 on port 6379

### Step 2: Run Database Migration

```bash
cd packages/db
npm run db:migrate
```

This creates the public schema tables (tenants, migrations).

### Step 3: Choose Execution Mode

#### Option A: Multi-Agent Orchestration (For Large Epics)

Run the orchestrator to spawn multiple agents:

```bash
node scripts/orchestrate_agents.js --epic epic-1 --groups A,B,C
```

This will:

- Spawn 3 agents automatically (dev-backend, dev-frontend, qa as needed)
- Coordinate via lock files
- Execute tasks in parallel
- Monitor and handle completion

#### Option B: Single-Session Orchestration (For Small Tasks)

**The agent will execute all tasks in a single session using sequential execution with locks and checkpoints.**

The agent will:

1. **Read the epic plan** - Load `RALPH_WIGGUM_EPIC1_PLAN.md` and related story docs
2. **Build task list** - Create/update tasks in `agent_tasks/todo_progress.json`
3. **Execute task groups sequentially** - Work through independent task groups with clear checkpoints

#### Task Group A: User Model & Database Middleware

**Tasks**:

- Create user model migration for tenant schema
- Create tenant schema creation function
- Create database connection middleware with tenant routing

**Reference**: `docs/stories/1.2.story.md` and `RALPH_WIGGUM_EPIC1_PLAN.md`

#### Task Group B: Frontend OAuth Components

**Tasks**:

- Create "Sign in with Google" button component
- Implement OAuth redirect flow
- Create OAuth callback handler component
- Implement token storage utility

**Reference**: `docs/EPICS_STORIES.md` Story 1.1 and `RALPH_WIGGUM_EPIC1_PLAN.md`

#### Task Group C: Authentication Middleware

**Tasks**:

- Create JWT verification middleware
- Create protected route wrapper
- Implement token refresh endpoint
- Add rate limiting to auth endpoints

**Reference**: `docs/prd.md` Story 1.3 and `RALPH_WIGGUM_EPIC1_PLAN.md`

**Execution Pattern**: The agent will interleave independent tasks (A stub → B core → finish A) to simulate parallel execution while maintaining locks and checkpoints.

### Step 4: Single-Session Coordination Protocol

The agent will coordinate work using:

1. **Check task status**: Read `agent_tasks/todo_progress.json`
2. **Acquire lock**: Create `.lock/[task_id].lock` file before starting each task
3. **Update status**: Mark task as `in_progress` in `todo_progress.json`
4. **Work on task**: Implement the assigned functionality
5. **Run verification**: Execute lint/test/typecheck after each task
6. **Update status**: Mark task as `completed` when done
7. **Release lock**: Delete `.lock/[task_id].lock` file

**Note**: All coordination happens in a single session. The agent executes tasks sequentially with proper locks and checkpoints to simulate parallel execution.

### Step 5: Integration (After Round 2 Completes)

Once all 3 agents complete their tasks, integrate:

- OAuth-Database integration (Group D)
- Connect OAuth callback to user creation
- Store OAuth tokens securely

### Step 6: Testing (Round 4)

Assign QA agent to test all implementations:

- Unit tests for OAuth service
- Unit tests for JWT service
- Integration tests for OAuth flow
- E2E tests for authentication

## Task Status Tracking

All agents should update `agent_tasks/todo_progress.json`:

```json
{
  "task_id": "task-xxx",
  "status": "in_progress",
  "assigned_agent": "Agent-Name",
  "updated_at": "2026-01-14T12:40:00.000Z"
}
```

## File Locking

Before starting work, create a lock file:

```bash
# In packages/db directory
echo "Agent-Name" > .lock/task-xxx.lock
```

After completing work, remove the lock:

```bash
rm .lock/task-xxx.lock
```

## Dependencies

**Group A (User Model)** → **Group D (OAuth Integration)**

- User model must exist before OAuth can create users

**Group C (Auth Middleware)** → **Group D (OAuth Integration)**

- JWT middleware must exist before OAuth can use it

**Group B (Frontend)** → **Independent**

- Can run completely in parallel with backend tasks

## Success Criteria

✅ All 3 agents complete their tasks
✅ No file conflicts (locks prevent this)
✅ All tasks marked complete in `todo_progress.json`
✅ Integration tasks can proceed
✅ Tests pass

## Current Status

- ✅ Database setup complete
- ✅ Prisma schema created
- ✅ Initial migration created and applied
- ✅ Ralph-Wiggum plan ready
- ✅ Round 1: Database foundation - COMPLETE
- ✅ Round 2: All task groups (A, B, C) - COMPLETE
- ✅ Round 3: OAuth-Database integration - COMPLETE
- ✅ Round 4: Testing framework setup - COMPLETE
- ✅ SQL injection vulnerabilities fixed
- ✅ Epic 1 Foundation work - COMPLETE

## Next Action

**The agent will execute these steps automatically:**

1. Start Docker: `docker-compose up -d` (agent executes)
2. Run migration: `cd packages/db && npm run db:migrate` (agent executes)
3. Read epic plan and build task list (agent executes)
4. Begin single-session orchestrated execution (agent executes)

---

**Note**: This guide uses single-session orchestration. The agent executes all tasks in one session using sequential execution with locks and checkpoints. This provides most of the benefit of parallel execution without requiring multiple chat windows. If true multi-agent coordination is needed later (external orchestrator), the same lock/tracker system can be used.
