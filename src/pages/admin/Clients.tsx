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
  UserCheck, 
  Phone, 
  MapPin, 
  ShoppingBag,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Eye
} from 'lucide-react';

const clientSchema = z.object({
  full_name: z.string().min(2, 'Le nom complet est requis'),
  phone: z.string().min(10, 'Le numéro de téléphone est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  city: z.string().min(2, 'La ville est requise'),
  address: z.string().min(5, 'L\'adresse complète est requise'),
});

type ClientForm = z.infer<typeof clientSchema>;

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      city: '',
      address: '',
    },
  });

  // Fetch customer profiles with analytics data
  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return profiles || [];
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

  // Create new client mutation
  const createClientMutation = useMutation({
    mutationFn: async (clientData: ClientForm) => {
      const { error } = await supabase
        .from('customer_profiles')
        .insert({
          full_name: clientData.full_name,
          phone: clientData.phone,
          email: clientData.email || null,
          city: clientData.city,
          address: clientData.address,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
      toast({
        title: 'Client créé',
        description: 'Le nouveau client a été ajouté avec succès',
      });
      setShowNewClientDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message.includes('duplicate') ? 
          'Un client avec ce numéro de téléphone existe déjà' : 
          'Impossible de créer le client',
        variant: 'destructive',
      });
    },
  });

  const handleCreateClient = (data: ClientForm) => {
    createClientMutation.mutate(data);
  };

  const handleExport = () => {
    if (!customers || customers.length === 0) {
      toast({
        title: 'Aucune donnée à exporter',
        description: 'La base clients est vide',
        variant: 'destructive',
      });
      return;
    }
    
    const csvData = customers.map(customer => ({
      'Nom complet': customer.full_name,
      'Téléphone': customer.phone,
      'Email': customer.email || '',
      'Ville': customer.city || '',
      'Adresse': customer.address || '',
      'Première commande': customer.first_order_at ? new Date(customer.first_order_at).toLocaleDateString('fr-FR') : '',
      'Dernière commande': customer.last_order_at ? new Date(customer.last_order_at).toLocaleDateString('fr-FR') : '',
      'Commandes livrées': customer.delivered_orders_cnt || 0,
      'Commandes retournées': customer.rto_orders_cnt || 0,
      'Commandes annulées': customer.cancelled_orders_cnt || 0,
      'Revenue net': customer.delivered_net_revenue_mad || 0,
      'Marge brute': customer.gross_margin_mad || 0,
      'Taux confirmation': ((customer.confirmation_contactability_rate || 0) * 100).toFixed(1) + '%',
      'Temps confirm moyen': (customer.avg_confirmation_time_min || 0).toFixed(0) + ' min',
      'Source marketing': customer.marketing_source || '',
      'Campagne': customer.campaign || '',
      'Device fingerprint': customer.device_fingerprint || '',
      'Cookie ID': customer.cookie_id || '',
      'Notes blacklist': customer.notes_blacklist ? customer.notes_blacklist.join('; ') : '',
      'Score risque': customer.risk_score || 0,
      'Statut VIP': customer.is_vip ? 'Oui' : 'Non',
      'Date création': new Date(customer.created_at).toLocaleDateString('fr-FR')
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
    link.setAttribute('download', `clients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export réussi',
      description: 'La base clients a été exportée en CSV',
    });
  };

  const filteredCustomers = React.useMemo(() => {
    if (!customers) return [];
    return customers.filter(customer => 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.city && customer.city.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowNewClientDialog(true)}>
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
            <Button variant="outline" onClick={() => {
              // Apply current search filter
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
                    <th className="text-left p-4 font-medium">Revenue</th>
                    <th className="text-left p-4 font-medium">Marge</th>
                    <th className="text-left p-4 font-medium">Confirm %</th>
                    <th className="text-left p-4 font-medium">Source</th>
                    <th className="text-left p-4 font-medium">Statut</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-muted-foreground">
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
                           <td className="p-4">
                             <div className="text-sm">
                               <div>{customer.delivered_orders_cnt || 0}D / {customer.rto_orders_cnt || 0}R / {customer.cancelled_orders_cnt || 0}C</div>
                               <div className="text-xs text-muted-foreground">Total commandes</div>
                             </div>
                           </td>
                           <td className="p-4">
                             <div className="text-sm">
                               <div>{(customer.delivered_net_revenue_mad || 0).toLocaleString()} MAD</div>
                               <div className="text-xs text-muted-foreground">Net revenue</div>
                             </div>
                           </td>
                           <td className="p-4">
                             <div className="text-sm">
                               <div>{(customer.gross_margin_mad || 0).toLocaleString()} MAD</div>
                               <div className="text-xs text-muted-foreground">Marge brute</div>
                             </div>
                           </td>
                           <td className="p-4">
                             <div className="text-sm">
                               <div>{((customer.confirmation_contactability_rate || 0) * 100).toFixed(1)}%</div>
                               <div className="text-xs text-muted-foreground">{(customer.avg_confirmation_time_min || 0).toFixed(0)}min avg</div>
                             </div>
                           </td>
                           <td className="p-4">
                             <div className="text-sm">
                               <div>{customer.marketing_source || 'N/A'}</div>
                               <div className="text-xs text-muted-foreground">{customer.campaign || ''}</div>
                             </div>
                           </td>
                           <td className="p-4">
                             <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                           </td>
                           <td className="p-4">
                             <div className="flex gap-2">
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => {
                                   setSelectedClient(customer);
                                   setShowClientDetails(true);
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

      {/* New Client Dialog */}
      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau Client</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateClient)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="06xxxxxxxx" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (optionnel)</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse complète</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewClientDialog(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createClientMutation.isPending}
                >
                  {createClientMutation.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Client Details Dialog */}
      <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Détails du client - {selectedClient?.full_name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Informations personnelles</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nom:</strong> {selectedClient.full_name}</p>
                    <p><strong>Téléphone:</strong> {selectedClient.phone}</p>
                    <p><strong>Email:</strong> {selectedClient.email || 'Non renseigné'}</p>
                    <p><strong>Ville:</strong> {selectedClient.city || 'Non renseignée'}</p>
                    <p><strong>Adresse:</strong> {selectedClient.address || 'Non renseignée'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Statistiques</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Client depuis:</strong> {new Date(selectedClient.created_at).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Nombre de commandes:</strong> {selectedClient.orderCount || 0}</p>
                    <p><strong>Total dépensé:</strong> {selectedClient.totalSpent || 0} MAD</p>
                    <p><strong>Score de risque:</strong> {selectedClient.risk_score || 0}</p>
                    <p className="flex items-center gap-2">
                      <strong>Statut:</strong> 
                      <Badge variant={getStatusBadge(selectedClient).variant}>
                        {getStatusBadge(selectedClient).label}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedClient.notes && (
                <div>
                  <h4 className="font-semibold mb-3">Notes</h4>
                  <p className="text-sm bg-muted p-3 rounded">{selectedClient.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}