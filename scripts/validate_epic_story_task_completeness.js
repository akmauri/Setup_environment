#!/usr/bin/env node
/**
 * Validate Epic → Story → Task Completeness
 * 
 * Ensures all epics have stories, all stories have tasks.
 * Reports any gaps in the work breakdown structure.
 * 
 * Usage:
 *   node scripts/validate_epic_story_task_completeness.js
 */

const fs = require('fs').promises;
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PRD_FILE = path.join(PROJECT_ROOT, 'docs', 'prd.md');
const PLAN_FILE = path.join(PROJECT_ROOT, 'plan', 'IMPLEMENTATION_PLAN.md');
const TODO_FILE = path.join(PROJECT_ROOT, 'agent_tasks', 'todo_progress.json');
const STORIES_DIR = path.join(PROJECT_ROOT, 'docs', 'stories');

/**
 * Extract epics from PRD
 */
async function extractEpicsFromPRD() {
  const prdContent = await fs.readFile(PRD_FILE, 'utf-8');
  const epics = [];
  
  const epicRegex = /## Epic (\d+):\s*(.+?)\n\n\*\*Goal:\*\*\s*(.+?)\n\n/g;
  let match;
  
  while ((match = epicRegex.exec(prdContent)) !== null) {
    const [, epicNum, epicTitle, epicGoal] = match;
    epics.push({
      epic_id: `epic-${epicNum}`,
      epic_number: parseInt(epicNum),
      title: epicTitle.trim(),
      goal: epicGoal.trim()
    });
  }
  
  return epics;
}

/**
 * Extract stories from PRD
 */
