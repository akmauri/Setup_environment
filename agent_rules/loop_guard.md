# Loop Guard: Stop Repetition + Recover

**Version**: v1.0.0  
**Last Updated**: 2026-01-XX  
**Purpose**: Prevent agents from getting stuck in repetitive loops and provide recovery procedures

## Directive

Agents must detect when they are repeating the same actions without progress and immediately break the loop using the forced break procedure below.

## Loop Detection Triggers

Detect a loop when any of these patterns occur:

1. **Repeating Plans**: Presenting the same plan or steps 2+ times with no new actions taken
2. **Rewriting Code**: Rewriting the same code block with only minor wording changes (same logic, different syntax)
3. **Re-running Commands**: Re-running the same failed command/test without changing inputs or approach
4. **Repeating Questions**: Asking the user the same clarifying question again without incorporating previous answers
5. **Circular Reasoning**: Reaching the same conclusion through the same reasoning path multiple times
6. **No Progress**: Making the same tool calls or edits repeatedly without advancing the task

## Forced Break Procedure

When a loop is detected, execute these steps **in order**:

### Step 1: State Current Objective (1 sentence)

Clearly state what you are trying to achieve:

```
"I am trying to [objective]."
```

### Step 2: Identify Blocker (1 sentence)

Identify what is preventing progress:

```
"I am blocked because [specific blocker]."
```

### Step 3: List Alternative Approaches (up to 3)

Brainstorm different ways to proceed:

```
"Alternative approaches:
1. [Approach 1]
2. [Approach 2]
3. [Approach 3]"
```

### Step 4: Choose and Execute

- Select 1 approach (prefer the simplest that could work)
- Take a **concrete action immediately**:
  - Edit code/rules
  - Propose a patch
  - Produce a minimal working example
  - Change the approach entirely

### Step 5: Stop if Still Blocked

If the chosen approach fails after 1 attempt:

- **STOP immediately**
- Output this format:

  ```
  ## Loop Detected - Escalation Required

  **What I tried**: [Brief description of attempted approach]

  **What failed**: [Specific failure reason]

  **What I need**: [Exact missing information or constraint needed to proceed]

  **Next Steps**: [What should happen next - user input, different approach, etc.]
  ```

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

- **Core Principles** (`agent_rules/core_principles.md`): Loop detection is part of quality gates
- **Error Handling** (`agent_rules/error_handling.md`): Loops are a type of error that needs recovery
- **Autonomy Protocol** (`agent_rules/autonomy_protocol.md`): Loops can occur during autonomous execution
- **Update Protocol** (`agent_rules/update_protocol.md`): Rule updates should prevent known loop patterns

## Examples

### Example 1: Repeating Plan

❌ **Loop**: Presenting the same implementation plan 3 times
✅ **Break**: "I'm trying to implement feature X. I'm blocked because I keep presenting the same plan. Alternatives: 1) Start with minimal implementation, 2) Ask specific clarifying question, 3) Review similar existing features. Choosing #1 - implementing minimal version now."

### Example 2: Rewriting Same Code

❌ **Loop**: Rewriting the same function 4 times with minor syntax changes
✅ **Break**: "I'm trying to fix function Y. I'm blocked because I keep rewriting the same logic. Alternatives: 1) Check error logs for actual failure, 2) Test the function in isolation, 3) Review similar working functions. Choosing #2 - running isolated test now."

### Example 3: Re-running Failed Command

❌ **Loop**: Running `npm install` 5 times with same result
✅ **Break**: "I'm trying to install dependencies. I'm blocked because npm install keeps failing the same way. Alternatives: 1) Check package.json for errors, 2) Clear cache and retry, 3) Check node/npm versions. Choosing #1 - inspecting package.json now."

## Metrics

Track loop detection:

- **Loops Detected**: Count of times loop was detected
- **Loops Prevented**: Count of times loop was prevented by constraints
- **Escalations**: Count of times escalation was required

Store in `logs/performance/loop_metrics.log`

## Best Practices

1. **Detect Early**: Recognize loop patterns as soon as they start
2. **Break Immediately**: Don't wait for multiple repetitions
3. **Document Loops**: Log when loops are detected and how they were broken
4. **Learn Patterns**: Identify common loop patterns and prevent them proactively
5. **Escalate When Needed**: Don't continue looping - escalate if stuck after one alternative attempt
