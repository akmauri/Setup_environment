# Ralph Process Implementation for Cursor + Claude

**Based on**: [Ralph by snarktank](https://github.com/snarktank/ralph)  
**Adapted for**: Cursor IDE with Claude AI  
**Version**: 1.0.0  
**Date**: 2026-01-15

## Overview

Ralph is an autonomous AI agent loop that runs repeatedly until all PRD items are complete. Each iteration is a fresh Cursor chat session with clean context. Memory persists via git history, `progress.txt`, and `prd.json`.

**Key Advantage**: Works directly in Cursor's chat interface with Claude — no CLI needed!

## How It Works

1. **Convert PRD to JSON**: Convert your markdown PRD to `prd.json` format
2. **Load Ralph Prompt**: Open `scripts/ralph/ralph-prompt.md` in Cursor chat
3. **Ralph Picks Story**: Selects highest priority story where `passes: false`
4. **Implements Story**: Completes the entire story
5. **Quality Checks**: Runs typecheck, tests, lint before committing
6. **Updates PRD**: Marks story as `passes: true` in `prd.json`
7. **Documents Learnings**: Appends to `progress.txt`
8. **Commits**: Commits changes with clear message
9. **Repeats**: Continues until all stories pass

## Setup

### Step 1: Convert PRD to JSON

Run the converter script:

```bash
node scripts/ralph/convert-prd-to-json.js docs/prd.md prd.json
```

This will:

- Parse your markdown PRD
- Extract all user stories
- Create `prd.json` with proper format
- Set all stories to `passes: false` initially

**Review the output**: Check `prd.json` and adjust:

- `branchName`: Set feature branch name (optional)
- `priority`: Adjust story priorities if needed
- `dependencies`: Verify dependency chains
- `estimatedComplexity`: Update complexity estimates

### Step 2: Create Progress File

The `progress.txt` file should already exist (created during setup). If not:

```bash
touch progress.txt
```

This file stores learnings between iterations (append-only).

### Step 3: Start Ralph Process

1. **Open Cursor chat** (Ctrl+L or Cmd+L)
2. **Load the Ralph prompt**:
   - Open `scripts/ralph/ralph-prompt.md`
   - Copy the entire content
   - Paste into Cursor chat
3. **Start the loop**: Say "Start Ralph process - implement next story from prd.json"

Ralph will begin the autonomous loop!

## File Structure

```
.
├── prd.json                    # PRD in JSON format (stories with passes status)
├── progress.txt                # Append-only learnings file
├── scripts/
│   └── ralph/
│       ├── ralph-prompt.md     # Ralph prompt for Cursor chat
│       └── convert-prd-to-json.js  # PRD converter script
└── docs/
    └── RALPH_IMPLEMENTATION.md  # This file
```

## PRD JSON Format

```json
{
  "projectName": "MPCAS2",
  "version": "1.0.0",
  "branchName": "feature/epic-1-foundation",
  "createdAt": "2026-01-15T00:00:00.000Z",
  "userStories": [
    {
      "id": "1.1",
      "title": "Project Setup & Repository Structure",
      "epic": "Epic 1: Foundation & Core Infrastructure",
      "priority": 1,
      "passes": false,
      "acceptanceCriteria": ["Monorepo structure created...", "TypeScript configured..."],
      "dependencies": [],
      "estimatedComplexity": "medium",
      "notes": ""
    }
  ]
}
```

### Story Fields

- **id**: Story identifier (e.g., "1.1", "2.3")
- **title**: Story title
- **epic**: Epic name
- **priority**: Numeric priority (lower = higher priority)
- **passes**: `true` if story is complete, `false` if not
- **acceptanceCriteria**: Array of acceptance criteria strings
- **dependencies**: Array of story IDs that must pass first (e.g., ["1.1"])
- **estimatedComplexity**: "low", "medium", or "high"
- **notes**: Optional notes

## Ralph Process Flow

### Iteration 1

1. **Load Context**:
   - Read `prd.json` → Find stories where `passes: false`
   - Read `progress.txt` → Learn from previous iterations
   - Load agent rules
   - Check git history

2. **Select Story**:
   - Pick highest priority story where `passes: false`
   - Verify all dependencies have `passes: true`
   - If all stories pass → Output `<promise>COMPLETE</promise>`

3. **Create Branch** (if `branchName` set):
   - Create/checkout feature branch

4. **Implement**:
   - Read story acceptance criteria
   - Implement the story
   - Follow coding standards
   - Write tests

5. **Quality Checks**:

   ```bash
   npm run type-check
   npm run lint
   npm run test
   npm run build
   ```

   - Fix any failures
   - Repeat until all pass

6. **Update PRD**:
   - Set story `passes: true` in `prd.json`

7. **Document Learnings**:
   - Append to `progress.txt`:
     - Patterns discovered
     - Gotchas to avoid
     - Useful context

8. **Update Rules** (if needed):
   - Update `.cursor/rules/` files with discovered patterns

9. **Commit**:

   ```bash
   git add .
   git commit -m "[Story ID] [Title]

   - What was implemented
   - Key changes
   - Related files"
   ```

10. **Loop**: Return to step 1

### Iteration 2, 3, 4...

Each iteration:

- Starts with fresh context
- Reads `progress.txt` for learnings
- Checks `prd.json` for next story
- Implements, tests, commits
- Updates `prd.json` and `progress.txt`
- Repeats

## Integration with Agent Rules

Ralph follows all agent rules:

- ✅ **Rule Enforcement** (`agent_rules/rule_enforcement.md`)
- ✅ **No Manual Orchestration** (`agent_rules/no_manual_orchestration.md`)
- ✅ **Error Handling** (`agent_rules/error_handling.md`)
- ✅ **Testing Validation** (`agent_rules/testing_validation.md`)
- ✅ **Core Principles** (`agent_rules/core_principles.md`)

## Quality Gates

Before marking a story complete, Ralph must:

1. ✅ Code implemented and follows standards
2. ✅ Tests written and passing
3. ✅ Type checking passes
4. ✅ Linting passes
5. ✅ Build succeeds (if applicable)
6. ✅ Documentation updated
7. ✅ `prd.json` updated (`passes: true`)
8. ✅ `progress.txt` updated with learnings
9. ✅ Changes committed

**Never skip quality checks** - they prevent broken code from compounding.

## Progress.txt Format

```
[YYYY-MM-DD HH:MM:SS] Story [Story ID]: [Story Title]

Learnings:
- [Key learning or pattern discovered]
- [Gotcha or important note]
- [Useful context for future iterations]

Patterns:
- [Code pattern or convention discovered]

Gotchas:
- [Common mistake to avoid]

Useful Context:
- [Context that will help future iterations]
```

## Stop Condition

When all stories have `passes: true`, Ralph outputs:

```
<promise>COMPLETE</promise>
```

This signals the loop can exit.

## Error Handling

If an error occurs:

1. **Follow Error Protocol**: See `agent_rules/error_handling.md`
2. **Log Error**: Document in `logs/agent_errors/[date].md`
3. **Append to Progress**: Add error and resolution to `progress.txt`
4. **Fix and Retry**: Or mark story as blocked if unfixable

## Best Practices

### Story Size

**Right-sized stories** (fit in one context window):

- Add a database column and migration
- Add a UI component to an existing page
- Update a server action with new logic
- Add a filter dropdown to a list

**Too big** (split these):

- "Build the entire dashboard"
- "Add authentication"
- "Refactor the API"

### Dependencies

- Always check dependencies before starting a story
- If a dependency isn't complete, document it in `progress.txt`
- Consider splitting stories if dependencies are too complex

### Learnings

- Document patterns as you discover them
- Note gotchas immediately (don't wait until the end)
- Keep `progress.txt` organized and readable
- Update `.cursor/rules/` files with important patterns

### Quality First

- Never commit failing tests
- Never skip type checking
- Never skip linting
- Fix issues immediately, don't accumulate technical debt

## Example Usage

### Starting Ralph

1. Open Cursor chat
2. Load `scripts/ralph/ralph-prompt.md`
3. Say: "Start Ralph process - implement next story from prd.json"

### During Execution

Ralph will:

- Show which story it's working on
- Display progress as it implements
- Run quality checks and show results
- Update files automatically
- Commit with clear messages

### Completion

When complete:

- All stories in `prd.json` have `passes: true`
- Ralph outputs `<promise>COMPLETE</promise>`
- All changes are committed
- `progress.txt` contains all learnings

## Troubleshooting

### No Stories Found

**Problem**: Converter found 0 stories

**Solution**:

- Check PRD format matches expected structure
- Ensure stories follow format: `### Story X.Y: Title`
- Verify acceptance criteria section exists

### Story Too Big

**Problem**: Story doesn't fit in one context window

**Solution**:

- Document in `progress.txt` that story should be split
- Manually split story in `prd.json`
- Create multiple story entries with dependencies

### Quality Checks Fail

**Problem**: Tests or type checking fails

**Solution**:

- Ralph will fix issues automatically
- If unfixable, document in `progress.txt`
- Mark story as blocked if needed

### Dependencies Not Met

**Problem**: Story depends on incomplete story

**Solution**:

- Ralph will skip and move to next available story
- Document in `progress.txt`
- Verify dependency chain in `prd.json`

## Comparison with Original Ralph

| Feature            | Original Ralph                | This Implementation         |
| ------------------ | ----------------------------- | --------------------------- |
| **Platform**       | Amp CLI                       | Cursor + Claude             |
| **Loop**           | Bash script                   | Cursor chat                 |
| **Context**        | Fresh Amp instance            | Fresh Cursor chat           |
| **Memory**         | git + progress.txt + prd.json | Same                        |
| **AGENTS.md**      | Updates AGENTS.md             | Updates .cursor/rules/      |
| **Quality Checks** | Typecheck, tests              | Same                        |
| **Integration**    | Standalone                    | Integrated with agent rules |

## Advantages

1. **No CLI Required**: Works directly in Cursor
2. **Integrated**: Follows all agent rules automatically
3. **Familiar**: Uses Cursor's chat interface you already know
4. **Flexible**: Easy to pause, resume, or adjust
5. **Visible**: See progress in real-time in chat

## Available Commands

```bash
# Convert PRD markdown to JSON
npm run ralph:convert

# Validate prd.json format
npm run ralph:validate

# Check process status and progress
npm run ralph:status

# Show instructions to start Ralph
npm run ralph:start
```

## Next Steps

1. ✅ Convert PRD to JSON: `npm run ralph:convert`
2. ✅ Validate output: `npm run ralph:validate`
3. ✅ Check status: `npm run ralph:status`
4. ✅ Review `prd.json` and adjust as needed
5. ✅ Load `scripts/ralph/ralph-prompt.md` in Cursor chat
6. ✅ Start Ralph: "Start Ralph process - implement next story from prd.json"
7. ✅ Let Ralph work autonomously until all stories pass
8. ✅ Check progress periodically: `npm run ralph:status`

## References

- [Original Ralph](https://github.com/snarktank/ralph)
- [Ralph Article by Geoffrey Huntley](https://geoffreyhuntley.com/ralph)
- [Agent Rules](../agent_rules/)
- [PRD](../prd.md)

---

**Ready to start?** Convert your PRD and load the Ralph prompt in Cursor chat!
