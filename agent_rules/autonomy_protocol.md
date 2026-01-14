# Autonomous Execution Protocol - Rule #1

**Title**: The "Autonomous Continuity" Principle

## Directive

Execute continuously without human review unless you encounter a decision that crosses one of the three red lines below. Flag potential crossings for awareness, but only stop production if you cannot proceed without crossing a red line.

## The Three Red Lines (Stop/Flag Criteria)

### 1. BREAKAGE LINE: "Does this change break existing functionality?"

**Autonomous if:**

- All tests pass
- Type checking succeeds
- Core user flows remain intact
- No breaking API changes
- Application builds and starts successfully

**Flag if:**

- More than 5% test regression
- New type errors in core modules
- Breaking API changes (with migration path)
- Performance degradation > 10%
- Non-critical functionality affected

**Stop if:**

- Application fails to build
- Application fails to start
- Causes data corruption
- Security vulnerabilities introduced
- Critical functionality broken

### 2. PLAN DEVIATION LINE: "Does this significantly deviate from the agreed implementation plan?"

**Autonomous if:**

- Implementation method varies but achieves same outcome specified in `plan/IMPLEMENTATION_PLAN.md`
- Alternative approach is equivalent or better
- Changes are implementation details, not feature changes
- Same user experience and business goals

**Flag if:**

- Adding/removing features not in the spec
- Changing UX patterns significantly
- Using new major technologies not in architecture
- Changing data models (even if backward compatible)
- Modifying core workflows

**Stop if:**

- Completely changes product direction
- Core architecture changes without plan update
- Fundamental technology stack changes
- Business model changes
- User value proposition changes

### 3. INTENTION SHIFT LINE: "Does this alter the core user experience or business goals?"

**Autonomous if:**

- Improves performance
- Fixes bugs
- Enhances UX within original constraints
- Adds non-breaking improvements
- Optimizes existing functionality

**Flag if:**

- Changes primary user workflows
- Alters data models significantly
- Adds major new capabilities
- Changes user-facing behavior
- Modifies business logic substantially

**Stop if:**

- Fundamentally changes what the product is
- Changes core value proposition
- Alters primary use cases
- Breaks user expectations significantly
- Changes business model

## Decision Flow

```yaml
autonomous_continuity:
  decision_flow:
    1. "Before any significant change, run: RED_LINE_CHECKLIST.md"
    2. "If zero red lines crossed: IMPLEMENT → LOG → CONTINUE"
    3. "If potentially crossing but workaround exists: FLAG → IMPLEMENT_WORKAROUND → LOG → CONTINUE"
    4. "If must cross red line: STOP → CREATE_REVIEW_TICKET → AWAIT_HUMAN"

  logging_requirement:
    - 'All autonomous decisions logged to logs/autonomy/[timestamp].md'
    - 'Weekly autonomy report generated every Friday'
    - 'Flagged items added to human_review/flagged_not_blocking.md'

  escalation_triggers:
    - 'Three similar flags in 24 hours triggers auto-pause'
    - 'Build failure after autonomous change triggers rollback + pause'
    - 'User-facing error report triggers immediate reassessment'
```

## Implementation Protocol

### Before Any Significant Change

1. **Run Red Line Checklist**: Evaluate against all three red lines
2. **Document Decision**: Record reasoning in autonomy log
3. **Proceed or Flag**: Based on checklist results

### Autonomous Actions (No Flag Needed)

- Refactor code with identical API
- Fix typos in documentation
- Improve test coverage for existing features
- Optimize database queries (same results)
- Update dependencies within same major version
- Add defensive error handling
- Improve code organization
- Add comments and documentation
- Fix non-critical bugs
- Performance optimizations (same functionality)

### Flag But Continue

When potentially crossing a red line but workaround exists:

1. **Create Flag**: Use flag template (see below)
2. **Implement Workaround**: Use approach that avoids red line
3. **Log Decision**: Document in autonomy log
4. **Continue Work**: Don't stop, just flag for awareness

**Example Flags:**

- "Changing from REST to GraphQL for one endpoint (Plan deviation, but tests pass)"
- "Adding optional new field to user model (Minor intention shift, backward compatible)"
- "Switching UI library for one component (Plan deviation, but same functionality)"

### Stop and Escalate

When must cross a red line:

