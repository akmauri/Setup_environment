# CLI Agent Prompt Escaping Fix

**Date**: 2026-01-16  
**Status**: ✅ **FIXED**

## Problem

The orchestrator was spawning CLI agents via WSL, but agents were not receiving prompts correctly. The error showed:

```
/bin/bash: line 1: [Backend: command not found
```

### Root Cause

1. **Special Characters in Prompt**: The prompt contained special characters like `[Backend Developer 1]` from the commit message template
2. **Bash Command Interpretation**: Bash interpreted `[` as the start of a test command, causing it to try to execute `[Backend` as a command
3. **Insufficient Escaping**: The original escaping only handled `"` and `$`, but not:
   - Square brackets `[` and `]` (bash test command)
   - Backticks `` ` `` (command substitution)
   - Other special bash characters
4. **Agents Never Started**: Because the prompt was malformed, agents never received their instructions and remained idle

## Solution

### Temporary File Approach

Instead of trying to escape all special characters, the prompt is now:

1. **Written to a temporary file** (`.temp/prompt-{task_id}-{timestamp}.txt`)
2. **Read in WSL** using `cat` command
3. **Passed to agent** via command substitution `$(cat 'file')`

This approach:

- ✅ Avoids all escaping issues
- ✅ Handles any special characters safely
- ✅ Works reliably with multi-line prompts
- ✅ Automatically cleans up temp files

### Implementation Details

**File Location**: `scripts/orchestrate_agents.js` - `spawnAgentCLI()` method

**Changes**:

1. Create `.temp` directory if it doesn't exist
2. Write prompt to temporary file
3. Convert Windows path to WSL path (`C:\Users\...` → `/mnt/c/Users/...`)
4. Use `cat` to read file in WSL: `$(cat '/mnt/c/Users/.../prompt-xxx.txt')`
5. Clean up temp file on process exit and after 5-minute timeout

**Code**:

```javascript
// Write prompt to temporary file
const tempPromptFile = path.join(PROJECT_ROOT, '.temp', `prompt-${task.task_id}-${Date.now()}.txt`);
const wslPath = tempPromptFile
  .replace(/\\/g, '/')
  .replace(/^([A-Z]):/, (match, drive) => `/mnt/${drive.toLowerCase()}`);

await fs.writeFile(tempPromptFile, taskPrompt, 'utf-8');

// Read file in WSL and pass to agent
spawnArgs = [
  '-d',
  'Ubuntu',
  'bash',
  '-c',
  `source ~/.bashrc && ${agentPath} -p --force "$(cat '${wslPath}')"`,
];
```

## Additional Fixes

### Progress Tracking Initialization

**Problem**: CLI agents didn't have `lastProgressTime` and `lastStatus` initialized, causing "idle: N/Am" display.

**Fix**: Initialize these fields when creating CLI agent instances:

```javascript
const agentInstance = {
  // ...
  lastProgressTime: Date.now(),
  lastStatus: task.status || 'pending',
  // ...
};
```

### Progress Monitoring

**Problem**: CLI agents weren't being monitored for progress.

**Fix**: Call `monitorAgentProgress()` for CLI agents too:

```javascript
this.monitorAgentProgress(agentInstance);
```

## Testing

### Before Fix

- ❌ Agents spawned but remained idle
- ❌ Error: `/bin/bash: line 1: [Backend: command not found`
- ❌ No status updates in `todo_progress.json`
- ❌ Orchestrator waited indefinitely

### After Fix

- ✅ Agents receive prompts correctly
- ✅ No bash escaping errors
- ✅ Agents can update `todo_progress.json`
- ✅ Progress monitoring works
- ✅ Temp files cleaned up automatically

## Verification

To verify the fix works:

1. **Check temp file creation**:

   ```bash
   ls .temp/prompt-*.txt
   ```

2. **Check orchestrator logs**:

   ```
   [INFO] Created temporary prompt file: .temp/prompt-task-xxx-1234567890.txt (WSL: /mnt/c/Users/...)
   ```

3. **Check agent output**:
   - Should see agent receiving and processing the prompt
   - No bash errors about `[Backend: command not found`

4. **Check task status updates**:
   - Tasks should change from `pending` → `in_progress` → `completed`
   - Status changes visible in `todo_progress.json`

## Related Files

- `scripts/orchestrate_agents.js` - Main fix location
- `.temp/` - Temporary prompt files directory (auto-created)
- `docs/AGENT_PROGRESS_TROUBLESHOOTING.md` - Troubleshooting guide
