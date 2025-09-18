import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Package, 
  Crown,
  Save,
  Search
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BundleItem {
  id: string;
  product_id: string;
  is_primary: boolean;
  original_price: number;
  bundle_price: number;
  discount_percentage: number;
  min_quantity: number;
  max_quantity?: number;
  display_order: number;
  products: {
    id: string;
    nom: string;
    prix: number;
    media: string[];
  };
}

interface NewBundleItem {
  product_id: string;
  is_primary: boolean;
  original_price: number;
  bundle_price: number;
  discount_percentage: number;
  min_quantity: number;
  max_quantity?: number;
  display_order: number;
}

interface BundleItemsManagerProps {
  bundleId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BundleItemsManager({ bundleId, onSuccess, onCancel }: BundleItemsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState<Partial<NewBundleItem>>({
    is_primary: false,
    min_quantity: 1,
    display_order: 0
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bundle items
  const { data: bundleItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['bundle-items', bundleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bundle_items')
        .select(`
          *,
          products (
            id,
            nom,
            prix,
            media
          )
        `)
        .eq('bundle_id', bundleId)
        .order('display_order');
      
      if (error) throw error;
      return data as BundleItem[];
    }
  });

  // Fetch available products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products-for-bundle', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('id, nom, prix, media')
        .eq('en_stock', true);
      
      if (searchTerm) {
        query = query.ilike('nom', `%${searchTerm}%`);
      }
      
      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    }
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: NewBundleItem) => {
      const { error } = await supabase
        .from('bundle_items')
        .insert([{ ...item, bundle_id: bundleId }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté au bundle avec succès."
      });
      setNewItem({
        is_primary: false,
        min_quantity: 1,
        display_order: 0
      });
      queryClient.invalidateQueries({ queryKey: ['bundle-items', bundleId] });
    },
    onError: (error) => {
      console.error('Error adding bundle item:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit au bundle.",
        variant: "destructive"
      });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BundleItem> }) => {
      const { error } = await supabase
        .from('bundle_items')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Produit mis à jour",
        description: "Les modifications ont été enregistrées."
      });
      queryClient.invalidateQueries({ queryKey: ['bundle-items', bundleId] });
    },
    onError: (error) => {
      console.error('Error updating bundle item:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit.",
        variant: "destructive"
      });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bundle_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Produit retiré",
        description: "Le produit a été retiré du bundle."
      });
      queryClient.invalidateQueries({ queryKey: ['bundle-items', bundleId] });
    },
    onError: (error) => {
      console.error('Error deleting bundle item:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer le produit du bundle.",
        variant: "destructive"
      });
    }
  });

  const handleAddItem = () => {
    if (!newItem.product_id || !newItem.original_price || !newItem.bundle_price) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    // Calculate discount percentage
    const discountPercentage = ((newItem.original_price! - newItem.bundle_price!) / newItem.original_price!) * 100;

    addItemMutation.mutate({
      ...newItem as NewBundleItem,
      discount_percentage: discountPercentage
    });
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    const item = bundleItems?.find(i => i.id === id);
    if (!item) return;

    let updates: any = { [field]: value };

    // Recalculate discount percentage if prices change
    if (field === 'original_price' || field === 'bundle_price') {
      const originalPrice = field === 'original_price' ? value : item.original_price;
      const bundlePrice = field === 'bundle_price' ? value : item.bundle_price;
      
      if (originalPrice > 0) {
        updates.discount_percentage = ((originalPrice - bundlePrice) / originalPrice) * 100;
      }
    }

    updateItemMutation.mutate({ id, updates });
  };

  const getSelectedProductIds = () => {
    return bundleItems?.map(item => item.product_id) || [];
  };

  const availableProducts = products?.filter(p => !getSelectedProductIds().includes(p.id)) || [];

  if (itemsLoading || productsLoading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add New Item Section */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Rechercher un produit</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nom du produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Sélectionner le produit *</Label>
            <Select
              value={newItem.product_id || ''}
              onValueChange={(value) => {
                const product = availableProducts.find(p => p.id === value);
                setNewItem({
                  ...newItem,
                  product_id: value,
                  original_price: product?.prix || 0
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un produit" />
              </SelectTrigger>
              <SelectContent>
                {availableProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center space-x-2">
                      {product.media?.[0] && (
                        <img 
                          src={product.media[0]} 
                          alt={product.nom}
                          className="w-6 h-6 object-cover rounded"
                        />
                      )}
                      <span>{product.nom} - {product.prix} MAD</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Prix original *</Label>
            <Input
              type="number"
              step="0.01"
              value={newItem.original_price || ''}
              onChange={(e) => setNewItem({
                ...newItem,
                original_price: parseFloat(e.target.value) || 0
              })}
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Prix bundle *</Label>
            <Input
              type="number"
              step="0.01"
              value={newItem.bundle_price || ''}
              onChange={(e) => setNewItem({
                ...newItem,
                bundle_price: parseFloat(e.target.value) || 0
              })}
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Quantité min</Label>
            <Input
              type="number"
              value={newItem.min_quantity || 1}
              onChange={(e) => setNewItem({
                ...newItem,
                min_quantity: parseInt(e.target.value) || 1
              })}
              min="1"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Ordre</Label>
            <Input
              type="number"
              value={newItem.display_order || 0}
              onChange={(e) => setNewItem({
                ...newItem,
                display_order: parseInt(e.target.value) || 0
              })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              checked={newItem.is_primary || false}
              onCheckedChange={(checked) => setNewItem({
                ...newItem,
                is_primary: checked
              })}
            />
            <Label>Produit principal</Label>
          </div>
          
          <Button onClick={handleAddItem} disabled={addItemMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Current Bundle Items */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center">
          <Package className="w-4 h-4 mr-2" />
          Produits du bundle ({bundleItems?.length || 0})
        </h3>

        {bundleItems?.map((item) => (
          <div key={item.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {item.products.media?.[0] && (
                  <img 
                    src={item.products.media[0]} 
                    alt={item.products.nom}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <h4 className="font-medium">{item.products.nom}</h4>
                  <div className="flex items-center space-x-2">
                    {item.is_primary && (
                      <Badge variant="default">
                        <Crown className="w-3 h-3 mr-1" />
                        Principal
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {item.discount_percentage.toFixed(1)}% de réduction
                    </Badge>
                  </div>
                </div>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Retirer le produit</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir retirer ce produit du bundle ?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteItemMutation.mutate(item.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Retirer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Prix original</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.original_price}
                  onChange={(e) => handleUpdateItem(item.id, 'original_price', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Prix bundle</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.bundle_price}
                  onChange={(e) => handleUpdateItem(item.id, 'bundle_price', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Quantité min</Label>
                <Input
                  type="number"
                  value={item.min_quantity}
                  onChange={(e) => handleUpdateItem(item.id, 'min_quantity', parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Ordre</Label>
                <Input
                  type="number"
                  value={item.display_order}
                  onChange={(e) => handleUpdateItem(item.id, 'display_order', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Principal</Label>
                <div className="pt-2">
                  <Switch
                    checked={item.is_primary}
                    onCheckedChange={(checked) => handleUpdateItem(item.id, 'is_primary', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {bundleItems?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucun produit dans ce bundle. Ajoutez des produits pour commencer.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Fermer
        </Button>
        <Button onClick={onSuccess}>
          <Save className="w-4 h-4 mr-2" />
          Terminé
        </Button>
      </div>
    </div>
  );
}