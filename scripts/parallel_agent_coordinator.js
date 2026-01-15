#!/usr/bin/env node
/**
 * Parallel Agent Coordinator
 * 
 * Coordinates multiple agents working on tasks in parallel.
 * Assigns tasks, manages locks, and enables autonomous agent execution.
 * 
 * Usage:
 *   node scripts/parallel_agent_coordinator.js --story 2.5 --assign
 *   node scripts/parallel_agent_coordinator.js --story 2.5 --execute
 */

const fs = require('fs').promises;
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TODO_FILE = path.join(PROJECT_ROOT, 'agent_tasks', 'todo_progress.json');
const LOCK_DIR = path.join(PROJECT_ROOT, '.lock');
const COMMS_DIR = path.join(PROJECT_ROOT, 'agent_comms');
const AGENT_PROMPTS_DIR = path.join(PROJECT_ROOT, 'agent_prompts');

// Agent types and their specialties
const AGENT_TYPES = {
  'dev-backend': {
    name: 'Backend Developer',
    specialties: ['backend', 'api', 'database', 'services', 'middleware'],
    maxConcurrent: 3,
  },
  'dev-frontend': {
    name: 'Frontend Developer',
    specialties: ['frontend', 'ui', 'components', 'pages'],
    maxConcurrent: 2,
  },
  'dev-oauth': {
    name: 'OAuth Integration Specialist',
    specialties: ['oauth', 'authentication', 'tokens', 'social-accounts'],
    maxConcurrent: 3,
  },
  'qa': {
    name: 'QA Tester',
    specialties: ['testing', 'validation', 'quality'],
    maxConcurrent: 2,
  },
};

/**
 * Load tasks from todo_progress.json
 */
async function loadTasks() {
  const content = await fs.readFile(TODO_FILE, 'utf-8');
  return JSON.parse(content);
}

/**
 * Save tasks to todo_progress.json
 */
async function saveTasks(tasks) {
  await fs.writeFile(TODO_FILE, JSON.stringify(tasks, null, 2) + '\n', 'utf-8');
}

/**
 * Assign tasks to agents based on story
 */
async function assignTasksForStory(storyId) {
  const tasks = await loadTasks();
  
  // Filter tasks for this story
  const storyTasks = tasks.tasks.filter(
    (t) => t.story_id === storyId && t.status === 'pending'
  );
  
  // Group tasks by type/complexity
  const taskGroups = {
    config: [], // OAuth config, setup
    service: [], // Service implementations
    routes: [], // Route handlers
    integration: [], // Integration tasks
    testing: [], // Testing tasks
  };
  
  storyTasks.forEach((task) => {
    const desc = task.description.toLowerCase();
    if (desc.includes('config') || desc.includes('oauth config')) {
      taskGroups.config.push(task);
    } else if (desc.includes('service') || desc.includes('function')) {
      taskGroups.service.push(task);
    } else if (desc.includes('route') || desc.includes('endpoint')) {
      taskGroups.routes.push(task);
    } else if (desc.includes('test') || desc.includes('validation')) {
      taskGroups.testing.push(task);
    } else {
      taskGroups.integration.push(task);
    }
  });
  
  // Assign agents
  const assignments = [];
  let agentCounter = 1;
  
  // Assign config tasks to dev-oauth-1
  taskGroups.config.forEach((task) => {
    assignments.push({
      task_id: task.task_id,
      agent_id: `dev-oauth-${agentCounter}`,
      agent_type: 'dev-oauth',
    });
  });
  
  // Assign service tasks to dev-oauth agents (round-robin)
  taskGroups.service.forEach((task, idx) => {
    const agentNum = (idx % 3) + 1;
    assignments.push({
      task_id: task.task_id,
      agent_id: `dev-oauth-${agentNum}`,
      agent_type: 'dev-oauth',
    });
  });
  
  // Assign route tasks to dev-backend agents
  taskGroups.routes.forEach((task, idx) => {
    const agentNum = (idx % 2) + 1;
    assignments.push({
      task_id: task.task_id,
      agent_id: `dev-backend-${agentNum}`,
      agent_type: 'dev-backend',
    });
  });
  
  // Assign testing tasks to qa agents
  taskGroups.testing.forEach((task, idx) => {
    const agentNum = (idx % 2) + 1;
    assignments.push({
      task_id: task.task_id,
      agent_id: `qa-${agentNum}`,
      agent_type: 'qa',
    });
  });
  
  // Update tasks with assignments
  assignments.forEach((assignment) => {
    const task = tasks.tasks.find((t) => t.task_id === assignment.task_id);
    if (task) {
      task.assigned_agent = assignment.agent_id;
      task.agent_type = assignment.agent_type;
    }
  });
  
  await saveTasks(tasks);
  
  console.log(`Assigned ${assignments.length} tasks for story ${storyId}`);
  console.log('Assignments:');
  assignments.forEach((a) => {
    console.log(`  ${a.task_id} -> ${a.agent_id} (${a.agent_type})`);
  });
  
  return assignments;
}

