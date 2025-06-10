/**
 * Secure storage utilities for sensitive data
 * Provides encrypted storage and secure key management
 */

import { sanitizeInput } from './security';

// Simple encryption/decryption using Web Crypto API
class SecureStorage {
  private static instance: SecureStorage;
  private encryptionKey: CryptoKey | null = null;

  private constructor() {}

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  // Generate or retrieve encryption key
  private async getEncryptionKey(): Promise<CryptoKey> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    // Try to get existing key from sessionStorage (more secure than localStorage)
    const storedKey = sessionStorage.getItem('_sk');
    if (storedKey) {
      try {
        const keyData = JSON.parse(atob(storedKey));
        this.encryptionKey = await crypto.subtle.importKey(
          'raw',
          new Uint8Array(keyData),
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
        return this.encryptionKey;
      } catch (error) {
        console.warn('Failed to restore encryption key, generating new one');
      }
    }

    // Generate new key
    this.encryptionKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Store key in sessionStorage (cleared when browser closes)
    const exportedKey = await crypto.subtle.exportKey('raw', this.encryptionKey);
    const keyArray = Array.from(new Uint8Array(exportedKey));
    sessionStorage.setItem('_sk', btoa(JSON.stringify(keyArray)));

    return this.encryptionKey;
  }

  // Encrypt data
  private async encrypt(data: string): Promise<string> {
    const key = await this.getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  // Decrypt data
  private async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Store API key securely
  async setApiKey(key: string): Promise<void> {
    // Validate and sanitize the API key
    const sanitizedKey = sanitizeInput(key, 200);
    if (!this.validateApiKey(sanitizedKey)) {
      throw new Error('Invalid API key format');
    }

    try {
      const encryptedKey = await this.encrypt(sanitizedKey);
      sessionStorage.setItem('_ak', encryptedKey);
    } catch (error) {
      console.error('Failed to store API key:', error);
      throw new Error('Failed to store API key securely');
    }
  }

  // Retrieve API key securely
  async getApiKey(): Promise<string | null> {
    // First check environment variable
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (envApiKey) {
      return envApiKey;
    }

    // Then check encrypted storage
    const encryptedKey = sessionStorage.getItem('_ak');
    if (!encryptedKey) {
      return null;
    }

    try {
      return await this.decrypt(encryptedKey);
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      // Clear corrupted data
      sessionStorage.removeItem('_ak');
      return null;
    }
  }

  // Clear stored API key
  clearApiKey(): void {
    sessionStorage.removeItem('_ak');
  }

  // Clear all secure storage
  clearAll(): void {
    sessionStorage.removeItem('_ak');
    sessionStorage.removeItem('_sk');
    this.encryptionKey = null;
  }

  // Validate API key format
  private validateApiKey(key: string): boolean {
    // OpenAI API key patterns - updated to be more flexible
    const patterns = [
      /^sk-[a-zA-Z0-9]{20,}$/,           // Standard API key (minimum 20 chars)
      /^sk-proj-[a-zA-Z0-9_]{20,}$/      // Project API key (minimum 20 chars, allows underscores)
    ];

    return patterns.some(pattern => pattern.test(key));
  }
}

// Export singleton instance
export const secureStorage = SecureStorage.getInstance();

// Utility functions for backward compatibility
export const setSecureApiKey = (key: string) => secureStorage.setApiKey(key);
export const getSecureApiKey = () => secureStorage.getApiKey();
export const clearSecureApiKey = () => secureStorage.clearApiKey();