1. **Stop Immediately**: Halt all work on this change
2. **Create Review Ticket**: Document in `human_review/blocking_issues.md`
3. **Log Stop Reason**: Document why red line must be crossed
4. **Await Human Decision**: Do not proceed without approval

**Example Stops:**

- "Proposal to switch from SQL to NoSQL database"
- "Decision to make premium features free"
- "Complete redesign of core user workflow"
- "Changing authentication system"

## Communication Template for Flagging

**Location**: Use this template when flagging without blocking

```markdown
🚩 FLAG-FOR-AWARENESS (NOT BLOCKING)

**Decision**: [Brief description of what you're doing]

**Potential Red Line**: [Breakage/Plan/Intention - which one]

**Why I'm Continuing**: [Workaround/justification for proceeding]

**What to Watch**: [Specific thing human should monitor]

**Rollback Plan**: [How to undo if needed]

**Timestamp**: [ISO timestamp]

**Related Files**: [Files being changed]

**Tests**: [Test status - passing/failing]

// This message does NOT require response or halt work
```

## Logging Requirements

### Autonomous Decision Log

**Location**: `logs/autonomy/[YYYY-MM-DD_HH-MM-SS].md`

**Format**:

```markdown
# Autonomous Decision Log

**Timestamp**: [ISO timestamp]
**Agent**: [Agent ID]
**Task**: [Task ID]
**Decision**: [What was decided]

## Red Line Check

- [ ] Breakage Line: [Status]
- [ ] Plan Deviation Line: [Status]
- [ ] Intention Shift Line: [Status]

## Action Taken

[What was done]

## Rationale

[Why this decision was made]

## Impact

[Expected impact]
```

### Weekly Autonomy Report

**Location**: `logs/autonomy/weekly/[YYYY-MM-DD]_report.md`

**Generated**: Every Friday

**Content**:

- Summary of autonomous decisions
- Flags raised during week
- Stops and escalations
- Metrics (decisions made, flags raised, stops)

### Flagged Items Log

**Location**: `human_review/flagged_not_blocking.md`

**Format**: List of all flags with timestamps and status

## Escalation Triggers

### Auto-Pause Conditions

1. **Three Similar Flags in 24 Hours**: Pause and request review
2. **Build Failure After Autonomous Change**: Rollback + pause
3. **User-Facing Error Report**: Immediate reassessment
4. **Security Issue Detected**: Stop immediately
5. **Data Integrity Concern**: Stop and verify

### Rollback Protocol

When rollback is triggered:

1. **Identify Change**: Find the autonomous change that caused issue
2. **Revert Change**: Use git to revert
3. **Verify Fix**: Confirm issue is resolved
4. **Log Incident**: Document in `logs/autonomy/incidents/`
5. **Update Rules**: If needed, update autonomy protocol

## Integration with Agent Rules

This protocol integrates with:

- **Core Principles**: `agent_rules/core_principles.md`
- **Error Handling**: `agent_rules/error_handling.md`
- **Loop Guard**: `agent_rules/loop_guard.md` - Loops can occur during autonomous execution
- **Task Management**: `agent_tasks/todo_progress.json`
- **BMAD System**: BMAD agents follow this protocol

## Agent Activation

All agents should include this in their activation:

```markdown
## AUTONOMY DIRECTIVE

You operate under Rule #1 - Autonomous Continuity. You have permission to:

1. Make decisions without asking if you don't cross red lines
2. Implement improvements that don't break, deviate, or shift intentions
3. Flag concerns for awareness while continuing work

Your default state should be PROGRESS, not PAUSE. When in doubt, ask yourself:
"Can I implement this in a way that avoids all three red lines?"
If yes, proceed and flag. If no, stop and escalate.
```

## Best Practices

1. **Default to Progress**: When in doubt, proceed if red lines aren't crossed
2. **Flag Early**: Flag potential issues before they become problems
3. **Document Decisions**: Always log autonomous decisions
4. **Test Thoroughly**: Ensure changes don't break functionality
5. **Review Flags Weekly**: Review flagged items regularly
6. **Learn from Stops**: Update protocol based on stop incidents

## Metrics

Track autonomy metrics:

- **Autonomous Decisions**: Count of decisions made autonomously
- **Flags Raised**: Count of flags (non-blocking)
- **Stops Required**: Count of stops (blocking)
- **Rollbacks**: Count of rollbacks needed
- **Time Saved**: Estimated time saved by autonomy

Store in `logs/performance/autonomy_metrics.log`
