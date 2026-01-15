<!-- Powered by BMAD™ Core -->

# Breakdown Story Tasks (Ralph-Wiggum Integration)

## Purpose

To automatically break down a BMAD story's tasks into atomic, independently completable units using the Ralph-Wiggum "One Sentence Without 'And'" test. This task enhances the granularity of tasks derived from stories, enabling better parallelization and clearer task boundaries without disrupting the core story creation process.

## SEQUENTIAL Task Execution (Do not proceed until current Task is complete)

### 0. Load Core Configuration and Story Context

- Load `.bmad-core/core-config.yaml` from the project root
- Extract key configurations: `devStoryLocation`
- Load the story file that was just created (passed as input or from Step 6 of `create-next-story.md`)
- Verify the story file exists and is in "Draft" status
- If story is not in Draft status, HALT and inform: "Story must be in Draft status for task breakdown. Current status: {status}"

### 1. Analyze Story Tasks

- Read the story file's `Tasks / Subtasks` section
- Identify all tasks and subtasks listed
- For each task/subtask, analyze:
  - Current description and scope
  - Dependencies (explicit or implicit)
  - Complexity indicators
  - Whether it passes the "One Sentence Without 'And'" test

### 2. Apply Ralph-Wiggum Phase 1: Task Analysis

Following `ralph_wiggum_process.md` Phase 1 guidelines and `plan/PROMPT_PLANNING.md`:

#### 2.1 Break Down Each Task

For each task/subtask that fails the "One Sentence Without 'And'" test:

1. **Identify Compound Actions**: Look for tasks containing "and", "then", "also", or multiple distinct actions
2. **Separate Concerns**: Split into individual, focused tasks
3. **Verify Atomicity**: Each resulting task must:
   - Be describable in one sentence without "and"
   - Be independently completable
   - Have clear, single-purpose scope
   - Be testable in isolation

#### 2.2 Identify Dependencies

- Map dependencies between tasks
- Document prerequisite relationships
- Identify parallelizable task groups (tasks with no dependencies on each other)

#### 2.3 Estimate Complexity

- Classify each atomic task as:
  - **low**: Simple, straightforward implementation
  - **medium**: Moderate complexity, may require some research
  - **high**: Complex, requires significant design or integration work

### 3. Create Specs (If Needed)

Following `plan/PROMPT_PLANNING.md` Step 2:

- For each "Topic of Concern" that doesn't have a spec in `specs/`:
  - Create a spec file: `specs/{topic}.md`
  - Each spec must pass the "One Sentence Without 'And'" test
  - Include: description, requirements, acceptance criteria, dependencies
- Only create specs for topics that are genuinely new or missing

### 4. Update Story File with Atomic Tasks

- Update the story file's `Tasks / Subtasks` section:
  - Replace compound tasks with their atomic breakdowns
  - Maintain the original task numbering where possible (e.g., Task 1.1, Task 1.2, Task 1.3 for breakdown of original Task 1)
  - Preserve links to Acceptance Criteria (ACs)
  - Add dependency annotations where relevant (e.g., `[Depends on: Task 1.1]`)
  - Add complexity indicators (e.g., `[Complexity: medium]`)
- Ensure all tasks now pass the "One Sentence Without 'And'" test
- Maintain backward compatibility: original task structure should still be recognizable

### 5. Update Implementation Plan

Following `plan/PROMPT_PLANNING.md` Step 4:

- Read `plan/IMPLEMENTATION_PLAN.md`
- Add or update entries for the new atomic tasks:
  - **Prioritized TODO list**: Add tasks ordered by priority (maintain story/epic priority)
  - **Dependencies**: Document dependency graph for new atomic tasks
  - **Complexity**: Include complexity estimates
  - **Epic/Story mapping**: Link tasks to the story (format: `{epicNum}.{storyNum}`)
- Ensure tasks are properly categorized by priority level

### 6. Update Task Tracking System

- Read `agent_tasks/todo_progress.json`
- For each new atomic task:
  - Create a task entry with:
    - `task_id`: Generate unique ID (format: `task-{timestamp}-{index}`)
    - `description`: Atomic task description (one sentence without "and")
    - `status`: "pending"
    - `epic_id`: Extract from story file
    - `story_id`: Extract from story file (format: `{epicNum}.{storyNum}`)
    - `priority`: Inherit from story/epic priority
    - `dependencies`: List of task_ids this task depends on
    - `estimated_complexity`: From Step 2.3
    - `created_at`: Current timestamp
    - `updated_at`: Current timestamp
- Preserve existing tasks (do not modify tasks from other stories)

### 7. Document Breakdown Summary

- Add a new section to the story file: `## Task Breakdown Summary`
- Document:
  - Original task count vs. atomic task count
  - Key breakdown decisions made
  - Dependency graph summary
  - Parallelization opportunities identified
- Include reference: `[Breakdown performed using Ralph-Wiggum Phase 1 methodology]`

### 8. Completion and Verification

- Verify all atomic tasks pass the "One Sentence Without 'And'" test
- Verify all dependencies are correctly mapped
- Verify task tracking system has been updated
- Verify implementation plan has been updated
- Save all modified files
- Provide summary to user including:
  - Story file updated: `{devStoryLocation}/{epicNum}.{storyNum}.story.md`
  - Original tasks: {count}
  - Atomic tasks created: {count}
  - Specs created: {count} (if any)
  - Tasks added to tracking system: {count}
  - Implementation plan updated: Yes/No
  - Next steps: Tasks are now ready for parallel agent assignment

## Rules

### CRITICAL: Non-Breaking Integration

- **DO NOT** modify story status, title, acceptance criteria, or other core story elements
- **DO NOT** remove or significantly alter original task descriptions (break them down, don't replace them)
- **DO NOT** change story file location or naming
- **ONLY** enhance the `Tasks / Subtasks` section with atomic breakdowns
- Maintain full backward compatibility with existing BMAD workflows

### Task Breakdown Rules

1. **One Sentence Without 'And'**: Each task must be describable in one sentence without "and"
2. **Independently Completable**: Each task must be completable without requiring another task to be in progress
3. **Single Purpose**: Each task should have one clear, focused objective
4. **Testable**: Each task should have clear completion criteria
5. **Preserve Context**: Maintain links to acceptance criteria and architecture references from original tasks

### Integration with BMAD

- This task is automatically invoked by `create-next-story.md` Step 7
- It runs non-blocking: story creation completes before breakdown begins
- Breakdown enhances but does not replace BMAD's task generation
- All outputs align with BMAD conventions and file structures

## Integration Point

This task is automatically called by `.bmad-core/tasks/create-next-story.md` as Step 7, immediately after Step 6 (Story Draft Completion and Review) completes successfully.
