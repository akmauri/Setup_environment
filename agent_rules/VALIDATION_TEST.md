# Iterative Work Pattern - Validation Test

**Date**: 2026-01-XX  
**Purpose**: Validate the iterative work pattern implementation  
**Status**: Test Scenario

## Test Scenario: Agent Rule Review

This test simulates an iterative task to validate the three-file pattern works correctly.

### Test Setup

**Task**: Review all agent rule files to identify common patterns and improvement opportunities

**Task ID**: `test-iterative-pattern-001`

### Step 1: Create Context File

**File**: `agent_tasks/context/test-iterative-pattern-001_context.md`

**Expected Content**:

- Goal: Review agent rules for patterns
- Scope: All files in `agent_rules/`
- Success Criteria: All files reviewed, patterns identified

### Step 2: Create Todos File

**File**: `agent_tasks/todos/test-iterative-pattern-001_todos.md`

**Expected Content**:

- List of all agent rule files to review
- Checkboxes for each file
- Progress tracking

### Step 3: Create Insights File

**File**: `agent_tasks/insights/test-iterative-pattern-001_insights.md`

**Expected Content**:

- Findings from reviewing each file
- Patterns identified
- Observations

### Step 4: Simulate Iterative Processing

1. Process first file
2. Update insights file
3. Check off todo item
4. Update progress count

### Step 5: Simulate Memory Compaction Recovery

1. "Forget" current state
2. Read context file
3. Read todos file
4. Read insights file
5. Verify continuity
6. Continue from next item

### Validation Checklist

- [ ] Context file created with all required sections
- [ ] Todos file created with proper checkbox format
- [ ] Insights file created with proper structure
- [ ] Files can be updated iteratively
- [ ] Progress tracking works correctly
- [ ] Memory compaction recovery procedure works
- [ ] Integration with other rules is documented
- [ ] File locations match file_organization.md

### Test Results

_To be filled after running test_

## Notes

This is a validation test document. The actual test files would be created in:

- `agent_tasks/context/test-iterative-pattern-001_context.md`
- `agent_tasks/todos/test-iterative-pattern-001_todos.md`
- `agent_tasks/insights/test-iterative-pattern-001_insights.md`

These directories will be created automatically when the pattern is first used.
