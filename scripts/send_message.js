#!/usr/bin/env node
/**
 * Agent communication helper
 * 
 * Usage:
 *   node scripts/send_message.js --to <agent> --subject <subject> --message <message> [options]
 */

const fs = require('fs');
const path = require('path');

const COMMS_DIR = path.join(__dirname, '..', 'agent_comms');

function ensureCommsDir() {
  if (!fs.existsSync(COMMS_DIR)) {
    fs.mkdirSync(COMMS_DIR, { recursive: true });
  }
}

function sendMessage(options) {
  ensureCommsDir();
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const agentId = options.from || 'system';
  const filename = `${timestamp}_${agentId}.msg`;
  const filepath = path.join(COMMS_DIR, filename);
  
  const message = {
    from: options.from || 'system',
    to: Array.isArray(options.to) ? options.to : [options.to],
    timestamp: new Date().toISOString(),
    type: options.type || 'notification',
    subject: options.subject,
    message: options.message,
    related_tasks: options.relatedTasks || [],
    related_files: options.relatedFiles || [],
    urgency: options.urgency || 'medium',
    requires_response: options.requiresResponse || false,
    response_by: options.responseBy || null
  };
  
  fs.writeFileSync(filepath, JSON.stringify(message, null, 2));
  console.log(`Message sent: ${filename}`);
  return filepath;
}

function checkMessages(agentId) {
  ensureCommsDir();
  
  if (!fs.existsSync(COMMS_DIR)) {
    return [];
  }
  
  const files = fs.readdirSync(COMMS_DIR);
  const messages = [];
  
  for (const file of files) {
    if (file.endsWith('.msg')) {
      try {
        const content = fs.readFileSync(path.join(COMMS_DIR, file), 'utf-8');
        const msg = JSON.parse(content);
        
        // Check if message is for this agent
        if (msg.to.includes(agentId) || msg.to.includes('all')) {
          messages.push({ file, ...msg });
        }
      } catch (error) {
        console.error(`Error reading message ${file}:`, error.message);
      }
    }
  }
  
  return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function archiveOldMessages(days = 7) {
  ensureCommsDir();
  
  if (!fs.existsSync(COMMS_DIR)) {
    return 0;
  }
  
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  const files = fs.readdirSync(COMMS_DIR);
  let archived = 0;
  
  for (const file of files) {
    if (file.endsWith('.msg')) {
      const filepath = path.join(COMMS_DIR, file);
      const stats = fs.statSync(filepath);
      
      if (stats.mtime < cutoff) {
        // Move to archive (or delete if no archive)
        fs.unlinkSync(filepath);
        archived++;
      }
    }
  }
  
  console.log(`Archived ${archived} old messages`);
  return archived;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--check')) {
    const agentIndex = args.indexOf('--check');
    const agentId = args[agentIndex + 1] || 'all';
    const messages = checkMessages(agentId);
    
    if (messages.length === 0) {
      console.log('No messages found');
    } else {
      console.log(`Found ${messages.length} message(s):\n`);
      messages.forEach(msg => {
        console.log(`From: ${msg.from}`);
        console.log(`Subject: ${msg.subject}`);
        console.log(`Type: ${msg.type}`);
        console.log(`Urgency: ${msg.urgency}`);
        console.log(`Message: ${msg.message}`);
        console.log(`---`);
      });
    }
    return;
  }
  
  if (args.includes('--archive')) {
    const daysIndex = args.indexOf('--archive');
    const days = parseInt(args[daysIndex + 1]) || 7;
    archiveOldMessages(days);
    return;
  }
  
  // Parse send message options
  const getArg = (flag) => {
    const index = args.indexOf(flag);
    return index >= 0 && index < args.length - 1 ? args[index + 1] : null;
  };
  
  const to = getArg('--to');
  const subject = getArg('--subject');
  const message = getArg('--message');
  
  if (!to || !subject || !message) {
    console.log('Usage:');
    console.log('  Send: node scripts/send_message.js --to <agent> --subject <subject> --message <message> [--from <agent>] [--type <type>] [--urgency <urgency>]');
    console.log('  Check: node scripts/send_message.js --check [agent_id]');
    console.log('  Archive: node scripts/send_message.js --archive [days]');
    process.exit(1);
  }
  
  const options = {
    from: getArg('--from') || 'system',
    to,
    subject,
    message,
    type: getArg('--type') || 'notification',
    urgency: getArg('--urgency') || 'medium',
    relatedTasks: getArg('--tasks') ? getArg('--tasks').split(',') : [],
    relatedFiles: getArg('--files') ? getArg('--files').split(',') : [],
    requiresResponse: args.includes('--requires-response'),
    responseBy: getArg('--response-by')
  };
  
  sendMessage(options);
}

if (require.main === module) {
  main();
}

module.exports = { sendMessage, checkMessages, archiveOldMessages };
