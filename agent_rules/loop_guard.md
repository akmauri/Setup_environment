# Loop Guard: Stop Repetition + Recover

**Version**: v2.0.0  
**Last Updated**: 2026-01-14  
**Purpose**: Prevent agents from getting stuck in repetitive loops and provide recovery procedures with progress tracking

## Directive

Agents must detect when they are repeating the same actions without progress and immediately break the loop using the forced break procedure below. **Progress tracking is mandatory** to enable early loop detection.

## Definitions

- **"Looping"** = Repeating the same step/plan/log line, or producing near-identical output, 3+ times in a row
- **"No Progress"** = No new files created/updated, no new evidence gathered, no new decisions made, or no changed state after a step
- **"State Change"** = A measurable change (file created/edited, rule added, tests run, search results inspected, or a decision recorded)
- **"Near-Identical"** = Same content with only minor wording variations, same tool calls, same file operations

## Mandatory Progress Logging

**At the top of every response**, include a 3-line progress log:

```
**Progress Log**:
- Last completed state change: [What file was created/updated, what decision was made, what evidence was gathered]
- Current objective: [What you are trying to achieve right now]
- Next concrete action: [One sentence describing the next action you will take]
```

**Purpose**: This enables loop detection by comparing "Next concrete action" to previous actions.

## Attempt Limits

**Maximum of 2 attempts** are allowed per objective without a state change.

- **Attempt 1**: Initial attempt
- **Attempt 2**: Retry with changes (different approach, different file, different method)
- **Attempt 3**: MUST trigger Loop Break Protocol (no more attempts allowed)

**Exception**: Ralph-Wiggum Phase 3 (Parallel Execution) allows legitimate iteration across different tasks/units, but still requires state changes between iterations.

## Loop Detection Triggers

Detect a loop when any of these patterns occur:

1. **Repeating Plans**: Presenting the same plan or steps 2+ times with no new actions taken
2. **Rewriting Code**: Rewriting the same code block with only minor wording changes (same logic, different syntax)
3. **Re-running Commands**: Re-running the same failed command/test without changing inputs or approach
4. **Repeating Questions**: Asking the user the same clarifying question again without incorporating previous answers
5. **Circular Reasoning**: Reaching the same conclusion through the same reasoning path multiple times
6. **No Progress**: Making the same tool calls or edits repeatedly without advancing the task
7. **Repeating "Next Action"**: The "Next concrete action" in progress log is similar to any of the last 3 actions
8. **No State Change**: 2+ attempts at the same objective without any measurable state change
9. **Repeating File Operations**: Announcing file creation/update multiple times without actually creating/updating the file

## Loop Detection (Before Every Action)

**Before executing any action**, compare the "Next concrete action" from your progress log to the last 3 actions.

- If similar to any of the last 3, **STOP** and trigger the Loop Break Protocol
- If this is attempt #3 without state change, **STOP** and trigger the Loop Break Protocol

## Loop Break Protocol (Mandatory when triggered)

When looping/no-progress is detected, the agent MUST:

### A) STOP Repeating

**Immediately stop** repeating the same step. Do not continue with the same action.

### B) Output Stuck Report

Provide a short "Stuck Report" with:

```
## Stuck Report

**What I keep repeating**: [Specific action/step that's being repeated]

**Why it's not changing state**: [Why the action isn't producing measurable results]

**What information I'm missing** (if any): [Any missing context, files, or decisions needed]

**The smallest verifiable next step**: [One concrete, verifiable action that would produce a state change]
```

### C) Choose ONE Recovery Strategy

Select exactly ONE recovery strategy from the list below and execute it immediately:

#### Recovery Strategy 1: Evidence-First

- Run a workspace-wide search for existing relevant files/rules (use `grep`, `codebase_search`, or `glob_file_search`)
- Cite the paths found
- Update existing files instead of creating new ones
- **Execute**: Perform the search and cite results immediately

#### Recovery Strategy 2: Minimal Change

- Make the smallest possible edit to an existing file instead of creating a new file
- Update one section, add one function, or modify one configuration
- **Execute**: Make the minimal edit immediately

#### Recovery Strategy 3: Create-Once

- If a new file is required, create it ONCE and then only edit it—no re-creation
- Use file discovery rule (`.cursor/rules/file_discovery.md`) to verify no existing file
- **Execute**: Create the file immediately, then only edit it going forward

#### Recovery Strategy 4: Decision Checkpoint

- Write an explicit decision document:
  - Create vs Update?
  - File path?
  - Rule placement?
- Proceed with that decision and don't revisit it
- **Execute**: Document the decision and proceed immediately

