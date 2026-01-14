#!/usr/bin/env node
/**
 * Dependency checker - verifies task dependencies are complete
 * 
 * Usage:
 *   node scripts/check_dependencies.js <task_id>        # Check dependencies for task
 *   node scripts/check_dependencies.js all              # Check all tasks
 *   node scripts/check_dependencies.js blocking         # Find blocking tasks
 */

const fs = require('fs');
const path = require('path');

const TODO_PROGRESS_PATH = path.join(__dirname, '..', 'agent_tasks', 'todo_progress.json');

function loadTasks() {
  if (!fs.existsSync(TODO_PROGRESS_PATH)) {
    return { tasks: [] };
  }
  const content = fs.readFileSync(TODO_PROGRESS_PATH, 'utf-8');
  return JSON.parse(content);
}

function findTask(tasks, taskId) {
  return tasks.find(t => t.task_id === taskId);
}

function checkTaskDependencies(task, allTasks) {
  if (!task.dependencies || task.dependencies.length === 0) {
    return { complete: true, missing: [] };
  }
  
  const missing = [];
  for (const depId of task.dependencies) {
    const depTask = findTask(allTasks, depId);
    if (!depTask) {
      missing.push({ id: depId, reason: 'Task not found' });
    } else if (depTask.status !== 'completed') {
      missing.push({ id: depId, reason: `Status: ${depTask.status}` });
    }
  }
  
  return {
    complete: missing.length === 0,
    missing
  };
}

function checkTask(taskId) {
  const data = loadTasks();
  const task = findTask(data.tasks, taskId);
  
  if (!task) {
    console.error(`Task ${taskId} not found`);
    return;
  }
  
  console.log(`Checking dependencies for task: ${taskId}`);
  console.log(`Description: ${task.description}`);
  console.log(`Status: ${task.status}`);
  
  if (!task.dependencies || task.dependencies.length === 0) {
    console.log('✅ No dependencies');
    return;
  }
  
  console.log(`\nDependencies (${task.dependencies.length}):`);
  const result = checkTaskDependencies(task, data.tasks);
  
  if (result.complete) {
    console.log('✅ All dependencies complete');
  } else {
    console.log('❌ Missing dependencies:');
    result.missing.forEach(m => {
      console.log(`  - ${m.id}: ${m.reason}`);
    });
  }
}

function checkAll() {
  const data = loadTasks();
  const incomplete = [];
  
  console.log(`Checking dependencies for ${data.tasks.length} tasks...\n`);
  
  for (const task of data.tasks) {
    if (task.status === 'completed' || task.status === 'deferred') {
      continue;
    }
    
    const result = checkTaskDependencies(task, data.tasks);
    if (!result.complete) {
      incomplete.push({ task, missing: result.missing });
    }
  }
  
  if (incomplete.length === 0) {
    console.log('✅ All tasks have complete dependencies');
  } else {
    console.log(`❌ ${incomplete.length} tasks with incomplete dependencies:\n`);
    incomplete.forEach(({ task, missing }) => {
      console.log(`Task: ${task.task_id}`);
      console.log(`  Description: ${task.description}`);
      console.log(`  Missing dependencies:`);
      missing.forEach(m => {
        console.log(`    - ${m.id}: ${m.reason}`);
      });
      console.log();
    });
  }
}

function findBlocking() {
  const data = loadTasks();
  const blocking = new Map();
  
  // Find all blocked tasks
  const blocked = data.tasks.filter(t => t.status === 'blocked');
  
  // For each incomplete task, find what's blocking it
  for (const task of data.tasks) {
    if (task.status === 'completed' || task.status === 'deferred') {
      continue;
    }
    
    const result = checkTaskDependencies(task, data.tasks);
    if (!result.complete) {
      for (const missing of result.missing) {
        if (!blocking.has(missing.id)) {
          blocking.set(missing.id, []);
        }
        blocking.get(missing.id).push(task.task_id);
      }
    }
  }
  
  if (blocking.size === 0) {
    console.log('✅ No blocking tasks found');
    return;
  }
  
  console.log(`Found ${blocking.size} tasks that are blocking others:\n`);
  
  for (const [blockingId, blockedTasks] of blocking.entries()) {
    const blockingTask = findTask(data.tasks, blockingId);
    console.log(`Task: ${blockingId}`);
    console.log(`  Description: ${blockingTask?.description || 'Unknown'}`);
    console.log(`  Status: ${blockingTask?.status || 'Unknown'}`);
    console.log(`  Blocking ${blockedTasks.length} task(s):`);
    blockedTasks.forEach(bt => {
      console.log(`    - ${bt}`);
    });
    console.log();
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'all':
      checkAll();
      break;
      
    case 'blocking':
      findBlocking();
      break;
      
    default:
      if (command) {
        checkTask(command);
      } else {
        console.log('Usage:');
        console.log('  node scripts/check_dependencies.js <task_id>');
        console.log('  node scripts/check_dependencies.js all');
        console.log('  node scripts/check_dependencies.js blocking');
        process.exit(1);
      }
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkTaskDependencies, findTask, loadTasks };
