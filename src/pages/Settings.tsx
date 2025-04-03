
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Moon,
  Save,
  Shield,
  Clock,
  BellRing,
  RotateCcw,
  ArrowLeft,
  Award,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

type SettingsData = {
  reelsLimit: number;
  timeLimit: number; // in minutes
  enableAlerts: boolean;
  enableVibration: boolean;
  parentalControl: boolean;
  focusMode: boolean;
  streakGoal: number;
};

const defaultSettings: SettingsData = {
  reelsLimit: 20,
  timeLimit: 30, // 30 minutes
  enableAlerts: true,
  enableVibration: true,
  parentalControl: false,
  focusMode: false,
  streakGoal: 7
};

export default function Settings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<SettingsData>(() => {
    const savedSettings = localStorage.getItem('reels-counter-settings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Load settings
  useEffect(() => {
    const savedData = localStorage.getItem('reels-counter-data');
    if (savedData) {
      const { reelsLimit, timeLimit } = JSON.parse(savedData);
      setSettings(prev => ({
        ...prev,
        reelsLimit,
        timeLimit: timeLimit / 60, // Convert seconds to minutes for UI
      }));
    }
  }, []);

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('reels-counter-settings', JSON.stringify(settings));
    
    // Also update the main data
    const savedData = localStorage.getItem('reels-counter-data');
    if (savedData) {
      const data = JSON.parse(savedData);
      data.reelsLimit = settings.reelsLimit;
      data.timeLimit = settings.timeLimit * 60; // Convert minutes to seconds
      localStorage.setItem('reels-counter-data', JSON.stringify(data));
    }
    
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
      
      toast({
        title: "All Data Reset",
        description: "All app data has been reset to default values.",
      });
      
      // Navigate to home after reset
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
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
      
      {/* Limits Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={18} /> Limits
          </CardTitle>
          <CardDescription>Set your daily usage limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="reelsLimit">Reels Limit</Label>
              <span className="text-sm font-medium">{settings.reelsLimit} reels</span>
            </div>
            <Slider
              id="reelsLimit"
              min={5}
              max={100}
              step={5}
              value={[settings.reelsLimit]}
              onValueChange={(value) => setSettings({ ...settings, reelsLimit: value[0] })}
              className="py-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="timeLimit">Time Limit</Label>
              <span className="text-sm font-medium">{settings.timeLimit} min</span>
            </div>
            <Slider
              id="timeLimit"
              min={5}
              max={120}
              step={5}
              value={[settings.timeLimit]}
              onValueChange={(value) => setSettings({ ...settings, timeLimit: value[0] })}
              className="py-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="streakGoal">Streak Goal</Label>
              <span className="text-sm font-medium">{settings.streakGoal} days</span>
            </div>
            <Slider
              id="streakGoal"
              min={1}
              max={30}
              step={1}
              value={[settings.streakGoal]}
              onValueChange={(value) => setSettings({ ...settings, streakGoal: value[0] })}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Set a goal for your continuous usage streak
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Alerts Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing size={18} /> Alerts
          </CardTitle>
          <CardDescription>Configure notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableAlerts">Enable Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications when limits are reached
              </p>
            </div>
            <Switch
              id="enableAlerts"
              checked={settings.enableAlerts}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, enableAlerts: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableVibration">Vibration</Label>
              <p className="text-sm text-muted-foreground">
                Vibrate when alerts are shown
              </p>
            </div>
            <Switch
              id="enableVibration"
              checked={settings.enableVibration}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, enableVibration: checked })
              }
              disabled={!settings.enableAlerts}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* App Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable dark mode
              </p>
            </div>
            <Switch
              id="darkMode"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => 
                setTheme(checked ? 'dark' : 'light')
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="parentalControl">Parental Controls</Label>
              <p className="text-sm text-muted-foreground">
                Lock settings with PIN
              </p>
            </div>
            <Switch
              id="parentalControl"
              checked={settings.parentalControl}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, parentalControl: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="focusMode">Focus Mode</Label>
              <p className="text-sm text-muted-foreground">
                Schedule no-reels time
              </p>
            </div>
            <Switch
              id="focusMode"
              checked={settings.focusMode}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, focusMode: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
      
      {/* About Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award size={18} /> About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium">Reels Counter</h3>
            <p className="text-sm text-muted-foreground mt-1">Version 1.0</p>
            
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
      <div className="flex flex-col space-y-3">
        <Button 
          onClick={handleSaveSettings}
          size="lg" 
          className="reels-gradient w-full text-white"
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
      
      <p className="text-center text-xs text-muted-foreground mb-20">
        Reels Counter App v1.0 • Made with ❤️
      </p>
    </div>
  );
}
