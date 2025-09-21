import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings, 
  Save, 
  Eye, 
  EyeOff, 
  Palette, 
  Layout, 
  Wand2,
  Plus,
  X,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BundleCustomization {
  id: string;
  bundle_id: string;
  layout_type: 'stacked' | 'grid' | 'carousel';
  theme: 'default' | 'minimal' | 'luxury' | 'modern';
  animations_enabled: boolean;
  shadows_enabled: boolean;
  gradients_enabled: boolean;
  spacing: number;
  border_radius: number;
  visible_sections: {
    gallery: boolean;
    pricing: boolean;
    variants: boolean;
    description: boolean;
    benefits: boolean;
    reviews: boolean;
    related: boolean;
  };
  custom_css?: string;
  custom_hero_text?: string;
  custom_benefits?: Array<{ icon: string; text: string }>;
  bundle_name?: string;
}

export default function BundleCustomizations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBundle, setSelectedBundle] = useState<string>('');
  const [customBenefit, setCustomBenefit] = useState({ icon: '', text: '' });

  // Fetch bundles with customizations
  const { data: bundlesWithCustomizations = [], isLoading } = useQuery({
    queryKey: ['bundle-customizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bundle_offers')
        .select(`
          id,
          name,
          is_active,
          bundle_customizations (
            id,
            layout_type,
            theme,
            animations_enabled,
            shadows_enabled,
            gradients_enabled,
            spacing,
            border_radius,
            visible_sections,
            custom_css,
            custom_hero_text,
            custom_benefits
          )
        `)
        .order('name');
      
      if (error) throw error;
      
      return data.map(bundle => {
        const customization = bundle.bundle_customizations?.[0];
        if (!customization) {
          // Return a default customization object if none exists
          return {
            bundle_id: bundle.id,
            bundle_name: bundle.name,
            is_active: bundle.is_active,
            layout_type: 'stacked' as const,
            theme: 'default' as const,
            animations_enabled: true,
            shadows_enabled: true,
            gradients_enabled: true,
            spacing: 6,
            border_radius: 12,
            visible_sections: {
              gallery: true,
              pricing: true,
              variants: true,
              description: true,
              benefits: true,
              reviews: false,
              related: false
            },
            custom_css: null,
            custom_hero_text: null,
            custom_benefits: []
          };
        }
        
        return {
          ...customization,
          bundle_id: bundle.id,
          bundle_name: bundle.name,
          is_active: bundle.is_active
        };
      }).filter(Boolean);
    }
  });

  // Update customization mutation
  const updateCustomization = useMutation({
    mutationFn: async (customization: Partial<BundleCustomization>) => {
      console.log('Updating customization:', customization);
      
      const updateData = {
        bundle_id: customization.bundle_id,
        layout_type: customization.layout_type,
        theme: customization.theme,
        animations_enabled: customization.animations_enabled,
        shadows_enabled: customization.shadows_enabled,
        gradients_enabled: customization.gradients_enabled,
        spacing: customization.spacing,
        border_radius: customization.border_radius,
        visible_sections: customization.visible_sections,
        custom_css: customization.custom_css,
        custom_hero_text: customization.custom_hero_text,
        custom_benefits: customization.custom_benefits
      };

      let data, error;
      
      if (customization.id) {
        // Update existing customization
        const result = await supabase
          .from('bundle_customizations')
          .update(updateData)
          .eq('id', customization.id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Insert new customization
        const result = await supabase
          .from('bundle_customizations')
          .insert(updateData)
          .select()
          .single();
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundle-customizations'] });
      toast({
        title: "Personnalisation sauvegardée",
        description: "Les paramètres de personnalisation ont été mis à jour avec succès."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive"
      });
    }
  });

  const currentCustomization = bundlesWithCustomizations.find(c => c.bundle_id === selectedBundle);

  const handleSectionToggle = (section: string, value: boolean) => {
    if (!currentCustomization) return;
    
    const updatedSections = {
      ...currentCustomization.visible_sections,
      [section]: value
    };
    
    updateCustomization.mutate({
      ...currentCustomization,
      visible_sections: updatedSections
    });
  };

  const handleStyleUpdate = (field: string, value: any) => {
    if (!currentCustomization) return;
    
    updateCustomization.mutate({
      ...currentCustomization,
      [field]: value
    });
  };

  const addCustomBenefit = () => {
    if (!currentCustomization || !customBenefit.text.trim()) return;
    
    const benefits = currentCustomization.custom_benefits || [];
    const newBenefits = [...benefits, customBenefit];
    
    updateCustomization.mutate({
      ...currentCustomization,
      custom_benefits: newBenefits
    });
    
    setCustomBenefit({ icon: '', text: '' });
  };

  const removeCustomBenefit = (index: number) => {
    if (!currentCustomization) return;
    
    const benefits = currentCustomization.custom_benefits || [];
    const newBenefits = benefits.filter((_, i) => i !== index);
    
    updateCustomization.mutate({
      ...currentCustomization,
      custom_benefits: newBenefits
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Personnalisation des Packs</h1>
          <p className="text-muted-foreground mt-2">
            Gérez l'apparence et le contenu des pages de détail de vos packs
          </p>
        </div>
        
        {selectedBundle && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/bundle/${selectedBundle}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Voir la page
          </Button>
        )}
      </div>

      {/* Bundle Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sélectionner un Pack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedBundle} onValueChange={setSelectedBundle}>
            <SelectTrigger>
              <SelectValue placeholder="Choisissez un pack à personnaliser" />
            </SelectTrigger>
            <SelectContent>
              {bundlesWithCustomizations.map((bundle) => (
                <SelectItem key={bundle.bundle_id} value={bundle.bundle_id}>
                  <div className="flex items-center gap-2">
                    {bundle.bundle_name}
                    <Badge variant={bundle.is_active ? "default" : "secondary"}>
                      {bundle.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Customization Interface */}
      {currentCustomization && (
        <Tabs defaultValue="layout" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Mise en page
            </TabsTrigger>
            <TabsTrigger value="style" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Style
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Sections
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Contenu
            </TabsTrigger>
          </TabsList>

          {/* Layout Tab */}
          <TabsContent value="layout">
            <Card>
              <CardHeader>
                <CardTitle>Configuration de la mise en page</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Type de galerie</Label>
                  <Select 
                    value={currentCustomization.layout_type} 
                    onValueChange={(value) => handleStyleUpdate('layout_type', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stacked">Empilé (Vertical)</SelectItem>
                      <SelectItem value="grid">Grille (2 colonnes)</SelectItem>
                      <SelectItem value="carousel">Carrousel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Espacement ({currentCustomization.spacing}px)</Label>
                  <Slider
                    value={[currentCustomization.spacing]}
                    onValueChange={([value]) => handleStyleUpdate('spacing', value)}
                    max={24}
                    min={2}
                    step={2}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Bordures arrondies ({currentCustomization.border_radius}px)</Label>
                  <Slider
                    value={[currentCustomization.border_radius]}
                    onValueChange={([value]) => handleStyleUpdate('border_radius', value)}
                    max={24}
                    min={0}
                    step={4}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style">
            <Card>
              <CardHeader>
                <CardTitle>Configuration du style</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Thème</Label>
                  <Select 
                    value={currentCustomization.theme} 
                    onValueChange={(value) => handleStyleUpdate('theme', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Par défaut</SelectItem>
                      <SelectItem value="minimal">Minimaliste</SelectItem>
                      <SelectItem value="luxury">Luxe</SelectItem>
                      <SelectItem value="modern">Moderne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Animations</Label>
                    <Switch 
                      checked={currentCustomization.animations_enabled} 
                      onCheckedChange={(checked) => handleStyleUpdate('animations_enabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Ombres</Label>
                    <Switch 
                      checked={currentCustomization.shadows_enabled} 
                      onCheckedChange={(checked) => handleStyleUpdate('shadows_enabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Dégradés</Label>
                    <Switch 
                      checked={currentCustomization.gradients_enabled} 
                      onCheckedChange={(checked) => handleStyleUpdate('gradients_enabled', checked)}
                    />
                  </div>
                </div>

                <div>
                  <Label>CSS personnalisé</Label>
                  <Textarea
                    placeholder="Ajoutez du CSS personnalisé..."
                    value={currentCustomization.custom_css || ''}
                    onChange={(e) => handleStyleUpdate('custom_css', e.target.value)}
                    className="mt-2 h-32"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections">
            <Card>
              <CardHeader>
                <CardTitle>Visibilité des sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(currentCustomization.visible_sections || {}).map(([section, visible]) => (
                  <div key={section} className="flex items-center justify-between">
                    <Label className="capitalize">
                      {section === 'gallery' ? 'Galerie' :
                       section === 'pricing' ? 'Prix' :
                       section === 'variants' ? 'Variantes' :
                       section === 'description' ? 'Description' :
                       section === 'benefits' ? 'Avantages' :
                       section === 'reviews' ? 'Avis' :
                       section === 'related' ? 'Produits liés' : section}
                    </Label>
                    <Switch 
                      checked={Boolean(visible)} 
                      onCheckedChange={(checked) => handleSectionToggle(section, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Texte héro personnalisé</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Texte d'accroche personnalisé pour ce pack..."
                    value={currentCustomization.custom_hero_text || ''}
                    onChange={(e) => handleStyleUpdate('custom_hero_text', e.target.value)}
                    className="h-24"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avantages personnalisés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add new benefit */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      placeholder="Icône (emoji)"
                      value={customBenefit.icon}
                      onChange={(e) => setCustomBenefit(prev => ({ ...prev, icon: e.target.value }))}
                    />
                    <Input
                      placeholder="Texte de l'avantage"
                      value={customBenefit.text}
                      onChange={(e) => setCustomBenefit(prev => ({ ...prev, text: e.target.value }))}
                    />
                    <Button onClick={addCustomBenefit} disabled={!customBenefit.text.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>

                  {/* Existing benefits */}
                  <div className="space-y-2">
                    {(currentCustomization.custom_benefits || []).map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <span className="text-xl">{benefit.icon}</span>
                        <span className="flex-1">{benefit.text}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeCustomBenefit(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
