# Pull Request

## Description

<!-- Provide a clear description of what this PR does and why it's needed -->

## Related Task/Story

<!-- Link to related task in agent_tasks/todo_progress.json or story/epic -->
- Task ID: `task-xxx`
- Epic ID: `epic-x` (if applicable)
- Story ID: `story-x.x` (if applicable)

## Type of Change

<!-- Check all that apply -->

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Task completion (from agent_tasks/todo_progress.json)
- [ ] System/infrastructure change

## Agent Information

<!-- If this PR was created by an AI agent, fill this out -->

- **Agent Type**: <!-- e.g., @dev, @qa, @architect, etc. -->
- **Agent Name/ID**: <!-- if applicable -->
- **Autonomous Decision**: <!-- Yes/No - Did the agent make autonomous decisions? -->
- **Red Lines Crossed**: <!-- None, or list which red lines were crossed -->

## Changes Made

<!-- List the key changes in this PR -->

- 
- 
- 

## Files Changed

<!-- List major files changed (or use "See diff" if many files) -->

- 
- 

## Validation

<!-- Check all that apply -->

- [ ] Task validation passed (`node scripts/validate_tasks.js`)
- [ ] Documentation validation passed (`node scripts/validate_docs.js`)
- [ ] Dependencies checked (`node scripts/check_dependencies.js`)
- [ ] No lock conflicts (`node scripts/manage_locks.js check`)
- [ ] No blocking issues in `human_review/blocking_issues.md`
- [ ] JSON files are valid (todo_progress.json, completed_tasks.json)
- [ ] Agent rules followed (core_principles.md)
- [ ] Error handling implemented (if applicable)

## Testing

<!-- Describe how you tested this change -->

- [ ] Manual testing performed
- [ ] Automated tests added/updated
- [ ] No testing required (documentation/infrastructure only)

**Test Steps**:
1. 
2. 
3. 

## Task Status Updates

<!-- If this PR completes tasks, list them here -->

**Tasks Completed**:
- `task-xxx`: Description

**Tasks Updated**:
- `task-xxx`: Status change (e.g., in_progress → review)

**Tasks Blocked** (if any):
- `task-xxx`: Reason

## Dependencies

<!-- List any dependencies on other PRs or tasks -->

- Depends on: <!-- PR # or task ID -->
- Blocks: <!-- PR # or task ID -->
- Related to: <!-- PR # or task ID -->

## Breaking Changes

<!-- If this is a breaking change, describe the impact and migration path -->

**Impact**:
- 

**Migration Steps**:
1. 
2. 

## Screenshots/Demo

<!-- If applicable, add screenshots or demo links -->

## Checklist

<!-- Check all that apply before requesting review -->

- [ ] Code follows project conventions
- [ ] Documentation updated (if needed)
- [ ] Comments added for complex logic
- [ ] No console.logs or debug code left in
- [ ] Error handling implemented
- [ ] Logging added (if applicable)
- [ ] Agent coordination rules followed
- [ ] Autonomy protocol respected
- [ ] PR description is complete
- [ ] All validation checks pass
- [ ] Ready for review

## Review Notes

<!-- Any specific areas you'd like reviewers to focus on -->

## Additional Context

<!-- Any other information that reviewers should know -->

---

**Note for AI Agents**: 
- Ensure `agent_tasks/todo_progress.json` is updated if tasks are completed
- Move completed tasks to `agent_tasks/completed_tasks.json` if appropriate
- Log any autonomous decisions in `logs/autonomy/`
- Flag any red line crossings in `human_review/blocking_issues.md`
