
import React from 'react';
import { useAutoTracking } from './AutoTrackingProvider';
import { Play, Pause, Timer, ChevronUp, ChevronDown, Lock } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

type FloatingControlProps = {
  disabled?: boolean;
};

export const FloatingControl = ({ disabled = false }: FloatingControlProps) => {
  const { isTracking, startTracking, stopTracking, setReelInterval, currentInterval } = useAutoTracking();
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const handleToggleTracking = () => {
    if (disabled) {
      toast({
        title: "Focus Mode Active",
        description: "Tracking is disabled during focus hours.",
        variant: "destructive",
      });
      return;
    }
    
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };
  
  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="flex flex-col items-end space-y-2">
        {isExpanded && (
          <div className="glass-card p-3 rounded-lg shadow-lg animate-fade-in w-48">
            <div className="flex flex-col space-y-3">
              <div className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center">
                  <Timer size={14} className="mr-1" /> Interval
                </span>
                <span className="text-primary">{currentInterval}s</span>
              </div>
              
              <Drawer>
                <DrawerTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    disabled={disabled}
                  >
                    Adjust Interval
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="px-4 py-6">
                    <h3 className="text-lg font-medium mb-4">Set Reels Interval</h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Every {currentInterval} seconds</span>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(60/currentInterval)} reels/minute
                          </span>
                        </div>
                        <Slider 
                          value={[currentInterval]} 
                          min={5} 
                          max={60} 
                          step={5}
                          onValueChange={(values) => setReelInterval(values[0])}
                          disabled={disabled}
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {[5, 10, 30].map(seconds => (
                          <Button 
                            key={seconds}
                            variant={currentInterval === seconds ? "default" : "outline"}
                            size="sm"
                            onClick={() => setReelInterval(seconds)}
                            disabled={disabled}
                          >
                            {seconds}s
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
              
              <Button
                variant={isTracking ? "destructive" : "default"}
                className={isTracking ? "" : "teal-gradient text-white"}
                onClick={handleToggleTracking}
                size="sm"
                disabled={disabled}
              >
                {isTracking ? (
                  <><Pause size={16} className="mr-2" /> Stop Tracking</>
                ) : (
                  <><Play size={16} className="mr-2" /> Start Tracking</>
                )}
              </Button>
            </div>
          </div>
        )}
        
        <Button
          size="icon"
          className={`rounded-full h-12 w-12 shadow-lg ${
            disabled ? 'bg-muted text-muted-foreground' : 
            isTracking ? 'bg-destructive hover:bg-destructive/90' : 'reels-gradient'
          }`}
          onClick={() => disabled ? null : setIsExpanded(!isExpanded)}
        >
          {disabled ? (
            <Lock size={24} />
          ) : isExpanded ? (
            <ChevronDown size={24} />
          ) : (
            isTracking ? <Pause size={24} /> : <Play size={24} />
          )}
        </Button>
      </div>
    </div>
  );
};
