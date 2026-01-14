# Common Errors Knowledge Base

This document contains solutions to frequently encountered errors. Agents should check here before escalating errors.

## How to Use This Document

1. When an error occurs, search this document for similar error messages or patterns
2. If found, apply the documented solution
3. If solution works, document the resolution in your error log
4. If solution doesn't work or error is new, follow the error handling protocol in `agent_rules/error_handling.md`

## Error Categories

- [Configuration Errors](#configuration-errors)
- [Dependency Errors](#dependency-errors)
- [Data Errors](#data-errors)
- [Logic Errors](#logic-errors)
- [Integration Errors](#integration-errors)

---

## Configuration Errors

### Missing Environment Variables

**Symptoms**:

- Error: "Environment variable X is not defined"
- Application fails to start
- API calls fail with authentication errors

**Root Cause**:
Required environment variables not set in `.env` file or environment

**Solution**:

1. Check `.env.example` for required variables
2. Copy missing variables to `.env`
3. Set appropriate values
4. Restart application

**Prevention**:

- Always check `.env.example` when setting up
- Document all required environment variables
- Use validation on startup to catch missing variables early

**Related Tasks**: Setup and configuration tasks

---

### Incorrect File Paths

**Symptoms**:

- Error: "File not found" or "ENOENT"
- Import errors
- Module resolution failures

**Root Cause**:
Relative/absolute path issues, incorrect directory structure

**Solution**:

1. Verify file exists at expected location
2. Check path is relative to correct base directory
3. Use path.join() or path.resolve() for cross-platform compatibility
4. Verify directory structure matches documentation

**Prevention**:

- Use consistent path resolution utilities
- Document expected directory structure
- Use TypeScript path aliases for common paths

**Related Tasks**: File organization, build setup

---

## Dependency Errors

### Missing npm Packages

**Symptoms**:

- Error: "Cannot find module 'X'"
- Import errors
- Build failures

**Root Cause**:
Package not installed or version mismatch

**Solution**:

1. Run `npm install` to install missing packages
2. Check `package.json` for correct package names
3. Verify package versions match requirements
4. Clear `node_modules` and reinstall if needed: `rm -rf node_modules && npm install`

**Prevention**:

- Keep `package.json` and `package-lock.json` in sync
- Document all dependencies
- Use exact versions for critical packages

**Related Tasks**: Package management, dependency setup

---

### Version Conflicts

**Symptoms**:

- Peer dependency warnings
- Runtime errors with specific functionality
- Incompatible API usage

**Root Cause**:
Package versions incompatible with each other

**Solution**:

1. Check peer dependency requirements
2. Update packages to compatible versions
3. Use `npm ls` to identify conflict chain
4. Consider using `npm install --legacy-peer-deps` if necessary (temporary)

**Prevention**:

- Regularly update dependencies
- Test after dependency updates
- Document version requirements

**Related Tasks**: Dependency management

---

## Data Errors

### Invalid JSON Format

**Symptoms**:

- JSON.parse() errors
- "Unexpected token" errors
- Data not loading

**Root Cause**:
Malformed JSON, trailing commas, unescaped characters

**Solution**:

1. Validate JSON using JSONLint or similar
2. Check for trailing commas
3. Verify all strings are properly escaped
4. Use JSON.stringify() when creating JSON programmatically

**Prevention**:

- Use JSON validators before committing
- Use proper JSON serialization libraries
- Add JSON validation in code

**Related Tasks**: Data handling, API integration

---

### Type Mismatches

**Symptoms**:

- TypeScript compilation errors
- Runtime type errors
- Unexpected behavior

**Root Cause**:
Data doesn't match expected type

**Solution**:

1. Check TypeScript types match actual data
2. Add type guards/validation
3. Fix data source if incorrect
4. Update type definitions if needed

**Prevention**:

- Use strict TypeScript settings
- Add runtime validation (Zod, Yup)
- Document expected data formats

**Related Tasks**: Type safety, data validation

---

## Logic Errors

### Race Conditions

**Symptoms**:

- Inconsistent behavior
- Data corruption
- Timing-dependent bugs

**Root Cause**:
Multiple async operations accessing shared state without coordination

**Solution**:

1. Use locks or semaphores
2. Implement proper async/await patterns
3. Use transactions for database operations
4. Add proper error handling and rollback

**Prevention**:

- Design for concurrency from start
- Use proper locking mechanisms
- Test with concurrent operations

**Related Tasks**: Concurrent operations, state management

---

### Infinite Loops

**Symptoms**:

- Application hangs
- High CPU usage
- Timeout errors

**Root Cause**:
Loop condition never becomes false

**Solution**:

1. Add loop counter with maximum iterations
2. Check loop condition logic
3. Add break conditions
4. Use proper iteration patterns (map, forEach, etc.)

**Prevention**:

- Always have exit conditions
- Test edge cases
- Use iteration utilities instead of manual loops when possible

**Related Tasks**: Algorithm implementation

---

## Integration Errors

### API Authentication Failures

**Symptoms**:

- 401 Unauthorized errors
- Token expiration errors
- Authentication timeout

**Root Cause**:
Invalid credentials, expired tokens, incorrect auth headers

**Solution**:

1. Verify API keys/tokens are correct
2. Check token expiration and refresh if needed
3. Verify auth header format
4. Test credentials independently

**Prevention**:

- Implement token refresh logic
- Handle auth errors gracefully
- Log auth failures for debugging

**Related Tasks**: API integration, authentication

---

### Network Timeouts

**Symptoms**:

- Request timeout errors
- Connection refused
- Slow API responses

**Root Cause**:
Network issues, service unavailability, timeout too short

**Solution**:

1. Increase timeout values if appropriate
2. Implement retry logic with exponential backoff
3. Check service status
4. Verify network connectivity

**Prevention**:

- Set appropriate timeout values
- Implement retry logic
- Monitor service health
- Use connection pooling

**Related Tasks**: API integration, error handling

---

## Contributing to This Document

When you encounter a new error and find a solution:

1. Add it to the appropriate category
2. Follow the format: Symptoms, Root Cause, Solution, Prevention
3. Include related task IDs
4. Update this document immediately after resolving

## Maintenance

- Review this document monthly
- Remove outdated solutions
- Consolidate similar errors
- Update solutions based on new learnings
