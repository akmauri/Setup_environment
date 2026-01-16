#!/usr/bin/env node
/**
 * Lock management utility for agent coordination
 * 
 * Usage:
 *   node scripts/manage_locks.js list                    # List all active locks
 *   node scripts/manage_locks.js check <task_id>        # Check if task is locked
 *   node scripts/manage_locks.js remove <task_id>       # Remove lock (coordinator only)
 *   node scripts/manage_locks.js cleanup                 # Remove expired locks
 */

const fs = require('fs');
const path = require('path');

const LOCK_DIR = path.join(__dirname, '..', '.lock');

function ensureLockDir() {
  if (!fs.existsSync(LOCK_DIR)) {
    fs.mkdirSync(LOCK_DIR, { recursive: true });
  }
}

function listLocks() {
  ensureLockDir();
  const locks = [];
  
  if (!fs.existsSync(LOCK_DIR)) {
    return locks;
  }
  
  const files = fs.readdirSync(LOCK_DIR);
  
  for (const file of files) {
    if (file.endsWith('.lock')) {
      const lockPath = path.join(LOCK_DIR, file);
      try {
        const content = fs.readFileSync(lockPath, 'utf-8');
        const lock = JSON.parse(content);
        const now = new Date();
        const expiresAt = new Date(lock.expires_at);
        
        lock.is_expired = expiresAt < now;
        lock.file = file;
        locks.push(lock);
      } catch (error) {
        console.error(`Error reading lock file ${file}:`, error.message);
      }
    }
  }
  
  return locks;
}

function checkLock(taskId) {
  const lockFile = path.join(LOCK_DIR, `${taskId}.lock`);
  
  if (!fs.existsSync(lockFile)) {
    return { locked: false };
  }
  
  try {
    const content = fs.readFileSync(lockFile, 'utf-8');
    const lock = JSON.parse(content);
    const now = new Date();
    const expiresAt = new Date(lock.expires_at);
    
    if (expiresAt < now) {
      return { locked: false, expired: true, lock };
    }
    
    return { locked: true, lock };
  } catch (error) {
    return { locked: false, error: error.message };
  }
}

function removeLock(taskId, force = false) {
  const lockFile = path.join(LOCK_DIR, `${taskId}.lock`);
  
  if (!fs.existsSync(lockFile)) {
    console.log(`No lock found for task ${taskId}`);
    return false;
  }
  
  if (!force) {
    const lock = checkLock(taskId);
    if (lock.locked && !lock.expired) {
      console.error(`Task ${taskId} is actively locked by ${lock.lock.agent_id}`);
      console.error('Use --force to override (coordinator only)');
      return false;
    }
  }
  
  try {
    fs.unlinkSync(lockFile);
    console.log(`Lock removed for task ${taskId}`);
    return true;
  } catch (error) {
    console.error(`Error removing lock:`, error.message);
    return false;
  }
}

function cleanupExpired() {
  const locks = listLocks();
  const expired = locks.filter(l => l.is_expired);
  
  console.log(`Found ${expired.length} expired locks`);
  
  let removed = 0;
  for (const lock of expired) {
    if (removeLock(lock.task_id, true)) {
      removed++;
    }
  }
  
  console.log(`Removed ${removed} expired locks`);
  return removed;
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  ensureLockDir();
  
  switch (command) {
    case 'list':
      const locks = listLocks();
      if (locks.length === 0) {
        console.log('No active locks');
      } else {
        console.log(`Active locks (${locks.length}):`);
        locks.forEach(lock => {
          const status = lock.is_expired ? 'EXPIRED' : 'ACTIVE';
          const expiresAt = new Date(lock.expires_at);
          // Display CST time for user
          const expiresCST = expiresAt.toLocaleString('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' });
          const expiresUTC = expiresAt.toISOString();
          console.log(`  ${lock.task_id}:`);
          console.log(`    Agent: ${lock.agent_id}`);
          console.log(`    Status: ${status}`);
          console.log(`    Expires: ${expiresCST} (${expiresUTC} UTC)`);
          console.log(`    Reason: ${lock.reason}`);
        });
      }
      break;
      
    case 'check':
      if (!args[1]) {
        console.error('Usage: node scripts/manage_locks.js check <task_id>');
        process.exit(1);
      }
      const result = checkLock(args[1]);
      if (result.locked) {
        const expiresAt = new Date(result.lock.expires_at);
        const expiresCST = expiresAt.toLocaleString('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' });
        const expiresUTC = expiresAt.toISOString();
        console.log(`Task ${args[1]} is locked by ${result.lock.agent_id}`);
        console.log(`Expires: ${expiresCST} (${expiresUTC} UTC)`);
      } else if (result.expired) {
        console.log(`Task ${args[1]} has an expired lock`);
      } else {
        console.log(`Task ${args[1]} is not locked`);
      }
      break;
      
    case 'remove':
      if (!args[1]) {
        console.error('Usage: node scripts/manage_locks.js remove <task_id> [--force]');
        process.exit(1);
      }
      const removeForce = args.includes('--force');
      removeLock(args[1], removeForce);
      break;
      
    case 'cleanup':
      const cleanupForce = args.includes('--force') || args.includes('-f');
      if (cleanupForce) {
        // Force remove all locks
        const locks = listLocks();
        let removed = 0;
        for (const lock of locks) {
          if (removeLock(lock.task_id, true)) {
            removed++;
          }
        }
        console.log(`Force cleanup: Removed ${removed} locks`);
      } else {
        cleanupExpired();
      }
      break;
      
    default:
      console.log('Usage:');
      console.log('  node scripts/manage_locks.js list');
      console.log('  node scripts/manage_locks.js check <task_id>');
      console.log('  node scripts/manage_locks.js remove <task_id> [--force]');
      console.log('  node scripts/manage_locks.js cleanup');
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { listLocks, checkLock, removeLock, cleanupExpired };
