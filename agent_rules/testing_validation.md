# Testing and Validation Protocol - Mandatory Rule

**Version**: 1.0.0  
**Last Updated**: 2026-01-15  
**Purpose**: Ensure all completed tasks are tested and validated before marking as complete

## Directive

**Every task completion MUST include testing/validation.** The agent must NOT mark a task as complete without running appropriate tests or validation checks.

## Rule: Mandatory Testing/Validation Before Completion

### Policy

Before marking ANY task as complete, the agent MUST:

1. **Run appropriate verification** - Execute tests, lint checks, type checks, or runtime validation
2. **Verify functionality** - Confirm the implementation works as intended
3. **Check for errors** - Ensure no errors, warnings, or regressions
4. **Document results** - Record test/validation results

### Required Verification Types

#### For Code Changes

- ✅ **Type checking**: `npm run type-check` or `tsc --noEmit`
- ✅ **Linting**: `npm run lint` or equivalent
- ✅ **Unit tests**: Run relevant test suites
- ✅ **Runtime check**: If applicable, verify the code runs without errors

#### For Scripts/Tools

- ✅ **Syntax check**: Verify script syntax is valid
- ✅ **Dry run**: Test script with `--dry-run` or similar if available
- ✅ **Help/version**: Verify command is accessible and shows help/version

#### For Configuration Changes

- ✅ **Validation**: Run config validation if available
- ✅ **Syntax check**: Verify JSON/YAML/TOML syntax
- ✅ **Schema validation**: If schema exists, validate against it

#### For Documentation

- ✅ **Spell check**: If tool available
- ✅ **Link validation**: Check for broken links
- ✅ **Format check**: Verify markdown/formatting is correct

### Minimum Verification

**At minimum**, one of these must be run:

- Type check (`npm run type-check` or equivalent)
- Lint check (`npm run lint` or equivalent)
- Syntax validation (for scripts/configs)
- Manual verification (for documentation)

### Prohibited Behavior

The agent MUST NOT:

- Mark tasks complete without running any verification
- Claim "tests pass" without actually running tests
- Skip validation "because it's a small change"
- Delegate testing to the user

### Required Evidence

When marking a task complete, the agent MUST provide:

- **Command executed**: The exact verification command run
- **Output summary**: Key results (pass/fail, error count, etc.)
- **File paths**: Files that were verified

### Integration with Quality Gates

This rule integrates with Quality Gates (Rule #12 in `rule_enforcement.md`):

- Quality Gates checklist includes: "Tests written and passing (if applicable)"
- This rule ensures tests/validation are actually RUN, not just written

## Examples

### Example 1: Code Implementation

**Before marking complete:**

```bash
# Run type check
npm run type-check
# Result: ✓ No errors

# Run lint
npm run lint
# Result: ✓ No errors

# Task can be marked complete
```

### Example 2: Script Creation

**Before marking complete:**

```bash
# Check syntax
node -c scripts/new_script.js
# Result: ✓ Syntax valid

# Test help
node scripts/new_script.js --help
# Result: ✓ Help displayed correctly

# Task can be marked complete
```

### Example 3: Configuration Update

**Before marking complete:**

```bash
# Validate JSON
node -e "JSON.parse(require('fs').readFileSync('config.json'))"
# Result: ✓ Valid JSON

# Task can be marked complete
```

## Exception Cases

### When Testing is Not Applicable

If testing/validation is genuinely not applicable (e.g., planning documents, analysis), the agent must:

- **Explicitly state why** testing is not applicable
- **Provide alternative verification** (e.g., "Documentation reviewed for completeness")
- **Still mark as complete** with justification

### When Tests Don't Exist Yet

If no test framework exists:

- **Create minimal test** if feasible
- **Or run manual verification** (e.g., syntax check, dry run)
- **Document** that test framework needs to be set up

## Integration with Other Rules

### No Manual Orchestration

- Agent must run tests itself, not ask user to test
- Agent must execute verification commands directly

### Quality Gates

- This rule ensures Quality Gate #2 ("Tests written and passing") is actually verified
- Quality Gates cannot pass without this rule being followed

### Error Handling

- If tests fail, follow error handling protocol
- Fix issues before marking complete

## Verification Checklist

Before marking ANY task complete, verify:

- [ ] Appropriate verification command identified
- [ ] Verification command executed
- [ ] Results reviewed (pass/fail, errors, warnings)
- [ ] Any failures addressed
- [ ] Evidence documented (command + output summary)
- [ ] Task can be marked complete

## Violations

Violations of this rule:

1. **Immediately correct** - Run verification before marking complete
2. **Document** - Log in `logs/agent_errors/[date].md`
3. **Escalate** - If systemic, update agent rules

---

**Status**: ✅ MANDATORY  
**Enforcement**: Automatic via Quality Gates  
**Integration**: Part of Rule #12 (Quality Gates) in `rule_enforcement.md`
