#!/usr/bin/env node
/**
 * Claude Code Window Launcher
 * 
 * Opens Claude Code windows programmatically and loads agent prompts.
 * Works with Cursor's Claude Code feature to spawn parallel agent sessions.
 * 
 * Usage:
 *   node scripts/launch_claude_code.js --agent-id dev-oauth-1 --prompt agent_prompts/dev-oauth-1.md
 *   node scripts/launch_claude_code.js --agent-id dev-oauth-1 --prompt agent_prompts/dev-oauth-1.md --mode auto
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * Detect Cursor installation and Claude Code availability
 */
function detectCursorInstallation() {
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  const isLinux = process.platform === 'linux';

  // Try to find Cursor executable
  let cursorPath = null;
  let cursorCommand = null;

  if (isWindows) {
    // Windows: Check common installation paths
    const possiblePaths = [
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'cursor', 'Cursor.exe'),
      path.join(process.env.APPDATA || '', 'cursor', 'Cursor.exe'),
      path.join('C:\\Users', process.env.USERNAME || '', 'AppData', 'Local', 'Programs', 'cursor', 'Cursor.exe')
    ];

    // First, try to find Cursor.exe in common installation paths
    for (const possiblePath of possiblePaths) {
      try {
        const normalizedPath = path.normalize(possiblePath);
        if (require('fs').existsSync(normalizedPath)) {
          cursorPath = normalizedPath;
          cursorCommand = normalizedPath; // Use full path for spawn
          break;
        }
      } catch (e) {
        // Continue searching
      }
    }

    // If still not found, try Program Files
    if (!cursorCommand) {
      const programFilesPaths = [
        path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Cursor', 'Cursor.exe'),
        path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Cursor', 'Cursor.exe')
      ];
      
      for (const possiblePath of programFilesPaths) {
        try {
          const normalizedPath = path.normalize(possiblePath);
          if (require('fs').existsSync(normalizedPath)) {
            cursorPath = normalizedPath;
            cursorCommand = normalizedPath;
            break;
          }
        } catch (e) {
          // Continue searching
        }
      }
    }

    // Last resort: try 'where cursor' to find it in PATH
    // But prefer the .exe file, not the .cmd wrapper
    if (!cursorCommand) {
      try {
        // Use 'where' on Windows to find cursor in PATH
        const result = execSync('where cursor', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
        if (result && result.trim()) {
          const cursorPathFromPath = result.trim().split('\r\n')[0].trim() || result.trim().split('\n')[0].trim();
          
          // If it's a .cmd file, try to find the actual .exe
          if (cursorPathFromPath.endsWith('.cmd')) {
            // Try to find Cursor.exe in the same directory structure
            const cmdDir = path.dirname(cursorPathFromPath);
            const possibleExe = path.join(cmdDir, '..', '..', '..', 'Cursor.exe');
            if (require('fs').existsSync(path.normalize(possibleExe))) {
              cursorPath = path.normalize(possibleExe);
              cursorCommand = cursorPath;
            } else {
              // Fall back to using the .cmd file
              cursorPath = cursorPathFromPath;
              cursorCommand = cursorPathFromPath;
            }
          } else if (require('fs').existsSync(cursorPathFromPath)) {
            cursorPath = cursorPathFromPath;
            cursorCommand = cursorPathFromPath;
          }
        }
      } catch (e) {
        // Not in PATH or error finding it
      }
    }
  } else if (isMac) {
    // macOS: Check Applications folder
    const possiblePaths = [
      '/Applications/Cursor.app/Contents/MacOS/Cursor',
      '/Applications/Cursor.app/Contents/Resources/app/bin/cursor'
    ];

    for (const possiblePath of possiblePaths) {
      try {
        if (require('fs').existsSync(possiblePath)) {
          cursorPath = possiblePath;
          cursorCommand = possiblePath;
          break;
        }
      } catch (e) {
        // Continue searching
      }
    }

    // Also try 'cursor' command if in PATH
    try {
      execSync('which cursor', { stdio: 'ignore' });
      cursorCommand = 'cursor';
    } catch (e) {
      // Not in PATH
    }
  } else if (isLinux) {
    // Linux: Check common locations
    try {
      execSync('which cursor', { stdio: 'ignore' });
      cursorCommand = 'cursor';
    } catch (e) {
      // Not in PATH, try common locations
      const possiblePaths = [
        '/usr/bin/cursor',
        '/usr/local/bin/cursor',
        path.join(process.env.HOME || '', '.local', 'bin', 'cursor')
      ];

      for (const possiblePath of possiblePaths) {
        try {
          if (require('fs').existsSync(possiblePath)) {
            cursorPath = possiblePath;
            cursorCommand = possiblePath;
            break;
          }
        } catch (e) {
          // Continue searching
        }
      }
    }
  }

  return { cursorPath, cursorCommand, isWindows, isMac, isLinux };
}

