#!/usr/bin/env node
/**
 * Autonomous Agent Loop
 * 
 * Runs an agent in an autonomous loop, continuously picking up and executing tasks.
 * This enables true parallel execution when multiple instances run simultaneously.
 * 
 * Usage:
 *   node scripts/autonomous_agent_loop.js --agent-id dev-oauth-1
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TODO_FILE = path.join(PROJECT_ROOT, 'agent_tasks', 'todo_progress.json');
const LOCK_DIR = path.join(PROJECT_ROOT, '.lock');
const COMMS_DIR = path.join(PROJECT_ROOT, 'agent_comms');
const PLAN_FILE = path.join(PROJECT_ROOT, 'plan', 'IMPLEMENTATION_PLAN.md');

const MAX_ITERATIONS = 100;
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
    
    return lock.agent_id !== process.env.AGENT_ID;
  } catch {
    return false;
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
async function dependenciesComplete(task, tasks) {
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
async function findNextTask(agentId) {
  const tasks = await loadTasks();
  const availableTasks = tasks.tasks.filter(
    (t) =>
      t.assigned_agent === agentId &&
      t.status === 'pending' &&
      !t.status === 'blocked'
  );
  
  // Sort by priority and dependencies
  const readyTasks = [];
  for (const task of availableTasks) {
    if (await dependenciesComplete(task, tasks.tasks)) {
      const isLocked = await isLocked(task.task_id);
      if (!isLocked) {
        readyTasks.push(task);
      }
    }
  }
  
  // Sort by priority (lower number = higher priority)
  readyTasks.sort((a, b) => (a.priority || 999) - (b.priority || 999));
  
  return readyTasks[0] || null;
}

/**
 * Execute task (this would be done by the agent in Cursor)
 */
async function executeTask(task, agentId) {
  console.log(`[${agentId}] Starting task: ${task.task_id} - ${task.description}`);
  
  // Update status
  const tasks = await loadTasks();
  const taskIndex = tasks.tasks.findIndex((t) => t.task_id === task.task_id);
  if (taskIndex >= 0) {
    tasks.tasks[taskIndex].status = 'in_progress';
    tasks.tasks[taskIndex].updated_at = new Date().toISOString();
    await saveTasks(tasks);
  }
  
  // In a real implementation, this would trigger the agent to work
  // For now, we just log and mark as complete (agents will do the actual work)
  console.log(`[${agentId}] Task ${task.task_id} marked as in_progress`);
  console.log(`[${agentId}] Agent should now implement: ${task.description}`);
  console.log(`[${agentId}] After implementation, agent should run verification and commit`);
  
  return { success: true, message: 'Task execution initiated' };
}

/**
 * Main loop
 */
async function main() {
  const agentId = process.env.AGENT_ID || process.argv.find((a) => a.startsWith('--agent-id='))?.split('=')[1];
  
  if (!agentId) {
    console.error('Usage: AGENT_ID=dev-oauth-1 node scripts/autonomous_agent_loop.js');
    console.error('   or: node scripts/autonomous_agent_loop.js --agent-id=dev-oauth-1');
    process.exit(1);
  }
  
  console.log(`[${agentId}] Starting autonomous agent loop`);
  console.log(`[${agentId}] Agent will continuously pick up and execute assigned tasks`);
  
  let iteration = 0;
  
  while (iteration < MAX_ITERATIONS) {
    iteration++;
    console.log(`\n[${agentId}] Iteration ${iteration}`);
    
    // Find next task
    const task = await findNextTask(agentId);
    
    if (!task) {
      console.log(`[${agentId}] No available tasks. Waiting 10 seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      continue;
    }
    
    // Acquire lock
    try {
      await acquireLock(task.task_id, agentId);
      console.log(`[${agentId}] Lock acquired for ${task.task_id}`);
    } catch (error) {
      console.log(`[${agentId}] Could not acquire lock for ${task.task_id}, skipping...`);
      continue;
    }
    
    // Execute task
    try {
      await executeTask(task, agentId);
      console.log(`[${agentId}] Task ${task.task_id} execution initiated`);
      console.log(`[${agentId}] In Cursor, agent should now implement the task`);
      console.log(`[${agentId}] After completion, agent should mark task as completed and release lock`);
    } catch (error) {
      console.error(`[${agentId}] Error executing task ${task.task_id}:`, error);
      await releaseLock(task.task_id);
    }
    
    // Wait before next iteration
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  
  console.log(`[${agentId}] Reached max iterations (${MAX_ITERATIONS})`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { findNextTask, acquireLock, releaseLock };
