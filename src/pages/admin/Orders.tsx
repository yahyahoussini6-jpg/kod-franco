import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Edit, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, formatDate } from '@/lib/format';

const statusColors = {
  'NOUVELLE': 'bg-blue-100 text-blue-800',
  'CONFIRMÉE': 'bg-green-100 text-green-800', 
  'EN_PRÉPARATION': 'bg-yellow-100 text-yellow-800',
  'EXPÉDIÉE': 'bg-purple-100 text-purple-800',
  'LIVRÉE': 'bg-green-100 text-green-800',
  'ANNULÉE': 'bg-red-100 text-red-800',
  'RETOURNÉE': 'bg-orange-100 text-orange-800',
};

const statusLabels = {
  'NOUVELLE': 'Nouvelle',
  'CONFIRMÉE': 'Confirmée',
  'EN_PRÉPARATION': 'En préparation', 
  'EXPÉDIÉE': 'Expédiée',
  'LIVRÉE': 'Livrée',
  'ANNULÉE': 'Annulée',
  'RETOURNÉE': 'Retournée',
};

export default function AdminOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);

  // Fetch orders with items
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ statut: status })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de la commande a été modifié',
      });
    },
  });

  const getOrderTotal = (order: any) => {
    return order.order_items?.reduce((sum: number, item: any) => 
      sum + (item.product_prix * item.quantite), 0
    ) || 0;
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded mb-4" />
                <div className="h-6 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
        <div className="text-sm text-muted-foreground">
          {orders?.length || 0} commande(s) au total
        </div>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Commande {order.code_suivi}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">
                      {formatPrice(getOrderTotal(order))}
                    </span>
                    <Badge className={statusColors[order.statut as keyof typeof statusColors]}>
                      {statusLabels[order.statut as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium mb-1">Client</h4>
                    <p className="text-sm">{order.client_nom}</p>
                    <p className="text-sm text-muted-foreground">{order.client_phone}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Adresse</h4>
                    <p className="text-sm">{order.client_ville}</p>
                    <p className="text-sm text-muted-foreground">{order.client_adresse}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Articles</h4>
                    <p className="text-sm">
                      {order.order_items?.length || 0} article(s)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.order_items?.reduce((sum: number, item: any) => sum + item.quantite, 0)} unité(s)
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="mr-2 h-3 w-3" />
                    Détails
                  </Button>
                  
                  <Select
                    value={order.statut}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
            <p className="text-muted-foreground">
              Les commandes apparaîtront ici une fois créées
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Détails de la commande {selectedOrder?.code_suivi}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Informations client</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nom:</strong> {selectedOrder.client_nom}</p>
                    <p><strong>Téléphone:</strong> {selectedOrder.client_phone}</p>
                    <p><strong>Ville:</strong> {selectedOrder.client_ville}</p>
                    <p><strong>Adresse:</strong> {selectedOrder.client_adresse}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Informations commande</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Date:</strong> {formatDate(selectedOrder.created_at)}</p>
                    <p><strong>Statut:</strong> 
                      <Badge className={`ml-2 ${statusColors[selectedOrder.statut as keyof typeof statusColors]}`}>
                        {statusLabels[selectedOrder.statut as keyof typeof statusLabels]}
                      </Badge>
                    </p>
                    <p><strong>Total:</strong> {formatPrice(getOrderTotal(selectedOrder))}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Articles commandés</h4>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{item.product_nom}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantité: {item.quantite}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(item.product_prix * item.quantite)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.product_prix)} × {item.quantite}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}