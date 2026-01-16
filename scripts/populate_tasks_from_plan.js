#!/usr/bin/env node
/**
 * Populate Tasks from Implementation Plan
 * 
 * Reads IMPLEMENTATION_PLAN.md and populates todo_progress.json with all tasks.
 * This ensures the orchestrator always has tasks available.
 * 
 * Usage:
 *   node scripts/populate_tasks_from_plan.js
 *   node scripts/populate_tasks_from_plan.js --epic epic-1
 *   node scripts/populate_tasks_from_plan.js --story 1.1
 */

const fs = require('fs').promises;
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TODO_FILE = path.join(PROJECT_ROOT, 'agent_tasks', 'todo_progress.json');
const PLAN_FILE = path.join(PROJECT_ROOT, 'plan', 'IMPLEMENTATION_PLAN.md');
const PRD_FILE = path.join(PROJECT_ROOT, 'docs', 'prd.md');

/**
 * Extract epic number from story ID (e.g., "1.1" -> "epic-1")
 */
function getEpicId(storyId) {
  if (!storyId) return null;
  const epicNum = storyId.split('.')[0];
  return `epic-${epicNum}`;
}

/**
 * Parse tasks from IMPLEMENTATION_PLAN.md
 */
async function parseAllTasksFromPlan() {
  const planContent = await fs.readFile(PLAN_FILE, 'utf-8');
  const tasks = [];
  
  // Find all Story sections - more flexible regex
  const storyRegex = /### Story ([\d.]+):\s*(.+?)(?=### Story |## Priority|$)/gs;
  let storyMatch;
  
  while ((storyMatch = storyRegex.exec(planContent)) !== null) {
    const [, storyId, storySection] = storyMatch;
    
    // Extract epic name and status from story section
    const epicMatch = storySection.match(/Epic[:\s]+(.+?)(?:\n|$)/);
    const statusMatch = storySection.match(/Status[:\s]+(.+?)(?:\n|$)/);
    const epicName = epicMatch ? epicMatch[1].trim() : 'Unknown';
    const storyStatus = statusMatch ? statusMatch[1].trim() : 'Unknown';
    
    const epicId = getEpicId(storyId);
    
    // Extract tasks from this story - handle multiline descriptions
    const taskRegex = /- \[([ x])\] Task ([\d.]+):\s*(.+?)\s+\[Complexity:\s+(\w+)\]\s+\[Dependencies:\s+(.+?)\](?=\n- \[|$)/gs;
    let taskMatch;
    let taskIndex = 0;
    
    while ((taskMatch = taskRegex.exec(storySection)) !== null) {
      const [, checked, taskNum, description, complexity, deps] = taskMatch;
      
      // Generate unique task ID
      const timestamp = Date.now();
      const taskId = `task-${timestamp}-${taskIndex++}`;
      
      // Parse dependencies
      const dependencies = deps.includes('none') || deps.trim() === '' || deps.trim() === 'none'
        ? []
        : deps.split(',').map(d => {
            const depTaskNum = d.trim().replace('Task ', '').replace('task-', '');
            // Find the dependency task ID (we'll need to match by story + task number)
            return `task-${storyId.replace('.', '-')}-${depTaskNum}`;
          }).filter(Boolean);
      
      tasks.push({
        epic_id: epicId,
        story_id: `story-${storyId}`,
        task_id: taskId,
        description: description.trim(),
        status: checked === 'x' ? 'completed' : 'pending',
        assigned_agent: null,
        priority: parseInt(storyId.split('.')[0]), // Epic number as priority
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        dependencies: dependencies,
        estimated_complexity: complexity.toLowerCase(),
        actual_completion_time: checked === 'x' ? new Date().toISOString() : null,
        retry_count: 0,
        last_error: null,
        notes: storyStatus === 'Complete' ? 'Story marked as complete in plan' : null
      });
    }
  }
  
  return tasks;
}

/**
 * Load or create todo_progress.json
 */
async function loadOrCreateTodo() {
  try {
    const content = await fs.readFile(TODO_FILE, 'utf-8');
    if (!content || content.trim().length === 0) {
      throw new Error('File is empty');
    }
    return JSON.parse(content);
  } catch (error) {
    // Create new structure
    return {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "description": "Machine-readable task list for AI agent coordination",
      "version": "1.0.0",
      "last_updated": new Date().toISOString(),
      "tasks": []
    };
  }
}

/**
 * Merge tasks intelligently (preserve existing status, update descriptions)
 */
function mergeTasks(existingTasks, newTasks) {
  const existingMap = new Map();
  existingTasks.forEach(t => {
    // Key by story_id + description (first 50 chars) to match tasks
    const key = `${t.story_id}:${t.description.substring(0, 50)}`;
    existingMap.set(key, t);
  });
  
  const merged = [];
  const seenKeys = new Set();
  
  // Add existing tasks first (preserve their status)
  existingTasks.forEach(t => {
    const key = `${t.story_id}:${t.description.substring(0, 50)}`;
    if (!seenKeys.has(key)) {
      merged.push(t);
      seenKeys.add(key);
    }
  });
  
  // Add new tasks that don't exist
  newTasks.forEach(t => {
    const key = `${t.story_id}:${t.description.substring(0, 50)}`;
    if (!seenKeys.has(key)) {
      merged.push(t);
      seenKeys.add(key);
    } else {
      // Update existing task if needed (but preserve status if it's completed/in_progress)
      const existing = existingMap.get(key);
      if (existing && existing.status === 'pending') {
        // Update description and other fields, but keep status
        Object.assign(existing, {
          description: t.description,
          dependencies: t.dependencies,
          estimated_complexity: t.estimated_complexity,
          updated_at: new Date().toISOString()
        });
      }
    }
  });
  
  return merged;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const epicFilter = args.includes('--epic') ? args[args.indexOf('--epic') + 1] : null;
  const storyFilter = args.includes('--story') ? args[args.indexOf('--story') + 1] : null;
  
  console.log('📋 Populating tasks from IMPLEMENTATION_PLAN.md...\n');
  
  try {
    // Load existing tasks
    const todo = await loadOrCreateTodo();
    const existingTasks = todo.tasks || [];
    
    // Parse new tasks from plan
    const newTasks = await parseAllTasksFromPlan();
    
    // Filter if needed
    let filteredTasks = newTasks;
    if (epicFilter) {
      filteredTasks = filteredTasks.filter(t => t.epic_id === epicFilter);
      console.log(`Filtering by epic: ${epicFilter}`);
    }
    if (storyFilter) {
      filteredTasks = filteredTasks.filter(t => t.story_id === `story-${storyFilter}`);
      console.log(`Filtering by story: ${storyFilter}`);
    }
    
    // Merge tasks
    const mergedTasks = mergeTasks(existingTasks, filteredTasks);
    
    // Update todo
    todo.tasks = mergedTasks;
    todo.last_updated = new Date().toISOString();
    
    // Save
    await fs.writeFile(TODO_FILE, JSON.stringify(todo, null, 2) + '\n', 'utf-8');
    
    const added = filteredTasks.length;
    const total = mergedTasks.length;
    const pending = mergedTasks.filter(t => t.status === 'pending').length;
    const completed = mergedTasks.filter(t => t.status === 'completed').length;
    
    console.log(`✅ Successfully populated todo_progress.json`);
    console.log(`   Added/Updated: ${added} tasks`);
    console.log(`   Total tasks: ${total}`);
    console.log(`   Pending: ${pending}`);
    console.log(`   Completed: ${completed}`);
    console.log(`\n📁 File: ${TODO_FILE}`);
    
    // Show epic/story breakdown
    const epicBreakdown = {};
    const storyBreakdown = {};
    mergedTasks.forEach(t => {
      if (t.epic_id) {
        epicBreakdown[t.epic_id] = (epicBreakdown[t.epic_id] || 0) + 1;
      }
      if (t.story_id) {
        storyBreakdown[t.story_id] = (storyBreakdown[t.story_id] || 0) + 1;
      }
    });
    
    console.log(`\n📊 Epic Breakdown:`);
    Object.entries(epicBreakdown).sort().forEach(([epic, count]) => {
      console.log(`   ${epic}: ${count} tasks`);
    });
    
    console.log(`\n📊 Story Breakdown (first 10):`);
    Object.entries(storyBreakdown).sort().slice(0, 10).forEach(([story, count]) => {
      console.log(`   ${story}: ${count} tasks`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { parseAllTasksFromPlan, loadOrCreateTodo, mergeTasks };
