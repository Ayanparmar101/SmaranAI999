# 🔒 Security Policy

## Overview

Smaran.ai takes security seriously. This document outlines our security measures and how to report security vulnerabilities.

## 🛡️ Security Measures Implemented

### **1. Input Validation & Sanitization**
- ✅ All user inputs are validated and sanitized
- ✅ XSS protection through HTML sanitization
- ✅ SQL injection prevention (using Firebase/Firestore)
- ✅ File upload validation with type and size restrictions

### **2. Authentication & Authorization**
- ✅ Firebase Authentication with email verification
- ✅ Secure session management
- ✅ Role-based access control
- ✅ Protected routes with authentication guards

### **3. API Security**
- ✅ API key validation and secure storage
- ✅ Rate limiting to prevent abuse
- ✅ Request timeout protection
- ✅ HTTPS-only communication
- ✅ Secure headers implementation

### **4. Data Protection**
- ✅ Environment variables for sensitive data
- ✅ Secure Firebase rules with user isolation
- ✅ Data validation at database level
- ✅ No sensitive data in client-side code

### **5. Content Security**
- ✅ Content Security Policy (CSP) headers
- ✅ XSS protection headers
- ✅ Frame options to prevent clickjacking
- ✅ MIME type sniffing protection

## 🔐 Environment Variables

### **Required Environment Variables**
```bash
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-...

# Firebase Configuration
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

### **Security Best Practices**
- Never commit `.env` files to version control
- Use different API keys for development and production
- Regularly rotate API keys
- Monitor API usage for unusual activity

## 🚨 Security Features

### **Input Validation**
- Email format validation
- Password strength requirements
- API key format validation
- File type and size restrictions
- Content length limits

### **Rate Limiting**
- API request rate limiting
- Login attempt limiting
- File upload restrictions
- Request timeout protection

### **Data Sanitization**
- HTML content sanitization
- Script tag removal
- Event handler removal
- URL validation

## 🔒 Firebase Security Rules

### **Firestore Rules**
```javascript
// Users can only access their own data
allow read, write: if request.auth != null && 
                     request.auth.uid == userId;

// Data validation at database level
allow create: if validateUserData(request.resource.data);
```

### **Storage Rules**
```javascript
// File type and size restrictions
allow write: if request.resource.size < 50 * 1024 * 1024 && 
               request.resource.contentType.matches('application/pdf|image/.*');
```

## 🛠️ Security Headers

The application implements the following security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## 📊 Security Monitoring

### **Implemented Monitoring**
- Failed authentication attempts
- API rate limit violations
- Unusual file upload patterns
- Error logging and monitoring

### **Alerts**
- Multiple failed login attempts
- API key validation failures
- Large file upload attempts
- Suspicious user behavior

## 🚨 Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it responsibly:

### **Contact Information**
- **Email**: security@smaran.ai
- **Response Time**: Within 24 hours
- **Disclosure**: Coordinated disclosure preferred

### **What to Include**
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact assessment
4. Suggested fix (if available)

### **What NOT to Include**
- Do not publicly disclose vulnerabilities
- Do not access user data without permission
- Do not perform destructive testing

## 🔄 Security Updates

### **Regular Security Practices**
- Dependency updates and vulnerability scanning
- Regular security audits
- Penetration testing
- Code review for security issues

### **Update Schedule**
- Critical security patches: Immediate
- High priority updates: Within 48 hours
- Medium priority updates: Within 1 week
- Low priority updates: Next release cycle

## 📋 Security Checklist

### **For Developers**
- [ ] Validate all user inputs
- [ ] Sanitize data before display
- [ ] Use environment variables for secrets
- [ ] Implement proper error handling
- [ ] Follow secure coding practices
- [ ] Test security measures regularly

### **For Deployment**
- [ ] Enable HTTPS in production
- [ ] Configure security headers
- [ ] Set up monitoring and alerting
- [ ] Regular backup procedures
- [ ] Access control reviews
- [ ] Security testing before release

## 🔗 Security Resources

### **Documentation**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

### **Tools Used**
- Firebase Security Rules
- Content Security Policy
- Input validation libraries
- Rate limiting middleware
- Security headers

## 📞 Emergency Contact

For critical security issues requiring immediate attention:

- **Emergency Email**: security-emergency@smaran.ai
- **Response Time**: Within 2 hours
- **Escalation**: Automatic escalation after 4 hours

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Next Review**: March 2025
