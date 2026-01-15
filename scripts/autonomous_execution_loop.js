#!/usr/bin/env node
/**
 * Autonomous Execution Loop
 * 
 * Runs continuously, picking up tasks and executing them autonomously.
 * Works through all assigned tasks until complete.
 * 
 * Usage:
 *   node scripts/autonomous_execution_loop.js --agent-id dev-oauth-1
 *   node scripts/autonomous_execution_loop.js --all-agents
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TODO_FILE = path.join(PROJECT_ROOT, 'agent_tasks', 'todo_progress.json');
const LOCK_DIR = path.join(PROJECT_ROOT, '.lock');
const PLAN_FILE = path.join(PROJECT_ROOT, 'plan', 'IMPLEMENTATION_PLAN.md');

const LOCK_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Load tasks
 */
async function loadTasks() {
  const content = await fs.readFile(TODO_FILE, 'utf-8');
  return JSON.parse(content);
}

/**
 * Save tasks
 */
async function saveTasks(tasks) {
  await fs.writeFile(TODO_FILE, JSON.stringify(tasks, null, 2) + '\n', 'utf-8');
}

/**
 * Check if lock exists and is valid
 */
async function isLocked(taskId) {
  const lockFile = path.join(LOCK_DIR, `${taskId}.lock`);
  try {
    const content = await fs.readFile(lockFile, 'utf-8');
    const lock = JSON.parse(content);
    const now = Date.now();
    const expiresAt = new Date(lock.expires_at).getTime();
    
    if (now > expiresAt) {
      // Lock expired, remove it
      await fs.unlink(lockFile);
      return false;
    }
    
    return true; // Lock exists and is valid
  } catch {
    return false; // No lock
  }
}

/**
 * Acquire lock
 */
async function acquireLock(taskId, agentId) {
  const lockFile = path.join(LOCK_DIR, `${taskId}.lock`);
  const lock = {
    task_id: taskId,
    agent_id: agentId,
    locked_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + LOCK_TIMEOUT).toISOString(),
  };
  
  await fs.mkdir(LOCK_DIR, { recursive: true });
  await fs.writeFile(lockFile, JSON.stringify(lock, null, 2) + '\n', 'utf-8');
}

/**
 * Release lock
 */
async function releaseLock(taskId) {
  const lockFile = path.join(LOCK_DIR, `${taskId}.lock`);
  try {
    await fs.unlink(lockFile);
  } catch {
    // Lock file may not exist
  }
}

/**
 * Check if dependencies are complete
 */
function dependenciesComplete(task, tasks) {
  if (!task.dependencies || task.dependencies.length === 0) {
    return true;
  }
  
  for (const depId of task.dependencies) {
    const depTask = tasks.find((t) => t.task_id === depId);
    if (!depTask || depTask.status !== 'completed') {
      return false;
    }
  }
  
  return true;
}

/**
 * Find next available task for agent
 */
async function findNextTask(agentId, tasks) {
  const availableTasks = tasks.filter(
    (t) =>
      t.assigned_agent === agentId &&
      t.status === 'pending' &&
      t.status !== 'blocked'
  );
  
  // Sort by priority and dependencies
  const readyTasks = [];
  for (const task of availableTasks) {
    if (dependenciesComplete(task, tasks)) {
      readyTasks.push(task);
    }
  }
  
  // Sort by priority (lower number = higher priority)
  readyTasks.sort((a, b) => (a.priority || 999) - (b.priority || 999));
  
  // Check locks
  for (const task of readyTasks) {
    const locked = await isLocked(task.task_id);
    if (!locked) {
      return task;
    }
  }
  
  return null;
}

/**
 * Update task status
 */
async function updateTaskStatus(taskId, status, agentId) {
  const tasks = await loadTasks();
  const taskIndex = tasks.tasks.findIndex((t) => t.task_id === taskId);
  if (taskIndex >= 0) {
    tasks.tasks[taskIndex].status = status;
    tasks.tasks[taskIndex].updated_at = new Date().toISOString();
    if (status === 'completed') {
      tasks.tasks[taskIndex].actual_completion_time = new Date().toISOString();
    }
    if (status === 'in_progress' && agentId) {
      tasks.tasks[taskIndex].assigned_agent = agentId;
    }
    await saveTasks(tasks);
  }
}

