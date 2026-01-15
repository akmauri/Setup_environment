#!/usr/bin/env node
/**
 * Setup Parallel Execution
 * 
 * Creates all tasks for Story 2.5 and assigns them to agents for parallel execution
 */

const fs = require('fs').promises;
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TODO_FILE = path.join(PROJECT_ROOT, 'agent_tasks', 'todo_progress.json');
const LOCK_DIR = path.join(PROJECT_ROOT, '.lock');
const COMMS_DIR = path.join(PROJECT_ROOT, 'agent_comms');
const AGENT_PROMPTS_DIR = path.join(PROJECT_ROOT, 'agent_prompts');

// Story 2.5 tasks
const STORY_2_5_TASKS = [
  { id: '2.5.1', desc: 'Create LinkedIn OAuth config with LinkedIn scopes', complexity: 'low', deps: [] },
  { id: '2.5.2', desc: 'Add LinkedIn OAuth scopes (openid, profile, email, w_member_social, rw_organization_admin)', complexity: 'low', deps: ['2.5.1'] },
  { id: '2.5.3', desc: 'Create LinkedIn service for OAuth and API operations', complexity: 'medium', deps: ['2.5.2'] },
  { id: '2.5.4', desc: 'Implement function to exchange authorization code for LinkedIn tokens', complexity: 'medium', deps: ['2.5.3'] },
  { id: '2.5.5', desc: 'Implement function to exchange short-lived token for long-lived token (60 days)', complexity: 'medium', deps: ['2.5.3'] },
  { id: '2.5.6', desc: 'Implement function to refresh LinkedIn long-lived token', complexity: 'medium', deps: ['2.5.3'] },
  { id: '2.5.7', desc: 'Implement function to get LinkedIn personal profile information', complexity: 'medium', deps: ['2.5.3'] },
  { id: '2.5.8', desc: 'Implement function to get LinkedIn company pages for user', complexity: 'medium', deps: ['2.5.3'] },
  { id: '2.5.9', desc: 'Implement function to get LinkedIn company page information', complexity: 'medium', deps: ['2.5.8'] },
  { id: '2.5.10', desc: 'Create LinkedIn OAuth initiation endpoint', complexity: 'low', deps: ['2.5.2'] },
  { id: '2.5.11', desc: 'Create LinkedIn OAuth callback handler', complexity: 'medium', deps: ['2.5.10'] },
  { id: '2.5.12', desc: 'Support connecting personal LinkedIn profile', complexity: 'medium', deps: ['2.5.7'] },
  { id: '2.5.13', desc: 'Support connecting LinkedIn Company Pages', complexity: 'medium', deps: ['2.5.9'] },
  { id: '2.5.14', desc: 'Store LinkedIn account with encrypted tokens and account info', complexity: 'medium', deps: ['2.5.12', '2.5.13'] },
  { id: '2.5.15', desc: 'Update token refresh service to support LinkedIn tokens', complexity: 'low', deps: ['2.5.6'] },
  { id: '2.5.16', desc: 'Create GET endpoint to list connected LinkedIn accounts', complexity: 'low', deps: [] },
  { id: '2.5.17', desc: 'Create DELETE endpoint to disconnect LinkedIn account', complexity: 'medium', deps: ['2.5.16'] },
  { id: '2.5.18', desc: 'Implement token revocation on LinkedIn account disconnection', complexity: 'medium', deps: ['2.5.17'] },
  { id: '2.5.19', desc: 'Create PUT endpoint to update LinkedIn account label', complexity: 'low', deps: [] },
  { id: '2.5.20', desc: 'Enforce tier limits when connecting new LinkedIn account', complexity: 'low', deps: [] },
  { id: '2.5.21', desc: 'Create function to validate LinkedIn token using LinkedIn API', complexity: 'medium', deps: [] },
  { id: '2.5.22', desc: 'Create endpoint to check token health for LinkedIn accounts', complexity: 'low', deps: ['2.5.21'] },
  { id: '2.5.23', desc: 'Display account type (Personal Profile vs Company Page) in account information', complexity: 'low', deps: ['2.5.14'] },
  { id: '2.5.24', desc: 'Implement error handling for permission issues', complexity: 'low', deps: ['2.5.7'] },
  { id: '2.5.25', desc: 'Implement error handling for account access problems', complexity: 'low', deps: ['2.5.8'] },
];

// Agent assignments
const AGENT_ASSIGNMENTS = {
  'dev-oauth-1': ['2.5.1', '2.5.2', '2.5.3', '2.5.4', '2.5.5'],
  'dev-oauth-2': ['2.5.6', '2.5.7', '2.5.8', '2.5.9', '2.5.12'],
  'dev-oauth-3': ['2.5.13', '2.5.14', '2.5.15', '2.5.21'],
  'dev-backend-1': ['2.5.10', '2.5.11', '2.5.16', '2.5.17'],
  'dev-backend-2': ['2.5.18', '2.5.19', '2.5.20', '2.5.22'],
  'qa-1': ['2.5.23', '2.5.24', '2.5.25'],
};

