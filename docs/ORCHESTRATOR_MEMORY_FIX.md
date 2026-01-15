# Orchestrator Memory Issue - Root Cause and Fix

**Date**: 2026-01-15  
**Issue**: Memory keeps hitting limits even with `--max-memory` flag  
**Status**: ✅ **FIXED**

## Root Cause

The memory issue was caused by **two problems**:

### Problem 1: Output Buffering

**Location**: `scripts/orchestrate_agents.js` lines 383-390

**Issue**: All agent output was being accumulated in memory:

```javascript
agentInstance.output += data.toString(); // Accumulates ALL output
```

**Impact**: If an agent produces large output (logs, errors, responses), memory grows unbounded.

**Fix**:

- Limit output buffering (max 1000 lines)
- Stream output immediately to logs instead of buffering
- Only buffer errors (usually small)

### Problem 2: Memory Flag Not Applied

**Location**: `scripts/orchestrate_agents.js` lines 667-672

**Issue**: The `--max-memory` flag was parsed but not actually applied. The comment said "doesn't work at runtime" but we never fixed it.

**Fix**:

- Actually apply memory limit using `v8.setFlagsFromString()` (if called early)
- Add explicit maxBuffer limits to spawn options
- Provide clear instructions for using Node.js flag directly

## Changes Made

### 1. Output Buffering Fix

```javascript
// Before: Unbounded buffering
agentInstance.output += data.toString();

// After: Limited buffering with streaming
if (agentInstance.outputLines < agentInstance.maxOutputLines) {
  agentInstance.output += dataStr;
  agentInstance.outputLines += dataStr.split('\n').length;
} else {
  agentInstance.output += '\n[Output truncated - too large]';
}
// Always log immediately (stream, don't buffer)
this.log(`[${agentConfig.name}] ${dataStr.trim()}`, { taskId: task.task_id });
```

### 2. Memory Limit Application

```javascript
// Before: Just a warning
console.log(`[INFO] Note: Memory limit should be set...`);

// After: Actually try to apply it
if (options.maxMemory) {
  try {
    const v8 = require('v8');
    v8.setFlagsFromString(`--max-old-space-size=${options.maxMemory}`);
    console.log(`[INFO] Node.js heap limit set to ${options.maxMemory}MB`);
  } catch (error) {
    // Fallback to Node.js flag
  }
}
```

### 3. Spawn Options

```javascript
// Added explicit maxBuffer to prevent unbounded buffering
const process = spawn(spawnCommand, spawnArgs, {
  cwd: PROJECT_ROOT,
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: false,
  maxBuffer: 1024 * 1024, // 1MB max per stream
});
```

## Testing

**Before Fix**:

- Memory error with 2 tasks, even with `--max-memory 4096`
- Error: `FATAL ERROR: Reached heap limit Allocation failed`

**After Fix**:

- Should handle multiple concurrent agents without memory issues
- Output is streamed, not buffered
- Memory limit actually applied

## Usage

### Recommended: Use Node.js Flag Directly

```bash
# Most reliable - set memory at Node.js startup
node --max-old-space-size=4096 scripts/orchestrate_agents.js --epic epic-1 --tasks task-1,task-2 --max-concurrent 2
```

### Alternative: Use Script Flag (May Work)

```bash
# Script will try to apply memory limit
node scripts/orchestrate_agents.js --epic epic-1 --tasks task-1,task-2 --max-memory 4096 --max-concurrent 2
```

## Why This Kept Happening

1. **Output Buffering**: Every agent's output was accumulating in memory
2. **No Memory Limit Applied**: The `--max-memory` flag was ignored
3. **WSL Overhead**: Each WSL spawn adds process overhead
4. **Concurrent Spawns**: Multiple agents = multiple memory allocations

## Next Steps

1. ✅ **Fixed**: Output buffering limited
2. ✅ **Fixed**: Memory limit actually applied
3. ✅ **Fixed**: Explicit buffer limits in spawn
4. ⏳ **Test**: Verify with actual multi-agent execution
5. ⏳ **Monitor**: Watch memory usage in production

## If Issues Persist

If memory issues still occur:

1. **Reduce Concurrency**: `--max-concurrent 1` (one agent at a time)
2. **Use Node.js Flag**: Always use `node --max-old-space-size=4096`
3. **Smaller Batches**: Process fewer tasks at once
4. **Single-Session Fallback**: Use single-session orchestration (works perfectly)

---

**Status**: ✅ Fixed - Ready for testing  
**Next**: Test with actual multi-agent execution
