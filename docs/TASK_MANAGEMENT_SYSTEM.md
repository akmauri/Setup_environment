# Task Management System: PRD → Epics → Stories → Tasks

**Last Updated**: 2026-01-16  
**Status**: ✅ **IMPLEMENTED**

## Overview

The task management system ensures a complete work breakdown structure from PRD to executable tasks, with automatic synchronization to `todo_progress.json` so the orchestrator always has work available.

## Hierarchy

```
PRD (docs/prd.md)
  └─> Epics (12 epics defined)
       └─> Stories (100+ stories defined)
            └─> Tasks (in IMPLEMENTATION_PLAN.md)
                 └─> todo_progress.json (orchestrator source of truth)
```

## Components

### 1. PRD (Product Requirements Document)

**Location**: `docs/prd.md`

**Contains**:

- 12 Epics with goals
- 100+ User Stories with acceptance criteria
- Functional and non-functional requirements

**Authority**: Primary source for epic and story definitions

### 2. Implementation Plan

**Location**: `plan/IMPLEMENTATION_PLAN.md`

**Contains**:

- Stories organized by priority
- Tasks for each story with:
  - Task number (e.g., `Task 1.5.1`)
  - Description
  - Complexity (low, medium, high)
  - Dependencies
  - Completion status

**Format**:

```markdown
### Story 1.5: Health Check & System Status

**Story ID**: 1.5  
**Epic**: Foundation & Core Infrastructure  
**Status**: In Progress

- [x] Task 1.5.1: Create health check route handler [Complexity: low] [Dependencies: none]
- [ ] Task 1.5.2: Return 200 OK status [Complexity: low] [Dependencies: Task 1.5.1]
```

### 3. Story Files

**Location**: `docs/stories/*.story.md`

**Contains**:

- Detailed story definitions
- Acceptance criteria
- Technical context
- Task breakdowns

**Note**: Story files are created by BMAD workflow, but tasks flow from IMPLEMENTATION_PLAN.md

### 4. todo_progress.json

**Location**: `agent_tasks/todo_progress.json`

**Purpose**: Source of truth for orchestrator task assignment

**Structure**:

```json
{
  "$schema": "...",
  "version": "1.0.0",
  "last_updated": "2026-01-16T...",
  "tasks": [
    {
      "epic_id": "epic-1",
      "story_id": "story-1.5",
      "task_id": "task-1234567890-1",
      "description": "Create health check route handler",
      "status": "pending",
      "priority": 1,
      "dependencies": [],
      "estimated_complexity": "low",
      ...
    }
  ]
}
```

## Task Flow

### Creation Flow

1. **PRD Created** → Defines epics and stories
2. **Stories Created** → BMAD workflow creates story files
3. **Tasks Defined** → Tasks added to `IMPLEMENTATION_PLAN.md`
4. **Tasks Populated** → `populate_tasks_from_plan.js` syncs to `todo_progress.json`
5. **Orchestrator Reads** → Orchestrator loads tasks from `todo_progress.json`

### Update Flow

1. **Task Completed** → Agent updates `todo_progress.json` (status: `completed`)
2. **Task Blocked** → Agent updates `todo_progress.json` (status: `blocked`)
3. **New Tasks Added** → Added to `IMPLEMENTATION_PLAN.md`, then synced

## Scripts

### populate_tasks_from_plan.js

**Purpose**: Populate `todo_progress.json` from `IMPLEMENTATION_PLAN.md`

**Usage**:

```bash
# Populate all tasks
npm run tasks:populate

# Populate specific epic
node scripts/populate_tasks_from_plan.js --epic epic-1

# Populate specific story
node scripts/populate_tasks_from_plan.js --story 1.5
```

**What it does**:

- Reads `IMPLEMENTATION_PLAN.md`
- Extracts all tasks from all stories
- Merges with existing tasks in `todo_progress.json` (preserves status)
- Updates `todo_progress.json`

### validate_epic_story_task_completeness.js

**Purpose**: Validate that all epics have stories, all stories have tasks

**Usage**:

```bash
npm run tasks:validate
```

**What it does**:

- Extracts epics from PRD
- Extracts stories from PRD and IMPLEMENTATION_PLAN.md
- Checks tasks in `todo_progress.json`
- Reports gaps and issues

### sync_tasks.js

