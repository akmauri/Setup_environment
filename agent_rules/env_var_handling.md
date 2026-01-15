# Environment Variable Handling Rule

**Version**: v1.0.0  
**Last Updated**: 2026-01-14  
**Purpose**: Prevent agents from looping on missing `.env` files and ensure proper environment variable handling without exposing secrets

## Directive

Agents MUST NEVER read or expect access to `.env` files. Agents MUST assume `.env` is intentionally hidden and rely exclusively on `.env.example` or `.env.schema` files for environment variable requirements.

## Core Principle

**`.env` files are intentionally ignored by global gitignore and Cursor's security rules. This is correct behavior and must never be changed.**

## Mandatory Rules

### Rule 1: Never Read .env Files

- ❌ **NEVER** attempt to read `.env` files
- ❌ **NEVER** expect `.env` files to be accessible
- ❌ **NEVER** try to create or modify `.env` files
- ❌ **NEVER** assume `.env` exists or is readable
- ✅ **ALWAYS** assume `.env` is intentionally hidden

### Rule 2: Use .env.example or .env.schema

- ✅ **ALWAYS** read `.env.example` (or `.env.schema`) for environment variable requirements
- ✅ **ALWAYS** reference `.env.example` when documenting required variables
- ✅ **ALWAYS** update `.env.example` when adding new environment variables
- ✅ **ALWAYS** use `.env.example` as the single source of truth for env var schema

### Rule 3: Stop Looping on Missing Env Vars

**When a required environment variable is missing at runtime:**

1. **Check `.env.example`** - Verify the variable is documented
2. **If documented in `.env.example`**:
   - Inform the user that they need to populate `.env` manually
   - Do NOT recreate or modify `.env.example` unless the schema actually changed
   - Do NOT attempt to read or create `.env`
3. **If NOT documented in `.env.example`**:
   - Add the variable to `.env.example` with a placeholder value
   - Document what the variable is for
   - Inform the user they need to add it to their `.env` file
4. **STOP** - Do not loop on this issue

**Maximum 1 attempt** to handle missing env vars. After that, inform the user and move on.

### Rule 4: Never Generate Secrets

- ❌ **NEVER** generate secrets automatically (API keys, JWT secrets, passwords)
- ❌ **NEVER** put real values in `.env.example`
- ❌ **NEVER** suggest hardcoded secrets as a workaround
- ✅ **ALWAYS** use placeholder values in `.env.example` (e.g., `your-api-key-here`, `your-secret-here`)
- ✅ **ALWAYS** inform users they must obtain real secrets from the appropriate service

### Rule 5: Document Environment Requirements

When implementing features that require environment variables:

1. **Update `.env.example`** with the new variable(s)
2. **Add comments** explaining what each variable is for
3. **Document in code** where the variable is used
4. **Update setup documentation** if needed (`env-setup-instructions.md`, `SETUP.md`, etc.)

## File Structure

### Required Files

1. **`.env.example`** (committed to git)
   - Contains all environment variables with placeholder values
   - Includes comments explaining each variable
   - Single source of truth for env var schema
   - **Agents can read this file**

2. **`.env`** (gitignored, never committed)
   - Contains actual secret values
   - Created manually by users
   - **Agents must NEVER read this file**

### .gitignore Pattern

The `.gitignore` should include:

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
!.env.example
```

This ensures `.env` is ignored but `.env.example` is tracked.

## Error Handling

### When Code Requires Env Vars

If code requires an environment variable:

1. **Check if variable exists in `.env.example`**
2. **If missing**: Add it to `.env.example` first
3. **In code**: Use `process.env.VARIABLE_NAME` with proper error handling
4. **Validate at startup**: Check for required variables and provide clear error messages

### Example Code Pattern

```typescript
// ✅ GOOD: Check for env var with clear error
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error(
    'API_KEY is required. Please add it to your .env file. ' +
      'See .env.example for required variables.'
  );
}

