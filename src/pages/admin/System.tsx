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
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    // Simulate backup progress
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

  const handleExportData = (type: string) => {
    toast({
      title: 'Export en cours',
      description: `Export des ${type} démarré`,
    });
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
            <Button 
              variant="outline" 
              onClick={() => handleExportData('commandes')}
              className="h-20 flex-col gap-2"
            >
              <Download className="h-6 w-6" />
              <span>Commandes</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportData('clients')}
              className="h-20 flex-col gap-2"
            >
              <Download className="h-6 w-6" />
              <span>Clients</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportData('produits')}
              className="h-20 flex-col gap-2"
            >
              <Download className="h-6 w-6" />
              <span>Produits</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportData('inventaire')}
              className="h-20 flex-col gap-2"
            >
              <Download className="h-6 w-6" />
              <span>Inventaire</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportData('analytics')}
              className="h-20 flex-col gap-2"
            >
              <Download className="h-6 w-6" />
              <span>Analytics</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportData('finances')}
              className="h-20 flex-col gap-2"
            >
              <Download className="h-6 w-6" />
              <span>Finances</span>
            </Button>
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
          
          <div className="space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Purger les Données Anciennes
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmer la Purge</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Cette action supprimera définitivement:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Commandes de plus de 2 ans</li>
                    <li>Logs de plus de 6 mois</li>
                    <li>Sessions expirées</li>
                  </ul>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline">Annuler</Button>
                    <Button variant="destructive">Confirmer la Purge</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
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
    },
    {
      id: 3,
      name: 'Design Mobile',
      description: 'Interface mobile optimisée',
      status: 'completed',
      traffic: 50,
      conversions: { control: 1.8, variant: 2.1 },
      startDate: '2024-12-15'
    }
  ]);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { label: 'Actif', variant: 'default' as const },
      draft: { label: 'Brouillon', variant: 'secondary' as const },
      completed: { label: 'Terminé', variant: 'outline' as const },
      paused: { label: 'Pausé', variant: 'destructive' as const }
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
                  {experiment.status === 'active' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleExperimentAction(experiment.id, 'pausé')}
                    >
                      <Pause className="h-3 w-3 mr-1" />
                      Pause
                    </Button>
                  )}
                  {experiment.status === 'draft' && (
                    <Button 
                      size="sm"
                      onClick={() => handleExperimentAction(experiment.id, 'démarré')}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Démarrer
                    </Button>
                  )}
                  {experiment.status === 'paused' && (
                    <Button 
                      size="sm"
                      onClick={() => handleExperimentAction(experiment.id, 'repris')}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Reprendre
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExperimentAction(experiment.id, 'réinitialisé')}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
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
                    {experiment.conversions.variant > experiment.conversions.control && (
                      <div className="text-xs text-green-600 font-medium">
                        +{((experiment.conversions.variant / experiment.conversions.control - 1) * 100).toFixed(1)}% d'amélioration
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Informations</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Démarré:</span>
                      <span className="ml-2">{experiment.startDate || 'Non démarré'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Durée:</span>
                      <span className="ml-2">
                        {experiment.startDate ? '15 jours' : 'N/A'}
                      </span>
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