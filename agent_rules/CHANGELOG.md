# Agent Rules Changelog

## v1.6.0 - 2026-01-15

### Added

- **Testing and Validation Protocol** (`agent_rules/testing_validation.md`): New mandatory rule requiring agents to run tests/validation before marking tasks complete. Includes:
  - Mandatory verification before task completion
  - Required verification types (type check, lint, tests, runtime)
  - Evidence requirements (command + output summary)
  - Integration with Quality Gates (Rule #12)
  - Exception handling for non-applicable cases

### Changed

- **Rule Enforcement Protocol** (`agent_rules/rule_enforcement.md`):
  - Enhanced Quality Gates (Rule #12) to explicitly require testing/validation execution
  - Added mandatory testing checklist items
  - Updated "Action Before Marking Complete" to require verification execution

- **Agent Context Guide** (`.cursor/rules/agent_context.md`):
  - Added `agent_rules/testing_validation.md` as mandatory rule

### Rationale

These changes address the issue where agents were asking users to test instead of running tests themselves. The new rule ensures:

- Agents execute verification directly (no user delegation)
- All tasks are validated before completion
- Evidence is provided for all completion claims
- Quality gates cannot pass without actual testing

### Impact

- **Affected Agents**: ALL agents - must run tests/validation before marking complete
- **Affected Processes**: Task completion now requires verification execution
- **Breaking Changes**: None - this enforces existing quality gate requirements
- **Migration Required**: No - agents should already be following this, now it's explicit

---

## v1.5.0 - 2026-01-14

### Added

- **No Manual Orchestration Protocol** (`agent_rules/no_manual_orchestration.md`): New mandatory rule that prevents agents from delegating execution to users and ensures agents execute work directly. Includes:
  - **Rule 1: No Manual Orchestration** - Prohibits asking users to open chats, copy/paste, or run routine commands
  - **Rule 2: Execute the Guide, Don't Describe It** - Requires agents to execute actions directly, not describe them
  - **Rule 3: Single-Session Orchestration Protocol** - Defines how to simulate parallel execution in one session using locks and checkpoints
  - **Rule 4: Anti-Paperwork / No Fake Progress** - Requires evidence (file paths, command output) for completion claims
  - Integration with Ralph-Wiggum process (single-session sequential execution with task interleaving)
  - Integration with multi-agent coordination (same lock/tracker system, ready for external orchestrator if needed)

### Changed

- **Parallel Execution Guide** (`PARALLEL_EXECUTION_GUIDE.md`):
  - Removed "Open 3 separate Cursor chat windows" instructions
  - Replaced with single-session orchestration protocol
  - Updated coordination section to reflect single-session execution
  - Updated "Next Action" section to show agent executes steps automatically

- **Rule Enforcement Protocol** (`agent_rules/rule_enforcement.md`):
  - Added "No Manual Orchestration" as checklist item #6 (after Multi-Agent Coordination, before Autonomy Protocol)
  - Updated checklist count from 10 to 11 items
  - Updated integration section to include No Manual Orchestration
  - Updated Agent Activation Directive to mention executing actions directly

- **Core Principles** (`agent_rules/core_principles.md`):
  - Added "No Manual Orchestration" section emphasizing execution over description
  - Updated Rule Enforcement section to mention no manual orchestration
  - Added reference to `no_manual_orchestration.md`

- **Agent Context Guide** (`.cursor/rules/agent_context.md`):
  - Added No Manual Orchestration rule as mandatory rule (third in list, after rule enforcement and file discovery)

### Rationale

These changes address critical agent behavior issues:

- **No Manual Orchestration**: Prevents the "open 3 chats / copy paste" behavior by requiring agents to execute work directly in a single session
- **Single-Session Orchestration**: Provides most of the benefit of parallel execution through sequential execution with proper task decomposition, locks, and checkpoints
- **Evidence-Based Completion**: Prevents "foundation is complete" claims without actual implementation
- **Execution Over Description**: Forces agents to take actions rather than describe actions for users to perform

### Impact

- **Affected Agents**: ALL agents - must execute actions directly, never delegate routine execution to users
- **Affected Processes**: Parallel execution now uses single-session orchestration instead of manual multi-chat coordination
- **Breaking Changes**: None - this is an enforcement mechanism that improves agent behavior
- **Migration Required**: No - existing workflows continue to work, agents now execute directly instead of describing steps
- **Ralph-Wiggum Compatibility**: Fully compatible - single-session orchestration achieves parallel execution benefits through sequential execution with task interleaving
- **Multi-Agent Compatibility**: Fully compatible - same lock/tracker system used, ready for external orchestrator if needed later

---

## v1.4.0 - 2026-01-14

### Added

- **File Discovery & Hidden File Verification** (`.cursor/rules/file_discovery.md`): New mandatory rule that prevents file duplication, drift, and workspace chaos by requiring comprehensive file discovery before any file creation. Includes:
  - Comprehensive workspace search (including hidden files, dotfiles, archived files)
  - Explicit checks for `.cursor/` rules, agent configuration files, hidden project metadata
  - Update-first behavior (must update existing files instead of creating duplicates)
  - Explicit justification required when creating new files
  - Prohibition on parallel files serving the same purpose
  - Integration with file organization rules

- **Enhanced Loop Guard** (`agent_rules/loop_guard.md` v2.0.0): Major enhancement to prevent agents from repeating tasks without progress. New features include:
  - **Mandatory Progress Logging**: Every response must start with 3-line progress log (Last state change, Current objective, Next action)
  - **Attempt Limits**: Maximum 2 attempts per objective without state change
  - **Enhanced Loop Detection**: Detects repeating "Next action" in progress logs, no state change after 2+ attempts, repeating file operations
  - **Structured Recovery Strategies**: 5 specific recovery strategies (Evidence-First, Minimal Change, Create-Once, Decision Checkpoint, Narrow Scope)
  - **Escalation Protocol**: Structured escalation when recovery strategies fail
  - **File Creation/Update Rule**: Prevents file creation loops, integrates with file discovery
  - **Ralph-Wiggum Compatibility**: Allows legitimate iteration while preventing reactive loops

### Changed

- **Rule Enforcement Protocol** (`agent_rules/rule_enforcement.md`):
  - Added File Discovery as checklist item #2 (after Context Loading, before Task Management)
  - Enhanced Loop Guard checklist to include progress logging, attempt limits, and recovery strategy verification
  - Updated checklist count from 9 to 10 items
  - Updated integration section to include File Discovery and enhanced Loop Guard
  - Updated Agent Activation Directive to mention file discovery
  - Updated rule compliance logging format to include progress log

- **Agent Context Guide** (`.cursor/rules/agent_context.md`):
  - Added File Discovery rule as mandatory rule (second in list, after rule enforcement)
  - Updated to reference enhanced loop guard

- **File Organization Rules** (`.cursor/rules/file_organization.md`):
  - Added File Discovery rule reference in Agent Rules section

- **Loop Guard** (`agent_rules/loop_guard.md`):
  - Version updated from v1.0.0 to v2.0.0
  - Added mandatory progress logging requirement
  - Added attempt limits (2 attempts max)
  - Added structured recovery strategies (5 strategies)
  - Added escalation protocol
  - Added file creation/update rule
  - Added Ralph-Wiggum compatibility section
  - Enhanced examples with progress log format
  - Added prohibited behaviors section
  - Added success criteria section

### Rationale

These enhancements address critical agent behavior issues:

- **File Discovery**: Prevents the "5 versions of the same file" problem by requiring comprehensive search before file creation, ensuring agents update existing files instead of creating duplicates
- **Enhanced Loop Guard**: Prevents agents from repeating the same tasks over and over by requiring progress tracking, attempt limits, and structured recovery strategies

### Impact

- **Affected Agents**: ALL agents - file discovery is mandatory before file creation, progress logging is mandatory for all responses
- **Affected Processes**: File creation workflow now requires comprehensive discovery, all agent responses must include progress logs
- **Breaking Changes**: None - these are additive enhancements that improve agent behavior
- **Migration Required**: No - existing workflows continue to work, new rules are automatically enforced

---

## v1.3.0 - 2026-01-14

### Added

- **Ralph-Wiggum + BMAD Integration**: Automatic task breakdown integration that enhances BMAD story creation with Ralph-Wiggum Phase 1 methodology
  - **New Task**: `.bmad-core/tasks/breakdown-story-tasks.md` - Automatically breaks down story tasks into atomic units using "One Sentence Without 'And'" test
  - **Integration Point**: `.bmad-core/tasks/create-next-story.md` Step 7 - Automatically invokes task breakdown after story creation
  - **Features**:
    - Non-breaking enhancement (preserves all BMAD story elements)
    - Updates story file, implementation plan, and task tracking system
    - Creates specs for new topics when needed
    - Maps dependencies and identifies parallelization opportunities

### Changed

- **Story Creation Workflow** (`.bmad-core/tasks/create-next-story.md`):
  - Added Step 7: Automatic Task Breakdown (Ralph-Wiggum Integration)
  - Runs automatically and non-blocking after story draft completion
  - Enhances task granularity without disrupting existing BMAD processes

### Rationale

This integration:

- Automatically applies Ralph-Wiggum task breakdown methodology to BMAD stories
- Enhances task granularity for better parallelization
- Maintains full backward compatibility with existing BMAD workflows
- Provides atomic task breakdown without manual intervention

### Impact

- **Affected Agents**: PM agent (story creation), Dev agents (task execution)
- **Affected Processes**: Story creation workflow now includes automatic task breakdown
- **Breaking Changes**: None - integration is non-breaking and enhances existing functionality
- **Migration Required**: No - existing stories continue to work, new stories automatically get enhanced breakdown

---

## v1.2.0 - 2026-01-14

### Added

- **Rule Enforcement Protocol** (`agent_rules/rule_enforcement.md`): Mandatory meta-rule that ensures all agents automatically follow all applicable rules without requiring reminders. Includes:
  - Pre-action rule compliance checklist (9 mandatory checklists)
  - Automatic Ralph-Wiggum process evaluation and application
  - Multi-agent coordination enforcement
  - Rule violation detection and handling
  - Rule compliance logging

### Changed

- **Core Principles** (`agent_rules/core_principles.md`):
  - Added "Rule Enforcement" section at the top emphasizing mandatory rule compliance
  - References rule enforcement protocol as the mechanism for ensuring compliance
- **Agent Context Guide** (`.cursor/rules/agent_context.md`):
  - Added `rule_enforcement.md` as the first required rule (must be checked first)
  - Added `ralph_wiggum_process.md` to required Agent Rules list

### Rationale

These changes ensure that:

- Agents automatically follow all rules without requiring user reminders
- Ralph-Wiggum process is evaluated and applied when appropriate
- Multi-agent coordination is considered and used when beneficial
- Rule compliance is verified before every action
- Violations are detected and fixed automatically

### Impact

- **Affected Agents**: ALL agents - rule compliance is now mandatory and automatic
- **Affected Processes**: Every agent action now requires pre-action verification
- **Breaking Changes**: None - this is an enforcement mechanism, not a change to existing rules
- **Migration Required**: No - existing rules remain the same, enforcement is now mandatory

---

## v1.1.0 - 2026-01-XX

### Added

- **Iterative Work Pattern** (`agent_rules/iterative_work_pattern.md`): New rule defining a three-file pattern (Context, Todos, Insights) for iterative tasks that require processing multiple items, collecting insights, and maintaining context across memory compaction events.

### Changed

- **Agent Context Guide** (`.cursor/rules/agent_context.md`):
  - Added "Memory Compaction Recovery" section with explicit procedures for recovering context after memory compaction
  - Added `iterative_work_pattern.md` to required Agent Rules list
- **Core Principles** (`agent_rules/core_principles.md`):
  - Added "Optional: Task-Specific File Creation" section after Mandatory Pre-Work Checklist
  - Documents when and how to use the three-file pattern for iterative tasks

- **File Organization** (`.cursor/rules/file_organization.md`):
  - Added new task file locations to "Task Files" section:
    - `agent_tasks/context/[task_id]_context.md`
    - `agent_tasks/todos/[task_id]_todos.md`
    - `agent_tasks/insights/[task_id]_insights.md`
  - Added `iterative_work_pattern.md` to "Agent Rules" section

### Rationale

These changes improve agent continuity and progress tracking for iterative tasks by:

- Providing persistent context files that survive memory compaction
- Enabling visible progress tracking with markdown todos
- Supporting iterative insights collection
- Formalizing recovery procedures after memory compaction events

### Impact

- **Affected Agents**: All agents working on iterative tasks
- **Affected Processes**: Task initialization, progress tracking, memory compaction recovery
- **Breaking Changes**: None - this is an additive enhancement
- **Migration Required**: No - existing tasks continue to work, new iterative tasks can optionally use this pattern

---

## v1.0.0 - 2026-01-XX

### Added

- Core Principles (`agent_rules/core_principles.md`)
- Error Handling Protocol (`agent_rules/error_handling.md`)
- Parallel Agent Coordination (`agent_rules/parallel_coordination.md`)
- Agent Rules Update Protocol (`agent_rules/update_protocol.md`)
- Autonomous Execution Protocol (`agent_rules/autonomy_protocol.md`)
- Loop Guard (`agent_rules/loop_guard.md`)
