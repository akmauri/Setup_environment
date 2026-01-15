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

const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOCK_DIR = path.join(PROJECT_ROOT, '.lock');
const COMMS_DIR = path.join(PROJECT_ROOT, 'agent_comms');
const TODO_FILE = path.join(PROJECT_ROOT, 'agent_tasks', 'todo_progress.json');
const LOG_DIR = path.join(PROJECT_ROOT, 'logs', 'orchestrator');

// Agent configurations
const AGENT_CONFIGS = {
  'dev-backend': {
    name: 'Backend Developer',
    specialty: ['backend', 'database', 'api'],
    maxConcurrent: 2,
    agentPrompt: `You are a Backend Developer agent. Focus on backend tasks: database, APIs, services, middleware.
Follow agent rules in agent_rules/. Use lock files for coordination. Update todo_progress.json.`
  },
  'dev-frontend': {
    name: 'Frontend Developer',
    specialty: ['frontend', 'ui', 'components'],
    maxConcurrent: 2,
    agentPrompt: `You are a Frontend Developer agent. Focus on frontend tasks: components, pages, UI.
Follow agent rules in agent_rules/. Use lock files for coordination. Update todo_progress.json.`
  },
  'qa': {
    name: 'QA Tester',
    specialty: ['testing', 'qa', 'validation'],
    maxConcurrent: 1,
    agentPrompt: `You are a QA Tester agent. Focus on testing: unit tests, integration tests, E2E tests.
Follow agent rules in agent_rules/. Use lock files for coordination. Update todo_progress.json.`
  },
  'architect': {
    name: 'Architect',
    specialty: ['architecture', 'design', 'planning'],
    maxConcurrent: 1,
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
    this.activeAgents = new Map(); // agentId -> { process, task, startTime }
    this.taskQueue = [];
    this.completedTasks = new Set();
    this.failedTasks = new Map(); // taskId -> error
    this.agentCommand = null; // Will be set during initialization (agent, cursor-agent, or wsl agent)
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
    const todoContent = await fs.readFile(TODO_FILE, 'utf-8');
    const todo = JSON.parse(todoContent);

    let tasks = todo.tasks || [];

    // Filter by epic if specified
    if (this.options.epic) {
      tasks = tasks.filter(t => t.epic_id === this.options.epic);
    }

    // Filter by groups if specified
    if (this.options.groups.length > 0) {
      // Assuming group info is in task metadata or description
      tasks = tasks.filter(t => {
        const group = this.extractGroup(t);
        return this.options.groups.includes(group);
      });
    }

    // Filter by specific task IDs if specified
    if (this.options.tasks.length > 0) {
      tasks = tasks.filter(t => this.options.tasks.includes(t.task_id));
    }

    // Filter to pending/in_progress tasks only
    tasks = tasks.filter(t => 
      t.status === 'pending' || t.status === 'in_progress'
    );

    // Sort by priority and dependencies
    this.taskQueue = this.sortTasks(tasks);

    this.log(`Loaded ${this.taskQueue.length} tasks from todo_progress.json`);
  }

  extractGroup(task) {
    // Try to extract group from description or metadata
    const desc = task.description || '';
    if (desc.includes('Group A') || desc.includes('group-a')) return 'A';
    if (desc.includes('Group B') || desc.includes('group-b')) return 'B';
    if (desc.includes('Group C') || desc.includes('group-c')) return 'C';
    if (desc.includes('Group D') || desc.includes('group-d')) return 'D';
    return null;
  }

  sortTasks(tasks) {
    // Sort by: priority (1=high), then by dependencies (no deps first)
    return tasks.sort((a, b) => {
      // Priority: lower number = higher priority
      if (a.priority !== b.priority) {
        return (a.priority || 99) - (b.priority || 99);
      }
      
      // Dependencies: tasks without deps come first
      const aDeps = (a.dependencies || []).length;
      const bDeps = (b.dependencies || []).length;
      return aDeps - bDeps;
    });
  }

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
      return 'dev-backend';
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
      return null; // Agent at capacity
    }

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
    for (const [activeAgentId] of this.activeAgents) {
      if (activeAgentId === agentId) {
        count++;
      }
    }
    return count;
  }

  canStartTask(task) {
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

    // Check for lock file
    const lockFile = path.join(LOCK_DIR, `${task.task_id}.lock`);
    return !this.lockExists(lockFile);
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
    const agentConfig = AGENT_CONFIGS[agentId];
    const taskPrompt = this.buildTaskPrompt(task, agentConfig);

    this.log(`Spawning ${agentConfig.name} for task ${task.task_id}`);

    // Create lock file
    await this.createLock(task, agentId);

    // Build the command based on detected agent command format
    let spawnCommand, spawnArgs;
    
    if (this.agentCommand.includes('wsl')) {
      // WSL command - build bash command with PATH setup
      // Escape the task prompt for bash
      const escapedPrompt = taskPrompt.replace(/"/g, '\\"').replace(/\$/g, '\\$');
      spawnCommand = 'wsl';
      spawnArgs = ['-d', 'Ubuntu', 'bash', '-c', `source ~/.bashrc && agent -p --force "${escapedPrompt}"`];
    } else {
      // Direct command (not WSL)
      spawnCommand = this.agentCommand.replace('--version', '').split(' ')[0];
      spawnArgs = ['-p', '--force', taskPrompt];
    }

    // Spawn process with memory-conscious settings
    const process = spawn(spawnCommand, spawnArgs, {
      cwd: PROJECT_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,  // Don't use shell for WSL, it handles it
      // Don't buffer output - stream it immediately
      maxBuffer: 1024 * 1024 // 1MB max buffer per stream (default is 1MB, but be explicit)
    });

    const agentInstance = {
      process,
      task,
      agentId,
      agentName: agentConfig.name,
      startTime: Date.now(),
      output: '',
      error: '',
      outputLines: 0, // Track output size to prevent memory bloat
      maxOutputLines: 1000 // Limit output buffering
    };

    // Capture output with size limits to prevent memory bloat
    process.stdout.on('data', (data) => {
      const dataStr = data.toString();
      // Log immediately (don't buffer)
      this.log(`[${agentConfig.name}] ${dataStr.trim()}`, { taskId: task.task_id });
      
      // Only buffer if under limit (for error reporting)
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
      // Log immediately (don't buffer)
      this.log(`[${agentConfig.name}] ERROR: ${dataStr.trim()}`, { taskId: task.task_id });
      
      // Always buffer errors (they're usually small)
      agentInstance.error += dataStr;
    });

    process.on('exit', (code) => {
      this.handleAgentExit(agentInstance, code);
    });

    this.activeAgents.set(`${agentId}-${task.task_id}`, agentInstance);
    return agentInstance;
  }

  buildTaskPrompt(task, agentConfig) {
    return `Execute task: ${task.description}

Task ID: ${task.task_id}
Epic: ${task.epic_id}
Story: ${task.story_id}

${agentConfig.agentPrompt}

Important:
- Acquire lock: Create .lock/${task.task_id}.lock
- Update status: Mark task as in_progress in agent_tasks/todo_progress.json
- Execute the task
- Verify: Run tests/lint/typecheck if applicable
- Complete: Mark task as completed in agent_tasks/todo_progress.json
- Release lock: Delete .lock/${task.task_id}.lock

Reference files:
- agent_rules/parallel_coordination.md
- agent_rules/no_manual_orchestration.md
- agent_rules/core_principles.md

Begin execution now.`;
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

  async handleAgentExit(agentInstance, exitCode) {
    const key = `${agentInstance.agentId}-${agentInstance.task.task_id}`;
    this.activeAgents.delete(key);

    const duration = Date.now() - agentInstance.startTime;
    
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
    } else {
      this.log(`✗ Task ${agentInstance.task.task_id} failed (exit code ${exitCode})`, {
        agent: agentInstance.agentName,
        error: agentInstance.error
      });
      this.failedTasks.set(agentInstance.task.task_id, {
        exitCode,
        error: agentInstance.error,
        output: agentInstance.output
      });
      
      // Release lock even on failure
      await this.releaseLock(agentInstance.task.task_id);
    }
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
    }
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

  async start() {
    // Initialize (includes CLI check)
    try {
      await this.initialize();
    } catch (error) {
      console.error('Initialization failed:', error.message);
      process.exit(1);
    }

    this.log('Starting orchestration', {
      tasks: this.taskQueue.length,
      maxConcurrent: this.options.maxConcurrent
    });

    // Start monitoring loop
    const monitorInterval = setInterval(() => {
      this.processQueue();
      
      // Check if all tasks are done
      if (this.taskQueue.length === 0 && this.activeAgents.size === 0) {
        clearInterval(monitorInterval);
        this.finish();
      }
    }, this.options.monitorInterval);

    // Process queue immediately
    this.processQueue();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      this.log('Shutting down orchestrator...');
      clearInterval(monitorInterval);
      await this.shutdown();
      process.exit(0);
    });
  }

  processQueue() {
    // Start new agents if we have capacity and pending tasks
    while (
      this.activeAgents.size < this.options.maxConcurrent &&
      this.taskQueue.length > 0
    ) {
      const task = this.taskQueue.shift();

      if (this.canStartTask(task)) {
        const agentId = this.selectAgent(task);
        if (agentId) {
          this.spawnAgent(agentId, task).catch(error => {
            this.log(`Failed to spawn agent for task ${task.task_id}: ${error.message}`);
            this.taskQueue.push(task); // Retry later
          });
        } else {
          // No agent available, put back in queue
          this.taskQueue.push(task);
          break; // Can't process more if all agents busy
        }
      } else {
        // Can't start yet, put back in queue
        this.taskQueue.push(task);
      }
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
    this.log('Orchestration complete', {
      completed: this.completedTasks.size,
      failed: this.failedTasks.size
    });

    if (this.failedTasks.size > 0) {
      this.log('Failed tasks:', Array.from(this.failedTasks.keys()));
    }
  }

  log(message, data = {}) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message} ${JSON.stringify(data)}\n`;
    
    // Write to log file
    fs.appendFile(this.options.logFile, logLine).catch(() => {});
    
    // Print to console
    console.log(`[${timestamp}] ${message}`, data);
  }
}

// CLI
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--epic' && args[i + 1]) {
    options.epic = args[i + 1];
    i++;
  } else if (args[i] === '--groups' && args[i + 1]) {
    options.groups = args[i + 1];
    i++;
  } else if (args[i] === '--tasks' && args[i + 1]) {
    options.tasks = args[i + 1];
    i++;
  } else if (args[i] === '--config' && args[i + 1]) {
    options.config = args[i + 1];
    i++;
  } else if (args[i] === '--max-concurrent' && args[i + 1]) {
    options.maxConcurrent = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--max-memory' && args[i + 1]) {
    options.maxMemory = parseInt(args[i + 1], 10);
    i++;
  }
}

// Apply memory limit if specified (must be done before any heavy operations)
if (options.maxMemory) {
  try {
    const v8 = require('v8');
    // Note: This only works if called early, before significant memory allocation
    // For best results, use: node --max-old-space-size=4096 scripts/orchestrate_agents.js
    v8.setFlagsFromString(`--max-old-space-size=${options.maxMemory}`);
    console.log(`[INFO] Node.js heap limit set to ${options.maxMemory}MB`);
  } catch (error) {
    console.log(`[WARN] Could not set memory limit at runtime. Use: node --max-old-space-size=${options.maxMemory} scripts/orchestrate_agents.js`);
  }
}

const orchestrator = new AgentOrchestrator(options);
orchestrator.start().catch(error => {
  console.error('Orchestrator error:', error);
  process.exit(1);
});