async function setupParallelExecution() {
  // Ensure directories exist
  await fs.mkdir(LOCK_DIR, { recursive: true });
  await fs.mkdir(COMMS_DIR, { recursive: true });
  await fs.mkdir(AGENT_PROMPTS_DIR, { recursive: true });
  
  // Load existing tasks
  const progressContent = await fs.readFile(TODO_FILE, 'utf-8');
  const progress = JSON.parse(progressContent);
  
  // Remove existing Story 2.5 tasks
  progress.tasks = progress.tasks.filter((t) => t.story_id !== '2.5');
  
  // Create tasks
  const now = new Date().toISOString();
  const newTasks = STORY_2_5_TASKS.map((task) => {
    const taskId = `task-${task.id.replace('.', '-')}`;
    const dependencies = task.deps.map((d) => `task-${d.replace('.', '-')}`);
    
    // Find assigned agent
    let assignedAgent = null;
    for (const [agentId, taskIds] of Object.entries(AGENT_ASSIGNMENTS)) {
      if (taskIds.includes(task.id)) {
        assignedAgent = agentId;
        break;
      }
    }
    
    return {
      epic_id: null,
      story_id: '2.5',
      task_id: taskId,
      description: task.desc,
      status: 'pending',
      assigned_agent: assignedAgent,
      priority: 1,
      created_at: now,
      updated_at: now,
      dependencies,
      estimated_complexity: task.complexity,
      actual_completion_time: null,
      retry_count: 0,
      last_error: null,
    };
  });
  
  progress.tasks.push(...newTasks);
  progress.last_updated = now;
  
  await fs.writeFile(TODO_FILE, JSON.stringify(progress, null, 2) + '\n', 'utf-8');
  
  console.log(`✅ Created ${newTasks.length} tasks for Story 2.5`);
  console.log(`✅ Assigned tasks to ${Object.keys(AGENT_ASSIGNMENTS).length} agents`);
  
  // Create agent prompts
  for (const [agentId, taskIds] of Object.entries(AGENT_ASSIGNMENTS)) {
    const agentTasks = newTasks.filter((t) => taskIds.includes(t.task_id.replace('task-', '').replace(/-/g, '.')));
    
    const agentType = agentId.startsWith('dev-oauth') ? 'dev-oauth' : agentId.startsWith('dev-backend') ? 'dev-backend' : 'qa';
    
    const prompt = `# Autonomous Agent: ${agentId}

You are an autonomous agent working on Story 2.5: LinkedIn OAuth Integration.

## Your Agent ID
${agentId}

## Your Specialty
${agentType === 'dev-oauth' ? 'OAuth Integration Specialist' : agentType === 'dev-backend' ? 'Backend Developer' : 'QA Tester'}

## Your Assigned Tasks

${agentTasks.map((t, idx) => `${idx + 1}. **${t.task_id}**: ${t.description} [${t.estimated_complexity}]`).join('\n')}

## Autonomous Execution Instructions

**YOU MUST WORK AUTONOMOUSLY WITHOUT WAITING FOR USER INPUT**

1. **Load Context**
   - Read \`plan/IMPLEMENTATION_PLAN.md\` (Story 2.5 section)
   - Read \`specs/linkedin-oauth-integration.md\`
   - Read relevant code files (oauth.config.ts, other OAuth services for reference)

2. **For Each Task (in order, respecting dependencies):**
   a. **Check Dependencies**: Verify all dependencies are \`completed\` in \`agent_tasks/todo_progress.json\`
   b. **Check Lock**: Verify no lock exists in \`.lock/[task_id].lock\`
   c. **Acquire Lock**: Create lock file: \`.lock/[task_id].lock\` with your agent ID
   d. **Update Status**: Mark task as \`in_progress\` in \`agent_tasks/todo_progress.json\`
   e. **Implement**: Write code, create files, make changes
   f. **Verify**: Run \`npm run type-check && npm run lint\` (fix any issues)
   g. **Commit**: Commit with message \`[${agentId}] [${agentTasks[0]?.task_id}] Description\`
   h. **Complete**: Mark task as \`completed\`, release lock, move to next task

3. **Continue Until All Tasks Complete**

## Coordination Rules

- **Check locks before starting**: \`.lock/[task_id].lock\`
- **Update status immediately**: \`agent_tasks/todo_progress.json\`
- **Respect dependencies**: Don't start until dependencies are complete
- **Communicate if needed**: Use \`agent_comms/\` for coordination
- **Work autonomously**: Don't wait for user input

## Start Working Now

Begin with your first task: **${agentTasks[0]?.task_id}** - ${agentTasks[0]?.description}

Work through all your tasks autonomously. Complete them all without stopping.
`;

    const promptFile = path.join(AGENT_PROMPTS_DIR, `${agentId}.md`);
    await fs.writeFile(promptFile, prompt, 'utf-8');
    console.log(`  Created prompt: ${promptFile}`);
  }
  
  console.log('\n✅ Parallel execution setup complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Open multiple Cursor windows (one per agent)');
  console.log('2. In each window, load the corresponding prompt from agent_prompts/');
  console.log('3. Agents will work autonomously in parallel');
  console.log('4. Monitor progress: cat agent_tasks/todo_progress.json | jq');
  console.log('\n🎯 Agent Prompts Created:');
  Object.keys(AGENT_ASSIGNMENTS).forEach((agentId) => {
    console.log(`   - agent_prompts/${agentId}.md`);
  });
}

if (require.main === module) {
  setupParallelExecution().catch(console.error);
}

module.exports = { setupParallelExecution };
