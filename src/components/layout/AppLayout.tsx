
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { FloatingControl } from '../auto-tracking/FloatingControl';
import { StatusBar } from '../auto-tracking/StatusBar';
import { AutoTrackingProvider } from '../auto-tracking/AutoTrackingProvider';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

type TrackerData = {
  reelsWatched: number;
  timeSpent: number;
  reelsLimit: number;
  timeLimit: number;
  lastUpdated: string;
  streakDays: number;
  lastStreak: string;
  realData: {
    [date: string]: {
      reelsWatched: number;
      timeSpent: number;
    }
  };
  focusMode: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    days: string[];
  };
  parentalControl: {
    enabled: boolean;
    pin: string;
  };
};

const defaultData: TrackerData = {
  reelsWatched: 0,
  timeSpent: 0,
  reelsLimit: 20,
  timeLimit: 1800,
  lastUpdated: new Date().toISOString(),
  streakDays: 0,
  lastStreak: new Date().toISOString(),
  realData: {
    [new Date().toISOString().split('T')[0]]: {
      reelsWatched: 0,
      timeSpent: 0
    }
  },
  focusMode: {
    enabled: false,
    startTime: "22:00",
    endTime: "06:00",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  },
  parentalControl: {
    enabled: false,
    pin: "1234"
  }
};

export const AppLayout = () => {
  const [data, setData] = useLocalStorage<TrackerData>('reels-counter-data', defaultData);
  const { toast } = useToast();
  const [focusModeActive, setFocusModeActive] = useState(false);
  
  // Check if focus mode is active
  useEffect(() => {
    const checkFocusMode = () => {
      // Make sure data and focusMode exist before accessing properties
      if (!data || !data.focusMode || data.focusMode.enabled === undefined) {
        setFocusModeActive(false);
        return;
      }
      
      if (!data.focusMode.enabled) {
        setFocusModeActive(false);
        return;
      }
      
      const now = new Date();
      const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Check if today is a focus day
      if (!data.focusMode.days.includes(dayOfWeek)) {
        setFocusModeActive(false);
        return;
      }
      
      // Convert times to minutes since midnight for easier comparison
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startParts = data.focusMode.startTime.split(':');
      const endParts = data.focusMode.endTime.split(':');
      
      const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      
      // Handle overnight periods (when end time is earlier than start time)
      if (startMinutes > endMinutes) {
        // Focus mode spans overnight (e.g., 22:00 to 06:00)
        setFocusModeActive(currentMinutes >= startMinutes || currentMinutes <= endMinutes);
      } else {
        // Focus mode is within the same day
        setFocusModeActive(currentMinutes >= startMinutes && currentMinutes <= endMinutes);
      }
    };
    
    checkFocusMode();
    
    // Check focus mode every minute
    const interval = setInterval(checkFocusMode, 60000);
    return () => clearInterval(interval);
  }, [data]);
  
  // Check for day change and reset data if needed
  useEffect(() => {
    if (!data) return; // Add safety check
    
    const lastDate = new Date(data.lastUpdated).toDateString();
    const today = new Date().toDateString();
    const todayISO = new Date().toISOString().split('T')[0];
    
    if (lastDate !== today) {
      // It's a new day - update streak info
      const lastStreakDate = new Date(data.lastStreak);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if the last streak was yesterday to continue the streak
      const streakContinues = lastStreakDate.toDateString() === yesterday.toDateString();
      const newStreakDays = streakContinues ? data.streakDays + 1 : 1;
      
      // Create a storage for today's data in the realData object
      const updatedRealData = { ...data.realData };
      updatedRealData[todayISO] = { reelsWatched: 0, timeSpent: 0 };
      
      setData({
        ...data,
        reelsWatched: 0,
        timeSpent: 0,
        lastUpdated: new Date().toISOString(),
        streakDays: newStreakDays,
        lastStreak: new Date().toISOString(),
        realData: updatedRealData
      });
      
      toast({
        title: "Daily Reset",
        description: `Stats reset for today. Current streak: ${newStreakDays} day${newStreakDays !== 1 ? 's' : ''}.`,
      });
    }
  }, [data, setData, toast]);
  
  const handleReelDetected = () => {
    if (focusModeActive) {
      toast({
        title: "Focus Mode Active",
        description: "Reels are blocked during focus hours.",
        variant: "destructive",
      });
      return;
    }
    
    if (!data) return; // Add safety check
    
    const todayISO = new Date().toISOString().split('T')[0];
    
    setData(prev => {
      if (!prev) return defaultData; // Safety check
      
      const newReelsCount = prev.reelsWatched + 1;
      const newTimeSpent = prev.timeSpent + 10; // 10 seconds per reel
      
      // Update the real data for today
      const updatedRealData = { ...prev.realData };
      if (!updatedRealData[todayISO]) {
        updatedRealData[todayISO] = { reelsWatched: 0, timeSpent: 0 };
      }
      
      updatedRealData[todayISO].reelsWatched += 1;
      updatedRealData[todayISO].timeSpent += 10; // 10 seconds per reel
      
      // Check if limits are reached and show notification
      if (newReelsCount === prev.reelsLimit) {
        toast({
          title: "Reels Limit Reached!",
          description: `You've watched ${prev.reelsLimit} reels today. Consider taking a break!`,
          variant: "destructive",
        });
        
        // Vibrate if supported
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
      }
      
      if (newTimeSpent === prev.timeLimit) {
        toast({
          title: "Time Limit Reached!",
          description: `You've spent ${Math.floor(prev.timeLimit / 60)} minutes watching reels today.`,
          variant: "destructive",
        });
        
        // Vibrate if supported
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
      }
      
      return {
        ...prev,
        reelsWatched: newReelsCount,
        timeSpent: newTimeSpent,
        lastUpdated: new Date().toISOString(),
        realData: updatedRealData
      };
    });
  };
  
  return (
    <AutoTrackingProvider onReelDetected={handleReelDetected}>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-accent/20 dark:from-background dark:to-muted/20">
        <Navbar />
        <StatusBar reelsWatched={data?.reelsWatched || 0} reelsLimit={data?.reelsLimit || 20} />
        
        {focusModeActive && (
          <div className="bg-destructive/20 text-destructive font-medium text-center py-2 px-4 text-sm">
            Focus Mode Active • Reels tracking paused
          </div>
        )}
        
        <main className="flex-1 container max-w-md mx-auto px-4 py-6 pb-20">
          <Outlet />
        </main>
        <FloatingControl disabled={focusModeActive} />
        <BottomNav />
      </div>
    </AutoTrackingProvider>
  );
};
