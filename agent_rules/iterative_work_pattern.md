# Iterative Work Pattern

**Version**: v1.0.0  
**Last Updated**: 2026-01-XX  
**Purpose**: Define a structured pattern for iterative tasks that require processing multiple items, collecting insights, and maintaining context across memory compaction events

## Directive

For tasks that involve iterative processing (analysis, extraction, review, data collection), agents must follow the three-file pattern: Context, Todos, and Insights. This ensures continuity, progress tracking, and knowledge preservation.

## When to Use This Pattern

Use this pattern for tasks that:
- Process multiple items iteratively (files, documents, records, etc.)
- Require collecting insights or findings over time
- May span multiple sessions or memory compaction events
- Benefit from visible progress tracking
- Need persistent context that survives memory resets

**Examples**:
- Analyzing multiple transcripts or documents
- Extracting data from multiple sources
- Reviewing code across multiple files
- Collecting customer feedback patterns
- Processing batches of data

## The Three-File Pattern

### Before You Start

When beginning an iterative task, create three files:

#### 1. Context File
**Location**: `agent_tasks/context/[task_id]_context.md`

**Purpose**: Store the goal, scope, constraints, and success criteria for the task.

**Format**:
```markdown
# Task Context: [Task Name]

**Task ID**: [task_id]
**Created**: [timestamp]
**Agent**: [agent_id]
**Status**: [in_progress/completed]

## Goal
[Clear statement of what this task aims to achieve]

## Scope
[What is included and excluded from this task]

## Constraints
[Any limitations or constraints]

## Success Criteria
[How we'll know the task is complete]

## Data Sources
[List of files, sources, or inputs to process]

## Output Requirements
[What needs to be produced]
```

#### 2. Todos File
**Location**: `agent_tasks/todos/[task_id]_todos.md`

**Purpose**: Track which items have been processed and what remains.

**Format**:
```markdown
# Task Todos: [Task Name]

**Task ID**: [task_id]
**Created**: [timestamp]
**Last Updated**: [timestamp]

## Progress
- Total items: [count]
- Completed: [count]
- In Progress: [count]
- Remaining: [count]

## Items to Process
- [ ] Item 1: [description]
- [ ] Item 2: [description]
- [x] Item 3: [description] (completed)
- [ ] Item 4: [description]

## Notes
[Any relevant notes about the items or process]
```

#### 3. Insights File
**Location**: `agent_tasks/insights/[task_id]_insights.md`

**Purpose**: Collect findings, patterns, extracted data, and observations iteratively.

**Format**:
```markdown
# Task Insights: [Task Name]

**Task ID**: [task_id]
**Created**: [timestamp]
**Last Updated**: [timestamp]

## Summary
[High-level summary of findings]

## Key Findings
[Major insights discovered]

## Patterns Identified
[Recurring patterns or themes]

## Extracted Data
[Specific data points collected]

## Observations
[Notable observations]

## Next Steps
[What should be done with these insights]
```

## As You Work

### Iterative Update Process

1. **Process Each Item**:
   - Work through items one at a time
   - Extract required information
   - Document findings immediately

2. **Update Insights File**:
   - After processing each item, update the insights file
   - Add new findings, patterns, or data
   - Keep insights organized and categorized

3. **Check Off Todos**:
   - Mark items as complete in the todos file
   - Update progress counts
   - Add notes if needed

4. **Update Before Memory Compaction**:
   - **Critical**: Update all three files before memory gets compacted
   - Ensure context file reflects current understanding
   - Ensure todos show accurate progress
   - Ensure insights capture all findings so far

### Memory Compaction Recovery

**After any memory compaction event**, you MUST:

1. **Read Context File First**: 
   - Load `agent_tasks/context/[task_id]_context.md`
   - Understand the goal and scope
   - Review success criteria

2. **Read Todos File**:
   - Load `agent_tasks/todos/[task_id]_todos.md`
   - Identify what's been completed
   - Identify what remains

3. **Read Insights File**:
   - Load `agent_tasks/insights/[task_id]_insights.md`
   - Review findings collected so far
   - Understand patterns already identified

4. **Verify Continuity**:
   - Confirm you understand where you left off
   - Verify no work was lost
   - Continue from the next unprocessed item

## For Each Item, Extract

When processing individual items, extract:

1. **Exact Phrases**: Verbatim quotes or exact text that's relevant
2. **Questions Asked**: Any questions or inquiries found
3. **Concerns or Hesitations**: Worries, doubts, or reservations mentioned
4. **Patterns**: Recurring themes or commonalities
5. **Data Points**: Specific facts, numbers, or metrics
6. **Observations**: Notable observations or insights

## Completion

When the task is complete:

1. **Finalize Insights File**:
   - Add final summary
   - Organize all findings
   - Highlight key takeaways

2. **Mark All Todos Complete**:
   - Check off all remaining items
   - Update final progress counts

3. **Update Context File**:
   - Mark status as "completed"
   - Add completion timestamp
   - Note any deviations from original plan

4. **Update Task Status**:
   - Update `agent_tasks/todo_progress.json`
   - Move to completed if applicable

## Integration with Other Rules

This pattern integrates with:
- **Core Principles** (`agent_rules/core_principles.md`): Part of task management
- **Context Guide** (`.cursor/rules/agent_context.md`): Context files are part of context loading
- **Loop Guard** (`agent_rules/loop_guard.md`): Prevents loops by maintaining clear progress tracking
- **Error Handling** (`agent_rules/error_handling.md`): Errors during iterative work should be logged

## Best Practices

1. **Update Frequently**: Don't wait until the end - update after each item
2. **Be Specific**: Include exact quotes and specific data points
3. **Stay Organized**: Keep insights categorized and easy to navigate
4. **Preserve Context**: Context file should always reflect current understanding
5. **Track Progress**: Todos file should always show accurate status
6. **Document Patterns**: Capture patterns as they emerge, not just at the end

## Examples

### Example: Transcript Analysis Task

**Context File** (`agent_tasks/context/transcript-analysis_context.md`):
```markdown
# Task Context: Customer Pain Point Extraction

**Goal**: Extract customer pain points in their own words from support transcripts for future content creation.

**Scope**: Process 50 support transcripts from Q4 2024
**Success Criteria**: All transcripts analyzed, pain points extracted, patterns identified
```

**Todos File** (`agent_tasks/todos/transcript-analysis_todos.md`):
```markdown
# Task Todos: Customer Pain Point Extraction

## Progress
- Total items: 50
- Completed: 23
- Remaining: 27

## Items to Process
- [x] transcript_001.md
- [x] transcript_002.md
- [ ] transcript_024.md
- [ ] transcript_025.md
```

**Insights File** (`agent_tasks/insights/transcript-analysis_insights.md`):
```markdown
# Task Insights: Customer Pain Point Extraction

## Key Findings
- Most common pain point: "Can't find documentation" (mentioned 15 times)
- Second most common: "Setup is confusing" (mentioned 12 times)

## Exact Phrases
- "I spent 2 hours looking for how to configure this"
- "The setup process is really confusing"
```

## Metrics

Track iterative work metrics:
- **Items Processed**: Count of items completed
- **Insights Collected**: Count of insights documented
- **Time per Item**: Average time to process each item
- **Completion Rate**: Percentage of items completed

Store in `logs/performance/iterative_work_[task_id].log`
