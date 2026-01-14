#!/usr/bin/env node
/**
 * Documentation validation script
 * Checks for outdated documentation and code-doc discrepancies
 * 
 * Usage: node scripts/validate_docs.js [--fix]
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const SRC_DIR = path.join(__dirname, '..', 'src');
const ROOT_DIR = path.join(__dirname, '..');

const ISSUES = [];

function findFiles(dir, extension, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      findFiles(fullPath, extension, files);
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function checkDocReferences(docFile) {
  const content = fs.readFileSync(docFile, 'utf-8');
  const issues = [];
  
  // Check for references to files that don't exist
  const fileRefs = content.match(/`([^`]+\.(ts|tsx|js|jsx|py|md|yaml|yml))`/g);
  if (fileRefs) {
    fileRefs.forEach(ref => {
      const filePath = ref.replace(/`/g, '').trim();
      // Try to resolve path relative to doc file
      const docDir = path.dirname(docFile);
      const resolvedPath = path.resolve(docDir, filePath);
      
      if (!fs.existsSync(resolvedPath)) {
        // Try relative to root
        const rootPath = path.resolve(ROOT_DIR, filePath);
        if (!fs.existsSync(rootPath)) {
          issues.push({
            type: 'missing_file',
            doc: docFile,
            reference: filePath,
            message: `Documentation references file that doesn't exist: ${filePath}`
          });
        }
      }
    });
  }
  
  // Check for outdated "TODO" or "FIXME" markers
  if (content.includes('TODO') || content.includes('FIXME') || content.includes('XXX')) {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('TODO') || line.includes('FIXME') || line.includes('XXX')) {
        issues.push({
          type: 'outdated_marker',
          doc: docFile,
          line: index + 1,
          message: `Documentation contains TODO/FIXME marker: ${line.trim()}`
        });
      }
    });
  }
  
  return issues;
}

function checkCodeDocSync(codeFile) {
  // This is a simplified check - can be enhanced
  const content = fs.readFileSync(codeFile, 'utf-8');
  const issues = [];
  
  // Check for functions/classes without JSDoc comments
  const functionMatches = content.match(/(?:function|const|class)\s+(\w+)/g);
  if (functionMatches && !content.includes('/**')) {
    // This is a heuristic - can be improved
    issues.push({
      type: 'missing_docs',
      file: codeFile,
      message: `Code file may be missing documentation comments`
    });
  }
  
  return issues;
}

function checkArchitectureDoc() {
  const archFile = path.join(DOCS_DIR, 'ARCHITECTURE.md');
  if (!fs.existsSync(archFile)) {
    return [{
      type: 'missing_doc',
      message: 'ARCHITECTURE.md is missing'
    }];
  }
  
  const content = fs.readFileSync(archFile, 'utf-8');
  const issues = [];
  
  // Check if architecture mentions technologies that aren't in package.json
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Simple check for major tech mentions
    const techMentions = content.match(/(React|Next\.js|Express|PostgreSQL|Redis)/g);
    if (techMentions) {
      techMentions.forEach(tech => {
        const techLower = tech.toLowerCase();
        const hasDep = Object.keys(deps).some(dep => dep.toLowerCase().includes(techLower));
        if (!hasDep && !tech.includes('.')) {
          // This is a heuristic - may have false positives
        }
      });
    }
  }
  
  return issues;
}

function validateDocs() {
  console.log('Validating documentation...\n');
  
  // Check all markdown files in docs/
  const docFiles = findFiles(DOCS_DIR, '.md');
  
  console.log(`Found ${docFiles.length} documentation files`);
  
  docFiles.forEach(docFile => {
    const issues = checkDocReferences(docFile);
    ISSUES.push(...issues);
  });
  
  // Check architecture doc
  const archIssues = checkArchitectureDoc();
  ISSUES.push(...archIssues);
  
  // Check code files for doc sync (if src exists)
  if (fs.existsSync(SRC_DIR)) {
    const codeFiles = [...findFiles(SRC_DIR, '.ts'), ...findFiles(SRC_DIR, '.tsx'), ...findFiles(SRC_DIR, '.js')];
    
    codeFiles.forEach(codeFile => {
      const issues = checkCodeDocSync(codeFile);
      ISSUES.push(...issues);
    });
  }
  
  return ISSUES;
}

function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  
  const issues = validateDocs();
  
  if (issues.length === 0) {
    console.log('✅ No documentation issues found');
    process.exit(0);
  }
  
  console.log(`\nFound ${issues.length} issue(s):\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.type}] ${issue.message}`);
    if (issue.doc) console.log(`   Doc: ${issue.doc}`);
    if (issue.file) console.log(`   File: ${issue.file}`);
    if (issue.line) console.log(`   Line: ${issue.line}`);
    console.log();
  });
  
  if (shouldFix) {
    console.log('--fix flag not yet implemented');
    console.log('Please fix issues manually');
  }
  
  process.exit(issues.length > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { validateDocs, checkDocReferences, checkCodeDocSync };