/**
 * Inject prompt into Cursor Claude Code chat on Windows using PowerShell
 */
async function injectPromptWindows(promptFile, projectRoot) {
  const { execSync } = require('child_process');
  const relativePath = path.relative(projectRoot, promptFile).replace(/\\/g, '/');
  const injectScript = path.join(projectRoot, 'scripts', 'inject_prompt.ps1');

  try {
    // Use PowerShell to inject the prompt
    const command = `powershell.exe -ExecutionPolicy Bypass -File "${injectScript}" -PromptFile "${promptFile}" -Delay 3000`;
    execSync(command, { 
      stdio: 'inherit',
      timeout: 10000 // 10 second timeout
    });
    return true;
  } catch (error) {
    // If PowerShell script fails, try alternative method using COM automation
    try {
      // Alternative: Use VBScript to send keys
      const vbscript = `
Set objShell = CreateObject("WScript.Shell")
WScript.Sleep 3000
objShell.SendKeys "^l"
WScript.Sleep 500
objShell.SendKeys "@${relativePath}"
WScript.Sleep 300
objShell.SendKeys "{ENTER}"
`;
      const tempVbs = path.join(projectRoot, '.temp', `inject-${Date.now()}.vbs`);
      await fs.writeFile(tempVbs, vbscript, 'utf-8');
      
      execSync(`cscript.exe //nologo "${tempVbs}"`, {
        stdio: 'inherit',
        timeout: 10000
      });
      
      // Clean up temp VBScript
      try {
        await fs.unlink(tempVbs);
      } catch (e) {
        // Ignore cleanup errors
      }
      
      return true;
    } catch (vbError) {
      throw new Error(`Both PowerShell and VBScript injection failed: ${error.message}, ${vbError.message}`);
    }
  }
}

/**
 * Open Claude Code window with prompt
 */
