# Git & GitHub Best Practices

**Last Updated**: 2026-01-16  
**Status**: ✅ **MANDATORY**

## Overview

All agents MUST follow Git and GitHub best practices to ensure:

- Work is regularly backed up
- Code history is preserved
- Collaboration is seamless
- No work is lost due to system failures
- Remote repository stays synchronized

## Mandatory Commit Requirements

### 1. Task-Based Commits (PRIMARY)

**When to commit**:

- ✅ **After completing a task** (MANDATORY)
- ✅ **After making significant changes** (even if task not complete)
- ✅ **Before marking task as completed** in `todo_progress.json`
- ✅ **After fixing errors** (error fixes should be committed immediately)

**Commit Format**:

```
[Agent-ID] [Task-ID] Description

- Brief bullet points of what changed
- Include relevant context
```

**Example**:

```
[dev-backend-1] [task-1234567890-1] Create health check endpoint

- Added GET /health route handler
- Returns 200 OK with timestamp
- Follows REST API standards
- Added unit tests
```

### 2. Periodic Commits (SAFETY BACKUP)

**CRITICAL**: Even if a task is not complete, commit work periodically to prevent loss.

**Frequency**:

- ✅ **Every 30 minutes** of active work (minimum)
- ✅ **After every significant milestone** (e.g., feature working, tests passing)
- ✅ **Before taking a break** or switching tasks
- ✅ **When encountering errors** (commit working state before debugging)

**Commit Format for Periodic Commits**:

```
[Agent-ID] [Task-ID] WIP: Description

- Current progress state
- What's working
- What's next
```

**Example**:

```
[dev-backend-1] [task-1234567890-1] WIP: Implementing health check

- Route handler created
- Basic response working
- Next: Add database health check
```

**Why Periodic Commits Matter**:

- Prevents loss of work if system crashes
- Provides recovery points if changes break things
- Allows other agents to see progress
- Creates better code history

### 3. Commit Message Best Practices

**DO**:

- ✅ Use clear, descriptive messages
- ✅ Include task ID in every commit
- ✅ Include agent ID in every commit
- ✅ List key changes in commit body
- ✅ Reference related files/modules

**DON'T**:

- ❌ Use vague messages like "fix" or "update"
- ❌ Commit without task ID
- ❌ Commit unrelated changes together
- ❌ Leave commit messages empty

**Good Examples**:

```
[dev-backend-1] [task-1234567890-1] Add OAuth token validation

- Implemented token verification endpoint
- Added JWT signature validation
- Created token refresh logic
- Added error handling for expired tokens
```

```
[dev-frontend-1] [task-1234567890-2] WIP: User dashboard layout

- Created dashboard component structure
- Added navigation sidebar
- Implemented responsive grid layout
- Next: Add data fetching hooks
```

## Mandatory Push Requirements

### 1. Push Frequency

**CRITICAL**: Push commits to GitHub regularly to ensure remote backup.

**Frequency**:

- ✅ **After every commit** (preferred - ensures immediate backup)
- ✅ **At minimum: Every 2 hours** of active work
- ✅ **Before ending work session** (MANDATORY)
- ✅ **After completing a task** (MANDATORY)
- ✅ **When switching between tasks** (recommended)

**Why Regular Pushes Matter**:

- Remote backup prevents local data loss
- Enables collaboration with other agents
- Provides recovery point if local repo corrupted
- Allows monitoring of progress

### 2. Push Commands

**Standard Push**:

```bash
git push origin <branch-name>
```

**If working on main/master**:

```bash
git push origin main
# or
git push origin master
```

**If working on feature branch**:

```bash
git push origin feature/task-1234567890-1
```

**Force Push**: ❌ **NEVER force push to main/master**

- Only force push to feature branches if absolutely necessary
- Always coordinate with other agents first

### 3. Branch Management

**Branch Strategy**:

- ✅ **Feature branches** for new tasks: `feature/task-<task-id>`
- ✅ **Main/master** for completed, reviewed work
- ✅ **Keep branches up to date** with main/master

**Before Starting Work**:

```bash
# Ensure you're on latest main/master
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/task-1234567890-1
```

**After Completing Task**:

```bash
# Push feature branch
git push origin feature/task-1234567890-1

# Merge to main (or create PR if required)
git checkout main
git merge feature/task-1234567890-1
git push origin main
```

## Backup Safety Measures

### 1. Uncommitted Work Protection

