/**
 * Security configuration and constants
 * Centralized security settings for the application
 */

// Content Security Policy configuration
export const CSP_CONFIG = {
  directives: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for some React functionality
      "'unsafe-eval'",   // Required for development builds
      'https://apis.google.com',
      'https://www.gstatic.com'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-components and CSS-in-JS
      'https://fonts.googleapis.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'blob:'
    ],
    'connect-src': [
      "'self'",
      'https://api.openai.com',
      'https://*.firebaseapp.com',
      'https://*.googleapis.com',
      'https://*.supabase.co',
      'wss://*.supabase.co'
    ],
    'frame-src': [
      "'self'",
      'https://accounts.google.com'
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  }
};

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

// Allowed origins for CORS
export const ALLOWED_ORIGINS = {
  production: [
    'https://smaranai.com',
    'https://smaranai.web.app',
    'https://smaranai.firebaseapp.com'
  ],
  development: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8082',
    'http://localhost:8083'
  ]
};

// File upload security settings
export const FILE_UPLOAD_CONFIG = {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain'
  ],
  allowedExtensions: [
    '.pdf',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.txt'
  ]
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,          // Limit each IP to 100 requests per windowMs
  skipSuccessfulRequests: false,
  skipFailedRequests: false
};

// API key validation patterns
export const API_KEY_PATTERNS = {
  openai: {
    standard: /^sk-[a-zA-Z0-9]{20,}$/,
    project: /^sk-proj-[a-zA-Z0-9_]{20,}$/
  },
  firebase: /^[a-zA-Z0-9_-]{39}$/
};

// Input validation limits
export const INPUT_LIMITS = {
  message: 10000,
  title: 200,
  description: 1000,
  username: 20,
  filename: 255,
  apiKey: 200
};

// Sensitive data patterns to detect and prevent exposure
export const SENSITIVE_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/g,           // OpenAI API keys
  /sk-proj-[a-zA-Z0-9_]{20,}/g,      // OpenAI project keys
  /AIza[0-9A-Za-z_-]{35}/g,        // Google API keys
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, // UUIDs
  /eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g, // JWT tokens
];

// DOMPurify configuration for HTML sanitization
export const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'i', 'b',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote',
    'a', 'span', 'div'
  ],
  ALLOWED_ATTR: ['href', 'target', 'class', 'id'],
  FORBID_TAGS: [
    'script', 'iframe', 'object', 'embed',
    'link', 'meta', 'style', 'form', 'input'
  ],
  FORBID_ATTR: [
    'onclick', 'onload', 'onerror', 'onmouseover',
    'onfocus', 'onblur', 'onchange', 'onsubmit'
  ],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SANITIZE_DOM: true,
  KEEP_CONTENT: true
};

// Environment validation
export const REQUIRED_ENV_VARS = {
  firebase: [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ],
  optional: [
    'VITE_OPENAI_API_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_FIREBASE_MEASUREMENT_ID'
  ]
};

// Security monitoring events
export const SECURITY_EVENTS = {
  INVALID_API_KEY: 'security.invalid_api_key',
  RATE_LIMIT_EXCEEDED: 'security.rate_limit_exceeded',
  SUSPICIOUS_FILE_UPLOAD: 'security.suspicious_file_upload',
  XSS_ATTEMPT: 'security.xss_attempt',
  UNAUTHORIZED_ACCESS: 'security.unauthorized_access',
  ENVIRONMENT_VARIABLE_MISSING: 'security.env_var_missing'
} as const;

// Utility function to generate CSP header string
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_CONFIG.directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

// Utility function to validate environment variables
export const validateEnvironmentVariables = (): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  // Check required Firebase variables
  REQUIRED_ENV_VARS.firebase.forEach(varName => {
    if (!import.meta.env[varName]) {
      missing.push(varName);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing
  };
};

// Utility function to detect sensitive data in strings
export const containsSensitiveData = (text: string): boolean => {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(text));
};

// Utility function to redact sensitive data from strings
export const redactSensitiveData = (text: string): string => {
  let redacted = text;
  SENSITIVE_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, '[REDACTED]');
  });
  return redacted;
};
