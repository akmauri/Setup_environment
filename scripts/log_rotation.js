#!/usr/bin/env node
/**
 * Log rotation script - removes logs older than retention period
 * 
 * Usage: node scripts/log_rotation.js [retention_days]
 * Default: 30 days
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', 'logs');
const DEFAULT_RETENTION_DAYS = 30;

function getRetentionDays() {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const days = parseInt(args[0], 10);
    if (!isNaN(days) && days > 0) {
      return days;
    }
  }
  return DEFAULT_RETENTION_DAYS;
}

function getOldDate(retentionDays) {
  const date = new Date();
  date.setDate(date.getDate() - retentionDays);
  return date;
}

function parseDateFromPath(filePath) {
  // Try to extract date from path like: logs/agent_activity/2026-01-15/...
  const dateMatch = filePath.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    return new Date(dateMatch[1]);
  }
  
  // Try to extract date from filename like: 2026-01-15_build.log
  const filename = path.basename(filePath);
  const filenameMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
  if (filenameMatch) {
    return new Date(filenameMatch[1]);
  }
  
  // Fallback: use file modification time
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime;
  } catch (error) {
    return null;
  }
}

function shouldDelete(filePath, cutoffDate) {
  const fileDate = parseDateFromPath(filePath);
  if (!fileDate) {
    return false; // Can't determine date, don't delete
  }
  return fileDate < cutoffDate;
}

function deleteOldFiles(dir, cutoffDate, deleted = []) {
  if (!fs.existsSync(dir)) {
    return deleted;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively check subdirectories
      deleteOldFiles(fullPath, cutoffDate, deleted);
      
      // Check if directory is empty after cleanup
      try {
        const remaining = fs.readdirSync(fullPath);
        if (remaining.length === 0) {
          fs.rmdirSync(fullPath);
          deleted.push({ path: fullPath, type: 'directory' });
        }
      } catch (error) {
        // Directory might have been deleted, ignore
      }
    } else if (entry.isFile()) {
      if (shouldDelete(fullPath, cutoffDate)) {
        try {
          fs.unlinkSync(fullPath);
          deleted.push({ path: fullPath, type: 'file' });
        } catch (error) {
          console.error(`Error deleting ${fullPath}:`, error.message);
        }
      }
    }
  }
  
  return deleted;
}

function main() {
  const retentionDays = getRetentionDays();
  const cutoffDate = getOldDate(retentionDays);
  
  console.log(`Starting log rotation...`);
  console.log(`Retention period: ${retentionDays} days`);
  // Display cutoff date in CST for user
  const cutoffCST = cutoffDate.toLocaleString('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' });
  const cutoffUTC = cutoffDate.toISOString();
  console.log(`Cutoff date: ${cutoffCST.split(',')[0]} (${cutoffUTC.split('T')[0]} UTC)`);
  console.log(`Logs directory: ${LOGS_DIR}`);
  
  if (!fs.existsSync(LOGS_DIR)) {
    console.log('Logs directory does not exist, nothing to clean.');
    return;
  }
  
  const deleted = deleteOldFiles(LOGS_DIR, cutoffDate);
  
  console.log(`\nCleanup complete:`);
  console.log(`  Files deleted: ${deleted.filter(d => d.type === 'file').length}`);
  console.log(`  Directories removed: ${deleted.filter(d => d.type === 'directory').length}`);
  console.log(`  Total items: ${deleted.length}`);
  
  if (deleted.length > 0) {
    console.log(`\nDeleted items:`);
    deleted.forEach(item => {
      console.log(`  - ${item.path} (${item.type})`);
    });
  }
}

if (require.main === module) {
  main();
}

module.exports = { deleteOldFiles, getOldDate, parseDateFromPath };
