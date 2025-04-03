
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoonStar, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";

type FocusModeProps = {
  isEnabled: boolean;
  startTime: string;
  endTime: string;
  days: string[];
  onUpdate: (settings: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    days: string[];
  }) => void;
};

const DAYS_OF_WEEK = [
  { name: 'Monday', value: 'monday' },
  { name: 'Tuesday', value: 'tuesday' },
  { name: 'Wednesday', value: 'wednesday' },
  { name: 'Thursday', value: 'thursday' },
  { name: 'Friday', value: 'friday' },
  { name: 'Saturday', value: 'saturday' },
  { name: 'Sunday', value: 'sunday' },
];

export const FocusMode = ({ isEnabled, startTime, endTime, days, onUpdate }: FocusModeProps) => {
  const [localStartTime, setLocalStartTime] = useState(startTime);
  const [localEndTime, setLocalEndTime] = useState(endTime);
  const [localDays, setLocalDays] = useState<string[]>(days);
  const { toast } = useToast();
  
  const toggleDay = (day: string) => {
    if (localDays.includes(day)) {
      setLocalDays(localDays.filter(d => d !== day));
    } else {
      setLocalDays([...localDays, day]);
    }
  };
  
  const handleSave = () => {
    if (localDays.length === 0) {
      toast({
        title: "Select at least one day",
        description: "Focus mode needs at least one day to be active",
        variant: "destructive",
      });
      return;
    }
    
    onUpdate({
      enabled: true,
      startTime: localStartTime,
      endTime: localEndTime,
      days: localDays,
    });
    
    toast({
      title: "Focus Mode Enabled",
      description: `Reels will be blocked from ${localStartTime} to ${localEndTime}`,
    });
  };
  
  const formatTimeDisplay = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };
  
  const toggleFocusMode = () => {
    onUpdate({
      enabled: !isEnabled,
      startTime: localStartTime,
      endTime: localEndTime,
      days: localDays,
    });
    
    toast({
      title: isEnabled ? "Focus Mode Disabled" : "Focus Mode Enabled",
      description: isEnabled 
        ? "Reels tracking is now active at all times" 
        : `Reels will be blocked from ${formatTimeDisplay(localStartTime)} to ${formatTimeDisplay(localEndTime)}`,
    });
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center justify-between cursor-pointer p-2 hover:bg-accent/10 rounded-md">
          <div className="space-y-0.5">
            <div className="font-medium flex items-center">
              <MoonStar size={16} className="mr-2" />
              Focus Mode
            </div>
            <p className="text-sm text-muted-foreground">
              Schedule no-reels time
            </p>
          </div>
          <div className={`h-6 w-12 rounded-full transition ${isEnabled ? 'bg-primary' : 'bg-muted'} relative flex items-center p-1`}>
            <div className={`h-4 w-4 rounded-full bg-white absolute transition-all ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Focus Mode Settings</DialogTitle>
          <DialogDescription>
            Block reels during specific hours to help you focus
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Block Reels Between</label>
            <div className="flex items-center gap-2">
              <Input 
                type="time"
                value={localStartTime}
                onChange={e => setLocalStartTime(e.target.value)}
                className="flex-1"
              />
              <span>and</span>
              <Input 
                type="time"
                value={localEndTime}
                onChange={e => setLocalEndTime(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Overnight periods (e.g., 22:00 to 06:00) are supported
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Active Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => (
                <Badge 
                  key={day.value}
                  variant={localDays.includes(day.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleDay(day.value)}
                >
                  {day.name.substring(0, 3)}
                </Badge>
              ))}
            </div>
          </div>
          
          <Button 
            variant={isEnabled ? "destructive" : "default"}
            className="w-full mt-4"
            onClick={toggleFocusMode}
          >
            {isEnabled ? "Disable Focus Mode" : "Enable Focus Mode"}
          </Button>
        </div>
        
        <DialogFooter>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
