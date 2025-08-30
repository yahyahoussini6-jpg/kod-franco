import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration, formatDays } from '@/lib/metrics';

interface SLAChartProps {
  data: {
    t_confirm_p50: number;
    t_confirm_p90: number;
    t_pack_p50: number;
    t_pack_p90: number;
    t_ship_p50: number;
    t_ship_p90: number;
    t_transit_p50: number;
    t_transit_p90: number;
    t_o2d_p50: number;
    t_o2d_p90: number;
  };
}

export function SLAChart({ data }: SLAChartProps) {
  const chartData = [
    {
      name: 'Confirmation',
      p50: Number(data.t_confirm_p50) || 0,
      p90: Number(data.t_confirm_p90) || 0,
      unit: 'hours'
    },
    {
      name: 'Préparation',
      p50: Number(data.t_pack_p50) || 0,
      p90: Number(data.t_pack_p90) || 0,
      unit: 'hours'
    },
    {
      name: 'Expédition',
      p50: Number(data.t_ship_p50) || 0,
      p90: Number(data.t_ship_p90) || 0,
      unit: 'hours'
    },
    {
      name: 'Transit',
      p50: Number(data.t_transit_p50) || 0,
      p90: Number(data.t_transit_p90) || 0,
      unit: 'days'
    },
    {
      name: 'Commande→Livraison',
      p50: Number(data.t_o2d_p50) || 0,
      p90: Number(data.t_o2d_p90) || 0,
      unit: 'days'
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      const formatter = entry.unit === 'days' ? formatDays : formatDuration;
      
      return (
        <div className="bg-card border border-border rounded-lg shadow-md p-3">
          <p className="font-medium mb-2">{label}</p>
          <p className="text-sm text-muted-foreground">
            P50: {formatter(entry.p50)}
          </p>
          <p className="text-sm text-muted-foreground">
            P90: {formatter(entry.p90)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SLA - Temps de traitement</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              className="text-xs" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}${chartData[0]?.unit === 'days' ? 'j' : 'h'}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="p50" 
              fill="hsl(var(--primary))"
              name="P50"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="p90" 
              fill="hsl(var(--accent))"
              name="P90"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}