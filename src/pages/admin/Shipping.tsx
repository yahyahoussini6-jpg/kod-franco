import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, formatDate } from '@/lib/format';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package, 
  TrendingUp, 
  Plus, 
  Edit, 
  Eye, 
  RefreshCw,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  Target
} from 'lucide-react';

export default function ShippingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState('all');
  const [selectedZone, setSelectedZone] = useState('');
  const [showCarrierDialog, setShowCarrierDialog] = useState(false);
  const [showZoneDialog, setShowZoneDialog] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<any>(null);
  const [editingZone, setEditingZone] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch carriers
  const { data: carriers, isLoading: carriersLoading } = useQuery({
    queryKey: ['admin-carriers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carriers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch shipping zones
  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ['admin-shipping-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_zones')
        .select(`
          *,
          carriers(name)
        `)
        .order('zone_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch shipping analytics
  const { data: shippingStats } = useQuery({
    queryKey: ['shipping-analytics'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .not('shipped_at', 'is', null);
      
      if (error) throw error;

      const total = orders.length;
      const delivered = orders.filter(o => o.status === 'livree').length;
      const pending = orders.filter(o => o.status === 'expediee').length;
      const avgShippingCost = orders.reduce((sum, o) => sum + (o.shipping_cost || 0), 0) / total;
      
      // Calculate average delivery time
      const deliveredOrders = orders.filter(o => o.status === 'livree' && o.shipped_at && o.delivered_at);
      const avgDeliveryTime = deliveredOrders.length > 0 
        ? deliveredOrders.reduce((sum, o) => {
            const shippedDate = new Date(o.shipped_at);
            const deliveredDate = new Date(o.delivered_at);
            return sum + (deliveredDate.getTime() - shippedDate.getTime());
          }, 0) / deliveredOrders.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      return {
        totalShipments: total,
        deliveredShipments: delivered,
        pendingShipments: pending,
        deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
        avgShippingCost,
        avgDeliveryTime: Math.round(avgDeliveryTime * 10) / 10
      };
    }
  });

  // Create/Update carrier mutation
  const carrierMutation = useMutation({
    mutationFn: async (carrierData: any) => {
      if (editingCarrier) {
        const { data, error } = await supabase
          .from('carriers')
          .update(carrierData)
          .eq('id', editingCarrier.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('carriers')
          .insert([carrierData])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-carriers'] });
      setShowCarrierDialog(false);
      setEditingCarrier(null);
      toast({
        title: editingCarrier ? "Transporteur modifié" : "Transporteur créé",
        description: editingCarrier ? "Les informations ont été mises à jour" : "Le nouveau transporteur a été ajouté"
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le transporteur",
        variant: "destructive"
      });
    }
  });

  // Create/Update zone mutation
  const zoneMutation = useMutation({
    mutationFn: async (zoneData: any) => {
      if (editingZone) {
        const { data, error } = await supabase
          .from('shipping_zones')
          .update(zoneData)
          .eq('id', editingZone.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('shipping_zones')
          .insert([zoneData])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-zones'] });
      setShowZoneDialog(false);
      setEditingZone(null);
      toast({
        title: editingZone ? "Zone modifiée" : "Zone créée",
        description: editingZone ? "Les informations ont été mises à jour" : "La nouvelle zone a été ajoutée"
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la zone",
        variant: "destructive"
      });
    }
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-carriers'] });
    await queryClient.invalidateQueries({ queryKey: ['admin-shipping-zones'] });
    await queryClient.invalidateQueries({ queryKey: ['shipping-analytics'] });
    toast({
      title: "Données actualisées",
      description: "Les données de livraison ont été mises à jour"
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Actif
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Inactif
      </Badge>
    );
  };

  const filteredCarriers = carriers?.filter(carrier =>
    carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    carrier.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredZones = zones?.filter(zone => {
    const matchesSearch = zone.zone_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCarrier = selectedCarrier === 'all' || zone.carrier_id === selectedCarrier;
    return matchesSearch && matchesCarrier;
  });

  if (carriersLoading || zonesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Livraison</h1>
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
          <h1 className="text-3xl font-bold">Gestion Livraison</h1>
          <p className="text-muted-foreground">
            Transporteurs, zones, tarifs et suivi des expéditions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expéditions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippingStats?.totalShipments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Expéditions ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Livraison</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippingStats?.deliveryRate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {shippingStats?.deliveredShipments || 0} livrées / {shippingStats?.totalShipments || 0} expédiées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(shippingStats?.avgShippingCost || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Coût moyen par expédition
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Délai Moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippingStats?.avgDeliveryTime || 0}j</div>
            <p className="text-xs text-muted-foreground">
              Délai moyen de livraison
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="carriers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="carriers" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Transporteurs
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Zones de Livraison
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Suivi Expéditions
          </TabsTrigger>
        </TabsList>

        {/* Carriers Tab */}
        <TabsContent value="carriers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Transporteurs</CardTitle>
                <Dialog open={showCarrierDialog} onOpenChange={setShowCarrierDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingCarrier(null)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouveau Transporteur
                    </Button>
                  </DialogTrigger>
                  <CarrierDialog 
                    carrier={editingCarrier}
                    onSubmit={(data) => carrierMutation.mutate(data)}
                    isLoading={carrierMutation.isPending}
                  />
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher transporteur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher
                </Button>
              </div>

              <div className="border rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Transporteur</th>
                        <th className="text-left p-4 font-medium">Code</th>
                        <th className="text-left p-4 font-medium">Contact</th>
                        <th className="text-left p-4 font-medium">Statut</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCarriers?.map((carrier) => (
                        <tr key={carrier.id} className="border-t">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Truck className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{carrier.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Créé le {formatDate(carrier.created_at)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="font-mono">
                              {carrier.code}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {carrier.contact_info && typeof carrier.contact_info === 'object' ? (
                                <>
                                  <p>{(carrier.contact_info as any).phone || 'N/A'}</p>
                                  <p className="text-muted-foreground">{(carrier.contact_info as any).email || 'N/A'}</p>
                                </>
                              ) : (
                                <p className="text-muted-foreground">Aucun contact</p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(carrier.is_active)}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingCarrier(carrier);
                                  setShowCarrierDialog(true);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zones Tab */}
        <TabsContent value="zones" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Zones de Livraison</CardTitle>
                <Dialog open={showZoneDialog} onOpenChange={setShowZoneDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingZone(null)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvelle Zone
                    </Button>
                  </DialogTrigger>
                  <ZoneDialog 
                    zone={editingZone}
                    carriers={carriers || []}
                    onSubmit={(data) => zoneMutation.mutate(data)}
                    isLoading={zoneMutation.isPending}
                  />
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher zone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Transporteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les transporteurs</SelectItem>
                    {carriers?.map((carrier) => (
                      <SelectItem key={carrier.id} value={carrier.id}>
                        {carrier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Zone</th>
                        <th className="text-left p-4 font-medium">Transporteur</th>
                        <th className="text-left p-4 font-medium">Coût de Base</th>
                        <th className="text-left p-4 font-medium">Délai</th>
                        <th className="text-left p-4 font-medium">Statut</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredZones?.map((zone) => (
                        <tr key={zone.id} className="border-t">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{zone.zone_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {Array.isArray(zone.cities) ? `${zone.cities.length} villes` : 'Aucune ville'}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <span>{zone.carriers?.name || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{formatPrice(zone.base_cost)}</p>
                              {zone.per_kg_cost > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  +{formatPrice(zone.per_kg_cost)}/kg
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>
                                {zone.delivery_time_min && zone.delivery_time_max 
                                  ? `${zone.delivery_time_min}-${zone.delivery_time_max}j`
                                  : 'N/A'
                                }
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(zone.is_active)}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingZone(zone);
                                  setShowZoneDialog(true);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <TrackingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Carrier Dialog Component
function CarrierDialog({ carrier, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    name: carrier?.name || '',
    code: carrier?.code || '',
    is_active: carrier?.is_active ?? true,
    contact_info: {
      phone: carrier?.contact_info?.phone || '',
      email: carrier?.contact_info?.email || '',
      address: carrier?.contact_info?.address || ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {carrier ? 'Modifier le Transporteur' : 'Nouveau Transporteur'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nom du Transporteur *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="Ex: DHL, FEDEX"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.contact_info.phone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                contact_info: { ...prev.contact_info, phone: e.target.value }
              }))}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.contact_info.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                contact_info: { ...prev.contact_info, email: e.target.value }
              }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Adresse</Label>
          <Textarea
            id="address"
            value={formData.contact_info.address}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              contact_info: { ...prev.contact_info, address: e.target.value }
            }))}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
          />
          <Label htmlFor="is_active">Transporteur actif</Label>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// Zone Dialog Component
function ZoneDialog({ zone, carriers, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    zone_name: zone?.zone_name || '',
    carrier_id: zone?.carrier_id || '',
    base_cost: zone?.base_cost || 0,
    per_kg_cost: zone?.per_kg_cost || 0,
    delivery_time_min: zone?.delivery_time_min || 1,
    delivery_time_max: zone?.delivery_time_max || 3,
    cities: Array.isArray(zone?.cities) ? zone.cities.join(', ') : '',
    is_active: zone?.is_active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      cities: formData.cities.split(',').map(city => city.trim()).filter(city => city)
    };
    onSubmit(submitData);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {zone ? 'Modifier la Zone' : 'Nouvelle Zone de Livraison'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="zone_name">Nom de la Zone *</Label>
            <Input
              id="zone_name"
              value={formData.zone_name}
              onChange={(e) => setFormData(prev => ({ ...prev, zone_name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="carrier_id">Transporteur *</Label>
            <Select 
              value={formData.carrier_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, carrier_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un transporteur" />
              </SelectTrigger>
              <SelectContent>
                {carriers.map((carrier: any) => (
                  <SelectItem key={carrier.id} value={carrier.id}>
                    {carrier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="base_cost">Coût de Base (MAD) *</Label>
            <Input
              id="base_cost"
              type="number"
              step="0.01"
              value={formData.base_cost}
              onChange={(e) => setFormData(prev => ({ ...prev, base_cost: parseFloat(e.target.value) || 0 }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="per_kg_cost">Coût par Kg (MAD)</Label>
            <Input
              id="per_kg_cost"
              type="number"
              step="0.01"
              value={formData.per_kg_cost}
              onChange={(e) => setFormData(prev => ({ ...prev, per_kg_cost: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="delivery_time_min">Délai Min (jours)</Label>
            <Input
              id="delivery_time_min"
              type="number"
              value={formData.delivery_time_min}
              onChange={(e) => setFormData(prev => ({ ...prev, delivery_time_min: parseInt(e.target.value) || 1 }))}
            />
          </div>
          <div>
            <Label htmlFor="delivery_time_max">Délai Max (jours)</Label>
            <Input
              id="delivery_time_max"
              type="number"
              value={formData.delivery_time_max}
              onChange={(e) => setFormData(prev => ({ ...prev, delivery_time_max: parseInt(e.target.value) || 3 }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="cities">Villes (séparées par des virgules)</Label>
          <Textarea
            id="cities"
            value={formData.cities}
            onChange={(e) => setFormData(prev => ({ ...prev, cities: e.target.value }))}
            placeholder="Casablanca, Rabat, Marrakech..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
          />
          <Label htmlFor="is_active">Zone active</Label>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// Tracking Tab Component
function TrackingTab() {
  const { data: recentShipments } = useQuery({
    queryKey: ['recent-shipments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .not('shipped_at', 'is', null)
        .order('shipped_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    }
  });

  const getShippingStatusBadge = (status: string) => {
    const statusMap = {
      'expediee': { label: 'En Transit', variant: 'default' as const, icon: Timer },
      'livree': { label: 'Livrée', variant: 'default' as const, icon: CheckCircle },
      'retournee': { label: 'Retournée', variant: 'destructive' as const, icon: XCircle },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: Package 
    };
    
    const IconComponent = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suivi des Expéditions Récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Commande</th>
                  <th className="text-left p-4 font-medium">Client</th>
                  <th className="text-left p-4 font-medium">Destination</th>
                  <th className="text-left p-4 font-medium">Expédié le</th>
                  <th className="text-left p-4 font-medium">Statut</th>
                  <th className="text-left p-4 font-medium">Transporteur</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentShipments?.map((shipment) => (
                  <tr key={shipment.id} className="border-t">
                    <td className="p-4">
                      <div>
                        <p className="font-medium font-mono text-sm">{shipment.code_suivi}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(shipment.order_total)}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{shipment.client_nom}</p>
                        <p className="text-sm text-muted-foreground">{shipment.client_phone}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{shipment.client_ville}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">
                        {formatDate(shipment.shipped_at)}
                      </span>
                    </td>
                    <td className="p-4">
                      {getShippingStatusBadge(shipment.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span>{shipment.courier || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Détails
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}