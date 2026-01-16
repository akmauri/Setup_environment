# Rule Enforcement Protocol - Mandatory Rule Compliance

**Version**: v1.0.0  
**Last Updated**: 2026-01-XX  
**Purpose**: Ensure all agents automatically follow all applicable rules without requiring reminders

## Directive

**Every agent action MUST be preceded by rule compliance verification.** This is not optional. Agents must verify they are following all applicable rules before executing any task, making any change, or taking any action.

## Pre-Action Rule Compliance Checklist

Before taking ANY action, agents MUST verify compliance with these rules in order:

### 1. Context Loading (Required)

**Rule**: `.cursor/rules/agent_context.md`

**Checklist**:

- [ ] Loaded `agent_tasks/todo_progress.json` to check task assignment
- [ ] Loaded relevant agent rules (core_principles, error_handling, etc.)
- [ ] Loaded project context (ARCHITECTURE.md, prd.md, etc.)
- [ ] Checked for task-specific context files (`agent_tasks/context/[task_id]_context.md`)
- [ ] Checked for iterative work files (todos, insights) if applicable
- [ ] Verified task is assigned to me (if working on a task)
- [ ] Verified all dependencies are complete

**Action if Non-Compliant**: Load required context before proceeding

### 2. File Discovery & Hidden File Verification (Required - Before File Operations)

**Rule**: `.cursor/rules/file_discovery.md`

**Checklist**:

- [ ] If creating, duplicating, or proposing a new file: Performed comprehensive workspace search
- [ ] Searched for hidden files and folders (dotfiles, underscored folders, system directories)
- [ ] Checked configuration files, rules files, agent rules, and metadata files
- [ ] Searched for files with similar names, purposes, or partial overlaps
- [ ] Checked archived, deprecated, or previously renamed files
- [ ] If relevant file exists: Plan to update/extend existing file instead of creating new one
- [ ] If no relevant file found: Justified why new file is required and why no existing file could be reused
- [ ] Verified not creating parallel files that serve the same purpose

**Action if Non-Compliant**: Perform file discovery before creating any file. Update existing files when found.

### 3. Task Management (Required)

**Rule**: `agent_rules/core_principles.md`

**Checklist**:

- [ ] Task is assigned to me OR I'm creating a new task
- [ ] Task status is `pending` or `in_progress` (not blocked)
- [ ] All dependencies are completed
- [ ] No active lock exists for this task/file (check `.lock/` directory)
- [ ] Created lock file if starting work (`.lock/[task_id].lock`)
- [ ] Updated task status to `in_progress` if starting

**Action if Non-Compliant**: Do not proceed. Fix task assignment/status first.

### 4. Ralph-Wiggum Process Evaluation (Required)

**Rule**: `ralph_wiggum_process.md`

**Checklist**:

- [ ] Is this task breakable into smaller units? (One Sentence Without "And" test)
- [ ] Should this be parallelized with other agents?
- [ ] Are there independent subtasks that can run simultaneously?
- [ ] Have I created spec files if this is Phase 1 (Task Analysis)?
- [ ] Am I following the appropriate phase (Analysis → Assignment → Execution → Integration)?

**Action if Applicable**:

- **If task is too large**: Break it down using Ralph-Wiggum principles before proceeding
- **If parallelization is possible**: Consider coordinating with other agents
- **If in Phase 1**: Create specs in `specs/` directory
- **If in Phase 3**: Verify dependencies, acquire locks, execute in parallel when possible

### 5. Multi-Agent Coordination (When Applicable)

**Rule**: `agent_rules/parallel_coordination.md`

**Checklist**:

- [ ] Checked for existing locks on related files
- [ ] Verified maximum concurrent agent limits (3 per related module, 10 total)
- [ ] Checked `agent_comms/` for relevant messages
- [ ] Acquired necessary locks before starting
- [ ] Notified affected agents if my work impacts theirs

**Action if Applicable**: Coordinate with other agents, respect locks, communicate changes

### 6. No Manual Orchestration (Required)

**Rule**: `agent_rules/no_manual_orchestration.md`

**Checklist**:

- [ ] Not asking user to open chats, copy/paste, or run routine commands
- [ ] Executing actions directly, not just describing them
- [ ] Following single-session orchestration protocol (locks, checkpoints, tracker updates)
- [ ] If guide exists (e.g., `PARALLEL_EXECUTION_GUIDE.md`): Executing it myself, not describing steps
- [ ] Providing evidence (file paths, command output) for any completion claims
- [ ] Not claiming "ready" or "complete" without evidence
- [ ] Updating `todo_progress.json` automatically
- [ ] Creating/releasing lock files for each task

**Action if Non-Compliant**: Re-respond with compliant behavior - execute actions directly

