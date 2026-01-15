# Ralph Process - Quick Start Guide

**5-minute setup to start using Ralph with Cursor + Claude**

## Step 1: Convert PRD (2 minutes)

```bash
npm run ralph:convert
```

This creates `prd.json` from your `docs/prd.md`.

## Step 2: Validate (30 seconds)

```bash
npm run ralph:validate
```

Make sure everything looks good.

## Step 3: Check Status (30 seconds)

```bash
npm run ralph:status
```

See how many stories you have and what's next.

## Step 4: Start Ralph (2 minutes)

1. **Open Cursor chat**: Press `Ctrl+L` (or `Cmd+L` on Mac)
2. **Open the prompt**: Open `scripts/ralph/ralph-prompt.md`
3. **Copy everything**: Select all and copy
4. **Paste in chat**: Paste into Cursor chat
5. **Start**: Type "Start Ralph process - implement next story from prd.json"

## That's It!

Ralph will now:

- ✅ Pick the next story
- ✅ Implement it
- ✅ Run quality checks
- ✅ Update `prd.json`
- ✅ Document learnings
- ✅ Commit changes
- ✅ Repeat until done

## Check Progress Anytime

```bash
npm run ralph:status
```

## What Ralph Does

1. **Reads** `prd.json` to find stories where `passes: false`
2. **Picks** the highest priority story with all dependencies met
3. **Implements** the entire story
4. **Tests** with typecheck, lint, tests
5. **Updates** `prd.json` to mark story as `passes: true`
6. **Documents** learnings in `progress.txt`
7. **Commits** changes with clear message
8. **Repeats** until all stories pass

## Files Created

- `prd.json` - Your PRD in JSON format (stories with `passes` status)
- `progress.txt` - Learnings between iterations (append-only)

## Need Help?

- **Full docs**: See `docs/RALPH_IMPLEMENTATION.md`
- **Scripts**: See `scripts/ralph/README.md`
- **Status**: Run `npm run ralph:status`

---

**Ready?** Run `npm run ralph:convert` and get started! 🚀
