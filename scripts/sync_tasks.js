#!/usr/bin/env node
/**
 * Sync Tasks to todo_progress.json
 * 
 * Synchronizes tasks from various sources (IMPLEMENTATION_PLAN.md, story files, etc.)
 * into todo_progress.json to ensure orchestrator always has current tasks.
 * 
 * This script should be run:
 * - After story creation/updates
 * - After task breakdown
 * - Periodically to keep todo_progress.json in sync
 * 
 * Usage:
 *   node scripts/sync_tasks.js
 *   node scripts/sync_tasks.js --watch (runs continuously, syncs every 5 minutes)
 */

const { parseAllTasksFromPlan, loadOrCreateTodo, mergeTasks } = require('./populate_tasks_from_plan');
const { extractEpicsFromPRD, extractStoriesFromPRD, getTasksFromTodo } = require('./validate_epic_story_task_completeness');
const fs = require('fs').promises;
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TODO_FILE = path.join(PROJECT_ROOT, 'agent_tasks', 'todo_progress.json');

/**
 * Sync tasks from all sources
 */
async function syncTasks() {
  console.log('🔄 Syncing tasks to todo_progress.json...\n');
  
  try {
    // 1. Populate from IMPLEMENTATION_PLAN.md
    console.log('1️⃣  Syncing from IMPLEMENTATION_PLAN.md...');
    const { main: populateMain } = require('./populate_tasks_from_plan');
    await populateMain();
    
    // 2. Validate completeness
    console.log('\n2️⃣  Validating completeness...');
    const { main: validateMain } = require('./validate_epic_story_task_completeness');
    const isValid = await validateMain();
    
    if (!isValid) {
      console.log('\n⚠️  Validation found issues. Review output above.');
    }
    
    // 3. Ensure file exists and is valid
    const content = await fs.readFile(TODO_FILE, 'utf-8');
    const todo = JSON.parse(content);
    
    console.log(`\n✅ Sync complete!`);
    console.log(`   Total tasks: ${todo.tasks.length}`);
    console.log(`   Pending: ${todo.tasks.filter(t => t.status === 'pending').length}`);
    console.log(`   In Progress: ${todo.tasks.filter(t => t.status === 'in_progress').length}`);
    console.log(`   Completed: ${todo.tasks.filter(t => t.status === 'completed').length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

/**
 * Watch mode - sync every 5 minutes
 */
async function watchMode() {
  console.log('👀 Watch mode: Syncing every 5 minutes...\n');
  console.log('Press Ctrl+C to stop\n');
  
  // Initial sync
  await syncTasks();
  
  // Sync every 5 minutes
  setInterval(async () => {
    console.log(`\n[${new Date().toLocaleString()}] Auto-syncing...`);
    await syncTasks();
  }, 5 * 60 * 1000);
}

async function main() {
  const args = process.argv.slice(2);
  const watch = args.includes('--watch');
  
  if (watch) {
    await watchMode();
    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\n\n👋 Stopping watch mode...');
      process.exit(0);
    });
  } else {
    const success = await syncTasks();
    process.exit(success ? 0 : 1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { syncTasks };
