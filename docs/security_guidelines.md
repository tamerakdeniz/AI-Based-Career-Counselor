# Security Guidelines for Career Counselor Application

## Overview

This document outlines the security measures implemented in the Career Counselor application and provides guidelines for secure deployment and maintenance.

## Implemented Security Measures

### 1. Authentication & Authorization

#### JWT Token Security

- **Strong Secret Key**: JWT tokens use a configurable secret key (minimum 32 characters)
- **Token Expiration**: Tokens expire after 30 minutes (configurable)
- **Enhanced Validation**: Comprehensive token validation including format checks, expiration verification, and user existence validation
- **Secure Headers**: Proper WWW-Authenticate headers for OAuth2 compliance

#### Endpoint Protection

- **All endpoints require authentication** except login/register
- **Resource ownership validation**: Users can only access their own roadmaps, chat messages, and milestones
- **Proper HTTP status codes**: 401 for authentication errors, 403 for authorization errors

### 2. Rate Limiting

#### AI Endpoint Protection

- **Per-user rate limiting**: 10 requests/minute, 100 requests/hour, 500 requests/day
- **Memory and Redis support**: Scalable rate limiting with fallback options
- **Proper HTTP headers**: X-RateLimit-\* headers for client awareness
- **429 status code**: Standard rate limit exceeded responses

### 3. Input Validation & Sanitization

#### XSS Prevention

- **HTML escaping**: All user inputs are HTML-escaped
- **Dangerous pattern removal**: Script tags, JavaScript URLs, and other XSS vectors removed
- **Content length limits**: 2000 characters for messages, 100 for field names

#### Injection Attack Prevention

- **SQL injection**: Using SQLAlchemy ORM with parameterized queries
- **Field validation**: Career fields restricted to alphanumeric characters, spaces, hyphens, underscores
- **Type validation**: Strict type checking for all inputs

### 4. Security Headers

#### HTTP Security Headers

- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **Strict-Transport-Security**: max-age=31536000; includeSubDomains
- **Content-Security-Policy**: Restrictive policy for web content
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Disabled geolocation, microphone, camera

### 5. Request Size Limiting

#### DoS Attack Prevention

- **Maximum request size**: 1MB limit
- **JSON payload limit**: 100KB for JSON data
- **Content-length validation**: Proper HTTP 413 responses for oversized requests

### 6. CORS & Host Protection

#### Cross-Origin Security

- **Explicit CORS origins**: Only allow specified frontend domains
- **Trusted host middleware**: Prevent host header injection attacks
- **Specific HTTP methods**: Only allow GET, POST, PUT, DELETE

### 7. Password Security

#### Cryptographic Protection

- **bcrypt hashing**: Industry-standard password hashing
- **Automatic salt generation**: Unique salt per password
- **No password storage**: Only hashed passwords stored in database

## Deployment Security Checklist

### Environment Configuration

1. **Generate Secure JWT Secret**:

   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Set Environment Variables**:

   ```bash
   export SECRET_KEY="your-generated-secret-key"
   export DATABASE_URL="postgresql://user:pass@host:port/db"  # Use PostgreSQL in production
   export CORS_ORIGINS_STR="https://yourdomain.com"
   ```

3. **Configure HTTPS**:
   - Use reverse proxy (nginx, Apache) with SSL/TLS
   - Obtain certificates from Let's Encrypt or commercial CA
   - Force HTTPS redirects

### Database Security

1. **Use PostgreSQL in Production**:

   ```
   DATABASE_URL=postgresql://username:password@host:port/database_name
   ```

2. **Database Access Control**:
   - Create dedicated database user with minimal privileges
   - Use connection pooling
   - Enable SSL connections

### Infrastructure Security

1. **Server Hardening**:

   - Keep OS and dependencies updated
   - Disable unnecessary services
   - Configure firewall (only allow necessary ports)
   - Use fail2ban for intrusion prevention

2. **Monitoring & Logging**:
   - Enable access logs
   - Monitor authentication failures
   - Set up alerts for unusual activity
   - Log rate limit violations

### API Key Security

1. **AI Service Keys**:
   - Store in environment variables
   - Rotate keys regularly
   - Monitor usage and costs
   - Set usage quotas with providers

## Security Monitoring

### Key Metrics to Monitor

1. **Authentication Failures**:

   - Failed login attempts
   - Invalid token usage
   - User enumeration attempts

2. **Rate Limiting**:

   - Rate limit violations
   - Unusual request patterns
   - AI endpoint abuse

3. **Input Validation**:
   - XSS attempt logs
   - Large payload attempts
   - Invalid field format attempts

### Recommended Tools

1. **Application Monitoring**:

   - Sentry for error tracking
   - DataDog or New Relic for performance
   - ELK stack for log analysis

2. **Security Scanning**:
   - OWASP ZAP for web security testing
   - Bandit for Python security linting
   - Safety for dependency vulnerability scanning

## Incident Response

### Security Incident Procedures

1. **Immediate Response**:

   - Isolate affected systems
   - Change compromised credentials
   - Review access logs
   - Notify relevant stakeholders

2. **Investigation**:

   - Determine scope of breach
   - Identify attack vectors
   - Document findings
   - Implement fixes

3. **Recovery**:
   - Apply security patches
   - Update authentication tokens
   - Strengthen affected systems
   - Monitor for continued threats

## Regular Security Maintenance

### Weekly Tasks

- Review authentication logs
- Check rate limiting effectiveness
- Monitor error rates

### Monthly Tasks

- Update dependencies
- Review CORS configurations
- Audit user access patterns

### Quarterly Tasks

- Security penetration testing
- Review and rotate API keys
- Update security documentation
- Train team on security best practices

## Additional Recommendations

### Future Security Enhancements

1. **Two-Factor Authentication (2FA)**:

   - TOTP-based 2FA
   - SMS backup (with caution)
   - Recovery codes

2. **Advanced Rate Limiting**:

   - IP-based rate limiting
   - Behavioral analysis
   - Geographic restrictions

3. **Enhanced Monitoring**:

   - Real-time intrusion detection
   - Machine learning-based anomaly detection
   - Automated threat response

4. **Data Protection**:
   - Database encryption at rest
   - API request/response encryption
   - Personal data anonymization

### Compliance Considerations

1. **GDPR Compliance** (if serving EU users):

   - Data minimization
   - Right to deletion
   - Data portability
   - Privacy by design

2. **CCPA Compliance** (if serving California users):
   - Privacy disclosures
   - Opt-out mechanisms
   - Data access rights

## Contact Information

For security concerns or to report vulnerabilities:

- Email: security@yourcompany.com
- Response time: 24 hours for critical issues
- Bug bounty program: [If applicable]

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Reviewed By**: Security Team
