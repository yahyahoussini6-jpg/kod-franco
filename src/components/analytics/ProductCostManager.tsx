import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/format';
import { Edit, Package, DollarSign, Percent } from 'lucide-react';

const costSchema = z.object({
  cost_price: z.number().min(0, 'Cost must be positive'),
  weight_kg: z.number().min(0, 'Weight must be positive').optional(),
});

type CostForm = z.infer<typeof costSchema>;

interface Product {
  id: string;
  nom: string;
  prix: number;
  cost_price: number;
  weight_kg: number;
  categories?: { name: string };
}

export function ProductCostManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const form = useForm<CostForm>({
    resolver: zodResolver(costSchema),
    defaultValues: {
      cost_price: 0,
      weight_kg: 0,
    },
  });

  // Fetch products with cost data
  const { data: products, isLoading } = useQuery({
    queryKey: ['products-with-costs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          nom,
          prix,
          cost_price,
          weight_kg,
          categories (
            name
          )
        `)
        .order('nom');
      
      if (error) throw error;
      return data as Product[];
    },
  });

  // Update product cost mutation
  const updateCostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CostForm }) => {
      const { error } = await supabase
        .from('products')
        .update({
          cost_price: data.cost_price,
          weight_kg: data.weight_kg || 0,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-with-costs'] });
      toast({
        title: 'Cost updated',
        description: 'Product cost has been updated successfully',
      });
      setShowDialog(false);
      setEditingProduct(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: (error as any)?.message || 'Failed to update product cost',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      cost_price: product.cost_price || 0,
      weight_kg: product.weight_kg || 0,
    });
    setShowDialog(true);
  };

  const handleSubmit = (data: CostForm) => {
    if (editingProduct) {
      updateCostMutation.mutate({ id: editingProduct.id, data });
    }
  };

  const calculateMargin = (price: number, cost: number) => {
    if (price <= 0) return 0;
    return ((price - cost) / price) * 100;
  };

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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary statistics
  const totalProducts = products?.length || 0;
  const productsWithCosts = products?.filter(p => p.cost_price > 0).length || 0;
  const avgMargin = products?.length ? 
    products.reduce((sum, p) => sum + calculateMargin(p.prix, p.cost_price || 0), 0) / products.length : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Products in catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Cost Data</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsWithCosts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalProducts > 0 ? ((productsWithCosts / totalProducts) * 100).toFixed(1) : 0}% of products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMarginColor(avgMargin)}`}>
              {avgMargin.toFixed(1)}%
            </div>
            <Badge {...getMarginBadge(avgMargin)} className="mt-1">
              {getMarginBadge(avgMargin).label}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Cost Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-right p-3 font-medium">Selling Price</th>
                  <th className="text-right p-3 font-medium">Cost Price</th>
                  <th className="text-right p-3 font-medium">Margin</th>
                  <th className="text-right p-3 font-medium">Profit</th>
                  <th className="text-right p-3 font-medium">Weight (kg)</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((product) => {
                  const margin = calculateMargin(product.prix, product.cost_price || 0);
                  const profit = product.prix - (product.cost_price || 0);
                  const badge = getMarginBadge(margin);
                  
                  return (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{product.nom}</td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {product.categories?.name || 'N/A'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">{formatPrice(product.prix)}</td>
                      <td className="p-3 text-right">
                        {product.cost_price > 0 ? formatPrice(product.cost_price) : 
                          <Badge variant="outline">Not set</Badge>
                        }
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-medium ${getMarginColor(margin)}`}>
                            {margin.toFixed(1)}%
                          </span>
                          <Badge variant={badge.variant} className="text-xs">
                            {badge.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatPrice(profit)}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {product.weight_kg > 0 ? `${product.weight_kg} kg` : 
                          <Badge variant="outline">Not set</Badge>
                        }
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-3 w-3" />
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

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Cost - {editingProduct?.nom}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price (MAD) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="0.00" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.001"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="0.000" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {editingProduct && (
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Selling Price:</span>
                    <span className="font-medium">{formatPrice(editingProduct.prix)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cost Price:</span>
                    <span className="font-medium">{formatPrice(form.watch('cost_price'))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Profit:</span>
                    <span className="font-medium">
                      {formatPrice(editingProduct.prix - form.watch('cost_price'))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Margin:</span>
                    <span className={`font-medium ${getMarginColor(calculateMargin(editingProduct.prix, form.watch('cost_price')))}`}>
                      {calculateMargin(editingProduct.prix, form.watch('cost_price')).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateCostMutation.isPending}
                >
                  {updateCostMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}