# Code Review Command

When this command is invoked, perform a comprehensive code review of the current changes or specified files.

## Review Process

1. **Code Quality**
   - Check adherence to code standards (see `.cursor/rules/code-standards.mdc`)
   - Identify code smells and anti-patterns
   - Verify code readability and maintainability
   - Check for code duplication

2. **Best Practices**
   - Verify SOLID principles are followed
   - Check error handling implementation
   - Verify security best practices
   - Check performance considerations

3. **Testing**
   - Verify tests exist for new code
   - Check test coverage
   - Verify tests are meaningful and comprehensive
   - Check for edge cases in tests

4. **Documentation**
   - Verify code is well-commented (where needed)
   - Check that complex logic is explained
   - Verify public APIs are documented
   - Check README/docs are updated if needed

5. **Integration**
   - Verify code integrates properly with existing codebase
   - Check for breaking changes
   - Verify no conflicts with other features
   - Check dependencies and imports

6. **Functionality**
   - Verify code meets requirements
   - Check for bugs or potential issues
   - Verify edge cases are handled
   - Check input validation

## Review Output Format

Provide feedback in this structure:

### ✅ Strengths

- List what's done well

### ⚠️ Issues & Suggestions

- **Issue Type**: Description
  - Impact: [High/Medium/Low]
  - Suggestion: How to fix

### 📝 Recommendations

- Specific improvements to consider

### ✅ Approval Status

- [APPROVED] / [NEEDS_CHANGES] / [REQUEST_CLARIFICATION]

## Guidelines

- Be constructive and specific
- Provide code examples for suggestions
- Prioritize high-impact issues
- Acknowledge good practices
- Consider the developer's experience level
- Reference relevant documentation or standards