// ❌ BAD: Assume env var exists
const apiKey = process.env.API_KEY; // May be undefined
```

## Loop Prevention

### Prohibited Behaviors

The following behaviors are **strictly prohibited** and will trigger Loop Break Protocol:

- ❌ Attempting to read `.env` file multiple times
- ❌ Recreating `.env.example` when it already exists
- ❌ Looping on "missing env var" errors without checking `.env.example`
- ❌ Asking users to create `.env` files repeatedly
- ❌ Generating secrets automatically
- ❌ Modifying `.env` files (agents cannot access them anyway)

### Loop Detection Triggers

If an agent:

- Attempts to read `.env` 2+ times
- Recreates `.env.example` when it exists
- Loops on missing env var errors without checking `.env.example`
- Repeats the same "missing env var" message 3+ times

**Then**: Trigger Loop Break Protocol from `agent_rules/loop_guard.md`

## Integration with Setup Instructions

When users need to set up environment variables:

1. **Point to `.env.example`** - Show them what variables are needed
2. **Point to `env-setup-instructions.md`** - Show them how to create `.env`
3. **Never create `.env` for them** - Users must create it manually with real secrets

## Integration with Error Handling

This rule integrates with:

- **Error Handling** (`agent_rules/error_handling.md`): Missing env vars are Category 1 (Configuration Errors)
- **Common Errors** (`logs/common_errors.md`): Missing env vars should reference this rule
- **Loop Guard** (`agent_rules/loop_guard.md`): Looping on env vars triggers loop break protocol
- **Security Rules** (`.cursor/rules/security_rules.md`): Never expose secrets

## Integration with Ralph-Wiggum Process

During Ralph-Wiggum Phase 3 (Parallel Execution):

- **Multiple agents** may need the same env vars
- **Solution**: All agents reference `.env.example`, never `.env`
- **Coordination**: If a new env var is needed, one agent updates `.env.example`, others reference it
- **No conflicts**: Since agents don't read `.env`, there are no file access conflicts

## Integration with BMAD

This rule integrates with BMAD:

- **BMAD Agents**: All BMAD agents must follow this rule
- **BMAD Workflows**: Workflows should reference `.env.example` for env var requirements
- **BMAD Tasks**: Tasks that require env vars should document them in `.env.example`

## Examples

### Example 1: Adding New Environment Variable

✅ **CORRECT**:

1. Agent needs `STRIPE_SECRET_KEY` for payment processing
2. Agent checks `.env.example` - variable doesn't exist
3. Agent adds to `.env.example`: `STRIPE_SECRET_KEY=your-stripe-secret-key-here`
4. Agent updates code to use `process.env.STRIPE_SECRET_KEY`
5. Agent informs user: "Added STRIPE_SECRET_KEY to .env.example. Please add your actual key to .env file."
6. **STOP** - Do not loop

❌ **INCORRECT**:

1. Agent needs `STRIPE_SECRET_KEY`
2. Agent tries to read `.env` (fails - file is ignored)
3. Agent tries to read `.env` again (still fails)
4. Agent creates `.env` file with placeholder (violates security)
5. Agent loops on "missing env var" error

### Example 2: Missing Env Var at Runtime

✅ **CORRECT**:

1. Code fails: "DATABASE_URL is not defined"
2. Agent checks `.env.example` - `DATABASE_URL` is documented
3. Agent informs user: "DATABASE_URL is required. Please add it to your .env file. See .env.example for the format."
4. **STOP** - Do not loop

❌ **INCORRECT**:

1. Code fails: "DATABASE_URL is not defined"
2. Agent tries to read `.env` (fails)
3. Agent tries to create `.env` (violates security)
4. Agent repeats error message 5+ times
5. Agent loops without progress

### Example 3: New Feature Requires Env Vars

✅ **CORRECT**:

1. Implementing OAuth feature requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. Agent checks `.env.example` - variables exist with placeholders
3. Agent uses `process.env.GOOGLE_CLIENT_ID` in code
4. Agent adds validation: "If missing, show clear error pointing to .env.example"
5. **DONE** - No looping

❌ **INCORRECT**:

1. Implementing OAuth feature
2. Agent tries to read `.env` to check if variables exist (fails)
3. Agent recreates `.env.example` even though it exists
4. Agent loops on "missing credentials" errors

## Validation Checklist

Before marking a task complete that involves environment variables:

- ✅ All required env vars are documented in `.env.example`
- ✅ `.env.example` has placeholder values (no real secrets)
- ✅ Code uses `process.env.VARIABLE_NAME` with proper error handling
- ✅ Error messages point users to `.env.example`
- ✅ No attempts to read or create `.env` files
- ✅ Setup documentation updated if needed

## Metrics

Track env var handling:

- **Env Var Loops Prevented**: Count of times this rule prevented looping
- **`.env.example` Updates**: Count of times `.env.example` was updated
- **User Notifications**: Count of times users were informed to populate `.env`

Store in `logs/performance/env_var_metrics.log`

## Success Criteria

The agent is handling env vars correctly when:

- ✅ Never attempts to read `.env` files
- ✅ Always references `.env.example` for requirements
- ✅ Updates `.env.example` when adding new variables
- ✅ Informs users to populate `.env` manually (maximum once)
- ✅ Does not loop on missing env var errors
- ✅ Never generates or exposes secrets

## Best Practices

1. **Check `.env.example` First**: Always check `.env.example` before assuming a variable is missing
2. **Update Schema, Not Secrets**: Only update `.env.example`, never `.env`
3. **Clear Error Messages**: Point users to `.env.example` in error messages
4. **Document Everything**: Add comments in `.env.example` explaining each variable
5. **Validate Early**: Check for required env vars at application startup
6. **Stop After One Attempt**: Don't loop on env var issues - inform user and move on

## Updates to This Rule

See `agent_rules/update_protocol.md` for how this rule is updated.