async function launchClaudeCodeWindow(agentId, promptFile, options = {}) {
  const { cursorCommand, cursorPath, isWindows } = detectCursorInstallation();

  if (!cursorCommand) {
    throw new Error('Cursor not found. Please install Cursor IDE first.\n' +
      'Common installation paths:\n' +
      '  - ' + path.join(process.env.LOCALAPPDATA || '', 'Programs', 'cursor', 'Cursor.exe') + '\n' +
      '  - ' + path.join(process.env.APPDATA || '', 'cursor', 'Cursor.exe'));
  }

  // Use full path if available, otherwise use command
  const actualCommand = cursorPath || cursorCommand;

  // Read prompt file
  const promptPath = path.resolve(PROJECT_ROOT, promptFile);
  let promptContent;
  try {
    promptContent = await fs.readFile(promptPath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read prompt file: ${promptPath}`);
  }

  // Create a temporary file with the full agent context
  const tempPromptFile = path.join(PROJECT_ROOT, '.temp', `agent-${agentId}-${Date.now()}.md`);
  await fs.mkdir(path.dirname(tempPromptFile), { recursive: true });

  // Load loop prevention rules
  let loopGuardRules = '';
  try {
    const loopGuardPath = path.join(PROJECT_ROOT, 'agent_rules', 'loop_guard.md');
    loopGuardRules = await fs.readFile(loopGuardPath, 'utf-8');
  } catch (error) {
    // If loop guard doesn't exist, use basic loop prevention
    loopGuardRules = `## Loop Prevention Rules

**CRITICAL**: You must detect and prevent loops:

1. **Maximum 2 attempts** per objective without a state change
2. **Progress tracking required**: At the start of each response, include:
   - Last completed state change: [What was accomplished]
   - Current objective: [What you're trying to achieve]
   - Next concrete action: [One sentence describing next action]

3. **Loop detection triggers**:
   - Repeating the same plan/steps 2+ times
   - Rewriting the same code without changes
   - Re-running failed commands without changing approach
   - No progress after 2 attempts

4. **When loop detected**:
   - STOP immediately
   - Log the loop detection
   - Try a different approach or escalate

**Progress must be measurable**: Files created/updated, decisions made, state changes.`;
  }

  // Extract task information if provided
  const task = options.task || null;
  const taskSection = task ? `
## Your Assigned Task (IMMEDIATE PRIORITY)

**Task ID**: ${task.task_id}
**Description**: ${task.description}
**Epic**: ${task.epic_id || 'N/A'}
**Story**: ${task.story_id || 'N/A'}
**Status**: ${task.status || 'pending'}
**Priority**: ${task.priority || 'normal'}

**YOUR IMMEDIATE ACTION**: Implement this task now. This is your assigned task.

**Steps for this task**:
1. Verify lock file exists: `.lock/${task.task_id}.lock` (should already exist)
2. Update task status to \`in_progress\` in \`agent_tasks/todo_progress.json\`
3. Read relevant context files (check \`specs/\`, \`docs/\`, related code files)
4. Implement the task: ${task.description}
5. Run verification: \`npm run type-check && npm run lint\` (fix any issues)
6. Commit changes: \`git commit -m "[${agentId}] [${task.task_id}] ${task.description}"\`
7. Mark task as \`completed\` in \`agent_tasks/todo_progress.json\`
8. Remove lock file: \`.lock/${task.task_id}.lock\`

**START WORKING ON THIS TASK IMMEDIATELY - DO NOT WAIT**
` : `
## Your Assigned Tasks

Find your next assigned task in \`agent_tasks/todo_progress.json\` where \`assigned_agent\` matches your Agent ID, or where task status is \`pending\` and no lock exists.

Work through all your assigned tasks autonomously.
`;

  // Build full prompt with context including loop prevention
  const fullPrompt = `# Autonomous Agent: ${agentId}

**Mode**: ${options.mode || 'auto'}
**Workspace**: ${PROJECT_ROOT}
**Agent ID**: ${agentId}
${taskSection}
## Autonomous Execution Instructions

You are an autonomous agent working continuously until all assigned tasks are complete.

**CRITICAL**: You MUST work autonomously without asking for permission. Follow these steps in a continuous loop:

1. Load context (prd.json, todo_progress.json, agent rules)
2. ${task ? `**WORK ON YOUR ASSIGNED TASK NOW: ${task.task_id}**` : 'Find your next assigned task'}
3. Acquire lock if needed (check \`.lock/[task_id].lock\`)
4. Update task status to \`in_progress\` in \`agent_tasks/todo_progress.json\`
5. Implement the task
6. Run verification (type-check, lint, test)
7. Commit changes
8. Mark task as \`completed\` in \`agent_tasks/todo_progress.json\`
9. Release lock (remove \`.lock/[task_id].lock\`)
10. **IMMEDIATELY continue to next task** (don't stop, don't ask permission)
11. Repeat until all tasks complete

## Loop Prevention Rules

${loopGuardRules}

## Agent Rules

${promptContent}

## Start Working Now

${task ? `**BEGIN WORKING ON YOUR ASSIGNED TASK: ${task.task_id} - ${task.description}**` : 'Begin autonomous execution loop. Work continuously until all your assigned tasks are complete.'}

**DO NOT STOP UNTIL ALL TASKS ARE COMPLETE**
**DO NOT ASK FOR PERMISSION**
**CONTINUE AUTONOMOUSLY**
**TRACK PROGRESS TO PREVENT LOOPS**

---

${promptContent}
`;

  await fs.writeFile(tempPromptFile, fullPrompt, 'utf-8');

  // Build command to open Cursor with Claude Code
  // For Claude Code, we need to open Cursor and then trigger Claude Code
  // This is platform-specific

  let command;
  let args;

  if (isWindows) {
    // Windows: Open Cursor and pass workspace + command
    // Note: Cursor.exe on Windows may not support all VS Code CLI arguments
    // We'll try opening the workspace and let the user paste the prompt manually
    command = actualCommand;
    // For Windows, just open the workspace in a new window
    // The prompt file will be available at tempPromptFile for manual loading
    args = [
      PROJECT_ROOT,
      '--new-window'
      // Note: --command and --args may not work on Windows Cursor.exe
      // User will need to manually open chat and load the prompt file
    ];
  } else {
    // macOS/Linux: Use cursor command
    command = actualCommand;
    args = [
      PROJECT_ROOT,
      '--new-window',
      '--command', 'workbench.action.openChat'
    ];
  }

  console.log(`🚀 Launching Claude Code window for agent: ${agentId}`);
  console.log(`📁 Workspace: ${PROJECT_ROOT}`);
  console.log(`📝 Prompt: ${promptFile}`);
  console.log(`🔧 Command: ${actualCommand} ${args.join(' ')}`);

  // Spawn process
  let spawnedProcess;
  try {
    spawnedProcess = spawn(actualCommand, args, {
      cwd: PROJECT_ROOT,
      detached: true,
      stdio: 'ignore'
    });

    spawnedProcess.on('error', (error) => {
      console.error(`❌ Failed to spawn process: ${error.message}`);
      throw error;
    });

    spawnedProcess.unref(); // Allow parent process to exit

    // Give it a moment for Cursor window to open
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verify process started (if we can)
    if (spawnedProcess.killed) {
      throw new Error('Process was killed immediately after spawn');
    }

    // Automated prompt injection with aggressive window activation
    const relativePath = path.relative(PROJECT_ROOT, tempPromptFile).replace(/\\/g, '/');
    
    if (isWindows) {
      try {
        // Attempt automated injection with aggressive window activation
        console.log(`\n🤖 Attempting automated prompt injection for ${agentId}...`);
        await injectPromptWindows(tempPromptFile, PROJECT_ROOT);
        console.log(`✅ Prompt automatically injected for ${agentId}`);
        console.log(`💡 Prompt file: ${tempPromptFile}\n`);
      } catch (error) {
        console.warn(`⚠️  Automatic prompt injection failed: ${error.message}`);
        console.log(`\n📋 Manual loading (fallback):`);
        console.log(`   1. Click on the Cursor window to activate it`);
        console.log(`   2. Open chat in Cursor (Ctrl+L)`);
        console.log(`   3. Type: @${relativePath}`);
        console.log(`   4. Press Enter to load prompt`);
        console.log(`\n💡 Prompt file: ${tempPromptFile}\n`);
      }
    } else {
      // macOS/Linux - manual loading for now
      console.log(`\n📋 Manual loading required:`);
      console.log(`   1. Open chat in Cursor (Cmd+L)`);
      console.log(`   2. Type: @${relativePath}`);
      console.log(`   3. Press Enter\n`);
    }

    console.log(`✅ Claude Code window launched for ${agentId}`);
    console.log(`📋 Process PID: ${spawnedProcess.pid || 'N/A'}`);

    return {
      agentId,
      promptFile: tempPromptFile,
      process: spawnedProcess,
      launched: true,
      pid: spawnedProcess.pid
    };
  } catch (error) {
    console.error(`❌ Error launching Claude Code window: ${error.message}`);
    throw error;
  }
}

/**
 * Monitor Claude Code credits and fallback to Cursor browser
 */
async function monitorCreditsAndFallback(agentId) {
  // This would need to integrate with Cursor's API to check credits
  // For now, we'll create a placeholder that can be enhanced
  console.log(`💳 Credit monitoring for ${agentId} - placeholder`);
  console.log(`   (Credit monitoring requires Cursor API integration)`);
  
  // Placeholder: Check for credit exhaustion signals
  // In practice, this would:
  // 1. Monitor Claude Code API responses for credit errors
  // 2. Detect when credits are exhausted
  // 3. Automatically switch to Cursor browser mode
  // 4. Continue work in browser mode
  
  return {
    creditsAvailable: true, // Placeholder
    fallbackNeeded: false
  };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  let agentId = null;
  let promptFile = null;
  let mode = 'auto';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--agent-id' && args[i + 1]) {
      agentId = args[i + 1];
      i++;
    } else if (args[i] === '--prompt' && args[i + 1]) {
      promptFile = args[i + 1];
      i++;
    } else if (args[i] === '--mode' && args[i + 1]) {
      mode = args[i + 1];
      i++;
    }
  }

  if (!agentId || !promptFile) {
    console.error('Usage:');
    console.error('  node scripts/launch_claude_code.js --agent-id <agent-id> --prompt <prompt-file> [--mode auto|manual]');
    process.exit(1);
  }

  try {
    const result = await launchClaudeCodeWindow(agentId, promptFile, { mode });
    
    // Start credit monitoring in background
    if (mode === 'auto') {
      monitorCreditsAndFallback(agentId).catch(console.error);
    }

    console.log(`\n✅ Successfully launched Claude Code window for ${agentId}`);
    console.log(`📝 Prompt file: ${result.promptFile}`);
    console.log(`\n💡 The agent will work autonomously. Monitor progress in the Claude Code window.`);
    
  } catch (error) {
    console.error(`❌ Failed to launch Claude Code window: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

// Export functions for use by orchestrator
module.exports = {
  detectCursorInstallation,
  launchClaudeCodeWindow,
  monitorCreditsAndFallback
};

module.exports = { launchClaudeCodeWindow, monitorCreditsAndFallback, detectCursorInstallation };
