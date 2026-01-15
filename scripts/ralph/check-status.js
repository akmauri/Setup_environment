#!/usr/bin/env node
/**
 * Check Ralph process status
 * 
 * Usage: node scripts/ralph/check-status.js [prd-file]
 * 
 * Shows:
 * - Total stories
 * - Stories completed (passes: true)
 * - Stories remaining (passes: false)
 * - Next story to implement
 */

const fs = require('fs');
const path = require('path');

const PRD_PATH = process.argv[2] || path.join(__dirname, '..', '..', 'prd.json');

function checkStatus() {
  try {
    if (!fs.existsSync(PRD_PATH)) {
      console.error(`❌ PRD file not found: ${PRD_PATH}`);
      console.error(`   Run: npm run ralph:convert`);
      process.exit(1);
    }

    const prd = JSON.parse(fs.readFileSync(PRD_PATH, 'utf-8'));
    const stories = prd.userStories || [];

    const total = stories.length;
    const completed = stories.filter(s => s.passes === true).length;
    const remaining = stories.filter(s => s.passes === false).length;

    console.log('\n📊 Ralph Process Status\n');
    console.log(`Project: ${prd.projectName || 'Unknown'}`);
    console.log(`Branch: ${prd.branchName || 'main'}`);
    console.log(`\nStories:`);
    console.log(`  Total: ${total}`);
    console.log(`  ✅ Completed: ${completed}`);
    console.log(`  ⏳ Remaining: ${remaining}`);
    console.log(`  Progress: ${((completed / total) * 100).toFixed(1)}%`);

    if (remaining > 0) {
      // Find next story to implement
      const nextStories = stories
        .filter(s => !s.passes)
        .filter(s => {
          // Check if dependencies are met
          if (!s.dependencies || s.dependencies.length === 0) return true;
          return s.dependencies.every(depId => {
            const dep = stories.find(st => st.id === depId);
            return dep && dep.passes === true;
          });
        })
        .sort((a, b) => a.priority - b.priority);

      if (nextStories.length > 0) {
        const next = nextStories[0];
        console.log(`\n🎯 Next Story to Implement:`);
        console.log(`  ID: ${next.id}`);
        console.log(`  Title: ${next.title}`);
        console.log(`  Epic: ${next.epic}`);
        console.log(`  Priority: ${next.priority}`);
        console.log(`  Complexity: ${next.estimatedComplexity}`);
        if (next.dependencies && next.dependencies.length > 0) {
          console.log(`  Dependencies: ${next.dependencies.join(', ')}`);
        }
      } else {
        console.log(`\n⚠️  No stories ready (all remaining stories have unmet dependencies)`);
        const blocked = stories
          .filter(s => !s.passes)
          .filter(s => {
            if (!s.dependencies || s.dependencies.length === 0) return false;
            return s.dependencies.some(depId => {
              const dep = stories.find(st => st.id === depId);
              return !dep || dep.passes !== true;
            });
          });
        if (blocked.length > 0) {
          console.log(`\nBlocked Stories:`);
          blocked.forEach(s => {
            const unmetDeps = s.dependencies.filter(depId => {
              const dep = stories.find(st => st.id === depId);
              return !dep || dep.passes !== true;
            });
            console.log(`  - ${s.id}: ${s.title} (waiting for: ${unmetDeps.join(', ')})`);
          });
        }
      }
    } else {
      console.log(`\n🎉 All stories complete!`);
      console.log(`   Output: <promise>COMPLETE</promise>`);
    }

    // Show progress by epic
    const epics = {};
    stories.forEach(s => {
      const epic = s.epic || 'Unknown Epic';
      if (!epics[epic]) {
        epics[epic] = { total: 0, completed: 0 };
      }
      epics[epic].total++;
      if (s.passes) epics[epic].completed++;
    });

    if (Object.keys(epics).length > 1) {
      console.log(`\n📈 Progress by Epic:`);
      Object.entries(epics)
        .sort((a, b) => {
          const aProgress = a[1].completed / a[1].total;
          const bProgress = b[1].completed / b[1].total;
          return bProgress - aProgress;
        })
        .forEach(([epic, stats]) => {
          const progress = ((stats.completed / stats.total) * 100).toFixed(1);
          const bar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
          console.log(`  ${epic}: ${bar} ${stats.completed}/${stats.total} (${progress}%)`);
        });
    }

    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  checkStatus();
}

module.exports = { checkStatus };
