
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Plus, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useAutoTracking } from '@/components/auto-tracking/AutoTrackingProvider';

type TrackerData = {
  reelsWatched: number;
  timeSpent: number;
  reelsLimit: number;
  timeLimit: number;
  lastUpdated: string;
  streakDays: number;
  lastStreak: string;
  realData?: {
    [date: string]: {
      reelsWatched: number;
      timeSpent: number;
    }
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
  }
};

export default function Home() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useLocalStorage<TrackerData>('reels-counter-data', defaultData);
  const { isTracking, startTracking, stopTracking } = useAutoTracking();

  // Format time helper
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Check if service worker sent any updates while app was closed
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'BACKGROUND_UPDATE') {
        // Update from service worker
        handleReelUpdate();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  // Effect to check for and restore background tracking
  useEffect(() => {
    const wasTracking = localStorage.getItem('reels-counter-tracking') === 'true';
    if (wasTracking && !isTracking) {
      // Automatically restart tracking
      startTracking();
    }
  }, [isTracking, startTracking]);

  // Handle adding a reel manually
  const handleReelUpdate = () => {
    setData(prev => {
      const newReelsCount = prev.reelsWatched + 1;
      const newTimeSpent = prev.timeSpent + 10; // Add 10 seconds per reel
      
      // Update the real data for today
      const todayISO = new Date().toISOString().split('T')[0];
      const updatedRealData = { ...prev.realData || {} };
      
      if (!updatedRealData[todayISO]) {
        updatedRealData[todayISO] = { reelsWatched: 0, timeSpent: 0 };
      }
      
      updatedRealData[todayISO].reelsWatched += 1;
      updatedRealData[todayISO].timeSpent += 10;
      
      // Only show a toast notification for important milestones
      if (newReelsCount === prev.reelsLimit || 
          newReelsCount % 10 === 0 || 
          newTimeSpent === prev.timeLimit) {
        toast({
          title: `${newReelsCount} Reels Watched!`,
          description: `You've spent ${formatTime(newTimeSpent)} watching reels today.`,
          variant: newReelsCount >= prev.reelsLimit ? "destructive" : "default",
        });
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

  // Toggle tracking
  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  // Manual counter
  const increaseReels = () => {
    handleReelUpdate();
  };

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold text-center mb-6 mt-2">Reels Counter</h1>
      
      {/* Main Counter Cards */}
      <div className="grid gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium text-center mb-2">Total Reels Watched</h2>
            <p className="text-6xl font-bold text-center mb-2">{data.reelsWatched}</p>
            <p className="text-xs text-center text-muted-foreground">
              Daily Limit: {data.reelsLimit} reels
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium text-center mb-2">Time Spent</h2>
            <p className="text-5xl font-bold text-center mb-2">{formatTime(data.timeSpent)}</p>
            <p className="text-xs text-center text-muted-foreground">
              Daily Limit: {formatTime(data.timeLimit)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tracking Status */}
      {isTracking && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 my-4 animate-pulse flex items-center justify-center">
          <p className="text-sm font-medium text-primary">
            Auto-tracking active • Counting reels
          </p>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Button 
          onClick={increaseReels}
          size="lg" 
          variant="default"
          className="py-6 bg-gradient-to-r from-primary to-primary/70 text-white shadow-sm"
        >
          <Plus size={20} className="mr-2" /> Add Reel
        </Button>
        
        <Button 
          onClick={toggleTracking}
          size="lg" 
          variant={isTracking ? "destructive" : "secondary"}
          className={isTracking ? "" : "bg-gradient-to-r from-teal-400 to-teal-500 text-white py-6 shadow-sm"}
        >
          {isTracking ? (
            <><Pause size={20} className="mr-2" /> Stop</>
          ) : (
            <><Play size={20} className="mr-2" /> Track</>
          )}
        </Button>
      </div>
      
      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Button
          onClick={() => navigate('/reports')}
          variant="outline"
          className="flex-1 flex items-center justify-center py-6"
        >
          <BarChart3 size={20} className="mr-2" /> Reports
        </Button>
        
        <Button
          onClick={() => navigate('/settings')}
          variant="outline"
          className="flex-1 flex items-center justify-center py-6"
        >
          <Settings size={20} className="mr-2" /> Settings
        </Button>
      </div>
      
      {/* Developer Credit */}
      <p className="text-center text-xs text-muted-foreground mt-auto pt-8 pb-6">
        Developed by Lucky Yaduvanshi<br />
        <a href="https://miniai.online" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          miniai.online
        </a>
      </p>
    </div>
  );
}
