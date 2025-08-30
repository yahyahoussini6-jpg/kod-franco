import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, formatDate } from '@/lib/format';
import { 
  DollarSign, 
  TrendingUp, 
  Calculator, 
  Receipt,
  Search,
  Filter,
  Download,
  CreditCard,
  Banknote,
  Target,
  FileText,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';

export default function FinancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch financial transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['admin-financial-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          orders(client_nom, code_suivi),
          customer_profiles(full_name, phone)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch orders for revenue calculation
  const { data: orders } = useQuery({
    queryKey: ['admin-orders-finance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'livree');
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate financial stats
  const stats = React.useMemo(() => {
    if (!orders || !transactions) return { revenue: 0, profit: 0, codFees: 0, pending: 0 };
    
    const revenue = orders.reduce((sum, order) => sum + Number(order.order_total || 0), 0);
    const codFees = orders.reduce((sum, order) => sum + Number(order.cod_fee || 0), 0);
    const costs = orders.reduce((sum, order) => 
      sum + Number(order.cogs_total || 0) + Number(order.shipping_cost || 0), 0);
    const profit = revenue - costs - codFees;
    
    const pending = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    return { revenue, profit, codFees, pending };
  }, [orders, transactions]);

  const filteredTransactions = React.useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(transaction => {
      const matchesSearch = transaction.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.orders?.client_nom || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      const matchesType = typeFilter === 'all' || transaction.transaction_type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  // Calculate real COGS by category
  const cogsByCategory = React.useMemo(() => {
    if (!orders) return {};
    
    const categoryStats = orders.reduce((acc, order) => {
      // For now, we'll use a default category mapping since we don't have the order items with categories
      const category = 'Produits'; // This would come from order_items.category in real implementation
      const cogs = Number(order.cogs_total || 0);
      
      if (!acc[category]) {
        acc[category] = { total: 0, percentage: 0 };
      }
      acc[category].total += cogs;
      
      return acc;
    }, {} as Record<string, { total: number; percentage: number }>);
    
    const totalCogs = Object.values(categoryStats).reduce((sum, cat) => sum + cat.total, 0);
    
    // Calculate percentages
    Object.keys(categoryStats).forEach(category => {
      categoryStats[category].percentage = totalCogs > 0 ? (categoryStats[category].total / totalCogs) * 100 : 0;
    });
    
    return categoryStats;
  }, [orders]);

  // Export functions
  const handleExportAccounting = () => {
    if (!transactions || !orders) {
      toast({
        title: "Erreur",
        description: "Aucune donnée à exporter",
        variant: "destructive"
      });
      return;
    }
    
    const csvData = transactions.map(t => ({
      'Référence': t.reference_number || t.id.slice(0, 8),
      'Type': t.transaction_type,
      'Montant': t.amount,
      'Statut': t.status,
      'Date': formatDate(t.created_at),
      'Description': t.description || '',
      'Client': t.customer_profiles?.full_name || t.orders?.client_nom || 'N/A'
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: "Export réussi",
      description: "Le fichier comptabilité a été téléchargé"
    });
  };

  const handleCreateInvoice = () => {
    toast({
      title: "Nouvelle facture",
      description: "Fonctionnalité en développement"
    });
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-financial-transactions'] });
    await queryClient.invalidateQueries({ queryKey: ['admin-orders-finance'] });
    toast({
      title: "Données actualisées",
      description: "Les données financières ont été mises à jour"
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    toast({
      title: "Filtres effacés",
      description: "Tous les filtres ont été réinitialisés"
    });
  };

  const getTransactionTypeBadge = (type: string) => {
    const typeMap = {
      'sale': { label: 'Vente', variant: 'default' as const },
      'refund': { label: 'Remboursement', variant: 'destructive' as const },
      'cod_fee': { label: 'Frais COD', variant: 'secondary' as const },
      'shipping_fee': { label: 'Frais Livraison', variant: 'secondary' as const },
      'discount': { label: 'Remise', variant: 'secondary' as const },
      'cost': { label: 'Coût', variant: 'destructive' as const }
    };
    return typeMap[type as keyof typeof typeMap] || { label: type, variant: 'secondary' as const };
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'En Attente', variant: 'secondary' as const },
      'completed': { label: 'Complété', variant: 'default' as const },
      'failed': { label: 'Échoué', variant: 'destructive' as const },
      'cancelled': { label: 'Annulé', variant: 'secondary' as const }
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Finance</h1>
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
          <h1 className="text-3xl font-bold">Finance</h1>
          <p className="text-muted-foreground">
            Gestion financière, facturation, COGS et réconciliation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button variant="outline" onClick={handleExportAccounting}>
            <Download className="mr-2 h-4 w-4" />
            Export Compta
          </Button>
          <Button onClick={handleCreateInvoice}>
            <FileText className="mr-2 h-4 w-4" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              CA des commandes livrées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marge Brute</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.profit)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.revenue > 0 ? Math.round((stats.profit / stats.revenue) * 100) : 0}% de marge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frais COD</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.codFees)}</div>
            <p className="text-xs text-muted-foreground">
              Total frais contre-remboursement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Receipt className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatPrice(stats.pending)}</div>
            <p className="text-xs text-muted-foreground">
              Transactions en attente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Facturation */}
      <Card>
        <CardHeader>
          <CardTitle>Facturation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input 
                placeholder="Rechercher transaction, référence..." 
                className="w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="completed">Complété</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="sale">Vente</SelectItem>
                <SelectItem value="refund">Remboursement</SelectItem>
                <SelectItem value="cod_fee">Frais COD</SelectItem>
                <SelectItem value="shipping_fee">Frais Livraison</SelectItem>
                <SelectItem value="cost">Coût</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="mr-2 h-4 w-4" />
              Effacer
            </Button>
          </div>

          {/* Transactions Table */}
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Référence</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Client</th>
                    <th className="text-left p-4 font-medium">Montant</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Statut</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        Aucune transaction trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction) => {
                      const typeBadge = getTransactionTypeBadge(transaction.transaction_type);
                      const statusBadge = getStatusBadge(transaction.status);

                      return (
                        <tr key={transaction.id} className="border-t">
                          <td className="p-4">
                            <div>
                              <p className="font-medium font-mono text-sm">
                                {transaction.reference_number || transaction.id.slice(0, 8)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.orders?.code_suivi || 'Transaction directe'}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">
                                {transaction.customer_profiles?.full_name || 
                                 transaction.orders?.client_nom || 'N/A'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.customer_profiles?.phone || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`font-medium ${
                              transaction.transaction_type === 'refund' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {transaction.transaction_type === 'refund' ? '-' : '+'}{formatPrice(Number(transaction.amount))}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">
                              {formatDate(transaction.created_at)}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                          </td>
                          <td className="p-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                                  <Eye className="mr-1 h-3 w-3" />
                                  Voir
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Détails de la Transaction</DialogTitle>
                                </DialogHeader>
                                {selectedTransaction && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Référence</label>
                                        <p className="font-mono text-sm">{selectedTransaction.reference_number || selectedTransaction.id}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Type</label>
                                        <p>{getTransactionTypeBadge(selectedTransaction.transaction_type).label}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Montant</label>
                                        <p className="font-medium">{formatPrice(Number(selectedTransaction.amount))}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Statut</label>
                                        <p>{getStatusBadge(selectedTransaction.status).label}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Date</label>
                                        <p>{formatDate(selectedTransaction.created_at)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Méthode de paiement</label>
                                        <p>{selectedTransaction.payment_method || 'N/A'}</p>
                                      </div>
                                    </div>
                                    {selectedTransaction.description && (
                                      <div>
                                        <label className="text-sm font-medium">Description</label>
                                        <p className="text-sm text-muted-foreground">{selectedTransaction.description}</p>
                                      </div>
                                    )}
                                    {selectedTransaction.orders && (
                                      <div>
                                        <label className="text-sm font-medium">Commande associée</label>
                                        <p className="text-sm">Code: {selectedTransaction.orders.code_suivi}</p>
                                        <p className="text-sm">Client: {selectedTransaction.orders.client_nom}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
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

      {/* COGS et Unité Economics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>COGS par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.keys(cogsByCategory).length > 0 ? (
                Object.entries(cogsByCategory).map(([category, data]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span>{category}</span>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(data.total)}</p>
                      <p className="text-sm text-muted-foreground">{data.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Aucune donnée COGS disponible
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unité Economics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders && orders.length > 0 ? (
                <>
                  <div className="flex justify-between items-center">
                    <span>AOV Moyen</span>
                    <span className="font-medium">
                      {formatPrice(orders.reduce((sum, o) => sum + Number(o.order_total || 0), 0) / orders.length)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>COGS par Commande</span>
                    <span className="font-medium">
                      {formatPrice(orders.reduce((sum, o) => sum + Number(o.cogs_total || 0), 0) / orders.length)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Frais d'Expédition</span>
                    <span className="font-medium">
                      {formatPrice(orders.reduce((sum, o) => sum + Number(o.shipping_cost || 0), 0) / orders.length)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Frais COD</span>
                    <span className="font-medium">
                      {formatPrice(orders.reduce((sum, o) => sum + Number(o.cod_fee || 0), 0) / orders.length)}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center font-bold">
                      <span>Marge par Commande</span>
                      <span className="text-green-600">
                        {formatPrice(stats.profit / orders.length)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground text-right">
                      {stats.revenue > 0 ? Math.round((stats.profit / stats.revenue) * 100) : 0}% de marge
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Réconciliation COD */}
      <Card>
        <CardHeader>
          <CardTitle>Réconciliation COD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">AUJOURD'HUI</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Livraisons COD</span>
                  <span className="font-medium">45,600 MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>Montant reçu</span>
                  <span className="font-medium text-green-600">42,100 MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>En attente</span>
                  <span className="font-medium text-orange-600">3,500 MAD</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">CETTE SEMAINE</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total COD</span>
                  <span className="font-medium">234,500 MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>Réconcilié</span>
                  <span className="font-medium text-green-600">221,800 MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>Écart</span>
                  <span className="font-medium text-red-600">12,700 MAD</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">CE MOIS</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total COD</span>
                  <span className="font-medium">1,234,500 MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>Taux réconciliation</span>
                  <span className="font-medium text-green-600">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Pertes</span>
                  <span className="font-medium text-red-600">71,500 MAD</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Exports Comptabilité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleExportAccounting()}
            >
              <FileText className="mb-2 h-6 w-6" />
              <span>Journal des Ventes</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => toast({ title: "Export COGS", description: "Fonctionnalité en développement" })}
            >
              <Calculator className="mb-2 h-6 w-6" />
              <span>État COGS</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => toast({ title: "Factures TVA", description: "Fonctionnalité en développement" })}
            >
              <Receipt className="mb-2 h-6 w-6" />
              <span>Factures TVA</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => toast({ title: "Réconciliation COD", description: "Fonctionnalité en développement" })}
            >
              <DollarSign className="mb-2 h-6 w-6" />
              <span>Réconciliation COD</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}