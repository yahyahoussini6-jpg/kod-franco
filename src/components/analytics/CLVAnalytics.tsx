import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatPrice } from '@/lib/format';
import { CLVMetrics } from '@/integrations/supabase/analytics';
import { Users, TrendingUp, AlertTriangle, Star } from 'lucide-react';

interface CLVAnalyticsProps {
  data: CLVMetrics | null;
  isLoading?: boolean;
}

export function CLVAnalytics({ data, isLoading }: CLVAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-8 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No CLV data available
        </CardContent>
      </Card>
    );
  }

  const churnRiskPercentage = data.total_customers > 0 
    ? (data.churn_risk_customers / data.total_customers) * 100 
    : 0;

  const highValuePercentage = data.total_customers > 0 
    ? (data.high_value_customers / data.total_customers) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_customers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active customer base
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CLV</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(data.avg_clv)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per customer lifetime value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High-Value Customers</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.high_value_customers.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {highValuePercentage.toFixed(1)}%
              </Badge>
              <p className="text-xs text-muted-foreground">
                CLV &gt; 1,000 MAD
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.churn_risk_customers.toLocaleString()}
            </div>
            <div className="space-y-2 mt-2">
              <Progress value={churnRiskPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {churnRiskPercentage.toFixed(1)}% at risk
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">6M Forecast</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(data.predicted_revenue_6m)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Predicted 6-month revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">12M Forecast</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(data.predicted_revenue_12m)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Predicted 12-month revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segmentation */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Segmentation Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {data.high_value_customers.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">High Value</p>
              <p className="text-xs text-muted-foreground mt-1">CLV &gt; 1,000 MAD</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(data.total_customers - data.high_value_customers - data.churn_risk_customers).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Regular</p>
              <p className="text-xs text-muted-foreground mt-1">Stable customers</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {data.churn_risk_customers.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">At Risk</p>
              <p className="text-xs text-muted-foreground mt-1">Churn risk &gt; 70%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}