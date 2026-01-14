# BMAD Document Integration Guide

This guide explains how to integrate your existing documents with the BMAD framework structure.

## BMAD Expected Document Structure

The BMAD framework expects the following document structure:

```
docs/
├── prd.md                    # Product Requirements Document (required)
├── architecture.md           # System Architecture (required)
├── prd/                      # Sharded PRD sections (created by BMAD)
│   └── epic-*.md            # Individual epic files
├── architecture/             # Sharded architecture sections (created by BMAD)
│   ├── coding-standards.md
│   ├── tech-stack.md
│   └── source-tree.md
├── stories/                  # User stories (created by BMAD)
└── qa/                       # QA assessments and gates (created by BMAD)
```

## Current Documents vs BMAD Structure

### Your Current Documents:
- `PROJECT_OVERVIEW.md` (root) → Should become `docs/prd.md`
- `docs/ARCHITECTURE.md` → Should become `docs/architecture.md`
- `docs/EPICS_STORIES.md` → Will be integrated into PRD or sharded separately
- `docs/TASKS.md` → Can remain as-is for tracking (BMAD uses stories)

## Integration Steps

### Step 1: Rename Documents to Match BMAD Conventions

BMAD expects lowercase filenames:
- `PROJECT_OVERVIEW.md` → `docs/prd.md`
- `docs/ARCHITECTURE.md` → `docs/architecture.md`

### Step 2: Understand Document Sharding

BMAD will automatically "shard" (break down) your documents:
- `docs/prd.md` → Will be sharded into `docs/prd/epic-1.md`, `epic-2.md`, etc.
- `docs/architecture.md` → Will be sharded into `docs/architecture/` sections

**Important**: Don't manually create the sharded directories - BMAD agents will do this.

### Step 3: Your Existing Documents

You mentioned you have "a lot of documents" that need to be integrated. Here's how to handle them:

#### Documents that should go into PRD (`docs/prd.md`):
- Product requirements
- User stories
- Epics
- Functional requirements
- Business requirements
- User personas
- Success metrics

#### Documents that should go into Architecture (`docs/architecture.md`):
- Technical architecture
- System design
- Database schemas
- API specifications
- Technology stack decisions
- Infrastructure plans

#### Documents that can stay separate:
- `docs/TASKS.md` - Task tracking (can reference BMAD stories)
- `AGENTS.md` - AI agent instructions (project-specific)
- `README.md` - Project overview
- Any project-specific documentation

## Integration Workflow

1. **Consolidate your documents** into the two main files:
   - Merge all PRD-related content into `docs/prd.md`
   - Merge all architecture-related content into `docs/architecture.md`

2. **Let BMAD agents handle sharding**:
   - Once your `prd.md` and `architecture.md` are ready
   - Use the `@po` (Product Owner) agent to shard documents
   - Command: `@po shard documents` or use the shard task

3. **Work with sharded documents**:
   - Development agents will use sharded documents
   - Stories will be created from sharded epics
   - Architecture sections will guide development

## Next Steps

1. Review your existing documents
2. Consolidate them into `prd.md` and `architecture.md` format
3. Use BMAD agents (`@pm` or `@analyst`) to help structure them properly
4. Once documents are ready, use `@po` to shard them
5. Begin development workflow with `@sm` (Scrum Master) and `@dev` (Developer) agents

## Using Your Documents with BMAD Agents

### Planning Phase:
- `@analyst` - Can help analyze and structure your requirements
- `@pm` - Can help create/refine PRD from your documents
- `@architect` - Can help structure architecture document

### Development Phase:
- `@po` - Shards documents for development
- `@sm` - Creates stories from sharded epics
- `@dev` - Implements features using sharded documents
- `@qa` - Creates test strategies from documents

## Questions to Consider

Before integrating, think about:
1. Where do your documents fit? (PRD vs Architecture)
2. Are they complete? (BMAD works best with comprehensive docs)
3. Do they need restructuring? (BMAD has specific formats)
4. Should you use BMAD agents to help consolidate? (Recommended!)

## Getting Help

- Use `@pm` agent to help structure your PRD
- Use `@architect` agent to help structure your architecture
- Read `.bmad-core/user-guide.md` for detailed workflows
- Check `.bmad-core/templates/` for document templates
