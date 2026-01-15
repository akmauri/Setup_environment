#!/usr/bin/env node
/**
 * Convert PRD markdown to Ralph prd.json format
 * 
 * Usage: node scripts/ralph/convert-prd-to-json.js [prd-file] [output-file]
 * 
 * Example:
 *   node scripts/ralph/convert-prd-to-json.js docs/prd.md prd.json
 */

const fs = require('fs');
const path = require('path');

const PRD_PATH = process.argv[2] || path.join(__dirname, '..', '..', 'docs', 'prd.md');
const OUTPUT_PATH = process.argv[3] || path.join(__dirname, '..', '..', 'prd.json');

function parsePRD(content) {
  const lines = content.split('\n');
  const result = {
    projectName: 'MPCAS2',
    version: '1.0.0',
    branchName: null,
    createdAt: new Date().toISOString(),
    userStories: []
  };

  let currentEpic = null;
  let currentStory = null;
  let inAcceptanceCriteria = false;
  let acceptanceCriteria = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Extract project name from header
    if (line.startsWith('# ') && line.includes('Product Requirements Document')) {
      // Try to extract project name from next few lines
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const nextLine = lines[j];
        if (nextLine.includes('**Project:**')) {
          const match = nextLine.match(/\*\*Project:\*\*\s*(.+)/);
          if (match) {
            result.projectName = match[1].trim();
          }
          break;
        }
      }
    }

    // Detect Epic
    if (line.match(/^## Epic \d+:/)) {
      const epicMatch = line.match(/^## Epic \d+:\s*(.+)/);
      if (epicMatch) {
        currentEpic = epicMatch[1].trim();
      }
      continue;
    }

    // Detect Story (### Story X.Y:)
    if (line.match(/^### Story \d+\.\d+:/)) {
      // Save previous story if exists
      if (currentStory) {
        currentStory.acceptanceCriteria = acceptanceCriteria;
        result.userStories.push(currentStory);
      }

      const storyMatch = line.match(/^### Story (\d+\.\d+):\s*(.+)/);
      if (storyMatch) {
        currentStory = {
          id: storyMatch[1],
          title: storyMatch[2].trim(),
          epic: currentEpic || 'Unknown Epic',
          priority: parseInt(storyMatch[1].split('.')[0]) * 10 + parseInt(storyMatch[1].split('.')[1]),
          passes: false,
          acceptanceCriteria: [],
          dependencies: [],
          estimatedComplexity: 'medium',
          notes: ''
        };
        acceptanceCriteria = [];
        inAcceptanceCriteria = false;
      }
      continue;
    }

    // Detect User Story format (As a... I want... so that...)
    if (currentStory && line.startsWith('As a')) {
      // Extract user story text
      let userStoryText = line;
      // Continue reading until we hit Acceptance Criteria
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].trim().startsWith('**Acceptance Criteria:**')) {
          break;
        }
        if (lines[j].trim()) {
          userStoryText += ' ' + lines[j].trim();
        }
      }
      // Store user story in notes for now
      if (!currentStory.notes) {
        currentStory.notes = userStoryText;
      }
      continue;
    }

    // Detect Acceptance Criteria section
    if (line.includes('**Acceptance Criteria:**') || line.includes('Acceptance Criteria:')) {
      inAcceptanceCriteria = true;
      acceptanceCriteria = [];
      continue;
    }

    // Parse acceptance criteria (numbered list)
    if (inAcceptanceCriteria && currentStory) {
      // Match numbered list items (1., 2., etc.)
      const acMatch = line.match(/^\d+\.\s*(.+)/);
      if (acMatch) {
        acceptanceCriteria.push(acMatch[1].trim());
      } else if (line.startsWith('-')) {
        // Also support bullet points
        acceptanceCriteria.push(line.replace(/^-\s*/, '').trim());
      } else if (line && !line.startsWith('###') && !line.startsWith('##') && !line.startsWith('---')) {
        // Continue previous AC if line doesn't start a new section
        if (acceptanceCriteria.length > 0 && !line.match(/^\d+\./)) {
          // Append to last AC if it's a continuation
          acceptanceCriteria[acceptanceCriteria.length - 1] += ' ' + line.trim();
        }
      } else if (line.startsWith('###') || line.startsWith('##') || line.startsWith('---')) {
        // End of acceptance criteria section
        inAcceptanceCriteria = false;
      }
    }

    // Detect dependencies (look for "Dependencies:" or "Depends on:")
    if (currentStory && (line.includes('Dependencies:') || line.includes('Depends on:'))) {
      const depMatch = line.match(/(?:Dependencies|Depends on):\s*(.+)/i);
      if (depMatch) {
        // Parse dependency IDs (e.g., "1.1, 1.2" or "[1.1]")
        const deps = depMatch[1].match(/\d+\.\d+/g);
        if (deps) {
          currentStory.dependencies = deps;
        }
      }
    }

    // Detect complexity hints
    if (currentStory && (line.toLowerCase().includes('complexity') || line.toLowerCase().includes('complex'))) {
      if (line.toLowerCase().includes('high') || line.toLowerCase().includes('large')) {
        currentStory.estimatedComplexity = 'high';
      } else if (line.toLowerCase().includes('low') || line.toLowerCase().includes('small')) {
        currentStory.estimatedComplexity = 'low';
      }
    }
  }

  // Save last story
  if (currentStory) {
    currentStory.acceptanceCriteria = acceptanceCriteria;
    result.userStories.push(currentStory);
  }

  return result;
}

function main() {
  try {
    console.log(`Reading PRD from: ${PRD_PATH}`);
    const content = fs.readFileSync(PRD_PATH, 'utf-8');

    console.log('Parsing PRD...');
    const prdJson = parsePRD(content);

    console.log(`Found ${prdJson.userStories.length} user stories`);

    // Validate output
    if (prdJson.userStories.length === 0) {
      console.warn('⚠️  Warning: No user stories found in PRD');
      console.warn('   Make sure your PRD follows the format:');
      console.warn('   ## Epic X: ...');
      console.warn('   ### Story X.Y: Title');
      console.warn('   **Acceptance Criteria:**');
      console.warn('   1. ...');
      process.exit(1);
    }

    // Write output
    console.log(`Writing to: ${OUTPUT_PATH}`);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(prdJson, null, 2), 'utf-8');

    console.log('✅ Conversion complete!');
    console.log(`\nFound ${prdJson.userStories.length} user stories`);
    console.log(`\nNext steps:`);
    console.log(`1. Validate: npm run ralph:validate`);
    console.log(`2. Check status: npm run ralph:status`);
    console.log(`3. Review ${OUTPUT_PATH} and adjust if needed`);
    console.log(`4. Start Ralph: Load scripts/ralph/ralph-prompt.md in Cursor chat`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parsePRD };