/**
 * Create agent prompt file for an agent
 */
async function createAgentPrompt(agentId, agentType, tasks) {
  await fs.mkdir(AGENT_PROMPTS_DIR, { recursive: true });
  
  const agentConfig = AGENT_TYPES[agentType] || AGENT_TYPES['dev-backend'];
  const agentTasks = tasks.filter((t) => t.assigned_agent === agentId);
  
  const prompt = `# Agent Prompt: ${agentId}

You are a ${agentConfig.name} agent working on parallel tasks.

## Your Agent ID
${agentId}

## Your Specialty
${agentConfig.specialties.join(', ')}

## Your Assigned Tasks

${agentTasks.map((t) => `- **${t.task_id}**: ${t.description} [${t.estimated_complexity}]`).join('\n')}

## Instructions

1. **Load Context**: Read \`plan/IMPLEMENTATION_PLAN.md\`, \`specs/linkedin-oauth-integration.md\`, and relevant code files
2. **Check Dependencies**: Verify all dependencies are complete before starting
3. **Acquire Lock**: Create \`.lock/[task_id].lock\` before starting work
4. **Update Status**: Mark task as \`in_progress\` in \`agent_tasks/todo_progress.json\`
5. **Implement**: Complete the task following coding standards
6. **Verify**: Run \`npm run type-check && npm run lint\` before committing
7. **Commit**: Commit with message \`[${agentId}] [Task ID] Description\`
8. **Release Lock**: Remove lock file when done
9. **Update Status**: Mark task as \`completed\`

## Coordination

- Check \`.lock/\` directory before starting work
- Check \`agent_comms/\` for messages from other agents
- Update \`agent_tasks/todo_progress.json\` immediately when status changes
- Communicate via \`agent_comms/\` if you need to coordinate

## Autonomous Execution

Work autonomously. Complete all your assigned tasks without waiting for user input.
If you encounter blockers, document them in \`agent_tasks/blocked_tasks.md\`.

## Start Working

Begin with your first task: ${agentTasks[0]?.task_id || 'N/A'}
`;

  const promptFile = path.join(AGENT_PROMPTS_DIR, `${agentId}.md`);
  await fs.writeFile(promptFile, prompt, 'utf-8');
  
  return promptFile;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  let storyId = args.find((a) => a.startsWith('--story'))?.split('=')[1];
  let command = args.find((a) => a === '--assign' || a === '--execute');
  
  // Alternative parsing
  if (!storyId) {
    const storyArg = args.find((a) => a.includes('story'));
    if (storyArg) {
      storyId = storyArg.split('=')[1] || storyArg.split('story')[1];
    }
  }
  
  if (!command) {
    command = args.find((a) => a.startsWith('--') && a !== '--story');
  }
  
  if (command) {
    command = command.replace('--', '');
  }
  
  if (!storyId) {
    console.error('Usage: node parallel_agent_coordinator.js --story=2.5 --assign|--execute');
    process.exit(1);
  }
  
  // Ensure directories exist
  await fs.mkdir(LOCK_DIR, { recursive: true });
  await fs.mkdir(COMMS_DIR, { recursive: true });
  await fs.mkdir(AGENT_PROMPTS_DIR, { recursive: true });
  
  if (command === 'assign') {
    const assignments = await assignTasksForStory(storyId);
    
    // Create agent prompts
    const tasks = await loadTasks();
    const agentIds = [...new Set(assignments.map((a) => a.agent_id))];
    
    for (const agentId of agentIds) {
      const agentType = assignments.find((a) => a.agent_id === agentId)?.agent_type || 'dev-backend';
      const promptFile = await createAgentPrompt(agentId, agentType, tasks.tasks);
      console.log(`Created prompt: ${promptFile}`);
    }
    
    console.log('\n✅ Task assignment complete!');
    console.log('\nTo run agents in parallel:');
    console.log('1. Open multiple Cursor windows');
    console.log('2. In each window, load the corresponding agent prompt from agent_prompts/');
    console.log('3. Agents will work autonomously using locks for coordination');
  } else if (command === 'execute') {
    console.log('Execute mode - agents should work autonomously');
    console.log('Load agent prompts from agent_prompts/ directory');
  } else {
    console.error('Unknown command. Use --assign or --execute');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { assignTasksForStory, createAgentPrompt };
