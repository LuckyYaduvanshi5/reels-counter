
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Bar, Cell
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DailyData = {
  date: string;
  reelsWatched: number;
  timeSpent: number; // in seconds
  day: string;
};

type TrackerData = {
  reelsWatched: number;
  timeSpent: number;
  reelsLimit: number;
  timeLimit: number;
  lastUpdated: string;
  streakDays: number;
  lastStreak: string;
  realData?: {
    [date: string]: {
      reelsWatched: number;
      timeSpent: number;
    }
  };
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const dayAbbreviations = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function Reports() {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState<DailyData[]>([]);
  const [totalReels, setTotalReels] = useState(0);
  const [avgTime, setAvgTime] = useState(0);
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    // Get real data from localStorage
    const savedData = localStorage.getItem('reels-counter-data');
    if (savedData) {
      const parsedData: TrackerData = JSON.parse(savedData);
      const realData = parsedData.realData || {};
      
      // Process the data for charts
      processData(realData);
    } else {
      // Fallback to generate data if not found
      generateDemoData();
    }
  }, [reportPeriod]);

  const processData = (realData: Record<string, { reelsWatched: number, timeSpent: number }>) => {
    const today = new Date();
    const chartDataArray: DailyData[] = [];
    
    // Calculate totals
    let totalReelsCount = 0;
    let totalTimeSpent = 0;
    let daysWithData = 0;
    
    // Process last 7 days for weekly report
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay(); // 0-6 (Sunday-Saturday)
      
      const dayData = realData[dateString] || { reelsWatched: 0, timeSpent: 0 };
      
      if (dayData.reelsWatched > 0) {
        totalReelsCount += dayData.reelsWatched;
        totalTimeSpent += dayData.timeSpent;
        daysWithData++;
      }
      
      chartDataArray.push({
        date: dateString,
        day: dayAbbreviations[dayOfWeek],
        reelsWatched: dayData.reelsWatched,
        timeSpent: dayData.timeSpent
      });
    }
    
    setChartData(chartDataArray);
    setTotalReels(totalReelsCount);
    setAvgTime(daysWithData > 0 ? Math.round(totalTimeSpent / daysWithData) : 0);
  };

  const generateDemoData = () => {
    const today = new Date();
    const chartDataArray: DailyData[] = [];
    
    let totalReelsCount = 0;
    let totalTimeSpent = 0;
    
    // Generate last 7 days of data
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay(); // 0-6 (Sunday-Saturday)
      
      // Generate random data
      const reelsWatched = Math.floor(Math.random() * 30) + 5;
      const timeSpent = (Math.floor(Math.random() * 60) + 15) * 60; // 15-75 minutes in seconds
      
      totalReelsCount += reelsWatched;
      totalTimeSpent += timeSpent;
      
      chartDataArray.push({
        date: dateString,
        day: dayAbbreviations[dayOfWeek],
        reelsWatched,
        timeSpent
      });
    }
    
    // Use today's actual data if available
    const savedData = localStorage.getItem('reels-counter-data');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const todayIndex = chartDataArray.length - 1;
      
      chartDataArray[todayIndex].reelsWatched = parsedData.reelsWatched;
      chartDataArray[todayIndex].timeSpent = parsedData.timeSpent;
    }
    
    setChartData(chartDataArray);
    setTotalReels(totalReelsCount);
    setAvgTime(Math.round(totalTimeSpent / 7));
  };

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{`Reels: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-1" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>
      
      <Tabs defaultValue="daily" className="w-full" onValueChange={(value) => setReportPeriod(value as 'daily' | 'weekly')}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-4">
          {/* Chart */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="reelsWatched" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#6366f1' : '#d1d5db'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 text-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Average Time</h3>
                <p className="text-2xl font-bold">{formatTime(avgTime)}</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 text-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Reels</h3>
                <p className="text-2xl font-bold">{totalReels}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="weekly" className="space-y-4">
          {/* Charts - Weekly Summary */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="reelsWatched" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 6 ? '#6366f1' : '#d1d5db'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Weekly Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 text-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Weekly Average</h3>
                <p className="text-2xl font-bold">{formatTime(avgTime)}</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 text-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Weekly Total</h3>
                <p className="text-2xl font-bold">{totalReels}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <p className="text-center text-xs text-muted-foreground fixed bottom-20 left-0 right-0">
        Developed by Lucky Yaduvanshi • <a href="https://miniai.online" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">miniai.online</a>
      </p>
    </div>
  );
}
