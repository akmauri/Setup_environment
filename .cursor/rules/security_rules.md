# Security Rules

This document defines security rules that all agents must follow.

## Never Commit Secrets

### What Are Secrets?

- API keys and tokens
- Passwords and credentials
- Private keys and certificates
- Database connection strings with passwords
- OAuth client secrets
- Encryption keys
- Any sensitive configuration

### Rules

1. **Never commit secrets to version control**
2. **Use environment variables** for all secrets
3. **Use `.env` files** (gitignored) for local development
4. **Use `.env.example`** (committed) with placeholder values
5. **Never log secrets** in code or logs
6. **Never hardcode secrets** in source code

### Examples

❌ **BAD**:

```typescript
const API_KEY = 'sk-1234567890abcdef';
const dbPassword = 'mypassword123';
```

✅ **GOOD**:

```typescript
const API_KEY = process.env.API_KEY;
const dbPassword = process.env.DB_PASSWORD;
```

## Environment Variable Handling

### Local Development

1. **Create `.env` file** (gitignored)
2. **Copy from `.env.example`**
3. **Fill in actual values**
4. **Never commit `.env`**

### Production

1. **Use secure secret management** (AWS Secrets Manager, etc.)
2. **Inject at runtime** (not in code)
3. **Rotate regularly**
4. **Use least privilege**

### Environment Files

**`.env.example`** (committed):

```bash
# API Keys
API_KEY=your-api-key-here
DB_PASSWORD=your-password-here

# Never commit actual values
```

**`.env`** (gitignored):

```bash
# Actual values (not committed)
API_KEY=sk-actual-key-123
DB_PASSWORD=actual-password-456
```

## API Key Management

### Storage

- **Development**: `.env` file (gitignored)
- **Staging/Production**: Secure secret store
- **CI/CD**: Encrypted secrets in CI system

### Usage

- **Never log API keys**
- **Never expose in URLs**
- **Use headers for authentication**
- **Rotate keys regularly**

### Validation

- **Check for hardcoded keys** in code reviews
- **Scan codebase** for potential secrets
- **Use tools** like `git-secrets` or `truffleHog`

## Input Validation

### Always Validate

- User inputs
- API responses
- File uploads
- Configuration values
- Environment variables

### Validation Rules

1. **Type checking**: Verify data types
2. **Range checking**: Verify value ranges
3. **Format validation**: Verify formats (email, URL, etc.)
4. **Sanitization**: Remove dangerous characters
5. **Whitelist approach**: Allow only known good values

### Examples

```typescript
// Validate email
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize input
function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, ''); // Remove HTML tags
}
```

## Authentication & Authorization

### Authentication

- **Use secure methods**: OAuth 2.0, JWT
- **Never store passwords in plain text**: Use bcrypt, argon2
- **Implement rate limiting**: Prevent brute force
- **Use HTTPS**: Always encrypt in transit

### Authorization

- **Check permissions**: Verify user has access
- **Principle of least privilege**: Minimum required access
- **Validate on server**: Never trust client
- **Use role-based access control**: RBAC

## Error Handling

### Never Expose Sensitive Information

❌ **BAD**:

```typescript
catch (error) {
  return { error: error.message }; // May expose internal details
}
```

✅ **GOOD**:

```typescript
catch (error) {
  log.error('Internal error', error); // Log internally
  return { error: 'An error occurred' }; // Generic message
}
```

### Error Messages

- **Generic for users**: Don't reveal system details
- **Detailed in logs**: Log full details server-side
- **No stack traces**: Don't expose to clients in production

## Data Protection

### Sensitive Data

- **Encrypt at rest**: Database encryption
- **Encrypt in transit**: HTTPS/TLS
- **Minimize collection**: Only collect what's needed
- **Retention policies**: Delete when no longer needed

### Personal Data (GDPR)

- **Consent**: Get user consent
- **Right to deletion**: Implement deletion
- **Data portability**: Allow data export
- **Privacy by design**: Build privacy in

## Dependency Security

### Package Management

- **Keep dependencies updated**: Regular updates
- **Check for vulnerabilities**: `npm audit`, `snyk`
- **Use lock files**: `package-lock.json`
- **Review dependencies**: Know what you're using

### Security Scanning

```bash
# npm audit
npm audit

# Fix vulnerabilities
npm audit fix

# Snyk
snyk test
```

## Code Security

### Best Practices

1. **Use parameterized queries**: Prevent SQL injection
2. **Escape output**: Prevent XSS
3. **Validate CSRF tokens**: Prevent CSRF attacks
4. **Use secure headers**: CSP, HSTS, etc.
5. **Keep frameworks updated**: Security patches

### Security Headers

```typescript
// Example security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});
```

## Monitoring & Logging

### What to Log

- **Security events**: Login attempts, permission changes
- **Errors**: Application errors (without sensitive data)
- **Access logs**: Who accessed what
- **Performance**: System performance metrics

### What NOT to Log

- **Secrets**: Never log passwords, keys, tokens
- **Personal data**: Minimize PII in logs
- **Full request bodies**: May contain sensitive data

### Log Security

- **Encrypt logs**: If containing sensitive data
- **Access control**: Limit who can view logs
- **Retention**: Delete logs after retention period

## Incident Response

### If Secrets Are Committed

1. **Immediately rotate** all exposed secrets
2. **Remove from git history** (if possible)
3. **Notify team** and stakeholders
4. **Assess impact** and take action
5. **Document incident** and lessons learned

### Git History Cleanup

```bash
# Remove file from history (use with caution)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (coordinate with team)
git push origin --force --all
```

## Compliance

### Follow Standards

- **OWASP Top 10**: Common vulnerabilities
- **CWE**: Common Weakness Enumeration
- **GDPR**: If handling EU data
- **PCI DSS**: If handling payment data

### Security Reviews

- **Code reviews**: Security-focused reviews
- **Penetration testing**: Regular security testing
- **Dependency audits**: Regular dependency scanning

## Integration with BMAD

Security rules integrate with BMAD:

- **BMAD agents**: Must follow security rules
- **BMAD workflows**: Include security checks
- **BMAD tasks**: Security considerations in tasks

## Best Practices Summary

1. ✅ **Never commit secrets**
2. ✅ **Use environment variables**
3. ✅ **Validate all inputs**
4. ✅ **Encrypt sensitive data**
5. ✅ **Keep dependencies updated**
6. ✅ **Use secure authentication**
7. ✅ **Log security events**
8. ✅ **Regular security audits**
