# File Discovery & Hidden File Verification

**Version**: v1.0.0  
**Last Updated**: 2026-01-14  
**Purpose**: Prevent file duplication, drift, and workspace chaos by requiring comprehensive file discovery before any file creation

## Directive

Before creating, duplicating, or proposing any new file, the agent MUST perform a comprehensive file discovery step. This is a **pre-flight requirement** that runs before any create/write action.

## File Discovery Requirements

### 1. Comprehensive Workspace Search

The agent must search the entire workspace for relevant existing files, including:

- **Hidden files and folders**: Dotfiles (`.cursor`, `.git`, `.env`, etc.), underscored folders (`_build`, `_cache`, etc.), system or tool-generated directories
- **Configuration files**: Rules files, agent rules, metadata files, config files in any location
- **Archived or deprecated files**: Previously renamed files, files in archive folders, deprecated versions that may still be relevant
- **Files with similar names**: Files with partial name matches, variations in naming (kebab-case vs snake_case vs camelCase)
- **Files with similar purposes**: Files that serve the same or overlapping purposes, even if named differently

### 2. Explicit Checks Required

The agent must explicitly check for:

- `.cursor/` rules and configuration files
- Agent configuration files in `agent_rules/` and `.cursor/rules/`
- Hidden project metadata folders (`.lock/`, `.bmad-core/`, etc.)
- Files with similar names, purposes, or partial overlaps
- Files in parent directories or sibling directories that might be relevant
- Files that might have been renamed or moved

### 3. If a Relevant File Exists

If a relevant file is found:

- **MUST update or extend the existing file** instead of creating a new one
- **MUST preserve** the structure, intent, and history of the existing file
- Changes should be **additive or corrective**, not duplicative
- **MUST NOT** create parallel files that serve the same purpose

### 4. If No Relevant File is Found

If no relevant file is found after comprehensive search:

- The agent may create a new file
- **MUST briefly justify** why a new file is required
- **MUST explain** why no existing file could be reused or extended
- Document the search process and what was checked

### 5. Prohibition on Parallel Files

The agent must **NEVER** create parallel files that serve the same purpose, including:

- Multiple rules files (e.g., `rules.md`, `rules-new.md`, `rules-final.md`)
- Multiple TODO files (e.g., `TODO.md`, `todo.md`, `todos.md`)
- Multiple workflow specs (e.g., `workflow.json`, `workflow-v2.json`)
- Multiple configuration files for the same system
- Files with version suffixes when an existing file should be updated

### 6. Uncertainty Handling

When uncertainty exists:

- **Default behavior**: Ask for clarification OR propose updating the closest existing file
- **Creation should be the last resort**, not the first option
- If multiple similar files exist, identify which one is canonical and update that one

## Strict Version (Zero File Sprawl)

For maximum strictness, creating a new file is **forbidden** unless:

- ✅ All hidden and visible files have been searched
- ✅ No existing file can logically contain the new content
- ✅ The agent explicitly states why extension is impossible
- ✅ The justification is documented

## Why This Rule Exists

### Common Agent Failures Without This Rule

Agents usually:

- Only scan visible directories
- Ignore dotfiles and hidden files
- Assume "file not obvious = file doesn't exist"
- Create instead of refactor
- Don't check for similar names or purposes

### What This Rule Forces

This rule enforces:

- **Pre-creation discovery**: Must search before creating
- **Hidden file awareness**: Must check dotfiles and hidden directories
- **Update-first behavior**: Must update existing files when possible
- **Explicit justification**: Must explain why creation is necessary

## Integration with Other Rules

This rule directly complements:

- **Project Organization Rules** (`.cursor/rules/file_organization.md`): Single source of truth principle
- **Loop-Prevention Rules** (`agent_rules/loop_guard.md`): Prevents creating duplicate files in loops
- **Workflow Intelligence Rules**: Ensures workflows reference existing files correctly

## Examples

### Example 1: Creating a Rule File

**Before**: Agent wants to create `.cursor/rules/new-rule.md`

**Discovery Process**:

1. ✅ Searched `.cursor/rules/` for existing rule files
2. ✅ Checked `agent_rules/` for similar rules
3. ✅ Searched for files with "rule" in the name
4. ✅ Checked hidden directories for rule files

**Result**: Found `.cursor/rules/file_organization.md` that already covers file organization. Instead of creating a new file, update the existing one.

### Example 2: Creating a TODO File

**Before**: Agent wants to create `TODO.md`

**Discovery Process**:

1. ✅ Searched root for TODO files
2. ✅ Checked `agent_tasks/` for task tracking files
3. ✅ Found `agent_tasks/todo_progress.json` and `agent_tasks/blocked_tasks.md`

**Result**: Use existing task tracking system instead of creating a new TODO file.

### Example 3: Creating a Workflow File

**Before**: Agent wants to create `workflow.json`

**Discovery Process**:

1. ✅ Searched for existing workflow files
2. ✅ Checked `docs/workflows/` directory
3. ✅ Found `docs/workflows/existing-workflow.md`

**Result**: Update existing workflow documentation instead of creating a new JSON file.

## Failure to Follow This Rule

Failure to follow this rule is considered an **error in agent behavior** and should be:

1. Logged in `logs/agent_errors/[date].md`
2. Documented with the file that should have been updated
3. Used to improve agent behavior

## Updates to This Rule

See `agent_rules/update_protocol.md` for how this rule is updated.
