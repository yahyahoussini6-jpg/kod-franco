import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice } from '@/lib/format';
import { SalesForecasting } from '@/integrations/supabase/analytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Calendar, Target, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PredictiveAnalyticsProps {
  data: SalesForecasting[];
  isLoading?: boolean;
}

export function PredictiveAnalytics({ data, isLoading }: PredictiveAnalyticsProps) {
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.7);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <div className="space-y-2">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p>No forecasting data available</p>
            <p className="text-sm">Forecasts will be generated based on historical data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter by time frame and confidence
  const filteredData = data.filter(item => 
    item.period_type === timeFrame && 
    item.confidence_level >= confidenceThreshold
  );

  // Calculate summary metrics
  const totalPredictedOrders = filteredData.reduce((sum, item) => sum + item.predicted_orders, 0);
  const totalPredictedRevenue = filteredData.reduce((sum, item) => sum + Number(item.predicted_revenue), 0);
  const avgConfidence = filteredData.length > 0 
    ? filteredData.reduce((sum, item) => sum + item.confidence_level, 0) / filteredData.length 
    : 0;

  // Prepare chart data
  const chartData = filteredData.map(item => ({
    date: format(new Date(item.forecast_date), 'dd/MM', { locale: fr }),
    orders: item.predicted_orders,
    revenue: Number(item.predicted_revenue),
    confidence: item.confidence_level * 100,
    seasonal: item.seasonal_factor,
    trend: item.trend_factor
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Find peak and low periods
  const peakRevenue = Math.max(...chartData.map(d => d.revenue));
  const lowRevenue = Math.min(...chartData.map(d => d.revenue));
  
  const peakDay = chartData.find(d => d.revenue === peakRevenue);
  const lowDay = chartData.find(d => d.revenue === lowRevenue);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-blue-600';
    if (confidence >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return { variant: 'default' as const, label: 'High' };
    if (confidence >= 60) return { variant: 'secondary' as const, label: 'Medium' };
    if (confidence >= 40) return { variant: 'outline' as const, label: 'Low' };
    return { variant: 'destructive' as const, label: 'Very Low' };
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Orders</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPredictedOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              For {timeFrame} period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalPredictedRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Forecasted earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getConfidenceColor(avgConfidence * 100)}`}>
              {(avgConfidence * 100).toFixed(1)}%
            </div>
            <Badge {...getConfidenceBadge(avgConfidence * 100)} className="mt-1">
              {getConfidenceBadge(avgConfidence * 100).label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecast Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {timeFrame} data points
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <Select value={timeFrame} onValueChange={(value: any) => setTimeFrame(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Time frame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily Forecast</SelectItem>
            <SelectItem value="weekly">Weekly Forecast</SelectItem>
            <SelectItem value="monthly">Monthly Forecast</SelectItem>
          </SelectContent>
        </Select>

        <Select value={confidenceThreshold.toString()} onValueChange={(value) => setConfidenceThreshold(parseFloat(value))}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Confidence threshold" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.9">High Confidence (90%+)</SelectItem>
            <SelectItem value="0.7">Medium Confidence (70%+)</SelectItem>
            <SelectItem value="0.5">Low Confidence (50%+)</SelectItem>
            <SelectItem value="0">All Predictions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatPrice(Number(value)) : Number(value),
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders & Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Orders"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="confidence" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                  name="Confidence %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Peak Performance</h4>
              {peakDay && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium">Best Day: {peakDay.date}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(peakDay.revenue)} • {peakDay.orders} orders
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Confidence: {peakDay.confidence.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Low Performance</h4>
              {lowDay && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium">Lowest Day: {lowDay.date}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(lowDay.revenue)} • {lowDay.orders} orders
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Confidence: {lowDay.confidence.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-sm mb-2">Seasonal Trends</h4>
            <p className="text-sm text-muted-foreground">
              Forecasts incorporate seasonal patterns and trending factors. 
              Higher seasonal factors indicate expected increases due to seasonal demand.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}