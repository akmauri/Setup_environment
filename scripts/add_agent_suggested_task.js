#!/usr/bin/env node
/**
 * Add Agent-Suggested Task
 * 
 * Allows agents to create/suggest new tasks during development.
 * These tasks are automatically picked up by the orchestrator with lower priority
 * than plan tasks, but higher priority than nothing.
 * 
 * Usage:
 *   node scripts/add_agent_suggested_task.js --description "Fix memory leak in health check" --epic epic-1 --story story-1.5
 *   node scripts/add_agent_suggested_task.js --description "Add error handling" --epic epic-1 --complexity medium
 */

const fs = require('fs').promises;
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SUGGESTED_TASKS_FILE = path.join(PROJECT_ROOT, 'agent_tasks', 'suggested_tasks.json');
const TODO_FILE = path.join(PROJECT_ROOT, 'agent_tasks', 'todo_progress.json');

/**
 * Load or create suggested tasks file
 */
async function loadOrCreateSuggested() {
  try {
    const content = await fs.readFile(SUGGESTED_TASKS_FILE, 'utf-8');
    if (!content || content.trim().length === 0) {
      return { tasks: [] };
    }
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { tasks: [] };
    }
    throw error;
  }
}

/**
 * Add agent-suggested task
 */
async function addSuggestedTask(description, epicId, storyId, complexity = 'medium', dependencies = []) {
  const suggested = await loadOrCreateSuggested();
  
  // Generate unique task ID
  const timestamp = Date.now();
  const taskId = `task-agent-${timestamp}-${suggested.tasks.length}`;
  
  const task = {
    epic_id: epicId || null,
    story_id: storyId || null,
    task_id: taskId,
    description: description,
    status: 'pending',
    assigned_agent: null,
    priority: 99, // Lower priority than plan tasks
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dependencies: dependencies,
    estimated_complexity: complexity.toLowerCase(),
    actual_completion_time: null,
    retry_count: 0,
    last_error: null,
    source: 'agent-suggested', // Mark as agent-suggested for priority sorting
    notes: 'Task created by agent during development'
  };
  
  suggested.tasks.push(task);
  suggested.last_updated = new Date().toISOString();
  
  await fs.writeFile(SUGGESTED_TASKS_FILE, JSON.stringify(suggested, null, 2) + '\n', 'utf-8');
  
  // Also add directly to todo_progress.json for immediate availability
  const todoContent = await fs.readFile(TODO_FILE, 'utf-8');
  const todo = JSON.parse(todoContent);
  todo.tasks.push(task);
  todo.last_updated = new Date().toISOString();
  await fs.writeFile(TODO_FILE, JSON.stringify(todo, null, 2) + '\n', 'utf-8');
  
  console.log(`✅ Added agent-suggested task: ${taskId}`);
  console.log(`   Description: ${description}`);
  console.log(`   Epic: ${epicId || 'N/A'}, Story: ${storyId || 'N/A'}`);
  console.log(`   Complexity: ${complexity}`);
  
  return task;
}

async function main() {
  const args = process.argv.slice(2);
  
  let description = null;
  let epicId = null;
  let storyId = null;
  let complexity = 'medium';
  let dependencies = [];
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--description' && args[i + 1]) {
      description = args[i + 1];
      i++;
    } else if (args[i] === '--epic' && args[i + 1]) {
      epicId = args[i + 1];
      i++;
    } else if (args[i] === '--story' && args[i + 1]) {
      storyId = args[i + 1];
      i++;
    } else if (args[i] === '--complexity' && args[i + 1]) {
      complexity = args[i + 1];
      i++;
    } else if (args[i] === '--dependencies' && args[i + 1]) {
      dependencies = args[i + 1].split(',').map(d => d.trim());
      i++;
    }
  }
  
  if (!description) {
    console.error('Usage: node scripts/add_agent_suggested_task.js --description "Task description" [--epic epic-1] [--story story-1.5] [--complexity low|medium|high] [--dependencies task-1,task-2]');
    process.exit(1);
  }
  
  try {
    await addSuggestedTask(description, epicId, storyId, complexity, dependencies);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { addSuggestedTask };
