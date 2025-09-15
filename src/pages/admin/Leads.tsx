import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/format';
import { Search, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface Lead {
  id: string;
  nom: string | null;
  phone: string | null;
  ville: string | null;
  adresse: string | null;
  cart_items: any;
  total_value: number;
  form_completion_percentage: number;
  status: string;
  created_at: string;
  last_activity: string;
  converted_to_order_id: string | null;
}

interface LeadStats {
  total_leads: number;
  active_leads: number;
  converted_leads: number;
  average_cart_value: number;
  conversion_rate: number;
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({
    total_leads: 0,
    active_leads: 0,
    converted_leads: 0,
    average_cart_value: 0,
    conversion_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLeads(data || []);
      
      // Calculate stats
      const totalLeads = data?.length || 0;
      const activeLeads = data?.filter(lead => lead.status === 'active').length || 0;
      const convertedLeads = data?.filter(lead => lead.status === 'converted').length || 0;
      const averageCartValue = totalLeads > 0 
        ? data.reduce((sum, lead) => sum + (lead.total_value || 0), 0) / totalLeads 
        : 0;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      setStats({
        total_leads: totalLeads,
        active_leads: activeLeads,
        converted_leads: convertedLeads,
        average_cart_value: averageCartValue,
        conversion_rate: conversionRate,
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      (lead.nom && lead.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchTerm)) ||
      (lead.ville && lead.ville.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'active' && lead.status === 'active') ||
      (activeTab === 'converted' && lead.status === 'converted');
    
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Actif</Badge>;
      case 'converted':
        return <Badge variant="secondary">Converti</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}min`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}j`;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads - Wana Buy</h1>
          <p className="text-muted-foreground">
            Clients potentiels qui ont commencé une commande
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_leads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Actifs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_leads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertis</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.converted_leads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.average_cart_value)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.conversion_rate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, téléphone, ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Tous ({leads.length})</TabsTrigger>
              <TabsTrigger value="active">Actifs ({stats.active_leads})</TabsTrigger>
              <TabsTrigger value="converted">Convertis ({stats.converted_leads})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Panier</TableHead>
                  <TableHead>Complétion</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière Activité</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {lead.nom || 'Nom non renseigné'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {lead.id.substring(0, 8)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lead.phone && (
                          <div className="text-sm">{lead.phone}</div>
                        )}
                        {!lead.phone && (
                          <div className="text-sm text-muted-foreground">Non renseigné</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.ville || 'Non renseigné'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {formatPrice(lead.total_value)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Array.isArray(lead.cart_items) ? lead.cart_items.length : 0} articles
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${lead.form_completion_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{lead.form_completion_percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(lead.status)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {getTimeAgo(lead.last_activity)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(lead.last_activity)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {lead.phone && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                          >
                            Appeler
                          </Button>
                        )}
                        {lead.converted_to_order_id && (
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              // Navigate to order details if needed
                              toast({
                                title: "Info",
                                description: `Commande liée: ${lead.converted_to_order_id}`,
                              });
                            }}
                          >
                            Voir Commande
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLeads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm 
                          ? "Aucun lead trouvé pour cette recherche"
                          : "Aucun lead disponible"
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}