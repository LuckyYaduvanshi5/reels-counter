
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-primary mb-2">404</h1>
      <p className="text-xl mb-6">Page not found</p>
      <Button 
        onClick={() => navigate('/')}
        variant="default"
        className="flex items-center"
      >
        <Home size={18} className="mr-2" /> Back to Home
      </Button>
    </div>
  );
}
