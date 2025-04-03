
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
import { Lock, CheckCircle } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

type ParentalControlProps = {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
};

export const ParentalControl = ({ isEnabled, onToggle }: ParentalControlProps) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'setup' | 'enter' | 'confirm'>('enter');
  const [currentPin, setCurrentPin] = useLocalStorage<string>('reels-counter-pin', '1234');
  const { toast } = useToast();
  
  const handleSetup = () => {
    if (pin.length < 4) {
      toast({
        title: "PIN too short",
        description: "Please use at least 4 digits",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 'setup') {
      setStep('confirm');
      return;
    }
    
    if (step === 'confirm') {
      if (pin !== confirmPin) {
        toast({
          title: "PINs don't match",
          description: "Please try again",
          variant: "destructive",
        });
        setPin('');
        setConfirmPin('');
        setStep('setup');
        return;
      }
      
      setCurrentPin(pin);
      onToggle(true);
      toast({
        title: "Parental Control Enabled",
        description: "PIN has been set successfully",
      });
      setPin('');
      setConfirmPin('');
      setStep('enter');
      return;
    }
    
    if (step === 'enter') {
      if (pin !== currentPin) {
        toast({
          title: "Incorrect PIN",
          description: "Please try again",
          variant: "destructive",
        });
        setPin('');
        return;
      }
      
      onToggle(!isEnabled);
      toast({
        title: isEnabled ? "Parental Control Disabled" : "Parental Control Enabled",
        description: isEnabled ? "PIN protection removed" : "PIN protection active",
      });
      setPin('');
      return;
    }
  };
  
  const resetForm = () => {
    setPin('');
    setConfirmPin('');
    setStep(isEnabled ? 'enter' : 'setup');
  };
  
  return (
    <Dialog onOpenChange={() => resetForm()}>
      <DialogTrigger asChild>
        <div className="flex items-center justify-between cursor-pointer p-2 hover:bg-accent/10 rounded-md">
          <div className="space-y-0.5">
            <div className="font-medium flex items-center">
              <Lock size={16} className="mr-2" />
              Parental Controls
            </div>
            <p className="text-sm text-muted-foreground">
              Lock settings with PIN
            </p>
          </div>
          <div className={`h-6 w-12 rounded-full transition ${isEnabled ? 'bg-primary' : 'bg-muted'} relative flex items-center p-1`}>
            <div className={`h-4 w-4 rounded-full bg-white absolute transition-all ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 'setup' && "Set Parental Control PIN"}
            {step === 'confirm' && "Confirm Your PIN"}
            {step === 'enter' && (isEnabled ? "Disable Parental Control" : "Enable Parental Control")}
          </DialogTitle>
          <DialogDescription>
            {step === 'setup' && "Create a PIN to restrict access to settings"}
            {step === 'confirm' && "Enter the same PIN again to confirm"}
            {step === 'enter' && "Enter your PIN to continue"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {step === 'setup' && (
            <Input 
              type="password"
              placeholder="Enter a 4-digit PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="text-center text-lg tracking-widest"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              autoFocus
            />
          )}
          
          {step === 'confirm' && (
            <Input 
              type="password"
              placeholder="Confirm your PIN"
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value)}
              className="text-center text-lg tracking-widest"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              autoFocus
            />
          )}
          
          {step === 'enter' && (
            <Input 
              type="password"
              placeholder="Enter your PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="text-center text-lg tracking-widest"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              autoFocus
            />
          )}
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleSetup}
            type="submit"
            disabled={
              (step === 'setup' && pin.length < 4) ||
              (step === 'confirm' && confirmPin.length < 4) ||
              (step === 'enter' && pin.length < 4)
            }
          >
            {step === 'setup' && "Next"}
            {step === 'confirm' && "Confirm PIN"}
            {step === 'enter' && (isEnabled ? "Disable" : "Enable")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
