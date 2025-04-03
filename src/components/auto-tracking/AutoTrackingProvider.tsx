
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

type AutoTrackingContextType = {
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  setReelInterval: (seconds: number) => void;
  currentInterval: number;
};

const defaultContext: AutoTrackingContextType = {
  isTracking: false,
  startTracking: () => {},
  stopTracking: () => {},
  setReelInterval: () => {},
  currentInterval: 10, // Changed to 10 seconds for faster counting
};

const AutoTrackingContext = createContext<AutoTrackingContextType>(defaultContext);

export const useAutoTracking = () => useContext(AutoTrackingContext);

type AutoTrackingProviderProps = {
  children: ReactNode;
  onReelDetected: () => void;
};

export const AutoTrackingProvider = ({ children, onReelDetected }: AutoTrackingProviderProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentInterval, setCurrentInterval] = useState(10); // Changed to 10 seconds default
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();
  
  // Check if tracking was active in previous session
  useEffect(() => {
    const wasTracking = localStorage.getItem('reels-counter-tracking') === 'true';
    const savedInterval = localStorage.getItem('reels-counter-interval');
    
    if (savedInterval) {
      setCurrentInterval(parseInt(savedInterval, 10));
    }
    
    if (wasTracking) {
      // Auto-start tracking from previous session
      setTimeout(() => {
        startTracking();
      }, 1000);
      
      toast({
        title: "Tracking Resumed",
        description: "Your previous tracking session has been restored.",
      });
    }
  }, [toast]);
  
  // Handle visibility change to conserve resources
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isTracking) {
        // Page is hidden but tracking is on - continue in background
        // We'll notify the service worker to continue tracking
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'UPDATE_COUNTER',
            tracking: true,
            interval: currentInterval
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTracking, currentInterval]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start tracking function
  const startTracking = () => {
    if (isTracking) return;
    
    setIsTracking(true);
    localStorage.setItem('reels-counter-tracking', 'true');
    
    // Make sure to clear any existing interval first
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set a new interval timer
    timerRef.current = window.setInterval(() => {
      onReelDetected();
    }, currentInterval * 1000);
    
    toast({
      title: "Auto Tracking Started",
      description: `Counting a new reel every ${currentInterval} seconds.`,
      variant: "default",
    });
    
    // Enable vibration on start if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
    
    // Notify service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_COUNTER',
        tracking: true,
        interval: currentInterval
      });
    }
  };
  
  // Stop tracking function
  const stopTracking = () => {
    if (!isTracking) return;
    
    setIsTracking(false);
    localStorage.setItem('reels-counter-tracking', 'false');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    toast({
      title: "Auto Tracking Stopped",
      description: "You've paused the reels counter.",
    });
    
    // Enable vibration on stop if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    
    // Notify service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_COUNTER',
        tracking: false
      });
    }
  };
  
  // Set the interval time between reels
  const setReelInterval = (seconds: number) => {
    setCurrentInterval(seconds);
    localStorage.setItem('reels-counter-interval', seconds.toString());
    
    // If already tracking, restart with new interval
    if (isTracking) {
      stopTracking();
      setTimeout(() => startTracking(), 100);
    }
    
    toast({
      title: "Interval Updated",
      description: `Now counting a new reel every ${seconds} seconds.`,
    });
  };
  
  return (
    <AutoTrackingContext.Provider 
      value={{ 
        isTracking, 
        startTracking, 
        stopTracking, 
        setReelInterval,
        currentInterval
      }}
    >
      {children}
    </AutoTrackingContext.Provider>
  );
};