#### Recovery Strategy 5: Narrow Scope

- Reduce task to the next atomic deliverable (e.g., "add section X to file Y")
- Complete only that atomic task
- **Execute**: Complete the atomic task immediately

### D) Verify State Change

After executing the recovery strategy, re-check:

- ✅ **Did a state change occur?** (File created/updated, decision recorded, evidence gathered)
  - If **YES**: Continue with normal workflow
  - If **NO**: Escalate to Escalation Protocol

## Escalation Protocol (Mandatory)

If Loop Break Protocol fails to produce a state change:

1. **Freeze**: Stop all planning text. No more analysis or planning.
2. **Provide 5-Bullet Plan**: List the 5 smallest remaining tasks that could be completed:
   ```
   ## Escalation - Minimal Task List
   1. [Smallest task 1]
   2. [Smallest task 2]
   3. [Smallest task 3]
   4. [Smallest task 4]
   5. [Smallest task 5]
   ```
3. **Request Minimum Input OR Make Single Assumption**:
   - Ask for the minimum missing input needed, OR
   - Make a single justified assumption and proceed
4. **Execute or Escalate**: Do not re-announce the same action—either do it or escalate to user

## File Creation / Update Rule (Prevents File Creation Loops)

**Before creating any new file**, MUST:

1. **Search for existing files** that might already cover it:
   - Search by name (exact and partial matches)
   - Search by keywords/content
   - Check hidden files and dotfiles (use file discovery rule)
2. **If a relevant file exists**: Update it instead of creating a duplicate
3. **If no file exists**: Create ONE new file with the agreed path/name and then only edit it

**Prohibited**: Repeating "Creating X rule…" or "Creating X file…" more than once without actually creating/updating the file.

**See**: `.cursor/rules/file_discovery.md` for comprehensive file discovery requirements.

## Anti-Loop Constraints

These constraints prevent loops from forming:

1. **Never Repeat Verbatim**: Never output the same paragraph, explanation, or code block verbatim. If you must reference previous content, summarize or quote with attribution.

2. **Never Present Same Checklist Twice**: If presenting a checklist, either:
   - Mark items as complete/in-progress
   - Add new items
   - Remove completed items
   - Change the structure
   - If nothing changed, don't present it again

3. **Make Smallest Safe Assumption**: When uncertain, make the smallest safe assumption that allows progress rather than asking for clarification:
   - Use a default value
   - Choose the most common pattern
   - Follow existing conventions in the codebase
   - Proceed with a minimal implementation

4. **Prefer Partial Solution Over Stalling**:
   - Produce a working partial solution rather than waiting for perfect information
   - Document what's missing or assumed
   - Allow iteration to complete the solution

5. **Change Something**: If retrying, always change at least one thing:
   - Different approach
   - Different tool or method
   - Different file or location
   - Different parameter or configuration

## Prohibited Behaviors

The following behaviors are **strictly prohibited** and will trigger Loop Break Protocol:

- ❌ Repeating "Creating X rule…" or "Creating X file…" more than once without actually creating/updating the file
- ❌ Repeating the same sentence/paragraph with only minor variations
- ❌ Re-starting the same "reviewing rules" step without new evidence (search results, file paths, citations)
- ❌ Presenting the same plan/checklist without marking progress or adding new information
- ❌ Making the same tool call 3+ times with the same parameters
- ❌ Repeating the same "Next concrete action" in progress logs across multiple responses
- ❌ Attempting the same objective 3+ times without a state change
- ❌ Re-reading the same file multiple times without taking action

## Loop Prevention Strategies

### Before Starting Work

- Review recent actions to avoid repeating them
- Check if similar problems were solved before
- Identify what's different this time

### During Work

- Track what you've tried (mentally or in notes)
- If something fails, try a different approach immediately
- Don't retry the same action more than once without changes

### When Stuck

- Apply forced break procedure immediately
- Don't continue trying the same approach
- Escalate rather than loop

## Integration with Other Rules

This rule integrates with:

- **File Discovery** (`.cursor/rules/file_discovery.md`): Prevents file creation loops by requiring comprehensive search before creation
- **Core Principles** (`agent_rules/core_principles.md`): Loop detection is part of quality gates
- **Error Handling** (`agent_rules/error_handling.md`): Loops are a type of error that needs recovery
- **Autonomy Protocol** (`agent_rules/autonomy_protocol.md`): Loops can occur during autonomous execution
- **Update Protocol** (`agent_rules/update_protocol.md`): Rule updates should prevent known loop patterns
- **Ralph-Wiggum Process** (`ralph_wiggum_process.md`): Legitimate iteration across different tasks/units is allowed, but still requires state changes

