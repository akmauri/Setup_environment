# BMAD System Integration

This document describes how the new AI agent development system integrates with the existing BMAD (Build-Measure-Analyze-Deploy) framework.

## Integration Overview

The new system complements and enhances BMAD rather than replacing it:

- **BMAD**: Planning, coordination, and workflow management
- **New System**: Task execution, agent coordination, error handling, autonomy

## Integration Points

### 1. Agent Rules → BMAD Agents

**Location**: BMAD agent definitions in `.bmad-core/agents/`

**Integration**:

- BMAD agents reference `agent_rules/core_principles.md`
- BMAD agents follow error handling protocol
- BMAD agents use coordination rules
- BMAD agents respect autonomy protocol

**Update Required**:

- Add references to agent rules in BMAD agent definitions
- Include autonomy directive in agent activation
- Reference error handling in agent workflows

### 2. Task Management → BMAD Workflows

**Location**: BMAD workflows in `.bmad-core/workflows/`

**Integration**:

- BMAD orchestrator reads/writes `agent_tasks/todo_progress.json`
- BMAD workflows sync with task status
- BMAD tasks map to JSON task format
- BMAD completion updates JSON tasks

**Update Required**:

- Update BMAD orchestrator to use JSON tasks
- Sync workflow state with task JSON
- Maintain `docs/TASKS.md` as human-readable view

### 3. Ralph-Wiggum → BMAD Method ✅ COMPLETE

**Location**: Ralph-Wiggum process in `plan/` and `specs/`

**Integration**:

- ✅ Ralph-Wiggum Phase 1 (Planning) aligns with BMAD planning
- ✅ Ralph-Wiggum Phase 3 (Building) uses BMAD agents
- ✅ BMAD workflows can use Ralph-Wiggum breakdown
- ✅ BMAD tasks follow Ralph-Wiggum principles

**Implementation**:

- ✅ **Automatic Task Breakdown Integration**: Created `.bmad-core/tasks/breakdown-story-tasks.md` that automatically breaks down BMAD story tasks into atomic units using Ralph-Wiggum Phase 1 methodology
- ✅ **Story Creation Integration**: Updated `.bmad-core/tasks/create-next-story.md` with Step 7 that automatically invokes task breakdown after story creation
- ✅ **Non-Breaking Enhancement**: Integration enhances task granularity without modifying core story elements (status, ACs, etc.)
- ✅ **Full System Integration**: Breakdown updates story file, `plan/IMPLEMENTATION_PLAN.md`, and `agent_tasks/todo_progress.json`
- ✅ **Spec Creation**: Automatically creates specs in `specs/` directory for new topics when needed

**How It Works**:

1. When a story is created via `create-next-story.md`, Step 7 automatically executes `breakdown-story-tasks.md`
2. The breakdown task analyzes all tasks/subtasks in the story
3. Applies Ralph-Wiggum "One Sentence Without 'And'" test to break compound tasks into atomic units
4. Updates story file with atomic breakdowns while preserving original structure
5. Updates implementation plan and task tracking system with new atomic tasks
6. Creates specs for new topics as needed

**Status**: ✅ **Fully Integrated and Operational**

### 4. Logging → BMAD Tasks

**Location**: Logging system in `logs/`

**Integration**:

- BMAD tasks log to `logs/agent_activity/`
- BMAD errors use error handling protocol
- BMAD knowledge feeds into `docs/agent_knowledge/`
- Common errors integrate with BMAD troubleshooting

**Update Required**:

- Update BMAD tasks to log to new structure
- Integrate error handling into BMAD workflows
- Feed BMAD knowledge into agent knowledge base

### 5. Autonomy Protocol → BMAD Agents

**Location**: Autonomy protocol in `agent_rules/autonomy_protocol.md`

**Integration**:

- BMAD agents follow autonomy protocol
- BMAD workflows respect red lines
- BMAD decisions logged to autonomy logs
- BMAD flags use human review system

**Update Required**:

- Add autonomy directive to BMAD agent activation
- Include red line checks in BMAD workflows
- Log BMAD decisions to autonomy logs

## BMAD Agent Updates

### Update BMAD Agent Definitions

For each BMAD agent (`.bmad-core/agents/*.md`):

1. **Add Agent Rules Reference**:

   ```markdown
   ## Agent Rules

   - Must follow: agent_rules/core_principles.md
   - Error handling: agent_rules/error_handling.md
   - Coordination: agent_rules/parallel_coordination.md
   - Autonomy: agent_rules/autonomy_protocol.md
   ```

2. **Add Autonomy Directive**:

   ```markdown
   ## AUTONOMY DIRECTIVE

   You operate under Rule #1 - Autonomous Continuity...
   ```

3. **Add Context Loading**:

   ```markdown
   ## Context Loading

   1. agent_tasks/todo_progress.json
   2. agent_rules/core_principles.md
   3. [BMAD-specific context]
   ```

### Update BMAD Orchestrator

**Location**: `.bmad-core/agents/bmad-orchestrator.md`

**Updates**:

- Read/write `agent_tasks/todo_progress.json`
- Use lock system for coordination
- Log to new logging structure
- Follow autonomy protocol

## BMAD Workflow Updates

### Update Workflow Definitions

**Location**: `.bmad-core/workflows/*.yaml`

**Updates**:

- Reference task JSON format
- Include error handling steps
- Add autonomy checks
- Use coordination rules

### Example Workflow Integration

```yaml
stages:
  - name: planning
    agent: pm
    artifacts:
      - plan/IMPLEMENTATION_PLAN.md
      - specs/*.md
    rules:
      - Follow: agent_rules/core_principles.md
      - Log to: logs/agent_activity/

  - name: building
    agent: dev
    coordination:
      - Check locks: .lock/
      - Update tasks: agent_tasks/todo_progress.json
    autonomy:
      - Check red lines before changes
      - Flag if needed
      - Log decisions
```

## BMAD Task Updates

### Update Task Definitions

**Location**: `.bmad-core/tasks/*.md`

**Updates**:

- Reference task JSON schema
- Include error handling steps
- Add autonomy checks
- Use coordination protocols

## Migration Path

### Phase 1: Parallel Operation

- New system operates alongside BMAD
- Both systems work independently
- Manual synchronization

### Phase 2: Integration

- BMAD agents reference new rules
- BMAD workflows use new task format
- Shared logging and coordination

### Phase 3: Full Integration

- Unified task management
- Integrated workflows
- Shared knowledge base

## Best Practices

1. **Maintain Compatibility**: Don't break existing BMAD functionality
2. **Gradual Migration**: Integrate incrementally
3. **Document Changes**: Update BMAD docs as you integrate
4. **Test Thoroughly**: Ensure integration doesn't break workflows
5. **Monitor Both**: Track both BMAD and new system metrics

## Testing Integration

### Test Scenarios

1. **BMAD Agent with New Rules**: Agent follows both BMAD and new rules
2. **BMAD Workflow with Task JSON**: Workflow reads/writes JSON tasks
3. **BMAD Error Handling**: Errors use new error protocol
4. **BMAD Autonomy**: BMAD agents follow autonomy protocol

### Validation

- [ ] BMAD agents load new rules
- [ ] BMAD workflows sync with tasks
- [ ] BMAD errors log correctly
- [ ] BMAD autonomy works
- [ ] No breaking changes to BMAD

## Documentation Updates

Update BMAD documentation to reference:

- Agent rules
- Task management
- Error handling
- Autonomy protocol
- Logging system

## Support

For integration issues:

1. Check this document
2. Review agent rules
3. Check BMAD documentation
4. Review integration logs