### 7. Autonomy Protocol (Required)

**Rule**: `agent_rules/autonomy_protocol.md`

**Checklist**:

- [ ] Ran Red Line Checklist before significant changes:
  - [ ] Breakage Line: Will this break existing functionality?
  - [ ] Plan Deviation Line: Does this deviate from the plan?
  - [ ] Intention Shift Line: Does this alter core UX/business goals?
- [ ] If crossing red lines: Flagged or stopped appropriately
- [ ] Logged autonomous decision if proceeding autonomously

**Action if Red Line Crossed**: Follow autonomy protocol (flag, stop, or escalate)

### 8. Error Handling (Required)

**Rule**: `agent_rules/error_handling.md`

**Checklist**:

- [ ] If error occurs: Log immediately to `logs/agent_errors/[date].md`
- [ ] Checked `logs/common_errors.md` for known solutions
- [ ] Updated task `retry_count` and `last_error` if error occurred
- [ ] Escalated if `retry_count > 3`

**Action if Error**: Follow error handling protocol immediately

### 9. Environment Variable Handling (Required - Before Env Var Operations)

**Rule**: `agent_rules/env_var_handling.md`

**Checklist**:

- [ ] Not attempting to read `.env` files (they are intentionally hidden)
- [ ] Checking `.env.example` for environment variable requirements
- [ ] If env var missing: Added to `.env.example` with placeholder (if schema changed)
- [ ] Informing user to populate `.env` manually (maximum once)
- [ ] Not looping on missing env var errors
- [ ] Not generating secrets automatically
- [ ] Not creating or modifying `.env` files

**Action if Non-Compliant**: Follow env var handling protocol - check `.env.example`, inform user once, stop looping

### 10. Loop Guard (Required)

**Rule**: `agent_rules/loop_guard.md`

**Checklist**:

- [ ] Included progress log at top of response (Last state change, Current objective, Next action)
- [ ] Compared "Next concrete action" to last 3 actions - not repeating
- [ ] Not repeating the same action without changes
- [ ] Not presenting the same plan/checklist twice
- [ ] Not exceeding 2 attempts per objective without state change
- [ ] If stuck: Applied Loop Break Protocol with recovery strategy
- [ ] Changed approach if retrying after failure
- [ ] Verified state change occurred after recovery strategy

**Action if Loop Detected**: Execute Loop Break Protocol immediately (stop, stuck report, recovery strategy, verify state change)

### 11. Iterative Work Pattern (When Applicable)

**Rule**: `agent_rules/iterative_work_pattern.md`

**Checklist**:

- [ ] Is this an iterative task? (processing multiple items, collecting insights)
- [ ] If yes: Created context, todos, and insights files
- [ ] Updated insights file after processing each item
- [ ] Checked off todos as items are completed
- [ ] Updated all three files before memory compaction

**Action if Applicable**: Follow iterative work pattern

### 12. Git & GitHub Best Practices (Required - During Work)

**Rule**: `agent_rules/git_github_best_practices.md`

**Checklist**:

- [ ] **Periodic commits** (every 30 minutes of active work - MANDATORY for backup safety)
- [ ] **Regular pushes** (every 2 hours minimum, or after every commit - MANDATORY for remote backup)
- [ ] Commit messages include: `[Agent-ID] [Task-ID] Description`
- [ ] All changes committed before ending work session
- [ ] Pushed to remote before ending work session
- [ ] Feature branch used (not working directly on main/master)
- [ ] Branch is up to date with main/master

**Action if Non-Compliant**: Commit and push immediately. Do not leave uncommitted work.

### 13. Quality Gates (Before Completion)

**Rule**: `agent_rules/core_principles.md` (Quality Gates section) and `agent_rules/testing_validation.md`

**Checklist**:

- [ ] Code implemented and follows standards
- [ ] **Tests/validation executed and passing** (MANDATORY - see `agent_rules/testing_validation.md`)
  - [ ] Type check run (`npm run type-check` or equivalent)
  - [ ] Lint check run (`npm run lint` or equivalent)
  - [ ] Unit tests run (if applicable)
  - [ ] Runtime verification (if applicable)
  - [ ] Results documented (command + output summary)
- [ ] Documentation updated (if applicable)
- [ ] No linter errors
- [ ] **All changes committed** (MANDATORY - see `agent_rules/git_github_best_practices.md`)
- [ ] **All commits pushed to remote** (MANDATORY - see `agent_rules/git_github_best_practices.md`)
- [ ] Task status updated in `todo_progress.json`
- [ ] Lock file removed
- [ ] Communication sent if needed
- [ ] No loops detected

**Action Before Marking Complete**:

