
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export const useVoicePlayback = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize the Audio object only once
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.onplay = () => {
        console.log("Audio playback started.");
        setIsSpeaking(true);
      };
      
      audioRef.current.onended = () => {
        console.log("Audio playback ended.");
        setIsSpeaking(false);
      };
      
      audioRef.current.onerror = (e) => {
        console.error("Audio playback error:", e);
        toast.error("Error playing audio.");
        setIsSpeaking(false);
      };
       audioRef.current.onpause = () => {
         console.log("Audio playback paused.");
         // onended usually handles setting isSpeaking false, but handle pause too
         // especially if triggered by stopAudio
         if (audioRef.current?.currentTime === 0) { // Check if paused due to stopAudio setting time to 0
            setIsSpeaking(false);
         }
      };
    }

    // Cleanup function to pause audio if component unmounts while playing
    return () => {
      if (audioRef.current && !audioRef.current.paused) {
        console.log("Pausing audio on cleanup.");
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      // Optionally nullify the ref? Or just remove listeners?
      // audioRef.current = null; 
    };
  }, []); // Empty dependency array ensures this runs only once

  const playAudio = (audioUrl: string) => {
    if (audioRef.current && audioUrl) {
      console.log("Attempting to play audio:", audioUrl);
      // Stop any currently playing audio first
      if (!audioRef.current.paused) {
         audioRef.current.pause();
         audioRef.current.currentTime = 0;
      }
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(error => { // Added catch block
         console.error("Error starting audio playback:", error);
         toast.error("Could not play audio.");
         setIsSpeaking(false); // Ensure state is false on error
      });
    }
  };

  const stopAudio = () => {
    console.log("stopAudio called");
    if (audioRef.current && !audioRef.current.paused) {
      console.log("Pausing and resetting audio");
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Resetting time ensures onpause sets isSpeaking to false
    } else {
        console.log("Audio ref not present or already paused");
    }
     // Force state update just in case events didn't fire correctly
    setIsSpeaking(false);
  };
  
  const replayLastResponse = (messages: Array<{id: string; role: string; audioUrl?: string}>) => {
    console.log("replayLastResponse called. Searching messages:", messages);
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant' && m.audioUrl);
    
    if (lastAssistantMessage?.audioUrl && audioRef.current) {
      const urlToPlay = lastAssistantMessage.audioUrl;
      console.log("Found last assistant message with audioUrl:", urlToPlay);
      // Stop any currently playing audio first
      if (!audioRef.current.paused) {
         audioRef.current.pause();
         audioRef.current.currentTime = 0;
      }
      audioRef.current.src = urlToPlay;
      audioRef.current.play().catch(error => { // Added catch block
          console.error("Error during replay playback:", error);
          toast.error("Could not replay audio.");
          setIsSpeaking(false);
      });
    } else {
       console.log("No suitable last assistant message with audio found to replay.");
       if (!audioRef.current) console.warn("Audio player ref is not initialized.");
       toast.info("No previous audio response found to replay.");
    }
  };
  
  return {
    isSpeaking,
    playAudio,
    stopAudio,
    replayLastResponse
  };
};