## Compatibility with Ralph-Wiggum Process

**Important**: The Ralph-Wiggum process involves legitimate iteration across different tasks/units in Phase 3 (Parallel Execution). This is **not** considered looping because:

- Each iteration works on a **different task/unit**
- Each iteration produces a **state change** (task completion, file update, test result)
- The iteration is **intentional and structured** (not reactive repetition)

**However**, if an agent is:

- Repeating the same task without progress
- Repeating the same analysis/plan for the same task
- Not producing state changes between iterations

Then the Loop Break Protocol applies, even during Ralph-Wiggum Phase 3.

## Examples

### Example 1: Repeating Plan

❌ **Loop**:

```
**Progress Log**:
- Last completed state change: None
- Current objective: Implement feature X
- Next concrete action: Present implementation plan for feature X
```

(Repeated 3 times with same "Next concrete action")

✅ **Break**:

```
## Stuck Report
**What I keep repeating**: Presenting the same implementation plan
**Why it's not changing state**: I'm not actually implementing, just planning
**What information I'm missing**: None - I have enough to start
**The smallest verifiable next step**: Create minimal implementation file

**Recovery Strategy**: Narrow Scope - Create minimal working version now
```

### Example 2: Rewriting Same Code

❌ **Loop**:

```
**Progress Log**:
- Last completed state change: Updated function Y (attempt 1, 2, 3, 4)
- Current objective: Fix function Y
- Next concrete action: Rewrite function Y with improved syntax
```

(4 attempts, same action, no state change improvement)

✅ **Break**:

```
## Stuck Report
**What I keep repeating**: Rewriting function Y with minor syntax changes
**Why it's not changing state**: The logic is the same, just syntax variations
**What information I'm missing**: Actual error or test failure details
**The smallest verifiable next step**: Run test to see actual failure

**Recovery Strategy**: Evidence-First - Check error logs and test results first
```

### Example 3: Re-running Failed Command

❌ **Loop**:

```
**Progress Log**:
- Last completed state change: Ran npm install (failed, attempt 1, 2, 3, 4, 5)
- Current objective: Install dependencies
- Next concrete action: Run npm install command
```

(5 attempts, same action, same failure)

✅ **Break**:

```
## Stuck Report
**What I keep repeating**: Running npm install with same parameters
**Why it's not changing state**: Command fails the same way each time
**What information I'm missing**: Error details, package.json issues, node version
**The smallest verifiable next step**: Inspect package.json for syntax errors

**Recovery Strategy**: Evidence-First - Check package.json and error logs first
```

## Metrics

Track loop detection:

- **Loops Detected**: Count of times loop was detected
- **Loops Prevented**: Count of times loop was prevented by constraints
- **Escalations**: Count of times escalation was required

Store in `logs/performance/loop_metrics.log`

## Success Criteria

The agent is considered "unstuck" only when:

- ✅ At least one **state change** is completed and recorded in the progress log
- ✅ The state change is **measurable** (file created/updated, decision recorded, evidence gathered)
- ✅ The "Next concrete action" in the progress log is **different** from the previous 3 actions
- ✅ The agent is **not repeating** the same step/plan/log line

## Progress Log Format (Mandatory)

Every agent response must start with:

```markdown
**Progress Log**:

- Last completed state change: [Specific file created/updated, decision made, or evidence gathered]
- Current objective: [What you are trying to achieve right now - one sentence]
- Next concrete action: [One sentence describing the next action you will take]
```

**Example**:

```markdown
**Progress Log**:

- Last completed state change: Created `.cursor/rules/file_discovery.md` with comprehensive file discovery requirements
- Current objective: Integrate file discovery rule into rule enforcement protocol
- Next concrete action: Update `agent_rules/rule_enforcement.md` to add file discovery as checklist item #2
```

**Purpose**: Enables loop detection by comparing "Next concrete action" to previous actions. If the same action appears 3+ times, trigger Loop Break Protocol.

## Best Practices

1. **Detect Early**: Recognize loop patterns as soon as they start (check progress log before each action)
2. **Break Immediately**: Don't wait for multiple repetitions - trigger Loop Break Protocol at attempt #3
3. **Document Loops**: Log when loops are detected and how they were broken
4. **Learn Patterns**: Identify common loop patterns and prevent them proactively
5. **Escalate When Needed**: Don't continue looping - escalate if stuck after recovery strategy fails
6. **Track State Changes**: Always record state changes in progress log to enable progress tracking
