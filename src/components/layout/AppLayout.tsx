
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';

export const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-accent/20 dark:from-background dark:to-muted/20">
      <Navbar />
      <main className="flex-1 container max-w-md mx-auto px-4 py-6 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
