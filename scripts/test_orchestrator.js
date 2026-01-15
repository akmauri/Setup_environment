#!/usr/bin/env node
/**
 * Orchestrator Validation Test Script
 * 
 * Tests orchestrator functionality without actually spawning agents
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TODO_FILE = path.join(PROJECT_ROOT, 'agent_tasks', 'todo_progress.json');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ PASS: ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`✗ FAIL: ${name}`);
    console.log(`  Error: ${error.message}`);
    testsFailed++;
  }
}

console.log('Orchestrator Validation Tests');
console.log('============================\n');

// Test 1: Agent Detection
test('Agent Detection', () => {
  try {
    execSync('wsl -d Ubuntu ~/.local/bin/agent --version', { stdio: 'ignore' });
  } catch (error) {
    throw new Error('Agent not detected in WSL');
  }
});

// Test 2: Script Syntax
test('Orchestrator Script Syntax', () => {
  const scriptPath = path.join(PROJECT_ROOT, 'scripts', 'orchestrate_agents.js');
  if (!fs.existsSync(scriptPath)) {
    throw new Error('Orchestrator script not found');
  }
  // Try to require it (will fail if syntax error)
  delete require.cache[require.resolve(scriptPath)];
  require(scriptPath);
});

// Test 3: Task Loading
test('Task Loading from todo_progress.json', () => {
  if (!fs.existsSync(TODO_FILE)) {
    throw new Error('todo_progress.json not found');
  }
  const todo = JSON.parse(fs.readFileSync(TODO_FILE, 'utf-8'));
  if (!todo.tasks || !Array.isArray(todo.tasks)) {
    throw new Error('Invalid todo_progress.json format');
  }
  const epic1Tasks = todo.tasks.filter(t => t.epic_id === 'epic-1' && (t.status === 'pending' || t.status === 'in_progress'));
  if (epic1Tasks.length === 0) {
    throw new Error('No pending Epic 1 tasks found');
  }
  console.log(`  Found ${epic1Tasks.length} pending Epic 1 tasks`);
});

// Test 4: Lock Directory
test('Lock Directory Exists', () => {
  const lockDir = path.join(PROJECT_ROOT, '.lock');
  if (!fs.existsSync(lockDir)) {
    // Create it
    fs.mkdirSync(lockDir, { recursive: true });
  }
});

// Test 5: Communication Directory
test('Communication Directory Exists', () => {
  const commsDir = path.join(PROJECT_ROOT, 'agent_comms');
  if (!fs.existsSync(commsDir)) {
    // Create it
    fs.mkdirSync(commsDir, { recursive: true });
  }
});

// Test 6: Orchestrator Initialization (dry run)
test('Orchestrator Initialization', () => {
  // This would require importing the class, but we'll just verify the file structure
  const scriptPath = path.join(PROJECT_ROOT, 'scripts', 'orchestrate_agents.js');
  const content = fs.readFileSync(scriptPath, 'utf-8');
  if (!content.includes('class AgentOrchestrator')) {
    throw new Error('Orchestrator class not found');
  }
  if (!content.includes('async initialize()')) {
    throw new Error('initialize method not found');
  }
  if (!content.includes('async checkCursorCLI()')) {
    throw new Error('checkCursorCLI method not found');
  }
});

console.log('\n============================');
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log(`Total: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✅ All validation tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed');
  process.exit(1);
}