/**
 * Main autonomous loop
 */
async function autonomousLoop(agentId) {
  console.log(`\n🤖 Starting autonomous execution loop for: ${agentId}`);
  console.log(`📋 Agent will work continuously until all assigned tasks are complete\n`);
  
  let iteration = 0;
  let consecutiveNoTasks = 0;
  const MAX_NO_TASKS = 10; // Exit if no tasks found 10 times in a row
  
  while (consecutiveNoTasks < MAX_NO_TASKS) {
    iteration++;
    console.log(`\n--- Iteration ${iteration} ---`);
    
    const tasks = await loadTasks();
    const task = await findNextTask(agentId, tasks.tasks);
    
    if (!task) {
      consecutiveNoTasks++;
      console.log(`⏸️  No available tasks (${consecutiveNoTasks}/${MAX_NO_TASKS})`);
      
      // Check if all tasks are complete
      const myTasks = tasks.tasks.filter((t) => t.assigned_agent === agentId);
      const completed = myTasks.filter((t) => t.status === 'completed').length;
      const total = myTasks.length;
      
      if (completed === total && total > 0) {
        console.log(`\n✅ All tasks complete! (${completed}/${total})`);
        break;
      }
      
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }
    
    consecutiveNoTasks = 0; // Reset counter
    
    console.log(`📌 Selected: ${task.task_id} - ${task.description}`);
    
    // Acquire lock
    try {
      await acquireLock(task.task_id, agentId);
      console.log(`🔒 Lock acquired`);
    } catch (error) {
      console.log(`❌ Could not acquire lock, skipping...`);
      continue;
    }
    
    // Update status
    await updateTaskStatus(task.task_id, 'in_progress', agentId);
    console.log(`🔄 Status: in_progress`);
    
    // Execute task (this would trigger the agent to work)
    console.log(`\n🚀 EXECUTING TASK: ${task.task_id}`);
    console.log(`   Description: ${task.description}`);
    console.log(`   Complexity: ${task.estimated_complexity}`);
    console.log(`\n   → Agent should now implement this task`);
    console.log(`   → After implementation, agent should:`);
    console.log(`      1. Run verification (npm run type-check && npm run lint)`);
    console.log(`      2. Commit changes`);
    console.log(`      3. Mark task as completed`);
    console.log(`      4. Release lock`);
    console.log(`\n   → Then this loop will pick up the next task automatically\n`);
    
    // Wait a bit before checking for next task
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  
  console.log(`\n🏁 Autonomous loop complete for ${agentId}`);
}

/**
 * Run all agents in sequence (simulated parallel)
 */
async function runAllAgents() {
  const agentIds = ['dev-oauth-1', 'dev-oauth-2', 'dev-oauth-3', 'dev-backend-1', 'dev-backend-2', 'qa-1'];
  
  console.log(`\n🚀 Starting autonomous execution for all agents`);
  console.log(`📊 Agents: ${agentIds.join(', ')}\n`);
  
  // Run agents in sequence, but they'll work on different tasks
  // In true parallel, these would run simultaneously
  for (const agentId of agentIds) {
    await autonomousLoop(agentId);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const agentId = args.find((a) => a.startsWith('--agent-id='))?.split('=')[1];
  const allAgents = args.includes('--all-agents');
  
  if (allAgents) {
    await runAllAgents();
  } else if (agentId) {
    await autonomousLoop(agentId);
  } else {
    console.error('Usage:');
    console.error('  node scripts/autonomous_execution_loop.js --agent-id=dev-oauth-1');
    console.error('  node scripts/autonomous_execution_loop.js --all-agents');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { autonomousLoop, findNextTask, acquireLock, releaseLock };
