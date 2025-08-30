import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FunnelData {
  name: string;
  count: number;
  rate: number;
  color: string;
}

interface FunnelChartProps {
  data: {
    nouvelle: number;
    confirmee: number;
    en_preparation: number;
    expediee: number;
    livree: number;
    annulee: number;
    retournee: number;
  };
}

export function FunnelChart({ data }: FunnelChartProps) {
  const total = data.nouvelle + data.confirmee + data.en_preparation + data.expediee + data.livree + data.annulee + data.retournee;
  
  const funnelData: FunnelData[] = [
    {
      name: 'Nouvelle',
      count: data.nouvelle,
      rate: total > 0 ? (data.nouvelle / total) * 100 : 0,
      color: 'hsl(var(--status-nouvelle-bg))'
    },
    {
      name: 'Confirmée', 
      count: data.confirmee,
      rate: total > 0 ? (data.confirmee / total) * 100 : 0,
      color: 'hsl(var(--status-confirmee-bg))'
    },
    {
      name: 'En préparation',
      count: data.en_preparation,
      rate: total > 0 ? (data.en_preparation / total) * 100 : 0,
      color: 'hsl(var(--status-en-preparation-bg))'
    },
    {
      name: 'Expédiée',
      count: data.expediee,
      rate: total > 0 ? (data.expediee / total) * 100 : 0,
      color: 'hsl(var(--status-expediee-bg))'
    },
    {
      name: 'Livrée',
      count: data.livree,
      rate: total > 0 ? (data.livree / total) * 100 : 0,
      color: 'hsl(var(--status-livree-bg))'
    },
    {
      name: 'Annulée',
      count: data.annulee,
      rate: total > 0 ? (data.annulee / total) * 100 : 0,
      color: 'hsl(var(--status-annulee-bg))'
    },
    {
      name: 'Retournée',
      count: data.retournee,
      rate: total > 0 ? (data.retournee / total) * 100 : 0,
      color: 'hsl(var(--status-retournee-bg))'
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg shadow-md p-3">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {data.count} commandes ({data.rate.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entonnoir des commandes</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis className="text-xs" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 text-xs">
          {funnelData.map((item) => (
            <div key={item.name} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">
                {item.name}: {item.rate.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}