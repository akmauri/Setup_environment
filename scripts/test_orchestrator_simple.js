#!/usr/bin/env node
/**
 * Simple Orchestrator Test
 * 
 * Tests if orchestrator can find tasks and agents
 */

const fs = require('fs').promises;
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TODO_FILE = path.join(PROJECT_ROOT, 'agent_tasks', 'todo_progress.json');
const AGENT_PROMPTS_DIR = path.join(PROJECT_ROOT, 'agent_prompts');

async function test() {
  console.log('🧪 Testing Orchestrator Setup...\n');

  // Test 1: Load tasks
  console.log('1. Loading tasks...');
  const todoContent = await fs.readFile(TODO_FILE, 'utf-8');
  const todo = JSON.parse(todoContent);
  const allTasks = todo.tasks || [];
  console.log(`   ✅ Loaded ${allTasks.length} total tasks\n`);

  // Test 2: Filter by epic-1
  console.log('2. Filtering by epic-1...');
  const epic1Tasks = allTasks.filter(t => t.epic_id === 'epic-1');
  console.log(`   ✅ Found ${epic1Tasks.length} tasks for epic-1\n`);

  // Test 3: Filter by status
  console.log('3. Filtering by status (pending/in_progress)...');
  const pendingTasks = epic1Tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  console.log(`   ✅ Found ${pendingTasks.length} pending/in_progress tasks\n`);

  // Test 4: Test group extraction
  console.log('4. Testing group extraction...');
  const groupsFound = new Set();
  for (const task of pendingTasks.slice(0, 10)) {
    const group = extractGroup(task);
    if (group) groupsFound.add(group);
    console.log(`   Task ${task.task_id}: group=${group || 'null'}, desc="${task.description.substring(0, 40)}..."`);
  }
  console.log(`   ✅ Found groups: ${Array.from(groupsFound).join(', ') || 'none'}\n`);

  // Test 5: Check agent prompt files
  console.log('5. Checking agent prompt files...');
  const promptFiles = await fs.readdir(AGENT_PROMPTS_DIR);
  const mdFiles = promptFiles.filter(f => f.endsWith('.md'));
  console.log(`   ✅ Found ${mdFiles.length} prompt files: ${mdFiles.join(', ')}\n`);

  // Test 6: Show first few tasks that would be processed
  console.log('6. Tasks that would be processed (first 5):');
  const tasksToProcess = pendingTasks.slice(0, 5);
  for (const task of tasksToProcess) {
    const group = extractGroup(task);
    console.log(`   - ${task.task_id}: ${task.description.substring(0, 50)}`);
    console.log(`     Group: ${group || 'none'}, Priority: ${task.priority}, Dependencies: ${(task.dependencies || []).length}`);
  }

  console.log('\n✅ Test complete!');
}

function extractGroup(task) {
  const desc = (task.description || '').toLowerCase();
  const storyId = (task.story_id || '').toLowerCase();
  
  if (desc.includes('group a') || desc.includes('group-a') || (desc.includes('backend') && desc.includes('database'))) return 'A';
  if (desc.includes('group b') || desc.includes('group-b') || desc.includes('frontend') || desc.includes('component')) return 'B';
  if (desc.includes('group c') || desc.includes('group-c') || desc.includes('middleware') || desc.includes('auth')) return 'C';
  if (desc.includes('group d') || desc.includes('group-d')) return 'D';
  
  if (storyId.includes('1.1') && (desc.includes('oauth') || desc.includes('auth') || desc.includes('jwt'))) return 'C';
  if (storyId.includes('1.2') && (desc.includes('api') || desc.includes('endpoint'))) return 'A';
  if (storyId.includes('1.2') && (desc.includes('component') || desc.includes('page') || desc.includes('ui'))) return 'B';
  
  return null;
}

test().catch(console.error);
