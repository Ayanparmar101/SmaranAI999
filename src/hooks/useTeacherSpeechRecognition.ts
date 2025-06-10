
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Type guard for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function useTeacherSpeechRecognition(initialQuestion = '') {
  const [question, setQuestion] = useState<string>(initialQuestion);
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = useRef<boolean>(false);

  useEffect(() => {
    // Check for support once on mount
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      isSupported.current = true;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true; // Keep listening
        recognitionRef.current.interimResults = true; // Get results as they come
        recognitionRef.current.lang = 'en-US'; // Set language

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } 
          }
          // Update question only with final transcript to avoid flickering
          if (finalTranscript) {
            setQuestion(prev => prev + finalTranscript); 
          }
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error, event.message);
          let errorMessage = `Speech recognition error: ${event.error}`;
          if (event.error === 'not-allowed') {
            errorMessage = 'Microphone access denied. Please allow microphone permissions in your browser settings.';
          } else if (event.error === 'no-speech') {
            errorMessage = 'No speech detected. Please try speaking again.';
          } else if (event.error === 'network') {
            errorMessage = 'Network error during speech recognition. Please check your connection.';
          }
          toast.error(errorMessage);
          setIsListening(false); // Ensure listening state is turned off on error
        };
        
        // Simplify onend: Just update state, don't auto-restart
        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended.');
          setIsListening(false); 
        };

      } else {
        console.error("Failed to initialize SpeechRecognition");
        isSupported.current = false;
      }
    } else {
      console.warn('Speech recognition is not supported in this browser');
      isSupported.current = false;
    }
    
    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        console.log("Cleaning up speech recognition references...");
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        // Ensure stop is called if it exists and might be running
        try {
            recognitionRef.current.stop();
            console.log("Speech recognition stopped during cleanup.");
        } catch (error) {
            // Silently catch error if already stopped
            // console.error('Error stopping speech recognition during cleanup:', error);
        }
        recognitionRef.current = null;
      }
    };
  }, []); // Run this effect only once on mount

  const startListening = useCallback(() => {
    if (!isSupported.current || !recognitionRef.current) {
      toast.error('Speech recognition is not supported or initialized.');
      return;
    }
    if (isListening) return; // Already listening

    try {
      setQuestion(''); // Clear previous question before starting
      recognitionRef.current.start();
      setIsListening(true);
      console.log("Speech recognition started.");
    } catch (error: any) {
      console.error('Error starting speech recognition:', error);
      // Check for specific errors like 'invalid-state' if already started
      if (error.name === 'InvalidStateError') {
        toast.warning("Speech recognition is already active.");
        setIsListening(true); // Correct the state if it got out of sync
      } else {
         toast.error('Failed to start speech recognition. Please ensure microphone permissions are granted.');
         setIsListening(false);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!isSupported.current || !recognitionRef.current) {
      // No need to show error if not supported, just return
      return;
    }
     if (!isListening) return; // Already stopped

    try {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log("Speech recognition stopped manually.");
    } catch (error) {
      console.error('Error stopping speech recognition manually:', error);
      // Might fail if already stopped, update state anyway
       setIsListening(false);
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return { question, setQuestion, isListening, toggleListening };
}
