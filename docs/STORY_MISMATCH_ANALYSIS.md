# Story Mismatch Analysis

**Date**: 2026-01-XX  
**Purpose**: Identify conflicts between PRD and EPICS_STORIES.md before creating story files

## Critical Finding: Story Numbering Conflict

There is a **major mismatch** between the two story sources:

### Source 1: PRD (`docs/prd.md`) - **AUTHORITATIVE SOURCE**

According to BMAD config (`.bmad-core/core-config.yaml`):

- `prdFile: docs/prd.md` ✅
- `prdSharded: true`
- PRD is the **primary source** for stories

**Epic 1: Foundation & Core Infrastructure**

- Story 1.1: **Project Setup & Repository Structure**
- Story 1.2: **Multi-Tenant Database Architecture**
- Story 1.3: **User Authentication System** (includes Google, Microsoft, Okta OAuth)
- Story 1.4: **Basic User Management**
- Story 1.5: **Health Check & System Status**

**Epic 2: Platform Integrations & OAuth**

- Story 2.1: YouTube OAuth Integration
- Story 2.2: Instagram OAuth Integration
- Story 2.3: TikTok OAuth Integration
- Story 2.4: Twitter/X OAuth Integration
- Story 2.5: LinkedIn OAuth Integration
- Story 2.6: Facebook OAuth Integration
- Story 2.7: Pinterest OAuth Integration
- Story 2.8: Threads OAuth Integration
- Story 2.9: Platform Connection Management Dashboard

**Total**: 12 Epics, 100+ Stories

### Source 2: EPICS_STORIES.md - **SECONDARY/OUTDATED**

**Epic 1: User Authentication & Profile Management**

- Story 1.1: **Google OAuth Integration** ⚠️ CONFLICT
- Story 1.2: **User Profile Management** ⚠️ CONFLICT

**Epic 2: Social Media Account Integration**

- Story 2.1: Connect Existing Social Media Accounts
- Story 2.2: Create New Social Media Accounts

**Total**: 6 Epics, ~12 Stories

## Conflict Details

### Epic 1 Conflict

| Source            | Story 1.1                            | Story 1.2                          | Story 1.3                  |
| ----------------- | ------------------------------------ | ---------------------------------- | -------------------------- |
| **PRD**           | Project Setup & Repository Structure | Multi-Tenant Database Architecture | User Authentication System |
| **EPICS_STORIES** | Google OAuth Integration             | User Profile Management            | (doesn't exist)            |

**Issue**:

- PRD Story 1.1 is about **project setup** (infrastructure)
- EPICS_STORIES Story 1.1 is about **Google OAuth** (feature)
- These are completely different stories with the same number!

### Story I Created

I created `docs/stories/1.1.story.md` based on **EPICS_STORIES.md**, which:

- ✅ Matches EPICS_STORIES.md
- ❌ **DOES NOT match PRD** (the authoritative source)
- ❌ Will cause confusion and inconsistency

## Impact Analysis

### If We Use PRD (Recommended)

- ✅ Matches BMAD configuration
- ✅ More comprehensive (100+ stories vs 12)
- ✅ Better organized (infrastructure first, then features)
- ✅ Story 1.1 I created is **WRONG** - should be "Project Setup"
- ⚠️ Need to delete/recreate story files

### If We Use EPICS_STORIES.md

- ❌ Conflicts with BMAD config (PRD is authoritative)
- ❌ Missing 88+ stories from PRD
- ❌ Incomplete epic structure
- ❌ Will cause development confusion

## Recommendations

### Option 1: Use PRD as Source (RECOMMENDED)

**Action Required**:

1. **Delete** `docs/stories/1.1.story.md` (it's based on wrong source)
2. **Use PRD** as the authoritative source for all stories
3. **Create stories** starting with PRD Story 1.1: "Project Setup & Repository Structure"
4. **Archive or update** EPICS_STORIES.md to match PRD structure

**Benefits**:

- Aligns with BMAD configuration
- Complete story coverage
- Proper infrastructure-first approach
- No conflicts

### Option 2: Reconcile Both Documents

**Action Required**:

1. Merge EPICS_STORIES.md content into PRD
2. Update PRD to include any unique stories from EPICS_STORIES
3. Resolve numbering conflicts
4. Use reconciled PRD as source

**Challenges**:

- Requires manual reconciliation
- Risk of losing stories
- Time-consuming

### Option 3: Use EPICS_STORIES.md (NOT RECOMMENDED)

**Action Required**:

1. Update BMAD config to point to EPICS_STORIES.md
2. Accept that 88+ stories from PRD won't be tracked
3. Continue with current story file

**Risks**:

- Loses comprehensive PRD coverage
- Conflicts with BMAD best practices
- Incomplete project scope

## Current State

### Files Created

- ✅ `docs/stories/1.1.story.md` - **WRONG** (based on EPICS_STORIES, not PRD)
  - Story: Google OAuth Integration
  - Should be: Project Setup & Repository Structure (per PRD)

### Files That Should Exist (Per PRD)

- `docs/stories/1.1.story.md` - Project Setup & Repository Structure
- `docs/stories/1.2.story.md` - Multi-Tenant Database Architecture
- `docs/stories/1.3.story.md` - User Authentication System
- `docs/stories/1.4.story.md` - Basic User Management
- `docs/stories/1.5.story.md` - Health Check & System Status

## Next Steps

**IMMEDIATE ACTION REQUIRED**:

1. **Decision**: Which source should be authoritative?
   - [ ] PRD (recommended)
   - [ ] EPICS_STORIES.md
   - [ ] Reconcile both

2. **If PRD is chosen**:
   - Delete `docs/stories/1.1.story.md`
   - Create proper Story 1.1 from PRD
   - Update EPICS_STORIES.md to match PRD or archive it

3. **If EPICS_STORIES is chosen**:
   - Update BMAD config
   - Accept incomplete story coverage
   - Keep current story file

## Questions to Answer

1. **Which document is the source of truth?**
   - PRD appears to be authoritative per BMAD config
   - EPICS_STORIES.md may be outdated or a different view

2. **Should EPICS_STORIES.md be updated or archived?**
   - It conflicts with PRD
   - May be an older version

3. **What is the correct first story?**
   - PRD says: Project Setup & Repository Structure
   - EPICS_STORIES says: Google OAuth Integration
   - These are fundamentally different

## Recommendation

**Use PRD as the authoritative source** because:

1. BMAD config explicitly points to it
2. It's more comprehensive (100+ stories)
3. It follows proper infrastructure-first approach
4. It's the official Product Requirements Document

**Action**: Delete the incorrectly created story file and start fresh with PRD Story 1.1.
