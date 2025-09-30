import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/format';
import { ProfitMarginMetrics } from '@/integrations/supabase/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, DollarSign, Percent, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const costSchema = z.object({
  cost_price: z.number().min(0, 'Cost must be positive'),
  weight_kg: z.number().min(0, 'Weight must be positive').optional()
});

type CostForm = z.infer<typeof costSchema>;

interface ProfitMarginAnalyticsProps {
  data: ProfitMarginMetrics[];
  isLoading?: boolean;
}

export function ProfitMarginAnalytics({ data, isLoading }: ProfitMarginAnalyticsProps) {
  const [sortBy, setSortBy] = useState<'profit' | 'margin' | 'revenue'>('profit');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<{ id: string; name: string; cost: number; weight: number } | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<CostForm>({
    resolver: zodResolver(costSchema),
    defaultValues: {
      cost_price: 0,
      weight_kg: 0
    }
  });

  const updateCostMutation = useMutation({
    mutationFn: async ({ productId, cost_price, weight_kg }: { productId: string; cost_price: number; weight_kg?: number }) => {
      const { error } = await supabase
        .from('products')
        .update({ 
          cost_price,
          weight_kg: weight_kg || 0
        })
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Product cost updated successfully');
      queryClient.invalidateQueries({ queryKey: ['analytics-profit'] });
      setEditingProduct(null);
      form.reset();
    },
    onError: (error) => {
      toast.error('Failed to update product cost');
      console.error('Error updating product cost:', error);
    }
  });

  const handleEditClick = (productId: string, productName: string, currentCost: number, currentWeight: number) => {
    setEditingProduct({ id: productId, name: productName, cost: currentCost, weight: currentWeight });
    form.reset({
      cost_price: currentCost,
      weight_kg: currentWeight
    });
  };

  const handleSubmit = form.handleSubmit((values) => {
    if (!editingProduct) return;
    updateCostMutation.mutate({
      productId: editingProduct.id,
      cost_price: values.cost_price,
      weight_kg: values.weight_kg
    });
  });

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
          No profit margin data available
        </CardContent>
      </Card>
    );
  }

  // Calculate summary metrics
  const totalRevenue = data.reduce((sum, item) => sum + Number(item.gross_revenue), 0);
  const totalProfit = data.reduce((sum, item) => sum + Number(item.gross_profit), 0);
  const totalCOGS = data.reduce((sum, item) => sum + Number(item.cost_of_goods), 0);
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Get unique categories
  const categories = [...new Set(data.map(item => item.category).filter(Boolean))];

  // Filter and sort data
  let filteredData = data;
  if (categoryFilter !== 'all') {
    filteredData = data.filter(item => item.category === categoryFilter);
  }

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'profit':
        return Number(b.gross_profit) - Number(a.gross_profit);
      case 'margin':
        return Number(b.profit_margin_pct) - Number(a.profit_margin_pct);
      case 'revenue':
        return Number(b.gross_revenue) - Number(a.gross_revenue);
      default:
        return 0;
    }
  });

  // Top performers chart data
  const chartData = sortedData.slice(0, 10).map(item => ({
    name: item.product_name.length > 20 ? 
      item.product_name.substring(0, 20) + '...' : 
      item.product_name,
    profit: Number(item.gross_profit),
    margin: Number(item.profit_margin_pct),
    revenue: Number(item.gross_revenue)
  }));

  // Category breakdown for pie chart
  const categoryData = categories.map(category => {
    const categoryItems = data.filter(item => item.category === category);
    const categoryProfit = categoryItems.reduce((sum, item) => sum + Number(item.gross_profit), 0);
    return {
      name: category || 'Uncategorized',
      value: categoryProfit
    };
  }).filter(item => item.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const getMarginColor = (margin: number) => {
    if (margin >= 50) return 'text-green-600';
    if (margin >= 30) return 'text-blue-600';
    if (margin >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMarginBadge = (margin: number) => {
    if (margin >= 50) return { variant: 'default' as const, label: 'Excellent' };
    if (margin >= 30) return { variant: 'secondary' as const, label: 'Good' };
    if (margin >= 15) return { variant: 'outline' as const, label: 'Fair' };
    return { variant: 'destructive' as const, label: 'Poor' };
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Gross sales revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalProfit)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              After cost of goods
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost of Goods</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalCOGS)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total product costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMarginColor(overallMargin)}`}>
              {overallMargin.toFixed(1)}%
            </div>
            <Badge {...getMarginBadge(overallMargin)} className="mt-1">
              {getMarginBadge(overallMargin).label}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="profit">Sort by Profit</SelectItem>
            <SelectItem value="margin">Sort by Margin %</SelectItem>
            <SelectItem value="revenue">Sort by Revenue</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category || 'Uncategorized'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Products by {sortBy === 'profit' ? 'Profit' : sortBy === 'margin' ? 'Margin' : 'Revenue'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'margin' ? `${Number(value).toFixed(1)}%` : formatPrice(Number(value)),
                    name === 'profit' ? 'Profit' : name === 'margin' ? 'Margin' : 'Revenue'
                  ]}
                />
                <Bar 
                  dataKey={sortBy === 'margin' ? 'margin' : sortBy} 
                  fill="#8884d8" 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatPrice(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Product Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-right p-3 font-medium">Units Sold</th>
                  <th className="text-right p-3 font-medium">Revenue</th>
                  <th className="text-right p-3 font-medium">Cost</th>
                  <th className="text-right p-3 font-medium">Profit</th>
                  <th className="text-right p-3 font-medium">Margin</th>
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.slice(0, 20).map((item, index) => {
                  const badge = getMarginBadge(Number(item.profit_margin_pct));
                  return (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{item.product_name}</td>
                      <td className="p-3">
                        <Badge variant="outline">{item.category || 'N/A'}</Badge>
                      </td>
                      <td className="p-3 text-right">{item.units_sold.toLocaleString()}</td>
                      <td className="p-3 text-right">{formatPrice(Number(item.gross_revenue))}</td>
                      <td className="p-3 text-right">{formatPrice(Number(item.cost_of_goods))}</td>
                      <td className="p-3 text-right font-medium">{formatPrice(Number(item.gross_profit))}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-medium ${getMarginColor(Number(item.profit_margin_pct))}`}>
                            {Number(item.profit_margin_pct).toFixed(1)}%
                          </span>
                          <Badge variant={badge.variant} className="text-xs">
                            {badge.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(
                            item.product_id,
                            item.product_name,
                            Number(item.cost_of_goods) / Math.max(item.units_sold, 1),
                            0
                          )}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Cost Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product Cost</DialogTitle>
            <DialogDescription>
              Update the cost price and weight for {editingProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price (MAD)</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                {...form.register('cost_price', { valueAsNumber: true })}
              />
              {form.formState.errors.cost_price && (
                <p className="text-sm text-destructive">{form.formState.errors.cost_price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight_kg">Weight (kg)</Label>
              <Input
                id="weight_kg"
                type="number"
                step="0.01"
                {...form.register('weight_kg', { valueAsNumber: true })}
              />
              {form.formState.errors.weight_kg && (
                <p className="text-sm text-destructive">{form.formState.errors.weight_kg.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateCostMutation.isPending}>
                {updateCostMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}