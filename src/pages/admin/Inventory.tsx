import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  BarChart3,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

const stockSchema = z.object({
  stock_on_hand: z.number().min(0, 'Le stock doit être positif'),
  min_stock_level: z.number().min(0, 'Le seuil minimum doit être positif'),
  reserved: z.number().min(0, 'Le stock réservé doit être positif'),
});

type StockForm = z.infer<typeof stockSchema>;

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStock, setEditingStock] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<StockForm>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      stock_on_hand: 0,
      min_stock_level: 0,
      reserved: 0,
    },
  });

  // Fetch product variants and inventory
  const { data: inventory, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select(`
          *,
          products!inner(nom, description),
          inventory(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch stock movements
  const { data: movements } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          product_variants!inner(name, sku, products!inner(nom))
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!inventory) return { totalSKUs: 0, totalStock: 0, lowStock: 0, stockValue: 0 };
    
    let totalStock = 0;
    let lowStock = 0;
    let stockValue = 0;
    
    inventory.forEach(variant => {
      const stock = variant.inventory?.[0];
      if (stock) {
        totalStock += stock.stock_on_hand;
        stockValue += stock.stock_on_hand * variant.cost;
        if (stock.stock_on_hand <= stock.min_stock_level) {
          lowStock++;
        }
      }
    });
    
    return {
      totalSKUs: inventory.length,
      totalStock,
      lowStock,
      stockValue
    };
  }, [inventory]);

  const filteredInventory = React.useMemo(() => {
    if (!inventory) return [];
    return inventory.filter(variant => 
      variant.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.products.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  const getStockStatus = (stock_on_hand: number, min_stock_level: number) => {
    if (stock_on_hand === 0) return { label: 'Rupture', variant: 'secondary' as const };
    if (stock_on_hand <= min_stock_level) return { label: 'Stock Faible', variant: 'destructive' as const };
    return { label: 'En Stock', variant: 'default' as const };
  };

  const formatMovementType = (type: string) => {
    const types = {
      'in': 'Entrée stock',
      'out': 'Sortie stock',
      'adjustment': 'Ajustement',
      'reserved': 'Réservé',
      'unreserved': 'Déréservé'
    };
    return types[type as keyof typeof types] || type;
  };

  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({ stockData, variantId }: { stockData: StockForm; variantId: string }) => {
      // First, check if inventory record exists
      const { data: existingStock } = await supabase
        .from('inventory')
        .select('id')
        .eq('variant_id', variantId)
        .single();

      if (existingStock) {
        // Update existing record
        const { error } = await supabase
          .from('inventory')
          .update({
            stock_on_hand: stockData.stock_on_hand,
            min_stock_level: stockData.min_stock_level,
            reserved: stockData.reserved,
            updated_at: new Date().toISOString()
          })
          .eq('variant_id', variantId);
        
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('inventory')
          .insert({
            variant_id: variantId,
            stock_on_hand: stockData.stock_on_hand,
            min_stock_level: stockData.min_stock_level,
            reserved: stockData.reserved,
          });
        
        if (error) throw error;
      }

      // Record stock movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          variant_id: variantId,
          movement_type: 'adjustment',
          quantity: stockData.stock_on_hand,
          reason: 'Stock adjustment via admin panel'
        });
      
      if (movementError) throw movementError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      toast({
        title: 'Stock mis à jour',
        description: 'Les niveaux de stock ont été modifiés avec succès',
      });
      setShowEditDialog(false);
      setEditingStock(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le stock',
        variant: 'destructive',
      });
    },
  });

  // Delete stock mutation
  const deleteStockMutation = useMutation({
    mutationFn: async (variantId: string) => {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('variant_id', variantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast({
        title: 'Stock supprimé',
        description: 'L\'entrée de stock a été supprimée',
      });
    },
  });

  const handleEditStock = (variant: any) => {
    const stock = variant.inventory?.[0];
    setEditingStock(variant);
    form.reset({
      stock_on_hand: stock?.stock_on_hand || 0,
      min_stock_level: stock?.min_stock_level || 0,
      reserved: stock?.reserved || 0,
    });
    setShowEditDialog(true);
  };

  const handleDeleteStock = (variantId: string, productName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le stock pour "${productName}" ?`)) {
      deleteStockMutation.mutate(variantId);
    }
  };

  const handleSubmitStock = (data: StockForm) => {
    if (!editingStock) return;
    updateStockMutation.mutate({
      stockData: data,
      variantId: editingStock.id
    });
  };

  const handleExport = () => {
    if (!inventory) return;
    
    const csvData = inventory.map(variant => {
      const stock = variant.inventory?.[0];
      return {
        SKU: variant.sku,
        Produit: variant.products.nom,
        Variant: variant.name,
        'Stock en main': stock?.stock_on_hand || 0,
        'Réservé': stock?.reserved || 0,
        'Disponible': (stock?.stock_on_hand || 0) - (stock?.reserved || 0),
        'Seuil minimum': stock?.min_stock_level || 0,
        'Prix achat': variant.cost,
        'Valeur stock': (stock?.stock_on_hand || 0) * variant.cost
      };
    });
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventaire_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Export réussi',
      description: 'L\'inventaire a été exporté en CSV',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Inventaire & Stocks</h1>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventaire & Stocks</h1>
          <p className="text-muted-foreground">
            Gestion des SKU, variants, niveaux de stock et alertes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => window.open('/admin/products', '_blank')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Produit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSKUs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Variantes produits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Unités en stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              Articles sous seuil
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stockValue.toLocaleString()} MAD</div>
            <p className="text-xs text-muted-foreground">
              Prix d'achat total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input 
                placeholder="Rechercher SKU, nom produit..." 
                className="w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
          </div>

          {/* Inventory Table */}
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">SKU</th>
                    <th className="text-left p-4 font-medium">Produit</th>
                    <th className="text-left p-4 font-medium">En Stock</th>
                    <th className="text-left p-4 font-medium">Réservé</th>
                    <th className="text-left p-4 font-medium">Disponible</th>
                    <th className="text-left p-4 font-medium">Seuil Min</th>
                    <th className="text-left p-4 font-medium">Prix Achat</th>
                    <th className="text-left p-4 font-medium">Statut</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        Aucun produit trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((variant) => {
                      const stock = variant.inventory?.[0];
                      const stockOnHand = stock?.stock_on_hand || 0;
                      const reserved = stock?.reserved || 0;
                      const available = stockOnHand - reserved;
                      const minStock = stock?.min_stock_level || 0;
                      const status = getStockStatus(stockOnHand, minStock);

                      return (
                        <tr key={variant.id} className="border-t">
                          <td className="p-4 font-mono text-sm">{variant.sku}</td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{variant.products.nom}</p>
                              <p className="text-sm text-muted-foreground">{variant.name}</p>
                            </div>
                          </td>
                          <td className="p-4">{stockOnHand}</td>
                          <td className="p-4">{reserved}</td>
                          <td className="p-4">{available}</td>
                          <td className="p-4">{minStock}</td>
                          <td className="p-4">{variant.cost} MAD</td>
                          <td className="p-4">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </td>
                           <td className="p-4">
                             <div className="flex gap-2">
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => handleEditStock(variant)}
                               >
                                 <Edit className="h-3 w-3" />
                               </Button>
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => handleDeleteStock(variant.id, variant.products.nom)}
                                 disabled={deleteStockMutation.isPending}
                               >
                                 <Trash2 className="h-3 w-3" />
                               </Button>
                             </div>
                           </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Movements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mouvements Récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movements?.length === 0 ? (
                <p className="text-center text-muted-foreground">Aucun mouvement récent</p>
              ) : (
                movements?.map((movement) => (
                  <div key={movement.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{movement.product_variants.sku}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatMovementType(movement.movement_type)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(movement.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="font-medium">{stats.lowStock} articles en stock faible</p>
                  <p className="text-sm text-muted-foreground">Seuil minimum atteint</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Package className="h-4 w-4 text-red-500" />
                <div>
                  <p className="font-medium">
                    {filteredInventory.filter(v => (v.inventory?.[0]?.stock_on_hand || 0) === 0).length} articles en rupture
                  </p>
                  <p className="text-sm text-muted-foreground">Stock épuisé</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingDown className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium">Stock surveillé automatiquement</p>
                  <p className="text-sm text-muted-foreground">Alertes en temps réel</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Stock Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Modifier le stock - {editingStock?.products.nom}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitStock)} className="space-y-4">
              <FormField
                control={form.control}
                name="stock_on_hand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock en main</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reserved"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock réservé</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_stock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seuil minimum</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={updateStockMutation.isPending}
                >
                  {updateStockMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}