**Before risky operations** (refactoring, major changes, experiments):

```bash
# Commit current state first
git add .
git commit -m "[Agent-ID] [Task-ID] WIP: Checkpoint before [operation]"
git push origin <branch>
```

**If work is lost**:

```bash
# Recover from reflog
git reflog
git checkout <commit-hash>
```

### 2. Stash for Quick Saves

**When switching tasks quickly**:

```bash
# Save current work
git stash push -m "[Agent-ID] [Task-ID] WIP: [description]"

# Later, restore work
git stash pop
```

**Note**: Stash is temporary - commit and push as soon as possible.

### 3. Remote Backup Verification

**Periodically verify remote is up to date**:

```bash
# Check remote status
git fetch origin
git status

# Compare local vs remote
git log HEAD..origin/main
```

## Integration with Task Tracking

### Commit-Task Relationship

**Every commit MUST**:

1. ✅ Reference task ID in commit message
2. ✅ Update `todo_progress.json` if task status changes
3. ✅ Log activity in `logs/agent_activity/[date].md`

**Example Workflow**:

```bash
# 1. Make changes
# ... edit files ...

# 2. Stage changes
git add .

# 3. Commit with task reference
git commit -m "[dev-backend-1] [task-1234567890-1] Create health check endpoint

- Added GET /health route handler
- Returns 200 OK with timestamp
- Follows REST API standards"

# 4. Push to remote
git push origin main

# 5. Update task status
# ... update todo_progress.json ...

# 6. Log activity
# ... log to logs/agent_activity/[date].md ...
```

## Periodic Backup Checklist

**Every 30 minutes of work**:

- [ ] Commit current progress (even if WIP)
- [ ] Push to remote
- [ ] Verify push succeeded
- [ ] Update activity log

**Before ending work session**:

- [ ] Commit all changes
- [ ] Push to remote (MANDATORY)
- [ ] Verify remote is up to date
- [ ] Update task status in `todo_progress.json`
- [ ] Log activity

**After completing task**:

- [ ] Commit final changes
- [ ] Push to remote (MANDATORY)
- [ ] Update task status to "completed"
- [ ] Log completion in activity log
- [ ] Merge feature branch if applicable

## Error Handling

### If Push Fails

**Common Issues**:

1. **Remote has new commits**:

   ```bash
   git pull origin main
   # Resolve conflicts if any
   git push origin main
   ```

2. **Authentication failed**:
   - Check Git credentials
   - Verify SSH keys or tokens
   - Contact system administrator

3. **Network issues**:
   - Retry push
   - If persistent, commit locally and push when network available
   - Document in activity log

### If Commit Fails

**If commit rejected**:

- Check for uncommitted changes: `git status`
- Verify branch is correct: `git branch`
- Check for merge conflicts: `git status`
- Resolve issues and retry

## Monitoring & Compliance

### Orchestrator Monitoring

The orchestrator monitors:

- ✅ Commit frequency (logs commit activity)
- ✅ Push frequency (can detect stale branches)
- ✅ Task-commit correlation (verifies commits reference tasks)

### Self-Check

**Before marking task complete, verify**:

- [ ] All changes committed
- [ ] Commits pushed to remote
- [ ] Commit messages include task ID
- [ ] Activity logged
- [ ] Task status updated

## Best Practices Summary

### DO ✅

- Commit after every task completion
- Commit every 30 minutes during active work
- Push after every commit (or at minimum every 2 hours)
- Include task ID in every commit message
- Include agent ID in every commit message
- Write descriptive commit messages
- Push before ending work session
- Keep feature branches up to date
- Verify remote backup regularly

### DON'T ❌

- Work for hours without committing
- Leave uncommitted work overnight
- Force push to main/master
- Commit without task ID
- Use vague commit messages
- Skip pushing to remote
- Work directly on main/master (use feature branches)

## Related Rules

- `agent_rules/task_tracking.md` - Task tracking requirements
- `agent_rules/core_principles.md` - Core principles including Git workflow
- `.cursor/rules/development-workflow.mdc` - Development workflow

## Enforcement

**This rule is MANDATORY**. Agents that fail to:

- Commit regularly (every 30 minutes minimum)
- Push regularly (every 2 hours minimum)
- Include task IDs in commits
- Push before ending work

May be flagged for review and may have work reverted if backup is lost.

**Remember**: Regular commits and pushes are not optional - they are essential for:

- Data safety
- Collaboration
- Progress tracking
- Recovery capability
