import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  FileText
} from 'lucide-react';

export default function FinancePage() {
  const [searchTerm, setSearchTerm] = useState('');

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
    return transactions.filter(transaction => 
      transaction.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.orders?.client_nom || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Compta
          </Button>
          <Button>
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
            <div className="text-2xl font-bold">{stats.revenue.toLocaleString()} MAD</div>
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
            <div className="text-2xl font-bold">{stats.profit.toLocaleString()} MAD</div>
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
            <div className="text-2xl font-bold">{stats.codFees.toLocaleString()} MAD</div>
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
            <div className="text-2xl font-bold text-orange-600">{stats.pending.toLocaleString()} MAD</div>
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
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtres
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
                              {transaction.transaction_type === 'refund' ? '-' : '+'}{transaction.amount} MAD
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">
                              {new Date(transaction.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                          </td>
                          <td className="p-4">
                            <Button variant="outline" size="sm">Voir</Button>
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
              <div className="flex justify-between items-center">
                <span>Chaussures</span>
                <div className="text-right">
                  <p className="font-medium">25,400 MAD</p>
                  <p className="text-sm text-muted-foreground">32.4%</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Vêtements</span>
                <div className="text-right">
                  <p className="font-medium">32,100 MAD</p>
                  <p className="text-sm text-muted-foreground">41.0%</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Accessoires</span>
                <div className="text-right">
                  <p className="font-medium">12,833 MAD</p>
                  <p className="text-sm text-muted-foreground">16.4%</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Électronique</span>
                <div className="text-right">
                  <p className="font-medium">8,000 MAD</p>
                  <p className="text-sm text-muted-foreground">10.2%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unité Economics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>AOV Moyen</span>
                <span className="font-medium">456 MAD</span>
              </div>
              <div className="flex justify-between items-center">
                <span>COGS par Commande</span>
                <span className="font-medium">152 MAD</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Frais d'Expédition</span>
                <span className="font-medium">45 MAD</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Frais COD</span>
                <span className="font-medium">15 MAD</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold">
                  <span>Marge par Commande</span>
                  <span className="text-green-600">244 MAD</span>
                </div>
                <p className="text-sm text-muted-foreground text-right">53.5% de marge</p>
              </div>
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
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="mb-2 h-6 w-6" />
              <span>Journal des Ventes</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calculator className="mb-2 h-6 w-6" />
              <span>État COGS</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Receipt className="mb-2 h-6 w-6" />
              <span>Factures TVA</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <DollarSign className="mb-2 h-6 w-6" />
              <span>Réconciliation COD</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}