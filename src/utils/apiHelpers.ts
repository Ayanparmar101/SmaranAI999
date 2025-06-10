
import { toast } from "sonner";

/**
 * Handles API errors and shows appropriate toast messages
 * @param error Error object from API call
 */
export const handleApiError = (error: any): void => {
  console.error('API Error:', error);
  
  const message = error.message || 'An unexpected error occurred';
  toast.error(message);
};

/**
 * Creates headers with API key
 * @param apiKey API key to use
 * @returns Headers object with API key
 */
export const createApiHeaders = (apiKey: string) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
};
