import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  nom: string;
  prix: number;
}

interface ProductRelationship {
  id: string;
  product_id: string;
  related_product_id: string;
  relationship_type: 'upsell' | 'cross_sell';
  display_order: number;
  products?: Product;
  related_product?: Product;
}

interface ProductRelationshipsProps {
  productId: string;
}

export function ProductRelationships({ productId }: ProductRelationshipsProps) {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [relationshipType, setRelationshipType] = useState<'upsell' | 'cross_sell'>('upsell');
  const queryClient = useQueryClient();

  // Fetch all products for selection
  const { data: products = [] } = useQuery({
    queryKey: ['products-for-relationships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, nom, prix')
        .neq('id', productId)
        .order('nom');
      
      if (error) throw error;
      return data as Product[];
    }
  });

  // Fetch existing relationships
  const { data: relationships = [] } = useQuery({
    queryKey: ['product-relationships', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_relationships')
        .select(`
          id,
          product_id,
          related_product_id,
          relationship_type,
          display_order,
          products!fk_product_relationships_related_product_id(id, nom, prix)
        `)
        .eq('product_id', productId)
        .order('relationship_type')
        .order('display_order');
      
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        related_product: item.products
      })) as ProductRelationship[];
    }
  });

  // Add relationship mutation
  const addRelationshipMutation = useMutation({
    mutationFn: async ({ relatedProductId, type }: { relatedProductId: string; type: 'upsell' | 'cross_sell' }) => {
      const { error } = await supabase
        .from('product_relationships')
        .insert({
          product_id: productId,
          related_product_id: relatedProductId,
          relationship_type: type,
          display_order: relationships.filter(r => r.relationship_type === type).length
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-relationships', productId] });
      setSelectedProductId("");
      toast.success("Relation ajoutée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de la relation");
    }
  });

  // Remove relationship mutation
  const removeRelationshipMutation = useMutation({
    mutationFn: async (relationshipId: string) => {
      const { error } = await supabase
        .from('product_relationships')
        .delete()
        .eq('id', relationshipId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-relationships', productId] });
      toast.success("Relation supprimée");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    }
  });

  const handleAddRelationship = () => {
    if (!selectedProductId) return;
    addRelationshipMutation.mutate({
      relatedProductId: selectedProductId,
      type: relationshipType
    });
  };

  const upsells = relationships.filter(r => r.relationship_type === 'upsell');
  const crossSells = relationships.filter(r => r.relationship_type === 'cross_sell');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une relation produit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={relationshipType} onValueChange={(value: 'upsell' | 'cross_sell') => setRelationshipType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upsell">Upsell (Montée en gamme)</SelectItem>
                <SelectItem value="cross_sell">Cross-sell (Complémentaire)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choisir un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.nom} - {product.prix} MAD
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleAddRelationship}
              disabled={!selectedProductId || addRelationshipMutation.isPending}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Upsells (Montée en gamme)
              <Badge variant="secondary">{upsells.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upsells.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun upsell configuré</p>
            ) : (
              <div className="space-y-2">
                {upsells.map((relationship) => (
                  <div key={relationship.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{relationship.related_product?.nom}</p>
                      <p className="text-sm text-muted-foreground">{relationship.related_product?.prix} MAD</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRelationshipMutation.mutate(relationship.id)}
                      disabled={removeRelationshipMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Cross-sells (Complémentaires)
              <Badge variant="secondary">{crossSells.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {crossSells.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun cross-sell configuré</p>
            ) : (
              <div className="space-y-2">
                {crossSells.map((relationship) => (
                  <div key={relationship.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{relationship.related_product?.nom}</p>
                      <p className="text-sm text-muted-foreground">{relationship.related_product?.prix} MAD</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRelationshipMutation.mutate(relationship.id)}
                      disabled={removeRelationshipMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}