**Purpose**: Synchronize tasks from all sources to `todo_progress.json`

**Usage**:

```bash
# One-time sync
npm run tasks:sync

# Watch mode (syncs every 5 minutes)
npm run tasks:sync:watch
```

**What it does**:

1. Runs `populate_tasks_from_plan.js`
2. Runs `validate_epic_story_task_completeness.js`
3. Reports summary

## Agent Rules for Tracking

### Activity Tracking (MANDATORY)

All agents MUST:

1. **Update `todo_progress.json` immediately** when:
   - Starting work: `status: "in_progress"`, update `updated_at`
   - Completing work: `status: "completed"`, set `actual_completion_time`, update `updated_at`
   - Blocking work: `status: "blocked"`, add `blocked_reason`, update `updated_at`

2. **Log activity** to:
   - `logs/agent_activity/[date].md` - Daily activity log
   - Include: timestamp, agent ID, task ID, action, result

3. **Document decisions** to:
   - `docs/decisions/[date]_[task_id].md` - Decision rationale

4. **Commit changes** with:
   - Message format: `[Agent] [Task-ID] Description`
   - Update relevant documentation

5. **Synchronize**:
   - `todo_progress.json` is the source of truth
   - If maintaining logs/todos elsewhere, sync to `todo_progress.json`
   - Orchestrator reads from `todo_progress.json` - it must be current

### Error Tracking (MANDATORY)

All errors MUST be logged:

1. **Immediate Logging** - `logs/agent_errors/[date].md`
2. **Update Task** - Increment `retry_count` in `todo_progress.json`
3. **Document Error** - Add `last_error` field
4. **Escalate** - If `retry_count > 3`, mark as `blocked`

See `agent_rules/core_principles.md` for complete tracking requirements.

## Ensuring Tasks Are Available

### Automatic Sync

**Recommended**: Run sync periodically:

```bash
# Add to cron/scheduled task (every hour)
npm run tasks:sync
```

### Manual Sync

When:

- New stories created
- Tasks added to IMPLEMENTATION_PLAN.md
- Tasks completed/updated elsewhere

Run:

```bash
npm run tasks:populate
```

### Validation

Before running orchestrator:

```bash
npm run tasks:validate
```

This ensures:

- All epics have stories
- All stories have tasks
- `todo_progress.json` is populated

## Current Status

**Last Sync**: Run `npm run tasks:populate` to see current status

**Typical Output**:

```
✅ Successfully populated todo_progress.json
   Added/Updated: 132 tasks
   Total tasks: 132
   Pending: 5
   Completed: 127

📊 Epic Breakdown:
   epic-1: 19 tasks
   epic-2: 113 tasks
```

## Troubleshooting

### No Tasks in todo_progress.json

**Problem**: Orchestrator shows "No tasks match filters"

**Solution**:

1. Run `npm run tasks:populate`
2. Check `IMPLEMENTATION_PLAN.md` has tasks
3. Verify tasks match epic/story filters

### Tasks Not Syncing

**Problem**: Tasks in IMPLEMENTATION_PLAN.md not appearing in todo_progress.json

**Solution**:

1. Check task format matches expected pattern
2. Run `npm run tasks:validate` to see issues
3. Check console output for parsing errors

### Missing Stories/Tasks

**Problem**: Validation shows epics without stories or stories without tasks

**Solution**:

1. Check PRD has all stories defined
2. Check IMPLEMENTATION_PLAN.md has tasks for all stories
3. Create missing stories/tasks as needed

## Integration with Orchestrator

The orchestrator:

- Reads from `todo_progress.json` on startup
- Filters by epic/story as specified
- Monitors for status changes
- Reloads tasks periodically

**Ensure**:

- `todo_progress.json` is populated before running orchestrator
- Tasks have correct `epic_id` and `story_id`
- Tasks have `status: "pending"` or `status: "in_progress"` to be picked up

## Related Files

- `docs/prd.md` - PRD with epics and stories
- `plan/IMPLEMENTATION_PLAN.md` - Implementation plan with tasks
- `agent_tasks/todo_progress.json` - Orchestrator task source
- `scripts/populate_tasks_from_plan.js` - Population script
- `scripts/validate_epic_story_task_completeness.js` - Validation script
- `scripts/sync_tasks.js` - Sync script
- `agent_rules/core_principles.md` - Agent tracking rules
