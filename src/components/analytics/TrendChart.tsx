import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMAD, formatNumber } from '@/lib/metrics';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TrendChartProps {
  data: Array<{
    d: string;
    delivered_orders: number;
    delivered_revenue: number;
    delivered_aov: number;
  }>;
  title: string;
  className?: string;
}

export function TrendChart({ data, title, className }: TrendChartProps) {
  const chartData = data.map(item => ({
    ...item,
    date: format(new Date(item.d), 'dd/MM', { locale: fr }),
    revenue: Number(item.delivered_revenue),
    orders: Number(item.delivered_orders),
    aov: Number(item.delivered_aov)
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-md p-3">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.dataKey === 'revenue' 
                ? formatMAD(entry.value) 
                : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="left"
              className="text-xs" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatMAD(value)}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              className="text-xs" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatNumber(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Chiffre d'affaires"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="orders" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              name="Commandes livrées"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}