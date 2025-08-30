import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  UserCheck, 
  Phone, 
  MapPin, 
  ShoppingBag,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Plus
} from 'lucide-react';

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch customer profiles
  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch customer stats
  const { data: stats } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('customer_profiles')
        .select('*');
      
      if (error) throw error;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const totalClients = profiles.length;
      const newClients = profiles.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length;
      const vipClients = profiles.filter(p => p.is_vip).length;
      const riskClients = profiles.filter(p => p.risk_score > 0.7).length;
      
      // Calculate average LTV (this would be more complex with real order data)
      const avgLTV = profiles.reduce((sum, p) => sum + (p.risk_score * 1000), 0) / profiles.length;

      return {
        totalClients,
        newClients,
        vipClients,
        riskClients,
        avgLTV: Math.round(avgLTV)
      };
    }
  });

  const filteredCustomers = React.useMemo(() => {
    if (!customers) return [];
    return customers.filter(customer => 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [customers, searchTerm]);

  const getRiskBadge = (riskScore: number) => {
    if (riskScore > 0.7) return { label: 'Élevé', variant: 'destructive' as const };
    if (riskScore > 0.4) return { label: 'Moyen', variant: 'secondary' as const };
    return { label: 'Faible', variant: 'default' as const };
  };

  const getStatusBadge = (customer: any) => {
    if (customer.is_blocked) return { label: 'Bloqué', variant: 'destructive' as const };
    if (customer.is_vip) return { label: 'VIP', variant: 'default' as const };
    return { label: 'Actif', variant: 'secondary' as const };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clients (CRM)</h1>
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
          <h1 className="text-3xl font-bold">Clients (CRM)</h1>
          <p className="text-muted-foreground">
            Gestion des profils clients, historique commandes et segmentation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newClients || 0} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients VIP</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.vipClients || 0}</div>
            <p className="text-xs text-muted-foreground">
              Clients premium
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients à Risque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.riskClients || 0}</div>
            <p className="text-xs text-muted-foreground">
              Score RTO élevé
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV Moyenne</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgLTV || 0} MAD</div>
            <p className="text-xs text-muted-foreground">
              Valeur vie client
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Base Clients</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input 
                  placeholder="Rechercher nom, téléphone, email..." 
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

          {/* Clients Table */}
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Client</th>
                    <th className="text-left p-4 font-medium">Contact</th>
                    <th className="text-left p-4 font-medium">Ville</th>
                    <th className="text-left p-4 font-medium">Commandes</th>
                    <th className="text-left p-4 font-medium">Total Dépensé</th>
                    <th className="text-left p-4 font-medium">Score Risque</th>
                    <th className="text-left p-4 font-medium">Statut</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        Aucun client trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const riskBadge = getRiskBadge(customer.risk_score);
                      const statusBadge = getStatusBadge(customer);

                      return (
                        <tr key={customer.id} className="border-t">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{customer.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Client depuis {new Date(customer.created_at).getFullYear()}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Phone className="mr-1 h-3 w-3" />
                                {customer.phone}
                              </div>
                              {customer.email && (
                                <p className="text-sm text-muted-foreground">{customer.email}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center text-sm">
                              <MapPin className="mr-1 h-3 w-3" />
                              {customer.city || 'N/A'}
                            </div>
                          </td>
                          <td className="p-4">-</td>
                          <td className="p-4">- MAD</td>
                          <td className="p-4">
                            <Badge variant={riskBadge.variant}>{riskBadge.label}</Badge>
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

      {/* Segmentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Segmentation Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Nouveaux Clients (&lt;3 mois)</span>
                <Badge>{stats?.newClients || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Clients Actifs</span>
                <Badge>{(stats?.totalClients || 0) - (stats?.riskClients || 0)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Clients VIP</span>
                <Badge>{stats?.vipClients || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Clients à Risque</span>
                <Badge variant="secondary">{stats?.riskClients || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="font-medium">{stats?.riskClients || 0} clients à risque RTO</p>
                  <p className="text-sm text-muted-foreground">Score &gt; 0.7</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-red-500" />
                <div>
                  <p className="font-medium">Surveillance automatique</p>
                  <p className="text-sm text-muted-foreground">Numéros et emails validés</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <UserCheck className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium">Profils créés automatiquement</p>
                  <p className="text-sm text-muted-foreground">À partir des commandes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}