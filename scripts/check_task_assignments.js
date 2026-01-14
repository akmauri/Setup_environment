#!/usr/bin/env node
/**
 * Check task assignments for PR validation
 * 
 * Usage: node scripts/check_task_assignments.js
 */

const fs = require('fs');
const path = require('path');

const TODO_PROGRESS_PATH = path.join(__dirname, '..', 'agent_tasks', 'todo_progress.json');

function main() {
  if (!fs.existsSync(TODO_PROGRESS_PATH)) {
    console.log('⚠️ todo_progress.json not found');
    process.exit(0);
  }
  
  try {
    const content = fs.readFileSync(TODO_PROGRESS_PATH, 'utf-8');
    const data = JSON.parse(content);
    
    if (!data.tasks || !Array.isArray(data.tasks)) {
      console.log('⚠️ Invalid task structure');
      process.exit(0);
    }
    
    // Check for in_progress tasks without assignments
    const unassignedInProgress = data.tasks.filter(
      t => t.status === 'in_progress' && !t.assigned_agent
    );
    
    if (unassignedInProgress.length > 0) {
      console.log(`⚠️ Found ${unassignedInProgress.length} in_progress tasks without assigned agents:`);
      unassignedInProgress.forEach(t => {
        console.log(`   - ${t.task_id}: ${t.description}`);
      });
    } else {
      console.log('✅ All in_progress tasks have assigned agents');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking assignments:', error.message);
    process.exit(0); // Don't fail PR for this
  }
}

if (require.main === module) {
  main();
}

module.exports = {};
