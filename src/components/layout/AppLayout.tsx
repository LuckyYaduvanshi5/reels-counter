
import React, { useEffect } from 'react';
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
};

const defaultData: TrackerData = {
  reelsWatched: 0,
  timeSpent: 0,
  reelsLimit: 20,
  timeLimit: 1800,
  lastUpdated: new Date().toISOString(),
  streakDays: 0,
  lastStreak: new Date().toISOString()
};

export const AppLayout = () => {
  const [data, setData] = useLocalStorage<TrackerData>('reels-counter-data', defaultData);
  const { toast } = useToast();
  
  // Check for day change and reset data if needed
  useEffect(() => {
    const lastDate = new Date(data.lastUpdated).toDateString();
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
      // It's a new day - update streak info
      const lastStreakDate = new Date(data.lastStreak);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if the last streak was yesterday to continue the streak
      const streakContinues = lastStreakDate.toDateString() === yesterday.toDateString();
      const newStreakDays = streakContinues ? data.streakDays + 1 : 1;
      
      setData({
        ...defaultData,
        reelsLimit: data.reelsLimit,
        timeLimit: data.timeLimit,
        lastUpdated: new Date().toISOString(),
        streakDays: newStreakDays,
        lastStreak: new Date().toISOString()
      });
      
      toast({
        title: "Daily Reset",
        description: `Stats reset for today. Current streak: ${newStreakDays} day${newStreakDays !== 1 ? 's' : ''}.`,
      });
    }
  }, [data, setData, toast]);
  
  const handleReelDetected = () => {
    setData(prev => {
      const newReelsCount = prev.reelsWatched + 1;
      const newTimeSpent = prev.timeSpent + 1;
      
      // Check if limits are reached and show notification
      if (newReelsCount === prev.reelsLimit) {
        toast({
          title: "Reels Limit Reached!",
          description: `You've watched ${prev.reelsLimit} reels today. Consider taking a break!`,
          variant: "destructive",
        });
      }
      
      if (newTimeSpent === prev.timeLimit) {
        toast({
          title: "Time Limit Reached!",
          description: `You've spent ${Math.floor(prev.timeLimit / 60)} minutes watching reels today.`,
          variant: "destructive",
        });
      }
      
      return {
        ...prev,
        reelsWatched: newReelsCount,
        timeSpent: newTimeSpent,
        lastUpdated: new Date().toISOString(),
      };
    });
  };
  
  return (
    <AutoTrackingProvider onReelDetected={handleReelDetected}>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-accent/20 dark:from-background dark:to-muted/20">
        <Navbar />
        <StatusBar reelsWatched={data.reelsWatched} reelsLimit={data.reelsLimit} />
        <main className="flex-1 container max-w-md mx-auto px-4 py-6 pb-20">
          <Outlet />
        </main>
        <FloatingControl />
        <BottomNav />
      </div>
    </AutoTrackingProvider>
  );
};
