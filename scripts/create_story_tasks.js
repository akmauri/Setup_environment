#!/usr/bin/env node
/**
 * Create Story Tasks
 * 
 * Creates tasks in todo_progress.json from IMPLEMENTATION_PLAN.md for a specific story
 */

const fs = require('fs').promises;
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TODO_FILE = path.join(PROJECT_ROOT, 'agent_tasks', 'todo_progress.json');
const PLAN_FILE = path.join(PROJECT_ROOT, 'plan', 'IMPLEMENTATION_PLAN.md');

/**
 * Parse tasks from IMPLEMENTATION_PLAN.md for a story
 */
async function parseTasksFromPlan(storyId) {
  const planContent = await fs.readFile(PLAN_FILE, 'utf-8');
  
  // Find Story section
  const storyRegex = new RegExp(`### Story ${storyId.replace('.', '\\.')}:.*?\\n\\n(.*?)(?=###|## Priority|$)`, 's');
  const match = planContent.match(storyRegex);
  
  if (!match) {
    throw new Error(`Story ${storyId} not found in IMPLEMENTATION_PLAN.md`);
  }
  
  const storySection = match[1];
  
  // Extract tasks
  const taskRegex = /- \[([ x])\] Task ([\d.]+): (.+?) \[Complexity: (\w+)\] \[Dependencies: (.+?)\]/g;
  const tasks = [];
  let taskMatch;
  
  while ((taskMatch = taskRegex.exec(storySection)) !== null) {
    const [, checked, taskNum, description, complexity, deps] = taskMatch;
    const taskId = `task-${storyId.replace('.', '-')}-${taskNum}`;
    const dependencies = deps.includes('none') || deps.trim() === '' 
      ? [] 
      : deps.split(',').map(d => `task-${storyId.replace('.', '-')}-${d.trim().replace('Task ', '')}`);
    
    tasks.push({
      epic_id: null,
      story_id: storyId,
      task_id: taskId,
      description: description.trim(),
      status: checked === 'x' ? 'completed' : 'pending',
      assigned_agent: null,
      priority: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      dependencies,
      estimated_complexity: complexity.toLowerCase(),
      actual_completion_time: null,
      retry_count: 0,
      last_error: null,
    });
  }
  
  return tasks;
}

/**
 * Add tasks to todo_progress.json
 */
async function addTasksToProgress(storyId) {
  const tasks = await parseTasksFromPlan(storyId);
  const progressContent = await fs.readFile(TODO_FILE, 'utf-8');
  const progress = JSON.parse(progressContent);
  
  // Remove existing tasks for this story
  progress.tasks = progress.tasks.filter((t) => t.story_id !== storyId);
  
  // Add new tasks
  progress.tasks.push(...tasks);
  progress.last_updated = new Date().toISOString();
  
  await fs.writeFile(TODO_FILE, JSON.stringify(progress, null, 2) + '\n', 'utf-8');
  
  console.log(`Created ${tasks.length} tasks for story ${storyId}`);
  return tasks;
}

async function main() {
  const storyId = process.argv[2] || process.env.STORY_ID;
  
  if (!storyId) {
    console.error('Usage: node create_story_tasks.js <story-id>');
    console.error('   or: STORY_ID=2.5 node create_story_tasks.js');
    process.exit(1);
  }
  
  try {
    await addTasksToProgress(storyId);
    console.log(`✅ Tasks created for story ${storyId}`);
    console.log(`\nNext: Run assignment:`);
    console.log(`  node scripts/parallel_agent_coordinator.js --story=${storyId} --assign`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { parseTasksFromPlan, addTasksToProgress };
