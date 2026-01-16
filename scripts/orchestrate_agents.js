#!/usr/bin/env node
/**
 * Multi-Agent Orchestrator
 * 
 * Spawns and coordinates multiple Cursor agent sessions for parallel execution.
 * Uses Cursor CLI to launch agents and coordinates via lock files and communication.
 * 
 * Usage:
 *   node scripts/orchestrate_agents.js --epic epic-1 --groups A,B,C
 *   node scripts/orchestrate_agents.js --tasks task-1,task-2,task-3
 *   node scripts/orchestrate_agents.js --config orchestrator.config.json
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// Load Claude Code launcher (with error handling for missing file)
let launchClaudeCodeWindow;
try {
  const launcher = require('./launch_claude_code');
  launchClaudeCodeWindow = launcher.launchClaudeCodeWindow;
} catch (error) {
  // Fallback if launcher not available
  launchClaudeCodeWindow = null;
  console.warn('Claude Code launcher not available, will use CLI fallback');
}

const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOCK_DIR = path.join(PROJECT_ROOT, '.lock');
const COMMS_DIR = path.join(PROJECT_ROOT, 'agent_comms');
const TODO_FILE = path.join(PROJECT_ROOT, 'agent_tasks', 'todo_progress.json');
const LOG_DIR = path.join(PROJECT_ROOT, 'logs', 'orchestrator');
const AGENT_PROMPTS_DIR = path.join(PROJECT_ROOT, 'agent_prompts');

// Agent configurations
// Note: Agent IDs should match prompt file names in agent_prompts/ directory
const AGENT_CONFIGS = {
  'dev-backend-1': {
    name: 'Backend Developer 1',
    specialty: ['backend', 'database', 'api'],
    maxConcurrent: 2,
    promptFile: 'dev-backend-1.md',
    agentPrompt: `You are a Backend Developer agent. Focus on backend tasks: database, APIs, services, middleware.
Follow agent rules in agent_rules/. Use lock files for coordination. Update todo_progress.json.`
  },
  'dev-backend-2': {
    name: 'Backend Developer 2',
    specialty: ['backend', 'database', 'api'],
    maxConcurrent: 2,
    promptFile: 'dev-backend-2.md',
    agentPrompt: `You are a Backend Developer agent. Focus on backend tasks: database, APIs, services, middleware.
Follow agent rules in agent_rules/. Use lock files for coordination. Update todo_progress.json.`
  },
  'dev-frontend': {
    name: 'Frontend Developer',
    specialty: ['frontend', 'ui', 'components'],
    maxConcurrent: 2,
    promptFile: 'dev-frontend-1.md', // Fallback if file doesn't exist
    agentPrompt: `You are a Frontend Developer agent. Focus on frontend tasks: components, pages, UI.
Follow agent rules in agent_rules/. Use lock files for coordination. Update todo_progress.json.`
  },
  'qa-1': {
    name: 'QA Tester 1',
    specialty: ['testing', 'qa', 'validation'],
    maxConcurrent: 1,
    promptFile: 'qa-1.md',
    agentPrompt: `You are a QA Tester agent. Focus on testing: unit tests, integration tests, E2E tests.
Follow agent rules in agent_rules/. Use lock files for coordination. Update todo_progress.json.`
  },
  'dev-oauth-1': {
    name: 'OAuth Developer 1',
    specialty: ['oauth', 'auth', 'backend'],
    maxConcurrent: 2,
    promptFile: 'dev-oauth-1-enhanced.md', // Use enhanced version with continuous loop
    agentPrompt: `You are an OAuth Integration Specialist. Focus on OAuth flows, authentication, and API integrations.
Follow agent rules in agent_rules/. Use lock files for coordination. Update todo_progress.json.`
  },
  'dev-oauth-2': {
    name: 'OAuth Developer 2',
    specialty: ['oauth', 'auth', 'backend'],
    maxConcurrent: 2,
    promptFile: 'dev-oauth-2.md',
    agentPrompt: `You are an OAuth Integration Specialist. Focus on OAuth flows, authentication, and API integrations.
Follow agent rules in agent_rules/. Use lock files for coordination. Update todo_progress.json.`
  },
  'dev-oauth-3': {
    name: 'OAuth Developer 3',
    specialty: ['oauth', 'auth', 'backend'],
    maxConcurrent: 2,
    promptFile: 'dev-oauth-3.md',
    agentPrompt: `You are an OAuth Integration Specialist. Focus on OAuth flows, authentication, and API integrations.
Follow agent rules in agent_rules/. Use lock files for coordination. Update todo_progress.json.`
  },
  // Legacy mappings for backward compatibility
  'dev-backend': {
    name: 'Backend Developer',
    specialty: ['backend', 'database', 'api'],
    maxConcurrent: 2,
    promptFile: 'dev-backend-1.md',
    agentPrompt: `You are a Backend Developer agent. Focus on backend tasks: database, APIs, services, middleware.
Follow agent rules in agent_rules/. Use lock files for coordination. Update todo_progress.json.`
  },
  'qa': {
    name: 'QA Tester',
    specialty: ['testing', 'qa', 'validation'],
    maxConcurrent: 1,
    promptFile: 'qa-1.md',
    agentPrompt: `You are a QA Tester agent. Focus on testing: unit tests, integration tests, E2E tests.
Follow agent rules in agent_rules/. Use lock files for coordination. Update todo_progress.json.`
  },
  'architect': {
    name: 'Architect',
    specialty: ['architecture', 'design', 'planning'],
    maxConcurrent: 1,
    promptFile: null, // No prompt file yet
    agentPrompt: `You are an Architect agent. Focus on architecture and design tasks.
Follow agent rules in agent_rules/. Use lock files for coordination. Update todo_progress.json.`
  }
};

class AgentOrchestrator {
  constructor(options = {}) {
    this.options = {
      epic: options.epic,
      groups: options.groups ? options.groups.split(',') : [],
      tasks: options.tasks ? options.tasks.split(',') : [],
      config: options.config,
      maxConcurrent: options.maxConcurrent || 3,
      monitorInterval: options.monitorInterval || 5000, // 5 seconds
      logFile: path.join(LOG_DIR, `orchestrator-${Date.now()}.log`)
    };
    this.activeAgents = new Map(); // agentId -> { process, task, startTime, lastProgressTime }
    this.taskQueue = [];
    this.completedTasks = new Set();
    this.failedTasks = new Map(); // taskId -> error
    this.agentCommand = null; // Will be set during initialization (agent, cursor-agent, or wsl agent)
    this.shutdownRequested = false; // Flag for graceful shutdown
    this.idleTimeoutMinutes = options.idleTimeoutMinutes || 15; // Kill agents after 15 minutes of no progress
  }

  async initialize() {
    // Ensure directories exist
    await fs.mkdir(LOCK_DIR, { recursive: true });
    await fs.mkdir(COMMS_DIR, { recursive: true });
    await fs.mkdir(LOG_DIR, { recursive: true });

    // Check Cursor CLI availability and get command name
    this.agentCommand = await this.checkCursorCLI();
    
    if (!this.agentCommand) {
      const isWindows = process.platform === 'win32';
      let installInstructions;
      
      if (isWindows) {
        installInstructions = `Cursor CLI not found on Windows.

Installation options:
1. Use Git Bash: Open Git Bash and run: curl https://cursor.com/install -fsS | bash
2. Use WSL: Open WSL and run: curl https://cursor.com/install -fsS | bash
3. Manual: Visit https://www.cursor.so/download for Windows installer
4. Check Cursor IDE: The CLI may already be installed with Cursor IDE

For detailed instructions, see: docs/CURSOR_CLI_INSTALL_WINDOWS.md

Note: Single-session orchestration works without CLI. Use that for now if CLI installation is problematic.`;
      } else {
        installInstructions = 'Cursor CLI not found. Install with: curl https://cursor.com/install -fsS | bash';
      }
      
      throw new Error(installInstructions);
    }

    // AUTOMATIC TASK SYNC: Populate tasks from IMPLEMENTATION_PLAN.md before loading
    // This ensures orchestrator always has tasks available
    await this.autoSyncTasks();

    // Load tasks
    if (this.options.config) {
      await this.loadConfig(this.options.config);
    } else {
      await this.loadTasksFromTodo();
    }

    this.log('Orchestrator initialized', {
      tasks: this.taskQueue.length,
      maxConcurrent: this.options.maxConcurrent,
      agentCommand: this.agentCommand
    });
  }

  async checkCursorCLI() {
    // Try multiple command variations
    // Note: For WSL, we need to source .bashrc to get PATH
    const commands = [
      { cmd: 'agent --version', name: 'agent' },  // Standard command (direct)
      { cmd: 'cursor-agent --version', name: 'cursor-agent' },  // Alternative name
      { cmd: 'wsl -d Ubuntu bash -c "source ~/.bashrc && agent --version"', name: 'wsl -d Ubuntu agent' },  // WSL Ubuntu with bashrc
      { cmd: 'wsl -d Ubuntu bash -c "export PATH=$HOME/.local/bin:$PATH && agent --version"', name: 'wsl -d Ubuntu agent (explicit PATH)' },  // WSL Ubuntu with explicit PATH
      { cmd: 'wsl -d Ubuntu ~/.local/bin/agent --version', name: 'wsl -d Ubuntu ~/.local/bin/agent' },  // WSL Ubuntu with full path
      { cmd: 'wsl agent --version', name: 'wsl agent' }  // WSL default
    ];
    
    for (const { cmd, name } of commands) {
      try {
        execSync(cmd, { stdio: 'ignore', shell: true });
        this.log(`Cursor CLI is available (${name} command)`);
        return name; // Return the working command name
      } catch (error) {
        continue;
      }
    }
    
    // No command found - throw error
    const isWindows = process.platform === 'win32';
    let installInstructions;
    
    if (isWindows) {
      installInstructions = `Cursor CLI not found on Windows.

Installation options:
1. Use Git Bash: Open Git Bash and run: curl https://cursor.com/install -fsS | bash
2. Use WSL: Open WSL and run: curl https://cursor.com/install -fsS | bash
3. Manual: Visit https://www.cursor.so/download for Windows installer
4. Check Cursor IDE: The CLI may already be installed with Cursor IDE

For detailed instructions, see: docs/CURSOR_CLI_INSTALL_WINDOWS.md

Note: Single-session orchestration works without CLI. Use that for now if CLI installation is problematic.`;
    } else {
      installInstructions = 'Cursor CLI not found. Install with: curl https://cursor.com/install -fsS | bash';
    }
    
    throw new Error(installInstructions);
  }

  async loadConfig(configPath) {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    if (config.epic) {
      this.options.epic = config.epic;
    }
    if (config.groups) {
      this.options.groups = config.groups;
    }
    if (config.maxConcurrent) {
      this.options.maxConcurrent = config.maxConcurrent;
    }

    await this.loadTasksFromTodo();
  }

  async loadTasksFromTodo() {
    // Use streaming JSON parser for large files to reduce memory
    let todoContent;
    try {
      todoContent = await fs.readFile(TODO_FILE, 'utf-8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.log(`WARNING: ${TODO_FILE} does not exist. Creating empty structure.`);
        todoContent = '{"$schema": "https://json-schema.org/draft/2020-12/schema", "description": "Machine-readable task list for AI agent coordination", "version": "1.0.0", "last_updated": "' + new Date().toISOString() + '", "tasks": []}';
      } else {
        throw error;
      }
    }
    
    // Handle empty file
    if (!todoContent || todoContent.trim().length === 0) {
      this.log(`WARNING: ${TODO_FILE} is empty. Creating empty structure.`);
      todoContent = '{"$schema": "https://json-schema.org/draft/2020-12/schema", "description": "Machine-readable task list for AI agent coordination", "version": "1.0.0", "last_updated": "' + new Date().toISOString() + '", "tasks": []}';
    }
    
    let todo;
    try {
      todo = JSON.parse(todoContent);
    } catch (error) {
      this.log(`ERROR: Failed to parse ${TODO_FILE}: ${error.message}`);
      this.log(`File content (first 500 chars): ${todoContent.substring(0, 500)}`);
      // Create a valid empty structure
      todo = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "description": "Machine-readable task list for AI agent coordination",
        "version": "1.0.0",
        "last_updated": new Date().toISOString(),
        "tasks": []
      };
      // Try to save the valid structure
      try {
        await fs.writeFile(TODO_FILE, JSON.stringify(todo, null, 2), 'utf-8');
        this.log(`Created valid empty structure in ${TODO_FILE}`);
      } catch (writeError) {
        this.log(`WARNING: Could not write to ${TODO_FILE}: ${writeError.message}`);
      }
    }

    let tasks = todo.tasks || [];

    // Optimize: Single pass filtering instead of multiple filter() calls
    const epicFilter = this.options.epic;
    const groupsFilter = this.options.groups.length > 0 ? new Set(this.options.groups) : null;
    const tasksFilter = this.options.tasks.length > 0 ? new Set(this.options.tasks) : null;

    // Single pass filter to reduce memory allocations
    const filteredTasks = [];
    for (const task of tasks) {
      // Epic filter
      if (epicFilter && task.epic_id !== epicFilter) continue;
      
      // Groups filter
      if (groupsFilter) {
        const group = this.extractGroup(task);
        // Only filter if group was found AND it's not in the filter set
        // If group is null, allow the task through (don't filter by group)
        if (group !== null && !groupsFilter.has(group)) {
          // Log why task was filtered out
          if (filteredTasks.length < 5) { // Only log first few to avoid spam
            this.log(`Task ${task.task_id} filtered out: group=${group}, required groups=${Array.from(groupsFilter).join(',')}`);
          }
          continue;
        }
        // Log when group is found
        if (group && filteredTasks.length < 5) {
          this.log(`Task ${task.task_id} matched group ${group}`);
        }
      }
      
      // Tasks filter
      if (tasksFilter && !tasksFilter.has(task.task_id)) continue;
      
      // Status filter
      if (task.status !== 'pending' && task.status !== 'in_progress') continue;
      
      // Store task data (include fields needed for priority sorting)
      filteredTasks.push({
        task_id: task.task_id,
        description: task.description,
        status: task.status,
        priority: task.priority || 99,
        dependencies: task.dependencies || [],
        epic_id: task.epic_id,
        story_id: task.story_id,
        assigned_agent: task.assigned_agent,
        estimated_complexity: task.estimated_complexity,
        source: task.source || 'plan', // 'plan', 'agent-suggested', etc.
        retry_count: task.retry_count || 0 // For rework priority
      });
    }

    // Sort in-place with priority system:
    // 1. Task Source Priority: New tasks (from plan) > Rework tasks (retry/blocked) > Agent-suggested
    // 2. Epic → Story → Priority → Dependencies
    // This ensures systematic execution with proper priority handling
    filteredTasks.sort((a, b) => {
      // PRIORITY 1: Task Source (New > Rework > Agent-Suggested)
      const getSourcePriority = (task) => {
        // New tasks from plan (no source or source='plan')
        if (!task.source || task.source === 'plan') return 1;
        // Rework tasks (retry_count > 0 or blocked)
        if (task.retry_count > 0 || task.status === 'blocked') return 2;
        // Agent-suggested tasks
        if (task.source === 'agent-suggested') return 3;
        return 1; // Default to new task priority
      };
      
      const sourcePriorityA = getSourcePriority(a);
      const sourcePriorityB = getSourcePriority(b);
      if (sourcePriorityA !== sourcePriorityB) {
        return sourcePriorityA - sourcePriorityB;
      }
      
      // PRIORITY 2: Rework tasks (retry_count > 0) come before new tasks of same source
      if (a.retry_count !== b.retry_count) {
        // Higher retry_count = needs more reworking = higher priority
        return b.retry_count - a.retry_count;
      }
      
      // PRIORITY 3: Epic order: Process epics in order (epic-1, epic-2, etc.)
      if (a.epic_id !== b.epic_id) {
        // Extract epic number for comparison (e.g., "epic-1" -> 1)
        const epicNumA = a.epic_id ? parseInt((a.epic_id.match(/\d+/) || [])[0] || '999', 10) : 999;
        const epicNumB = b.epic_id ? parseInt((b.epic_id.match(/\d+/) || [])[0] || '999', 10) : 999;
        if (epicNumA !== epicNumB) return epicNumA - epicNumB;
      }
      
      // PRIORITY 4: Story order: Within epic, process stories in order (story-1.1, story-1.2, etc.)
      if (a.story_id !== b.story_id) {
        // Extract story number for comparison (e.g., "story-1.1" -> 1.1)
        const storyNumA = a.story_id ? parseFloat((a.story_id.match(/[\d.]+/) || [])[0] || '999') : 999;
        const storyNumB = b.story_id ? parseFloat((b.story_id.match(/[\d.]+/) || [])[0] || '999') : 999;
        if (storyNumA !== storyNumB) return storyNumA - storyNumB;
      }
      
      // PRIORITY 5: Task priority: lower number = higher priority
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // PRIORITY 6: Dependencies: tasks without deps come first
      return (a.dependencies?.length || 0) - (b.dependencies?.length || 0);
    });

    this.taskQueue = filteredTasks;
    
    // Clear original tasks array reference to help GC
    tasks = null;
    todo.tasks = null;

    this.log(`Loaded ${this.taskQueue.length} tasks from todo_progress.json after filtering`, {
      epic: this.options.epic,
      groups: this.options.groups,
      totalTasks: todo.tasks ? 'N/A' : 'filtered'
    });
    
    if (this.taskQueue.length === 0) {
      this.log(`WARNING: No tasks match filters. Epic: ${this.options.epic}, Groups: ${this.options.groups?.join(',') || 'none'}`);
      // Log details about what was filtered
      const totalTasks = todo.tasks?.length || 0;
      this.log(`Total tasks in file: ${totalTasks}, Filtered out: ${totalTasks - this.taskQueue.length}`);
    } else {
      // Track epic/story hierarchy for logging
      if (this.taskQueue.length > 0) {
        const firstTask = this.taskQueue[0];
        const epicCounts = {};
        const storyCounts = {};
        
        // Count tasks by epic and story
        for (const task of this.taskQueue) {
          if (task.epic_id) {
            epicCounts[task.epic_id] = (epicCounts[task.epic_id] || 0) + 1;
          }
          if (task.story_id) {
            storyCounts[task.story_id] = (storyCounts[task.story_id] || 0) + 1;
          }
        }
        
        this.log(`Loaded ${this.taskQueue.length} tasks into queue`, {
          epic: this.options.epic,
          groups: this.options.groups?.join(',') || 'all',
          firstTaskId: firstTask.task_id,
          firstTaskDesc: firstTask.description?.substring(0, 60),
          firstEpic: firstTask.epic_id || 'N/A',
          firstStory: firstTask.story_id || 'N/A',
          epicBreakdown: Object.keys(epicCounts).map(e => `${e}: ${epicCounts[e]} tasks`).join(', '),
          storyBreakdown: Object.keys(storyCounts).slice(0, 5).map(s => `${s}: ${storyCounts[s]} tasks`).join(', ') + (Object.keys(storyCounts).length > 5 ? '...' : '')
        });
      } else {
        this.log(`Loaded ${this.taskQueue.length} tasks into queue`, {
          epic: this.options.epic,
          groups: this.options.groups?.join(',') || 'all'
        });
      }
    }
  }

  extractGroup(task) {
    // Try to extract group from description, story_id, or metadata
    const desc = (task.description || '').toLowerCase();
    const storyId = (task.story_id || '').toLowerCase();
    
    // Check description for group indicators
    if (desc.includes('group a') || desc.includes('group-a') || desc.includes('backend') && desc.includes('database')) return 'A';
    if (desc.includes('group b') || desc.includes('group-b') || desc.includes('frontend') || desc.includes('component')) return 'B';
    if (desc.includes('group c') || desc.includes('group-c') || desc.includes('middleware') || desc.includes('auth')) return 'C';
    if (desc.includes('group d') || desc.includes('group-d')) return 'D';
    
    // Try to infer from story or task type
    // Story 1.1 tasks are typically backend/auth (Group C)
    // Story 1.2 tasks are typically backend API (Group A) or frontend (Group B)
    if (storyId.includes('1.1') && (desc.includes('oauth') || desc.includes('auth') || desc.includes('jwt'))) return 'C';
    if (storyId.includes('1.2') && (desc.includes('api') || desc.includes('endpoint'))) return 'A';
    if (storyId.includes('1.2') && (desc.includes('component') || desc.includes('page') || desc.includes('ui'))) return 'B';
    
    // If no group found, return null (will skip group filtering if groupsFilter is set)
    return null;
  }

  // Removed - sorting now done inline in loadTasksFromTodo() to reduce memory

  selectAgent(task) {
    // Match agent to task based on specialty and current load
    const taskType = this.identifyTaskType(task);
    
    // Find agents that match this task type
    const matchingAgents = Object.entries(AGENT_CONFIGS).filter(([id, config]) => {
      return config.specialty.some(s => 
        task.description?.toLowerCase().includes(s) ||
        taskType?.toLowerCase().includes(s)
      );
    });

    if (matchingAgents.length === 0) {
      // Default to backend dev for unknown tasks
      this.log(`No matching agent found for task ${task.task_id}, defaulting to dev-backend-1`, {
        taskType,
        description: task.description?.substring(0, 50)
      });
      return 'dev-backend-1'; // Use numbered agent ID
    }

    // Select agent with lowest current load
    let bestAgent = matchingAgents[0][0];
    let minLoad = this.getAgentLoad(matchingAgents[0][0]);

    for (const [agentId] of matchingAgents.slice(1)) {
      const load = this.getAgentLoad(agentId);
      if (load < minLoad) {
        minLoad = load;
        bestAgent = agentId;
      }
    }

    // Check max concurrent limit
    const agentConfig = AGENT_CONFIGS[bestAgent];
    if (minLoad >= agentConfig.maxConcurrent) {
      this.log(`Agent ${bestAgent} at capacity (${minLoad}/${agentConfig.maxConcurrent}) for task ${task.task_id}`);
      return null; // Agent at capacity
    }

    this.log(`Selected agent ${bestAgent} (load: ${minLoad}/${agentConfig.maxConcurrent}) for task type: ${taskType}`);
    return bestAgent;
  }

  identifyTaskType(task) {
    const desc = (task.description || '').toLowerCase();
    if (desc.includes('test') || desc.includes('qa')) return 'testing';
    if (desc.includes('frontend') || desc.includes('component') || desc.includes('ui')) return 'frontend';
    if (desc.includes('database') || desc.includes('schema') || desc.includes('migration')) return 'database';
    if (desc.includes('api') || desc.includes('endpoint') || desc.includes('route')) return 'api';
    if (desc.includes('middleware') || desc.includes('auth')) return 'backend';
    if (desc.includes('architect') || desc.includes('design')) return 'architecture';
    return 'backend'; // default
  }

  getAgentLoad(agentId) {
    let count = 0;
    for (const [key] of this.activeAgents) {
      // Key format is: `${agentId}-${task.task_id}`
      if (key.startsWith(`${agentId}-`)) {
        count++;
      }
    }
    return count;
  }

  async canStartTask(task) {
    // Check if dependencies are completed
    const deps = task.dependencies || [];
    for (const depId of deps) {
      if (!this.completedTasks.has(depId)) {
        return false; // Dependency not complete
      }
    }

    // Check if already assigned
    for (const [, agent] of this.activeAgents) {
      if (agent.task.task_id === task.task_id) {
        return false; // Already assigned
      }
    }

    // Check for lock file (async)
    const lockFile = path.join(LOCK_DIR, `${task.task_id}.lock`);
    const locked = await this.lockExists(lockFile);
    return !locked;
  }

  /**
   * Cleanup expired locks on startup to prevent stale locks from blocking tasks
   * This prevents issues where orchestrator/agents crash without releasing locks
   * 
   * CRITICAL: Uses UTC for all comparisons (lock timestamps are stored in UTC)
   */
  async cleanupExpiredLocks() {
    const LOCK_DIR = path.join(__dirname, '..', '.lock');
    try {
      await fs.access(LOCK_DIR);
      const files = await fs.readdir(LOCK_DIR);
      const lockFiles = files.filter(f => f.endsWith('.lock'));
      
      let cleaned = 0;
      // CRITICAL: Use UTC Date object for comparison (timestamps stored as UTC ISO strings)
      const now = new Date(); // Internally uses UTC for comparisons
      
      for (const file of lockFiles) {
        const lockPath = path.join(LOCK_DIR, file);
        try {
          const lockContent = JSON.parse(await fs.readFile(lockPath, 'utf-8'));
          // CRITICAL: Parse UTC ISO string correctly - Date constructor handles UTC ISO strings
          const expiresAt = new Date(lockContent.expires_at);
          
          // CRITICAL: Comparison uses UTC internally - this is correct
          if (expiresAt < now) {
            await fs.unlink(lockPath);
            cleaned++;
        // Log expiration details for debugging (display CST)
        const expiredCST = new Date(lockContent.expires_at).toLocaleString('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' });
        this.log(`Removed expired lock: ${file}`, {
          expiredAtCST: expiredCST,
          expiredAtUTC: lockContent.expires_at,
          currentCST: now.toLocaleString('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' }),
          currentUTC: now.toISOString()
        });
          }
        } catch (error) {
          // Invalid lock file, remove it
          try {
            await fs.unlink(lockPath);
            cleaned++;
            this.log(`Removed invalid lock file: ${file}`, { error: error.message });
          } catch (e) {
            // Ignore errors removing invalid files
          }
        }
      }
      
      if (cleaned > 0) {
        this.log(`Cleaned up ${cleaned} expired lock file(s) on startup`);
      } else if (lockFiles.length > 0) {
        // Log if we found locks but none were expired (for debugging)
        // Include timezone info (display CST)
        const nowCST = now.toLocaleString('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' });
        this.log(`Found ${lockFiles.length} lock file(s) on startup (all valid)`, {
          currentCST: nowCST,
          currentUTC: now.toISOString()
        });
      }
    } catch (error) {
      // .lock directory doesn't exist yet, that's fine
      if (error.code !== 'ENOENT') {
        this.log(`Warning: Could not cleanup locks: ${error.message}`);
      }
    }
  }

  async lockExists(lockFile) {
    try {
      await fs.access(lockFile);
      // Check if expired
      const lockContent = JSON.parse(await fs.readFile(lockFile, 'utf-8'));
      const expiresAt = new Date(lockContent.expires_at);
      if (expiresAt < new Date()) {
        // Lock expired, remove it
        await fs.unlink(lockFile);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  async spawnAgent(agentId, task) {
    if (!AGENT_CONFIGS[agentId]) {
      throw new Error(`Unknown agent ID: ${agentId}. Available agents: ${Object.keys(AGENT_CONFIGS).join(', ')}`);
    }
    
    const agentConfig = AGENT_CONFIGS[agentId];
    
    this.log(`Spawning ${agentConfig.name} (${agentId}) for task ${task.task_id}`, {
      taskDescription: task.description?.substring(0, 60),
      method: launchClaudeCodeWindow ? 'Claude Code window' : 'CLI fallback'
    });

    // Create lock file
    await this.createLock(task, agentId);
    this.log(`Lock created for task ${task.task_id}`);

    // Find agent prompt file
    const promptFile = await this.findAgentPromptFile(agentId);
    if (!promptFile) {
      throw new Error(`No prompt file found for agent ${agentId}. Expected in ${AGENT_PROMPTS_DIR}/`);
    }
    this.log(`Using prompt file: ${promptFile}`);

    // Launch Claude Code window instead of CLI
    if (!launchClaudeCodeWindow) {
      // Fallback to CLI if launcher not available
      return this.spawnAgentCLI(agentId, task, agentConfig);
    }

    try {
      this.log(`Attempting to launch Claude Code window for ${agentConfig.name}...`);
      const result = await launchClaudeCodeWindow(agentId, promptFile, {
        mode: 'auto',
        task: task
      });

      if (!result || !result.launched) {
        throw new Error('Claude Code window launch returned no result or launched=false');
      }

      const agentInstance = {
        process: result.process,
        task,
        agentId,
        agentName: agentConfig.name,
        startTime: Date.now(),
        lastProgressTime: Date.now(), // Initialize progress tracking
        lastStatus: task.status || 'pending',
        output: '',
        error: '',
        outputLines: 0,
        maxOutputLines: 1000,
        windowLaunched: true,
        promptFile: result.promptFile
      };

      // For Claude Code windows, we monitor via file system (todo_progress.json)
      // rather than process output
      this.log(`✅ Claude Code window launched successfully for ${agentConfig.name}`, {
        taskId: task.task_id,
        promptFile: result.promptFile,
        processPid: result.process?.pid
      });

      // Set up monitoring for this agent
      this.monitorAgentProgress(agentInstance);

      // Note: Agent may already be in activeAgents as placeholder from processQueue
      // Update with actual instance (with same key)
      const agentKey = `${agentId}-${task.task_id}`;
      this.activeAgents.set(agentKey, agentInstance);
      this.log(`Agent ${agentId} (task ${task.task_id}) added to active agents. Active count: ${this.activeAgents.size}`);
      return agentInstance;
    } catch (error) {
      this.log(`❌ Failed to launch Claude Code window for ${agentConfig.name}: ${error.message}`, {
        error: error.stack,
        taskId: task.task_id
      });
      
      // Fallback to CLI if Claude Code launch fails
      this.log(`Falling back to CLI mode for ${agentConfig.name}...`);
      return this.spawnAgentCLI(agentId, task, agentConfig);
    }
  }

  async spawnAgentCLI(agentId, task, agentConfig) {
    // Original CLI spawning logic as fallback
    const taskPrompt = this.buildTaskPrompt(task, agentConfig);

    let spawnCommand, spawnArgs;
    
    if (this.agentCommand && this.agentCommand.includes('wsl')) {
      // Use temporary file to avoid bash escaping issues with special characters
      // This is safer than trying to escape all special characters in the prompt
      // Use temporary file to avoid bash escaping issues with special characters
      // The prompt contains special characters like [Backend Developer 1] which bash interprets as commands
      // Writing to a file and reading it avoids all escaping issues
      const tempPromptFile = path.join(PROJECT_ROOT, '.temp', `prompt-${task.task_id}-${Date.now()}.txt`);
      
      // Convert Windows path to WSL path (C:\Users\... -> /mnt/c/Users/...)
      const wslPath = tempPromptFile
        .replace(/\\/g, '/')
        .replace(/^([A-Z]):/, (match, drive) => `/mnt/${drive.toLowerCase()}`);
      
      // Ensure .temp directory exists
      const tempDir = path.join(PROJECT_ROOT, '.temp');
      await fs.mkdir(tempDir, { recursive: true });
      
      // Write prompt to temporary file
      await fs.writeFile(tempPromptFile, taskPrompt, 'utf-8');
      
      this.log(`Created temporary prompt file: ${tempPromptFile} (WSL: ${wslPath})`, {
        taskId: task.task_id,
        agent: agentConfig.name
      });
      
      // Extract the agent path from the command (e.g., "wsl -d Ubuntu ~/.local/bin/agent" -> "~/.local/bin/agent")
      let agentPath = 'agent'; // default
      if (this.agentCommand.includes('~/.local/bin/agent')) {
        agentPath = '~/.local/bin/agent';
      } else if (this.agentCommand.includes('/.local/bin/agent')) {
        // Handle case where ~ might be expanded
        agentPath = '~/.local/bin/agent';
      }
      
      // Read file content in WSL and pass to agent (safer than inline string)
      // Use single quotes around the file path to handle spaces/special chars
      spawnCommand = 'wsl';
      spawnArgs = ['-d', 'Ubuntu', 'bash', '-c', `source ~/.bashrc && ${agentPath} -p --force "$(cat '${wslPath}')"`];
    } else if (this.agentCommand) {
      spawnCommand = this.agentCommand.replace('--version', '').split(' ')[0];
      spawnArgs = ['-p', '--force', taskPrompt];
    } else {
      throw new Error('No agent command available and Claude Code launch failed');
    }

    const process = spawn(spawnCommand, spawnArgs, {
      cwd: PROJECT_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
      maxBuffer: 1024 * 1024
    });

    const agentInstance = {
      process,
      task,
      agentId,
      agentName: agentConfig.name,
      startTime: Date.now(),
      lastProgressTime: Date.now(), // Initialize progress tracking
      lastStatus: task.status || 'pending', // Initialize status tracking
      output: '',
      error: '',
      outputLines: 0,
      maxOutputLines: 1000,
      windowLaunched: false
    };
    
    // Set up monitoring for CLI agents too
    this.monitorAgentProgress(agentInstance);
    
    // Clean up temp file on process exit (if it was created for WSL)
    if (this.agentCommand && this.agentCommand.includes('wsl')) {
      const taskIdForCleanup = task.task_id;
      process.on('exit', async () => {
        try {
          // Find and delete the temp file for this task
          const tempDir = path.join(PROJECT_ROOT, '.temp');
          const files = await fs.readdir(tempDir);
          for (const file of files) {
            if (file.startsWith(`prompt-${taskIdForCleanup}-`)) {
              await fs.unlink(path.join(tempDir, file));
              this.log(`Cleaned up temporary prompt file: ${file}`);
            }
          }
        } catch (error) {
          // Ignore cleanup errors (file might not exist, dir might not exist, etc.)
        }
      });
      
      // Also set a timeout cleanup (5 minutes) as backup
      setTimeout(async () => {
        try {
          const tempDir = path.join(PROJECT_ROOT, '.temp');
          const files = await fs.readdir(tempDir);
          for (const file of files) {
            if (file.startsWith(`prompt-${taskIdForCleanup}-`)) {
              await fs.unlink(path.join(tempDir, file));
            }
          }
        } catch (error) {
          // Ignore cleanup errors
        }
      }, 300000); // 5 minutes
    }

    process.stdout.on('data', (data) => {
      const dataStr = data.toString();
      this.log(`[${agentConfig.name}] ${dataStr.trim()}`, { taskId: task.task_id });
      
      if (agentInstance.outputLines < agentInstance.maxOutputLines) {
        agentInstance.output += dataStr;
        agentInstance.outputLines += dataStr.split('\n').length;
      } else if (agentInstance.outputLines === agentInstance.maxOutputLines) {
        agentInstance.output += '\n[Output truncated - too large]';
        agentInstance.outputLines++;
      }
    });

    process.stderr.on('data', (data) => {
      const dataStr = data.toString();
      this.log(`[${agentConfig.name}] ERROR: ${dataStr.trim()}`, { taskId: task.task_id });
      agentInstance.error += dataStr;
    });

    process.on('exit', (code) => {
      this.handleAgentExit(agentInstance, code);
    });

    this.activeAgents.set(`${agentId}-${task.task_id}`, agentInstance);
    return agentInstance;
  }

  async findAgentPromptFile(agentId) {
    const agentConfig = AGENT_CONFIGS[agentId];
    
    // First, check if agent config has explicit promptFile
    if (agentConfig && agentConfig.promptFile) {
      const explicitFile = path.join(AGENT_PROMPTS_DIR, agentConfig.promptFile);
      try {
        await fs.access(explicitFile);
        return path.relative(PROJECT_ROOT, explicitFile);
      } catch {
        this.log(`Warning: Explicit prompt file ${agentConfig.promptFile} not found for ${agentId}`);
      }
    }
    
    // Try to find prompt file for this agent
    const possibleFiles = [
      path.join(AGENT_PROMPTS_DIR, `${agentId}.md`),
      path.join(AGENT_PROMPTS_DIR, `${agentId.replace(/-/g, '_')}.md`),
      path.join(AGENT_PROMPTS_DIR, `${agentId}-1.md`), // Try with -1 suffix
      path.join(AGENT_PROMPTS_DIR, `${agentId.replace(/\d+$/, '')}-1.md`) // Try without number then add -1
    ];

    for (const file of possibleFiles) {
      try {
        await fs.access(file);
        this.log(`Found prompt file: ${path.relative(PROJECT_ROOT, file)} for agent ${agentId}`);
        return path.relative(PROJECT_ROOT, file);
      } catch {
        // Continue searching
      }
    }

    // If no specific file found, try to find a generic one based on agent type
    const agentType = agentId.split('-')[0]; // e.g., 'dev', 'qa'
    const genericFile = path.join(AGENT_PROMPTS_DIR, `${agentType}-1.md`);
    try {
      await fs.access(genericFile);
      this.log(`Using generic prompt file: ${path.relative(PROJECT_ROOT, genericFile)} for agent ${agentId}`);
      return path.relative(PROJECT_ROOT, genericFile);
    } catch {
      this.log(`ERROR: No prompt file found for agent ${agentId}. Tried: ${possibleFiles.map(f => path.basename(f)).join(', ')}, ${path.basename(genericFile)}`);
      return null;
    }
  }

  monitorAgentProgress(agentInstance) {
    // Initialize progress tracking
    agentInstance.lastProgressTime = Date.now();
    agentInstance.lastStatus = agentInstance.task.status || 'pending';
    
    // Monitor agent progress by watching todo_progress.json
    const checkInterval = setInterval(async () => {
      try {
        // Check for shutdown request
        if (this.shutdownRequested) {
          clearInterval(checkInterval);
          return;
        }
        
        const todoContent = await fs.readFile(TODO_FILE, 'utf-8');
        const todo = JSON.parse(todoContent);
        const task = todo.tasks.find(t => t.task_id === agentInstance.task.task_id);
        
        if (task) {
          // Check if status changed (progress indicator)
          if (task.status !== agentInstance.lastStatus) {
            agentInstance.lastProgressTime = Date.now();
            agentInstance.lastStatus = task.status;
            this.log(`Task ${agentInstance.task.task_id} status changed: ${agentInstance.lastStatus} → ${task.status}`, {
              agent: agentInstance.agentName,
              epic: task.epic_id,
              story: task.story_id
            });
          }
          
          // Check idle timeout (no progress for X minutes)
          const idleMinutes = (Date.now() - agentInstance.lastProgressTime) / (1000 * 60);
          if (idleMinutes > this.idleTimeoutMinutes) {
            clearInterval(checkInterval);
            this.log(`⚠️ Agent ${agentInstance.agentName} (task ${agentInstance.task.task_id}) idle for ${idleMinutes.toFixed(1)} minutes - marking as stuck`, {
              idleMinutes: idleMinutes.toFixed(1),
              lastProgress: new Date(agentInstance.lastProgressTime).toISOString(),
              epic: task.epic_id,
              story: task.story_id
            });
            await this.handleAgentExit(agentInstance, 1, 'idle_timeout');
            return;
          }
          
          if (task.status === 'completed') {
            clearInterval(checkInterval);
            this.log(`✅ Task ${agentInstance.task.task_id} completed by ${agentInstance.agentName}`, {
              epic: task.epic_id,
              story: task.story_id
            });
            await this.handleAgentExit(agentInstance, 0);
          } else if (task.status === 'blocked') {
            clearInterval(checkInterval);
            const needsHuman = task.needs_human_intervention ? ' (NEEDS HUMAN INTERVENTION)' : '';
            this.log(`⚠️ Task ${agentInstance.task.task_id} blocked${needsHuman}`, {
              epic: task.epic_id,
              story: task.story_id,
              reason: task.blocked_reason || 'Unknown'
            });
            await this.handleAgentExit(agentInstance, 1);
          }
        } else {
          // Task not found in todo_progress.json - might have been removed
          // Continue monitoring, task might reappear
        }
      } catch (error) {
        // Continue monitoring even if file read fails
      }
    }, 5000); // Check every 5 seconds

    // Store interval for cleanup
    agentInstance.monitorInterval = checkInterval;
  }

  buildTaskPrompt(task, agentConfig) {
    return `Execute task: ${task.description}

Task ID: ${task.task_id}
Epic: ${task.epic_id || 'N/A'}
Story: ${task.story_id || 'N/A'}
Priority: ${task.priority || 'normal'}

CRITICAL: You MUST update agent_tasks/todo_progress.json throughout execution:
1. When starting: Set status to "in_progress"
2. When complete: Set status to "completed" with actual_completion_time
3. If blocked: Set status to "blocked" with blocked_reason
4. Update updated_at timestamp on every change

${agentConfig.agentPrompt}

Execution Steps (MANDATORY):
1. **Update Status**: Immediately mark task as "in_progress" in agent_tasks/todo_progress.json
2. **Acquire Lock**: Verify no lock exists in .lock/${task.task_id}.lock (orchestrator creates it)
3. **Execute**: Implement the task following coding standards
4. **Verify**: Run \`npm run type-check && npm run lint\` (fix any issues)
5. **Commit**: Commit with message \`[${agentConfig.name || 'agent'}] [${task.task_id}] ${task.description}\`
6. **Complete**: Mark task as "completed" in agent_tasks/todo_progress.json with actual_completion_time
7. **Release Lock**: Lock is released by orchestrator, but verify .lock/${task.task_id}.lock is removed

After completing this task:
- The orchestrator will automatically assign you the next available task
- Continue working autonomously: Epic → Story → Task
- DO NOT stop until all tasks are complete or blocked

If task requires human intervention:
- Mark status as "blocked" with blocked_reason explaining why
- Continue to next available task (orchestrator will handle it)

Reference files:
- agent_rules/parallel_coordination.md
- agent_rules/no_manual_orchestration.md
- agent_rules/core_principles.md
- agent_rules/autonomy_protocol.md

Begin execution now. Update todo_progress.json IMMEDIATELY.`;
  }

  async createLock(task, agentId) {
    const lockFile = path.join(LOCK_DIR, `${task.task_id}.lock`);
    const lockData = {
      task_id: task.task_id,
      agent_id: agentId,
      agent_name: AGENT_CONFIGS[agentId].name,
      locked_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
      reason: `Executing task: ${task.description}`,
      related_files: []
    };

    await fs.writeFile(lockFile, JSON.stringify(lockData, null, 2));
  }

  async handleAgentExit(agentInstance, exitCode, reason = 'normal') {
    const key = `${agentInstance.agentId}-${agentInstance.task.task_id}`;
    
    // Clear monitoring interval
    if (agentInstance.monitorInterval) {
      clearInterval(agentInstance.monitorInterval);
    }
    
    this.activeAgents.delete(key);

    const duration = Date.now() - agentInstance.startTime;
    
    // Clear large buffers to free memory
    if (agentInstance.output && agentInstance.output.length > 10000) {
      agentInstance.output = agentInstance.output.substring(0, 1000) + '...[truncated]';
    }
    
    if (exitCode === 0) {
      this.log(`✓ Task ${agentInstance.task.task_id} completed by ${agentInstance.agentName}`, {
        duration: `${(duration / 1000).toFixed(1)}s`
      });
      this.completedTasks.add(agentInstance.task.task_id);
      
      // Update todo_progress.json
      await this.markTaskCompleted(agentInstance.task.task_id);
      
      // Release lock
      await this.releaseLock(agentInstance.task.task_id);
      
      // Notify dependent tasks
      await this.notifyDependentTasks(agentInstance.task.task_id);
      
      // Reload tasks to pick up next available task
      await this.reloadTasksIfNeeded();
    } else {
      const reasonMsg = reason === 'idle_timeout' ? ' (idle timeout - no progress detected)' : '';
      this.log(`✗ Task ${agentInstance.task.task_id} failed (exit code ${exitCode})${reasonMsg}`, {
        agent: agentInstance.agentName,
        reason: reason,
        error: agentInstance.error?.substring(0, 500) || 'Unknown error'
      });
      // Only store minimal error info to reduce memory
      this.failedTasks.set(agentInstance.task.task_id, {
        exitCode,
        error: agentInstance.error?.substring(0, 1000) || 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      // Mark task as needing human intervention after multiple failures
      await this.markTaskNeedsHumanIntervention(agentInstance.task.task_id, exitCode, reason);
      
      // Release lock even on failure
      await this.releaseLock(agentInstance.task.task_id);
    }
    
    // Trigger queue reload after agent exits to pick up next task
    // This ensures continuous execution: epic → story → task
    await this.reloadTasksIfNeeded();
    
    // Clear agent instance references to help GC
    agentInstance.output = null;
    agentInstance.error = null;
    agentInstance.task = null;
  }

  async markTaskCompleted(taskId) {
    const todoContent = await fs.readFile(TODO_FILE, 'utf-8');
    const todo = JSON.parse(todoContent);
    
    const task = todo.tasks.find(t => t.task_id === taskId);
    if (task) {
      task.status = 'completed';
      task.updated_at = new Date().toISOString();
      task.actual_completion_time = new Date().toISOString();
      
      await fs.writeFile(TODO_FILE, JSON.stringify(todo, null, 2));
      
      // Log epic/story progress
      if (task.epic_id) {
        this.log(`Epic ${task.epic_id} progress: Task ${taskId} completed`, {
          epic: task.epic_id,
          story: task.story_id || 'N/A',
          task: taskId
        });
      }
    }
  }
  
  async markTaskNeedsHumanIntervention(taskId, exitCode, reason) {
    const todoContent = await fs.readFile(TODO_FILE, 'utf-8');
    const todo = JSON.parse(todoContent);
    
    const task = todo.tasks.find(t => t.task_id === taskId);
    if (task) {
      const retryCount = (task.retry_count || 0) + 1;
      task.retry_count = retryCount;
      task.last_error = reason || `Exit code: ${exitCode}`;
      task.updated_at = new Date().toISOString();
      
      // Mark as needing human intervention after 3 failures
      if (retryCount >= 3) {
        task.status = 'blocked';
        task.needs_human_intervention = true;
        task.blocked_reason = `Failed ${retryCount} times: ${task.last_error}`;
        this.log(`⚠️ Task ${taskId} marked as NEEDS HUMAN INTERVENTION (failed ${retryCount} times)`, {
          epic: task.epic_id,
          story: task.story_id,
          reason: task.blocked_reason
        });
      } else {
        // Retry later - put back in queue
        task.status = 'pending';
        this.log(`Task ${taskId} will be retried (attempt ${retryCount}/3)`, {
          epic: task.epic_id,
          story: task.story_id
        });
      }
      
      await fs.writeFile(TODO_FILE, JSON.stringify(todo, null, 2));
    }
  }
  
  async autoSyncTasks() {
    // Automatically sync tasks from IMPLEMENTATION_PLAN.md to todo_progress.json
    // This ensures orchestrator always has current tasks without manual intervention
    try {
      const { parseAllTasksFromPlan, loadOrCreateTodo, mergeTasks } = require('./populate_tasks_from_plan');
      
      this.log('🔄 Auto-syncing tasks from IMPLEMENTATION_PLAN.md...');
      
      const todo = await loadOrCreateTodo();
      const existingTasks = todo.tasks || [];
      const newTasks = await parseAllTasksFromPlan();
      
      // Merge tasks (preserves existing status)
      const mergedTasks = mergeTasks(existingTasks, newTasks);
      
      // Update todo
      todo.tasks = mergedTasks;
      todo.last_updated = new Date().toISOString();
      
      // Save
      await fs.writeFile(TODO_FILE, JSON.stringify(todo, null, 2) + '\n', 'utf-8');
      
      const added = newTasks.length;
      const total = mergedTasks.length;
      const pending = mergedTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
      
      this.log(`✅ Auto-sync complete: ${added} tasks synced, ${total} total, ${pending} available`, {
        added,
        total,
        pending,
        completed: mergedTasks.filter(t => t.status === 'completed').length
      });
      
      // Also load agent-suggested tasks
      await this.loadAgentSuggestedTasks();
      
    } catch (error) {
      this.log(`⚠️ Auto-sync failed (continuing with existing tasks): ${error.message}`, {
        error: error.stack?.substring(0, 500)
      });
      // Don't throw - continue with existing tasks
    }
  }
  
  async loadAgentSuggestedTasks() {
    // Load tasks that agents created/suggested during development
    // These are stored in agent_tasks/suggested_tasks.json
    const SUGGESTED_TASKS_FILE = path.join(PROJECT_ROOT, 'agent_tasks', 'suggested_tasks.json');
    
    try {
      const content = await fs.readFile(SUGGESTED_TASKS_FILE, 'utf-8');
      if (!content || content.trim().length === 0) {
        return; // No suggested tasks
      }
      
      const suggested = JSON.parse(content);
      const suggestedTasks = suggested.tasks || [];
      
      if (suggestedTasks.length === 0) {
        return;
      }
      
      // Load current todo
      const todoContent = await fs.readFile(TODO_FILE, 'utf-8');
      const todo = JSON.parse(todoContent);
      const existingTaskIds = new Set(todo.tasks.map(t => t.task_id));
      
      // Add suggested tasks that don't already exist
      let added = 0;
      for (const suggestedTask of suggestedTasks) {
        if (!existingTaskIds.has(suggestedTask.task_id)) {
          // Mark as agent-suggested for priority sorting
          suggestedTask.source = 'agent-suggested';
          suggestedTask.priority = suggestedTask.priority || 99; // Lower priority than plan tasks
          todo.tasks.push(suggestedTask);
          added++;
        }
      }
      
      if (added > 0) {
        todo.last_updated = new Date().toISOString();
        await fs.writeFile(TODO_FILE, JSON.stringify(todo, null, 2) + '\n', 'utf-8');
        this.log(`📝 Loaded ${added} agent-suggested tasks`, {
          totalSuggested: suggestedTasks.length,
          added
        });
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.log(`⚠️ Error loading agent-suggested tasks: ${error.message}`);
      }
      // File doesn't exist yet - that's okay
    }
  }

  async reloadTasksIfNeeded() {
    // Reload tasks from todo_progress.json to pick up newly available tasks
    // Also auto-sync from IMPLEMENTATION_PLAN.md periodically
    const currentQueueSize = this.taskQueue.length;
    const previousQueueSize = this.lastQueueSize || 0;
    
    // Auto-sync every 10 reloads (approximately every 5 minutes)
    if (!this.syncCounter) this.syncCounter = 0;
    this.syncCounter++;
    
    if (this.syncCounter % 10 === 0) {
      await this.autoSyncTasks();
    }
    
    // Reload if queue is empty or significantly reduced (tasks completed)
    if (this.taskQueue.length === 0 || (previousQueueSize > 0 && this.taskQueue.length < previousQueueSize * 0.5)) {
      try {
        await this.loadTasksFromTodo();
        const newTasks = this.taskQueue.length - currentQueueSize;
        if (newTasks > 0) {
          this.log(`Reloaded tasks from todo_progress.json: ${newTasks} new tasks available`, {
            previousQueue: currentQueueSize,
            newQueue: this.taskQueue.length,
            totalPending: this.taskQueue.length
          });
        }
      } catch (error) {
        this.log(`Error reloading tasks: ${error.message}`);
      }
    }
    
    this.lastQueueSize = this.taskQueue.length;
  }

  async releaseLock(taskId) {
    const lockFile = path.join(LOCK_DIR, `${taskId}.lock`);
    try {
      await fs.unlink(lockFile);
    } catch (error) {
      // Lock file may already be removed
    }
  }

  async notifyDependentTasks(completedTaskId) {
    const todoContent = await fs.readFile(TODO_FILE, 'utf-8');
    const todo = JSON.parse(todoContent);
    
    // Find tasks that depend on this one
    const dependents = todo.tasks.filter(t => 
      (t.dependencies || []).includes(completedTaskId)
    );

    if (dependents.length > 0) {
      // Send notification message
      const messageFile = path.join(
        COMMS_DIR,
        `${Date.now()}_orchestrator.msg`
      );
      
      const message = {
        from: 'orchestrator',
        to: dependents.map(t => `agent-${t.task_id}`),
        timestamp: new Date().toISOString(),
        type: 'notification',
        subject: `Dependency completed: ${completedTaskId}`,
        message: `Task ${completedTaskId} has been completed. Dependent tasks can now proceed.`,
        related_tasks: [completedTaskId],
        urgency: 'medium',
        requires_response: false
      };

      await fs.writeFile(messageFile, JSON.stringify(message, null, 2));
    }
  }

  /**
   * Validate system clock accuracy
   * Critical for lock expiration checks and task scheduling
   */
  validateSystemClock() {
    const now = new Date();
    const nowISO = now.toISOString();
    
    // Check if date is reasonable (not too far in past/future)
    const minDate = new Date('2020-01-01');
    const maxDate = new Date('2030-01-01');
    
    if (now < minDate || now > maxDate) {
      throw new Error(`System clock appears incorrect: ${nowISO}. Please check your system time.`);
    }
    
    // Log timezone information for debugging
    const offset = -now.getTimezoneOffset(); // Minutes from UTC (negated because getTimezoneOffset returns opposite)
    const offsetHours = offset / 60;
    const offsetSign = offsetHours >= 0 ? '+' : '';
    const timezone = now.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop();
    
    // Display CST time for user
    const cstTime = now.toLocaleString('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' });
    this.log('System clock validated', {
      timezone: `CST (UTC${offsetSign}${offsetHours})`,
      currentCST: cstTime,
      currentUTC: nowISO
    });
  }

  async start() {
    // Validate system clock first (critical for timestamp accuracy)
    try {
      this.validateSystemClock();
    } catch (error) {
      console.error('❌ CRITICAL: System clock validation failed:', error.message);
      console.error('   Please check your system time before proceeding.');
      process.exit(1);
    }

    // Initialize (includes CLI check)
    try {
      await this.initialize();
    } catch (error) {
      console.error('Initialization failed:', error.message);
      process.exit(1);
    }

    // Cleanup expired locks on startup to prevent stale locks from blocking tasks
    await this.cleanupExpiredLocks();

    this.log('Starting orchestration', {
      tasks: this.taskQueue.length,
      maxConcurrent: this.options.maxConcurrent
    });

    // Start monitoring loop
    const monitorInterval = setInterval(async () => {
      try {
        await this.processQueue();
        
        // Check if all tasks are done (handled in processQueue now)
        // This check is redundant but kept for safety
        
        // Periodic memory cleanup
        if (this.completedTasks.size > 100) {
          // Keep only recent completed tasks to reduce memory
          const recentTasks = Array.from(this.completedTasks).slice(-50);
          this.completedTasks = new Set(recentTasks);
        }
      } catch (error) {
        this.log(`Error in processQueue: ${error.message}`);
        console.error('Process queue error:', error);
        // Continue monitoring even if one iteration fails
      }
    }, this.options.monitorInterval);

    // Process queue immediately
    this.processQueue().catch(error => {
      this.log(`Error in initial processQueue: ${error.message}`);
      console.error('Initial process queue error:', error);
    });

    // Check for stop file (allows external stop signal)
    const STOP_FILE = path.join(LOCK_DIR, '.orchestrator.stop');
    
    // Handle graceful shutdown
    const shutdownHandler = async (signal) => {
      if (this.shutdownRequested) {
        // Force exit if shutdown already in progress
        process.exit(1);
      }
      this.shutdownRequested = true;
      this.log(`Shutting down orchestrator (signal: ${signal})...`);
      clearInterval(monitorInterval);
      
      // Clear any stop file
      try {
        await fs.unlink(STOP_FILE).catch(() => {});
      } catch {}
      
      await this.shutdown();
      process.exit(0);
    };
    
    // Setup signal handlers
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT (Ctrl+C)...');
      shutdownHandler('SIGINT').catch(() => process.exit(1));
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM...');
      shutdownHandler('SIGTERM').catch(() => process.exit(1));
    });
    
    // Windows-specific: Handle Ctrl+C more aggressively
    if (process.platform === 'win32') {
      // Check if stdin is a TTY (interactive terminal)
      if (process.stdin.isTTY) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        rl.on('SIGINT', () => {
          console.log('\n🛑 Received SIGINT via readline (Ctrl+C)...');
          rl.close();
          shutdownHandler('SIGINT').catch(() => process.exit(1));
        });
      }
      
      // Also check for stop file periodically (every 5 seconds)
      const stopFileCheckInterval = setInterval(async () => {
        try {
          await fs.access(STOP_FILE);
          // Stop file exists, shutdown
          clearInterval(stopFileCheckInterval);
          console.log('\n🛑 Stop file detected, shutting down...');
          shutdownHandler('stop_file').catch(() => process.exit(1));
        } catch {
          // Stop file doesn't exist, continue
        }
      }, 5000);
      
      // Clean up on exit
      process.on('exit', () => {
        clearInterval(stopFileCheckInterval);
      });
    }
  }

  async processQueue() {
    // Log queue status periodically (every 10 iterations to avoid spam)
    if (!this.queueIterationCount) this.queueIterationCount = 0;
    this.queueIterationCount++;
    const shouldLog = this.queueIterationCount % 10 === 0;

    if (shouldLog) {
      this.log(`Queue status: ${this.taskQueue.length} pending, ${this.activeAgents.size}/${this.options.maxConcurrent} active agents`);
    }

    // Process in smaller batches to reduce memory pressure
    const batchSize = Math.min(5, this.taskQueue.length);
    let processed = 0;
    
    // Start new agents if we have capacity and pending tasks
    while (
      this.activeAgents.size < this.options.maxConcurrent &&
      this.taskQueue.length > 0 &&
      processed < batchSize
    ) {
      const task = this.taskQueue.shift();
      processed++;

      // Check if task can start (async)
      const canStart = await this.canStartTask(task);
      
      if (!canStart) {
        // Diagnose why task can't start
        const deps = task.dependencies || [];
        const incompleteDeps = deps.filter(depId => !this.completedTasks.has(depId));
        const lockFile = path.join(LOCK_DIR, `${task.task_id}.lock`);
        const hasLock = await this.lockExists(lockFile);
        const isAssigned = Array.from(this.activeAgents.values()).some(agent => agent.task.task_id === task.task_id);
        
        let reason = [];
        if (incompleteDeps.length > 0) reason.push(`dependencies: ${incompleteDeps.join(', ')}`);
        if (hasLock) reason.push('locked');
        if (isAssigned) reason.push('already assigned');
        
        this.log(`Task ${task.task_id} cannot start: ${reason.join(', ') || 'unknown'}`);
        this.taskQueue.push(task);
        continue;
      }
      
      // Check capacity BEFORE selecting agent (prevent race condition)
      if (this.activeAgents.size >= this.options.maxConcurrent) {
        this.taskQueue.push(task);
        if (!shouldLog) {
          // Log only occasionally to avoid spam
          this.log(`Queue at capacity (${this.activeAgents.size}/${this.options.maxConcurrent}), waiting for agents to complete`);
        }
        break; // Can't spawn more agents
      }

      // Task can start - select agent
      const agentId = this.selectAgent(task);
      if (agentId) {
        this.log(`Selected agent ${agentId} for task ${task.task_id}: ${task.description}`);
        
        // Reserve spot in activeAgents BEFORE spawning to prevent race condition
        const reservationKey = `${agentId}-${task.task_id}`;
        if (this.activeAgents.has(reservationKey)) {
          // Already reserved, skip
          this.taskQueue.push(task);
          continue;
        }

        // Create placeholder agent instance to reserve slot
        const placeholderAgent = {
          task,
          agentId,
          startTime: Date.now(),
          reserved: true // Mark as reserved, not yet spawned
        };
        this.activeAgents.set(reservationKey, placeholderAgent);

        try {
          const agentInstance = await this.spawnAgent(agentId, task);
          // spawnAgent already adds to activeAgents, so just update if needed
          // (It should have the same key, but update to be sure)
          this.activeAgents.set(reservationKey, agentInstance);
        } catch (error) {
          // Remove reservation on error
          this.activeAgents.delete(reservationKey);
          this.log(`Failed to spawn agent for task ${task.task_id}: ${error.message}`, { error: error.stack });
          // Only keep minimal task data for retry
          this.taskQueue.push({
            task_id: task.task_id,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dependencies: task.dependencies,
            epic_id: task.epic_id
          });
        }
      } else {
        // No agent available, put back in queue
        this.log(`No available agent for task ${task.task_id}, requeueing`);
        this.taskQueue.push(task);
        break; // Can't process more if all agents busy
      }
    }
    
    // Log queue status with details
    if (this.taskQueue.length > 0) {
      const nextTask = this.taskQueue[0];
      this.log(`Queue status: ${this.taskQueue.length} tasks remaining, ${this.activeAgents.size}/${this.options.maxConcurrent} agents active`, {
        nextTask: nextTask?.task_id,
        nextTaskDesc: nextTask?.description?.substring(0, 50)
      });
    } else if (this.activeAgents.size > 0) {
      // Log queue empty status less frequently to reduce noise (every 6 iterations = ~30 seconds)
      if (!this.queueEmptyLogCount) this.queueEmptyLogCount = 0;
      this.queueEmptyLogCount++;
      
      if (this.queueEmptyLogCount % 6 === 0) {
        // Include idle time info for agents
        const agentInfo = Array.from(this.activeAgents.values()).map(agent => {
          const idleMinutes = (agent.lastProgressTime && typeof agent.lastProgressTime === 'number')
            ? ((Date.now() - agent.lastProgressTime) / (1000 * 60)).toFixed(1)
            : '0.0';
          return `${agent.agentName} (idle: ${idleMinutes}m)`;
        });
        this.log(`Queue empty, waiting for ${this.activeAgents.size} active agents to complete`, {
          agents: agentInfo
        });
      }
    }
    
    // Suggest GC after processing batch (Node.js will decide)
    if (processed > 0 && global.gc) {
      global.gc();
    }
  }

  async shutdown() {
    this.log('Shutting down all agents...');
    
    // Kill all active agents
    for (const [key, agent] of this.activeAgents) {
      agent.process.kill();
      this.log(`Killed agent: ${key}`);
    }

    // Release all locks
    const locks = await fs.readdir(LOCK_DIR);
    for (const lockFile of locks) {
      if (lockFile.endsWith('.lock')) {
        const lockPath = path.join(LOCK_DIR, lockFile);
        const lockData = JSON.parse(await fs.readFile(lockPath, 'utf-8'));
        if (lockData.agent_id?.startsWith('orchestrator')) {
          await fs.unlink(lockPath);
        }
      }
    }
  }

  finish() {
    // Final sync before finishing to ensure no tasks were missed
    this.autoSyncTasks().catch(err => {
      this.log(`Warning: Final sync failed: ${err.message}`);
    });
    
    // Final sync before finishing to ensure no tasks were missed
    try {
      await this.autoSyncTasks();
      await this.reloadTasksIfNeeded();
      
      // Check if sync found new tasks
      if (this.taskQueue.length > 0) {
        this.log(`📋 Found ${this.taskQueue.length} new tasks after final sync. Orchestration will continue.`, {
          newTasks: this.taskQueue.length
        });
        return; // Don't finish - continue working
      }
    } catch (error) {
      this.log(`Warning: Final sync failed: ${error.message}`);
    }
    
    this.log('✅ Orchestration complete - all tasks finished', {
      completed: this.completedTasks.size,
      failed: this.failedTasks.size,
      totalProcessed: this.completedTasks.size + this.failedTasks.size
    });

    if (this.failedTasks.size > 0) {
      this.log('⚠️ Failed tasks (may need human intervention):', Array.from(this.failedTasks.keys()));
    }
    
    // Exit process
    process.exit(0);
  }

  log(message, data = {}) {
    const now = new Date();
    const timestampUTC = now.toISOString();
    // Display CST time (user's local timezone)
    const timestampCST = now.toLocaleString('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' });
    const logLine = `[${timestampCST}] ${message} ${JSON.stringify(data)}\n`;
    
    // Write to log file (store UTC for consistency, display CST)
    const logLineWithUTC = `[${timestampUTC} UTC] ${message} ${JSON.stringify(data)}\n`;
    fs.appendFile(this.options.logFile, logLineWithUTC).catch(() => {});
    
    // Print to console (CST display for user)
    console.log(`[${timestampCST}] ${message}`, data);
  }
}

