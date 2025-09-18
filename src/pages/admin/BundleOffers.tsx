import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/format';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  ToggleLeft, 
  ToggleRight,
  Calendar,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { BundleOfferForm } from '@/components/admin/BundleOfferForm';
import { BundleItemsManager } from '@/components/admin/BundleItemsManager';

interface BundleOffer {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  bundle_items?: any[];
}

export default function BundleOffersManagement() {
  const [selectedBundle, setSelectedBundle] = useState<BundleOffer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isItemsManagerOpen, setIsItemsManagerOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bundles, isLoading } = useQuery({
    queryKey: ['admin-bundle-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bundle_offers')
        .select(`
          *,
          bundle_items (
            id,
            product_id,
            is_primary,
            original_price,
            bundle_price,
            discount_percentage,
            min_quantity,
            max_quantity,
            display_order,
            products (
              id,
              nom,
              prix,
              media
            )
          )
        `)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('bundle_offers')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Statut mis à jour",
        description: "Le statut de l'offre bundle a été modifié avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['admin-bundle-offers'] });
    },
    onError: (error) => {
      console.error('Error toggling bundle status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'offre bundle.",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bundle_offers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Offre supprimée",
        description: "L'offre bundle a été supprimée avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['admin-bundle-offers'] });
    },
    onError: (error) => {
      console.error('Error deleting bundle:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'offre bundle.",
        variant: "destructive"
      });
    }
  });

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedBundle(null);
    queryClient.invalidateQueries({ queryKey: ['admin-bundle-offers'] });
  };

  const handleItemsManagerSuccess = () => {
    setIsItemsManagerOpen(false);
    setSelectedBundle(null);
    queryClient.invalidateQueries({ queryKey: ['admin-bundle-offers'] });
  };

  const getBundleStatus = (bundle: BundleOffer) => {
    if (!bundle.is_active) return { label: 'Inactif', color: 'secondary' };
    
    const now = new Date();
    const startDate = bundle.start_date ? new Date(bundle.start_date) : null;
    const endDate = bundle.end_date ? new Date(bundle.end_date) : null;
    
    if (startDate && startDate > now) return { label: 'Programmé', color: 'outline' };
    if (endDate && endDate < now) return { label: 'Expiré', color: 'destructive' };
    
    return { label: 'Actif', color: 'default' };
  };

  const calculateTotalSavings = (bundle: BundleOffer) => {
    if (!bundle.bundle_items) return 0;
    
    return bundle.bundle_items.reduce((total, item) => {
      const savings = (item.original_price - item.bundle_price) * item.min_quantity;
      return total + savings;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Gestion des Offres Bundle</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Offres Bundle</h1>
          <p className="text-muted-foreground">
            Créez et gérez les offres promotionnelles groupées
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedBundle(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Offre Bundle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedBundle ? 'Modifier l\'offre bundle' : 'Créer une nouvelle offre bundle'}
              </DialogTitle>
            </DialogHeader>
            <BundleOfferForm
              bundle={selectedBundle}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Bundle Items Manager Dialog */}
      <Dialog open={isItemsManagerOpen} onOpenChange={setIsItemsManagerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Gérer les produits - {selectedBundle?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedBundle && (
            <BundleItemsManager
              bundleId={selectedBundle.id}
              onSuccess={handleItemsManagerSuccess}
              onCancel={() => setIsItemsManagerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Offres</p>
                <p className="text-2xl font-bold">{bundles?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actives</p>
                <p className="text-2xl font-bold text-green-600">
                  {bundles?.filter(b => b.is_active).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <EyeOff className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactives</p>
                <p className="text-2xl font-bold text-gray-600">
                  {bundles?.filter(b => !b.is_active).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Économies Totales</p>
                <p className="text-2xl font-bold text-blue-600">
                  {bundles?.reduce((total, bundle) => total + calculateTotalSavings(bundle), 0).toFixed(2)} MAD
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bundle Offers List */}
      <div className="space-y-4">
        {bundles?.map((bundle) => {
          const status = getBundleStatus(bundle);
          const totalSavings = calculateTotalSavings(bundle);
          
          return (
            <Card key={bundle.id}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-lg">{bundle.name}</CardTitle>
                      <Badge variant={status.color as any}>
                        {status.label}
                      </Badge>
                      {totalSavings > 0 && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {totalSavings.toFixed(2)} MAD d'économies
                        </Badge>
                      )}
                    </div>
                    
                    {bundle.description && (
                      <p className="text-sm text-muted-foreground">{bundle.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {bundle.start_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Début: {formatDate(bundle.start_date)}</span>
                        </div>
                      )}
                      {bundle.end_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Fin: {formatDate(bundle.end_date)}</span>
                        </div>
                      )}
                      <span>Produits: {bundle.bundle_items?.length || 0}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Toggle Active Status */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActiveMutation.mutate({ 
                        id: bundle.id, 
                        is_active: !bundle.is_active 
                      })}
                      disabled={toggleActiveMutation.isPending}
                    >
                      {bundle.is_active ? (
                        <>
                          <ToggleRight className="w-4 h-4 mr-1" />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 mr-1" />
                          Activer
                        </>
                      )}
                    </Button>

                    {/* Manage Items Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedBundle(bundle);
                        setIsItemsManagerOpen(true);
                      }}
                    >
                      <Package className="w-4 h-4 mr-1" />
                      Produits
                    </Button>

                    {/* Edit Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedBundle(bundle);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>

                    {/* Delete Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'offre bundle</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette offre bundle ? 
                            Cette action supprimera également tous les produits associés et ne peut pas être annulée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(bundle.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              {bundle.bundle_items && bundle.bundle_items.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Produits inclus:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {bundle.bundle_items.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                        >
                          {item.products?.media?.[0] && (
                            <img 
                              src={item.products.media[0]} 
                              alt={item.products.nom}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {item.products?.nom || 'Produit supprimé'}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span className="line-through">{item.original_price} MAD</span>
                              <span className="font-medium text-primary">{item.bundle_price} MAD</span>
                              {item.is_primary && (
                                <Badge variant="outline" className="text-xs">Principal</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {bundles?.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucune offre bundle trouvée. Créez votre première offre pour commencer.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}