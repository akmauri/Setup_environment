# Automatic Task Sync - Quick Reference

**Status**: ✅ **FULLY AUTOMATIC**

## What You Need to Do

**Nothing!** Just start the orchestrator:

```bash
npm run orchestrate -- --epic epic-1
```

The orchestrator automatically:

1. ✅ Syncs tasks from `IMPLEMENTATION_PLAN.md` on startup
2. ✅ Loads agent-suggested tasks automatically
3. ✅ Auto-syncs every 5 minutes during execution
4. ✅ Reloads tasks when queue empties
5. ✅ Continues until all tasks are complete

## Priority System

Tasks are processed in this order:

1. **New Tasks** (from IMPLEMENTATION_PLAN.md)
2. **Rework Tasks** (retry_count > 0, needs reworking)
3. **Agent-Suggested Tasks** (created during development)

Within each priority, sorted by: Epic → Story → Task Priority → Dependencies

## Creating Agent-Suggested Tasks

If you discover a task during development:

```bash
npm run tasks:add -- --description "Fix memory leak" --epic epic-1 --story story-1.5
```

Or add directly to `todo_progress.json` with:

```json
{
  "source": "agent-suggested",
  "priority": 99,
  ...
}
```

Orchestrator will automatically pick it up on next sync.

## Current Status

Run to check:

```bash
npm run tasks:validate
```

## Related Docs

- `docs/AUTOMATIC_TASK_SYNC.md` - Complete documentation
- `docs/TASK_MANAGEMENT_SYSTEM.md` - Task management system
- `agent_rules/task_tracking.md` - Agent tracking requirements