async function extractStoriesFromPRD() {
  const prdContent = await fs.readFile(PRD_FILE, 'utf-8');
  const stories = [];
  
  // PRD format: ### Story X.Y: Title (followed by **As a** or other content)
  // More flexible regex to handle various formats
  const storyRegex = /### Story ([\d.]+):\s*(.+?)(?=\n\n|$)/g;
  let match;
  let currentEpic = null;
  
  // First, find epics to map stories to
  const epicRegex = /## Epic (\d+):\s*(.+?)(?=\n|$)/g;
  const epicMap = new Map();
  let epicMatch;
  
  while ((epicMatch = epicRegex.exec(prdContent)) !== null) {
    const [, epicNum, epicTitle] = epicMatch;
    epicMap.set(parseInt(epicNum), epicTitle.trim());
  }
  
  // Now find stories
  const lines = prdContent.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for epic
    const epicLineMatch = line.match(/^## Epic (\d+):/);
    if (epicLineMatch) {
      currentEpic = parseInt(epicLineMatch[1]);
    }
    
    // Check for story
    const storyLineMatch = line.match(/^### Story ([\d.]+):\s*(.+)/);
    if (storyLineMatch) {
      const [, storyId, storyTitle] = storyLineMatch;
      const epicNum = storyId.split('.')[0];
      stories.push({
        story_id: `story-${storyId}`,
        story_number: storyId,
        epic_id: `epic-${epicNum}`,
        title: storyTitle.trim()
      });
    }
  }
  
  return stories;
}

/**
 * Extract stories from IMPLEMENTATION_PLAN.md
 */
async function extractStoriesFromPlan() {
  const planContent = await fs.readFile(PLAN_FILE, 'utf-8');
  const stories = [];
  
  const storyRegex = /### Story ([\d.]+):\s*(.+?)\n\n.*?Epic[:\s]+(.+?)\n/g;
  let match;
  
  while ((match = storyRegex.exec(planContent)) !== null) {
    const [, storyId, storyTitle, epicName] = match;
    const epicNum = storyId.split('.')[0];
    stories.push({
      story_id: `story-${storyId}`,
      story_number: storyId,
      epic_id: `epic-${epicNum}`,
      title: storyTitle.trim(),
      epic_name: epicName.trim()
    });
  }
  
  return stories;
}

/**
 * Get tasks from todo_progress.json
 */
async function getTasksFromTodo() {
  try {
    const content = await fs.readFile(TODO_FILE, 'utf-8');
    if (!content || content.trim().length === 0) {
      return [];
    }
    const todo = JSON.parse(content);
    return todo.tasks || [];
  } catch (error) {
    return [];
  }
}

/**
 * Get story files
 */
async function getStoryFiles() {
  try {
    const files = await fs.readdir(STORIES_DIR);
    return files.filter(f => f.endsWith('.story.md')).map(f => f.replace('.story.md', ''));
  } catch (error) {
    return [];
  }
}

/**
 * Main validation
 */
async function main() {
  console.log('🔍 Validating Epic → Story → Task Completeness...\n');
  
  const epics = await extractEpicsFromPRD();
  const prdStories = await extractStoriesFromPRD();
  const planStories = await extractStoriesFromPlan();
  const tasks = await getTasksFromTodo();
  const storyFiles = await getStoryFiles();
  
  console.log(`📊 Found:`);
  console.log(`   Epics: ${epics.length}`);
  console.log(`   Stories (PRD): ${prdStories.length}`);
  console.log(`   Stories (Plan): ${planStories.length}`);
  console.log(`   Tasks (todo_progress.json): ${tasks.length}`);
  console.log(`   Story Files: ${storyFiles.length}\n`);
  
  // Validate epics have stories
  console.log('📋 Epic → Story Validation:');
  const issues = [];
  
  for (const epic of epics) {
    const epicStories = prdStories.filter(s => s.epic_id === epic.epic_id);
    const planEpicStories = planStories.filter(s => s.epic_id === epic.epic_id);
    const epicTasks = tasks.filter(t => t.epic_id === epic.epic_id);
    
    if (epicStories.length === 0) {
      issues.push({
        type: 'epic_no_stories',
        epic: epic.epic_id,
        message: `Epic ${epic.epic_id} has no stories in PRD`
      });
      console.log(`   ⚠️  ${epic.epic_id}: ${epic.title}`);
      console.log(`      No stories found in PRD`);
    } else {
      console.log(`   ✅ ${epic.epic_id}: ${epic.title}`);
      console.log(`      Stories (PRD): ${epicStories.length}, Stories (Plan): ${planEpicStories.length}, Tasks: ${epicTasks.length}`);
      
      // Validate each story has tasks
      for (const story of epicStories) {
        const storyTasks = tasks.filter(t => t.story_id === story.story_id);
        const hasStoryFile = storyFiles.includes(story.story_number);
        
        if (storyTasks.length === 0) {
          issues.push({
            type: 'story_no_tasks',
            epic: epic.epic_id,
            story: story.story_id,
            message: `Story ${story.story_id} has no tasks in todo_progress.json`
          });
          console.log(`      ⚠️  ${story.story_id}: ${story.title} - NO TASKS`);
        } else {
          const pending = storyTasks.filter(t => t.status === 'pending').length;
          const completed = storyTasks.filter(t => t.status === 'completed').length;
          console.log(`      ${storyTasks.length > 0 ? '✅' : '⚠️'} ${story.story_id}: ${story.title} - ${storyTasks.length} tasks (${pending} pending, ${completed} completed)${hasStoryFile ? ' [has file]' : ' [no file]'}`);
        }
      }
    }
  }
  
  // Summary
  console.log(`\n📊 Summary:`);
  const epicsWithStories = epics.filter(e => prdStories.some(s => s.epic_id === e.epic_id)).length;
  const storiesWithTasks = prdStories.filter(s => tasks.some(t => t.story_id === s.story_id)).length;
  const totalPendingTasks = tasks.filter(t => t.status === 'pending').length;
  
  console.log(`   Epics with stories: ${epicsWithStories}/${epics.length}`);
  console.log(`   Stories with tasks: ${storiesWithTasks}/${prdStories.length}`);
  console.log(`   Total pending tasks: ${totalPendingTasks}`);
  
  if (issues.length > 0) {
    console.log(`\n⚠️  Issues Found: ${issues.length}`);
    issues.forEach(issue => {
      console.log(`   - ${issue.message}`);
    });
    
    console.log(`\n💡 Recommendations:`);
    if (issues.some(i => i.type === 'story_no_tasks')) {
      console.log(`   1. Run: node scripts/populate_tasks_from_plan.js`);
      console.log(`      This will populate tasks from IMPLEMENTATION_PLAN.md`);
    }
    if (issues.some(i => i.type === 'epic_no_stories')) {
      console.log(`   2. Check PRD for missing story definitions`);
    }
  } else {
    console.log(`\n✅ All epics have stories, all stories have tasks!`);
  }
  
  return issues.length === 0;
}

if (require.main === module) {
  main()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = { extractEpicsFromPRD, extractStoriesFromPRD, getTasksFromTodo };
