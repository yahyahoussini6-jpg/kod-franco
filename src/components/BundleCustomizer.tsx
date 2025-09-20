import React, { useState } from 'react';
import { Settings, Palette, Layout, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface BundleCustomizerProps {
  onLayoutChange: (layout: 'stacked' | 'grid' | 'carousel') => void;
  onStyleChange: (styles: any) => void;
  onSectionToggle: (section: string, visible: boolean) => void;
}

export function BundleCustomizer({ onLayoutChange, onStyleChange, onSectionToggle }: BundleCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'layout' | 'style' | 'sections'>('layout');
  
  // Layout settings
  const [layout, setLayout] = useState<'stacked' | 'grid' | 'carousel'>('stacked');
  const [spacing, setSpacing] = useState([6]);
  const [borderRadius, setBorderRadius] = useState([12]);
  
  // Style settings
  const [theme, setTheme] = useState('default');
  const [animations, setAnimations] = useState(true);
  const [shadows, setShadows] = useState(true);
  const [gradients, setGradients] = useState(true);
  
  // Section visibility
  const [sections, setSections] = useState({
    gallery: true,
    pricing: true,
    variants: true,
    description: true,
    benefits: true,
    reviews: false,
    related: false
  });

  const handleLayoutChange = (newLayout: 'stacked' | 'grid' | 'carousel') => {
    setLayout(newLayout);
    onLayoutChange(newLayout);
  };

  const handleStyleChange = () => {
    const styles = {
      theme,
      animations,
      shadows,
      gradients,
      spacing: spacing[0],
      borderRadius: borderRadius[0]
    };
    onStyleChange(styles);
  };

  const handleSectionToggle = (section: string, visible: boolean) => {
    setSections(prev => ({ ...prev, [section]: visible }));
    onSectionToggle(section, visible);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Card className="w-80 mt-2 bg-background/95 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Personnaliser la page</CardTitle>
              
              {/* Tab Navigation */}
              <div className="flex gap-1 bg-muted p-1 rounded-lg">
                <Button
                  variant={activeTab === 'layout' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1 h-8"
                  onClick={() => setActiveTab('layout')}
                >
                  <Layout className="h-4 w-4 mr-1" />
                  Mise en page
                </Button>
                <Button
                  variant={activeTab === 'style' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1 h-8"
                  onClick={() => setActiveTab('style')}
                >
                  <Palette className="h-4 w-4 mr-1" />
                  Style
                </Button>
                <Button
                  variant={activeTab === 'sections' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1 h-8"
                  onClick={() => setActiveTab('sections')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Sections
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Layout Tab */}
              {activeTab === 'layout' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Disposition de la galerie</Label>
                    <Select value={layout} onValueChange={handleLayoutChange}>
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
                    <Label className="text-sm font-medium">Espacement ({spacing[0]}px)</Label>
                    <Slider
                      value={spacing}
                      onValueChange={setSpacing}
                      max={24}
                      min={2}
                      step={2}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Bordures arrondies ({borderRadius[0]}px)</Label>
                    <Slider
                      value={borderRadius}
                      onValueChange={setBorderRadius}
                      max={24}
                      min={0}
                      step={4}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {/* Style Tab */}
              {activeTab === 'style' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Thème</Label>
                    <Select value={theme} onValueChange={setTheme}>
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
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Animations</Label>
                    <Switch 
                      checked={animations} 
                      onCheckedChange={setAnimations}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Ombres</Label>
                    <Switch 
                      checked={shadows} 
                      onCheckedChange={setShadows}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Dégradés</Label>
                    <Switch 
                      checked={gradients} 
                      onCheckedChange={setGradients}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleStyleChange}
                    className="w-full mt-4"
                    size="sm"
                  >
                    Appliquer les styles
                  </Button>
                </div>
              )}

              {/* Sections Tab */}
              {activeTab === 'sections' && (
                <div className="space-y-3">
                  {Object.entries(sections).map(([key, visible]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-sm font-medium capitalize">
                        {key === 'gallery' ? 'Galerie' :
                         key === 'pricing' ? 'Prix' :
                         key === 'variants' ? 'Variantes' :
                         key === 'description' ? 'Description' :
                         key === 'benefits' ? 'Avantages' :
                         key === 'reviews' ? 'Avis' :
                         key === 'related' ? 'Produits liés' : key}
                      </Label>
                      <Switch 
                        checked={visible} 
                        onCheckedChange={(checked) => handleSectionToggle(key, checked)}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}