// CLI argument parsing
// Handle cases where npm passes arguments: npm run script -- --epic epic-1 --groups A,B,C
// Also handle: node script.js epic-1 A B C (backward compatibility)
const args = process.argv.slice(2);
const options = {};

// First, check for explicit flags (preferred format: --epic epic-1 --groups A,B,C)
let i = 0;
while (i < args.length) {
  if (args[i] === '--epic' && args[i + 1]) {
    options.epic = args[i + 1];
    i += 2;
  } else if (args[i] === '--groups' && args[i + 1]) {
    options.groups = args[i + 1];
    i += 2;
  } else if (args[i] === '--tasks' && args[i + 1]) {
    options.tasks = args[i + 1];
    i += 2;
  } else if (args[i] === '--config' && args[i + 1]) {
    options.config = args[i + 1];
    i += 2;
  } else if (args[i] === '--max-concurrent' && args[i + 1]) {
    options.maxConcurrent = parseInt(args[i + 1], 10);
    i += 2;
  } else if (args[i] === '--max-memory' && args[i + 1]) {
    options.maxMemory = parseInt(args[i + 1], 10);
    i += 2;
  } else {
    i++;
  }
}

// Backward compatibility: if no explicit flags found, try positional arguments
// Format: node script.js epic-1 A B C
if (!options.epic && !options.groups && !options.tasks && args.length > 0) {
  // First arg might be epic
  const firstArg = args[0];
  if (firstArg && !firstArg.startsWith('--') && !firstArg.includes(',')) {
    options.epic = firstArg;
    
    // Remaining args might be groups
    const remainingArgs = args.slice(1);
    if (remainingArgs.length > 0) {
      // Combine remaining args as groups (A, B, C)
      options.groups = remainingArgs.join(',');
    }
  }
}

// Apply memory limit if specified (must be done before any heavy operations)
if (options.maxMemory) {
  try {
    const v8 = require('v8');
    // Note: This only works if called early, before significant memory allocation
    // For best results, use: node --max-old-space-size=8192 scripts/orchestrate_agents.js
    v8.setFlagsFromString(`--max-old-space-size=${options.maxMemory}`);
    console.log(`[INFO] Node.js heap limit set to ${options.maxMemory}MB`);
  } catch (error) {
    console.log(`[WARN] Could not set memory limit at runtime. Use: node --max-old-space-size=${options.maxMemory} scripts/orchestrate_agents.js`);
  }
}

// Enable garbage collection if available (requires --expose-gc flag)
if (global.gc) {
  console.log('[INFO] Garbage collection enabled');
} else {
  console.log('[INFO] Run with --expose-gc flag to enable manual GC: node --expose-gc --max-old-space-size=8192 scripts/orchestrate_agents.js');
}

const orchestrator = new AgentOrchestrator(options);
orchestrator.start().catch(error => {
  console.error('Orchestrator error:', error);
  process.exit(1);
});
