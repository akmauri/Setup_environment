# Technical Debt and Known Limitations

**Last Updated**: 2026-01-15  
**Status**: Active Tracking

This document tracks technical debt, known limitations, and optimization opportunities in the system.

## Classification

Technical debt items are classified by:

- **Priority**: Critical, High, Medium, Low
- **Impact**: System-wide, Component-specific, Performance, Maintainability
- **Status**: Open, In Progress, Blocked, Resolved
- **Type**: Performance, Architecture, Code Quality, Documentation

## Active Technical Debt

### TD-001: Orchestrator Memory Limit Issue

**Priority**: Medium  
**Impact**: Component-specific (Multi-Agent Orchestrator)  
**Status**: Open  
**Type**: Performance  
**Created**: 2026-01-15

#### Description

The multi-agent orchestrator (`scripts/orchestrate_agents.js`) may hit Node.js heap memory limits when spawning multiple Cursor Agent processes, particularly for large tasks or when spawning multiple agents concurrently.

**Observed Behavior**:

- JavaScript heap out of memory error during agent spawning
- Occurs when orchestrator attempts to spawn agent processes via WSL
- Error: `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`

#### Root Cause Analysis

**Hypothesis 1**: Large process spawn overhead

- Agent spawning via WSL (`wsl -d Ubuntu bash -c "source ~/.bashrc && agent..."`) creates significant process overhead
- Each spawn operation may consume substantial memory
- **Status**: Likely cause

**Hypothesis 2**: Process output buffering

- Child process stdout/stderr buffering may accumulate memory
- Large agent outputs could exhaust heap
- **Status**: Possible contributing factor

**Hypothesis 3**: Concurrent spawn operations

- Multiple simultaneous spawns may compound memory usage
- **Status**: Contributing factor

#### Current Workaround

✅ **Single-Session Orchestration** (Fully Functional)

- Use single-session orchestration for all tasks
- Provides same benefits through sequential execution with locks/checkpoints
- No memory issues, fully validated
- **Recommendation**: Continue using until optimization complete

✅ **Immediate Workaround** (If Multi-Agent Needed)

- Increase Node.js heap: `node --max-old-space-size=4096 scripts/orchestrate_agents.js`
- Reduce concurrency: `--max-concurrent 1`
- Use smaller task batches

#### Mitigation Strategy

**Phase 1: Immediate (Current)**

- ✅ Document limitation
- ✅ Provide workarounds
- ✅ Use single-session orchestration as default
- ✅ Add memory limit flag to orchestrator script (`--max-memory`)
- ✅ Add npm script for high-memory execution
- ✅ Update risk assessment
- ✅ Create technical debt tracking document
- ✅ Create optimization plan document

**Phase 2: Short-term (Next Sprint)**

- [ ] Implement streaming output handling (prevent buffering)
- [ ] Add memory monitoring/logging
- [ ] Optimize spawn command construction
- [ ] Add graceful degradation (fallback to single-session)

**Phase 3: Medium-term (Next Month)**

- [ ] Refactor to use worker threads instead of child processes
- [ ] Implement process pooling
- [ ] Add memory usage limits per agent
- [ ] Consider alternative orchestration approach (queue-based)

**Phase 4: Long-term (Future)**

- [ ] Evaluate external orchestration service
- [ ] Consider containerized agent execution
- [ ] Implement distributed orchestration

#### Implementation Plan

**Task 1: Add Memory Limit Flag**

- **File**: `scripts/orchestrate_agents.js`
- **Change**: Add `--max-memory` flag that sets `--max-old-space-size`
- **Priority**: Low (workaround exists)

**Task 2: Implement Streaming Output**

- **File**: `scripts/orchestrate_agents.js`
- **Change**: Use `stdio: 'pipe'` with streaming handlers instead of buffering
- **Priority**: Medium

**Task 3: Add Memory Monitoring**

- **File**: `scripts/orchestrate_agents.js`
- **Change**: Log memory usage before/after spawn operations
- **Priority**: Medium

**Task 4: Graceful Degradation**

- **File**: `scripts/orchestrate_agents.js`
- **Change**: Catch memory errors and fallback to single-session mode
- **Priority**: High

#### Success Criteria

- [ ] Orchestrator can spawn 3+ agents concurrently without memory errors
- [ ] Memory usage stays below 80% of heap limit
- [ ] Graceful fallback to single-session if memory limit reached
- [ ] Memory monitoring provides actionable insights

#### Related Files

- `scripts/orchestrate_agents.js` - Orchestrator implementation
- `docs/ORCHESTRATOR_VALIDATION_REPORT.md` - Validation report
- `docs/MULTI_AGENT_ORCHESTRATION.md` - Orchestration guide
- `PARALLEL_EXECUTION_GUIDE.md` - Execution guide

#### Notes

- Single-session orchestration works perfectly and provides most benefits
- Multi-agent orchestration is a "nice to have" optimization, not critical
- Memory issue only affects multi-agent spawning, not core functionality
- Consider this a performance optimization rather than blocking issue

---

## Resolved Technical Debt

_None yet - this is the first tracked item_

---

## Technical Debt Review Process

### Regular Review

- **Frequency**: Monthly
- **Participants**: Architect, PM, Lead Dev
- **Process**:
  1. Review all open items
  2. Prioritize based on impact and effort
  3. Assign to sprints
  4. Update status

### Adding New Technical Debt

1. Create entry in this file
2. Classify (Priority, Impact, Type)
3. Add to risk assessment if high priority
4. Create task in `agent_tasks/todo_progress.json` if actionable
5. Link from related documentation

### Resolving Technical Debt

1. Mark status as "Resolved"
2. Move to "Resolved Technical Debt" section
3. Document resolution approach
4. Update related documentation
5. Remove from active tracking

---

**Maintained By**: Architect Agent  
**Review Frequency**: Monthly  
**Last Review**: 2026-01-15
