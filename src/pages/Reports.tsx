
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock } from 'lucide-react';

type DailyData = {
  date: string;
  reelsWatched: number;
  timeSpent: number; // in seconds
};

type WeeklyData = Record<string, DailyData>;

const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

const generateFakeData = () => {
  const mockData: WeeklyData = {};
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    mockData[dateString] = {
      date: dateString,
      reelsWatched: Math.floor(Math.random() * 30) + 5,
      timeSpent: (Math.floor(Math.random() * 40) + 10) * 60, // 10-50 minutes in seconds
    };
  }

  // Use today's actual data
  const todayString = today.toISOString().split('T')[0];
  const savedData = localStorage.getItem('reels-counter-data');
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    mockData[todayString] = {
      date: todayString,
      reelsWatched: parsedData.reelsWatched,
      timeSpent: parsedData.timeSpent,
    };
  }
  
  return mockData;
};

export default function Reports() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({});
  const [chartData, setChartData] = useState<DailyData[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from backend or IndexedDB
    // For demo, we'll generate some fake data plus today's real data
    const data = generateFakeData();
    setWeeklyData(data);
    
    // Convert to array for charts
    setChartData(Object.values(data).map(day => ({
      ...day,
      date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    })));
  }, []);

  // Calculate averages
  const calculateAverages = () => {
    const days = Object.values(weeklyData);
    if (days.length === 0) return { avgReels: 0, avgTime: 0 };
    
    const totalReels = days.reduce((sum, day) => sum + day.reelsWatched, 0);
    const totalTime = days.reduce((sum, day) => sum + day.timeSpent, 0);
    
    return {
      avgReels: Math.round(totalReels / days.length),
      avgTime: Math.round(totalTime / days.length),
    };
  };

  const { avgReels, avgTime } = calculateAverages();

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-3xl font-bold text-center mb-8 mt-2">Reports</h1>
      
      {/* Statistics Summary Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center text-primary mb-1">
                <Calendar size={16} className="mr-1" />
                <span className="text-sm font-medium">Avg. Reels</span>
              </div>
              <p className="text-2xl font-bold">{avgReels}</p>
              <p className="text-xs text-muted-foreground">per day</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center text-secondary mb-1">
                <Clock size={16} className="mr-1" />
                <span className="text-sm font-medium">Avg. Time</span>
              </div>
              <p className="text-2xl font-bold">{formatTime(avgTime)}</p>
              <p className="text-xs text-muted-foreground">per day</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Charts Card */}
      <Card className="glass-card">
        <CardHeader>
          <Tabs defaultValue="reels">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reels">Reels Watched</TabsTrigger>
              <TabsTrigger value="time">Time Spent</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reels" className="pt-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} reels`, 'Watched']}
                      labelFormatter={(label) => `Day: ${label}`}
                    />
                    <Bar 
                      dataKey="reelsWatched" 
                      name="Reels Watched" 
                      fill="#7E57C2" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="time" className="pt-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis 
                      tickFormatter={(seconds) => `${Math.floor(seconds / 60)}m`} 
                    />
                    <Tooltip
                      formatter={(value) => [formatTime(value as number), 'Time']}
                      labelFormatter={(label) => `Day: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="timeSpent" 
                      name="Time Spent" 
                      stroke="#26A69A" 
                      strokeWidth={2}
                      dot={{ stroke: '#26A69A', strokeWidth: 2, r: 4 }}
                      activeDot={{ stroke: '#26A69A', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
      
      <p className="text-center text-sm text-muted-foreground">
        Reports are only available for the last 7 days in this version.
      </p>
    </div>
  );
}
