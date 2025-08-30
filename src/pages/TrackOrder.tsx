import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice, formatDate } from '@/lib/format';

export default function TrackOrder() {
  const [trackingCode, setTrackingCode] = useState('');
  const [searchCode, setSearchCode] = useState('');

  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['order', searchCode],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_order_by_tracking', {
        p_code: searchCode
      });
      
      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!searchCode,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      setSearchCode(trackingCode.trim().toUpperCase());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOUVELLE':
        return 'default';
      case 'CONFIRMÉE':
        return 'secondary';
      case 'EN_PRÉPARATION':
        return 'secondary';
      case 'EXPÉDIÉE':
        return 'default';
      case 'LIVRÉE':
        return 'default';
      case 'ANNULÉE':
        return 'destructive';
      case 'RETOURNÉE':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'NOUVELLE':
        return 'Nouvelle';
      case 'CONFIRMÉE':
        return 'Confirmée';
      case 'EN_PRÉPARATION':
        return 'En préparation';
      case 'EXPÉDIÉE':
        return 'Expédiée';
      case 'LIVRÉE':
        return 'Livrée';
      case 'ANNULÉE':
        return 'Annulée';
      case 'RETOURNÉE':
        return 'Retournée';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Package className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-3xl font-bold mb-2">Suivi de commande</h1>
          <p className="text-muted-foreground">
            Entrez votre code de suivi pour voir l'état de votre commande
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                placeholder="Entrez votre code de suivi (ex: TRK-XXXXXXXX)"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button type="submit" disabled={!trackingCode.trim() || isLoading}>
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? 'Recherche...' : 'Rechercher'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Résultats */}
        {searchCode && (
          <>
            {error ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-destructive mb-2">Erreur de recherche</p>
                  <p className="text-muted-foreground text-sm">
                    Une erreur s'est produite lors de la recherche. Veuillez réessayer.
                  </p>
                </CardContent>
              </Card>
            ) : orderData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Commande {orderData.code_suivi}</span>
                    <Badge variant={getStatusColor(orderData.statut)}>
                      {getStatusLabel(orderData.statut)}
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Commandé le {formatDate(orderData.created_at)}
                  </p>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-3">Articles commandés</h4>
                  <div className="space-y-2">
                    {Array.isArray(orderData.items) && orderData.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{item.product_nom}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantité: {item.quantite}
                          </p>
                        </div>
                        <span className="font-semibold">
                          {formatPrice(Number(item.product_prix) * Number(item.quantite))}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {Array.isArray(orderData.items) && orderData.items.length > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-primary">
                          {formatPrice(
                            Array.isArray(orderData.items) ? (orderData.items as any[]).reduce(
                              (sum: number, item: any) => sum + (Number(item.product_prix || 0) * Number(item.quantite || 0)),
                              0
                            ) : 0
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Aucune commande trouvée pour ce code.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vérifiez que le code de suivi est correct.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}