1. **Run verification** (testing/validation) - MANDATORY
2. **Verify all quality gates pass**
3. **Provide evidence** (command output, test results)

## Rule Compliance Verification Process

### Step 1: Pre-Action Verification

Before EVERY action:

1. **Quick Scan**: Review the 12 checklists above
2. **Identify Applicable Rules**: Mark which rules apply to current action
3. **Verify Compliance**: Check each applicable rule's checklist
4. **Fix Non-Compliance**: Address any non-compliance before proceeding

### Step 2: During Action

While executing:

1. **Monitor for Rule Violations**: Watch for actions that violate rules
2. **Apply Corrections**: Fix violations immediately
3. **Log Decisions**: Document any rule-related decisions

### Step 3: Post-Action Verification

After EVERY action:

1. **Verify Quality Gates**: Ensure quality gates are met
2. **Update Status**: Update task status and remove locks
3. **Document**: Log any rule-related decisions or exceptions

## Automatic Rule Application

### Rule Priority Order

When rules conflict or overlap, apply in this order:

1. **Safety Rules** (security, data integrity, breakage prevention)
2. **Coordination Rules** (locks, multi-agent, dependencies)
3. **Process Rules** (Ralph-Wiggum, iterative patterns)
4. **Quality Rules** (testing, documentation, standards)
5. **Autonomy Rules** (red lines, decision making)

### Rule Enforcement Triggers

Rules are automatically enforced when:

- **Starting a task**: All pre-action checklists must pass
- **Making changes**: Autonomy protocol and quality gates apply
- **Encountering errors**: Error handling protocol activates
- **Detecting loops**: Loop guard activates
- **Coordinating work**: Parallel coordination rules apply
- **Completing work**: Quality gates must pass

## Ralph-Wiggum Process Integration

### When to Apply Ralph-Wiggum

Apply Ralph-Wiggum process when:

1. **Task is Complex**: Task cannot be described in one sentence without "and"
2. **Multiple Components**: Task involves multiple independent components
3. **Parallelization Possible**: Subtasks can run simultaneously
4. **Dependencies Exist**: Task has clear dependencies that enable parallel work

### Ralph-Wiggum Application Steps

1. **Phase 1 - Task Analysis**:
   - Break task into smallest possible units
   - Apply "One Sentence Without 'And'" test
   - Create spec files in `specs/` directory
   - Document dependencies

2. **Phase 2 - Agent Assignment**:
   - Assign tasks to appropriate agents
   - Balance workload
   - Set timeouts and fallbacks
   - Update `todo_progress.json`

3. **Phase 3 - Parallel Execution**:
   - Verify dependencies
   - Acquire locks
   - Execute in parallel
   - Update status regularly

4. **Phase 4 - Integration**:
   - Assemble completed units
   - Run integration tests
   - Fix integration issues
   - Validate end-to-end

## Multi-Agent Coordination Integration

### When to Use Multiple Agents

Use multiple agents when:

1. **Independent Tasks**: Tasks have no dependencies on each other
2. **Different Specialties**: Tasks require different agent types (Dev, QA, Architect)
3. **Parallelization Benefits**: Speed improvement from parallel execution
4. **Resource Limits**: Within maximum concurrent agent limits

### Multi-Agent Coordination Steps

1. **Check Limits**: Verify within maximum concurrent agent limits
2. **Acquire Locks**: Create lock files for assigned work
3. **Communicate**: Use `agent_comms/` for coordination
4. **Respect Boundaries**: Don't modify another agent's locked work
5. **Update Status**: Keep task status current

## Rule Violation Handling

### Detection

Rule violations are detected when:

- Pre-action checklist fails
- Quality gates fail
- Error occurs due to rule violation
- Loop detected due to missing rule application
- Coordination conflict occurs

### Response

When violation detected:

1. **Stop Action**: Halt current action immediately
2. **Identify Violation**: Determine which rule was violated
3. **Fix Violation**: Apply correct rule compliance
4. **Log Violation**: Document in `logs/agent_errors/[date].md`
5. **Resume**: Continue with correct rule compliance

### Escalation

Escalate rule violations when:

- Violation cannot be fixed automatically
- Violation indicates systemic issue
- Violation affects multiple agents
- Violation causes data loss or security issue

## Rule Compliance Logging

### Log Location

**Location**: `logs/rule_compliance/[YYYY-MM-DD].md`

### Log Format

```markdown
## [Timestamp] - [Agent ID] - [Task ID]

**Progress Log**:

- Last completed state change: [File created/updated, decision made, evidence gathered]
- Current objective: [What agent is trying to achieve]
- Next concrete action: [Next action planned]

**Action**: [What action was taken]
**Rules Applied**: [List of rules that were checked]
**Compliance Status**: [All compliant / Violations found]
**Violations**: [If any, describe violations and fixes]
**Ralph-Wiggum Applied**: [Yes/No - if yes, which phase]
**Multi-Agent Coordination**: [Yes/No - if yes, details]
**Autonomy Decision**: [If applicable, red line check results]
**Loop Detection**: [No loop detected / Loop detected - recovery strategy used]
```

