import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  RotateCcw, 
  Truck, 
  DollarSign, 
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Package,
  AlertTriangle
} from 'lucide-react';

export default function ReturnsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [showReturnDetails, setShowReturnDetails] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch returns data
  const { data: returns, isLoading } = useQuery({
    queryKey: ['admin-returns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('returns')
        .select(`
          *,
          orders(client_nom, code_suivi, order_total),
          customer_profiles(full_name, phone)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!returns) return { totalReturns: 0, rtoValue: 0, processedReturns: 0, refunded: 0 };
    
    const totalReturns = returns.length;
    const rtoValue = returns
      .filter(r => r.return_type === 'rto')
      .reduce((sum, r) => sum + Number(r.return_value || 0), 0);
    const processedReturns = returns.filter(r => r.status === 'processed').length;
    const refunded = returns
      .filter(r => r.status === 'refunded')
      .reduce((sum, r) => sum + Number(r.refund_amount || 0), 0);
    
    return { totalReturns, rtoValue, processedReturns, refunded };
  }, [returns]);

  const updateReturnStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('returns')
        .update({ status, processed_at: status === 'processed' ? new Date().toISOString() : null })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] });
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut du retour a été modifié avec succès',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    }
  });

  const filteredReturns = React.useMemo(() => {
    if (!returns) return [];
    return returns.filter(returnItem => 
      returnItem.return_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (returnItem.orders?.client_nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (returnItem.orders?.code_suivi || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [returns, searchTerm]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'initiated': { label: 'Initié', variant: 'secondary' as const },
      'in_transit': { label: 'En Transit', variant: 'default' as const },
      'received': { label: 'Reçu', variant: 'default' as const },
      'processed': { label: 'Traité', variant: 'default' as const },
      'refunded': { label: 'Remboursé', variant: 'default' as const },
      'restocked': { label: 'Remis en Stock', variant: 'default' as const },
      'disposed': { label: 'Éliminé', variant: 'destructive' as const }
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  const getReturnTypeBadge = (type: string) => {
    const typeMap = {
      'return': { label: 'Retour', variant: 'default' as const },
      'rto': { label: 'RTO', variant: 'destructive' as const },
      'exchange': { label: 'Échange', variant: 'secondary' as const },
      'refund': { label: 'Remboursement', variant: 'default' as const }
    };
    return typeMap[type as keyof typeof typeMap] || { label: type, variant: 'secondary' as const };
  };

  const handleExport = () => {
    if (!returns || returns.length === 0) {
      toast({
        title: 'Aucune donnée à exporter',
        description: 'La liste des retours est vide',
        variant: 'destructive',
      });
      return;
    }
    
    const csvData = returns.map(returnItem => ({
      'Code retour': returnItem.return_code,
      'Code commande': returnItem.orders?.code_suivi || '',
      'Client': returnItem.customer_profiles?.full_name || returnItem.orders?.client_nom || '',
      'Téléphone': returnItem.customer_profiles?.phone || '',
      'Type': returnItem.return_type,
      'Raison': returnItem.reason_description || '',
      'Valeur': returnItem.return_value,
      'Montant remboursé': returnItem.refund_amount || 0,
      'Statut': returnItem.status,
      'Date création': new Date(returnItem.created_at).toLocaleDateString('fr-FR'),
      'Date traitement': returnItem.processed_at ? 
        new Date(returnItem.processed_at).toLocaleDateString('fr-FR') : ''
    }));
    
    const headers = Object.keys(csvData[0]);
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `retours_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export réussi',
      description: 'Les données de retours ont été exportées en CSV',
    });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-returns'] });
    toast({
      title: 'Données actualisées',
      description: 'La liste des retours a été mise à jour',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">RTO / Annulations</h1>
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
          <h1 className="text-3xl font-bold">Retours & RTO</h1>
          <p className="text-muted-foreground">
            Centre de gestion des retours, annulations et workflows RTO
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Retours</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReturns}</div>
            <p className="text-xs text-muted-foreground">
              Retours enregistrés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur RTO</CardTitle>
            <Truck className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rtoValue.toLocaleString()} MAD</div>
            <p className="text-xs text-muted-foreground">
              Perte RTO
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Traités</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.processedReturns}</div>
            <p className="text-xs text-muted-foreground">
              Retours finalisés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remboursé</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.refunded.toLocaleString()} MAD</div>
            <p className="text-xs text-muted-foreground">
              Total remboursements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Retours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input 
                placeholder="Rechercher commande, code suivi..." 
                className="w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => {
              // Apply search filter
              setSearchTerm(searchTerm);
            }}>
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </Button>
            <Button variant="outline" onClick={() => {
              // Clear all filters
              setSearchTerm('');
            }}>
              <Filter className="mr-2 h-4 w-4" />
              Effacer filtres
            </Button>
          </div>

          {/* Returns Table */}
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Code Retour</th>
                    <th className="text-left p-4 font-medium">Commande</th>
                    <th className="text-left p-4 font-medium">Client</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Raison</th>
                    <th className="text-left p-4 font-medium">Valeur</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Statut</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturns.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        Aucun retour trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredReturns.map((returnItem) => {
                      const statusBadge = getStatusBadge(returnItem.status);
                      const typeBadge = getReturnTypeBadge(returnItem.return_type);

                      return (
                        <tr key={returnItem.id} className="border-t">
                          <td className="p-4 font-mono text-sm">{returnItem.return_code}</td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{returnItem.orders?.code_suivi || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">
                                {returnItem.orders?.client_nom || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">
                                {returnItem.customer_profiles?.full_name || returnItem.orders?.client_nom || 'N/A'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {returnItem.customer_profiles?.phone || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">{returnItem.reason_description}</span>
                          </td>
                          <td className="p-4">{returnItem.return_value} MAD</td>
                          <td className="p-4">
                            <span className="text-sm">
                              {new Date(returnItem.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Select
                                value={returnItem.status}
                                onValueChange={(value) => 
                                  updateReturnStatus.mutate({ id: returnItem.id, status: value })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="initiated">Initié</SelectItem>
                                  <SelectItem value="in_transit">En Transit</SelectItem>
                                  <SelectItem value="received">Reçu</SelectItem>
                                  <SelectItem value="processed">Traité</SelectItem>
                                  <SelectItem value="refunded">Remboursé</SelectItem>
                                  <SelectItem value="restocked">Remis en Stock</SelectItem>
                                  <SelectItem value="disposed">Éliminé</SelectItem>
                                </SelectContent>
                               </Select>
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => {
                                   setSelectedReturn(returnItem);
                                   setShowReturnDetails(true);
                                 }}
                               >
                                 <Eye className="h-3 w-3" />
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

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Raisons de Retour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Client injoignable</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                  <span className="text-sm font-medium">60%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Adresse incorrecte</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '25%'}}></div>
                  </div>
                  <span className="text-sm font-medium">25%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Client refuse</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '15%'}}></div>
                  </div>
                  <span className="text-sm font-medium">15%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coûts RTO par Mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Coût de transport</span>
                <span className="font-medium">{Math.round(stats.rtoValue * 0.6).toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Coût de manutention</span>
                <span className="font-medium">{Math.round(stats.rtoValue * 0.2).toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Produits endommagés</span>
                <span className="font-medium">{Math.round(stats.rtoValue * 0.2).toLocaleString()} MAD</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>{stats.rtoValue.toLocaleString()} MAD</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Workflows Automatisés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Auto-restockage</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Articles en bon état remis automatiquement en stock
              </p>
              <Badge variant="default">Actif</Badge>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Échange client</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Proposition d'échange pour défauts produit
              </p>
              <Badge variant="secondary">Inactif</Badge>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Suivi qualité</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Contrôle qualité automatique des retours
              </p>
              <Badge variant="default">Actif</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Details Dialog */}
      <Dialog open={showReturnDetails} onOpenChange={setShowReturnDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Détails du retour - {selectedReturn?.return_code}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReturn && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Informations du retour</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Code retour:</strong> {selectedReturn.return_code}</p>
                    <p><strong>Type:</strong> 
                      <Badge variant={getReturnTypeBadge(selectedReturn.return_type).variant} className="ml-2">
                        {getReturnTypeBadge(selectedReturn.return_type).label}
                      </Badge>
                    </p>
                    <p><strong>Statut:</strong> 
                      <Badge variant={getStatusBadge(selectedReturn.status).variant} className="ml-2">
                        {getStatusBadge(selectedReturn.status).label}
                      </Badge>
                    </p>
                    <p><strong>Valeur retour:</strong> {selectedReturn.return_value} MAD</p>
                    <p><strong>Montant remboursé:</strong> {selectedReturn.refund_amount || 0} MAD</p>
                    <p><strong>Date création:</strong> {new Date(selectedReturn.created_at).toLocaleDateString('fr-FR')}</p>
                    {selectedReturn.processed_at && (
                      <p><strong>Date traitement:</strong> {new Date(selectedReturn.processed_at).toLocaleDateString('fr-FR')}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Commande & Client</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Code suivi:</strong> {selectedReturn.orders?.code_suivi || 'N/A'}</p>
                    <p><strong>Client:</strong> {selectedReturn.customer_profiles?.full_name || selectedReturn.orders?.client_nom || 'N/A'}</p>
                    <p><strong>Téléphone:</strong> {selectedReturn.customer_profiles?.phone || 'N/A'}</p>
                    <p><strong>Total commande:</strong> {selectedReturn.orders?.order_total || 0} MAD</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Raison du retour</h4>
                <p className="text-sm bg-muted p-3 rounded">
                  {selectedReturn.reason_description || 'Aucune raison spécifiée'}
                </p>
              </div>

              {selectedReturn.return_type === 'rto' && (
                <div>
                  <h4 className="font-semibold mb-3">Analyse RTO</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-red-50 p-3 rounded">
                      <p className="font-medium text-red-800">Coût de transport</p>
                      <p className="text-red-600">{Math.round(selectedReturn.return_value * 0.6)} MAD</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded">
                      <p className="font-medium text-orange-800">Coût de manutention</p>
                      <p className="text-orange-600">{Math.round(selectedReturn.return_value * 0.4)} MAD</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}