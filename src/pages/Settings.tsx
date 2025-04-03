
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Moon,
  Save,
  Clock,
  BellRing,
  RotateCcw,
  ArrowLeft,
  Award,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ParentalControl } from '@/components/settings/ParentalControl';
import { FocusMode } from '@/components/settings/FocusMode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type TrackerData = {
  reelsWatched: number;
  timeSpent: number;
  reelsLimit: number;
  timeLimit: number;
  lastUpdated: string;
  streakDays: number;
  lastStreak: string;
  focusMode?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    days: string[];
  };
  parentalControl?: {
    enabled: boolean;
    pin: string;
  };
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
  timeLimit: 1800, // 30 minutes in seconds
  lastUpdated: new Date().toISOString(),
  streakDays: 0,
  lastStreak: new Date().toISOString(),
  focusMode: {
    enabled: false,
    startTime: "22:00",
    endTime: "06:00",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  },
  parentalControl: {
    enabled: false,
    pin: "1234"
  },
  realData: {
    [new Date().toISOString().split('T')[0]]: {
      reelsWatched: 0,
      timeSpent: 0
    }
  }
};

export default function Settings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [data, setData] = useLocalStorage<TrackerData>('reels-counter-data', defaultData);
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [enableVibration, setEnableVibration] = useState(true);
  const [streakGoal, setStreakGoal] = useState(7);
  
  // State for settings dialogs
  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [reelsDialogOpen, setReelsDialogOpen] = useState(false);
  const [streakDialogOpen, setStreakDialogOpen] = useState(false);
  
  // Temporary state for settings being edited
  const [tempTimeLimit, setTempTimeLimit] = useState<number[]>([30]);
  const [tempReelsLimit, setTempReelsLimit] = useState<number[]>([20]);
  const [tempStreakGoal, setTempStreakGoal] = useState<number[]>([7]);
  
  useEffect(() => {
    // Set streak goal from localStorage if available
    const goalFromStorage = localStorage.getItem('reels-counter-streak-goal');
    if (goalFromStorage) {
      setStreakGoal(parseInt(goalFromStorage, 10));
      setTempStreakGoal([parseInt(goalFromStorage, 10)]);
    }
    
    // Load alerts settings
    const alertsEnabled = localStorage.getItem('reels-counter-alerts') !== 'false';
    const vibrationEnabled = localStorage.getItem('reels-counter-vibration') !== 'false';
    setEnableAlerts(alertsEnabled);
    setEnableVibration(vibrationEnabled);
    
    // Init temporary values from current data
    if (data) {
      setTempTimeLimit([Math.floor(data.timeLimit / 60)]);
      setTempReelsLimit([data.reelsLimit]);
    }
  }, [data]);
  
  const saveTimeLimit = () => {
    if (!data) return;
    
    // Convert minutes to seconds for storage
    const timeInSeconds = tempTimeLimit[0] * 60;
    
    setData(prev => {
      if (!prev) return defaultData;
      return {
        ...prev,
        timeLimit: timeInSeconds
      };
    });
    
    toast({
      title: "Time Limit Updated",
      description: `Daily time limit set to ${tempTimeLimit[0]} minutes`,
    });
    
    setTimeDialogOpen(false);
  };
  
  const saveReelsLimit = () => {
    if (!data) return;
    
    setData(prev => {
      if (!prev) return defaultData;
      return {
        ...prev,
        reelsLimit: tempReelsLimit[0]
      };
    });
    
    toast({
      title: "Reels Limit Updated",
      description: `Daily reels limit set to ${tempReelsLimit[0]} reels`,
    });
    
    setReelsDialogOpen(false);
  };
  
  const saveStreakGoal = () => {
    setStreakGoal(tempStreakGoal[0]);
    localStorage.setItem('reels-counter-streak-goal', tempStreakGoal[0].toString());
    
    toast({
      title: "Streak Goal Updated",
      description: `Streak goal set to ${tempStreakGoal[0]} days`,
    });
    
    setStreakDialogOpen(false);
  };
  
  const handleSaveSettings = () => {
    // Save all settings to localStorage
    localStorage.setItem('reels-counter-alerts', enableAlerts.toString());
    localStorage.setItem('reels-counter-vibration', enableVibration.toString());
    localStorage.setItem('reels-counter-streak-goal', streakGoal.toString());
    
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
  };

  const resetAllData = () => {
    if (window.confirm("Are you sure you want to reset all app data? This cannot be undone.")) {
      localStorage.removeItem('reels-counter-data');
      localStorage.removeItem('reels-counter-settings');
      localStorage.removeItem('reels-counter-tracking');
      localStorage.removeItem('reels-counter-interval');
      localStorage.removeItem('reels-counter-alerts');
      localStorage.removeItem('reels-counter-vibration');
      localStorage.removeItem('reels-counter-streak-goal');
      localStorage.removeItem('reels-counter-pin');
      
      toast({
        title: "All Data Reset",
        description: "All app data has been reset to default values.",
      });
      
      // Navigate to home after reset
      navigate('/', { replace: true });
    }
  };
  
  const handleFocusModeUpdate = (settings: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    days: string[];
  }) => {
    setData(prev => {
      if (!prev) return defaultData;
      return {
        ...prev,
        focusMode: settings
      };
    });
  };
  
  const handleParentalControlToggle = (enabled: boolean) => {
    setData(prev => {
      if (!prev) return defaultData;
      return {
        ...prev,
        parentalControl: {
          ...prev.parentalControl || { pin: "1234" },
          enabled
        }
      };
    });
  };

  // Convert seconds to minutes for UI
  const timeLimitInMinutes = data ? Math.floor(data.timeLimit / 60) : 30;

  return (
    <div className="space-y-6 animate-slide-up pb-20">
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-bold text-center">Settings</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>
      
      {/* Usage Limits Card */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Usage Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div 
            className="flex items-center justify-between border-b pb-5 cursor-pointer"
            onClick={() => setReelsDialogOpen(true)}
          >
            <div>
              <h3 className="font-medium">Daily Limit</h3>
              <p className="text-sm text-muted-foreground">Set max reels per day</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{data?.reelsLimit || 20}</span>
              <ChevronRight size={18} className="text-muted-foreground" />
            </div>
          </div>
          
          <div 
            className="flex items-center justify-between border-b pb-5 cursor-pointer"
            onClick={() => setTimeDialogOpen(true)}
          >
            <div>
              <h3 className="font-medium">Time Limit</h3>
              <p className="text-sm text-muted-foreground">Max time watching reels</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{timeLimitInMinutes} min</span>
              <ChevronRight size={18} className="text-muted-foreground" />
            </div>
          </div>
          
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setStreakDialogOpen(true)}
          >
            <div>
              <h3 className="font-medium">Streak Goal</h3>
              <p className="text-sm text-muted-foreground">Set a goal for your streak</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{streakGoal} days</span>
              <ChevronRight size={18} className="text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* App Features Card */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">App Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ParentalControl 
            isEnabled={data?.parentalControl?.enabled || false}
            onToggle={handleParentalControlToggle}
          />
          
          <FocusMode 
            isEnabled={data?.focusMode?.enabled || false}
            startTime={data?.focusMode?.startTime || "22:00"}
            endTime={data?.focusMode?.endTime || "06:00"}
            days={data?.focusMode?.days || ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]}
            onUpdate={handleFocusModeUpdate}
          />
          
          <div className="flex items-center justify-between cursor-pointer p-2 hover:bg-accent/10 rounded-md">
            <div className="space-y-0.5">
              <div className="font-medium flex items-center">
                <Moon size={16} className="mr-2" />
                Dark Mode
              </div>
              <p className="text-sm text-muted-foreground">
                Enable dark mode
              </p>
            </div>
            <div 
              className={`h-6 w-12 rounded-full transition ${theme === 'dark' ? 'bg-primary' : 'bg-muted'} relative flex items-center p-1 cursor-pointer`}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <div className={`h-4 w-4 rounded-full bg-white absolute transition-all ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between cursor-pointer p-2 hover:bg-accent/10 rounded-md">
            <div className="space-y-0.5">
              <div className="font-medium flex items-center">
                <BellRing size={16} className="mr-2" />
                Notifications
              </div>
              <p className="text-sm text-muted-foreground">
                Show alerts when limits are reached
              </p>
            </div>
            <div 
              className={`h-6 w-12 rounded-full transition ${enableAlerts ? 'bg-primary' : 'bg-muted'} relative flex items-center p-1 cursor-pointer`}
              onClick={() => setEnableAlerts(!enableAlerts)}
            >
              <div className={`h-4 w-4 rounded-full bg-white absolute transition-all ${enableAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between cursor-pointer p-2 hover:bg-accent/10 rounded-md">
            <div className="space-y-0.5">
              <div className="font-medium flex items-center">
                <Award size={16} className="mr-2" />
                Vibration
              </div>
              <p className="text-sm text-muted-foreground">
                Vibrate when alerts are shown
              </p>
            </div>
            <div 
              className={`h-6 w-12 rounded-full transition ${enableVibration ? 'bg-primary' : 'bg-muted'} relative flex items-center p-1 cursor-pointer`}
              onClick={() => setEnableVibration(!enableVibration)}
            >
              <div className={`h-4 w-4 rounded-full bg-white absolute transition-all ${enableVibration ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* About Card */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium">Reels Counter</h3>
            <p className="text-sm text-muted-foreground mt-1">Version 1.1</p>
            
            <div className="flex flex-col items-center mt-4">
              <p className="text-sm">Developed by</p>
              <p className="font-medium">Lucky Yaduvanshi</p>
              <a 
                href="https://miniai.online" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center mt-1 text-sm"
              >
                miniai.online <ExternalLink size={12} className="ml-1" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent z-10">
        <div className="flex flex-col space-y-3 container max-w-md mx-auto">
          <Button 
            onClick={handleSaveSettings}
            size="lg" 
            className="w-full bg-gradient-to-r from-primary to-primary/70 text-white"
          >
            <Save size={18} className="mr-2" /> Save Settings
          </Button>
          
          <Button 
            onClick={resetAllData}
            variant="outline" 
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <RotateCcw size={18} className="mr-2" /> Reset All Data
          </Button>
        </div>
      </div>
      
      {/* Time Limit Dialog */}
      <Dialog open={timeDialogOpen} onOpenChange={setTimeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Daily Time Limit</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div className="mb-6">
                <p className="text-center text-2xl font-bold">{tempTimeLimit[0]} minutes</p>
              </div>
              
              <Slider
                value={tempTimeLimit}
                min={5}
                max={120}
                step={5}
                onValueChange={setTempTimeLimit}
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 min</span>
                <span>60 min</span>
                <span>120 min</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setTimeDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={saveTimeLimit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reels Limit Dialog */}
      <Dialog open={reelsDialogOpen} onOpenChange={setReelsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Daily Reels Limit</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div className="mb-6">
                <p className="text-center text-2xl font-bold">{tempReelsLimit[0]} reels</p>
              </div>
              
              <Slider
                value={tempReelsLimit}
                min={5}
                max={100}
                step={5}
                onValueChange={setTempReelsLimit}
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setReelsDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={saveReelsLimit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Streak Goal Dialog */}
      <Dialog open={streakDialogOpen} onOpenChange={setStreakDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Streak Goal</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div className="mb-6">
                <p className="text-center text-2xl font-bold">{tempStreakGoal[0]} days</p>
              </div>
              
              <Slider
                value={tempStreakGoal}
                min={1}
                max={30}
                step={1}
                onValueChange={setTempStreakGoal}
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 day</span>
                <span>15 days</span>
                <span>30 days</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setStreakDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={saveStreakGoal}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