## Integration with Other Rules

This rule enforcement protocol integrates with:

- **Core Principles**: Enforces mandatory pre-work checklist
- **File Discovery**: Ensures comprehensive file discovery before file creation
- **No Manual Orchestration**: Ensures agents execute directly, not delegate to users
- **Timestamp Accuracy** (`agent_rules/timestamp_accuracy.md`): Ensures all timestamps use UTC, are labeled, and are validated
- **Env Var Handling**: Prevents loops on missing env vars, ensures proper .env.example usage
- **Loop Guard**: Prevents loops through progress tracking and recovery strategies
- **Autonomy Protocol**: Ensures red line checks before actions
- **Parallel Coordination**: Enforces coordination rules
- **Error Handling**: Ensures errors trigger rule compliance
- **Iterative Work Pattern**: Enforces pattern when applicable
- **Ralph-Wiggum Process**: Ensures process is applied when appropriate
- **Context Guide**: Ensures context is loaded before actions
- **Git & GitHub Best Practices** (`agent_rules/git_github_best_practices.md`): Ensures periodic commits and pushes for backup safety

## Best Practices

1. **Always Verify First**: Never skip pre-action verification
2. **Apply Proactively**: Don't wait for violations - prevent them
3. **Document Decisions**: Log rule-related decisions
4. **Learn Patterns**: Identify common rule application patterns
5. **Update Rules**: Suggest rule updates when patterns emerge

## Metrics

Track rule compliance:

- **Compliance Rate**: Percentage of actions that pass all checklists
- **Violations Detected**: Count of rule violations
- **Ralph-Wiggum Applications**: Count of times process was applied
- **Multi-Agent Coordinations**: Count of multi-agent work sessions
- **Autonomy Decisions**: Count of autonomous decisions made

Store in `logs/performance/rule_compliance_metrics.log`

## Non-Negotiable Requirements

1. **Pre-Action Verification is MANDATORY**: Cannot be skipped
2. **Rule Compliance is AUTOMATIC**: Not optional or reminder-based
3. **Violations Must Be Fixed**: Cannot proceed with violations
4. **Ralph-Wiggum When Applicable**: Must evaluate and apply when appropriate
5. **Multi-Agent When Beneficial**: Must consider and use when beneficial
6. **Quality Gates Must Pass**: Cannot mark complete without passing gates

## Agent Activation Directive

Every agent activation MUST include:

```markdown
## RULE ENFORCEMENT DIRECTIVE

You operate under mandatory rule enforcement. Before EVERY action, you MUST:

1. Verify compliance with all applicable rules using the pre-action checklist
2. Perform comprehensive file discovery before creating any file
3. Execute actions directly, never delegate routine execution to users
4. Apply Ralph-Wiggum process if task is complex or parallelizable
5. Coordinate with other agents if multi-agent work is beneficial (or use single-session orchestration)
6. Follow autonomy protocol for all significant changes
7. Apply error handling, loop guard, and quality gates as required

Rule compliance is AUTOMATIC and MANDATORY - not optional or reminder-based.
```

## Examples

### Example 1: Starting a New Task

**Before Action**:

1. ✅ Load context (task list, rules, project docs)
2. ✅ Verify task assignment
3. ✅ Check dependencies
4. ✅ Evaluate Ralph-Wiggum (task is complex - break down)
5. ✅ Create lock file
6. ✅ Update task status

**Action**: Break task into smaller units, create specs, proceed

### Example 2: Making Code Changes

**Before Action**:

1. ✅ Load relevant code context
2. ✅ Check for locks on files
3. ✅ Run red line checklist (autonomy protocol)
4. ✅ Verify no loops (not repeating previous attempts)
5. ✅ Check quality gates will pass

**Action**: Make changes, run tests, update documentation

### Example 3: Multi-Agent Coordination

**Before Action**:

1. ✅ Load task list and identify parallelizable tasks
2. ✅ Check agent limits (within 3 per module, 10 total)
3. ✅ Acquire locks for assigned work
4. ✅ Communicate with other agents
5. ✅ Verify dependencies are met

**Action**: Execute in parallel, coordinate integration

## Updates to This Rule

See `agent_rules/update_protocol.md` for how this rule is updated. This rule should be reviewed and updated when:

- New rules are added that require enforcement
- Rule application patterns change
- Violations indicate missing enforcement
- Process improvements are identified
