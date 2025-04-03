
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Plus, ArrowDown, RotateCcw, Timer,
  AlertCircle, Settings as SettingsIcon, TrendingUp, Award
} from 'lucide-react';
import { 
  Card, CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useAutoTracking } from '@/components/auto-tracking/AutoTrackingProvider';

type TrackerData = {
  reelsWatched: number;
  timeSpent: number; // in seconds
  reelsLimit: number;
  timeLimit: number; // in seconds
  lastUpdated: string;
  streakDays: number;
  lastStreak: string;
};

const defaultData: TrackerData = {
  reelsWatched: 0,
  timeSpent: 0,
  reelsLimit: 20,
  timeLimit: 1800, // 30 minutes in seconds
  lastUpdated: new Date().toISOString(),
  streakDays: 0,
  lastStreak: new Date().toISOString()
};

export default function Home() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useLocalStorage<TrackerData>('reels-counter-data', defaultData);
  const { isTracking, startTracking, stopTracking } = useAutoTracking();

  // Format time helper
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Calculate progress
  const reelsProgress = Math.min((data.reelsWatched / data.reelsLimit) * 100, 100);
  const timeProgress = Math.min((data.timeSpent / data.timeLimit) * 100, 100);

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

  // Handlers
  const handleReelUpdate = () => {
    setData(prev => {
      const newReelsCount = prev.reelsWatched + 1;
      const newTimeSpent = prev.timeSpent + 1;
      
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
      };
    });
  };

  const increaseReels = () => {
    handleReelUpdate();
  };

  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const resetData = () => {
    if (window.confirm("Are you sure you want to reset your tracking data for today?")) {
      setData({
        ...data,
        reelsWatched: 0,
        timeSpent: 0,
        lastUpdated: new Date().toISOString(),
      });
      
      toast({
        title: "Data Reset",
        description: "Your tracking data has been reset.",
      });
      
      // Also stop tracking if it's active
      if (isTracking) {
        stopTracking();
      }
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-3xl font-bold text-center mb-4 mt-2">Dashboard</h1>
      
      {/* Streak Card */}
      <Card className="glass-card overflow-hidden border-cyan-300/30 shadow-cyan-200/10">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-cyan-400/10 p-2 rounded-full mr-3">
              <Award size={20} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
              <p className="text-2xl font-bold">{data.streakDays} day{data.streakDays !== 1 ? 's' : ''}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <p className="text-xs text-muted-foreground mb-1">Today's Trend</p>
            <div className="flex items-center text-cyan-400">
              <TrendingUp size={14} className="mr-1" />
              <span className="text-sm font-medium">
                {Math.max(0, data.reelsWatched - 10)} above avg
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Auto-tracking notification */}
      {isTracking && (
        <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-3 mb-2 animate-pulse flex items-center">
          <AlertCircle size={18} className="text-secondary mr-2" />
          <p className="text-sm">
            <span className="font-medium">Auto-tracking active:</span> Counting reels automatically.
          </p>
        </div>
      )}
      
      {/* Main Counter Card */}
      <Card className="glass-card overflow-hidden border-primary/30 shadow-lg">
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-1"></div>
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-medium text-muted-foreground">Reels Watched Today</h2>
            <div className="text-6xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
              {data.reelsWatched}
            </div>
            <Progress value={reelsProgress} className="h-2 mt-2" />
            <p className="text-sm text-muted-foreground flex items-center justify-center">
              <span className="font-medium text-primary mr-1">{data.reelsWatched}</span> of 
              <span className="font-medium ml-1">{data.reelsLimit}</span> reels
              {reelsProgress >= 100 && (
                <span className="ml-2 text-destructive">Limit reached!</span>
              )}
            </p>
          </div>

          <div className="text-center space-y-2 mt-6">
            <h2 className="text-lg font-medium text-muted-foreground flex items-center justify-center gap-1">
              <Timer size={16} /> Time Spent
            </h2>
            <div className="text-4xl font-bold bg-gradient-to-br from-secondary to-secondary/70 bg-clip-text text-transparent">
              {formatTime(data.timeSpent)}
            </div>
            <Progress value={timeProgress} className="h-2 mt-2" />
            <p className="text-sm text-muted-foreground flex items-center justify-center">
              <span className="font-medium text-secondary mr-1">{formatTime(data.timeSpent)}</span> of
              <span className="font-medium ml-1">{formatTime(data.timeLimit)}</span>
              {timeProgress >= 100 && (
                <span className="ml-2 text-destructive">Limit reached!</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={increaseReels}
          size="lg" 
          variant="default"
          className="reels-gradient text-white py-6 shadow-md"
        >
          <Plus size={20} className="mr-2" /> Add Reel
        </Button>
        
        <Button 
          onClick={toggleTracking}
          size="lg" 
          variant={isTracking ? "destructive" : "secondary"}
          className={isTracking ? "" : "teal-gradient text-white py-6 shadow-md"}
        >
          {isTracking ? (
            <><Pause size={20} className="mr-2" /> Stop Tracking</>
          ) : (
            <><Play size={20} className="mr-2" /> Auto Track</>
          )}
        </Button>
      </div>

      {/* Settings & Reports Links */}
      <div className="flex justify-between mt-4">
        <Button
          onClick={() => navigate('/reports')}
          variant="outline"
          className="flex items-center"
        >
          <ArrowDown size={18} className="mr-2" /> View Reports
        </Button>
        
        <Button
          onClick={() => navigate('/settings')}
          variant="outline"
          className="flex items-center"
        >
          <SettingsIcon size={18} className="mr-2" /> Settings
        </Button>
        
        <Button
          onClick={resetData}
          variant="outline"
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <RotateCcw size={18} className="mr-2" /> Reset
        </Button>
      </div>
      
      {/* Developer Credit */}
      <p className="text-center text-xs text-muted-foreground pt-4">
        Developed by Lucky Yaduvanshi<br />
        <a href="https://miniai.online" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          miniai.online
        </a>
      </p>
    </div>
  );
}
