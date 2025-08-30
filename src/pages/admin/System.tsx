import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings, 
  Database, 
  Beaker, 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw,
  Shield,
  Bell,
  Globe,
  Palette,
  Key,
  BarChart3,
  TestTube,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// System Settings Component
function SystemSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: 'E-Commerce Admin',
    siteDescription: 'Plateforme de gestion e-commerce',
    timezone: 'Africa/Casablanca',
    currency: 'MAD',
    language: 'fr',
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    maintenanceMode: false,
    debugMode: false,
    twoFactorAuth: false
  });

  const handleSaveSettings = () => {
    // Here you would typically save to backend
    toast({
      title: 'Paramètres sauvegardés',
      description: 'Les paramètres système ont été mis à jour',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Paramètres Généraux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Nom du Site</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="currency">Devise</Label>
              <Select value={settings.currency} onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAD">MAD - Dirham Marocain</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - Dollar US</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Fuseau Horaire</Label>
              <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Casablanca">Casablanca (GMT+1)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                  <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="language">Langue</Label>
              <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="siteDescription">Description du Site</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notifications Email</Label>
              <p className="text-sm text-muted-foreground">Recevoir les notifications par email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Notifications SMS</Label>
              <p className="text-sm text-muted-foreground">Recevoir les notifications par SMS</p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsNotifications: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité & Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Authentification à Deux Facteurs</Label>
              <p className="text-sm text-muted-foreground">Sécuriser l'accès admin avec 2FA</p>
            </div>
            <Switch
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Sauvegarde Automatique</Label>
              <p className="text-sm text-muted-foreground">Sauvegarde quotidienne automatique</p>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoBackup: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Mode Maintenance</Label>
              <p className="text-sm text-muted-foreground">Désactiver l'accès public temporairement</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Mode Débogage</Label>
              <p className="text-sm text-muted-foreground">Afficher les logs détaillés</p>
            </div>
            <Switch
              checked={settings.debugMode}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, debugMode: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Sauvegarder les Paramètres
        </Button>
      </div>
    </div>
  );
}

// Data Management Component
function DataManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [exportProgress, setExportProgress] = useState<Record<string, number>>({});
  const [isExporting, setIsExporting] = useState<Record<string, boolean>>({});

  const handleBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          toast({
            title: 'Sauvegarde terminée',
            description: 'Toutes les données ont été sauvegardées avec succès',
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast({
        title: 'Aucune donnée',
        description: 'Aucune donnée à exporter',
        variant: 'destructive'
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportData = async (type: string) => {
    setIsExporting(prev => ({ ...prev, [type]: true }));
    setExportProgress(prev => ({ ...prev, [type]: 0 }));

    try {
      let data: any[] = [];
      let filename = type;

      const progressInterval = setInterval(() => {
        setExportProgress(prev => ({
          ...prev,
          [type]: Math.min((prev[type] || 0) + 20, 90)
        }));
      }, 200);

      switch (type) {
        case 'commandes':
          const { data: orders } = await supabase
            .from('orders')
            .select(`*, order_items (*)`)
            .order('created_at', { ascending: false });
          
          data = orders?.map(order => ({
            code_suivi: order.code_suivi,
            client_nom: order.client_nom,
            client_phone: order.client_phone,
            client_ville: order.client_ville,
            statut: order.status,
            order_total: order.order_total,
            created_at: order.created_at,
            nb_articles: order.order_items?.length || 0
          })) || [];
          break;

        case 'clients':
          const { data: customers } = await supabase
            .from('customer_profiles')
            .select('*')
            .order('created_at', { ascending: false });
          
          data = customers?.map(customer => ({
            nom_complet: customer.full_name,
            telephone: customer.phone,
            email: customer.email,
            ville: customer.city,
            vip: customer.is_vip ? 'Oui' : 'Non',
            date_creation: customer.created_at
          })) || [];
          break;

        case 'produits':
          const { data: products } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
          
          data = products?.map(product => ({
            nom: product.nom,
            prix: product.prix,
            en_stock: product.en_stock ? 'Oui' : 'Non',
            date_creation: product.created_at
          })) || [];
          break;

        case 'inventaire':
          const { data: inventory } = await supabase
            .from('inventory')
            .select(`*, product_variants(name, sku, products(nom))`)
            .order('updated_at', { ascending: false });
          
          data = inventory?.map(item => ({
            produit: item.product_variants?.products?.nom || 'N/A',
            variante: item.product_variants?.name || 'N/A',
            stock_disponible: item.stock_on_hand,
            niveau_min: item.min_stock_level
          })) || [];
          break;

        case 'analytics':
          const today = new Date();
          const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          
          const { data: analyticsData } = await supabase
            .rpc('rpc_analytics_overview', {
              from_ts: thirtyDaysAgo.toISOString(),
              to_ts: today.toISOString()
            });
          
          data = analyticsData ? [analyticsData] : [];
          break;

        case 'finances':
          const { data: transactions } = await supabase
            .from('financial_transactions')
            .select('*')
            .order('created_at', { ascending: false });
          
          data = transactions?.map(transaction => ({
            reference: transaction.reference_number,
            type: transaction.transaction_type,
            montant: transaction.amount,
            statut: transaction.status,
            date_creation: transaction.created_at
          })) || [];
          break;

        default:
          throw new Error('Type d\'export non supporté');
      }

      clearInterval(progressInterval);
      setExportProgress(prev => ({ ...prev, [type]: 100 }));

      setTimeout(() => {
        downloadCSV(data, filename);
        toast({
          title: 'Export terminé',
          description: `${data.length} enregistrements exportés avec succès`,
        });
        setIsExporting(prev => ({ ...prev, [type]: false }));
        setExportProgress(prev => ({ ...prev, [type]: 0 }));
      }, 500);

    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast({
        title: 'Erreur d\'export',
        description: 'Une erreur est survenue lors de l\'export des données',
        variant: 'destructive'
      });
      setIsExporting(prev => ({ ...prev, [type]: false }));
      setExportProgress(prev => ({ ...prev, [type]: 0 }));
    }
  };

  const handlePurgeOldData = async () => {
    try {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const { error } = await supabase
        .from('orders')
        .delete()
        .lt('created_at', twoYearsAgo.toISOString());

      if (error) throw error;

      toast({
        title: 'Purge terminée',
        description: 'Les données anciennes ont été supprimées',
      });
    } catch (error) {
      toast({
        title: 'Erreur de purge',
        description: 'Une erreur est survenue lors de la purge',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sauvegarde & Restauration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleBackup} 
              disabled={isBackingUp}
              className="flex items-center gap-2"
            >
              {isBackingUp ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isBackingUp ? 'Sauvegarde...' : 'Créer une Sauvegarde'}
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Restaurer
            </Button>
          </div>
          
          {isBackingUp && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression de la sauvegarde</span>
                <span>{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} />
            </div>
          )}

          <Alert>
            <AlertDescription>
              Dernière sauvegarde: 15 janvier 2025 à 14:30
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Export de Données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'commandes', label: 'Commandes', description: 'Toutes les commandes avec détails' },
              { key: 'clients', label: 'Clients', description: 'Profils clients et informations CRM' },
              { key: 'produits', label: 'Produits', description: 'Catalogue produits complet' },
              { key: 'inventaire', label: 'Inventaire', description: 'Stock et mouvements' },
              { key: 'analytics', label: 'Analytics', description: 'Données de performance' },
              { key: 'finances', label: 'Finances', description: 'Transactions financières' }
            ].map(({ key, label, description }) => (
              <div key={key} className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleExportData(key)}
                  disabled={isExporting[key]}
                  className="h-20 w-full flex-col gap-2"
                >
                  {isExporting[key] ? (
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  ) : (
                    <Download className="h-6 w-6" />
                  )}
                  <span className="font-medium">{label}</span>
                </Button>
                <p className="text-xs text-muted-foreground text-center">{description}</p>
                {isExporting[key] && (
                  <div className="space-y-1">
                    <Progress value={exportProgress[key] || 0} className="h-2" />
                    <p className="text-xs text-center">{exportProgress[key] || 0}%</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Zone de Danger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Les actions suivantes sont irréversibles. Assurez-vous d'avoir une sauvegarde récente.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <PurgeDataDialog onConfirm={handlePurgeOldData} />
            <Button variant="outline" className="flex items-center gap-2 border-orange-500 text-orange-600 hover:bg-orange-50">
              <RotateCcw className="h-4 w-4" />
              Purger les Logs
            </Button>
            <Button variant="outline" className="flex items-center gap-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50">
              <BarChart3 className="h-4 w-4" />
              Réinitialiser Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Purge Data Dialog Component
function PurgeDataDialog({ onConfirm }: { onConfirm: () => void }) {
  const [confirmText, setConfirmText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    if (confirmText === 'PURGER') {
      onConfirm();
      setIsOpen(false);
      setConfirmText('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Purger les Données Anciennes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la Purge des Données</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              Cette action supprimera définitivement les commandes de plus de 2 ans.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="confirm">
              Tapez "PURGER" pour confirmer:
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="PURGER"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirm}
              disabled={confirmText !== 'PURGER'}
            >
              Confirmer la Purge
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Experiments Component  
function Experiments() {
  const { toast } = useToast();
  const [experiments] = useState([
    {
      id: 1,
      name: 'Nouveau Checkout',
      description: 'Tester un processus de commande simplifié',
      status: 'active',
      traffic: 25,
      conversions: { control: 2.3, variant: 2.8 },
      startDate: '2025-01-10'
    },
    {
      id: 2,
      name: 'Recommandations IA',
      description: 'Système de recommandations basé sur IA',
      status: 'draft',
      traffic: 0,
      conversions: { control: 0, variant: 0 },
      startDate: null
    }
  ]);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { label: 'Actif', variant: 'default' as const },
      draft: { label: 'Brouillon', variant: 'secondary' as const },
      completed: { label: 'Terminé', variant: 'outline' as const }
    };
    
    const { label, variant } = variants[status as keyof typeof variants] || variants.draft;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleExperimentAction = (id: number, action: string) => {
    toast({
      title: 'Action effectuée',
      description: `Expérimentation ${action}e`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Expérimentations A/B</h3>
          <p className="text-sm text-muted-foreground">Testez et optimisez votre e-commerce</p>
        </div>
        <Button className="flex items-center gap-2">
          <TestTube className="h-4 w-4" />
          Nouvelle Expérimentation
        </Button>
      </div>

      <div className="grid gap-6">
        {experiments.map((experiment) => (
          <Card key={experiment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {experiment.name}
                    {getStatusBadge(experiment.status)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {experiment.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExperimentAction(experiment.id, 'modifié')}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Actions
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Trafic</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Répartition du trafic</span>
                      <span>{experiment.traffic}%</span>
                    </div>
                    <Progress value={experiment.traffic} />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Conversions</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Contrôle:</span>
                      <span className="font-mono">{experiment.conversions.control}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Variante:</span>
                      <span className="font-mono">{experiment.conversions.variant}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Informations</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Démarré:</span>
                      <span className="ml-2">{experiment.startDate || 'Non démarré'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function SystemPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Système</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres, données et expérimentations de votre plateforme
        </p>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Paramètres
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Données
          </TabsTrigger>
          <TabsTrigger value="experiments" className="flex items-center gap-2">
            <Beaker className="h-4 w-4" />
            Expérimentations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>

        <TabsContent value="data">
          <DataManagement />
        </TabsContent>

        <TabsContent value="experiments">
          <Experiments />
        </TabsContent>
      </Tabs>
    </div>
  );
}