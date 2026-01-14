#!/usr/bin/env node
/**
 * Migration script to convert docs/TASKS.md to agent_tasks/todo_progress.json
 * 
 * Usage: node scripts/migrate_tasks.js
 */

const fs = require('fs');
const path = require('path');

const TASKS_MD_PATH = path.join(__dirname, '..', 'docs', 'TASKS.md');
const TODO_PROGRESS_PATH = path.join(__dirname, '..', 'agent_tasks', 'todo_progress.json');

// Status mapping from markdown to JSON
const STATUS_MAP = {
  '[PENDING]': 'pending',
  '[IN_PROGRESS]': 'in_progress',
  '[REVIEW]': 'review',
  '[BLOCKED]': 'blocked',
  '[COMPLETED]': 'completed',
  '[DEFERRED]': 'deferred'
};

function parseTasksMarkdown(content) {
  const tasks = [];
  const lines = content.split('\n');
  
  let currentEpic = null;
  let currentStory = null;
  let taskCounter = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect Epic
    if (line.startsWith('## Epic')) {
      const epicMatch = line.match(/Epic (\d+):\s*(.+)/);
      if (epicMatch) {
        currentEpic = {
          id: `epic-${epicMatch[1]}`,
          name: epicMatch[2]
        };
        currentStory = null;
      }
    }
    
    // Detect Story
    if (line.startsWith('### Story')) {
      const storyMatch = line.match(/Story (\d+\.\d+):\s*(.+)/);
      if (storyMatch) {
        currentStory = {
          id: `story-${storyMatch[1]}`,
          name: storyMatch[2]
        };
      }
    }
    
    // Detect task line
    if (line.startsWith('- `[') && line.includes(']`')) {
      const statusMatch = line.match(/`\[(\w+)\]`\s*(.+)/);
      if (statusMatch) {
        const status = STATUS_MAP[`[${statusMatch[1]}]`] || 'pending';
        const description = statusMatch[2].trim();
        
        taskCounter++;
        const taskId = `task-${Date.now()}-${taskCounter}`;
        
        tasks.push({
          epic_id: currentEpic?.id || null,
          story_id: currentStory?.id || null,
          task_id: taskId,
          description: description,
          status: status,
          assigned_agent: null,
          priority: determinePriority(description, currentEpic),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          dependencies: [],
          estimated_complexity: estimateComplexity(description),
          actual_completion_time: null,
          retry_count: 0,
          last_error: null
        });
      }
    }
  }
  
  return tasks;
}

function determinePriority(description, epic) {
  // Infrastructure tasks are high priority
  if (description.includes('Set up') || description.includes('Configure') || description.includes('Initialize')) {
    return 1;
  }
  // Epic 1 (Auth) is high priority
  if (epic?.id === 'epic-1') {
    return 1;
  }
  // Testing tasks are medium priority
  if (description.includes('test') || description.includes('Test')) {
    return 3;
  }
  // Default medium priority
  return 3;
}

function estimateComplexity(description) {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('set up') || lowerDesc.includes('configure') || lowerDesc.includes('create') && !lowerDesc.includes('component')) {
    return 'low';
  }
  if (lowerDesc.includes('implement') || lowerDesc.includes('create component') || lowerDesc.includes('integration')) {
    return 'medium';
  }
  if (lowerDesc.includes('design') || lowerDesc.includes('architecture') || lowerDesc.includes('system')) {
    return 'high';
  }
  
  return 'medium';
}

function main() {
  try {
    console.log('Reading TASKS.md...');
    const tasksContent = fs.readFileSync(TASKS_MD_PATH, 'utf-8');
    
    console.log('Parsing tasks...');
    const tasks = parseTasksMarkdown(tasksContent);
    
    console.log(`Found ${tasks.length} tasks`);
    
    // Read existing todo_progress.json if it exists
    let existingData = { tasks: [] };
    if (fs.existsSync(TODO_PROGRESS_PATH)) {
      const existingContent = fs.readFileSync(TODO_PROGRESS_PATH, 'utf-8');
      existingData = JSON.parse(existingContent);
    }
    
    // Merge tasks (avoid duplicates by description)
    const existingDescriptions = new Set(existingData.tasks.map(t => t.description));
    const newTasks = tasks.filter(t => !existingDescriptions.has(t.description));
    
    existingData.tasks = [...existingData.tasks, ...newTasks];
    existingData.last_updated = new Date().toISOString();
    existingData.version = '1.0.0';
    
    console.log(`Adding ${newTasks.length} new tasks...`);
    
    // Write updated JSON
    fs.writeFileSync(TODO_PROGRESS_PATH, JSON.stringify(existingData, null, 2));
    
    console.log(`✅ Migration complete! ${newTasks.length} tasks added to todo_progress.json`);
    console.log(`Total tasks: ${existingData.tasks.length}`);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseTasksMarkdown, determinePriority, estimateComplexity };
