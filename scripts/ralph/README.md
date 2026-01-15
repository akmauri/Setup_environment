# Ralph Process Scripts

This directory contains scripts and prompts for the Ralph autonomous PRD implementation process.

## Files

- **`ralph-prompt.md`** - The Ralph prompt to load in Cursor chat
- **`convert-prd-to-json.js`** - Converts markdown PRD to `prd.json` format
- **`check-status.js`** - Check Ralph process status and progress
- **`validate-prd.js`** - Validate `prd.json` format and structure

## Quick Start

### 1. Convert PRD to JSON

```bash
npm run ralph:convert
```

Or manually:

```bash
node scripts/ralph/convert-prd-to-json.js docs/prd.md prd.json
```

### 2. Validate PRD JSON

```bash
npm run ralph:validate
```

Checks for:

- Required fields
- Valid story structure
- Circular dependencies
- Missing dependencies

### 3. Check Status

```bash
npm run ralph:status
```

Shows:

- Total stories
- Completed vs remaining
- Next story to implement
- Progress by epic

### 4. Start Ralph Process

1. Open Cursor chat (Ctrl+L or Cmd+L)
2. Open `scripts/ralph/ralph-prompt.md`
3. Copy the entire content
4. Paste into Cursor chat
5. Say: "Start Ralph process - implement next story from prd.json"

## Available Commands

```bash
npm run ralph:convert   # Convert PRD markdown to JSON
npm run ralph:validate # Validate prd.json format
npm run ralph:status   # Check process status and progress
npm run ralph:start    # Show instructions to start Ralph
```

## Documentation

See `docs/RALPH_IMPLEMENTATION.md` for complete documentation.

## Example Workflow

```bash
# 1. Convert PRD
npm run ralph:convert

# 2. Validate the output
npm run ralph:validate

# 3. Check status
npm run ralph:status

# 4. Review prd.json (optional)
cat prd.json

# 5. Start Ralph in Cursor chat
# (Load ralph-prompt.md and start the process)

# 6. Check progress periodically
npm run ralph:status
```
