/**
 * Security monitoring service
 * Tracks and logs security-related events
 */

import { SECURITY_EVENTS, containsSensitiveData, redactSensitiveData } from '@/config/security';

interface SecurityEvent {
  type: string;
  timestamp: Date;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent?: string;
  ip?: string;
}

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory

  private constructor() {}

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  /**
   * Log a security event
   */
  logEvent(
    type: string,
    details: Record<string, any>,
    severity: SecurityEvent['severity'] = 'medium'
  ): void {
    // Redact sensitive data from details
    const sanitizedDetails = this.sanitizeEventDetails(details);

    const event: SecurityEvent = {
      type,
      timestamp: new Date(),
      details: sanitizedDetails,
      severity,
      userAgent: navigator.userAgent,
      ip: 'client-side' // Client-side monitoring
    };

    this.events.push(event);

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn(`[Security] ${type}:`, sanitizedDetails);
    }

    // Send to monitoring service in production
    if (import.meta.env.PROD && severity === 'critical') {
      this.sendToMonitoringService(event);
    }
  }

  /**
   * Log invalid API key attempt
   */
  logInvalidApiKey(attemptedKey: string): void {
    this.logEvent(
      SECURITY_EVENTS.INVALID_API_KEY,
      {
        keyFormat: attemptedKey ? 'provided' : 'empty',
        keyLength: attemptedKey?.length || 0
      },
      'high'
    );
  }

  /**
   * Log rate limit exceeded
   */
  logRateLimitExceeded(endpoint: string, attempts: number): void {
    this.logEvent(
      SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
      {
        endpoint,
        attempts
      },
      'medium'
    );
  }

  /**
   * Log suspicious file upload
   */
  logSuspiciousFileUpload(filename: string, fileType: string, fileSize: number): void {
    this.logEvent(
      SECURITY_EVENTS.SUSPICIOUS_FILE_UPLOAD,
      {
        filename: this.sanitizeFilename(filename),
        fileType,
        fileSize
      },
      'high'
    );
  }

  /**
   * Log XSS attempt
   */
  logXSSAttempt(input: string, source: string): void {
    this.logEvent(
      SECURITY_EVENTS.XSS_ATTEMPT,
      {
        inputLength: input.length,
        source,
        containsScript: input.toLowerCase().includes('<script'),
        containsJavascript: input.toLowerCase().includes('javascript:')
      },
      'critical'
    );
  }

  /**
   * Log unauthorized access attempt
   */
  logUnauthorizedAccess(resource: string, action: string): void {
    this.logEvent(
      SECURITY_EVENTS.UNAUTHORIZED_ACCESS,
      {
        resource,
        action
      },
      'high'
    );
  }

  /**
   * Log missing environment variable
   */
  logMissingEnvironmentVariable(varName: string): void {
    this.logEvent(
      SECURITY_EVENTS.ENVIRONMENT_VARIABLE_MISSING,
      {
        variableName: varName
      },
      'medium'
    );
  }

  /**
   * Get recent security events
   */
  getRecentEvents(limit = 50): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get events by severity
   */
  getEventsBySeverity(severity: SecurityEvent['severity']): SecurityEvent[] {
    return this.events.filter(event => event.severity === severity);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: string): SecurityEvent[] {
    return this.events.filter(event => event.type === type);
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Get security summary
   */
  getSecuritySummary(): {
    totalEvents: number;
    criticalEvents: number;
    highSeverityEvents: number;
    recentEvents: SecurityEvent[];
  } {
    const criticalEvents = this.getEventsBySeverity('critical').length;
    const highSeverityEvents = this.getEventsBySeverity('high').length;
    const recentEvents = this.getRecentEvents(10);

    return {
      totalEvents: this.events.length,
      criticalEvents,
      highSeverityEvents,
      recentEvents
    };
  }

  /**
   * Sanitize event details to remove sensitive information
   */
  private sanitizeEventDetails(details: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(details)) {
      if (typeof value === 'string') {
        // Check if the value contains sensitive data
        if (containsSensitiveData(value)) {
          sanitized[key] = redactSensitiveData(value);
        } else {
          sanitized[key] = value;
        }
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sanitize filename for logging
   */
  private sanitizeFilename(filename: string): string {
    // Remove path traversal attempts and keep only the basename
    return filename.replace(/[\/\\]/g, '_').substring(0, 100);
  }

  /**
   * Send critical events to monitoring service
   */
  private async sendToMonitoringService(event: SecurityEvent): Promise<void> {
    try {
      // In a real application, this would send to your monitoring service
      // For now, we'll just log it
      console.error('[Security Monitor] Critical event:', event);
      
      // Example: Send to external monitoring service
      // await fetch('/api/security/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
    } catch (error) {
      console.error('Failed to send security event to monitoring service:', error);
    }
  }
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance();

// Convenience functions
export const logSecurityEvent = (
  type: string,
  details: Record<string, any>,
  severity: SecurityEvent['severity'] = 'medium'
) => securityMonitor.logEvent(type, details, severity);

export const logInvalidApiKey = (attemptedKey: string) => 
  securityMonitor.logInvalidApiKey(attemptedKey);

export const logRateLimitExceeded = (endpoint: string, attempts: number) => 
  securityMonitor.logRateLimitExceeded(endpoint, attempts);

export const logSuspiciousFileUpload = (filename: string, fileType: string, fileSize: number) => 
  securityMonitor.logSuspiciousFileUpload(filename, fileType, fileSize);

export const logXSSAttempt = (input: string, source: string) => 
  securityMonitor.logXSSAttempt(input, source);

export const logUnauthorizedAccess = (resource: string, action: string) => 
  securityMonitor.logUnauthorizedAccess(resource, action);

export const logMissingEnvironmentVariable = (varName: string) => 
  securityMonitor.logMissingEnvironmentVariable(varName);
