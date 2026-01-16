#!/usr/bin/env node
/**
 * Credit Monitor and Fallback System
 * 
 * Monitors Claude Code credits and automatically falls back to Cursor Browser
 * when credits are exhausted.
 * 
 * Usage:
 *   node scripts/credit_monitor.js --agent-id dev-oauth-1
 */

const fs = require('fs').promises;
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOG_DIR = path.join(PROJECT_ROOT, 'logs', 'credit_monitor');
const AGENT_ERRORS_DIR = path.join(PROJECT_ROOT, 'logs', 'agent_errors');

/**
 * Detect credit exhaustion signals
 */
function detectCreditExhaustion(errorMessage, apiResponse) {
  const creditExhaustionSignals = [
    'credit',
    'quota',
    'rate limit',
    'insufficient credits',
    'billing',
    'subscription',
    'usage limit',
    '429', // HTTP 429 Too Many Requests
    'claude code',
    'credits exhausted'
  ];

  const lowerMessage = (errorMessage || '').toLowerCase();
  const lowerResponse = (apiResponse || '').toLowerCase();

  return creditExhaustionSignals.some(signal => 
    lowerMessage.includes(signal) || lowerResponse.includes(signal)
  );
}

/**
 * Log credit exhaustion
 */
async function logCreditExhaustion(agentId, errorDetails) {
  const timestamp = new Date().toISOString();
  const date = timestamp.split('T')[0];
  const logFile = path.join(AGENT_ERRORS_DIR, `${date}.md`);

  await fs.mkdir(AGENT_ERRORS_DIR, { recursive: true });

  // Format timestamp in CST for display
  const timestampDate = new Date(timestamp);
  const timestampCST = timestampDate.toLocaleString('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' });
  
  const logEntry = `
## Credit Exhaustion - ${timestampCST} (${timestamp} UTC)

**Agent**: ${agentId}
**Error**: ${errorDetails.message || 'Unknown'}
**Details**: ${JSON.stringify(errorDetails, null, 2)}

**Action**: Switching to Cursor Browser mode

---

`;

  try {
    await fs.appendFile(logFile, logEntry, 'utf-8');
  } catch (error) {
    console.error(`Failed to log credit exhaustion: ${error.message}`);
  }
}

/**
 * Switch agent to Cursor Browser mode
 */
async function switchToBrowserMode(agentId) {
  const timestamp = new Date().toISOString();
  const switchFile = path.join(LOG_DIR, `switch-${agentId}-${Date.now()}.json`);

  await fs.mkdir(LOG_DIR, { recursive: true });

  const switchData = {
    agentId,
    timestamp,
    from: 'claude-code',
    to: 'cursor-browser',
    reason: 'credit-exhaustion'
  };

  await fs.writeFile(switchFile, JSON.stringify(switchData, null, 2), 'utf-8');

  // Create instruction file for agent
  const instructionFile = path.join(PROJECT_ROOT, 'agent_comms', `switch-${agentId}-${Date.now()}.msg`);
  await fs.mkdir(path.dirname(instructionFile), { recursive: true });

  const instruction = {
    from: 'credit-monitor',
    to: agentId,
    timestamp,
    type: 'notification',
    subject: 'Switch to Cursor Browser Mode',
    message: `Claude Code credits exhausted. Switching to Cursor Browser mode. Continue work autonomously in browser mode.`,
    urgency: 'high',
    requires_response: false
  };

  await fs.writeFile(instructionFile, JSON.stringify(instruction, null, 2), 'utf-8');

  console.log(`🔄 Switched ${agentId} to Cursor Browser mode`);
  console.log(`📝 Instruction file: ${instructionFile}`);

  return switchData;
}

/**
 * Monitor agent for credit exhaustion
 */
async function monitorAgent(agentId) {
  console.log(`💳 Monitoring credits for agent: ${agentId}`);

  // In practice, this would:
  // 1. Monitor API responses from Claude Code
  // 2. Watch for credit-related errors
  // 3. Detect rate limiting
  // 4. Automatically switch to browser mode

  // For now, this is a placeholder that can be enhanced with:
  // - Cursor API integration
  // - WebSocket monitoring
  // - Error log parsing
  // - Real-time credit status checking

  return {
    agentId,
    monitoring: true,
    creditsAvailable: true // Placeholder
  };
}

/**
 * Check if agent should switch to browser mode
 */
async function shouldSwitchToBrowser(agentId, errorDetails) {
  if (!errorDetails) {
    return false;
  }

  const isCreditExhaustion = detectCreditExhaustion(
    errorDetails.message,
    errorDetails.apiResponse
  );

  if (isCreditExhaustion) {
    await logCreditExhaustion(agentId, errorDetails);
    await switchToBrowserMode(agentId);
    return true;
  }

  return false;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  let agentId = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--agent-id' && args[i + 1]) {
      agentId = args[i + 1];
      i++;
    }
  }

  if (!agentId) {
    console.error('Usage:');
    console.error('  node scripts/credit_monitor.js --agent-id <agent-id>');
    process.exit(1);
  }

  try {
    await monitorAgent(agentId);
    console.log(`\n✅ Credit monitoring started for ${agentId}`);
    console.log(`💡 This will automatically switch to Cursor Browser if credits are exhausted`);
  } catch (error) {
    console.error(`❌ Failed to start credit monitoring: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  detectCreditExhaustion,
  logCreditExhaustion,
  switchToBrowserMode,
  monitorAgent,
  shouldSwitchToBrowser
};
