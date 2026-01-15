#!/usr/bin/env node
/**
 * Validate prd.json format
 * 
 * Usage: node scripts/ralph/validate-prd.js [prd-file]
 */

const fs = require('fs');
const path = require('path');

const PRD_PATH = process.argv[2] || path.join(__dirname, '..', '..', 'prd.json');

function validatePRD() {
  try {
    if (!fs.existsSync(PRD_PATH)) {
      console.error(`❌ PRD file not found: ${PRD_PATH}`);
      process.exit(1);
    }

    const prd = JSON.parse(fs.readFileSync(PRD_PATH, 'utf-8'));
    const errors = [];
    const warnings = [];

    // Validate structure
    if (!prd.projectName) warnings.push('Missing projectName');
    if (!prd.userStories || !Array.isArray(prd.userStories)) {
      errors.push('Missing or invalid userStories array');
    }

    // Validate each story
    if (prd.userStories) {
      prd.userStories.forEach((story, index) => {
        const prefix = `Story ${story.id || index}:`;

        if (!story.id) errors.push(`${prefix} Missing id`);
        if (!story.title) errors.push(`${prefix} Missing title`);
        if (typeof story.passes !== 'boolean') {
          errors.push(`${prefix} Missing or invalid passes field (must be boolean)`);
        }
        if (!story.acceptanceCriteria || !Array.isArray(story.acceptanceCriteria)) {
          errors.push(`${prefix} Missing or invalid acceptanceCriteria array`);
        }
        if (story.acceptanceCriteria && story.acceptanceCriteria.length === 0) {
          warnings.push(`${prefix} No acceptance criteria`);
        }
        if (story.priority === undefined || typeof story.priority !== 'number') {
          warnings.push(`${prefix} Missing or invalid priority`);
        }
        if (story.dependencies && !Array.isArray(story.dependencies)) {
          errors.push(`${prefix} Dependencies must be an array`);
        }
        if (story.estimatedComplexity && !['low', 'medium', 'high'].includes(story.estimatedComplexity)) {
          warnings.push(`${prefix} Invalid estimatedComplexity (should be low/medium/high)`);
        }

        // Check dependencies reference valid story IDs
        if (story.dependencies && Array.isArray(story.dependencies)) {
          story.dependencies.forEach(depId => {
            const depExists = prd.userStories.some(s => s.id === depId);
            if (!depExists) {
              errors.push(`${prefix} Dependency "${depId}" does not exist`);
            }
          });
        }
      });
    }

    // Check for circular dependencies
    if (prd.userStories) {
      function hasCircularDependency(storyId, visited = new Set(), path = []) {
        if (visited.has(storyId)) {
          if (path.includes(storyId)) {
            return true; // Circular dependency found
          }
          return false;
        }

        visited.add(storyId);
        const story = prd.userStories.find(s => s.id === storyId);
        if (!story || !story.dependencies) return false;

        for (const depId of story.dependencies) {
          if (hasCircularDependency(depId, visited, [...path, storyId])) {
            return true;
          }
        }

        return false;
      }

      prd.userStories.forEach(story => {
        if (hasCircularDependency(story.id)) {
          errors.push(`Circular dependency detected involving story ${story.id}`);
        }
      });
    }

    // Report results
    if (errors.length > 0) {
      console.error('\n❌ Validation Errors:');
      errors.forEach(err => console.error(`  - ${err}`));
    }

    if (warnings.length > 0) {
      console.warn('\n⚠️  Validation Warnings:');
      warnings.forEach(warn => console.warn(`  - ${warn}`));
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log('\n✅ PRD validation passed!');
      console.log(`   Found ${prd.userStories.length} user stories`);
    } else if (errors.length === 0) {
      console.log('\n✅ PRD validation passed (with warnings)');
      console.log(`   Found ${prd.userStories.length} user stories`);
    } else {
      console.error('\n❌ PRD validation failed');
      process.exit(1);
    }

    console.log('');

  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('❌ Invalid JSON:', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  validatePRD();
}

module.exports = { validatePRD };
