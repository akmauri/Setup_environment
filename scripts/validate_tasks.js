#!/usr/bin/env node
/**
 * Validate task management system
 * 
 * Usage: node scripts/validate_tasks.js
 */

const fs = require('fs');
const path = require('path');

const TODO_PROGRESS_PATH = path.join(__dirname, '..', 'agent_tasks', 'todo_progress.json');
const COMPLETED_TASKS_PATH = path.join(__dirname, '..', 'agent_tasks', 'completed_tasks.json');

function validateTaskSchema(task) {
  const required = ['task_id', 'description', 'status', 'priority', 'created_at', 'updated_at'];
  const missing = required.filter(field => !task[field]);
  
  if (missing.length > 0) {
    return { valid: false, errors: [`Missing required fields: ${missing.join(', ')}`] };
  }
  
  const errors = [];
  
  // Validate status
  const validStatuses = ['pending', 'in_progress', 'review', 'blocked', 'completed', 'deferred'];
  if (!validStatuses.includes(task.status)) {
    errors.push(`Invalid status: ${task.status}`);
  }
  
  // Validate priority
  if (typeof task.priority !== 'number' || task.priority < 1 || task.priority > 5) {
    errors.push(`Invalid priority: ${task.priority} (must be 1-5)`);
  }
  
  // Validate complexity
  const validComplexities = ['low', 'medium', 'high'];
  if (task.estimated_complexity && !validComplexities.includes(task.estimated_complexity)) {
    errors.push(`Invalid complexity: ${task.estimated_complexity}`);
  }
  
  // Validate timestamps
  if (isNaN(Date.parse(task.created_at))) {
    errors.push(`Invalid created_at: ${task.created_at}`);
  }
  if (isNaN(Date.parse(task.updated_at))) {
    errors.push(`Invalid updated_at: ${task.updated_at}`);
  }
  
  return { valid: errors.length === 0, errors };
}

function validateDependencies(tasks) {
  const taskIds = new Set(tasks.map(t => t.task_id));
  const errors = [];
  
  for (const task of tasks) {
    if (task.dependencies && Array.isArray(task.dependencies)) {
      for (const depId of task.dependencies) {
        if (!taskIds.has(depId)) {
          errors.push(`Task ${task.task_id} has dependency ${depId} that doesn't exist`);
        }
      }
    }
  }
  
  return errors;
}

function main() {
  console.log('Validating task management system...\n');
  
  let hasErrors = false;
  
  // Validate todo_progress.json
  if (!fs.existsSync(TODO_PROGRESS_PATH)) {
    console.error('❌ todo_progress.json not found');
    process.exit(1);
  }
  
  try {
    const content = fs.readFileSync(TODO_PROGRESS_PATH, 'utf-8');
    const data = JSON.parse(content);
    
    if (!data.tasks || !Array.isArray(data.tasks)) {
      console.error('❌ Invalid todo_progress.json structure');
      process.exit(1);
    }
  
    console.log(`Found ${data.tasks.length} tasks\n`);
    
    // Validate each task
    for (const task of data.tasks) {
      const validation = validateTaskSchema(task);
      if (!validation.valid) {
        console.error(`❌ Task ${task.task_id}:`);
        validation.errors.forEach(err => console.error(`   - ${err}`));
        hasErrors = true;
      }
    }
    
    // Validate dependencies
    const depErrors = validateDependencies(data.tasks);
    if (depErrors.length > 0) {
      console.error('❌ Dependency errors:');
      depErrors.forEach(err => console.error(`   - ${err}`));
      hasErrors = true;
    }
    
    // Validate completed_tasks.json if exists
    if (fs.existsSync(COMPLETED_TASKS_PATH)) {
      const completedContent = fs.readFileSync(COMPLETED_TASKS_PATH, 'utf-8');
      const completedData = JSON.parse(completedContent);
      
      if (completedData.completed_tasks && Array.isArray(completedData.completed_tasks)) {
        console.log(`Found ${completedData.completed_tasks.length} completed tasks`);
      }
    }
    
    if (hasErrors) {
      console.error('\n❌ Validation failed');
      process.exit(1);
    } else {
      console.log('✅ All tasks validated successfully');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error validating tasks:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateTaskSchema, validateDependencies };
