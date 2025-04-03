
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { FloatingControl } from '../auto-tracking/FloatingControl';
import { StatusBar } from '../auto-tracking/StatusBar';
import { AutoTrackingProvider } from '../auto-tracking/AutoTrackingProvider';
import { useLocalStorage } from '@/hooks/use-local-storage';

type TrackerData = {
  reelsWatched: number;
  timeSpent: number;
  reelsLimit: number;
  timeLimit: number;
};

const defaultData: TrackerData = {
  reelsWatched: 0,
  timeSpent: 0,
  reelsLimit: 20,
  timeLimit: 1800,
};

export const AppLayout = () => {
  const [data, setData] = useLocalStorage<TrackerData>('reels-counter-data', defaultData);
  
  const handleReelDetected = () => {
    setData(prev => ({
      ...prev,
      reelsWatched: prev.reelsWatched + 1,
      // Also increment time spent by the interval amount
      timeSpent: prev.timeSpent + 1,
    }));
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
