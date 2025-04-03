
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Plus, ArrowDown, RotateCcw, Timer
} from 'lucide-react';
import { 
  Card, CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

type TrackerData = {
  reelsWatched: number;
  timeSpent: number; // in seconds
  isTracking: boolean;
  reelsLimit: number;
  timeLimit: number; // in seconds
  lastUpdated: string;
};

const defaultData: TrackerData = {
  reelsWatched: 0,
  timeSpent: 0,
  isTracking: false,
  reelsLimit: 20,
  timeLimit: 1800, // 30 minutes in seconds
  lastUpdated: new Date().toISOString(),
};

export default function Home() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<TrackerData>(() => {
    const savedData = localStorage.getItem('reels-counter-data');
    return savedData ? JSON.parse(savedData) : defaultData;
  });
  const [intervalId, setIntervalId] = useState<number | null>(null);

  // Format time helper
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Calculate progress
  const reelsProgress = Math.min((data.reelsWatched / data.reelsLimit) * 100, 100);
  const timeProgress = Math.min((data.timeSpent / data.timeLimit) * 100, 100);

  // Effect to save data
  useEffect(() => {
    localStorage.setItem('reels-counter-data', JSON.stringify({
      ...data,
      lastUpdated: new Date().toISOString(),
    }));
  }, [data]);

  // Timer effect
  useEffect(() => {
    if (data.isTracking) {
      const interval = window.setInterval(() => {
        setData(prev => {
          const newTimeSpent = prev.timeSpent + 1;
          
          // Check if limits are reached
          if (newTimeSpent === prev.timeLimit) {
            toast({
              title: "Time Limit Reached!",
              description: `You've spent ${formatTime(prev.timeLimit)} on reels today.`,
              variant: "destructive",
            });
          }
          
          return {
            ...prev,
            timeSpent: newTimeSpent,
          };
        });
      }, 1000);
      
      setIntervalId(interval);
      return () => clearInterval(interval);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [data.isTracking, toast, data.timeLimit]);

  // Check daily reset
  useEffect(() => {
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
  }, [data, toast]);

  // Handlers
  const increaseReels = () => {
    const newCount = data.reelsWatched + 1;
    setData(prev => ({
      ...prev,
      reelsWatched: newCount,
    }));
    
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
    setData(prev => ({
      ...prev, 
      isTracking: !prev.isTracking
    }));
  };

  const resetData = () => {
    if (window.confirm("Are you sure you want to reset your tracking data for today?")) {
      setData({
        ...data,
        reelsWatched: 0,
        timeSpent: 0,
        isTracking: false,
      });
      
      toast({
        title: "Data Reset",
        description: "Your tracking data has been reset.",
      });
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-3xl font-bold text-center mb-8 mt-2">Dashboard</h1>
      
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
          variant={data.isTracking ? "destructive" : "secondary"}
          className={data.isTracking ? "" : "teal-gradient text-white py-6"}
        >
          {data.isTracking ? (
            <><Pause size={20} className="mr-2" /> Pause</>
          ) : (
            <><Play size={20} className="mr-2" /> Track Time</>
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
