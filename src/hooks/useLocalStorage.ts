
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for using localStorage with state
 * @param key localStorage key
 * @param initialValue Initial value
 * @returns [value, setValue] - State value and setter function
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Pass the function directly to setStoredValue if it's a function
      if (value instanceof Function) {
        setStoredValue(prevState => {
          const newState = value(prevState);
          // Save the *new* state to local storage
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(newState));
          }
          return newState;
        });
      } else {
        // Save the direct value to state and local storage
        setStoredValue(value);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  // Listen for changes to this localStorage key in other browser windows/tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.storageArea === localStorage && e.key === key) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (error) {
           console.warn(`Error parsing stored value for key "${key}" on storage event:`, error);
           setStoredValue(initialValue);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  // Effect to update state if initialValue changes (optional, depends on use case)
  // useEffect(() => {
  //   setStoredValue(readValue());
  // }, [initialValue, readValue]);

  return [storedValue, setValue];
}
