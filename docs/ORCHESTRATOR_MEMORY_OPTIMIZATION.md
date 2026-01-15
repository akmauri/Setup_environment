# Orchestrator Memory Optimization Plan

**Status**: Planned  
**Priority**: Medium  
**Technical Debt ID**: TD-001  
**Created**: 2026-01-15

## Problem Statement

The multi-agent orchestrator may hit Node.js heap memory limits when spawning multiple Cursor Agent processes, particularly for large tasks or concurrent agent spawning.

## Current State

### Observed Behavior

- JavaScript heap out of memory error during agent spawning
- Occurs when orchestrator attempts to spawn agent processes via WSL
- Error: `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`

### Current Workarounds

1. ✅ **Single-Session Orchestration** (Recommended)
   - Fully functional, no memory issues
   - Provides same benefits through sequential execution
   - Default approach for most use cases

2. ✅ **Memory Limit Flag** (Implemented)
   - Use `--max-memory 4096` flag to increase heap
   - Or use npm script: `npm run orchestrate:high-memory`
   - Reduces concurrency: `--max-concurrent 1`

## Optimization Plan

### Phase 1: Immediate Improvements (Current)

**Status**: ✅ Complete

- [x] Document limitation in `docs/TECHNICAL_DEBT.md`
- [x] Add to risk assessment
- [x] Implement `--max-memory` flag
- [x] Add npm script for high-memory execution
- [x] Update documentation with workarounds

### Phase 2: Short-term Optimizations (Next Sprint)

**Status**: Planned

#### 2.1: Streaming Output Handling

**Goal**: Prevent output buffering from consuming memory

**Implementation**:

- Use `stdio: 'pipe'` with streaming handlers
- Process output line-by-line instead of buffering
- Limit buffer sizes

**Files to Modify**:

- `scripts/orchestrate_agents.js` - `spawnAgent()` method

**Estimated Effort**: 2-4 hours

#### 2.2: Memory Monitoring

**Goal**: Track memory usage to identify bottlenecks

**Implementation**:

- Log memory usage before/after spawn operations
- Track peak memory per agent
- Alert when approaching limits

**Files to Modify**:

- `scripts/orchestrate_agents.js` - Add memory logging

**Estimated Effort**: 1-2 hours

#### 2.3: Graceful Degradation

**Goal**: Fallback to single-session if memory limit reached

**Implementation**:

- Catch memory errors during spawn
- Automatically switch to single-session mode
- Log degradation event

**Files to Modify**:

- `scripts/orchestrate_agents.js` - Error handling

**Estimated Effort**: 2-3 hours

### Phase 3: Medium-term Optimizations (Next Month)

**Status**: Planned

#### 3.1: Worker Threads Instead of Child Processes

**Goal**: Reduce memory overhead of process spawning

**Implementation**:

- Evaluate Node.js worker threads
- Refactor spawn logic to use workers
- Test memory usage reduction

**Estimated Effort**: 8-16 hours

**Considerations**:

- Worker threads share memory space (may not help)
- Process isolation may be required for agent execution
- Need to evaluate if feasible

#### 3.2: Process Pooling

**Goal**: Reuse agent processes instead of spawning new ones

**Implementation**:

- Create agent process pool
- Reuse processes for multiple tasks
- Implement pool management

**Estimated Effort**: 12-20 hours

**Considerations**:

- Agent processes may need isolation
- State management complexity
- May not be feasible with Cursor CLI

#### 3.3: Queue-Based Orchestration

**Goal**: Decouple orchestration from process spawning

**Implementation**:

- Use message queue (Redis/Bull)
- Agents poll for tasks
- Reduce orchestrator memory footprint

**Estimated Effort**: 16-24 hours

**Considerations**:

- Requires additional infrastructure
- More complex architecture
- May be overkill for current needs

### Phase 4: Long-term Solutions (Future)

**Status**: Future Consideration

#### 4.1: External Orchestration Service

**Goal**: Move orchestration outside Node.js process

**Options**:

- Separate orchestration service
- Containerized agent execution
- Distributed orchestration

**Estimated Effort**: 40+ hours

#### 4.2: Alternative Agent Execution

**Goal**: Use more memory-efficient agent execution

**Options**:

- Direct API integration (if available)
- Lightweight agent processes
- Container-based execution

**Estimated Effort**: 40+ hours

## Success Criteria

### Phase 2 Success Criteria

- [ ] Orchestrator can spawn 2+ agents concurrently without memory errors
- [ ] Memory usage stays below 80% of heap limit
- [ ] Graceful fallback to single-session if memory limit reached
- [ ] Memory monitoring provides actionable insights

### Phase 3 Success Criteria

- [ ] Orchestrator can spawn 5+ agents concurrently
- [ ] Memory usage reduced by 50%+
- [ ] No memory-related errors in normal operation

## Implementation Priority

1. **High Priority**: Phase 2.3 (Graceful Degradation) - Improves reliability
2. **Medium Priority**: Phase 2.1 (Streaming Output) - Reduces memory usage
3. **Medium Priority**: Phase 2.2 (Memory Monitoring) - Provides visibility
4. **Low Priority**: Phase 3 optimizations - Only if multi-agent becomes critical

## Risk Assessment

### Low Risk

- Phase 2 optimizations (incremental improvements)
- Workarounds available (single-session works)

### Medium Risk

- Phase 3 optimizations (architectural changes)
- May introduce new bugs
- Requires testing

### Mitigation

- Keep single-session as default
- Test optimizations thoroughly
- Rollback plan available

## Related Documentation

- `docs/TECHNICAL_DEBT.md` - Technical debt tracking
- `docs/risk_assessment.md` - Risk assessment
- `docs/MULTI_AGENT_ORCHESTRATION.md` - Orchestration guide
- `docs/ORCHESTRATOR_VALIDATION_REPORT.md` - Validation report

## Notes

- Single-session orchestration works perfectly and provides most benefits
- Multi-agent orchestration is a "nice to have" optimization
- Memory issue only affects multi-agent spawning, not core functionality
- Consider this a performance optimization rather than blocking issue
- Optimization can be done incrementally without blocking other work

---

**Maintained By**: Architect Agent  
**Last Updated**: 2026-01-15  
**Next Review**: After Phase 2 completion
