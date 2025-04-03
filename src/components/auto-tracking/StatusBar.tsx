
import React from 'react';
import { useAutoTracking } from './AutoTrackingProvider';
import { Progress } from '@/components/ui/progress';

type StatusBarProps = {
  reelsWatched: number;
  reelsLimit: number;
};

export const StatusBar = ({ reelsWatched, reelsLimit }: StatusBarProps) => {
  const { isTracking, currentInterval } = useAutoTracking();
  const progress = Math.min((reelsWatched / reelsLimit) * 100, 100);
  
  // Only show when tracking is active
  if (!isTracking) return null;
  
  return (
    <div className="fixed top-16 left-0 right-0 z-50 px-2">
      <div className="glass-card mx-auto max-w-md py-1 px-3 rounded-full flex items-center shadow-md animate-fade-in">
        <div className="flex-1 mr-3">
          <Progress value={progress} className="h-2" />
        </div>
        <div className="flex items-center text-xs font-medium">
          <span className="text-primary">{reelsWatched}</span>
          <span className="text-muted-foreground mx-1">of</span>
          <span>{reelsLimit}</span>
          <span className="ml-2 bg-secondary/20 text-secondary rounded-full px-1.5 py-0.5">
            {Math.round(60/currentInterval)}/min
          </span>
        </div>
      </div>
    </div>
  );
};
