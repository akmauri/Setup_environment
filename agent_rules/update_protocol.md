# Agent Rules Update Protocol

This document defines how agent rules are updated, tested, and deployed.

## Update Triggers

Agent rules should be updated when:

1. **> 5 similar errors occur** - Pattern indicates rule gap
2. **New tool or technology introduced** - Rules need to cover new tools
3. **Performance degradation detected** - Rules may be causing inefficiency
4. **Monthly review cycle** - Regular review and improvement
5. **Process improvement identified** - Better way to do something discovered
6. **Agent feedback** - Agents report issues with current rules
7. **Project evolution** - Project requirements change significantly

## Update Process

### Step 1: Create Update Proposal

**Location**: `agent_rules/rule_update_proposal.md`

**Required Content**:
- **Current Rule**: What rule needs updating
- **Problem Statement**: Why update is needed
- **Proposed Change**: What the new rule should be
- **Rationale**: Why this change is better
- **Impact Analysis**: What will be affected
- **Migration Path**: How to transition
- **Testing Plan**: How to validate the change

**Format**:
```markdown
# Rule Update Proposal: [Rule Name]

**Date**: [Date]
**Proposed By**: [Agent/Person]
**Status**: [Draft|Review|Approved|Rejected]

## Current Rule
[Description of current rule]

## Problem Statement
[Why this needs to change]

## Proposed Change
[New rule description]

## Rationale
[Why this is better]

## Impact Analysis
- **Affected Agents**: [List]
- **Affected Processes**: [List]
- **Breaking Changes**: [Yes/No, details]
- **Migration Required**: [Yes/No, details]

## Migration Path
[How to transition from old to new]

## Testing Plan
[How to validate the change works]

## Approval
- [ ] Reviewed by Architect
- [ ] Reviewed by PM
- [ ] Tested in staging
- [ ] Approved for deployment
```

### Step 2: Review Process

**Reviewers**:
1. **Architect Agent** - Technical feasibility
2. **PM Agent** - Process impact
3. **Dev Agent** - Implementation details
4. **QA Agent** - Testing requirements

**Review Criteria**:
- Does it solve the problem?
- Is it clear and actionable?
- Will it cause breaking changes?
- Is migration feasible?
- Are tests adequate?

**Review Timeline**:
- Initial review: 24 hours
- Revisions: 48 hours
- Final approval: 72 hours

### Step 3: Staging Environment Testing

**Test in Staging**:
1. **Deploy to staging** - Update rules in staging environment
2. **Run test scenarios** - Execute typical workflows
3. **Monitor behavior** - Check agent behavior matches expectations
4. **Collect metrics** - Measure performance impact
5. **Document results** - Record test outcomes

**Success Criteria**:
- ✅ No breaking changes observed
- ✅ Agents follow new rules correctly
- ✅ Performance maintained or improved
- ✅ No new errors introduced
- ✅ Migration path works

**Duration**: Minimum 24 hours, recommended 48-72 hours

### Step 4: Single Agent Validation

**Deploy to One Agent**:
1. **Select test agent** - Choose one agent for validation
2. **Update agent rules** - Deploy new rules to test agent
3. **Monitor for 24 hours** - Watch agent behavior
4. **Collect feedback** - Document agent performance
5. **Validate success** - Confirm rules work as expected

**Success Criteria**:
- ✅ Agent follows new rules
- ✅ No errors or issues
- ✅ Performance acceptable
- ✅ No negative side effects

### Step 5: Full Deployment

**After 24h Success**:
1. **Deploy to all agents** - Update all agent rules
2. **Notify agents** - Inform agents of rule changes
3. **Monitor rollout** - Watch for issues
4. **Collect feedback** - Get agent feedback
5. **Document deployment** - Record deployment details

**Rollback Plan**:
- Keep old rules as backup
- Can rollback within 48 hours if issues
- Document rollback procedure

## Rule Versioning

### Version Format

**Format**: `v{major}.{minor}.{patch}`

**Examples**:
- `v1.0.0` - Initial version
- `v1.1.0` - Minor update (new feature)
- `v1.1.1` - Patch (bug fix)
- `v2.0.0` - Major update (breaking change)

### Version Tracking

**Location**: Each rule file has version in header

**Format**:
```markdown
# [Rule Name]

**Version**: v1.0.0
**Last Updated**: 2026-01-XX
**Updated By**: [Agent/Person]
```

### Change Log

**Location**: `agent_rules/CHANGELOG.md`

**Format**:
```markdown
# Agent Rules Changelog

## [Version] - [Date]

### Changed
- [Rule Name]: [Description of change]

### Added
- [New Rule]: [Description]

### Removed
- [Removed Rule]: [Reason]

### Fixed
- [Rule Name]: [Bug fix description]
```

## Emergency Updates

### When Emergency Updates Are Needed

- Critical security issue
- System-breaking bug
- Data corruption risk
- Immediate performance issue

### Emergency Update Process

1. **Immediate Fix** - Apply fix immediately
2. **Document Later** - Document after stabilization
3. **Review Post-Mortem** - Review what happened
4. **Update Process** - Improve process if needed

### Emergency Update Approval

- Can skip staging for critical issues
- Still requires single-agent validation (reduced to 4 hours)
- Full deployment after validation
- Post-mortem review required

## Rule Deprecation

### When to Deprecate

- Rule no longer needed
- Replaced by better rule
- Technology change makes rule obsolete
- Process change eliminates need

### Deprecation Process

1. **Mark as deprecated** - Add deprecation notice
2. **Provide migration** - Show how to transition
3. **Set removal date** - Remove after migration period
4. **Notify agents** - Inform all agents
5. **Remove rule** - Delete after migration complete

## Integration with BMAD

This update protocol integrates with BMAD:

- **BMAD Agents**: All agents follow updated rules
- **BMAD Workflows**: Workflows updated to reflect rule changes
- **BMAD Knowledge Base**: Rule changes documented in knowledge base
- **BMAD Orchestrator**: Orchestrator enforces updated rules

## Metrics and Monitoring

### Track Rule Updates

- **Update Frequency**: How often rules are updated
- **Update Success Rate**: Percentage of successful updates
- **Rollback Rate**: How often updates are rolled back
- **Agent Adoption**: How quickly agents adopt new rules

### Store Metrics

**Location**: `logs/performance/rule_updates.log`

**Format**:
```json
{
  "date": "2026-01-XX",
  "rule": "core_principles",
  "version": "v1.1.0",
  "update_type": "minor",
  "success": true,
  "rollback": false,
  "adoption_time": "24h"
}
```

## Best Practices

1. **Document Everything** - All changes must be documented
2. **Test Thoroughly** - Never skip testing
3. **Communicate Clearly** - Keep agents informed
4. **Version Control** - Track all versions
5. **Learn from Mistakes** - Improve process continuously
