
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface UseVoiceRecognitionProps {
  onTranscriptChange?: (transcript: string) => void;
  onSpeechEnd?: (finalTranscript: string) => Promise<void> | void; 
}

export const useVoiceRecognition = ({ onTranscriptChange, onSpeechEnd }: UseVoiceRecognitionProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const currentTranscriptRef = useRef<string>(''); 
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = useRef<boolean>(false);
  const stopManuallyInvoked = useRef<boolean>(false); // Flag to track if stop was manual
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  const onSpeechEndRef = useRef(onSpeechEnd);

  useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange;
  }, [onTranscriptChange]);

  useEffect(() => {
    onSpeechEndRef.current = onSpeechEnd;
  }, [onSpeechEnd]);

  useEffect(() => {
    console.log("useVoiceRecognition: Setup useEffect running ONCE");
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      isSupported.current = true;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        console.log("useVoiceRecognition: SpeechRecognition instance created");
        
        // --- Set continuous to true --- 
        recognition.continuous = true; 
        recognition.interimResults = true; 
        recognition.lang = 'en-US'; 

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          // console.log("recognitionRef.current.onresult triggered"); 
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPart = event.results[i][0].transcript;
            // In continuous mode, isFinal might indicate end of an utterance segment
            finalTranscript += transcriptPart; // Accumulate everything for continuous display
          }
          
          // Update display with the latest accumulated transcript
          const displayTranscript = finalTranscript.trim();
          currentTranscriptRef.current = displayTranscript; // Keep track of the full text
          // console.log(` Displaying: "${displayTranscript}"`);
          
          if (onTranscriptChangeRef.current) {
            onTranscriptChangeRef.current(displayTranscript);
          } else {
            console.warn("onTranscriptChange callback is missing");
          }
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error, event.message);
          let errorMessage = `Speech recognition error: ${event.error}`;
           if (event.error === 'not-allowed') {
            errorMessage = 'Microphone access denied. Please allow microphone permissions in your browser settings.';
          } else if (event.error === 'no-speech') {
             // In continuous mode, 'no-speech' might just mean a pause, don't stop
            console.warn('No speech detected momentarily (continuous mode).');
             return; // Don't treat 'no-speech' as a fatal error in continuous mode
          } else if (event.error === 'network') {
            errorMessage = 'Network error during speech recognition. Please check your connection.';
          }
          toast.error(errorMessage);
          setIsListening(false); // Stop listening on other errors
        };
        
        recognition.onend = () => {
          console.log('recognitionRef.current.onend triggered.'); 
          // Only set isListening to false if stop was manually invoked
          // Otherwise, continuous mode might try to restart automatically or just pause
          if (stopManuallyInvoked.current) {
             console.log('onend: Stop was manually invoked, setting isListening=false');
             setIsListening(false); 
             // Call the end callback only when manually stopped
             const finalTranscriptToSend = currentTranscriptRef.current;
             if (onSpeechEndRef.current && finalTranscriptToSend) {
                 console.log('Calling onSpeechEnd with:', finalTranscriptToSend);
                 onSpeechEndRef.current(finalTranscriptToSend); 
              }
             currentTranscriptRef.current = ''; 
             stopManuallyInvoked.current = false; // Reset flag
          } else {
             console.log('onend: Stop was NOT manual (likely auto-restart attempt or pause), keeping isListening=true (if it was true)');
             // Potentially try to restart if state was true? Or rely on browser?
             // For simplicity, we don't auto-restart here. If the browser stops continuous, user needs to restart.
             if (isListening) { // If we *thought* we were listening, but it ended, show error.
                 toast.error("Listening stopped unexpectedly. Please restart if needed.");
                 setIsListening(false); // Update state if it ends unexpectedly
             }
          }
        };

      } catch (error) {
         console.error("Failed to initialize SpeechRecognition:", error);
         toast.error("Failed to initialize speech recognition feature.");
         isSupported.current = false;
      }
    } else {
      console.warn('Speech recognition is not supported in this browser');
      isSupported.current = false;
    }
    
    return () => {
      if (recognitionRef.current) {
        console.log("Cleaning up speech recognition hook...");
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        try {
            console.log("Attempting to stop recognition during cleanup...");
            recognitionRef.current.stop(); 
        } catch (error) {
             console.error('Error stopping recognition during cleanup:', error);
        }
        recognitionRef.current = null; 
      }
    };
  }, []); 

  const startListening = useCallback(() => {
    console.log("startListening called. Supported:", isSupported.current, "Ref exists:", !!recognitionRef.current, "Currently Listening:", isListening);
    if (!isSupported.current || !recognitionRef.current) {
      toast.error('Speech recognition is not supported or initialized.');
      return;
    }
    if (isListening) { 
       console.warn("startListening: Already listening, ignoring call.");
       return; 
    }

    try {
      currentTranscriptRef.current = ''; 
      if (onTranscriptChangeRef.current) onTranscriptChangeRef.current(''); 
      stopManuallyInvoked.current = false; // Reset flag before starting
      
      recognitionRef.current.start();
      setIsListening(true); 
      console.log("Speech recognition started via hook.");
    } catch (error: any) {
      console.error('Error starting speech recognition via hook:', error);
      if (error.name === 'InvalidStateError') {
        toast.warning("Speech recognition might already be active (InvalidStateError).");
        try { recognitionRef.current?.stop(); } catch(e){} 
        setIsListening(false);
      } else {
         toast.error('Failed to start speech recognition. Please ensure microphone permissions are granted.');
         setIsListening(false);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
     console.log("stopListening called. isListening:", isListening, "Ref exists:", !!recognitionRef.current);
    if (!recognitionRef.current || !isListening) {
       console.log("stopListening: Not listening or no ref, returning.");
       return;
    } 

    try {
      stopManuallyInvoked.current = true; // Set flag before stopping
      recognitionRef.current.stop(); 
      console.log("Speech recognition stop() called via hook.");
      // Note: state change and onSpeechEnd now happen within the onend handler 
      // ONLY when stopManuallyInvoked flag is true.
    } catch (error) {
      console.error('Error calling stop() on speech recognition:', error);
       // If stop fails, manually trigger cleanup logic
       setIsListening(false); 
       if (onSpeechEndRef.current && currentTranscriptRef.current) {
         onSpeechEndRef.current(currentTranscriptRef.current);
       }
       currentTranscriptRef.current = '';
       stopManuallyInvoked.current = false; // Reset flag
    }
  }, [isListening]);

  return {
    isListening,
    startListening,
    stopListening
  };
};
