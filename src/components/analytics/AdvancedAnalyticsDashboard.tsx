import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { analyticsClient, AnalyticsFilters as IAnalyticsFilters } from '@/integrations/supabase/analytics';
import { CLVAnalytics } from './CLVAnalytics';
import { ProfitMarginAnalytics } from './ProfitMarginAnalytics';
import { PredictiveAnalytics } from './PredictiveAnalytics';
import { ProductCostManager } from './ProductCostManager';
import { AnalyticsFilters } from './AnalyticsFilters';
import { TrendChart } from './TrendChart';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Filter, RefreshCw, Download, Zap } from 'lucide-react';

interface DateRange {
  from: Date;
  to: Date;
}

type Period = 'today' | '7d' | '14d' | '30d' | '90d' | 'this_week' | 'this_month' | 'this_year' | 'custom';

export function AdvancedAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState<Period>('30d');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const [filters, setFilters] = useState<IAnalyticsFilters>({});
  const [drillDownData, setDrillDownData] = useState<any>(null);

  // Calculate date range based on period
  const getDateRangeForPeriod = (selectedPeriod: Period): DateRange => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'today':
        return { from: now, to: now };
      case '7d':
        return { from: subDays(now, 7), to: now };
      case '14d':
        return { from: subDays(now, 14), to: now };
      case '30d':
        return { from: subDays(now, 30), to: now };
      case '90d':
        return { from: subDays(now, 90), to: now };
      case 'this_week':
        return { from: startOfWeek(now, { locale: fr }), to: endOfWeek(now, { locale: fr }) };
      case 'this_month':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'this_year':
        return { from: startOfYear(now), to: endOfYear(now) };
      default:
        return dateRange;
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setDateRange(getDateRangeForPeriod(newPeriod));
    }
  };

  // Fetch all analytics data
  const { data: clvData, isLoading: clvLoading, refetch: refetchCLV } = useQuery({
    queryKey: ['analytics-clv', dateRange, filters],
    queryFn: () => analyticsClient.getCLV(dateRange.from, dateRange.to),
    refetchInterval: period === 'today' ? 60000 : 300000, // More frequent for today
  });

  const { data: profitData, isLoading: profitLoading, refetch: refetchProfit } = useQuery({
    queryKey: ['analytics-profit', dateRange, filters],
    queryFn: () => analyticsClient.getProfitMargins(dateRange.from, dateRange.to),
  });

  const { data: forecastData, isLoading: forecastLoading, refetch: refetchForecast } = useQuery({
    queryKey: ['analytics-forecast', dateRange],
    queryFn: () => analyticsClient.getSalesForecasts(dateRange.from, dateRange.to),
  });

  const { data: socialData, isLoading: socialLoading, refetch: refetchSocial } = useQuery({
    queryKey: ['analytics-social', dateRange],
    queryFn: () => analyticsClient.getSocialMetrics(dateRange.from, dateRange.to),
  });

  const { data: dailyTrends, isLoading: trendsLoading, refetch: refetchTrends } = useQuery({
    queryKey: ['analytics-daily-trends', dateRange],
    queryFn: () => analyticsClient.getDailyOverview(dateRange.from, dateRange.to),
  });

  const { data: filterOptions } = useQuery({
    queryKey: ['analytics-filters'],
    queryFn: () => analyticsClient.getFilterOptions(),
  });

  const handleRefreshAll = () => {
    refetchCLV();
    refetchProfit();
    refetchForecast();
    refetchSocial();
    refetchTrends();
  };

  const handleCalculateCLV = async () => {
    try {
      await analyticsClient.calculateCLV();
      refetchCLV();
    } catch (error) {
      console.error('Failed to calculate CLV:', error);
    }
  };

  const exportData = () => {
    // Basic CSV export functionality
    const data = {
      clv: clvData,
      profit: profitData,
      forecast: forecastData,
      social: socialData,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive business insights with CLV, profit margins, and predictive analytics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefreshAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleCalculateCLV}>
            <Zap className="h-4 w-4 mr-2" />
            Update CLV
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Period Selector */}
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="14d">Last 14 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="this_week">This week</SelectItem>
                <SelectItem value="this_month">This month</SelectItem>
                <SelectItem value="this_year">This year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>

            {/* Custom Date Range */}
            {period === 'custom' && (
              <Popover open={customDateOpen} onOpenChange={setCustomDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(dateRange.from, 'dd/MM/yyyy', { locale: fr })} - {format(dateRange.to, 'dd/MM/yyyy', { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="flex">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                      className="rounded-md border-r"
                    />
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                      className="rounded-md"
                    />
                  </div>
                  <div className="p-3 border-t">
                    <Button onClick={() => setCustomDateOpen(false)} className="w-full">
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {Object.entries(filters).map(([key, value]) => 
                  value ? (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {value}
                    </Badge>
                  ) : null
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFilters({})}
                  className="h-6 text-xs"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <AnalyticsFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        filters={filters}
        onFiltersChange={setFilters}
        filterOptions={filterOptions}
      />

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clv">Customer CLV</TabsTrigger>
          <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
          <TabsTrigger value="forecast">Predictions</TabsTrigger>
          <TabsTrigger value="costs">Cost Manager</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trends Chart */}
            <TrendChart
              data={dailyTrends || []}
              title="Revenue & Orders Trend"
              className="lg:col-span-2"
            />
          </div>
          
          {/* Quick CLV Summary */}
          <CLVAnalytics data={clvData} isLoading={clvLoading} />
        </TabsContent>

        <TabsContent value="clv" className="space-y-6">
          <CLVAnalytics data={clvData} isLoading={clvLoading} />
        </TabsContent>

        <TabsContent value="profit" className="space-y-6">
          <ProfitMarginAnalytics data={profitData || []} isLoading={profitLoading} />
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <PredictiveAnalytics data={forecastData || []} isLoading={forecastLoading} />
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <ProductCostManager />
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {socialLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : socialData && socialData.length > 0 ? (
                <div className="space-y-4">
                  {socialData.map((metric, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{metric.platform}</p>
                        <p className="text-sm text-muted-foreground">{metric.metric_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{metric.metric_value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{metric.metric_date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No social media metrics available</p>
                  <p className="text-sm">Connect your social media accounts to track performance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}