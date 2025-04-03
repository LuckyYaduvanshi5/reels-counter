
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Plus, ArrowDown, RotateCcw, Timer,
  AlertCircle, Settings as SettingsIcon
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
};

const defaultData: TrackerData = {
  reelsWatched: 0,
  timeSpent: 0,
  reelsLimit: 20,
  timeLimit: 1800, // 30 minutes in seconds
  lastUpdated: new Date().toISOString(),
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

  // Effect to check daily reset
  React.useEffect(() => {
    const lastDate = new Date(data.lastUpdated).toDateString();
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
      setData({
        ...defaultData,
        reelsLimit: data.reelsLimit,
        timeLimit: data.timeLimit,
        lastUpdated: new Date().toISOString(),
      });
      
      toast({
        title: "Daily Stats Reset",
        description: "Your tracking stats have been reset for today.",
      });
    }
  }, [data, toast, setData]);

  // Handlers
  const increaseReels = () => {
    const newCount = data.reelsWatched + 1;
    setData({
      ...data,
      reelsWatched: newCount,
      lastUpdated: new Date().toISOString(),
    });
    
    // Show warning if limit is reached
    if (newCount === data.reelsLimit) {
      toast({
        title: "Reels Limit Reached!",
        description: `You've watched ${data.reelsLimit} reels today. Consider taking a break!`,
        variant: "destructive",
      });
    }
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
      <h1 className="text-3xl font-bold text-center mb-8 mt-2">Dashboard</h1>
      
      {/* Auto-tracking notification */}
      {isTracking && (
        <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-3 mb-6 animate-pulse flex items-center">
          <AlertCircle size={18} className="text-secondary mr-2" />
          <p className="text-sm">
            <span className="font-medium">Auto-tracking active:</span> Counting reels automatically.
          </p>
        </div>
      )}
      
      {/* Main Counter Card */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-medium text-muted-foreground">Reels Watched Today</h2>
            <div className="text-6xl font-bold text-primary">
              {data.reelsWatched}
            </div>
            <Progress value={reelsProgress} className="h-2 mt-2" />
            <p className="text-sm text-muted-foreground">
              {data.reelsWatched} of {data.reelsLimit} reels
            </p>
          </div>

          <div className="text-center space-y-2 mt-6">
            <h2 className="text-lg font-medium text-muted-foreground flex items-center justify-center gap-1">
              <Timer size={16} /> Time Spent
            </h2>
            <div className="text-4xl font-bold text-secondary">
              {formatTime(data.timeSpent)}
            </div>
            <Progress value={timeProgress} className="h-2 mt-2" />
            <p className="text-sm text-muted-foreground">
              {formatTime(data.timeSpent)} of {formatTime(data.timeLimit)}
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
          className="reels-gradient text-white py-6"
        >
          <Plus size={20} className="mr-2" /> Add Reel
        </Button>
        
        <Button 
          onClick={toggleTracking}
          size="lg" 
          variant={isTracking ? "destructive" : "secondary"}
          className={isTracking ? "" : "teal-gradient text-white py-6"}
        >
          {isTracking ? (
            <><Pause size={20} className="mr-2" /> Stop Tracking</>
          ) : (
            <><Play size={20} className="mr-2" /> Auto Track</>
          )}
        </Button>
      </div>

      {/* Settings & Reports Links */}
      <div className="flex justify-between mt-8">
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
    </div>
  );
}
