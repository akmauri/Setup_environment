# Claude Skill Development Guide

This guide explains when and how to create Claude skills for repetitive or specialized tasks.

## When to Create a Claude Skill

Create a Claude Skill when **ALL** of the following criteria are met:

1. **Task Repeats > 3 Times/Week**: The task is performed frequently enough to justify automation
2. **Task Requires Specific Domain Knowledge**: The task needs specialized knowledge or context
3. **Task Involves Complex Decision Trees**: The task has multiple decision points or conditions
4. **Task Can Be Standardized**: The task can be defined with clear inputs, outputs, and process

### Examples

✅ **Good Candidates**:
- Code review with specific checklist
- API endpoint creation following project patterns
- Test generation for specific component types
- Documentation generation from code
- Database migration creation

❌ **Not Good Candidates**:
- One-off tasks
- Tasks requiring human judgment
- Tasks that vary significantly each time
- Simple tasks that don't need automation

## Skill Structure

### Skill File Format

**Location**: `claude_skills/[skill_name].md`

**Format**:
```markdown
# [Skill Name]

**Version**: v1.0.0
**Created**: [Date]
**Author**: [Agent/Person]
**Usage Count**: 0

## Description
[What this skill does]

## When to Use
[When this skill should be invoked]

## Inputs
- [Input 1]: [Description]
- [Input 2]: [Description]

## Process
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Outputs
- [Output 1]: [Description]
- [Output 2]: [Description]

## Examples

### Example 1
**Input**: [Example input]
**Output**: [Example output]

## Testing
[How to test this skill]

## Related Skills
- [Related skill 1]
- [Related skill 2]
```

## Skill Development Process

### Step 1: Identify Need

1. Notice repetitive task
2. Verify it meets creation criteria
3. Document the task pattern
4. Get approval if needed

### Step 2: Design Skill

1. Define inputs and outputs
2. Document the process
3. Identify decision points
4. Create examples

### Step 3: Create Skill File

1. Create skill file in `claude_skills/`
2. Follow skill structure format
3. Include clear instructions
4. Add examples

### Step 4: Test Skill

1. Test with various inputs
2. Verify outputs are correct
3. Test edge cases
4. Document test results

### Step 5: Register Skill

1. Add to `skill_registry.json`
2. Include metadata:
   - Name, version, author
   - Description
   - Usage count (starts at 0)
   - Last used date

### Step 6: Document Usage

1. Update skill with usage examples
2. Track usage in registry
3. Update skill based on feedback
4. Version skill when making changes

## Skill Template

Use this template when creating a new skill:

```markdown
# [Skill Name]

**Version**: v1.0.0
**Created**: [Date]
**Author**: [Your Agent ID]
**Usage Count**: 0
**Last Used**: Never

## Description
[One paragraph describing what this skill does]

## When to Use
- [Condition 1]
- [Condition 2]
- [Condition 3]

## Prerequisites
- [Prerequisite 1]
- [Prerequisite 2]

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| input1 | string | Yes | [Description] |
| input2 | number | No | [Description] |

## Process

### Step 1: [Step Name]
[Detailed instructions]

### Step 2: [Step Name]
[Detailed instructions]

### Step 3: [Step Name]
[Detailed instructions]

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| output1 | [type] | [Description] |
| output2 | [type] | [Description] |

## Examples

### Example 1: [Scenario]
**Input**:
```
[Example input]
```

**Output**:
```
[Example output]
```

**Notes**: [Any relevant notes]

## Error Handling
- [Error case 1]: [How to handle]
- [Error case 2]: [How to handle]

## Testing
1. [Test case 1]
2. [Test case 2]
3. [Test case 3]

## Related Skills
- [Related skill 1]: [How it relates]
- [Related skill 2]: [How it relates]

## Changelog
- v1.0.0: Initial version
```

## Skill Registry

All skills must be registered in `skill_registry.json`:

```json
{
  "name": "skill-name",
  "version": "v1.0.0",
  "author": "agent-id",
  "description": "Brief description",
  "file": "skill-name.md",
  "created": "2026-01-XX",
  "last_used": null,
  "usage_count": 0,
  "tags": ["tag1", "tag2"]
}
```

## Skill Usage

### Invoking a Skill

1. Load skill file from `claude_skills/`
2. Read skill instructions
3. Gather required inputs
4. Follow skill process
5. Update usage count in registry
6. Update last_used date

### Skill Updates

When updating a skill:

1. Increment version number
2. Document changes in changelog
3. Test updated skill
4. Update registry if needed
5. Notify users of breaking changes

## Best Practices

1. **Keep Skills Focused**: One skill, one purpose
2. **Document Thoroughly**: Clear inputs, outputs, examples
3. **Test Extensively**: Test with various inputs
4. **Version Changes**: Track versions and changes
5. **Monitor Usage**: Track which skills are used most
6. **Update Regularly**: Keep skills current with project changes

## Integration with BMAD

Skills integrate with BMAD:

- BMAD agents can use skills
- Skills can reference BMAD templates
- Skills follow BMAD patterns
- Skills are documented in BMAD knowledge base

## Maintenance

- Review skills monthly
- Remove unused skills (after 6 months of no use)
- Update skills when patterns change
- Consolidate similar skills
